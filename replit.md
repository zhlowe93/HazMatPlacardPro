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
- Track multiple materials in a single load
- Real-time weight and material count totals
- Support for all 14 DOT hazard classes (1, 2.1, 2.2, 2.3, 3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 7, 8, 9)
- Packing group classifications (I, II, III, N/A)

### Placard Calculator
- CFR 49 compliant calculations
- 1,001 lbs threshold per hazard class
- Clear visual indication of required vs. not required placards
- Color-coded placard displays matching DOT standards
- Explanations for each requirement decision

### Reference Guide
- Comprehensive hazard class information
- Descriptions, examples, and placard colors for each class
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
- 1,001 lbs threshold per hazard class
- Covers all 14 standard hazard classifications
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

## Recent Changes (October 19, 2025)
- Initial project creation
- Complete frontend prototype implemented
- Material input, calculation, and display features
- Reference guide with all hazard classes
- Theme support (light/dark mode)
- Comprehensive end-to-end testing completed
- All core features verified and working
