import { Express } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Define schema for preference updates
const dietaryPreferenceSchema = z.object({
  diets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    active: z.boolean()
  })),
  avoidIngredients: z.array(z.object({
    id: z.string(),
    name: z.string(),
    active: z.boolean()
  })),
  cuisinePreferences: z.array(z.object({
    id: z.string(),
    name: z.string(),
    active: z.boolean()
  })),
  settings: z.object({
    excludeIngredients: z.boolean(),
    prioritizeHealthy: z.boolean(),
    showNutritionInfo: z.boolean(),
    preferQuickRecipes: z.boolean(),
    includeWinePairings: z.boolean(),
  })
});

export function setupPreferencesRoutes(app: Express) {
  // Get user preferences
  app.get("/api/user/preferences", async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get dietary preferences
      const dietaryPrefs = await storage.getDietaryPreferences(userId);
      
      // Get avoid ingredients
      const avoidIngredients = await storage.getAvoidIngredients(userId);
      
      // Get cuisine preferences
      const cuisinePrefs = await storage.getCuisinePreferences(userId);
      
      // Get recipe settings
      const settings = await storage.getRecipeSettings(userId);
      
      // Format preferences for frontend
      const formattedDiets = dietaryPrefs.map(pref => ({
        id: pref.preference,
        name: formatPreferenceName(pref.preference),
        active: pref.active
      }));
      
      const formattedAvoidIngredients = avoidIngredients.map(ing => ({
        id: ing.ingredient,
        name: formatPreferenceName(ing.ingredient),
        active: ing.active
      }));
      
      const formattedCuisines = cuisinePrefs.map(cuisine => ({
        id: cuisine.cuisine,
        name: formatPreferenceName(cuisine.cuisine),
        active: cuisine.active
      }));
      
      // If no settings exist, create default settings
      const userSettings = settings || await storage.createRecipeSettings(userId, {
        excludeIngredients: true,
        prioritizeHealthy: true,
        showNutritionInfo: true,
        preferQuickRecipes: false,
        includeWinePairings: false,
      });
      
      res.json({
        diets: formattedDiets,
        avoidIngredients: formattedAvoidIngredients,
        cuisinePreferences: formattedCuisines,
        settings: {
          excludeIngredients: userSettings.excludeIngredients,
          prioritizeHealthy: userSettings.prioritizeHealthy,
          showNutritionInfo: userSettings.showNutritionInfo,
          preferQuickRecipes: userSettings.preferQuickRecipes,
          includeWinePairings: userSettings.includeWinePairings,
        }
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  // Update user preferences
  app.post("/api/user/preferences", async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate input data
      const validatedData = dietaryPreferenceSchema.parse(req.body);
      
      // Process dietary preferences
      await updateDietaryPreferences(userId, validatedData.diets);
      
      // Process avoid ingredients
      await updateAvoidIngredients(userId, validatedData.avoidIngredients);
      
      // Process cuisine preferences
      await updateCuisinePreferences(userId, validatedData.cuisinePreferences);
      
      // Process recipe settings
      await updateRecipeSettings(userId, validatedData.settings);
      
      res.status(200).json({ message: "Preferences updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
}

// Helper function to format preference name (e.g., "gluten-free" -> "Gluten Free")
function formatPreferenceName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper functions to update various preferences

async function updateDietaryPreferences(userId: number, diets: any[]) {
  // Get existing preferences
  const existingPrefs = await storage.getDietaryPreferences(userId);
  
  // Process each diet
  for (const diet of diets) {
    const existingPref = existingPrefs.find(p => p.preference === diet.id);
    
    if (existingPref) {
      // Update existing preference
      await storage.updateDietaryPreference(existingPref.id, diet.active);
    } else {
      // Add new preference
      await storage.addDietaryPreference(userId, {
        preference: diet.id,
        active: diet.active
      });
    }
  }
}

async function updateAvoidIngredients(userId: number, ingredients: any[]) {
  // Get existing avoid ingredients
  const existingIngredients = await storage.getAvoidIngredients(userId);
  
  // Process each ingredient
  for (const ingredient of ingredients) {
    const existingIngredient = existingIngredients.find(i => i.ingredient === ingredient.id);
    
    if (existingIngredient) {
      // Update existing ingredient
      await storage.updateAvoidIngredient(existingIngredient.id, ingredient.active);
    } else {
      // Add new ingredient
      await storage.addAvoidIngredient(userId, {
        ingredient: ingredient.id,
        active: ingredient.active
      });
    }
  }
}

async function updateCuisinePreferences(userId: number, cuisines: any[]) {
  // Get existing cuisine preferences
  const existingCuisines = await storage.getCuisinePreferences(userId);
  
  // Process each cuisine
  for (const cuisine of cuisines) {
    const existingCuisine = existingCuisines.find(c => c.cuisine === cuisine.id);
    
    if (existingCuisine) {
      // Update existing cuisine
      await storage.updateCuisinePreference(existingCuisine.id, cuisine.active);
    } else {
      // Add new cuisine
      await storage.addCuisinePreference(userId, {
        cuisine: cuisine.id,
        active: cuisine.active
      });
    }
  }
}

async function updateRecipeSettings(userId: number, settings: any) {
  // Get existing settings
  const existingSettings = await storage.getRecipeSettings(userId);
  
  if (existingSettings) {
    // Update existing settings
    await storage.updateRecipeSettings(userId, settings);
  } else {
    // Create new settings
    await storage.createRecipeSettings(userId, settings);
  }
}
