import { type AnimalReport, type InsertAnimalReport, animalReports, users, type User, type UpsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Animal report operations
  getAnimalReport(id: string): Promise<AnimalReport | undefined>;
  getAllAnimalReports(filters?: { tipo?: string; raca?: string }): Promise<AnimalReport[]>;
  createAnimalReport(report: InsertAnimalReport & { 
    rua?: string; 
    bairro?: string; 
    cidade?: string; 
    estado?: string; 
    animalTipo: string; 
    animalRaca: string; 
  }): Promise<AnimalReport>;
  updateAnimalReport(id: string, updates: Partial<AnimalReport>): Promise<AnimalReport | undefined>;
}

export class MemStorage implements IStorage {
  private animalReports: Map<string, AnimalReport>;

  constructor() {
    this.animalReports = new Map();
  }

  async getAnimalReport(id: string): Promise<AnimalReport | undefined> {
    return this.animalReports.get(id);
  }

  async getAllAnimalReports(filters?: { tipo?: string; raca?: string }): Promise<AnimalReport[]> {
    let reports = Array.from(this.animalReports.values());
    
    if (filters?.tipo && filters.tipo !== "all") {
      reports = reports.filter(report => report.animalTipo === filters.tipo);
    }
    
    if (filters?.raca) {
      reports = reports.filter(report => report.animalRaca === filters.raca);
    }
    
    // Sort by most recent first
    return reports.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }

  async createAnimalReport(insertReport: InsertAnimalReport & { 
    rua?: string; 
    bairro?: string; 
    cidade?: string; 
    estado?: string; 
    animalTipo: string; 
    animalRaca: string; 
  }): Promise<AnimalReport> {
    const id = randomUUID();
    const report: AnimalReport = {
      ...insertReport,
      id,
      datetime: new Date(),
      comentario: insertReport.comentario || null,
      contato: insertReport.contato || null,
      rua: insertReport.rua || null,
      bairro: insertReport.bairro || null,
      cidade: insertReport.cidade || null,
      estado: insertReport.estado || null,
    };
    this.animalReports.set(id, report);
    return report;
  }

  async updateAnimalReport(id: string, updates: Partial<AnimalReport>): Promise<AnimalReport | undefined> {
    const existing = this.animalReports.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.animalReports.set(id, updated);
    return updated;
  }
}

// PostgreSQL storage implementation
export class DbStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Animal report operations
  async getAnimalReport(id: string): Promise<AnimalReport | undefined> {
    const result = await db.select().from(animalReports).where(eq(animalReports.id, id)).limit(1);
    return result[0];
  }

  async getAllAnimalReports(filters?: { tipo?: string; raca?: string }): Promise<AnimalReport[]> {
    const conditions = [];
    
    if (filters?.tipo && filters.tipo !== "all") {
      conditions.push(eq(animalReports.animalTipo, filters.tipo));
    }
    
    if (filters?.raca && filters.raca !== "all") {
      conditions.push(eq(animalReports.animalRaca, filters.raca));
    }
    
    const query = conditions.length > 0
      ? db.select().from(animalReports).where(and(...conditions))
      : db.select().from(animalReports);
    
    const results = await query.orderBy(sql`${animalReports.datetime} DESC`);
    return results;
  }

  async createAnimalReport(insertReport: InsertAnimalReport & { 
    rua?: string; 
    bairro?: string; 
    cidade?: string; 
    estado?: string; 
    animalTipo: string; 
    animalRaca: string; 
  }): Promise<AnimalReport> {
    const result = await db.insert(animalReports).values({
      latitude: insertReport.latitude,
      longitude: insertReport.longitude,
      comentario: insertReport.comentario || null,
      contato: insertReport.contato || null,
      pathPhoto: insertReport.pathPhoto,
      rua: insertReport.rua || null,
      bairro: insertReport.bairro || null,
      cidade: insertReport.cidade || null,
      estado: insertReport.estado || null,
      animalTipo: insertReport.animalTipo,
      animalRaca: insertReport.animalRaca,
    }).returning();
    
    return result[0];
  }

  async updateAnimalReport(id: string, updates: Partial<AnimalReport>): Promise<AnimalReport | undefined> {
    const result = await db.update(animalReports)
      .set(updates)
      .where(eq(animalReports.id, id))
      .returning();
    
    return result[0];
  }
}

// Use PostgreSQL storage
export const storage = new DbStorage();
