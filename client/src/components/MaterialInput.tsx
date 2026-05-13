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
import { Plus, Save, X, AlertTriangle } from "lucide-react";
import { getHazardClassOptions } from "@/lib/hazmat-data";
import { useToast } from "@/hooks/use-toast";
import ManifestScanner from "@/components/ManifestScanner";

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
  isOrganicPeroxideTypeB?: boolean;
  isRadioactiveYellowIII?: boolean;
  isResidue?: boolean;
}

type NewMaterial = Omit<Material, "id">;

interface MaterialInputProps {
  onAddMaterial: (material: NewMaterial) => void;
  onAddMaterials?: (materials: NewMaterial[]) => void;
  editingMaterial?: Material | null;
  onUpdateMaterial?: (material: Material) => void;
  onCancelEdit?: () => void;
}

const hazardClasses = getHazardClassOptions();

/**
 * Conservative lbs-per-gallon estimates by hazard class.
 * Used when drivers enter volume (gallons) from their manifest instead of weight.
 * We use HIGHER estimates to be safe — better to over-placard than under-placard.
 */
const LBS_PER_GALLON: Record<string, { factor: number; label: string }> = {
  "1.1": { factor: 8.5, label: "explosives" },
  "1.2": { factor: 8.5, label: "explosives" },
  "1.3": { factor: 8.5, label: "explosives" },
  "1.4": { factor: 8.5, label: "explosives" },
  "1.5": { factor: 8.5, label: "explosives" },
  "1.6": { factor: 8.5, label: "explosives" },
  "2.1": { factor: 4.2, label: "flammable gas (liquefied)" },
  "2.2": { factor: 8.3, label: "compressed gas" },
  "2.3": { factor: 8.3, label: "poison gas" },
  "3":   { factor: 7.5, label: "flammable liquid" },
  "4.1": { factor: 10.0, label: "flammable solid (slurry)" },
  "4.2": { factor: 9.0, label: "spontaneously combustible" },
  "4.3": { factor: 9.0, label: "dangerous when wet" },
  "5.1": { factor: 10.0, label: "oxidizer solution" },
  "5.2": { factor: 9.0, label: "organic peroxide" },
  "6.1": { factor: 9.0, label: "toxic liquid" },
  "7":   { factor: 9.0, label: "radioactive" },
  "8":   { factor: 12.0, label: "corrosive (acid/base)" },
  "9":   { factor: 8.5, label: "misc. hazmat" },
};

const DEFAULT_LBS_PER_GALLON = 8.5; // Water is 8.34 — round up for safety

function estimatePounds(gallons: number, hazardClass: string): number {
  const entry = LBS_PER_GALLON[hazardClass];
  const factor = entry?.factor || DEFAULT_LBS_PER_GALLON;
  return Math.ceil(gallons * factor);
}

const packingGroups = [
  { value: "I", label: "Packing Group I - High Danger" },
  { value: "II", label: "Packing Group II - Medium Danger" },
  { value: "III", label: "Packing Group III - Low Danger" },
  { value: "N/A", label: "N/A - Not Applicable" },
];

const containerTypes = [
  { value: "non-bulk", label: "Non-Bulk (≤119 gal, ≤882 lbs, ≤119 cu ft)" },
  { value: "bulk", label: "Bulk (exceeds 119 gal, 882 lbs, or 119 cu ft)" },
];

export default function MaterialInput({
  onAddMaterial,
  onAddMaterials,
  editingMaterial,
  onUpdateMaterial,
  onCancelEdit,
}: MaterialInputProps) {
  const { toast } = useToast();
  const [unNumber, setUnNumber] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [hazardClass, setHazardClass] = useState("");
  const [packingGroup, setPackingGroup] = useState("");
  const [containerType, setContainerType] = useState<"bulk" | "non-bulk">("non-bulk");
  const [stopNumber, setStopNumber] = useState(1);
  const [weight, setWeight] = useState("0");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "gal">("lbs");
  const [quantity, setQuantity] = useState(1);
  const [subsidiaryClass, setSubsidiaryClass] = useState("none");
  const [poisonInhalationHazard, setPoisonInhalationHazard] = useState(false);
  const [isOrganicPeroxideTypeB, setIsOrganicPeroxideTypeB] = useState(false);
  const [isRadioactiveYellowIII, setIsRadioactiveYellowIII] = useState(false);
  const [isResidue, setIsResidue] = useState(false);

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  };

  const showPihOption = hazardClass === "6.1" && packingGroup === "I";
  const showOrganicPeroxideTypeB = hazardClass === "5.2";
  const showRadioactiveYellowIII = hazardClass === "7";

  useEffect(() => {
    if (!showPihOption) {
      setPoisonInhalationHazard(false);
    }
  }, [showPihOption]);

  useEffect(() => {
    if (!showOrganicPeroxideTypeB) {
      setIsOrganicPeroxideTypeB(false);
    }
  }, [showOrganicPeroxideTypeB]);

  useEffect(() => {
    if (!showRadioactiveYellowIII) {
      setIsRadioactiveYellowIII(false);
    }
  }, [showRadioactiveYellowIII]);

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
      setIsOrganicPeroxideTypeB(editingMaterial.isOrganicPeroxideTypeB || false);
      setIsRadioactiveYellowIII(editingMaterial.isRadioactiveYellowIII || false);
      setIsResidue(editingMaterial.isResidue || false);
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
    setWeightUnit("lbs");
    setQuantity(1);
    setPoisonInhalationHazard(false);
    setIsOrganicPeroxideTypeB(false);
    setIsRadioactiveYellowIII(false);
    setIsResidue(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawWeightNum = parseFloat(weight);
    if (unNumber && materialName && hazardClass && packingGroup && !isNaN(rawWeightNum) && rawWeightNum > 0) {
      // Convert gallons to estimated pounds if unit is gallons
      const weightInLbs = weightUnit === "gal"
        ? estimatePounds(rawWeightNum, hazardClass).toString()
        : weight;
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
          weight: weightInLbs,
          quantity,
          poisonInhalationHazard,
          isOrganicPeroxideTypeB,
          isRadioactiveYellowIII,
          isResidue,
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
          weight: weightInLbs,
          quantity,
          poisonInhalationHazard,
          isOrganicPeroxideTypeB,
          isRadioactiveYellowIII,
          isResidue,
        });
      }

      triggerHapticFeedback();

      const displayWeight = parseFloat(weightInLbs);
      const conversionNote = weightUnit === "gal"
        ? ` (estimated from ${rawWeightNum} gal)`
        : "";
      toast({
        title: isEditing ? "Material Updated" : "Material Added",
        description: `${unNumber} - ${materialName} (${displayWeight.toLocaleString()} lbs${conversionNote})`,
        duration: 3000,
      });

      resetForm();
      if (onCancelEdit) onCancelEdit();
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancelEdit) onCancelEdit();
  };

  const handleImportMaterials = (materials: NewMaterial[]) => {
    if (materials.length === 0) return;

    if (materials.length === 1) {
      const m = materials[0];
      setUnNumber(m.unNumber);
      setMaterialName(m.materialName);
      setHazardClass(m.hazardClass);
      setSubsidiaryClass(m.subsidiaryClass || "none");
      setPackingGroup(m.packingGroup);
      setContainerType(m.containerType);
      setStopNumber(m.stopNumber);
      setWeight(m.weight);
      setQuantity(m.quantity);
      setPoisonInhalationHazard(m.poisonInhalationHazard);

      toast({
        title: "Fields Populated",
        description: "Review the values below, then tap Add Material to confirm.",
        duration: 3000,
      });
    } else {
      if (onAddMaterials) {
        onAddMaterials(materials);
      } else {
        for (const m of materials) {
          onAddMaterial(m);
        }
      }

      triggerHapticFeedback();

      toast({
        title: `${materials.length} Materials Added`,
        description: "Scanned materials have been added to your load. Verify each one.",
        duration: 3500,
      });
    }
  };

  return (
    <div className="space-y-4">
      {!editingMaterial && (
        <ManifestScanner
          onImportMaterials={handleImportMaterials}
          stopNumber={stopNumber}
        />
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingMaterial && (
            <p className="text-sm text-muted-foreground -mt-2 pb-2 border-b">
              Enter manually or use Scan Manifest above to auto-fill from a shipping document.
            </p>
          )}

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
              autoComplete="off"
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
              autoComplete="off"
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
            <p className="text-sm text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground">
                    Check this if the material is a <strong>Zone A or Zone B</strong> inhalation hazard.
                    PIH materials are <strong>Table 1</strong> and require placarding at <strong>any quantity</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showOrganicPeroxideTypeB && (
            <div className="p-4 border-2 border-orange-500/50 bg-orange-500/10 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="organic-peroxide-type-b"
                      data-testid="checkbox-organic-peroxide-type-b"
                      checked={isOrganicPeroxideTypeB}
                      onCheckedChange={(checked) => setIsOrganicPeroxideTypeB(checked === true)}
                      className="h-8 w-8"
                    />
                    <Label
                      htmlFor="organic-peroxide-type-b"
                      className="text-base font-semibold text-orange-700 dark:text-orange-400 cursor-pointer"
                    >
                      Type B Organic Peroxide
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check if this is a <strong>Type B</strong> organic peroxide. Type B is <strong>Table 1</strong> — placard required at <strong>any quantity</strong> per 49 CFR §172.504.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showRadioactiveYellowIII && (
            <div className="p-4 border-2 border-yellow-500/50 bg-yellow-500/10 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="radioactive-yellow-iii"
                      data-testid="checkbox-radioactive-yellow-iii"
                      checked={isRadioactiveYellowIII}
                      onCheckedChange={(checked) => setIsRadioactiveYellowIII(checked === true)}
                      className="h-8 w-8"
                    />
                    <Label
                      htmlFor="radioactive-yellow-iii"
                      className="text-base font-semibold text-yellow-700 dark:text-yellow-400 cursor-pointer"
                    >
                      Radioactive Yellow III Label
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check if the package has a <strong>Radioactive Yellow III</strong> label. Yellow III is <strong>Table 1</strong> — placard required at <strong>any quantity</strong> per 49 CFR §172.504.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Residue / Empty Container */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="is-residue"
                data-testid="checkbox-residue"
                checked={isResidue}
                onCheckedChange={(checked) => setIsResidue(checked === true)}
                className="h-8 w-8"
              />
              <Label
                htmlFor="is-residue"
                className="text-base font-medium cursor-pointer"
              >
                Residue / Empty Container
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Check if this is a container with <strong>residue only</strong> (non-cleaned, non-purged). Per 49 CFR §172.514: Table 1 residue still requires placards. Table 2 residue does <strong>not</strong> require placards unless in a bulk container.
            </p>
          </div>

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
            <p className="text-sm text-muted-foreground">
              Per 49 CFR §171.8: <strong>Bulk</strong> = exceeds <strong>119 gallons</strong>, <strong>882 lbs</strong>, or <strong>119 cubic feet</strong> (any one). Bulk containers require placards regardless of weight.
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
            <p className="text-sm text-muted-foreground">
              Track which pickup location this material came from. DOT requires specific placards for classes exceeding 2,205 lbs <strong>at a single loading facility</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-medium">
                Total {weightUnit === "gal" ? "Volume" : "Weight"}
              </Label>

              {/* Unit toggle — lbs vs gallons */}
              <div className="flex rounded-lg border-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWeightUnit("lbs")}
                  className={`flex-1 py-3 text-base font-medium transition-colors ${
                    weightUnit === "lbs"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Pounds (lbs)
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit("gal")}
                  className={`flex-1 py-3 text-base font-medium transition-colors ${
                    weightUnit === "gal"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Gallons (gal)
                </button>
              </div>

              <NumberStepper
                id="weight"
                data-testid="input-weight"
                value={weight}
                onChange={(val) => setWeight(val.toString())}
                min={0}
                step={weightUnit === "gal" ? 5 : 10}
                placeholder={weightUnit === "gal" ? "55" : "1000"}
              />

              {/* Live conversion preview when in gallons mode */}
              {weightUnit === "gal" && parseFloat(weight) > 0 && hazardClass && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    ≈ {estimatePounds(parseFloat(weight), hazardClass).toLocaleString()} lbs estimated
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    Based on ~{LBS_PER_GALLON[hazardClass]?.factor || DEFAULT_LBS_PER_GALLON} lbs/gal for {LBS_PER_GALLON[hazardClass]?.label || "hazmat liquid"}.
                    Rounded up for safety. DOT thresholds use weight.
                  </p>
                </div>
              )}

              {weightUnit === "gal" && !hazardClass && parseFloat(weight) > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Select a hazard class above for weight estimate.
                </p>
              )}

              {weightUnit === "lbs" && (
                <p className="text-sm text-muted-foreground">
                  Combined weight of all containers for this material.
                </p>
              )}

              {parseFloat(weight) > 10000 && weightUnit === "lbs" && (
                <div className="flex items-center gap-2 p-2 mt-2 rounded bg-orange-500/20 border border-orange-500/40" data-testid="warning-high-weight">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                  <span className="text-sm text-orange-700 dark:text-orange-300">
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
              <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
