import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupPantryRoutes } from "./api/pantry";
import { setupRecipeRoutes } from "./api/recipes";
import { setupPreferencesRoutes } from "./api/preferences";
import axios from "axios";

// Configure Axios defaults for recipe API
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || "demo-key";
axios.defaults.baseURL = "https://api.spoonacular.com";
axios.defaults.params = { apiKey: SPOONACULAR_API_KEY };

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // API middleware to check authentication for all /api routes except auth ones
  app.use("/api", (req, res, next) => {
    const isAuthRoute = req.path.startsWith("/login") || req.path.startsWith("/register") || req.path.startsWith("/logout") || req.path === "/user";
    
    if (!isAuthRoute && !req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to access this resource" });
    }
    
    next();
  });
  
  // Setup application routes
  setupPantryRoutes(app);
  setupRecipeRoutes(app);
  setupPreferencesRoutes(app);

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
