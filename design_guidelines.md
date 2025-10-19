# Hazardous Material Placard Compliance App - Design Guidelines

## Design Approach: Material Design System (Utility-Focused)

**Rationale**: This is a safety-critical compliance tool requiring maximum clarity, mobile optimization, and quick information access. Material Design provides excellent patterns for information-dense applications with strong visual feedback.

**Key Principles**:
- Safety-first clarity: Unambiguous information display
- Mobile-optimized: Designed for use in truck cabs
- High-visibility: Readable in various lighting conditions
- Touch-friendly: Large interaction targets (minimum 48px)

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 210 100% 45% (Safety blue - authoritative, trustworthy)
- Surface: 0 0% 98% (Clean background)
- Error/Warning: 0 85% 60% (High-visibility red for hazards)
- Success: 140 70% 45% (Compliance confirmation)
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 50%

**Dark Mode**:
- Primary: 210 90% 55%
- Surface: 220 15% 12%
- Surface Elevated: 220 12% 18%
- Error/Warning: 0 75% 65%
- Success: 140 60% 50%
- Text Primary: 0 0% 95%
- Text Secondary: 220 5% 70%

### B. Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - Clean, highly legible for data
- Monospace: 'JetBrains Mono' - For UN numbers, weights, calculations

**Scale**:
- Headline (Placard Results): text-2xl font-bold
- Section Headers: text-lg font-semibold
- Body/Form Labels: text-base font-medium
- Data Display: text-base font-normal
- Helper Text: text-sm text-muted-foreground
- UN Numbers/Weights: font-mono text-lg

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 or p-6
- Section spacing: gap-6 or gap-8
- Card padding: p-6
- Form field spacing: space-y-4
- Touch target minimum: h-12 (48px)

**Container Strategy**:
- Max-width: max-w-4xl (optimized for tablet/mobile landscape)
- Mobile padding: px-4
- Desktop padding: px-6

### D. Component Library

**Navigation**:
- Fixed bottom navigation bar (mobile-first) with 3-4 primary actions
- Icons: Material Icons via CDN
- Active state: Primary color with subtle elevation

**Forms**:
- Material-style floating labels or clear top-aligned labels
- Input fields: High-contrast borders, h-12 minimum height
- Dropdown selectors for hazard class, material type
- Number inputs for weight/quantity with large +/- steppers
- Clear field validation with inline error messages

**Cards**:
- Material elevated cards (shadow-md) for material entries
- Rounded corners: rounded-lg
- Clear visual separation with borders in dark mode
- Swipe-to-delete pattern for removing materials

**Placard Display**:
- Large, color-accurate placard visualization (square format)
- Diamond-shaped hazard symbols matching DOT specifications
- High contrast text on placard backgrounds
- Side-by-side layout: Trailer placards | Tractor placards

**Data Display**:
- Summary cards showing aggregate weights, total materials
- List view with clear hierarchy: Material name → UN# → Hazard class → Weight
- Expandable accordions for regulation details

**Buttons**:
- Primary CTA: Large (h-12), full-width on mobile, primary color
- Secondary: Outlined variant with border-2
- Icon buttons: 48px × 48px minimum
- Floating Action Button (FAB) for "Add Material" - fixed bottom-right

**Overlays**:
- Bottom sheets (mobile) for adding/editing materials
- Modal dialogs for compliance warnings or critical information
- Toast notifications for save confirmations

### E. Animations

**Minimal, Purposeful**:
- Smooth transitions for bottom sheet slides: transition-transform duration-300
- Subtle scale on button press: active:scale-95
- Fade-in for validation messages: animate-in fade-in duration-200
- No decorative animations

## Mobile-First Considerations

- Portrait orientation primary (most common in-cab usage)
- Landscape support for reference guide viewing
- Thumb-zone optimization: Critical actions within bottom 2/3 of screen
- Offline capability indicator in header
- Print-friendly placard view option

## Safety & Compliance Features

- Color-blind safe palette with pattern indicators
- High contrast mode toggle for bright sunlight
- Clear visual distinction between "compliant" and "non-compliant" states
- Warning states use both color AND iconography
- Emergency reference info always accessible

## Images

**No Hero Images**: This utility app doesn't need marketing visuals.

**Functional Icons Only**:
- Hazard class symbols (standard DOT diamond icons)
- Navigation icons from Material Icons
- Placard visualizations (generated, not photographic)