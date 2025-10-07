import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const animalReports = pgTable("animal_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  datetime: timestamp("datetime").defaultNow().notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  rua: text("rua"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  comentario: text("comentario"),
  contato: text("contato"),
  pathPhoto: text("path_photo").notNull(),
  animalTipo: text("animal_tipo").notNull(),
  animalRaca: text("animal_raca").notNull(),
});

export const insertAnimalReportSchema = createInsertSchema(animalReports).pick({
  latitude: true,
  longitude: true,
  comentario: true,
  contato: true,
  pathPhoto: true,
});

export type InsertAnimalReport = z.infer<typeof insertAnimalReportSchema>;
export type AnimalReport = typeof animalReports.$inferSelect;

// Additional types for API responses
export const animalFilterSchema = z.object({
  tipo: z.enum(["all", "Cão", "Gato", "Outro"]).optional(),
  raca: z.string().optional(),
});

export type AnimalFilter = z.infer<typeof animalFilterSchema>;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
