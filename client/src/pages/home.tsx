import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialInput from "@/components/MaterialInput";
import MaterialList from "@/components/MaterialList";
import PlacardDisplay from "@/components/PlacardDisplay";
import ReferenceGuide from "@/components/ReferenceGuide";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import QuickCheckSummary from "@/components/QuickCheckSummary";
import { AlertTriangle, WifiOff } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { usePersistedMaterials } from "@/hooks/use-persisted-materials";

export default function Home() {
  const { t } = useLanguage();
  const {
    materials,
    loaded,
    addMaterial,
    addMaterials,
    updateMaterial,
    removeMaterial,
    clearAll,
  } = usePersistedMaterials();

  const [editingMaterial, setEditingMaterial] = useState<
    (typeof materials)[number] | null
  >(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Listen for online/offline events
  useState(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  });

  const handleAddMaterial = (
    material: Omit<(typeof materials)[number], "id">
  ) => {
    addMaterial(material);
  };

  const handleAddMaterials = (
    newMaterials: Omit<(typeof materials)[number], "id">[]
  ) => {
    addMaterials(newMaterials);
  };

  const handleEditMaterial = (material: (typeof materials)[number]) => {
    setEditingMaterial(material);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateMaterial = (
    updatedMaterial: (typeof materials)[number]
  ) => {
    updateMaterial(updatedMaterial);
    setEditingMaterial(null);
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
  };

  const handleRemoveMaterial = (id: string) => {
    removeMaterial(id);
    if (editingMaterial?.id === id) {
      setEditingMaterial(null);
    }
  };

  const handleClearAll = () => {
    clearAll();
    setEditingMaterial(null);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold" data-testid="text-app-title">
              {t("app.title")}
            </h1>
            {isOffline && (
              <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
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
            <TabsTrigger
              value="materials"
              data-testid="tab-materials"
              className="text-lg py-4"
            >
              {t("tabs.materials")}
            </TabsTrigger>
            <TabsTrigger
              value="placards"
              data-testid="tab-placards"
              className="text-lg py-4"
            >
              {t("tabs.placards")}
            </TabsTrigger>
            <TabsTrigger
              value="reference"
              data-testid="tab-reference"
              className="text-lg py-4"
            >
              {t("tabs.reference")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {t("materials.add.title")}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("materials.add.description")}
              </p>
              <MaterialInput
                onAddMaterial={handleAddMaterial}
                onAddMaterials={handleAddMaterials}
                editingMaterial={editingMaterial}
                onUpdateMaterial={handleUpdateMaterial}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">
                {t("materials.current.title")}
              </h2>
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
              <h2 className="text-xl font-semibold mb-2">
                {t("placards.title")}
              </h2>
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
