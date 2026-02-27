# Hazmat Placard Compliance App

## Overview
The Hazmat Placard Compliance App is a mobile-first tool designed for CDL hazmat drivers. Its primary purpose is to ensure DOT compliance by automatically determining the required placards for a vehicle based on CFR 49 regulations. The app calculates placard requirements in real-time, considering hazardous materials, quantities, and weights, especially in relation to the 1,001 lbs aggregate weight threshold for each hazard class. The business vision is to provide a reliable and easy-to-use application that simplifies regulatory adherence for hazmat transporters, enhancing safety and reducing the risk of non-compliance penalties.

## User Preferences
I prefer iterative development with small, testable changes. Please provide detailed explanations for complex logic, especially concerning regulatory compliance. Before making significant architectural changes or adding new external dependencies, please ask for my approval. Ensure the code is clean, well-commented, and follows best practices.

## System Architecture

### UI/UX Decisions
The application features a mobile-first, responsive design optimized for truck cabs, including large touch targets (minimum 48px) and high-contrast elements for visibility in varied lighting conditions. It supports both light and dark modes with persistent theme preferences. The interface is clean and professional, organized into a three-tab structure: Materials, Placards, and Reference. Custom NumberStepper components with large plus/minus buttons are used for number inputs (stop number, quantity, weight) to improve mobile usability.

### Technical Implementations
The frontend is built with React and TypeScript, utilizing Wouter for routing and Shadcn UI for components, styled with TailwindCSS. Client-side state management is employed, negating the need for a persistent database in the MVP. The backend is an Express.js server that serves static frontend assets and provides the manifest scanning API.

### AI Manifest Scanner (February 2026)
- **Feature**: "Scan Manifest / Shipping Paper" button above the manual entry form uses the device camera (rear-facing via `capture="environment"`) or photo gallery to photograph a hazmat shipping document
- **AI Model**: OpenAI GPT-5.2 Vision via Replit AI Integrations (no user API key needed), called at `POST /api/scan-manifest`
- **Documents Supported**: EPA Uniform Hazardous Waste Manifest (Form 8700-22), DOT Uniform Hazardous Materials Shipping Papers, Clean Harbors internal manifests
- **Fields Extracted**: UN Number, Material Name (Proper Shipping Name), Hazard Class, Subsidiary Class, Packing Group, Weight (with kg→lbs conversion), Container Type, Quantity
- **Multi-material**: Manifests with multiple waste streams return multiple material cards; driver checks/unchecks each one before importing
- **Single material**: Auto-populates the form below so driver can review before submitting
- **Client-side compression**: Images over 2048px are resized via Canvas API before upload to stay within API limits
- **Confidence badges**: Each extracted material shows High/Medium/Low confidence; low-confidence fields are flagged for manual verification
- **Error handling**: Blurry/unreadable documents, network errors, and partial reads all show clear messages with retry option
- **Safety disclaimer**: Always shown reminding drivers to verify AI fields against physical shipping papers
- **Files**: `server/scan-manifest.ts` (AI logic + prompt), `server/routes.ts` (endpoint), `client/src/components/ManifestScanner.tsx` (UI)

### Feature Specifications
- **Material Management**: Users can add, remove, and edit hazardous materials, specifying UN numbers, hazard classes, packing groups, total weight, and quantity. A simplified "Above 95 Gallons" or "95 Gallons or Below" selection replaces technical bulk/non-bulk terminology for container size. Materials are tracked by "stop number" for multi-location pickups.
- **Placard Calculator**: Adheres to CFR 49 regulations, including Table 1 and Table 2 logic, and container size rules.
    - Table 1 materials require placards at any quantity.
    - Containers above 95 gallons for Table 2 materials require placards at any quantity, displaying UN numbers on placards for each unique (class, UN) combination.
    - Containers 95 gallons or below require placards when the aggregate weight of all Table 2 materials combined exceeds 1,001 lbs.
    - The "DANGEROUS" placard option is shown when applicable (non-bulk only, 2+ Table 2 classes, no Table 1 materials), with the 2,205 lb threshold correctly applied per loading facility (stop number).
    - Placards are visually displayed with DOT-standard color coding and proper contrast for UN numbers.
    - **Subsidiary Hazard Class support (49 CFR §172.505)**: Materials can have a secondary/subsidiary class (e.g., Class 6.1 with subsidiary 4.3, written as "6.1 (4.3)" on shipping papers). Per §172.505(a), subsidiary class 4.3 requires a DANGEROUS WHEN WET placard at any quantity. Per §172.505(b), subsidiary class 2.3 requires a POISON GAS placard at any quantity. Other subsidiary classes (3, 6.1, 8, etc.) are label-only and do not independently trigger placards. Subsidiary 4.3 and 2.3 are treated as Table 1, preventing DANGEROUS placard eligibility.
- **Reference Guide**: Provides comprehensive information on hazard classes, container size guidelines (95-gallon threshold), DANGEROUS placard rules, and Table 1 vs. Table 2 requirements.

### System Design Choices
The application is designed as a session-based tool, making a database unnecessary for its core functionality, as drivers typically check placarding before each trip. Regulatory compliance is paramount, with calculations strictly based on CFR 49 DOT regulations. The simplified container size selection and per-stop weight tracking are key design decisions to enhance usability and accuracy in real-world scenarios. The core data model (`HazmatMaterial`) includes UN Number, Material Name, Hazard Class, Packing Group, Container Type (internal `bulk` | `non-bulk`), Stop Number, Total Weight (decimal), and Quantity (integer, for reference).

### Weight Field Design
- **Total Weight**: The weight field represents the combined total weight for ALL containers of that material (not per-container weight)
- **Quantity**: Number of containers, for driver reference only - not used in placard calculations
- **Why**: This matches real-world field usage where drivers know total weights from shipping papers, not individual container weights
- **Display Format**: Shows as "1,500 lbs (3 containers)" in the material list

## Mobile Optimization (January 2026)
- **Touch Targets**: All interactive elements are 64px (h-16) for work glove compatibility
- **NumberStepper**: 64px buttons with 28px icons for easy +/- tapping with gloves
- **Tabs**: Sticky navigation with 64px height for easy thumb access
- **Inputs**: All form inputs are 64px height (h-16) with large text (text-lg)
- **Buttons**: Edit/Delete buttons are 64px x 64px for glove-friendly operation
- **Layout**: Single-column mobile layout with responsive grid for tablets/desktop
- **Dark Mode**: Automatic persistence with high-contrast support

## Field-Testing Enhancements (January 2026)
- **High-Contrast Mode**: Pure black background with bright yellow text for direct sunlight visibility (cycles: light -> dark -> high-contrast)
- **Confirmation Feedback**: Toast notifications + haptic feedback (vibration) when materials are added/updated
- **Quick Check Summary**: Load summary displayed at top of Placards tab before showing requirements
- **Weight Validation**: Warning shown for unusually high weights (>10,000 lbs) to prevent data entry errors
- **Clear Confirmation**: Two-step confirmation dialog before clearing all materials from load
- **Landscape Support**: CSS media queries for horizontal phone orientation in truck-mounted holders
- **Spanish Language**: Full Spanish translation for 17% Hispanic/Latino workforce (EN/ES toggle in header)

## Handover Documentation
A comprehensive handover package has been prepared for corporate tech team transfer:
- **HANDOVER.md**: Complete technical documentation including:
  - Architecture overview and data flow
  - Full CFR 49 regulatory logic explanation
  - Setup and deployment instructions
  - Testing scenarios and validation steps
  - Maintenance notes and future enhancements
  - Transfer checklist

## External Dependencies
- **Frontend Libraries**: React, TypeScript, Wouter, Shadcn UI, TailwindCSS
- **Backend Framework**: Express.js (minimal usage)