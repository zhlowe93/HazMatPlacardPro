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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Save, X, AlertTriangle, CheckCircle } from "lucide-react";
import { getHazardClassOptions } from "@/lib/hazmat-data";
import { useToast } from "@/hooks/use-toast";

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

interface MaterialInputProps {
  onAddMaterial: (material: {
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
  const { toast } = useToast();
  const [unNumber, setUnNumber] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [hazardClass, setHazardClass] = useState("");
  const [packingGroup, setPackingGroup] = useState("");
  const [containerType, setContainerType] = useState<"bulk" | "non-bulk">("non-bulk");
  const [stopNumber, setStopNumber] = useState(1);
  const [weight, setWeight] = useState("0");
  const [quantity, setQuantity] = useState(1);
  const [subsidiaryClass, setSubsidiaryClass] = useState("none");
  const [poisonInhalationHazard, setPoisonInhalationHazard] = useState(false);

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  };

  // Show PIH option only for Class 6.1 with Packing Group I
  const showPihOption = hazardClass === "6.1" && packingGroup === "I";

  // Reset PIH when conditions no longer apply
  useEffect(() => {
    if (!showPihOption) {
      setPoisonInhalationHazard(false);
    }
  }, [showPihOption]);

  useEffect(() => {
    if (editingMaterial) {
      setUnNumber(editingMaterial.unNumber);
      setMaterialName(editingMaterial.materialName);
      setHazardClass(editingMaterial.hazardClass);
      setSubsidiaryClass(editingMaterial.subsidiaryClass || "none");
      setPackingGroup(editingMaterial.packingGroup);
      setContainerType(editingMaterial.containerType);
      setStopNumber(editingMaterial.stopNumber);
      setWeight(editingMaterial.weight);
      setQuantity(editingMaterial.quantity);
      setPoisonInhalationHazard(editingMaterial.poisonInhalationHazard || false);
    }
  }, [editingMaterial]);

  const resetForm = () => {
    setUnNumber("");
    setMaterialName("");
    setHazardClass("");
    setSubsidiaryClass("none");
    setPackingGroup("");
    setContainerType("non-bulk");
    setStopNumber(1);
    setWeight("0");
    setQuantity(1);
    setPoisonInhalationHazard(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (unNumber && materialName && hazardClass && packingGroup && !isNaN(weightNum) && weightNum > 0) {
      const isEditing = editingMaterial && onUpdateMaterial;
      
      if (isEditing) {
        onUpdateMaterial({
          ...editingMaterial,
          unNumber,
          materialName,
          hazardClass,
          subsidiaryClass: subsidiaryClass !== "none" ? subsidiaryClass : undefined,
          packingGroup,
          containerType,
          stopNumber,
          weight,
          quantity,
          poisonInhalationHazard,
        });
      } else {
        onAddMaterial({
          unNumber,
          materialName,
          hazardClass,
          subsidiaryClass: subsidiaryClass !== "none" ? subsidiaryClass : undefined,
          packingGroup,
          containerType,
          stopNumber,
          weight,
          quantity,
          poisonInhalationHazard,
        });
      }
      
      triggerHapticFeedback();
      
      toast({
        title: isEditing ? "Material Updated" : "Material Added",
        description: `${unNumber} - ${materialName} (${weightNum.toLocaleString()} lbs)`,
        duration: 2000,
      });
      
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
            className="h-16 text-lg"
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
            className="h-16 text-lg"
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
              className="h-16 text-lg"
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
          <Label htmlFor="subsidiary-class" className="text-base font-medium">
            Subsidiary Hazard Class (if any)
          </Label>
          <Select value={subsidiaryClass} onValueChange={setSubsidiaryClass}>
            <SelectTrigger
              id="subsidiary-class"
              data-testid="select-subsidiary-class"
              className="h-16 text-lg"
            >
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" data-testid="option-subsidiary-none">None</SelectItem>
              {hazardClasses
                .filter((hc) => hc.value !== hazardClass)
                .map((hc) => (
                  <SelectItem key={hc.value} value={hc.value} data-testid={`option-subsidiary-${hc.value}`}>
                    {hc.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Check shipping papers for a class in parentheses, e.g., <strong>6.1 (4.3)</strong>. Classes 4.3 and 2.3 as secondary require placards at <strong>any quantity</strong> per 49 CFR §172.505.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="packing-group" className="text-base font-medium">
            Packing Group
          </Label>
          <Select value={packingGroup} onValueChange={setPackingGroup}>
            <SelectTrigger
              id="packing-group"
              data-testid="select-packing-group"
              className="h-16 text-lg"
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

        {/* Poison Inhalation Hazard option - only shown for Class 6.1 PG I */}
        {showPihOption && (
          <div className="p-4 border-2 border-destructive/50 bg-destructive/10 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="poison-inhalation-hazard"
                    data-testid="checkbox-pih"
                    checked={poisonInhalationHazard}
                    onCheckedChange={(checked) => setPoisonInhalationHazard(checked === true)}
                    className="h-8 w-8"
                  />
                  <Label 
                    htmlFor="poison-inhalation-hazard" 
                    className="text-base font-semibold text-destructive cursor-pointer"
                  >
                    Poison Inhalation Hazard (PIH)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Check this if the material is a <strong>Zone A or Zone B</strong> inhalation hazard. 
                  PIH materials are <strong>Table 1</strong> and require placarding at <strong>any quantity</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="container-type" className="text-base font-medium">
            Container Size
          </Label>
          <Select value={containerType} onValueChange={(value) => setContainerType(value as "bulk" | "non-bulk")}>
            <SelectTrigger
              id="container-type"
              data-testid="select-container-type"
              className="h-16 text-lg"
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
              Total Weight (lbs)
            </Label>
            <NumberStepper
              id="weight"
              data-testid="input-weight"
              value={weight}
              onChange={(val) => setWeight(val.toString())}
              min={0}
              step={10}
              placeholder="1000"
            />
            <p className="text-xs text-muted-foreground">
              Combined weight of all containers for this material.
            </p>
            {parseFloat(weight) > 10000 && (
              <div className="flex items-center gap-2 p-2 mt-2 rounded bg-orange-500/20 border border-orange-500/40" data-testid="warning-high-weight">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                <span className="text-xs text-orange-700 dark:text-orange-300">
                  Unusually high weight ({parseFloat(weight).toLocaleString()} lbs). Please verify this is correct.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantity (containers)
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
            <p className="text-xs text-muted-foreground">
              Number of containers (for your reference).
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {editingMaterial && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel-edit"
              className="flex-1 h-16 text-lg"
              size="default"
            >
              <X className="w-6 h-6 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            data-testid={editingMaterial ? "button-update-material" : "button-add-material"}
            className={editingMaterial ? "flex-1 h-16 text-lg" : "w-full h-16 text-lg"}
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
