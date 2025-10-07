import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { imageProcessor } from "./services/imageProcessor";
import { geocodingService } from "./services/geocoding";
import { analyzeAnimalImage } from "./services/gemini";
import { insertAnimalReportSchema, animalFilterSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth routes - check if user is authenticated
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // POST /api/reports - Create new animal report
  app.post("/api/reports", upload.single('photo'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Photo is required" });
      }

      // Parse and validate request body
      const { latitude, longitude, comentario, contato } = req.body;
      const numLat = parseFloat(latitude);
      const numLng = parseFloat(longitude);

      if (isNaN(numLat) || isNaN(numLng)) {
        return res.status(400).json({ message: "Valid latitude and longitude required" });
      }

      // Process image
      const processedImage = await imageProcessor.processImage(
        req.file.buffer, 
        numLat, 
        numLng
      );

      // Get address from coordinates
      const addressInfo = await geocodingService.reverseGeocode(numLat, numLng);

      // Analyze image with AI
      const aiAnalysis = await analyzeAnimalImage(processedImage.path);

      // Create animal report
      const animalReport = await storage.createAnimalReport({
        latitude: numLat,
        longitude: numLng,
        comentario: comentario || null,
        contato: contato || null,
        pathPhoto: processedImage.filename,
        animalTipo: aiAnalysis.tipo,
        animalRaca: aiAnalysis.raca,
        ...addressInfo
      });

      res.json(animalReport);
    } catch (error) {
      console.error("Error creating animal report:", error);
      res.status(500).json({ message: "Failed to create animal report" });
    }
  });

  // GET /api/reports - Get all animal reports with optional filters
  app.get("/api/reports", async (req, res) => {
    try {
      const filters = animalFilterSchema.parse(req.query);
      const reports = await storage.getAllAnimalReports(filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching animal reports:", error);
      res.status(500).json({ message: "Failed to fetch animal reports" });
    }
  });

  // GET /api/reports/:id - Get specific animal report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getAnimalReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Animal report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching animal report:", error);
      res.status(500).json({ message: "Failed to fetch animal report" });
    }
  });

  // GET /api/images/:filename - Serve uploaded images
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const imageBuffer = await imageProcessor.getImageBuffer(filename);
      
      if (!imageBuffer) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.set('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
