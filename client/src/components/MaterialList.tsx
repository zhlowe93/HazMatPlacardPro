import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { getPlacardColor, isTable1Material } from "@/lib/hazmat-data";

interface Material {
  id: string;
  unNumber: string;
  materialName: string;
  hazardClass: string;
  packingGroup: string;
  weight: string;
  quantity: number;
}

interface MaterialListProps {
  materials: Material[];
  onRemoveMaterial: (id: string) => void;
}

const getHazardClassColor = (hazardClass: string): string => {
  const baseColor = getPlacardColor(hazardClass);
  const classNum = parseFloat(hazardClass);
  
  if (baseColor.includes("white")) return `${baseColor} text-black border border-black`;
  if (classNum >= 5 && classNum < 6) return `${baseColor} text-black`;
  if (classNum === 7) return `${baseColor} text-black`;
  return `${baseColor} text-white`;
};

export default function MaterialList({ materials, onRemoveMaterial }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground text-base">
          No materials added yet. Add your first hazmat material above.
        </p>
      </Card>
    );
  }

  const totalWeight = materials.reduce(
    (sum, m) => sum + parseFloat(m.weight) * m.quantity,
    0
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Materials</p>
            <p className="text-2xl font-bold font-mono" data-testid="text-total-materials">
              {materials.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Weight</p>
            <p className="text-2xl font-bold font-mono" data-testid="text-total-weight">
              {totalWeight.toFixed(2)} lbs
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {materials.map((material) => (
          <Card key={material.id} className="p-4" data-testid={`card-material-${material.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`${getHazardClassColor(material.hazardClass)} font-mono text-sm`}
                    data-testid={`badge-class-${material.id}`}
                  >
                    Class {material.hazardClass}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-sm">
                    {material.unNumber}
                  </Badge>
                  {isTable1Material(material.hazardClass) && (
                    <Badge variant="destructive" className="text-xs">
                      Table 1
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg" data-testid={`text-material-name-${material.id}`}>
                  {material.materialName}
                </h3>
                
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>PG: {material.packingGroup}</span>
                  <span className="font-mono">
                    {material.quantity} × {parseFloat(material.weight).toFixed(2)} lbs
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveMaterial(material.id)}
                data-testid={`button-remove-${material.id}`}
                className="shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
