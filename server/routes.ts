import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { scanManifest } from "./scan-manifest";

const jsonLarge = express.json({ limit: "20mb" });

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/scan-manifest
  // Accepts a base64-encoded image and returns extracted hazmat fields
  app.post("/api/scan-manifest", jsonLarge, async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required" });
      }

      const result = await scanManifest(imageBase64, mimeType || "image/jpeg");

      if (!result.success) {
        return res.status(422).json({
          error: result.error || "Could not read manifest",
          materials: [],
          documentType: result.documentType,
          rawText: result.rawText,
        });
      }

      return res.json(result);
    } catch (err: any) {
      console.error("scan-manifest route error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
