/**
 * Common UN number lookup table for Clean Harbors operations.
 * Used to validate and auto-fill data when the scanner reads a UN number.
 * If the scanned hazard class or material name doesn't match the known entry,
 * we flag it for driver review.
 */

interface UNEntry {
  name: string;
  hazardClass: string;
  subsidiaryClass?: string;
  packingGroup: string;
}

// Most common UN numbers encountered in Clean Harbors environmental services
export const UN_LOOKUP: Record<string, UNEntry> = {
  // Class 3 — Flammable Liquids
  "UN1170": { name: "Ethanol", hazardClass: "3", packingGroup: "II" },
  "UN1203": { name: "Gasoline", hazardClass: "3", packingGroup: "II" },
  "UN1219": { name: "Isopropanol", hazardClass: "3", packingGroup: "II" },
  "UN1230": { name: "Methanol", hazardClass: "3", subsidiaryClass: "6.1", packingGroup: "II" },
  "UN1263": { name: "Paint", hazardClass: "3", packingGroup: "II" },
  "UN1267": { name: "Petroleum crude oil", hazardClass: "3", packingGroup: "I" },
  "UN1300": { name: "Turpentine", hazardClass: "3", packingGroup: "III" },
  "UN1866": { name: "Resin solution", hazardClass: "3", packingGroup: "II" },
  "UN1993": { name: "Flammable liquid, N.O.S.", hazardClass: "3", packingGroup: "III" },
  "UN3295": { name: "Hydrocarbons, liquid, N.O.S.", hazardClass: "3", packingGroup: "III" },

  // Class 4 — Flammable Solids
  "UN1325": { name: "Flammable solid, organic, N.O.S.", hazardClass: "4.1", packingGroup: "II" },
  "UN2813": { name: "Water-reactive solid, N.O.S.", hazardClass: "4.3", packingGroup: "II" },

  // Class 5 — Oxidizers
  "UN1479": { name: "Oxidizing solid, N.O.S.", hazardClass: "5.1", packingGroup: "II" },
  "UN3085": { name: "Oxidizing solid, corrosive, N.O.S.", hazardClass: "5.1", subsidiaryClass: "8", packingGroup: "II" },

  // Class 6.1 — Toxic
  "UN2810": { name: "Toxic liquid, organic, N.O.S.", hazardClass: "6.1", packingGroup: "III" },
  "UN2811": { name: "Toxic solid, organic, N.O.S.", hazardClass: "6.1", packingGroup: "III" },
  "UN3077": { name: "Environmentally hazardous substance, solid, N.O.S.", hazardClass: "9", packingGroup: "III" },
  "UN3082": { name: "Environmentally hazardous substance, liquid, N.O.S.", hazardClass: "9", packingGroup: "III" },
  "UN3287": { name: "Toxic liquid, inorganic, N.O.S.", hazardClass: "6.1", packingGroup: "III" },
  "UN3288": { name: "Toxic solid, inorganic, N.O.S.", hazardClass: "6.1", packingGroup: "II" },
  "UN3289": { name: "Toxic liquid, corrosive, inorganic, N.O.S.", hazardClass: "6.1", subsidiaryClass: "8", packingGroup: "II" },

  // Class 8 — Corrosive
  "UN1760": { name: "Corrosive liquid, N.O.S.", hazardClass: "8", packingGroup: "II" },
  "UN1759": { name: "Corrosive solid, N.O.S.", hazardClass: "8", packingGroup: "II" },
  "UN1789": { name: "Hydrochloric acid", hazardClass: "8", packingGroup: "II" },
  "UN1805": { name: "Phosphoric acid", hazardClass: "8", packingGroup: "III" },
  "UN1823": { name: "Sodium hydroxide, solid", hazardClass: "8", packingGroup: "II" },
  "UN1824": { name: "Sodium hydroxide solution", hazardClass: "8", packingGroup: "II" },
  "UN1830": { name: "Sulfuric acid", hazardClass: "8", packingGroup: "II" },
  "UN2031": { name: "Nitric acid", hazardClass: "8", subsidiaryClass: "5.1", packingGroup: "II" },
  "UN2794": { name: "Batteries, wet, filled with acid", hazardClass: "8", packingGroup: "III" },
  "UN2795": { name: "Batteries, wet, filled with alkali", hazardClass: "8", packingGroup: "III" },
  "UN3264": { name: "Corrosive liquid, acidic, inorganic, N.O.S.", hazardClass: "8", packingGroup: "II" },
  "UN3266": { name: "Corrosive liquid, basic, inorganic, N.O.S.", hazardClass: "8", packingGroup: "II" },

  // Class 9 — Miscellaneous (UN3077 and UN3082 already listed above)
  "UN3480": { name: "Lithium ion batteries", hazardClass: "9", packingGroup: "N/A" },
  "UN3481": { name: "Lithium ion batteries contained in equipment", hazardClass: "9", packingGroup: "N/A" },

  // Class 2 — Gases
  "UN1005": { name: "Ammonia, anhydrous", hazardClass: "2.3", subsidiaryClass: "8", packingGroup: "N/A" },
  "UN1017": { name: "Chlorine", hazardClass: "2.3", subsidiaryClass: "5.1", packingGroup: "N/A" },
  "UN1049": { name: "Hydrogen, compressed", hazardClass: "2.1", packingGroup: "N/A" },
  "UN1066": { name: "Nitrogen, compressed", hazardClass: "2.2", packingGroup: "N/A" },
  "UN1072": { name: "Oxygen, compressed", hazardClass: "2.2", subsidiaryClass: "5.1", packingGroup: "N/A" },
  "UN1075": { name: "Liquefied petroleum gas", hazardClass: "2.1", packingGroup: "N/A" },
  "UN1978": { name: "Propane", hazardClass: "2.1", packingGroup: "N/A" },

  // Common waste codes
  "NA3077": { name: "Hazardous waste, solid, N.O.S.", hazardClass: "9", packingGroup: "III" },
  "NA3082": { name: "Hazardous waste, liquid, N.O.S.", hazardClass: "9", packingGroup: "III" },
};

/**
 * Cross-reference a scanned material against the UN lookup table.
 * Returns validation issues if the scanned data doesn't match known values.
 */
export function crossReferenceUN(
  unNumber: string | null,
  scannedClass: string | null,
  scannedPG: string | null
): {
  knownEntry: UNEntry | null;
  issues: string[];
  autoFills: Partial<UNEntry>;
} {
  if (!unNumber) return { knownEntry: null, issues: [], autoFills: {} };

  const cleaned = unNumber.trim().toUpperCase();
  const entry = UN_LOOKUP[cleaned];

  if (!entry) return { knownEntry: null, issues: [], autoFills: {} };

  const issues: string[] = [];
  const autoFills: Partial<UNEntry> = {};

  // Check hazard class match
  if (scannedClass && scannedClass !== entry.hazardClass) {
    issues.push(
      `Scanned class "${scannedClass}" doesn't match known class "${entry.hazardClass}" for ${cleaned}`
    );
  }
  if (!scannedClass) {
    autoFills.hazardClass = entry.hazardClass;
  }

  // Check packing group match
  if (scannedPG && scannedPG !== entry.packingGroup && scannedPG !== "N/A") {
    issues.push(
      `Scanned PG "${scannedPG}" doesn't match known PG "${entry.packingGroup}" for ${cleaned}`
    );
  }
  if (!scannedPG || scannedPG === "N/A") {
    autoFills.packingGroup = entry.packingGroup;
  }

  // Auto-fill subsidiary class if known
  if (entry.subsidiaryClass) {
    autoFills.subsidiaryClass = entry.subsidiaryClass;
  }

  // Auto-fill name if not scanned
  autoFills.name = entry.name;

  return { knownEntry: entry, issues, autoFills };
}
