import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getPlacardColor, isTable1Material, getHazardClassInfo } from "@/lib/hazmat-data";

// Diamond-shaped DOT placard component
interface DiamondPlacardProps {
  hazardClass: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const DiamondPlacard = ({ hazardClass, className = "", size = "md" }: DiamondPlacardProps) => {
  const classInfo = getHazardClassInfo(hazardClass);
  const bgColor = getPlacardColor(hazardClass);
  
  // Size variants
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40"
  };
  
  // Determine text color based on background
  const getTextColor = (hazClass: string) => {
    // Classes with white background need dark text
    if (["2.2", "2.3", "6.1", "8", "9"].includes(hazClass)) {
      return "text-black";
    }
    // Classes with dark background need light text
    return "text-white dark:text-white";
  };
  
  const textColor = getTextColor(hazardClass);
  
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* Outer diamond (rotated square) */}
      <div className="w-full h-full relative">
        <div className={`absolute inset-0 rotate-45 ${bgColor} border-4 border-black flex items-center justify-center`}>
          {/* Inner content (rotated back to be readable) */}
          <div className="-rotate-45 flex flex-col items-center justify-center w-full h-full p-2">
            {/* Hazard class name at top */}
            <div className={`text-xs font-bold ${textColor} text-center leading-tight mb-1`}>
              {classInfo?.name.toUpperCase() || `CLASS ${hazardClass}`}
            </div>
            
            {/* Class number at bottom (larger) */}
            <div className={`text-3xl font-black ${textColor} mt-auto`}>
              {hazardClass}
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
      reason: "Cannot use DANGEROUS placard when bulk containers are present (must use specific placards)",
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
    reason: "DANGEROUS placard may be used instead of specific placards (non-bulk, multiple Table 2 classes, all <2,205 lbs at any single stop)",
    specificPlacardRequired: [],
  };
};

const calculatePlacardRequirements = (materials: Material[]): PlacardRequirement[] => {
  const classTotals = new Map<string, number>();
  const classHasBulk = new Map<string, boolean>();
  
  materials.forEach((material) => {
    const total = parseFloat(material.weight) * material.quantity;
    const current = classTotals.get(material.hazardClass) || 0;
    classTotals.set(material.hazardClass, current + total);
    
    if (material.containerType === "bulk") {
      classHasBulk.set(material.hazardClass, true);
    }
  });

  const requirements: PlacardRequirement[] = [];
  const table2Threshold = 1001;

  classTotals.forEach((weight, hazardClass) => {
    const isTable1 = isTable1Material(hazardClass);
    const hasBulk = classHasBulk.get(hazardClass) || false;
    
    const required = isTable1 || (hasBulk && !isTable1) || weight >= table2Threshold;
    
    let reason = "";
    if (isTable1) {
      reason = `Table 1 material - placard required at any quantity (${weight.toFixed(0)} lbs)`;
    } else if (hasBulk) {
      reason = `Bulk container (Table 2) - placard required at any quantity (${weight.toFixed(0)} lbs)`;
    } else if (required) {
      reason = `${weight.toFixed(0)} lbs exceeds ${table2Threshold} lbs threshold (Table 2, non-bulk)`;
    } else {
      reason = `${weight.toFixed(0)} lbs below ${table2Threshold} lbs threshold (Table 2, non-bulk)`;
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* DANGEROUS placard as diamond */}
              <div className="flex justify-center">
                <div className="w-32 h-32">
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rotate-45 bg-amber-400 border-4 border-black flex items-center justify-center">
                      <div className="-rotate-45 flex items-center justify-center w-full h-full">
                        <div className="text-lg font-black text-black text-center leading-tight">
                          DANGEROUS
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {requiredPlacards.map((req) => (
              <div
                key={req.hazardClass}
                className="space-y-3"
                data-testid={`placard-required-${req.hazardClass}`}
              >
                <div className="flex justify-center">
                  <DiamondPlacard hazardClass={req.hazardClass} size="md" />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
                    <p className="font-semibold text-sm">{req.label}</p>
                    {req.isTable1 && (
                      <Badge variant="destructive" className="text-xs">
                        Table 1
                      </Badge>
                    )}
                    {req.isBulk && !req.isTable1 && (
                      <Badge variant="secondary" className="text-xs">
                        Bulk
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
