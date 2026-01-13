# Hazmat Placard Compliance App — Technical Handover Documentation

**Prepared for:** Clean Harbors Environmental Services - Technology Team  
**Version:** 1.0  
**Last Updated:** January 2026

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [Regulatory Logic (CFR 49)](#regulatory-logic-cfr-49)
4. [Project Structure](#project-structure)
5. [Setup & Deployment](#setup--deployment)
6. [Testing & Validation](#testing--validation)
7. [Mobile Optimization](#mobile-optimization)
8. [Maintenance Notes](#maintenance-notes)
9. [Handover Checklist](#handover-checklist)

---

## Executive Summary

### Purpose
The Hazmat Placard Compliance App is a mobile-first tool designed for CDL hazmat drivers to ensure DOT placard compliance per CFR 49 regulations. It automatically calculates required placards based on:
- Hazardous materials being transported
- Container sizes (bulk vs. non-bulk threshold at 95 gallons)
- Aggregate weights across all Table 2 materials
- Per-stop loading facility weights for the 2,205 lb threshold
- Table 1 vs. Table 2 classification rules

### Business Value
- **Reduces compliance violations** by providing real-time placard calculations
- **Simplifies DOT regulations** into user-friendly language for non-technical drivers
- **Works offline** as a client-side session-based tool (no database required)

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| UI Components | Shadcn UI + Radix primitives |
| Styling | TailwindCSS |
| Routing | Wouter |
| State Management | React useState (client-side) |
| Backend | Express.js (minimal, serves static assets) |
| Build Tool | Vite |

---

## Technical Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Materials  │  │   Placards  │  │    Reference    │  │
│  │    Tab      │  │     Tab     │  │      Tab        │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────┘  │
│         │                │                               │
│         ▼                ▼                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │           Local State (materials[])                 ││
│  └─────────────────────────────────────────────────────┘│
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │        Placard Calculator (hazmat-data.ts)          ││
│  │        PlacardDisplay.tsx (CFR 49 Logic)            ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Minimal)                    │
│              - Serves static build                       │
│              - No database                               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
1. User enters material data (UN number, class, weight, container type, stop number)
2. Material is added to local state array
3. `calculatePlacardRequirements()` processes all materials
4. Placard display renders required/optional placards with DOT-standard visuals
5. DANGEROUS placard eligibility is calculated based on CFR 49 rules

### Key Files
| File | Purpose |
|------|---------|
| `client/src/pages/home.tsx` | Main app container, tab navigation, state management |
| `client/src/components/MaterialInput.tsx` | Form for adding/editing materials |
| `client/src/components/MaterialList.tsx` | Displays current load with edit/delete |
| `client/src/components/PlacardDisplay.tsx` | **Core logic** - Calculates and displays placard requirements |
| `client/src/components/ReferenceGuide.tsx` | Educational content, testing scenarios |
| `client/src/lib/hazmat-data.ts` | Hazard class definitions, Table 1/2 classification |

---

## Regulatory Logic (CFR 49)

### Table 1 vs. Table 2 Materials

**Table 1 Materials** (Always require placards at ANY quantity):
- Class 1.1, 1.2, 1.3 (Explosives with mass/projection/fire hazard)
- Class 2.3 (Poison Gas)
- Class 4.3 (Dangerous When Wet)
- Class 5.2 Type B (Organic Peroxide)
- Class 6.1 with Packing Group I + Poison Inhalation Hazard (PIH)
- Class 7 with Radioactive Yellow III label

**Table 2 Materials** (All other hazard classes):
- Require placards only when aggregate weight threshold is met

### Placard Calculation Rules (49 CFR 172.504)

#### Rule 1: Table 1 Materials
```
IF material.isTable1 OR material.poisonInhalationHazard:
    PLACARD REQUIRED (any quantity)
```

#### Rule 2: Bulk Container Rule (49 CFR 172.504(f))
```
IF containerSize > 95 gallons:
    PLACARD REQUIRED (regardless of weight)
    UN Number MUST be displayed on placard (per 49 CFR 172.336)
```

#### Rule 3: Table 2 Aggregate Weight (49 CFR 172.504(c))
```
IF SUM(all Table 2 non-bulk materials) >= 1,001 lbs:
    PLACARD REQUIRED for ALL Table 2 classes present
```
**Critical Note:** The 1,001 lb threshold applies to the COMBINED weight of ALL Table 2 materials, not per-class.

#### Rule 4: DANGEROUS Placard Option (49 CFR 172.504(e))
The DANGEROUS placard may substitute for specific placards when ALL conditions are met:
1. All materials are in non-bulk containers (≤95 gallons)
2. No Table 1 materials present
3. Two or more different Table 2 hazard classes
4. No single class exceeds 2,205 lbs at one loading facility (stop)

#### Rule 5: Per-Facility 2,205 lb Threshold (49 CFR 172.504(e))
```
FOR each loading_facility (stop_number):
    FOR each hazard_class:
        IF weight_at_this_stop >= 2,205 lbs:
            SPECIFIC PLACARD REQUIRED (cannot use DANGEROUS for this class)
```

### Code Implementation

The placard calculation logic is in `client/src/components/PlacardDisplay.tsx`:

```typescript
// Key functions:
calculatePlacardRequirements(materials) → PlacardRequirement[]
calculateDangerousPlacardEligibility(requirements, materials) → DangerousPlacardEligibility
```

**PlacardRequirement Object:**
```typescript
interface PlacardRequirement {
  hazardClass: string;      // e.g., "3", "8", "2.3"
  label: string;            // Display label
  required: boolean;        // Whether placard is required
  reason: string;           // Explanation for user
  isTable1: boolean;        // Table 1 classification
  isBulk: boolean;          // Container > 95 gallons
  weight: number;           // Total weight for this class
  unNumber?: string;        // UN number for bulk containers
  isPih?: boolean;          // Poison Inhalation Hazard
}
```

---

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MaterialInput.tsx      # Material entry form
│   │   │   ├── MaterialList.tsx       # Current load display
│   │   │   ├── PlacardDisplay.tsx     # Placard calculator & display
│   │   │   ├── ReferenceGuide.tsx     # Reference & testing scenarios
│   │   │   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   │   │   └── ui/                    # Shadcn UI components
│   │   ├── hooks/
│   │   │   └── use-theme.tsx          # Theme persistence
│   │   ├── lib/
│   │   │   ├── hazmat-data.ts         # Hazard class definitions
│   │   │   ├── queryClient.ts         # React Query config
│   │   │   └── utils.ts               # Utility functions
│   │   ├── pages/
│   │   │   ├── home.tsx               # Main application page
│   │   │   └── not-found.tsx          # 404 page
│   │   ├── App.tsx                    # Root component
│   │   ├── index.css                  # Global styles
│   │   └── main.tsx                   # Entry point
│   └── index.html
├── server/
│   ├── index.ts                       # Express server entry
│   ├── routes.ts                      # API routes (minimal)
│   ├── vite.ts                        # Vite dev server config
│   └── storage.ts                     # Storage interface (not used)
├── shared/
│   └── schema.ts                      # Shared types (not heavily used)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── replit.md                          # Internal documentation
```

---

## Setup & Deployment

### Local Development

**Prerequisites:**
- Node.js 18+ (LTS recommended)
- npm 9+

**Setup Steps:**
```bash
# 1. Clone the repository
git clone <repository-url>
cd hazmat-placard-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Access the app
# Open http://localhost:5000 in your browser
```

### Environment Variables

Currently, the app uses minimal environment configuration:

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | Optional | Used for session management (not critical for MVP) |

### Production Build

```bash
# Build for production
npm run build

# The output will be in the dist/ directory
# Server serves static files from this directory
```

### Deployment Options

**Option 1: Replit (Current)**
- App is currently hosted on Replit
- Use "Transfer to Organization" to move to Clean Harbors team workspace
- Built-in SSL, hosting, and deployment pipeline

**Option 2: Self-Hosted**
```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "hazmat-app" -- start
```

**Option 3: Container Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Testing & Validation

### Built-in Testing Scenarios

The app includes a "Testing Run" section in the Reference tab with these scenarios:

#### Scenario 1: The 1,001 lb Trap
- **Setup:** Add 500 lbs Class 3 + 600 lbs Class 8 (non-bulk)
- **Expected:** BOTH placards required (aggregate = 1,100 lbs > 1,001 threshold)

#### Scenario 2: The Bulk Container Rule
- **Setup:** Add 200 lbs Class 3 in bulk container (>95 gal)
- **Expected:** Class 3 placard required (bulk = any quantity)

#### Scenario 3: The Table 1 Exception
- **Setup:** Add 1 lb Class 4.3 (Dangerous When Wet)
- **Expected:** Class 4.3 placard required (Table 1 = any quantity)

#### Scenario 4: The 2,205 lb Facility Rule
- **Setup:** Add 1,500 lbs Class 3 at Stop 1 + 1,000 lbs Class 8 at Stop 2
- **Expected:** DANGEROUS option available (neither stop exceeds 2,205 lbs individually)

### Manual Verification Steps

```
1. Navigate to Materials tab
2. Add materials per scenario
3. Switch to Placards tab
4. Verify correct placards are shown/not shown
5. Verify DANGEROUS option is correctly enabled/disabled
6. Clear load and test next scenario
```

### Automated Testing

The codebase supports Playwright e2e testing. Key test cases should cover:
- Material CRUD operations
- Placard calculation accuracy
- Table 1 vs Table 2 logic
- Bulk container handling
- DANGEROUS placard eligibility
- Mobile responsiveness

---

## Mobile Optimization

The app is designed mobile-first for truck cab use:

### Touch Targets
- All buttons: minimum 48px height
- NumberStepper: 56px buttons for easy tap
- Form inputs: 56px height (h-14)
- Tab navigation: 56px height

### Visual Design
- High contrast elements for varied lighting
- Large, readable fonts (text-lg for inputs)
- Dark mode support with automatic persistence
- DOT-standard placard colors

### Layout
- Single-column layout on mobile
- Sticky tab navigation
- Bottom padding for thumb access
- Responsive grid for larger screens

---

## Maintenance Notes

### Known Limitations
1. **No Persistence:** Data is session-based; refreshing clears the load
2. **No UN Database:** Users must manually enter UN numbers (no lookup)
3. **Simplified PIH Logic:** Only Class 6.1 PG I shows PIH checkbox
4. **No Subsidiary Hazards:** App doesn't handle materials with multiple hazard classes

### Future Enhancements
1. **UN Number Database:** Auto-complete UN numbers with material info
2. **Save/Load Feature:** Optional persistence for recurring routes
3. **Subsidiary Hazard Support:** Handle materials with multiple classes
4. **Print Feature:** Generate printable placard checklist
5. **Offline PWA:** Full offline support as Progressive Web App

### Regulatory Updates
DOT regulations may change. Key CFR sections to monitor:
- 49 CFR 172.504 (General placarding requirements)
- 49 CFR 172.336 (UN identification numbers)
- 49 CFR 172.519 (Placard specifications)
- 49 CFR 172.521 (DANGEROUS placard)

### Code Quality
- TypeScript for type safety
- Component-based architecture
- Separation of concerns (display vs. logic)
- Well-commented regulatory logic

---

## Handover Checklist

### Pre-Transfer
- [ ] Review this documentation with receiving team
- [ ] Schedule knowledge transfer session
- [ ] Identify technical contact for questions

### Access Transfer
- [ ] Transfer Replit workspace ownership (or clone repository)
- [ ] Transfer any associated domains
- [ ] Document any API keys or secrets
- [ ] Update environment variables in new environment

### Knowledge Transfer
- [ ] Walkthrough of placard calculation logic
- [ ] Explanation of CFR 49 rules implemented
- [ ] Demo of testing scenarios
- [ ] Review of mobile optimization decisions

### Validation
- [ ] Run all testing scenarios in new environment
- [ ] Verify deployment works correctly
- [ ] Test dark/light mode
- [ ] Test on mobile device

### Post-Transfer Support
- [ ] Define support window (recommended: 2-4 weeks)
- [ ] Document escalation path for issues
- [ ] Schedule follow-up check-in

---

## Contact & Support

**Original Development:** [Your Contact Info]  
**Transfer Date:** [Date]  
**Support Window Ends:** [Date + 4 weeks]

---

*This documentation is intended for Clean Harbors Environmental Services technical team. For regulatory questions, consult DOT/FMCSA directly or your compliance department.*
