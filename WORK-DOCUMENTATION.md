# HazMat Placard Pro — Development Work Log
## For: Zachary Lowe | Clean Harbors Environmental Services
## Purpose: Documentation of off-road hours spent on professional development project

---

## PROJECT OVERVIEW

**Project Name:** HazMatPlardPro  
**Repository:** github.com/zhlowe93/HazMatPlacardPro  
**Description:** A mobile-first DOT hazmat placard compliance tool for CDL hazmat drivers. Calculates required placards per CFR 49 regulations and uses AI to scan/auto-populate from shipping manifests.  
**Relevance:** Directly applicable to daily job responsibilities at Clean Harbors. Reduces compliance violations, improves accuracy of placard identification, saves time on manual calculations.

---

## DEVELOPMENT TIMELINE

### Phase 1: Foundation (October 2025)
- Created core application structure
- Implemented DOT Table 1 vs Table 2 rules
- Built container type (bulk/non-bulk) selection
- Added DANGEROUS placard option for mixed loads
- **Purpose:** Understand DOT compliance requirements deeply enough to code them

### Phase 2: Multi-Stop Tracking (October-November 2025)
- Added stop number tracking for multi-location pickups
- Implemented per-stop weight calculations
- Added 2,205 lb threshold logic per loading facility
- **Purpose:** Match how actual Clean Harbors routes work — multiple pickups per day

### Phase 3: Mobile Optimization (January 2026)
- Touch target sizing for gloved hands
- High-contrast mode for bright sunlight
- Landscape orientation support
- Confirmation dialogs to prevent errors
- **Purpose:** Make it usable in actual truck cab conditions

### Phase 4: AI Manifest Scanning (February 2026)
- Added GPT-4o powered manifest scanning
- Two-pass verification for low-confidence fields
- Automatic extraction of UN numbers, weights, container types
- **Purpose:** Eliminate manual data entry — scan manifest, auto-populate

### Phase 5: Validation & Accuracy (March-April 2026)
- Validation layer for extracted data
- Subsidiary hazard class support
- Improved weight/unit parsing
- **Purpose:** Ensure >95% accuracy before trial deployment

---

## COMMITS BY MONTH

| Month | Commits | Key Work |
|-------|---------|----------|
| Oct 2025 | 15 | Core app, Table 1/2 rules, container types |
| Nov 2025 | — | (continued development, Replit hosting) |
| Jan 2026 | 12 | Mobile UX, touch targets, sunlight mode |
| Feb 2026 | 8 | AI scanning, subsidiary hazards, weight parsing |
| Mar 2026 | 2 | Replit deployment |
| Apr 2026 | 1 | Validation layer, two-pass verification |

**Total documented commits: 38+**

---

## TECHNICAL STACK (used in professional context)

- **React 18 + TypeScript** — Modern web development
- **Node.js/Express** — Server-side logic
- **GPT-4o API** — AI integration for document scanning
- **CFR 49 Regulations** — USDOT compliance code
- **Git/GitHub** — Version control and collaboration
- **Vite** — Build tooling
- **TailwindCSS** — Responsive styling

These are standard technologies used in modern web development. Proficiency demonstrates readiness for technical roles.

---

## RELATIONSHIP TO CLEAN HARBORS WORK

This application directly supports job responsibilities:

1. **Daily Compliance** — Ensures correct placards are displayed on vehicle
2. **Time Savings** — Manual manifest entry vs. AI scanning saves ~15-20 min/route
3. **Error Reduction** — Automated calculations eliminate human math errors
4. **Training Tool** — Built-in reference guide for new drivers learning CFR 49
5. **Real-World Testing** — Used actual Clean Harbors manifests during development

---

## WHAT THIS DOCUMENTATION PROVES

If questioned about off-road hours, this project demonstrates:

1. **Legitimate professional development** — Skills directly applicable to current job
2. **Consistent effort over time** — 6+ months of documented development
3. **Technical competence** — Full-stack development, AI integration, regulatory compliance
4. **Business value creation** — Tool designed to solve actual job-site problems
5. **Proactive initiative** — Not assigned, created to fill a gap

---

## IF QUESTIONED: SHORT ANSWER

"I developed a mobile app for DOT hazmat placard compliance. It uses AI to scan shipping manifests and automatically calculates required placards per CFR 49. It directly relates to my job — I built it to solve a problem I face every day on routes. The code is on my GitHub with a full commit history going back to October 2025."

---

## DOCUMENTATION MAINTAINED BY

Zachary Lowe  
Clean Harbors Environmental Services  
Repository: github.com/zhlowe93/HazMatPlacardPro  
Last Updated: 2026-04-17

---

*This documentation is provided as evidence of professional development activities conducted during off-road hours. The project was developed independently using personal time and resources.*
