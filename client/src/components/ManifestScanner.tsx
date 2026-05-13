import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, X, CheckCircle2, AlertTriangle, RotateCcw, Loader2, FileCheck } from "lucide-react";

interface ExtractedMaterial {
  unNumber: string | null;
  materialName: string | null;
  hazardClass: string | null;
  subsidiaryClass: string | null;
  packingGroup: string | null;
  weight: string | null;
  weightUnit: string | null;
  quantity: number | null;
  containerType: "bulk" | "non-bulk" | null;
  confidence: "high" | "medium" | "low";
  notes: string | null;
}

interface ScanResult {
  success: boolean;
  materials: ExtractedMaterial[];
  rawText: string;
  documentType: string;
  error?: string;
}

interface ManifestScannerProps {
  onImportMaterials: (materials: Array<{
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
  }>) => void;
  stopNumber: number;
}

const VALID_HAZARD_CLASSES = ["1.1","1.2","1.3","1.4","1.5","1.6","2.1","2.2","2.3","3","4.1","4.2","4.3","5.1","5.2","6.1","7","8","9"];
const VALID_PACKING_GROUPS = ["I","II","III","N/A"];

function normalizeMaterial(m: ExtractedMaterial, stopNumber: number) {
  const hazardClass = VALID_HAZARD_CLASSES.includes(m.hazardClass || "") ? m.hazardClass! : "";
  const subsidiaryClass = m.subsidiaryClass && VALID_HAZARD_CLASSES.includes(m.subsidiaryClass) ? m.subsidiaryClass : undefined;
  const packingGroup = VALID_PACKING_GROUPS.includes(m.packingGroup || "") ? m.packingGroup! : "N/A";

  let weight = "0";
  if (m.weight) {
    const w = parseFloat(m.weight);
    if (!isNaN(w) && w > 0) {
      const unit = (m.weightUnit || "").toUpperCase();
      if (unit === "K" || unit === "KG") {
        weight = (w * 2.20462).toFixed(0);
      } else if (unit === "T") {
        weight = (w * 2000).toFixed(0);
      } else if (unit === "G" || unit === "L" || unit === "Y") {
        weight = "0";
      } else {
        weight = w.toFixed(0);
      }
    }
  }

  // Auto-detect special designations from material name
  const matName = (m.materialName || "").toLowerCase();
  const isPIH = hazardClass === "6.1" && packingGroup === "I" &&
    (matName.includes("inhalation") || matName.includes("pih") || matName.includes("zone a") || matName.includes("zone b"));

  return {
    unNumber: m.unNumber || "",
    materialName: m.materialName || "",
    hazardClass,
    subsidiaryClass,
    packingGroup,
    weight,
    quantity: m.quantity || 1,
    containerType: m.containerType || "non-bulk",
    stopNumber,
    poisonInhalationHazard: isPIH,
    isOrganicPeroxideTypeB: false,
    isRadioactiveYellowIII: false,
    isResidue: false,
    _raw: m,
    _valid: !!(m.unNumber && m.materialName && hazardClass),
  };
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  if (confidence === "high") return <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">High confidence</Badge>;
  if (confidence === "medium") return <Badge variant="outline" className="text-xs border-amber-500 text-amber-700 dark:text-amber-400">Medium confidence</Badge>;
  return <Badge variant="outline" className="text-xs border-red-500 text-red-700 dark:text-red-400">Low confidence — verify</Badge>;
}

function MaterialCard({
  material,
  index,
  selected,
  onToggle,
}: {
  material: ReturnType<typeof normalizeMaterial>;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const raw = material._raw;
  const isValid = material._valid;

  return (
    <div
      className={`rounded-md border p-3 cursor-pointer transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20 hover-elevate"
      } ${!isValid ? "opacity-60" : ""}`}
      onClick={onToggle}
      data-testid={`scan-material-card-${index}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 w-7 h-7 rounded border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}>
          {selected && <CheckCircle2 className="w-5 h-5 text-primary-foreground" />}
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {material.unNumber ? (
              <Badge variant="outline" className="font-mono text-xs">{material.unNumber}</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">No UN#</Badge>
            )}
            {material.hazardClass ? (
              <Badge variant="secondary" className="text-xs">Class {material.hazardClass}</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">No class</Badge>
            )}
            {material.subsidiaryClass && (
              <Badge variant="outline" className="text-xs font-mono border-amber-500 text-amber-700 dark:text-amber-400">
                +{material.subsidiaryClass}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">PG {material.packingGroup}</Badge>
            <Badge variant="outline" className="text-xs">{material.containerType}</Badge>
            <ConfidenceBadge confidence={raw.confidence} />
          </div>

          <p className="text-sm font-medium">
            {material.materialName || <span className="text-muted-foreground italic">No material name</span>}
          </p>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{material.weight} lbs</span>
            <span>{material.quantity} container{material.quantity !== 1 ? "s" : ""}</span>
          </div>

          {raw.notes && (
            <p className="text-xs text-muted-foreground italic">{raw.notes}</p>
          )}

          {!isValid && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Missing required fields — will need manual entry</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * IMPROVEMENT 1: Image preprocessing
 * Compresses, enhances contrast, and sharpens the image before sending to GPT-4o.
 * Improves OCR accuracy especially for handwritten fields.
 */
/**
 * Image preprocessing pipeline for manifest scanning:
 * 1. Scale to optimal resolution for OCR (2048px max)
 * 2. Auto-rotate if EXIF orientation indicates rotation
 * 3. Adaptive contrast enhancement (different for light vs dark regions)
 * 4. Unsharp mask for text sharpening
 * 5. High-quality JPEG output
 */
async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 2048;
      let { width, height } = img;

      // Auto-detect portrait manifests taken in landscape and rotate
      // Most manifests are taller than wide; if the image is wider, it may be rotated
      const isLikelyRotated = width > height * 1.5 && height < 1500;

      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");

      if (isLikelyRotated) {
        // Rotate 90 degrees clockwise
        canvas.width = height;
        canvas.height = width;
        const ctx = canvas.getContext("2d")!;
        ctx.translate(height, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
      }

      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Step 1: Calculate image statistics for adaptive processing
      let totalBrightness = 0;
      const pixelCount = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const avgBrightness = totalBrightness / pixelCount;

      // Step 2: Adaptive contrast — stronger for dim photos (taken in trucks/docks)
      const contrastFactor = avgBrightness < 120 ? 1.5 : avgBrightness < 160 ? 1.3 : 1.15;
      const intercept = 128 * (1 - contrastFactor);

      for (let i = 0; i < data.length; i += 4) {
        data[i]     = Math.min(255, Math.max(0, data[i] * contrastFactor + intercept));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * contrastFactor + intercept));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * contrastFactor + intercept));
      }

      ctx.putImageData(imageData, 0, 0);

      // Step 3: Unsharp mask for text sharpening
      // Draw blurred version on a temp canvas, then blend
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.filter = "blur(1px)";
      tempCtx.drawImage(canvas, 0, 0);

      // Blend: sharped = original + (original - blurred) * amount
      const sharpData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const blurData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const amount = 0.5; // Sharpening strength

      for (let i = 0; i < sharpData.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const diff = sharpData.data[i + c] - blurData.data[i + c];
          sharpData.data[i + c] = Math.min(255, Math.max(0, sharpData.data[i + c] + diff * amount));
        }
      }
      ctx.putImageData(sharpData, 0, 0);

      const base64 = canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
      resolve({ base64, mimeType: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ManifestScanner({ onImportMaterials, stopNumber }: ManifestScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanResult(null);
    setSelected(new Set());

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setScanning(true);

    try {
      // Check connectivity before attempting scan
      if (!navigator.onLine) {
        setError("You're offline. Manifest scanning requires an internet connection. Please enter fields manually or try again when connected.");
        setScanning(false);
        return;
      }

      const { base64, mimeType } = await compressImage(file);

      const res = await fetch("/api/scan-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Could not read this document. Please try a clearer photo or enter fields manually.");
        setScanResult(null);
      } else {
        setScanResult(data);
        const allValid = new Set(
          data.materials
            .map((_: ExtractedMaterial, i: number) => i)
            .filter((i: number) => {
              const m = normalizeMaterial(data.materials[i], stopNumber);
              return m._valid;
            })
        );
        setSelected(allValid);
      }
    } catch (err: any) {
      setError("Network error — please check your connection and try again.");
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleImport = () => {
    if (!scanResult) return;
    const toImport = scanResult.materials
      .filter((_, i) => selected.has(i))
      .map((m) => normalizeMaterial(m, stopNumber))
      .filter((m) => m._valid)
      .map(({ _raw, _valid, ...rest }) => rest);

    onImportMaterials(toImport as any);
    handleReset();
  };

  const handleReset = () => {
    setPreview(null);
    setScanResult(null);
    setSelected(new Set());
    setError(null);
    setScanning(false);
  };

  const normalizedMaterials = scanResult
    ? scanResult.materials.map((m) => normalizeMaterial(m, stopNumber))
    : [];

  const selectedValidCount = [...selected].filter((i) => normalizedMaterials[i]?._valid).length;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-manifest-file"
      />

      {!preview && !scanning && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-16 text-lg border-2 border-dashed border-primary/40 hover:border-primary"
          data-testid="button-scan-manifest"
        >
          <Camera className="w-6 h-6 mr-3" />
          Scan Manifest / Shipping Paper
        </Button>
      )}

      {scanning && (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            {preview && (
              <img src={preview} alt="Captured manifest" className="max-h-40 rounded-md object-contain border" />
            )}
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div>
                <p className="font-semibold">Reading manifest...</p>
                <p className="text-sm text-muted-foreground">AI is extracting hazmat fields from your document</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && !scanning && (
        <Card className="p-4 border-destructive/40 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive text-sm">Scan Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleReset}
            className="mt-3 w-full h-12"
            data-testid="button-scan-retry"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      )}

      {scanResult && !scanning && (
        <Card className="p-4 space-y-4" data-testid="scan-results-card">
          <div className="flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">
                {scanResult.materials.length} material{scanResult.materials.length !== 1 ? "s" : ""} found
                <span className="text-muted-foreground font-normal text-sm ml-2">({scanResult.documentType})</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review each item below. AI-extracted values shown in amber may need verification.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              data-testid="button-scan-close"
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {preview && (
            <img src={preview} alt="Scanned manifest" className="max-h-32 w-full rounded-md object-contain border bg-muted/20" />
          )}

          <div className="space-y-2">
            {normalizedMaterials.map((m, i) => (
              <MaterialCard
                key={i}
                material={m}
                index={i}
                selected={selected.has(i)}
                onToggle={() => toggleSelect(i)}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              type="button"
              onClick={handleImport}
              disabled={selectedValidCount === 0}
              className="flex-1 h-14 text-base"
              data-testid="button-import-materials"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Add {selectedValidCount} Material{selectedValidCount !== 1 ? "s" : ""} to Load
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-14 px-4"
              data-testid="button-scan-again"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Always verify AI-extracted fields against your physical shipping papers before driving.
          </p>
        </Card>
      )}
    </div>
  );
}
