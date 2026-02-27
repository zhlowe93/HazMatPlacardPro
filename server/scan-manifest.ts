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

Your job is to extract ALL hazardous material entries from the document image.

For each material line item in the document, extract:
1. UN/NA Number (format: UN1234 or NA1234) - found in "UN/NA#" column or within the proper shipping name
2. Proper Shipping Name / Material Name - the official DOT name for the material
3. Hazard Class - the primary hazard class number (e.g., "6.1", "3", "4.3", "8", "2.3")
4. Subsidiary Hazard Class - class in parentheses after primary class (e.g., if "6.1 (4.3)" the subsidiary is "4.3"). Only the class number inside the parentheses.
5. Packing Group - Roman numeral I, II, or III (or N/A if not shown)
6. Total Weight - the weight amount (numbers only, no units)
7. Weight Unit - "lbs" or "kg" (default to "lbs" if not specified)
8. Quantity - number of containers/drums/totes
9. Container Type - "bulk" if container is described as tank, tote (>95 gal), tanker, or bulk. "non-bulk" for drums, boxes, bags, small containers (<=95 gal).

IMPORTANT RULES:
- A manifest can have multiple materials - extract ALL of them
- If a field is illegible or not present, return null for that field
- For hazard class, only return the number (e.g. "6.1" not "Class 6.1")
- For subsidiary class, only return the number inside parentheses (e.g. "4.3" not "(4.3)")
- For packing group, only return "I", "II", "III", or "N/A"
- Waste materials often have "RQ" (reportable quantity) or "WASTE" prefixes - include in material name
- Be conservative: if you can't read something clearly, return null rather than guessing

Respond ONLY with a raw JSON object in exactly this format. No markdown, no code fences, no explanation — just the JSON:
{
  "documentType": "EPA Manifest",
  "rawText": "the text you can read from the document",
  "materials": [
    {
      "unNumber": "UN3288",
      "materialName": "Toxic Solid, Inorganic, N.O.S.",
      "hazardClass": "6.1",
      "subsidiaryClass": null,
      "packingGroup": "II",
      "weight": "500",
      "weightUnit": "lbs",
      "quantity": 5,
      "containerType": "non-bulk",
      "confidence": "high",
      "notes": null
    }
  ]
}`;

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
