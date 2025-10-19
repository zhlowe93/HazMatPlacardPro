import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getPlacardColor, isTable1Material, getHazardClassInfo } from "@/lib/hazmat-data";

interface Material {
  id: string;
  unNumber: string;
  materialName: string;
  hazardClass: string;
  packingGroup: string;
  weight: string;
  quantity: number;
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
}

const calculatePlacardRequirements = (materials: Material[]): PlacardRequirement[] => {
  const classTotals = new Map<string, number>();
  
  materials.forEach((material) => {
    const total = parseFloat(material.weight) * material.quantity;
    const current = classTotals.get(material.hazardClass) || 0;
    classTotals.set(material.hazardClass, current + total);
  });

  const requirements: PlacardRequirement[] = [];
  const table2Threshold = 1001;

  classTotals.forEach((weight, hazardClass) => {
    const isTable1 = isTable1Material(hazardClass);
    const required = isTable1 || weight >= table2Threshold;
    
    let reason = "";
    if (isTable1) {
      reason = `Table 1 material - placard required at any quantity (${weight.toFixed(0)} lbs)`;
    } else if (required) {
      reason = `${weight.toFixed(0)} lbs exceeds ${table2Threshold} lbs threshold (Table 2)`;
    } else {
      reason = `${weight.toFixed(0)} lbs below ${table2Threshold} lbs threshold (Table 2)`;
    }

    requirements.push({
      hazardClass,
      label: `Class ${hazardClass}`,
      required,
      reason,
      color: getPlacardColor(hazardClass),
      isTable1,
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

  return (
    <div className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            {requiredPlacards.map((req) => (
              <div
                key={req.hazardClass}
                className="space-y-2"
                data-testid={`placard-required-${req.hazardClass}`}
              >
                <div
                  className={`${req.color} aspect-square rounded-md flex items-center justify-center border-2 border-black`}
                >
                  <div className="text-center rotate-45">
                    <div className="text-4xl font-bold text-black -rotate-45">
                      {req.hazardClass}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <p className="font-semibold text-sm">{req.label}</p>
                    {req.isTable1 && (
                      <Badge variant="destructive" className="text-xs">
                        Table 1
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
