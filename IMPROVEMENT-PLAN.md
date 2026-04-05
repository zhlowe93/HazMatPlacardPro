# HazMat Placard Pro — Scanning Accuracy Improvement Plan
**Date:** 2026-03-25
**Goal:** Push scan accuracy from ~80% to 95%
**Target:** Ready for driver testing within 2 weeks

---

## Three Improvements

### 1. Image Preprocessing
- Crop to manifest area (remove background)
- Contrast enhancement for handwritten fields
- Deskew if photo is angled
- Implement as a preprocessing step before sending to GPT-4o

### 2. Constrained Validation Layer
After GPT-4o returns data, validate against known code tables:
- Container types: BA, CF, CM, CW, CY, DF, DM, DT, DW, HG, TC, TT
- Unit codes: G, K, L, M, N, P, T, V
- Hazard classes: 1.1-1.6, 2.1-2.3, 3, 4.1-4.3, 5.1-5.2, 6.1, 7, 8, 9
- Packing groups: I, II, III, N/A
- UN numbers: format check UN/NA + 4 digits
- Fuzzy match for near-misses (DN → DM, Class 3.7 → flag invalid)

### 3. Two-Pass Verification
- First pass: full manifest scan (current behavior)
- If any field returns confidence "low" or "medium": run second API call zoomed into JUST that section
- Second pass prompt is narrower and more focused

## Files to Modify
- server/scan-manifest.ts — add validation layer + two-pass logic
- client/src/components/ManifestScanner.tsx — add preprocessing + UI for confidence indicators

## Current Architecture
- Frontend: React + TypeScript + Tailwind + shadcn/ui
- Backend: Express + TypeScript on Replit
- Scanning: GPT-4o vision API via OpenAI SDK
- Prompt: Already production-quality, handles Clean Harbors Section 14 format
