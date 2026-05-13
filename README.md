# HazMatPlacardPro

A mobile-first compliance tool that helps CDL hazmat drivers determine the correct DOT placards for their load, based on CFR 49 regulations.

The app calculates required placards in real time from the materials, quantities, and weights on a shipping manifest, including the 1,001 lb aggregate-weight threshold for each hazard class and the 95-gallon container-size rules.

## Features

- **Manifest scanner** — photograph an EPA 8700-22, DOT shipping paper, or Clean Harbors manifest and extract UN number, material name, hazard class, packing group, weight, container type, and quantity automatically
- **Placard calculator** — applies CFR 49 Table 1 and Table 2 logic, including DANGEROUS placard eligibility and subsidiary class rules (§172.505)
- **Mobile-first UI** — 64px touch targets for use with work gloves, high-contrast mode for sunlight visibility, light / dark / high-contrast themes
- **Multi-stop support** — track materials by stop number for multi-location pickups
- **Spanish translation** — full EN/ES toggle
- **Reference guide** — hazard classes, container size thresholds, DANGEROUS rules, Table 1 vs. Table 2

## Tech stack

- **Frontend:** React 18 + TypeScript, Vite, Wouter, Shadcn UI, TailwindCSS
- **Backend:** Express.js (TypeScript via tsx)
- **AI:** OpenAI Vision for manifest scanning
- **ORM:** Drizzle (Postgres / Neon serverless)
- **PWA:** vite-plugin-pwa

## Quick start

```bash
git clone https://github.com/zhlowe93/HazMatPlacardPro.git
cd HazMatPlacardPro
npm install
npm run dev
```

The dev server runs the Express backend, which serves the Vite-built React client. Open the URL printed in the terminal.

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build client + server for production |
| `npm start` | Run the production build |
| `npm run check` | TypeScript type-check |
| `npm run db:push` | Push Drizzle schema to the database |

## Project layout

```
client/          React frontend (Vite)
  src/components/  UI components, including ManifestScanner, PlacardDisplay
  src/pages/       Routes
  src/lib/         Hazmat data, placard logic
server/          Express server
  scan-manifest.ts AI manifest extraction
  validation.ts    Two-pass verification layer
shared/          Types shared between client and server
tests/           Placard logic tests
```

## Contributing

Forks and pull requests are welcome.

1. Fork the repo on GitHub
2. Clone your fork and create a branch: `git checkout -b my-change`
3. Make your changes and commit
4. Push to your fork and open a pull request

If you're proposing a non-trivial change (new feature, big refactor), open an issue first to discuss the approach.

## License

[MIT](LICENSE) — see the LICENSE file for full text.

## Disclaimer

This tool is provided as an aid for placard compliance, not a substitute for it. Drivers must verify all extracted manifest data against the physical shipping papers and remain responsible for correct placarding under CFR 49.
