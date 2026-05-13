/**
 * HazMat Placard Pro — Automated Test Suite
 * Tests placard calculation logic against CFR 49 regulations.
 *
 * Run with: npx tsx tests/placard-logic.test.ts
 */

// ============================================================
// Replicate core types and logic from PlacardDisplay.tsx
// ============================================================

interface Material {
  id: string;
  unNumber: string;
  materialName: string;
  hazardClass: string;
  subsidiaryClass?: string;
  packingGroup: string;
  weight: string;
  quantity: number;
  containerType: "bulk" | "non-bulk";
  stopNumber: number;
  poisonInhalationHazard: boolean;
  isOrganicPeroxideTypeB?: boolean;
  isRadioactiveYellowIII?: boolean;
  isResidue?: boolean;
}

interface PlacardRequirement {
  hazardClass: string;
  label: string;
  required: boolean;
  reason: string;
  isTable1: boolean;
  isBulk: boolean;
  weight: number;
  key: string;
  isPih?: boolean;
}

interface DangerousEligibility {
  canUse: boolean;
  reason: string;
  specificPlacardRequired: string[];
}

// Table 1 classes
const TABLE_1_CLASSES = ["1.1", "1.2", "1.3", "2.3", "4.3"];

function isTable1Material(hazardClass: string): boolean {
  return TABLE_1_CLASSES.includes(hazardClass);
}

// Core placard calculation — mirrors PlacardDisplay.tsx logic
function calculatePlacardRequirements(materials: Material[]): PlacardRequirement[] {
  const requirements: PlacardRequirement[] = [];
  const table2Threshold = 1001;

  const bulkEntries = new Map<string, { class: string; un: string; weight: number; isTable1: boolean; isPih: boolean }>();
  const nonBulkClassTotals = new Map<string, { weight: number; hasPih: boolean; hasTypeB: boolean; hasYellowIII: boolean; hasResidueExemption: boolean }>();
  let table2NonBulkAggregateWeight = 0;

  materials.forEach((material) => {
    const isTable1ByClass = isTable1Material(material.hazardClass);
    const isPih = material.poisonInhalationHazard === true;
    const isTypeB = material.isOrganicPeroxideTypeB === true && material.hazardClass === "5.2";
    const isYellowIII = material.isRadioactiveYellowIII === true && material.hazardClass === "7";
    const isTable1 = isTable1ByClass || isPih || isTypeB || isYellowIII;
    const materialWeight = parseFloat(material.weight);

    // Residue exemption
    const isResidueNonBulkTable2 = material.isResidue === true && !isTable1 && material.containerType !== "bulk";
    if (isResidueNonBulkTable2) {
      const existing = nonBulkClassTotals.get(material.hazardClass) || { weight: 0, hasPih: false, hasTypeB: false, hasYellowIII: false, hasResidueExemption: false };
      nonBulkClassTotals.set(material.hazardClass, { ...existing, weight: existing.weight + materialWeight, hasResidueExemption: true });
      return;
    }

    if (material.containerType === "bulk") {
      const key = `${material.hazardClass}-${material.unNumber}`;
      const existing = bulkEntries.get(key);
      if (existing) {
        existing.weight += materialWeight;
        existing.isPih = existing.isPih || isPih;
        existing.isTable1 = existing.isTable1 || isPih;
      } else {
        bulkEntries.set(key, { class: material.hazardClass, un: material.unNumber, weight: materialWeight, isTable1, isPih });
      }
    } else {
      const current = nonBulkClassTotals.get(material.hazardClass) || { weight: 0, hasPih: false, hasTypeB: false, hasYellowIII: false, hasResidueExemption: false };
      nonBulkClassTotals.set(material.hazardClass, {
        weight: current.weight + materialWeight,
        hasPih: current.hasPih || isPih,
        hasTypeB: current.hasTypeB || isTypeB,
        hasYellowIII: current.hasYellowIII || isYellowIII,
        hasResidueExemption: current.hasResidueExemption,
      });
      if (!isTable1) {
        table2NonBulkAggregateWeight += materialWeight;
      }
    }
  });

  const table2AggregateExceedsThreshold = table2NonBulkAggregateWeight >= table2Threshold;

  // Bulk entries
  bulkEntries.forEach((entry, key) => {
    requirements.push({
      hazardClass: entry.class,
      label: `Class ${entry.class}`,
      required: true,
      reason: "Bulk container",
      isTable1: entry.isTable1,
      isBulk: true,
      weight: entry.weight,
      key: `bulk-${key}`,
      isPih: entry.isPih,
    });
  });

  // Non-bulk entries
  nonBulkClassTotals.forEach((data, hazardClass) => {
    const { weight, hasPih, hasTypeB, hasYellowIII, hasResidueExemption } = data;
    const isTable1ByClass = isTable1Material(hazardClass);
    const isTable1 = isTable1ByClass || hasPih || hasTypeB || hasYellowIII;

    if (hasResidueExemption && !isTable1) {
      requirements.push({
        hazardClass, label: `Class ${hazardClass} (Residue)`, required: false,
        reason: "Table 2 residue exempt", isTable1: false, isBulk: false, weight, key: `nonbulk-${hazardClass}`, isPih: false,
      });
      return;
    }

    const required = isTable1 || (!isTable1 && table2AggregateExceedsThreshold);
    requirements.push({
      hazardClass, label: `Class ${hazardClass}`, required, reason: "",
      isTable1, isBulk: false, weight, key: `nonbulk-${hazardClass}`, isPih: hasPih,
    });
  });

  // Subsidiary classes 4.3 and 2.3
  const subsidiaryTriggers = new Set<string>();
  materials.forEach((m) => { if (m.subsidiaryClass) subsidiaryTriggers.add(m.subsidiaryClass); });

  ["4.3", "2.3"].forEach((subClass) => {
    if (!subsidiaryTriggers.has(subClass)) return;
    if (requirements.find((r) => r.hazardClass === subClass && r.required)) return;

    const triggering = materials.filter((m) => m.subsidiaryClass === subClass);
    const totalWeight = triggering.reduce((sum, m) => sum + parseFloat(m.weight), 0);

    requirements.push({
      hazardClass: subClass, label: `Class ${subClass}`, required: true,
      reason: "Subsidiary trigger", isTable1: true, isBulk: false, weight: totalWeight, key: `subsidiary-${subClass}`, isPih: false,
    });
  });

  return requirements;
}

// DANGEROUS placard eligibility — simplified from PlacardDisplay.tsx
function calculateDangerousEligibility(requirements: PlacardRequirement[], materials: Material[]): DangerousEligibility {
  const hasTable1 = requirements.some((r) => r.isTable1);
  const hasBulk = materials.some((m) => m.containerType === "bulk");
  const requiredTable2 = requirements.filter((r) => r.required && !r.isTable1);

  if (hasTable1) return { canUse: false, reason: "Table 1 present", specificPlacardRequired: [] };
  if (hasBulk) return { canUse: false, reason: "Bulk present", specificPlacardRequired: [] };
  if (requiredTable2.length < 2) return { canUse: false, reason: "Need 2+ Table 2 classes", specificPlacardRequired: [] };

  // Check 2,205 lb per-stop threshold
  const stopClassWeights = new Map<string, number>();
  materials.forEach((m) => {
    const key = `${m.stopNumber}-${m.hazardClass}`;
    stopClassWeights.set(key, (stopClassWeights.get(key) || 0) + parseFloat(m.weight));
  });

  const classesOver2205 = new Set<string>();
  stopClassWeights.forEach((weight, key) => {
    if (weight >= 2205) classesOver2205.add(key.split('-')[1]);
  });

  const specificRequired = requiredTable2
    .filter((r) => classesOver2205.has(r.hazardClass))
    .map((r) => r.hazardClass);

  if (specificRequired.length > 0) {
    return { canUse: true, reason: "Partial — some classes exceed 2,205 lbs", specificPlacardRequired: specificRequired };
  }

  return { canUse: true, reason: "Eligible", specificPlacardRequired: [] };
}

// ============================================================
// Test Runner
// ============================================================

let passed = 0;
let failed = 0;
const failures: string[] = [];

function makeMaterial(overrides: Partial<Material> & { hazardClass: string; weight: string }): Material {
  return {
    id: Math.random().toString(36).slice(2),
    unNumber: overrides.unNumber || "UN0000",
    materialName: overrides.materialName || "Test Material",
    hazardClass: overrides.hazardClass,
    subsidiaryClass: overrides.subsidiaryClass,
    packingGroup: overrides.packingGroup || "II",
    weight: overrides.weight,
    quantity: overrides.quantity || 1,
    containerType: overrides.containerType || "non-bulk",
    stopNumber: overrides.stopNumber || 1,
    poisonInhalationHazard: overrides.poisonInhalationHazard || false,
    isOrganicPeroxideTypeB: overrides.isOrganicPeroxideTypeB || false,
    isRadioactiveYellowIII: overrides.isRadioactiveYellowIII || false,
    isResidue: overrides.isResidue || false,
  };
}

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    const msg = `  ✗ ${testName}${detail ? ` — ${detail}` : ""}`;
    console.log(msg);
    failures.push(msg);
  }
}

function getRequired(reqs: PlacardRequirement[]): PlacardRequirement[] {
  return reqs.filter((r) => r.required);
}

function hasRequiredClass(reqs: PlacardRequirement[], cls: string): boolean {
  return reqs.some((r) => r.required && r.hazardClass === cls);
}

// ============================================================
// TEST SCENARIOS
// ============================================================

console.log("\n=== HazMat Placard Pro — Test Suite ===\n");

// ----------------------------------------------------------
console.log("--- Table 1 Materials (always placard) ---");
{
  const materials = [makeMaterial({ hazardClass: "1.1", weight: "10", materialName: "Dynamite" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "1.1"), "Class 1.1: 10 lbs requires placard");
}
{
  const materials = [makeMaterial({ hazardClass: "2.3", weight: "1", materialName: "Chlorine" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "2.3"), "Class 2.3: 1 lb requires placard");
}
{
  const materials = [makeMaterial({ hazardClass: "4.3", weight: "5", materialName: "Sodium" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "4.3"), "Class 4.3: 5 lbs requires placard");
}
{
  const materials = [makeMaterial({ hazardClass: "1.2", weight: "50" }), makeMaterial({ hazardClass: "1.3", weight: "25" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "1.2"), "Class 1.2: requires placard");
  assert(hasRequiredClass(reqs, "1.3"), "Class 1.3: requires placard");
}

// ----------------------------------------------------------
console.log("\n--- Table 2 Aggregate Threshold (1,001 lbs) ---");
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "500" }), makeMaterial({ hazardClass: "8", weight: "600" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "3"), "Class 3 + Class 8 = 1,100 lbs: Class 3 requires placard");
  assert(hasRequiredClass(reqs, "8"), "Class 3 + Class 8 = 1,100 lbs: Class 8 requires placard");
}
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "400" }), makeMaterial({ hazardClass: "8", weight: "400" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "3"), "Class 3 + Class 8 = 800 lbs: Class 3 NOT required");
  assert(!hasRequiredClass(reqs, "8"), "Class 3 + Class 8 = 800 lbs: Class 8 NOT required");
}
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "1001" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "3"), "Class 3 alone at 1,001 lbs: requires placard");
}
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "1000" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "3"), "Class 3 alone at 1,000 lbs: NOT required (threshold is >=1001)");
}
{
  // 3 classes, aggregate crosses threshold
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "400" }),
    makeMaterial({ hazardClass: "8", weight: "300" }),
    makeMaterial({ hazardClass: "9", weight: "350" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "3"), "3 classes totaling 1,050 lbs: Class 3 required");
  assert(hasRequiredClass(reqs, "8"), "3 classes totaling 1,050 lbs: Class 8 required");
  assert(hasRequiredClass(reqs, "9"), "3 classes totaling 1,050 lbs: Class 9 required");
}

// ----------------------------------------------------------
console.log("\n--- Bulk Container Rule ---");
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "200", containerType: "bulk", unNumber: "UN1203" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "3"), "Class 3 bulk at 200 lbs: requires placard (bulk always requires)");
}
{
  const materials = [makeMaterial({ hazardClass: "9", weight: "50", containerType: "bulk", unNumber: "UN3082" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "9"), "Class 9 bulk at 50 lbs: requires placard (bulk always requires)");
}

// ----------------------------------------------------------
console.log("\n--- Class 5.2 Type B Organic Peroxide (Table 1) ---");
{
  const materials = [makeMaterial({ hazardClass: "5.2", weight: "10", isOrganicPeroxideTypeB: true })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "5.2"), "Class 5.2 Type B at 10 lbs: requires placard (Table 1)");
  const req = reqs.find(r => r.hazardClass === "5.2");
  assert(req?.isTable1 === true, "Class 5.2 Type B: marked as Table 1");
}
{
  const materials = [makeMaterial({ hazardClass: "5.2", weight: "10", isOrganicPeroxideTypeB: false })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "5.2"), "Class 5.2 (not Type B) at 10 lbs: NOT required (Table 2, below threshold)");
}

// ----------------------------------------------------------
console.log("\n--- Class 7 Radioactive Yellow III (Table 1) ---");
{
  const materials = [makeMaterial({ hazardClass: "7", weight: "5", isRadioactiveYellowIII: true })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "7"), "Class 7 Yellow III at 5 lbs: requires placard (Table 1)");
  const req = reqs.find(r => r.hazardClass === "7");
  assert(req?.isTable1 === true, "Class 7 Yellow III: marked as Table 1");
}
{
  const materials = [makeMaterial({ hazardClass: "7", weight: "5", isRadioactiveYellowIII: false })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "7"), "Class 7 (not Yellow III) at 5 lbs: NOT required (Table 2, below threshold)");
}

// ----------------------------------------------------------
console.log("\n--- PIH (Poison Inhalation Hazard) ---");
{
  const materials = [makeMaterial({ hazardClass: "6.1", weight: "50", packingGroup: "I", poisonInhalationHazard: true })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "6.1"), "Class 6.1 PIH at 50 lbs: requires placard (Table 1)");
  const req = reqs.find(r => r.hazardClass === "6.1");
  assert(req?.isTable1 === true, "Class 6.1 PIH: marked as Table 1");
}
{
  const materials = [makeMaterial({ hazardClass: "6.1", weight: "50", packingGroup: "III", poisonInhalationHazard: false })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "6.1"), "Class 6.1 PG III (no PIH) at 50 lbs: NOT required");
}

// ----------------------------------------------------------
console.log("\n--- Subsidiary Hazard Classes 4.3 and 2.3 ---");
{
  const materials = [makeMaterial({ hazardClass: "6.1", weight: "100", subsidiaryClass: "4.3" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "4.3"), "Subsidiary 4.3 on Class 6.1: requires 4.3 placard at any quantity");
}
{
  const materials = [makeMaterial({ hazardClass: "8", weight: "100", subsidiaryClass: "2.3" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "2.3"), "Subsidiary 2.3 on Class 8: requires 2.3 placard at any quantity");
}
{
  const materials = [makeMaterial({ hazardClass: "6.1", weight: "100", subsidiaryClass: "8" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "8"), "Subsidiary 8 on Class 6.1: does NOT require separate 8 placard (label only)");
}

// ----------------------------------------------------------
console.log("\n--- Residue / Empty Container Rules ---");
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "50", isResidue: true, containerType: "non-bulk" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(!hasRequiredClass(reqs, "3"), "Table 2 residue in non-bulk: NOT required");
}
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "50", isResidue: true, containerType: "bulk" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "3"), "Table 2 residue in BULK: still requires placard");
}
{
  const materials = [makeMaterial({ hazardClass: "4.3", weight: "10", isResidue: true, containerType: "non-bulk" })];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "4.3"), "Table 1 residue in non-bulk: STILL requires placard");
}

// ----------------------------------------------------------
console.log("\n--- DANGEROUS Placard Eligibility ---");
{
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "600" }),
    makeMaterial({ hazardClass: "8", weight: "600" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);
  assert(elig.canUse === true, "2 Table 2 classes, 1,200 lbs: DANGEROUS eligible");
}
{
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "600" }),
    makeMaterial({ hazardClass: "8", weight: "600" }),
    makeMaterial({ hazardClass: "4.3", weight: "10" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);
  assert(elig.canUse === false, "Table 1 present (4.3): DANGEROUS NOT eligible");
}
{
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "600", containerType: "bulk", unNumber: "UN1203" }),
    makeMaterial({ hazardClass: "8", weight: "600" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);
  assert(elig.canUse === false, "Bulk container present: DANGEROUS NOT eligible");
}
{
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "2300", stopNumber: 1 }),
    makeMaterial({ hazardClass: "8", weight: "600", stopNumber: 1 }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);
  assert(elig.specificPlacardRequired.includes("3"), "Class 3 at 2,300 lbs from one stop: needs specific placard (can't use DANGEROUS for it)");
}

// ----------------------------------------------------------
console.log("\n--- Per-Stop 2,205 lb Threshold ---");
{
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "1500", stopNumber: 1 }),
    makeMaterial({ hazardClass: "3", weight: "1000", stopNumber: 2 }),
    makeMaterial({ hazardClass: "8", weight: "800", stopNumber: 1 }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);
  assert(!elig.specificPlacardRequired.includes("3"), "Class 3: 1,500 at stop 1 + 1,000 at stop 2 — neither stop exceeds 2,205");
}
{
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "2300", stopNumber: 1 }),
    makeMaterial({ hazardClass: "8", weight: "800", stopNumber: 1 }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);
  assert(elig.specificPlacardRequired.includes("3"), "Class 3 at 2,300 from stop 1: exceeds 2,205 — specific placard required");
}

// ----------------------------------------------------------
console.log("\n--- Mixed Table 1 + Table 2 ---");
{
  const materials = [
    makeMaterial({ hazardClass: "2.3", weight: "100", materialName: "Chlorine" }),
    makeMaterial({ hazardClass: "3", weight: "500", materialName: "Gasoline" }),
    makeMaterial({ hazardClass: "8", weight: "300", materialName: "Sulfuric acid" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "2.3"), "Mixed load: Class 2.3 required (Table 1)");
  assert(!hasRequiredClass(reqs, "3"), "Mixed load: Class 3 NOT required (aggregate Table 2 = 800 lbs, below 1,001)");
  assert(!hasRequiredClass(reqs, "8"), "Mixed load: Class 8 NOT required (aggregate Table 2 = 800 lbs)");
}
{
  const materials = [
    makeMaterial({ hazardClass: "2.3", weight: "100" }),
    makeMaterial({ hazardClass: "3", weight: "700" }),
    makeMaterial({ hazardClass: "8", weight: "400" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "2.3"), "Table 1 always required");
  assert(hasRequiredClass(reqs, "3"), "Table 2 aggregate 1,100 lbs: Class 3 required");
  assert(hasRequiredClass(reqs, "8"), "Table 2 aggregate 1,100 lbs: Class 8 required");
}

// ----------------------------------------------------------
console.log("\n--- Nightmare Route (6 materials, 3 stops) ---");
{
  const materials = [
    makeMaterial({ hazardClass: "2.3", weight: "150", stopNumber: 1, materialName: "Chlorine", unNumber: "UN1017" }),
    makeMaterial({ hazardClass: "3", weight: "400", stopNumber: 1, materialName: "Gasoline", containerType: "bulk", unNumber: "UN1203" }),
    makeMaterial({ hazardClass: "8", weight: "800", stopNumber: 2, materialName: "Sulfuric acid" }),
    makeMaterial({ hazardClass: "3", weight: "600", stopNumber: 2, materialName: "Acetone" }),
    makeMaterial({ hazardClass: "6.1", weight: "300", stopNumber: 3, materialName: "Pesticide", subsidiaryClass: "4.3" }),
    makeMaterial({ hazardClass: "9", weight: "200", stopNumber: 3, materialName: "Lithium batteries" }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  const elig = calculateDangerousEligibility(reqs, materials);

  assert(hasRequiredClass(reqs, "2.3"), "Nightmare: Class 2.3 required (Table 1)");
  assert(hasRequiredClass(reqs, "3"), "Nightmare: Class 3 required (bulk container)");
  assert(hasRequiredClass(reqs, "4.3"), "Nightmare: Subsidiary 4.3 requires separate placard");
  assert(elig.canUse === false, "Nightmare: DANGEROUS not eligible (Table 1 present + bulk)");

  // Table 2 aggregate = 800 (class 8) + 600 (class 3 stop 2 non-bulk... wait, class 3 at stop 1 is bulk)
  // Non-bulk Table 2: class 8 (800) + class 3 stop 2 (600) + class 6.1 (300) + class 9 (200) = 1,900
  assert(hasRequiredClass(reqs, "8"), "Nightmare: Class 8 required (Table 2 aggregate > 1,001)");
  assert(hasRequiredClass(reqs, "6.1"), "Nightmare: Class 6.1 required (Table 2 aggregate > 1,001)");
  assert(hasRequiredClass(reqs, "9"), "Nightmare: Class 9 required (Table 2 aggregate > 1,001)");
}

// ----------------------------------------------------------
console.log("\n--- Edge Cases ---");
{
  const materials: Material[] = [];
  const reqs = calculatePlacardRequirements(materials);
  assert(reqs.length === 0, "Empty load: no placards required");
}
{
  const materials = [makeMaterial({ hazardClass: "3", weight: "0" })];
  const reqs = calculatePlacardRequirements(materials);
  // 0 weight shouldn't trigger anything
  assert(getRequired(reqs).length === 0, "Zero weight: no placards required");
}
{
  // Same class from multiple stops, should aggregate correctly
  const materials = [
    makeMaterial({ hazardClass: "3", weight: "400", stopNumber: 1 }),
    makeMaterial({ hazardClass: "3", weight: "300", stopNumber: 2 }),
    makeMaterial({ hazardClass: "3", weight: "400", stopNumber: 3 }),
  ];
  const reqs = calculatePlacardRequirements(materials);
  assert(hasRequiredClass(reqs, "3"), "Same class from 3 stops (1,100 lbs total): requires placard");
  const req = reqs.find(r => r.hazardClass === "3");
  assert(req?.weight === 1100, "Weight correctly aggregated across stops", `got ${req?.weight}`);
}

// ----------------------------------------------------------
console.log("\n--- Gallon Conversion Spot Checks ---");
{
  // Verify the conversion factors make sense for placard thresholds
  // 55-gallon drum of Class 3 @ 7.5 lbs/gal = 413 lbs
  const lbs = Math.ceil(55 * 7.5);
  assert(lbs === 413, "55 gal Class 3 = 413 lbs");

  // Two 55-gal drums = 825 lbs — still under 1,001
  assert(Math.ceil(110 * 7.5) === 825, "110 gal Class 3 = 825 lbs (under threshold)");

  // Three 55-gal drums = 1,238 lbs — over 1,001
  assert(Math.ceil(165 * 7.5) === 1238, "165 gal Class 3 = 1,238 lbs (over threshold)");

  // 55-gal drum of Class 8 corrosive @ 12.0 lbs/gal = 660 lbs
  assert(Math.ceil(55 * 12.0) === 660, "55 gal Class 8 = 660 lbs");

  // Two 55-gal drums of Class 8 = 1,320 lbs — over 1,001
  assert(Math.ceil(110 * 12.0) === 1320, "110 gal Class 8 = 1,320 lbs (over threshold)");
}


// ============================================================
// RESULTS
// ============================================================
console.log("\n========================================");
console.log(`  PASSED: ${passed}`);
console.log(`  FAILED: ${failed}`);
console.log(`  TOTAL:  ${passed + failed}`);
console.log("========================================");

if (failures.length > 0) {
  console.log("\nFailed tests:");
  failures.forEach((f) => console.log(f));
}

process.exit(failed > 0 ? 1 : 0);
