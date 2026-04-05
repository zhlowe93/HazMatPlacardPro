/**
 * Constrained Validation Layer
 * Validates GPT-4o scan results against known DOT/EPA code tables.
 * Catches OCR misreads before the driver sees them.
 */

// Valid DOT hazard classes
const VALID_HAZARD_CLASSES = [
  "1.1","1.2","1.3","1.4","1.5","1.6",
  "2.1","2.2","2.3",
  "3",
  "4.1","4.2","4.3",
  "5.1","5.2",
  "6.1",
  "7",
  "8",
  "9"
];

// Valid container type codes (EPA Form 8700-22 Table I)
const VALID_CONTAINER_CODES = [
  "BA", "CF", "CM", "CW", "CY", "DF", "DM", "DT", "DW", "HG", "TC", "TT"
];

// Valid unit of measure codes (EPA Form 8700-22 Table II)
const VALID_UNIT_CODES = ["G", "K", "L", "M", "N", "P", "T", "V"];

// Valid packing groups
const VALID_PACKING_GROUPS = ["I", "II", "III", "N/A"];

// Common OCR misreads and their corrections
const HAZARD_CLASS_CORRECTIONS: Record<string, string> = {
  "3.1": "4.1",  // Common misread
  "3.2": "4.2",
  "3.3": "4.3",
  "6.2": "6.1",
  "5.3": "5.2",
};

const CONTAINER_CODE_CORRECTIONS: Record<string, string> = {
  "DN": "DM",  // Metal drum misread
  "0M": "DM",  // Zero vs D
  "OM": "DM",  // O vs D
  "OF": "DF",  // O vs D
  "0F": "DF",  // Zero vs D
  "OW": "DW",  // O vs D
  "0W": "DW",  // Zero vs D
  "CN": "CM",  // N vs M
  "0Y": "CY",  // Zero vs C
  "TI": "TT",  // I vs T
};

const UNIT_CODE_CORRECTIONS: Record<string, string> = {
  "R": "P",   // R vs P misread
  "F": "P",   // F vs P misread
  "0": "G",   // Zero vs G
  "I": "L",   // I vs L misread
  "S": "K",   // Possible misread
};

export interface ValidationResult {
  field: string;
  original: string;
  corrected: string | null;
  status: "valid" | "corrected" | "invalid" | "missing";
  message: string;
}

export interface ValidatedMaterial {
  unNumber: string | null;
  materialName: string | null;
  hazardClass: string | null;
  subsidiaryClass: string | null;
  packingGroup: string | null;
  weight: string | null;
  weightUnit: string | null;
  quantity: number | null;
  containerType: "bulk" | "non-bulk" | null;
  confidence: "high" | "medium" | "low";
  notes: string | null;
  validationIssues: ValidationResult[];
}

/**
 * Validate UN/NA number format
 */
function validateUNNumber(value: string | null): ValidationResult {
  if (!value) {
    return { field: "unNumber", original: "", corrected: null, status: "missing", message: "No UN/NA number found" };
  }
  
  const cleaned = value.trim().toUpperCase().replace(/\s/g, "");
  
  // Check format: UN or NA followed by 4 digits
  const match = cleaned.match(/^(UN|NA)\s*(\d{4})$/);
  if (match) {
    const corrected = `${match[1]}${match[2]}`;
    return { field: "unNumber", original: value, corrected, status: corrected !== value ? "corrected" : "valid", message: "Valid UN/NA number" };
  }
  
  // Try to extract digits if format is wrong
  const digits = cleaned.replace(/[^0-9]/g, "");
  if (digits.length === 4) {
    const prefix = cleaned.startsWith("NA") ? "NA" : "UN";
    return { field: "unNumber", original: value, corrected: `${prefix}${digits}`, status: "corrected", message: `Reformatted to ${prefix}${digits}` };
  }
  
  return { field: "unNumber", original: value, corrected: null, status: "invalid", message: `Unrecognized format: "${value}"` };
}

/**
 * Validate hazard class against known DOT classes
 */
function validateHazardClass(value: string | null): ValidationResult {
  if (!value) {
    return { field: "hazardClass", original: "", corrected: null, status: "missing", message: "No hazard class found" };
  }
  
  const cleaned = value.trim();
  
  if (VALID_HAZARD_CLASSES.includes(cleaned)) {
    return { field: "hazardClass", original: value, corrected: cleaned, status: "valid", message: "Valid hazard class" };
  }
  
  // Check corrections table
  if (HAZARD_CLASS_CORRECTIONS[cleaned]) {
    const corrected = HAZARD_CLASS_CORRECTIONS[cleaned];
    return { field: "hazardClass", original: value, corrected, status: "corrected", message: `Corrected from ${value} to ${corrected}` };
  }
  
  return { field: "hazardClass", original: value, corrected: null, status: "invalid", message: `Invalid hazard class: "${value}". Valid: ${VALID_HAZARD_CLASSES.join(", ")}` };
}

/**
 * Validate packing group
 */
function validatePackingGroup(value: string | null): ValidationResult {
  if (!value) {
    return { field: "packingGroup", original: "", corrected: "N/A", status: "corrected", message: "No packing group — defaulting to N/A" };
  }
  
  const cleaned = value.trim().toUpperCase();
  
  if (VALID_PACKING_GROUPS.includes(cleaned)) {
    return { field: "packingGroup", original: value, corrected: cleaned, status: "valid", message: "Valid packing group" };
  }
  
  // Common misreads
  if (cleaned === "1" || cleaned === "L") return { field: "packingGroup", original: value, corrected: "I", status: "corrected", message: "Corrected to PG I" };
  if (cleaned === "11" || cleaned === "LL") return { field: "packingGroup", original: value, corrected: "II", status: "corrected", message: "Corrected to PG II" };
  if (cleaned === "111" || cleaned === "LLL") return { field: "packingGroup", original: value, corrected: "III", status: "corrected", message: "Corrected to PG III" };
  
  return { field: "packingGroup", original: value, corrected: null, status: "invalid", message: `Invalid packing group: "${value}"` };
}

/**
 * Validate weight unit code against Table II
 */
function validateWeightUnit(value: string | null): ValidationResult {
  if (!value) {
    return { field: "weightUnit", original: "", corrected: null, status: "missing", message: "No unit code found" };
  }
  
  const cleaned = value.trim().toUpperCase();
  
  if (VALID_UNIT_CODES.includes(cleaned)) {
    return { field: "weightUnit", original: value, corrected: cleaned, status: "valid", message: "Valid unit code" };
  }
  
  if (UNIT_CODE_CORRECTIONS[cleaned]) {
    const corrected = UNIT_CODE_CORRECTIONS[cleaned];
    return { field: "weightUnit", original: value, corrected, status: "corrected", message: `Corrected from "${value}" to "${corrected}"` };
  }
  
  return { field: "weightUnit", original: value, corrected: null, status: "invalid", message: `Unrecognized unit code: "${value}". Valid: ${VALID_UNIT_CODES.join(", ")}` };
}

/**
 * Main validation function — runs all checks on a single extracted material
 */
export function validateMaterial(material: any): ValidatedMaterial {
  const issues: ValidationResult[] = [];
  
  // Validate each field
  const unCheck = validateUNNumber(material.unNumber);
  issues.push(unCheck);
  
  const classCheck = validateHazardClass(material.hazardClass);
  issues.push(classCheck);
  
  const subClassCheck = material.subsidiaryClass 
    ? validateHazardClass(material.subsidiaryClass) 
    : { field: "subsidiaryClass", original: "", corrected: null, status: "valid" as const, message: "No subsidiary class" };
  if (material.subsidiaryClass) {
    subClassCheck.field = "subsidiaryClass";
    issues.push(subClassCheck);
  }
  
  const pgCheck = validatePackingGroup(material.packingGroup);
  issues.push(pgCheck);
  
  const unitCheck = validateWeightUnit(material.weightUnit);
  issues.push(unitCheck);
  
  // Determine overall confidence based on validation results
  const hasInvalid = issues.some(i => i.status === "invalid");
  const hasCorrected = issues.some(i => i.status === "corrected");
  const hasMissing = issues.some(i => i.status === "missing" && ["hazardClass", "unNumber"].includes(i.field));
  
  let confidence: "high" | "medium" | "low" = material.confidence || "high";
  if (hasInvalid || hasMissing) confidence = "low";
  else if (hasCorrected) confidence = confidence === "high" ? "medium" : confidence;
  
  // Build corrected material
  const validated: ValidatedMaterial = {
    unNumber: unCheck.corrected || material.unNumber,
    materialName: material.materialName,
    hazardClass: classCheck.corrected || material.hazardClass,
    subsidiaryClass: subClassCheck.corrected || material.subsidiaryClass,
    packingGroup: pgCheck.corrected || material.packingGroup,
    weight: material.weight,
    weightUnit: unitCheck.corrected || material.weightUnit,
    quantity: material.quantity,
    containerType: material.containerType,
    confidence,
    notes: material.notes,
    validationIssues: issues.filter(i => i.status !== "valid"),
  };
  
  // Append validation notes
  const corrections = issues.filter(i => i.status === "corrected");
  const invalids = issues.filter(i => i.status === "invalid");
  
  if (corrections.length > 0 || invalids.length > 0) {
    const noteLines: string[] = [];
    if (validated.notes) noteLines.push(validated.notes);
    corrections.forEach(c => noteLines.push(`⚠ Auto-corrected: ${c.message}`));
    invalids.forEach(c => noteLines.push(`❌ Needs review: ${c.message}`));
    validated.notes = noteLines.join(" | ");
  }
  
  return validated;
}

/**
 * Validate all materials from a scan result
 */
export function validateScanResult(materials: any[]): ValidatedMaterial[] {
  return materials.map(m => validateMaterial(m));
}
