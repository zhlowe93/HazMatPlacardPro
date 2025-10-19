import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hazmatMaterials = pgTable("hazmat_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unNumber: text("un_number").notNull(),
  materialName: text("material_name").notNull(),
  hazardClass: text("hazard_class").notNull(),
  packingGroup: text("packing_group"),
  weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertHazmatMaterialSchema = createInsertSchema(hazmatMaterials).omit({
  id: true,
});

export type InsertHazmatMaterial = z.infer<typeof insertHazmatMaterialSchema>;
export type HazmatMaterial = typeof hazmatMaterials.$inferSelect;
