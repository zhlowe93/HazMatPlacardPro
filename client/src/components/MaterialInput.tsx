import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface MaterialInputProps {
  onAddMaterial: (material: {
    unNumber: string;
    materialName: string;
    hazardClass: string;
    packingGroup: string;
    weight: string;
    quantity: number;
  }) => void;
}

const hazardClasses = [
  { value: "1", label: "Class 1 - Explosives" },
  { value: "2.1", label: "Class 2.1 - Flammable Gas" },
  { value: "2.2", label: "Class 2.2 - Non-Flammable Gas" },
  { value: "2.3", label: "Class 2.3 - Poison Gas" },
  { value: "3", label: "Class 3 - Flammable Liquid" },
  { value: "4.1", label: "Class 4.1 - Flammable Solid" },
  { value: "4.2", label: "Class 4.2 - Spontaneously Combustible" },
  { value: "4.3", label: "Class 4.3 - Dangerous When Wet" },
  { value: "5.1", label: "Class 5.1 - Oxidizer" },
  { value: "5.2", label: "Class 5.2 - Organic Peroxide" },
  { value: "6.1", label: "Class 6.1 - Poison" },
  { value: "7", label: "Class 7 - Radioactive" },
  { value: "8", label: "Class 8 - Corrosive" },
  { value: "9", label: "Class 9 - Miscellaneous" },
];

const packingGroups = [
  { value: "I", label: "Packing Group I - High Danger" },
  { value: "II", label: "Packing Group II - Medium Danger" },
  { value: "III", label: "Packing Group III - Low Danger" },
  { value: "N/A", label: "N/A - Not Applicable" },
];

export default function MaterialInput({ onAddMaterial }: MaterialInputProps) {
  const [unNumber, setUnNumber] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [hazardClass, setHazardClass] = useState("");
  const [packingGroup, setPackingGroup] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unNumber && materialName && hazardClass && packingGroup && weight) {
      onAddMaterial({
        unNumber,
        materialName,
        hazardClass,
        packingGroup,
        weight,
        quantity,
      });
      setUnNumber("");
      setMaterialName("");
      setHazardClass("");
      setPackingGroup("");
      setWeight("");
      setQuantity(1);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="un-number" className="text-base font-medium">
            UN Number
          </Label>
          <Input
            id="un-number"
            data-testid="input-un-number"
            placeholder="e.g., UN1203"
            value={unNumber}
            onChange={(e) => setUnNumber(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material-name" className="text-base font-medium">
            Material Name
          </Label>
          <Input
            id="material-name"
            data-testid="input-material-name"
            placeholder="e.g., Gasoline"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hazard-class" className="text-base font-medium">
            Hazard Class
          </Label>
          <Select value={hazardClass} onValueChange={setHazardClass}>
            <SelectTrigger
              id="hazard-class"
              data-testid="select-hazard-class"
              className="h-12 text-base"
            >
              <SelectValue placeholder="Select hazard class" />
            </SelectTrigger>
            <SelectContent>
              {hazardClasses.map((hc) => (
                <SelectItem key={hc.value} value={hc.value}>
                  {hc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="packing-group" className="text-base font-medium">
            Packing Group
          </Label>
          <Select value={packingGroup} onValueChange={setPackingGroup}>
            <SelectTrigger
              id="packing-group"
              data-testid="select-packing-group"
              className="h-12 text-base"
            >
              <SelectValue placeholder="Select packing group" />
            </SelectTrigger>
            <SelectContent>
              {packingGroups.map((pg) => (
                <SelectItem key={pg.value} value={pg.value}>
                  {pg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-base font-medium">
              Weight (lbs)
            </Label>
            <Input
              id="weight"
              data-testid="input-weight"
              type="number"
              step="0.01"
              placeholder="1000"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 text-base font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantity
            </Label>
            <Input
              id="quantity"
              data-testid="input-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="h-12 text-base font-mono"
            />
          </div>
        </div>

        <Button
          type="submit"
          data-testid="button-add-material"
          className="w-full h-12 text-base"
          size="default"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Material
        </Button>
      </form>
    </Card>
  );
}
