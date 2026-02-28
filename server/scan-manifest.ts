import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ExtractedMaterial {
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

export interface ScanResult {
  success: boolean;
  materials: ExtractedMaterial[];
  rawText: string;
  documentType: string;
  error?: string;
}

const HAZMAT_EXTRACTION_PROMPT = `You are an expert at reading DOT hazardous waste shipping documents including:
- EPA Uniform Hazardous Waste Manifest (Form 8700-22)
- DOT Uniform Hazardous Materials Shipping Papers
- Clean Harbors internal waste manifests

Your job is to extract ALL hazardous material entries and return structured data.

---

STEP 1 — READ SECTION 9b (Material Descriptions)

For each numbered material row in Section 9b, extract:
1. Row number (e.g. 1, 2, 3 — used to link to Section 14)
2. UN/NA Number (format: UN1234 or NA1234)
3. Proper Shipping Name / Material Name (include any WASTE or RQ prefix)
4. Hazard Class — primary class number only (e.g. "6.1", "3", "4.3", "8", "2.3")
5. Subsidiary Hazard Class — the number inside parentheses after the primary class, if present (e.g. if "6.1 (4.3)" the subsidiary is "4.3")
6. Packing Group — Roman numeral I, II, or III only (or "N/A" if not shown)
7. Weight — read from TWO columns that go together:
   - Section 11 "Total Quantity" = the numeric value (e.g. 400)
   - Section 12 "Unit Wt./Vol." = a single letter code (e.g. P)
   These must always be read as a pair. The letter code tells you the unit.

   CRITICAL: Do NOT perform any math or multiplication yourself. Return the raw number exactly as written in Section 11, and the raw letter code exactly as written in Section 12. The app will handle all conversions.

   Unit code table — return the letter code as-is in weightUnit:
   | Code | Meaning      | Action |
   |------|------------- |--------|
   | P    | Pounds       | weight = exact number from Section 11, weightUnit = "P" |
   | K    | Kilograms    | weight = exact number from Section 11, weightUnit = "K" |
   | T    | Short tons   | weight = exact number from Section 11, weightUnit = "T" (do NOT multiply by 2000 — app handles this) |
   | G    | Gallons      | weight = null, weightUnit = null, add note: "Weight not available — unit is gallons (G). Enter weight manually." |
   | L    | Liters       | weight = null, weightUnit = null, add note: "Weight not available — unit is liters (L). Enter weight manually." |
   | Y    | Cubic yards  | weight = null, weightUnit = null, add note: "Weight not available — unit is cubic yards (Y). Enter weight manually." |
   | ?    | Unrecognized | weight = null, confidence = "low", add note: "Unrecognized unit code '[letter]' — enter weight manually." |

   Examples:
   - Section 11 = 400, Section 12 = P → weight = "400", weightUnit = "P"
   - Section 11 = 200, Section 12 = K → weight = "200", weightUnit = "K"
   - Section 11 = 2,  Section 12 = T → weight = "2",   weightUnit = "T"  ← return "2" not "4000"
   - Section 11 = 55, Section 12 = G → weight = null (volume, not weight)

   ⚠ IMPORTANT: Section 11 and Section 12 contain the WEIGHT ONLY. Do NOT use the numbers from Section 11/12 for anything related to container size. Container size comes exclusively from Section 14.

---

STEP 2 — READ SECTION 14 (Special Handling Instructions and Additional Information)

Clean Harbors uses a specific format in Section 14. Each material has one line:
  [row#].[internal code]  ERG#[xxx]  [qty]x[size_or_code]

⚠ IMPORTANT: Section 14 contains CONTAINER SIZE ONLY. Do NOT use Section 14 numbers for weight. The numbers here (e.g. 55, 330) are gallon sizes of containers — they have nothing to do with the weight values in Section 11/12.

Examples:
  1.RFD-32  ERG#131  1x55
  2.CHW-44  ERG#154  3x55
  3.RFD-12  ERG#128  1xTOTE
  4.CHW-01  ERG#171  2xFBIN
  5.RFD-99  ERG#154  1x330

Parsing rules for the [qty]x[size_or_code] part:
- The number BEFORE the "x" is always the quantity (number of containers)
- The value AFTER the "x" is the container size — it can be a number (gallons) or a text code

Numeric gallon values:
  - 55 or any value ≤ 95 → containerType = "non-bulk"
  - 275 or any value > 95 → containerType = "bulk"

Known text container codes (always bulk, >95 gallons):
  - TOTE, TOT2, TOT3, or any code starting with TOT → bulk (totes are 275–330 gal)
  - FBIN, FLEXBIN, or any code starting with FBIN → bulk (large flexible containers)

Unknown text codes (not a number, not a known code above):
  - Treat as bulk but set confidence = "low" so the driver is flagged to verify

The row number at the start of a Section 14 line (e.g. "1." or "2.") matches the row number of the material in Section 9b. Use this to link the qty and containerType to the correct material.

Section 14 data is AUTHORITATIVE — it overrides any container type inference from other parts of the document.

If Section 14 is absent, illegible, or a material has no matching Section 14 entry:
  Fall back to inferring container type from descriptive words in Section 9b (drum, barrel, bag, box → non-bulk; tote, tanker, tank → bulk). Set confidence = "medium" for fallback inferences.

---

STEP 3 — ASSEMBLE OUTPUT

For each material from Section 9b, combine the data from Steps 1 and 2.

Set confidence:
  - "high" if UN number, hazard class, AND Section 14 container info were all clearly readable
  - "medium" if some fields were inferred or partially legible
  - "low" if container type came from an unrecognized code, or multiple key fields are missing/unclear

---

Respond ONLY with a raw JSON object in exactly this format. No markdown, no code fences, no explanation — just the JSON:
{
  "documentType": "EPA Manifest",
  "rawText": "the text you can read from the document",
  "materials": [
    {
      "unNumber": "UN3288",
      "materialName": "WASTE Toxic Solid, Inorganic, N.O.S.",
      "hazardClass": "6.1",
      "subsidiaryClass": null,
      "packingGroup": "II",
      "weight": "500",
      "weightUnit": "lbs",
      "quantity": 3,
      "containerType": "non-bulk",
      "confidence": "high",
      "notes": "Section 14: 3x55 — 3 drums of 55 gal"
    }
  ]
}

If an unknown container code was used, include it in the notes field so the driver knows what to verify, e.g.: "notes": "Unrecognized container code 'XBIN' — verify container size (above or below 95 gal)"`;

export async function scanManifest(imageBase64: string, mimeType: string = "image/jpeg"): Promise<ScanResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: HAZMAT_EXTRACTION_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("scan-manifest: no content in API response", JSON.stringify(response));
      return {
        success: false,
        materials: [],
        rawText: "",
        documentType: "Unknown",
        error: "No response from AI",
      };
    }

    let parsed: any;
    try {
      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("scan-manifest: JSON parse failed. Raw content:", content);
      return {
        success: false,
        materials: [],
        rawText: content,
        documentType: "Unknown",
        error: "AI returned an unreadable response. Please try again with a clearer photo.",
      };
    }

    return {
      success: true,
      materials: parsed.materials || [],
      rawText: parsed.rawText || "",
      documentType: parsed.documentType || "Unknown",
    };
  } catch (err: any) {
    console.error("scan-manifest: API error:", err?.status, err?.message, err?.error ?? "");
    return {
      success: false,
      materials: [],
      rawText: "",
      documentType: "Unknown",
      error: err?.message || "Failed to scan manifest",
    };
  }
}
