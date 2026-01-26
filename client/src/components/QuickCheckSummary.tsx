import { Card } from "@/components/ui/card";
import { Package, Scale, MapPin, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

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

interface QuickCheckSummaryProps {
  materials: Material[];
}

export default function QuickCheckSummary({ materials }: QuickCheckSummaryProps) {
  const { t } = useLanguage();
  
  if (materials.length === 0) {
    return null;
  }

  const totalWeight = materials.reduce((sum, m) => sum + parseFloat(m.weight || "0"), 0);
  const totalContainers = materials.reduce((sum, m) => sum + m.quantity, 0);
  const uniqueStops = new Set(materials.map(m => m.stopNumber)).size;
  const uniqueClasses = new Set(materials.map(m => m.hazardClass.split(".")[0])).size;
  const hasBulk = materials.some(m => m.containerType === "bulk");
  const hasPIH = materials.some(m => m.poisonInhalationHazard);

  return (
    <Card className="p-4 mb-4 bg-primary/10 border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">{t("quick.title")}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("quick.materials")}:</span>
          <span className="font-semibold" data-testid="text-quick-materials-count">{materials.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("quick.weight")}:</span>
          <span className="font-semibold" data-testid="text-quick-total-weight">{totalWeight.toLocaleString()} lbs</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("quick.containers")}:</span>
          <span className="font-semibold" data-testid="text-quick-containers-count">{totalContainers}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("quick.stops")}:</span>
          <span className="font-semibold" data-testid="text-quick-stops-count">{uniqueStops}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-primary/20 flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-muted" data-testid="badge-hazard-classes">
          {uniqueClasses} {uniqueClasses !== 1 ? t("quick.hazardClassesPlural") : t("quick.hazardClasses")}
        </span>
        {hasBulk && (
          <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-700 dark:text-orange-300" data-testid="badge-has-bulk">
            {t("quick.bulk")}
          </span>
        )}
        {hasPIH && (
          <span className="px-2 py-1 rounded bg-destructive/20 text-destructive flex items-center gap-1" data-testid="badge-has-pih">
            <AlertTriangle className="w-3 h-3" />
            {t("quick.pih")}
          </span>
        )}
      </div>
    </Card>
  );
}
