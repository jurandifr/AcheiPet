import { queryClient } from "./queryClient";
import type { AnimalReport, AnimalFilter } from "@shared/schema";

export const api = {
  // Get all animal reports with optional filters
  getAnimalReports: async (filters?: AnimalFilter): Promise<AnimalReport[]> => {
    const params = new URLSearchParams();
    if (filters?.tipo && filters.tipo !== "all") {
      params.append("tipo", filters.tipo);
    }
    if (filters?.raca && filters.raca !== "all") {
      params.append("raca", filters.raca);
    }

    const response = await fetch(`/api/reports?${params.toString()}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch animal reports");
    }

    return response.json();
  },

  // Get specific animal report
  getAnimalReport: async (id: string): Promise<AnimalReport> => {
    const response = await fetch(`/api/reports/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch animal report");
    }

    return response.json();
  },

  // Create new animal report
  createAnimalReport: async (formData: FormData): Promise<AnimalReport> => {
    const response = await fetch("/api/reports", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create animal report");
    }

    return response.json();
  },
};
