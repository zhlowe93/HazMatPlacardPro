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

Return your response as valid JSON in this exact format:
{
  "documentType": "EPA Manifest" or "DOT Shipping Paper" or "Unknown",
  "rawText": "the text you can read from the document",
  "materials": [
    {
      "unNumber": "UN3288" or null,
      "materialName": "Toxic Solid, Inorganic, N.O.S." or null,
      "hazardClass": "6.1" or null,
      "subsidiaryClass": "4.3" or null,
      "packingGroup": "II" or null,
      "weight": "500" or null,
      "weightUnit": "lbs" or "kg",
      "quantity": 5 or null,
      "containerType": "non-bulk" or "bulk" or null,
      "confidence": "high" or "medium" or "low",
      "notes": "any special notes about this material" or null
    }
  ]
}`;

export async function scanManifest(imageBase64: string, mimeType: string = "image/jpeg"): Promise<ScanResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
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
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        materials: [],
        rawText: "",
        documentType: "Unknown",
        error: "No response from AI",
      };
    }

    const parsed = JSON.parse(content);
    return {
      success: true,
      materials: parsed.materials || [],
      rawText: parsed.rawText || "",
      documentType: parsed.documentType || "Unknown",
    };
  } catch (err: any) {
    console.error("Manifest scan error:", err);
    return {
      success: false,
      materials: [],
      rawText: "",
      documentType: "Unknown",
      error: err?.message || "Failed to scan manifest",
    };
  }
}
