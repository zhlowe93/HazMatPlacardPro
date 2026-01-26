import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, AlertTriangle, X } from "lucide-react";
import { getPlacardColor, isTable1Material } from "@/lib/hazmat-data";

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
  poisonInhalationHazard: boolean;
}

interface MaterialListProps {
  materials: Material[];
  onRemoveMaterial: (id: string) => void;
  onEditMaterial: (material: Material) => void;
  onClearAll?: () => void;
}

const getHazardClassColor = (hazardClass: string): string => {
  const baseColor = getPlacardColor(hazardClass);
  const classNum = parseFloat(hazardClass);
  
  if (baseColor.includes("white")) return `${baseColor} text-black border border-black`;
  if (classNum >= 5 && classNum < 6) return `${baseColor} text-black`;
  if (classNum === 7) return `${baseColor} text-black`;
  return `${baseColor} text-white`;
};

export default function MaterialList({ materials, onRemoveMaterial, onEditMaterial, onClearAll }: MaterialListProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    (sum, m) => sum + parseFloat(m.weight),
    0
  );

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
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

        {onClearAll && (
          <div className="mt-4 pt-4 border-t">
            {!showClearConfirm ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowClearConfirm(true)}
                className="w-full h-14 text-destructive border-destructive/30 hover:bg-destructive/10"
                data-testid="button-clear-all"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear All Materials
              </Button>
            ) : (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 space-y-3" data-testid="confirm-clear-dialog">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Clear all {materials.length} materials?</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will remove all materials from your current load. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleClearAll}
                    className="flex-1 h-14"
                    data-testid="button-confirm-clear"
                  >
                    Yes, Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 h-14"
                    data-testid="button-cancel-clear"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
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
                  <Badge variant="outline" className="text-xs font-mono" data-testid={`badge-stop-${material.id}`}>
                    Stop {material.stopNumber}
                  </Badge>
                  {material.poisonInhalationHazard && (
                    <Badge variant="destructive" className="text-xs" data-testid={`badge-pih-${material.id}`}>
                      PIH
                    </Badge>
                  )}
                  {(isTable1Material(material.hazardClass) || material.poisonInhalationHazard) && (
                    <Badge variant="destructive" className="text-xs">
                      Table 1
                    </Badge>
                  )}
                  {material.containerType === "bulk" && (
                    <Badge variant="secondary" className="text-xs">
                      Bulk
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg" data-testid={`text-material-name-${material.id}`}>
                  {material.materialName}
                </h3>
                
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>PG: {material.packingGroup}</span>
                  <span className="font-mono">
                    {parseFloat(material.weight).toLocaleString()} lbs ({material.quantity} container{material.quantity !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditMaterial(material)}
                  data-testid={`button-edit-${material.id}`}
                  className="h-16 w-16"
                >
                  <Pencil className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveMaterial(material.id)}
                  data-testid={`button-remove-${material.id}`}
                  className="h-16 w-16 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="w-7 h-7" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
