import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialInput from "@/components/MaterialInput";
import MaterialList from "@/components/MaterialList";
import PlacardDisplay from "@/components/PlacardDisplay";
import ReferenceGuide from "@/components/ReferenceGuide";
import ThemeToggle from "@/components/ThemeToggle";
import { AlertTriangle } from "lucide-react";

interface Material {
  id: string;
  unNumber: string;
  materialName: string;
  hazardClass: string;
  packingGroup: string;
  weight: string;
  quantity: number;
}

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>([]);

  const handleAddMaterial = (material: Omit<Material, "id">) => {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
    };
    setMaterials((prev) => [...prev, newMaterial]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold" data-testid="text-app-title">
              Hazmat Placard
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="materials" data-testid="tab-materials" className="text-base">
              Materials
            </TabsTrigger>
            <TabsTrigger value="placards" data-testid="tab-placards" className="text-base">
              Placards
            </TabsTrigger>
            <TabsTrigger value="reference" data-testid="tab-reference" className="text-base">
              Reference
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Add Hazmat Material</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the details of each hazardous material you're transporting
              </p>
              <MaterialInput onAddMaterial={handleAddMaterial} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Current Load</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Review and manage your hazmat materials
              </p>
              <MaterialList materials={materials} onRemoveMaterial={handleRemoveMaterial} />
            </div>
          </TabsContent>

          <TabsContent value="placards" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Placard Requirements</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Based on CFR 49 regulations and your current load
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
