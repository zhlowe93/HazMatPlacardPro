import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialInput from "@/components/MaterialInput";
import MaterialList from "@/components/MaterialList";
import PlacardDisplay from "@/components/PlacardDisplay";
import ReferenceGuide from "@/components/ReferenceGuide";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import QuickCheckSummary from "@/components/QuickCheckSummary";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

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
}

export default function Home() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const handleAddMaterial = (material: Omit<Material, "id">) => {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
    };
    setMaterials((prev) => [...prev, newMaterial]);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateMaterial = (updatedMaterial: Material) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === updatedMaterial.id ? updatedMaterial : m))
    );
    setEditingMaterial(null);
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    if (editingMaterial?.id === id) {
      setEditingMaterial(null);
    }
  };

  const handleClearAll = () => {
    setMaterials([]);
    setEditingMaterial(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold" data-testid="text-app-title">
              {t("app.title")}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl pb-24">
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-16 sticky top-16 z-40 bg-muted shadow-sm">
            <TabsTrigger value="materials" data-testid="tab-materials" className="text-lg py-4">
              {t("tabs.materials")}
            </TabsTrigger>
            <TabsTrigger value="placards" data-testid="tab-placards" className="text-lg py-4">
              {t("tabs.placards")}
            </TabsTrigger>
            <TabsTrigger value="reference" data-testid="tab-reference" className="text-lg py-4">
              {t("tabs.reference")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t("materials.add.title")}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("materials.add.description")}
              </p>
              <MaterialInput 
                onAddMaterial={handleAddMaterial}
                editingMaterial={editingMaterial}
                onUpdateMaterial={handleUpdateMaterial}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("materials.current.title")}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("materials.current.description")}
              </p>
              <MaterialList 
                materials={materials} 
                onRemoveMaterial={handleRemoveMaterial}
                onEditMaterial={handleEditMaterial}
                onClearAll={handleClearAll}
              />
            </div>
          </TabsContent>

          <TabsContent value="placards" className="space-y-6">
            <div>
              <QuickCheckSummary materials={materials} />
              <h2 className="text-xl font-semibold mb-2">{t("placards.title")}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("placards.description")}
              </p>
              <PlacardDisplay materials={materials} />
            </div>
          </TabsContent>

          <TabsContent value="reference" className="space-y-6">
            <ReferenceGuide />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
