# Hazmat Placard Compliance App

## Overview
A mobile-first compliance tool designed for CDL hazmat drivers to determine required DOT placards based on CFR 49 regulations. The app calculates placard requirements in real-time based on the specific hazardous materials, quantities, and weights being transported.

## Purpose
Help truck drivers ensure DOT compliance by automatically determining which placards are required on their vehicle based on the 1,001 lbs aggregate weight threshold for each hazard class.

## Current State
Fully functional prototype with client-side state management. The app is ready for immediate use by drivers and provides:
- Material input with UN numbers, hazard classes, packing groups, weights, and quantities
- Automatic placard requirement calculations
- Visual placard displays with color-coded hazard classes
- Comprehensive reference guide for all 14 DOT hazard classes
- Mobile-optimized design with dark mode support

## Features

### Material Management
- Add/remove hazardous materials with detailed classification
- **Container type selection**: Bulk vs Non-Bulk with capacity thresholds
- Track multiple materials in a single load
- Real-time weight and material count totals
- Support for all DOT hazard classes including explosive divisions (1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 7, 8, 9)
- Packing group classifications (I, II, III, N/A)
- Visual "Table 1" and "Bulk" badges on materials

### Placard Calculator
- CFR 49 compliant calculations with proper Table 1/Table 2 and bulk/non-bulk logic
- **Table 1 Materials**: Placard required at any quantity (Class 1.1, 1.2, 1.3, 2.3, 4.3)
- **Table 2 Bulk Containers**: Placard required at ANY quantity (>119 gal liquid, >882 lbs solid, >1,000 lbs gas)
- **Table 2 Non-Bulk Containers**: Placard required when aggregate weight exceeds 1,001 lbs
- **DANGEROUS Placard Option**: Shows when drivers can use DANGEROUS placard as optional alternative (49 CFR 172.504(e))
  - Available for non-bulk, multiple Table 2 classes, no Table 1 materials
  - Highlights when specific placards must still be displayed (≥2,205 lbs)
- Clear visual indication of required vs. not required placards
- Color-coded placard displays matching DOT standards
- Detailed explanations showing requirement type (Table 1, bulk, or weight threshold)

### Reference Guide
- Comprehensive hazard class information
- **Bulk vs Non-Bulk container explanations** with capacity thresholds
- **DANGEROUS placard rules** with all conditions and examples (49 CFR 172.504(e))
- Descriptions, examples, and placard colors for each class
- Table 1 vs Table 2 placard requirement details
- Accordion interface for easy navigation
- Quick reference for common materials

### User Experience
- Mobile-first responsive design optimized for truck cabs
- Large touch targets (48px minimum)
- High-contrast design for various lighting conditions
- Light/dark mode support
- Persistent theme preference
- Clean, professional interface

## Technical Architecture

### Frontend
- React with TypeScript
- Wouter for routing
- Shadcn UI component library
- TailwindCSS for styling
- Client-side state management (no database required)
- Three-tab interface: Materials, Placards, Reference

### Backend (Minimal)
- Express.js server
- In-memory storage interface (prepared for future persistence if needed)
- Currently serving static frontend only

### Data Model
See `shared/schema.ts` for the HazmatMaterial type:
- UN Number
- Material Name
- Hazard Class
- Packing Group
- Container Type (bulk | non-bulk)
- Weight (decimal)
- Quantity (integer)

## Design Decisions

### No Database Required
This is a session-based compliance tool. Drivers typically check placard requirements before each trip, so persistent storage is not necessary for the MVP. The app works perfectly with client-side state management.

### Mobile-First Approach
Designed specifically for use in truck cabs with:
- Large, touch-friendly controls
- Clear visual hierarchy
- Optimized for portrait orientation
- Readable in various lighting conditions

### Regulatory Compliance
- Based on CFR 49 DOT regulations
- Properly implements Table 1 (any quantity) and Table 2 requirements
- **Correctly handles bulk container rules**: Table 2 bulk = placard at any quantity
- **Bulk container thresholds**: >119 gallons liquid, >882 lbs solid, >1,000 lbs gas capacity
- Covers all standard hazard classifications including explosive divisions
- Accurate placard color coding per DOT standards
- Includes disclaimer to verify with current DOT regulations

## Future Enhancements (Not in MVP)
- Save/load common material combinations
- Searchable UN number database
- Photo upload for shipping papers
- Incompatibility warnings for mixed loads
- Printable manifest generation
- Offline capability with service workers

## Running the Project
The workflow "Start application" runs `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

## Recent Changes (October 22, 2025)
- Initial project creation
- Complete frontend prototype implemented
- Material input, calculation, and display features
- Reference guide with all hazard classes
- Theme support (light/dark mode)
- **Updated placard logic to properly handle DOT Table 1 and Table 2 requirements**:
  - Table 1 materials (Classes 1.1, 1.2, 1.3, 2.3, 4.3) require placards at any quantity
  - Table 2 materials require placards only above 1,001 lbs aggregate weight (non-bulk)
  - Visual "Table 1" badges throughout the app
  - Updated reference guide with placard requirement details for each class
- **Added bulk vs non-bulk container type selection**:
  - Container type dropdown with bulk capacity threshold helper text
  - Table 2 bulk containers require placards at ANY quantity (critical DOT rule)
  - Visual "Bulk" badges on materials and placards
  - Updated calculation logic to handle bulk/non-bulk distinction
  - New reference section explaining bulk container definitions and rules
  - Clarified that bulk is based on container CAPACITY, not material weight
- **Added DANGEROUS placard option (49 CFR 172.504(e))**:
  - Shows when drivers can use DANGEROUS placard as optional alternative
  - Eligible when: non-bulk only, 2+ Table 2 classes, no Table 1 materials
  - Highlights specific placards that must still be displayed if any class ≥2,205 lbs
  - Amber-colored card with clear eligibility explanation
  - Reference guide includes all DANGEROUS rules with examples
- Comprehensive end-to-end testing completed for all scenarios
- All core features verified and working with correct DOT compliance
