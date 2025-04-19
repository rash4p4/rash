import { Express } from "express";
import { storage } from "../storage";
import { insertIngredientSchema } from "@shared/schema";
import { z } from "zod";

export function setupPantryRoutes(app: Express) {
  // Get all ingredients for the authenticated user
  app.get("/api/user/pantry", async (req, res) => {
    try {
      const userId = req.user!.id;
      const ingredients = await storage.getIngredients(userId);
      res.json(ingredients);
    } catch (error) {
      console.error("Error fetching pantry ingredients:", error);
      res.status(500).json({ message: "Failed to fetch pantry ingredients" });
    }
  });

  // Add a new ingredient to the pantry
  app.post("/api/user/pantry", async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertIngredientSchema.parse(req.body);
      
      const ingredient = await storage.addIngredient(userId, validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      console.error("Error adding pantry ingredient:", error);
      res.status(500).json({ message: "Failed to add ingredient to pantry" });
    }
  });

  // Update an existing ingredient
  app.patch("/api/user/pantry/:id", async (req, res) => {
    try {
      const userId = req.user!.id;
      const ingredientId = parseInt(req.params.id);
      
      if (isNaN(ingredientId)) {
        return res.status(400).json({ message: "Invalid ingredient ID" });
      }
      
      // First check if the ingredient exists and belongs to the user
      const existingIngredient = await storage.getIngredient(ingredientId);
      if (!existingIngredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      if (existingIngredient.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this ingredient" });
      }
      
      // Validate the update data
      const validatedData = insertIngredientSchema.partial().parse(req.body);
      
      const updatedIngredient = await storage.updateIngredient(ingredientId, validatedData);
      if (!updatedIngredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.json(updatedIngredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      console.error("Error updating pantry ingredient:", error);
      res.status(500).json({ message: "Failed to update ingredient" });
    }
  });

  // Delete an ingredient
  app.delete("/api/user/pantry/:id", async (req, res) => {
    try {
      const userId = req.user!.id;
      const ingredientId = parseInt(req.params.id);
      
      if (isNaN(ingredientId)) {
        return res.status(400).json({ message: "Invalid ingredient ID" });
      }
      
      // First check if the ingredient exists and belongs to the user
      const existingIngredient = await storage.getIngredient(ingredientId);
      if (!existingIngredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      if (existingIngredient.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this ingredient" });
      }
      
      const success = await storage.removeIngredient(ingredientId);
      if (!success) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting pantry ingredient:", error);
      res.status(500).json({ message: "Failed to delete ingredient" });
    }
  });
}
