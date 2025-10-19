import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
}

const getPlacardColor = (hazardClass: string): string => {
  const classNum = parseFloat(hazardClass);
  if (classNum === 1) return "bg-orange-500";
  if (classNum >= 2 && classNum < 3) return "bg-yellow-500";
  if (classNum === 3) return "bg-red-500";
  if (classNum >= 4 && classNum < 5) return "bg-blue-500";
  if (classNum >= 5 && classNum < 6) return "bg-yellow-400";
  if (classNum >= 6 && classNum < 7) return "bg-white";
  if (classNum === 7) return "bg-yellow-300";
  if (classNum === 8) return "bg-white";
  if (classNum === 9) return "bg-white";
  return "bg-gray-500";
};

const calculatePlacardRequirements = (materials: Material[]): PlacardRequirement[] => {
  const classTotals = new Map<string, number>();
  
  materials.forEach((material) => {
    const total = parseFloat(material.weight) * material.quantity;
    const current = classTotals.get(material.hazardClass) || 0;
    classTotals.set(material.hazardClass, current + total);
  });

  const requirements: PlacardRequirement[] = [];
  const threshold = 1001;

  classTotals.forEach((weight, hazardClass) => {
    const required = weight >= threshold;
    requirements.push({
      hazardClass,
      label: `Class ${hazardClass}`,
      required,
      reason: required
        ? `${weight.toFixed(0)} lbs exceeds ${threshold} lbs threshold`
        : `${weight.toFixed(0)} lbs below ${threshold} lbs threshold`,
      color: getPlacardColor(hazardClass),
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
                  <p className="font-semibold text-sm">{req.label}</p>
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
                All materials are below the 1,001 lbs threshold
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
        <p className="text-xs text-muted-foreground">
          <strong>CFR 49 Regulation:</strong> Placards are required when transporting 1,001 pounds
          or more of a hazardous material of any single hazard class. Table 2 materials may have
          different requirements. Always verify with current DOT regulations.
        </p>
      </Card>
    </div>
  );
}
