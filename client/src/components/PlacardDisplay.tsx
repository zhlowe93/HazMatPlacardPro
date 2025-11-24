import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Skull, 
  Droplet,
  Zap,
  CircleDot,
  Cylinder,
  RadiationIcon
} from "lucide-react";
import { getPlacardColor, isTable1Material, getHazardClassInfo } from "@/lib/hazmat-data";

// Diamond-shaped DOT placard component
interface DiamondPlacardProps {
  hazardClass: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  unNumber?: string; // UN identification number for bulk containers (49 CFR 172.336)
}

// Get the appropriate hazard symbol icon for each class
const getHazardIcon = (hazardClass: string) => {
  const classNum = parseFloat(hazardClass);
  
  // Class 1 - Explosives (bomb/explosion)
  if (classNum >= 1 && classNum < 2) {
    return <Zap className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 2.1 - Flammable Gas (flame)
  if (hazardClass === "2.1") {
    return <Flame className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 2.2 - Non-Flammable Gas (cylinder)
  if (hazardClass === "2.2") {
    return <Cylinder className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 2.3 - Poison Gas (skull)
  if (hazardClass === "2.3") {
    return <Skull className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 3 - Flammable Liquid (flame)
  if (classNum === 3) {
    return <Flame className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 4 - Flammable Solids (flame)
  if (classNum >= 4 && classNum < 5) {
    return <Flame className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 5 - Oxidizers (flame over circle)
  if (classNum >= 5 && classNum < 6) {
    return (
      <div className="relative">
        <CircleDot className="w-8 h-8" strokeWidth={3} />
        <Flame className="w-4 h-4 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1" strokeWidth={3} />
      </div>
    );
  }
  
  // Class 6.1 - Poison/Toxic (skull)
  if (classNum >= 6 && classNum < 7) {
    return <Skull className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 7 - Radioactive (trefoil/radiation)
  if (classNum === 7) {
    return <RadiationIcon className="w-8 h-8" strokeWidth={3} />;
  }
  
  // Class 8 - Corrosive (droplet on hand/surface)
  if (classNum === 8) {
    return (
      <div className="relative">
        <Droplet className="w-8 h-8" strokeWidth={3} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-current" />
      </div>
    );
  }
  
  // Class 9 - Miscellaneous (stripes)
  if (classNum === 9) {
    return (
      <div className="flex gap-0.5">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-0.5 h-8 bg-current" />
        ))}
      </div>
    );
  }
  
  return null;
};

const DiamondPlacard = ({ hazardClass, className = "", size = "md", unNumber }: DiamondPlacardProps) => {
  const classInfo = getHazardClassInfo(hazardClass);
  const bgColor = getPlacardColor(hazardClass);
  
  // Size variants matching DOT specs (250mm = ~10 inches minimum)
  const sizeClasses = {
    sm: "w-28 h-28",
    md: "w-40 h-40",
    lg: "w-48 h-48"
  };
  
  // Determine text and border colors based on hazard class
  const getColors = (hazClass: string) => {
    // Class 8 (Corrosive) has special top/bottom color scheme
    if (hazClass === "8") {
      return {
        text: "text-black",
        border: "border-black",
        innerBorder: "border-black"
      };
    }
    // Classes with white/light backgrounds need dark text
    if (["2.2", "2.3", "6.1", "9"].includes(hazClass)) {
      return {
        text: "text-black",
        border: "border-black",
        innerBorder: "border-black"
      };
    }
    // Classes with dark backgrounds (red, blue, orange) need white text
    return {
      text: "text-white dark:text-white",
      border: "border-black",
      innerBorder: "border-white"
    };
  };
  
  const colors = getColors(hazardClass);
  
  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Outer diamond container with background to block any text behind */}
      <div className="w-full h-full relative bg-background overflow-hidden">
        {/* Rotated square creating diamond shape */}
        <div className={`absolute inset-0 rotate-45 ${bgColor} border-[5px] ${colors.border} z-10`}>
          {/* Inner border (12.5mm from edge per CFR spec) */}
          <div className={`absolute inset-[8%] border-2 ${colors.innerBorder}`}>
            {/* Content area (rotated back to be readable) */}
            <div className="-rotate-45 flex flex-col items-center justify-between h-full w-full p-1">
              {/* UN Number for bulk containers (49 CFR 172.336) - displayed at top in white */}
              {unNumber && (
                <div className="w-full flex items-center justify-center text-white dark:text-white text-lg font-black leading-none pt-1">
                  {unNumber}
                </div>
              )}
              
              {/* Upper half: Hazard symbol and name */}
              <div className={`flex-1 flex flex-col items-center justify-center ${colors.text} gap-1`}>
                {/* Hazard icon symbol */}
                <div className="flex items-center justify-center">
                  {getHazardIcon(hazardClass)}
                </div>
                {/* Hazard class name */}
                <div className="text-center px-1">
                  <div className="text-[9px] font-black leading-tight tracking-tight">
                    {classInfo?.name.toUpperCase().replace("EXPLOSIVES", "EXPLOSIVE")}
                  </div>
                </div>
              </div>
              
              {/* Lower section: Class number (per CFR 172.519) */}
              <div className={`w-full flex items-center justify-center ${colors.text} text-4xl font-black leading-none pb-1`}>
                {hazardClass}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Material {
  id: string;
  unNumber: string;
  materialName: string;
  hazardClass: string;
  packingGroup: string;
  weight: string;
  quantity: number;
  containerType: "bulk" | "non-bulk";
  stopNumber: number;
}

interface PlacardDisplayProps {
  materials: Material[];
}

interface PlacardRequirement {
  hazardClass: string;
  label: string;
  required: boolean;
  reason: string;
  color: string;
  isTable1: boolean;
  isBulk: boolean;
  weight: number;
  unNumber?: string; // UN number to display on placard for bulk containers
}

interface DangerousPlacardEligibility {
  canUse: boolean;
  reason: string;
  specificPlacardRequired: string[];
}

const calculateDangerousPlacardEligibility = (
  requirements: PlacardRequirement[],
  materials: Material[]
): DangerousPlacardEligibility => {
  const requiredPlacards = requirements.filter((r) => r.required);
  const hasTable1 = requirements.some((r) => r.isTable1);
  const hasBulk = materials.some((m) => m.containerType === "bulk");
  
  // Check ALL Table 2 classes present (not just required ones)
  const allTable2Classes = requirements.filter((r) => !r.isTable1);
  const requiredTable2Classes = allTable2Classes.filter((r) => r.required);
  
  // Calculate per-stop weights for each class
  // DOT rule: 2,205 lbs threshold is PER LOADING FACILITY (stop number)
  const stopClassWeights = new Map<string, number>();
  materials.forEach((material) => {
    const key = `${material.stopNumber}-${material.hazardClass}`;
    const total = parseFloat(material.weight) * material.quantity;
    const current = stopClassWeights.get(key) || 0;
    stopClassWeights.set(key, current + total);
  });
  
  // Find classes that exceed 2,205 lbs at ANY SINGLE STOP
  const classesOver2205AtOneStop = new Set<string>();
  stopClassWeights.forEach((weight, key) => {
    if (weight >= 2205) {
      const hazardClass = key.split('-')[1];
      classesOver2205AtOneStop.add(hazardClass);
    }
  });
  
  const over2205lbs = allTable2Classes.filter((r) => classesOver2205AtOneStop.has(r.hazardClass));

  // Cannot use DANGEROUS if any Table 1 material
  if (hasTable1) {
    return {
      canUse: false,
      reason: "Cannot use DANGEROUS placard when Table 1 materials are present (must use specific placards)",
      specificPlacardRequired: [],
    };
  }

  // Cannot use DANGEROUS if any bulk containers
  if (hasBulk) {
    return {
      canUse: false,
      reason: "Cannot use DANGEROUS placard when containers above 85 gallons are present (must use specific placards)",
      specificPlacardRequired: [],
    };
  }

  // Need at least 2 different Table 2 classes AND at least one must meet placard threshold
  if (allTable2Classes.length < 2) {
    return {
      canUse: false,
      reason: allTable2Classes.length === 0 
        ? "No placards required"
        : "DANGEROUS placard only applies when multiple different Table 2 hazard classes are present",
      specificPlacardRequired: [],
    };
  }

  // Need at least one class to meet the placard threshold
  if (requiredTable2Classes.length === 0) {
    return {
      canUse: false,
      reason: "No placards required (all below 1,001 lbs threshold)",
      specificPlacardRequired: [],
    };
  }

  // If any class >= 2,205 lbs AT ONE STOP, must display that specific placard
  if (over2205lbs.length > 0) {
    const specificClasses = over2205lbs.map((r) => r.label);
    return {
      canUse: true,
      reason: `DANGEROUS placard may be used for remaining classes, but ${specificClasses.join(", ")} must display specific placard(s) (≥2,205 lbs at one stop)`,
      specificPlacardRequired: specificClasses,
    };
  }

  // Eligible to use DANGEROUS for all classes
  return {
    canUse: true,
    reason: "DANGEROUS placard may be used instead of specific placards (85 gal or below, multiple Table 2 classes, all <2,205 lbs at any single stop)",
    specificPlacardRequired: [],
  };
};

const calculatePlacardRequirements = (materials: Material[]): PlacardRequirement[] => {
  const classTotals = new Map<string, number>();
  const classHasBulk = new Map<string, boolean>();
  const classUnNumber = new Map<string, string>(); // Track UN number for bulk containers
  
  materials.forEach((material) => {
    const total = parseFloat(material.weight) * material.quantity;
    const current = classTotals.get(material.hazardClass) || 0;
    classTotals.set(material.hazardClass, current + total);
    
    // Per 49 CFR 172.336: UN number required on placard for bulk containers
    if (material.containerType === "bulk") {
      classHasBulk.set(material.hazardClass, true);
      // Store the first UN number found for this class in a bulk container
      if (!classUnNumber.has(material.hazardClass)) {
        classUnNumber.set(material.hazardClass, material.unNumber);
      }
    }
  });

  const requirements: PlacardRequirement[] = [];
  const table2Threshold = 1001;
  
  // CRITICAL: Per 49 CFR 172.504(c), the 1,001 lb threshold applies to the 
  // AGGREGATE GROSS WEIGHT of ALL Table 2 materials combined (not per class).
  // Calculate total weight of all Table 2 non-bulk materials on the vehicle.
  // IMPORTANT: Iterate through individual MATERIALS (not class totals) to correctly
  // handle cases where a class has both bulk and non-bulk packages.
  let table2NonBulkAggregateWeight = 0;
  materials.forEach((material) => {
    const isTable1 = isTable1Material(material.hazardClass);
    const isBulk = material.containerType === "bulk";
    
    // Add to aggregate only if Table 2 AND non-bulk
    if (!isTable1 && !isBulk) {
      const materialWeight = parseFloat(material.weight) * material.quantity;
      table2NonBulkAggregateWeight += materialWeight;
    }
  });
  
  // If aggregate of ALL Table 2 non-bulk materials >= 1,001 lbs,
  // then ALL Table 2 classes present require placards
  const table2AggregateExceedsThreshold = table2NonBulkAggregateWeight >= table2Threshold;

  classTotals.forEach((weight, hazardClass) => {
    const isTable1 = isTable1Material(hazardClass);
    const hasBulk = classHasBulk.get(hazardClass) || false;
    const unNumber = classUnNumber.get(hazardClass); // Get UN number if bulk container
    
    // Placard required if:
    // 1. Table 1 material (always required at any quantity), OR
    // 2. Bulk container with Table 2 material (always required at any quantity), OR
    // 3. Table 2 non-bulk AND aggregate of all Table 2 non-bulk >= 1,001 lbs
    const required = isTable1 || (hasBulk && !isTable1) || (!isTable1 && !hasBulk && table2AggregateExceedsThreshold);
    
    let reason = "";
    if (isTable1) {
      reason = `Table 1 material - placard required at any quantity (${weight.toFixed(0)} lbs)`;
    } else if (hasBulk) {
      reason = `Container above 85 gallons (Table 2) - placard required at any quantity (${weight.toFixed(0)} lbs)`;
    } else if (required) {
      reason = `Aggregate of all Table 2 materials (${table2NonBulkAggregateWeight.toFixed(0)} lbs) exceeds ${table2Threshold} lbs threshold (this class: ${weight.toFixed(0)} lbs)`;
    } else {
      reason = `Aggregate of all Table 2 materials (${table2NonBulkAggregateWeight.toFixed(0)} lbs) below ${table2Threshold} lbs threshold (this class: ${weight.toFixed(0)} lbs)`;
    }

    requirements.push({
      hazardClass,
      label: `Class ${hazardClass}`,
      required,
      reason,
      color: getPlacardColor(hazardClass),
      isTable1,
      isBulk: hasBulk,
      weight,
      unNumber, // Include UN number for bulk containers
    });
  });

  return requirements.sort((a, b) => parseFloat(a.hazardClass) - parseFloat(b.hazardClass));
};

export default function PlacardDisplay({ materials }: PlacardDisplayProps) {
  if (materials.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground text-base">
          Add materials to see placard requirements
        </p>
      </Card>
    );
  }

  const requirements = calculatePlacardRequirements(materials);
  const requiredPlacards = requirements.filter((r) => r.required);
  const notRequired = requirements.filter((r) => !r.required);
  const dangerousEligibility = calculateDangerousPlacardEligibility(requirements, materials);

  return (
    <div className="space-y-6">
      {dangerousEligibility.canUse && (
        <Card className="p-6 border-2 border-amber-500 bg-amber-50 dark:bg-amber-950">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100" data-testid="text-dangerous-option">
                DANGEROUS Placard Option Available
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {dangerousEligibility.reason}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {/* DANGEROUS placard as diamond - CFR 172.521 spec */}
              <div className="flex justify-center bg-background p-2 rounded-md">
                <div className="w-40 h-40 relative">
                  <div className="w-full h-full relative bg-background overflow-hidden">
                    {/* Outer border */}
                    <div className="absolute inset-0 rotate-45 border-[5px] border-black z-10">
                      {/* Red/white striped background per CFR spec */}
                      <div className="absolute inset-0 bg-white">
                        {/* Top triangle (red) */}
                        <div className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(50% 0%, 0% 50%, 100% 50%)' }} />
                        {/* Bottom triangle (red) */}
                        <div className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(0% 50%, 100% 50%, 50% 100%)' }} />
                      </div>
                      {/* Inner border */}
                      <div className="absolute inset-[8%] border-2 border-black">
                        {/* Content */}
                        <div className="-rotate-45 flex items-center justify-center h-full w-full">
                          <div className="text-sm font-black text-black text-center leading-tight">
                            DANGEROUS
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-xs border-amber-600 text-amber-900 dark:text-amber-100">
                  Optional Alternative
                </Badge>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  May replace specific placards shown below{dangerousEligibility.specificPlacardRequired.length > 0 && " (except those ≥2,205 lbs)"}
                </p>
              </div>
            </div>

            {dangerousEligibility.specificPlacardRequired.length > 0 && (
              <div className="space-y-2">
                <div className="bg-muted aspect-square rounded-md flex items-center justify-center p-4 border-2 border-dashed">
                  <p className="text-xs text-center text-muted-foreground">
                    <strong>Still Required:</strong><br />
                    {dangerousEligibility.specificPlacardRequired.join(", ")}<br />
                    (≥2,205 lbs)
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {requiredPlacards.length > 0 ? (
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold" data-testid="text-placards-required">
                Placards Required
              </h3>
              <p className="text-sm text-muted-foreground">
                Display these placards on all four sides of your vehicle
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {requiredPlacards.map((req) => (
              <div
                key={req.hazardClass}
                className="space-y-4 overflow-hidden"
                data-testid={`placard-required-${req.hazardClass}`}
              >
                <div className="flex justify-center bg-background p-2 rounded-md overflow-hidden">
                  <DiamondPlacard 
                    hazardClass={req.hazardClass} 
                    size="md"
                    unNumber={req.unNumber} 
                  />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                    <p className="font-semibold text-sm">{req.label}</p>
                    {req.unNumber && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {req.unNumber}
                      </Badge>
                    )}
                    {req.isTable1 && (
                      <Badge variant="destructive" className="text-xs">
                        Table 1
                      </Badge>
                    )}
                    {req.isBulk && !req.isTable1 && (
                      <Badge variant="secondary" className="text-xs">
                        Above 85 Gal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{req.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-2 border-chart-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-chart-2 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-chart-2" data-testid="text-no-placards">
                No Placards Required
              </h3>
              <p className="text-sm text-muted-foreground">
                All materials are below the 1,001 lbs threshold (Table 2)
              </p>
            </div>
          </div>
        </Card>
      )}

      {notRequired.length > 0 && (
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4">Below Threshold</h3>
          <div className="space-y-2">
            {notRequired.map((req) => (
              <div
                key={req.hazardClass}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
                data-testid={`placard-not-required-${req.hazardClass}`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {req.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{req.reason}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-chart-2" />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 bg-muted">
        <h4 className="text-sm font-semibold mb-2">CFR 49 Regulation Summary</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            <strong>Table 1 Materials:</strong> Placard required at any quantity (e.g., Class 2.3 Poison Gas, Class 4.3 Dangerous When Wet, certain Explosives)
          </p>
          <p>
            <strong>Table 2 Materials:</strong> Placard required when transporting 1,001 pounds or more of a single hazard class
          </p>
          <p className="mt-2">
            Always verify with current DOT regulations and your shipping papers. Some materials may have additional requirements.
          </p>
        </div>
      </Card>
    </div>
  );
}
