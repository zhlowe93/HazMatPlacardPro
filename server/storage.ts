import { type HazmatMaterial, type InsertHazmatMaterial } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMaterials(): Promise<HazmatMaterial[]>;
  getMaterial(id: string): Promise<HazmatMaterial | undefined>;
  createMaterial(material: InsertHazmatMaterial): Promise<HazmatMaterial>;
  deleteMaterial(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private materials: Map<string, HazmatMaterial>;

  constructor() {
    this.materials = new Map();
  }

  async getMaterials(): Promise<HazmatMaterial[]> {
    return Array.from(this.materials.values());
  }

  async getMaterial(id: string): Promise<HazmatMaterial | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(insertMaterial: InsertHazmatMaterial): Promise<HazmatMaterial> {
    const id = randomUUID();
    const material: HazmatMaterial = {
      id,
      unNumber: insertMaterial.unNumber,
      materialName: insertMaterial.materialName,
      hazardClass: insertMaterial.hazardClass,
      packingGroup: insertMaterial.packingGroup ?? null,
      weight: insertMaterial.weight,
      quantity: insertMaterial.quantity ?? 1,
    };
    this.materials.set(id, material);
    return material;
  }

  async deleteMaterial(id: string): Promise<void> {
    this.materials.delete(id);
  }
}

export const storage = new MemStorage();
