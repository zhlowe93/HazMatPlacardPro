import { useState, useEffect } from "react";
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
import { NumberStepper } from "@/components/ui/number-stepper";
import { Plus, Save, X } from "lucide-react";
import { getHazardClassOptions } from "@/lib/hazmat-data";

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

interface MaterialInputProps {
  onAddMaterial: (material: {
    unNumber: string;
    materialName: string;
    hazardClass: string;
    packingGroup: string;
    weight: string;
    quantity: number;
    containerType: "bulk" | "non-bulk";
    stopNumber: number;
  }) => void;
  editingMaterial?: Material | null;
  onUpdateMaterial?: (material: Material) => void;
  onCancelEdit?: () => void;
}

const hazardClasses = getHazardClassOptions();

const packingGroups = [
  { value: "I", label: "Packing Group I - High Danger" },
  { value: "II", label: "Packing Group II - Medium Danger" },
  { value: "III", label: "Packing Group III - Low Danger" },
  { value: "N/A", label: "N/A - Not Applicable" },
];

const containerTypes = [
  { value: "non-bulk", label: "95 Gallons or Below" },
  { value: "bulk", label: "Above 95 Gallons" },
];

export default function MaterialInput({ 
  onAddMaterial, 
  editingMaterial, 
  onUpdateMaterial,
  onCancelEdit 
}: MaterialInputProps) {
  const [unNumber, setUnNumber] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [hazardClass, setHazardClass] = useState("");
  const [packingGroup, setPackingGroup] = useState("");
  const [containerType, setContainerType] = useState<"bulk" | "non-bulk">("non-bulk");
  const [stopNumber, setStopNumber] = useState(1);
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (editingMaterial) {
      setUnNumber(editingMaterial.unNumber);
      setMaterialName(editingMaterial.materialName);
      setHazardClass(editingMaterial.hazardClass);
      setPackingGroup(editingMaterial.packingGroup);
      setContainerType(editingMaterial.containerType);
      setStopNumber(editingMaterial.stopNumber);
      setWeight(editingMaterial.weight);
      setQuantity(editingMaterial.quantity);
    }
  }, [editingMaterial]);

  const resetForm = () => {
    setUnNumber("");
    setMaterialName("");
    setHazardClass("");
    setPackingGroup("");
    setContainerType("non-bulk");
    setStopNumber(1);
    setWeight("");
    setQuantity(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unNumber && materialName && hazardClass && packingGroup && weight) {
      if (editingMaterial && onUpdateMaterial) {
        onUpdateMaterial({
          ...editingMaterial,
          unNumber,
          materialName,
          hazardClass,
          packingGroup,
          containerType,
          stopNumber,
          weight,
          quantity,
        });
      } else {
        onAddMaterial({
          unNumber,
          materialName,
          hazardClass,
          packingGroup,
          containerType,
          stopNumber,
          weight,
          quantity,
        });
      }
      resetForm();
      if (onCancelEdit) onCancelEdit();
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancelEdit) onCancelEdit();
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
                <SelectItem key={hc.value} value={hc.value} data-testid={`option-hazard-class-${hc.value}`}>
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
                <SelectItem key={pg.value} value={pg.value} data-testid={`option-packing-group-${pg.value}`}>
                  {pg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="container-type" className="text-base font-medium">
            Container Size
          </Label>
          <Select value={containerType} onValueChange={(value) => setContainerType(value as "bulk" | "non-bulk")}>
            <SelectTrigger
              id="container-type"
              data-testid="select-container-type"
              className="h-12 text-base"
            >
              <SelectValue placeholder="Select container type" />
            </SelectTrigger>
            <SelectContent>
              {containerTypes.map((ct) => (
                <SelectItem key={ct.value} value={ct.value} data-testid={`option-container-type-${ct.value}`}>
                  {ct.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select your container size. Containers above 95 gallons are considered bulk and require placards for Table 2 materials <em>regardless of weight</em>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stop-number" className="text-base font-medium">
            Stop Number (Loading Location)
          </Label>
          <NumberStepper
            id="stop-number"
            data-testid="input-stop-number"
            value={stopNumber}
            onChange={setStopNumber}
            min={1}
            step={1}
            integer={true}
          />
          <p className="text-xs text-muted-foreground">
            Track which pickup location this material came from. DOT requires specific placards for classes exceeding 2,205 lbs <strong>at a single loading facility</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-base font-medium">
              Weight (lbs)
            </Label>
            <NumberStepper
              id="weight"
              data-testid="input-weight"
              value={weight || "0"}
              onChange={(val) => setWeight(val.toString())}
              min={0}
              step={10}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantity
            </Label>
            <NumberStepper
              id="quantity"
              data-testid="input-quantity"
              value={quantity}
              onChange={setQuantity}
              min={1}
              step={1}
              integer={true}
            />
          </div>
        </div>

        <div className="flex gap-3">
          {editingMaterial && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel-edit"
              className="flex-1 h-12 text-base"
              size="default"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            data-testid={editingMaterial ? "button-update-material" : "button-add-material"}
            className={editingMaterial ? "flex-1 h-12 text-base" : "w-full h-12 text-base"}
            size="default"
          >
            {editingMaterial ? (
              <>
                <Save className="w-5 h-5 mr-2" />
                Update Material
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Material
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
