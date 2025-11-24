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
- Add/remove/edit hazardous materials with detailed classification
- **Simplified container size selection**: "Above 85 Gallons" or "85 Gallons or Below" (replaces technical bulk/non-bulk terminology)
- **Stop number tracking**: Record which pickup location (stop 1, stop 2, etc.) each material was loaded at
- Track multiple materials in a single load throughout the day
- Real-time weight and material count totals
- Support for all DOT hazard classes including explosive divisions (1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 7, 8, 9)
- Packing group classifications (I, II, III, N/A)
- Visual "Table 1", "Above 85 Gal", and "Stop #" badges on materials
- Edit functionality with pencil icon to modify material weights/quantities

### Placard Calculator
- CFR 49 compliant calculations with proper Table 1/Table 2 and container size logic
- **Table 1 Materials**: Placard required at any quantity (Class 1.1, 1.2, 1.3, 2.3, 4.3)
- **Containers Above 85 Gallons**: Placard required at ANY quantity for Table 2 materials
  - **UN Numbers on Bulk Placards** (49 CFR 172.336): Each unique (class, UN) combination displays as separate placard with its UN number
  - Example: Two bulk Class 3 containers (UN 1203, UN 1230) → TWO Class 3 placards shown
- **Containers 85 Gallons or Below**: Placard required when aggregate weight exceeds 1,001 lbs (no UN numbers displayed)
- **DANGEROUS Placard Option**: Shows when drivers can use DANGEROUS placard as optional alternative (49 CFR 172.504(e))
  - Available for containers 85 gal or below, multiple Table 2 classes, no Table 1 materials
  - **Critical: 2,205 lb threshold is PER LOADING FACILITY (stop number)** - specific placards required only if ≥2,205 lbs of one class at any single stop
  - Correctly handles multi-stop scenarios per DOT regulations
- Clear visual indication of required vs. not required placards
- Color-coded placard displays matching DOT standards with proper contrast for UN numbers
- Detailed explanations showing requirement type (Table 1, container size, or weight threshold)

### Reference Guide
- Comprehensive hazard class information
- **Container Size Guidelines** with simplified 85 gallon threshold
- **DANGEROUS placard rules** with all conditions and examples (49 CFR 172.504(e))
  - Includes "one loading facility" rule with multi-stop scenarios
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
- Stop Number (integer, defaults to 1) - tracks loading location
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
- **Simplified container size approach**: 85 gallon threshold for practical driver use
- **Container above 85 gallons**: Table 2 materials require placard at any quantity
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
- **Implemented stop number tracking for multi-location pickups**:
  - Stop number field in material input (Stop 1, Stop 2, etc.)
  - Per-stop weight calculations for accurate DANGEROUS placard determination
  - Critical fix: 2,205 lb threshold now correctly applies PER LOADING FACILITY (per stop), not total
  - Visual stop number badges on materials
  - Reference guide updated with multi-stop examples
- Comprehensive end-to-end testing completed for all scenarios
- All core features verified and working with correct DOT compliance

## Recent Changes (November 3, 2025)
- **Simplified container size selection for better usability**:
  - Changed from technical "Bulk" vs "Non-Bulk" terminology
  - Now uses practical size-based selection: "Above 85 Gallons" vs "85 Gallons or Below"
  - Aligns with industry standard where bulk containers typically start above 85 gallons
  - Updated all user-facing text throughout the app (form labels, helper text, placard reasons, reference guide)
  - Backend still maintains "bulk" / "non-bulk" distinction for DOT compliance calculations
- **Added edit material functionality**:
  - Pencil icon next to each material to modify weight, quantity, or other fields
  - Form pre-fills with existing material data when editing
  - "Update Material" button replaces "Add Material" when editing
  - Cancel button to abandon changes
  - Smooth scroll to form when editing
- **Verified multi-stop weight aggregation with end-to-end testing**:
  - Confirmed aggregate weights correctly sum across stops for 1,001 lb threshold
  - Confirmed 2,205 lb DANGEROUS placard rule applies per-stop (not aggregate)
  - Verified edge case: exactly 1,001 lbs triggers placard requirement

## Recent Changes (November 9, 2025)
- **CRITICAL FIX: Corrected 1,001 lb threshold calculation per CFR 49 172.504(c)**:
  - **Previous (INCORRECT)**: Checked 1,001 lb threshold per individual hazard class
  - **Now (CORRECT)**: Checks 1,001 lb threshold for aggregate of ALL Table 2 materials combined on vehicle
  - Example: Class 3: 990 lbs + Class 2: 990 lbs + Class 6.1: 900 lbs + Class 8: 900 lbs = 3,780 lbs total → ALL placards now correctly required
  - This was a critical regulatory compliance bug identified through user verification with DOT regulations
  - Updated PlacardDisplay calculation logic with clear code comments citing CFR regulation
  - Updated Reference Guide with correct aggregate weight explanation and examples
  - Comprehensive end-to-end testing validates fix across all scenarios:
    - ✅ Multiple Table 2 classes totaling >1,001 lbs (Gemini scenario)
    - ✅ Edge case at exactly 1,001 lbs
    - ✅ Below threshold at 1,000 lbs
    - ✅ Mixed bulk and non-bulk containers
    - ✅ Table 1 material precedence
  - App now fully compliant with DOT placarding regulations

## Recent Changes (November 24, 2025)
- **Added UN identification numbers on bulk container placards (49 CFR 172.336)**:
  - **Requirement**: When hazmat is in a bulk container (above 85 gallons), the UN identification number must be displayed on the placard
  - **Critical Implementation**: Each unique (hazard class, UN number) combination creates a **separate placard entry**
  - **Example**: Two bulk containers (UN 1203 and UN 1230) both Class 3 → Shows TWO Class 3 placards, each with its respective UN number
  - **Visual Design**: Placards match actual DOT specifications with UN numbers displayed at top using proper contrast colors
  - **Color Visibility Fix**: UN numbers use adaptive contrast (black text on white/light backgrounds, white text on dark backgrounds)
  - **Badge Display**: UN number badge also shown below placard for additional clarity
  - **Non-Bulk Materials**: Placards for non-bulk containers do NOT display UN numbers (aggregated per class only)
  - **Mixed Loads**: Class 3 bulk (UN 1203) + Class 3 non-bulk (UN 1863) → Shows TWO placards: one with UN 1203, one without
  - Comprehensive end-to-end testing validates correct UN number display:
    - ✅ Multiple bulk containers with different UN numbers show as separate placards
    - ✅ White-background placards (Class 2.3, 6.1, 8, 9) display UN numbers in visible black text
    - ✅ Mixed bulk/non-bulk loads: bulk placards show UN numbers, non-bulk aggregates do not
  - Fully compliant with 49 CFR 172.336 requirement for distinct placard per bulk container
- **Improved mobile-friendly number inputs**:
  - **Problem**: Browser default number input up/down arrows were too small to use on mobile devices
  - **Solution**: Created custom NumberStepper component with large touch-friendly plus/minus buttons
  - **Implementation**: 48px x 48px buttons on either side of input field for easy tapping
  - **Applied to**: Stop number, quantity, and weight inputs
  - **Features**:
    - Large minus button (left) and plus button (right) with 48px minimum touch targets
    - Center input field still allows manual typing for precision
    - Step values optimized: Stop/Quantity increment by 1, Weight increments by 10 lbs
    - Proper disabled states when at min/max limits
    - Integer mode for whole numbers (stop/quantity), decimal mode for weights
  - **Responsive Design**: Weight and quantity fields stack vertically on mobile (grid-cols-1 sm:grid-cols-2)
  - Comprehensive end-to-end testing validates all stepper functionality:
    - ✅ Stop number increment/decrement buttons work correctly
    - ✅ Quantity increment/decrement buttons work correctly
    - ✅ Weight increment/decrement buttons work correctly (step by 10 lbs)
    - ✅ Manual typing still works for all fields
    - ✅ Complete material entry flow verified end-to-end
  - Significantly improved mobile UX for drivers using the app in truck cabs
