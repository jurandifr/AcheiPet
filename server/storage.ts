import { type AnimalReport, type InsertAnimalReport } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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

export const storage = new MemStorage();
