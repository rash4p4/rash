import { Express } from "express";
import { storage } from "../storage";
import { insertSavedRecipeSchema, recipeFiltersSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || "demo-key";

// Helper function to build a recipe object from API data
function buildRecipeObject(recipe: any, userId: number, savedRecipes: any[]) {
  const isSaved = savedRecipes.some(saved => saved.recipeId === recipe.id.toString());
  
  return {
    id: recipe.id.toString(),
    title: recipe.title,
    image: recipe.image || `https://spoonacular.com/recipeImages/${recipe.id}-556x370.jpg`,
    readyInMinutes: recipe.readyInMinutes || 30,
    servings: recipe.servings || 4,
    summary: recipe.summary || "",
    diets: recipe.diets || [],
    difficulty: getDifficultyLevel(recipe),
    missingIngredients: recipe.missedIngredientCount || 0,
    rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20).toFixed(1) : "4.5",
    isSaved
  };
}

// Helper function to determine recipe difficulty based on various factors
function getDifficultyLevel(recipe: any): string {
  // This is a simplified version - in a real app, you'd use more factors
  if (recipe.readyInMinutes <= 20) return "Easy";
  if (recipe.readyInMinutes <= 40) return "Medium";
  return "Hard";
}

// This function builds API query parameters based on user preferences and ingredients
async function buildRecipeQueryParams(userId: number) {
  // Get user's pantry ingredients
  const pantryIngredients = await storage.getIngredients(userId);
  const ingredientNames = pantryIngredients.map(ing => ing.name).join(",");
  
  // Get user's dietary preferences
  const dietPreferences = await storage.getDietaryPreferences(userId);
  const activeDiets = dietPreferences
    .filter(pref => pref.active)
    .map(pref => pref.preference)
    .join(",");
  
  // Get ingredients to avoid
  const avoidList = await storage.getAvoidIngredients(userId);
  const intolerances = avoidList
    .filter(item => item.active)
    .map(item => item.ingredient)
    .join(",");
  
  // Get recipe settings
  const settings = await storage.getRecipeSettings(userId);
  
  return {
    ingredients: ingredientNames,
    diet: activeDiets || undefined,
    intolerances: intolerances || undefined,
    number: 10,
    ranking: settings?.prioritizeHealthy ? 2 : 1, // 1 = maximize used ingredients, 2 = minimize missing ingredients
    ignorePantry: false
  };
}

export function setupRecipeRoutes(app: Express) {
  // Get recipe recommendations based on pantry ingredients and preferences
  app.get("/api/recipes", async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Parse and validate query parameters
      const filters = recipeFiltersSchema.parse({
        sort: req.query.sort as string,
        diets: req.query.diet ? [req.query.diet as string] : undefined,
        cuisine: req.query.cuisine as string,
        query: req.query.query as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      });
      
      // Build API query parameters
      const queryParams = await buildRecipeQueryParams(userId);
      
      // Additional filters from the request
      if (filters.diets && filters.diets.length > 0) {
        queryParams.diet = filters.diets.join(",");
      }
      
      if (filters.cuisine) {
        queryParams.cuisine = filters.cuisine;
      }
      
      if (filters.query) {
        queryParams.query = filters.query;
      }
      
      if (filters.limit) {
        queryParams.number = filters.limit;
      }
      
      // Get user's saved recipes
      const savedRecipes = await storage.getSavedRecipes(userId);
      
      // Make API request to Spoonacular
      const response = await axios.get('/recipes/findByIngredients', {
        params: {
          ...queryParams,
          apiKey: SPOONACULAR_API_KEY
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        return res.status(500).json({ message: "Invalid response from recipe API" });
      }
      
      // Get additional recipe information
      const recipeIds = response.data.map((recipe: any) => recipe.id).join(",");
      const recipeInfoResponse = await axios.get('/recipes/informationBulk', {
        params: {
          ids: recipeIds,
          apiKey: SPOONACULAR_API_KEY
        }
      });
      
      // Merge information from both API calls
      const recipes = recipeInfoResponse.data.map((recipe: any) => {
        const matchingRecipe = response.data.find((r: any) => r.id === recipe.id);
        if (matchingRecipe) {
          recipe.missedIngredientCount = matchingRecipe.missedIngredientCount || 0;
          recipe.usedIngredientCount = matchingRecipe.usedIngredientCount || 0;
        }
        return buildRecipeObject(recipe, userId, savedRecipes);
      });
      
      // Sort recipes based on sort parameter
      if (filters.sort) {
        sortRecipes(recipes, filters.sort);
      }
      
      // Return paginated results
      res.json({
        recipes: recipes.slice(0, filters.limit),
        total: recipes.length
      });
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Get specific recipe details
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const userId = req.user!.id;
      const recipeId = req.params.id;
      
      // Get user's saved recipes to check if this one is saved
      const savedRecipes = await storage.getSavedRecipes(userId);
      const isSaved = savedRecipes.some(recipe => recipe.recipeId === recipeId);
      
      // Make API request to Spoonacular
      const response = await axios.get(`/recipes/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: false
        }
      });
      
      if (!response.data) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Add the isSaved field to the response
      const recipe = {
        ...response.data,
        isSaved
      };
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      res.status(500).json({ message: "Failed to fetch recipe details" });
    }
  });
  
  // Save a recipe
  app.post("/api/user/recipes/saved/:id", async (req, res) => {
    try {
      const userId = req.user!.id;
      const recipeId = req.params.id;
      
      // Check if recipe is already saved
      const existingSaved = await storage.getSavedRecipe(userId, recipeId);
      if (existingSaved) {
        return res.status(409).json({ message: "Recipe already saved" });
      }
      
      // Fetch recipe details from Spoonacular
      const response = await axios.get(`/recipes/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY
        }
      });
      
      if (!response.data) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Create saved recipe entry
      const savedRecipe = await storage.saveRecipe(userId, {
        recipeId,
        title: response.data.title,
        image: response.data.image
      });
      
      res.status(201).json(savedRecipe);
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Failed to save recipe" });
    }
  });
  
  // Get saved recipes
  app.get("/api/user/recipes/saved", async (req, res) => {
    try {
      const userId = req.user!.id;
      const savedRecipes = await storage.getSavedRecipes(userId);
      
      // If we have saved recipes, we need to fetch their details
      if (savedRecipes.length > 0) {
        const recipeIds = savedRecipes.map(recipe => recipe.recipeId).join(",");
        const response = await axios.get('/recipes/informationBulk', {
          params: {
            ids: recipeIds,
            apiKey: SPOONACULAR_API_KEY
          }
        });
        
        // Map the recipe data and add isSaved = true
        const recipes = response.data.map((recipe: any) => buildRecipeObject(recipe, userId, savedRecipes));
        
        return res.json(recipes);
      }
      
      res.json([]);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Failed to fetch saved recipes" });
    }
  });
  
  // Unsave a recipe
  app.delete("/api/user/recipes/saved/:id", async (req, res) => {
    try {
      const userId = req.user!.id;
      const recipeId = req.params.id;
      
      const success = await storage.unsaveRecipe(userId, recipeId);
      if (!success) {
        return res.status(404).json({ message: "Saved recipe not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing saved recipe:", error);
      res.status(500).json({ message: "Failed to remove saved recipe" });
    }
  });
}

// Helper function to sort recipes
function sortRecipes(recipes: any[], sortBy: string) {
  switch (sortBy) {
    case 'match':
      // Sort by number of missing ingredients (ascending)
      recipes.sort((a, b) => a.missingIngredients - b.missingIngredients);
      break;
    case 'time':
      // Sort by preparation time (ascending)
      recipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
      break;
    case 'difficulty':
      // Sort by difficulty (Easy -> Medium -> Hard)
      const difficultyScore = (difficulty: string) => {
        if (difficulty === 'Easy') return 1;
        if (difficulty === 'Medium') return 2;
        return 3;
      };
      recipes.sort((a, b) => difficultyScore(a.difficulty) - difficultyScore(b.difficulty));
      break;
    case 'rating':
      // Sort by rating (descending)
      recipes.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;
    default:
      // Default sort by match
      recipes.sort((a, b) => a.missingIngredients - b.missingIngredients);
  }
}
