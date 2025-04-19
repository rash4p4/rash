import { ingredients, users, type User, type InsertUser, Ingredient, InsertIngredient, dietaryPreferences, avoidIngredients, cuisinePreferences, savedRecipes, recipeSettings, DietaryPreference, AvoidIngredient, CuisinePreference, SavedRecipe, RecipeSettings, InsertDietaryPreference, InsertAvoidIngredient, InsertCuisinePreference, InsertSavedRecipe, InsertRecipeSettings } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Memory store for session
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pantry management
  getIngredients(userId: number): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  addIngredient(userId: number, ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined>;
  removeIngredient(id: number): Promise<boolean>;
  
  // Dietary preferences
  getDietaryPreferences(userId: number): Promise<DietaryPreference[]>;
  addDietaryPreference(userId: number, preference: InsertDietaryPreference): Promise<DietaryPreference>;
  updateDietaryPreference(id: number, active: boolean): Promise<DietaryPreference | undefined>;
  
  // Avoid ingredients
  getAvoidIngredients(userId: number): Promise<AvoidIngredient[]>;
  addAvoidIngredient(userId: number, ingredient: InsertAvoidIngredient): Promise<AvoidIngredient>;
  updateAvoidIngredient(id: number, active: boolean): Promise<AvoidIngredient | undefined>;
  
  // Cuisine preferences
  getCuisinePreferences(userId: number): Promise<CuisinePreference[]>;
  addCuisinePreference(userId: number, cuisine: InsertCuisinePreference): Promise<CuisinePreference>;
  updateCuisinePreference(id: number, active: boolean): Promise<CuisinePreference | undefined>;
  
  // Saved recipes
  getSavedRecipes(userId: number): Promise<SavedRecipe[]>;
  getSavedRecipe(userId: number, recipeId: string): Promise<SavedRecipe | undefined>;
  saveRecipe(userId: number, recipe: InsertSavedRecipe): Promise<SavedRecipe>;
  unsaveRecipe(userId: number, recipeId: string): Promise<boolean>;
  
  // Recipe settings
  getRecipeSettings(userId: number): Promise<RecipeSettings | undefined>;
  createRecipeSettings(userId: number, settings: InsertRecipeSettings): Promise<RecipeSettings>;
  updateRecipeSettings(userId: number, settings: Partial<InsertRecipeSettings>): Promise<RecipeSettings | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ingredients: Map<number, Ingredient>;
  private dietaryPreferences: Map<number, DietaryPreference>;
  private avoidIngredients: Map<number, AvoidIngredient>;
  private cuisinePreferences: Map<number, CuisinePreference>;
  private savedRecipes: Map<number, SavedRecipe>;
  private recipeSettings: Map<number, RecipeSettings>;
  
  sessionStore: session.SessionStore;
  
  currentId: number;
  currentIngredientId: number;
  currentDietaryPreferenceId: number;
  currentAvoidIngredientId: number;
  currentCuisinePreferenceId: number;
  currentSavedRecipeId: number;
  currentRecipeSettingsId: number;

  constructor() {
    this.users = new Map();
    this.ingredients = new Map();
    this.dietaryPreferences = new Map();
    this.avoidIngredients = new Map();
    this.cuisinePreferences = new Map();
    this.savedRecipes = new Map();
    this.recipeSettings = new Map();
    
    this.currentId = 1;
    this.currentIngredientId = 1;
    this.currentDietaryPreferenceId = 1;
    this.currentAvoidIngredientId = 1;
    this.currentCuisinePreferenceId = 1;
    this.currentSavedRecipeId = 1;
    this.currentRecipeSettingsId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Pantry management
  async getIngredients(userId: number): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values()).filter(
      (ingredient) => ingredient.userId === userId,
    );
  }
  
  async getIngredient(id: number): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }
  
  async addIngredient(userId: number, ingredient: InsertIngredient): Promise<Ingredient> {
    const id = this.currentIngredientId++;
    const createdAt = new Date();
    const newIngredient: Ingredient = {
      ...ingredient,
      id,
      userId,
      createdAt,
    };
    this.ingredients.set(id, newIngredient);
    return newIngredient;
  }
  
  async updateIngredient(id: number, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined> {
    const existingIngredient = this.ingredients.get(id);
    if (!existingIngredient) return undefined;
    
    const updatedIngredient: Ingredient = {
      ...existingIngredient,
      ...ingredient,
    };
    this.ingredients.set(id, updatedIngredient);
    return updatedIngredient;
  }
  
  async removeIngredient(id: number): Promise<boolean> {
    return this.ingredients.delete(id);
  }
  
  // Dietary preferences
  async getDietaryPreferences(userId: number): Promise<DietaryPreference[]> {
    return Array.from(this.dietaryPreferences.values()).filter(
      (preference) => preference.userId === userId,
    );
  }
  
  async addDietaryPreference(userId: number, preference: InsertDietaryPreference): Promise<DietaryPreference> {
    const id = this.currentDietaryPreferenceId++;
    const newPreference: DietaryPreference = {
      ...preference,
      id,
      userId,
    };
    this.dietaryPreferences.set(id, newPreference);
    return newPreference;
  }
  
  async updateDietaryPreference(id: number, active: boolean): Promise<DietaryPreference | undefined> {
    const existingPreference = this.dietaryPreferences.get(id);
    if (!existingPreference) return undefined;
    
    const updatedPreference: DietaryPreference = {
      ...existingPreference,
      active,
    };
    this.dietaryPreferences.set(id, updatedPreference);
    return updatedPreference;
  }
  
  // Avoid ingredients
  async getAvoidIngredients(userId: number): Promise<AvoidIngredient[]> {
    return Array.from(this.avoidIngredients.values()).filter(
      (ingredient) => ingredient.userId === userId,
    );
  }
  
  async addAvoidIngredient(userId: number, ingredient: InsertAvoidIngredient): Promise<AvoidIngredient> {
    const id = this.currentAvoidIngredientId++;
    const newIngredient: AvoidIngredient = {
      ...ingredient,
      id,
      userId,
    };
    this.avoidIngredients.set(id, newIngredient);
    return newIngredient;
  }
  
  async updateAvoidIngredient(id: number, active: boolean): Promise<AvoidIngredient | undefined> {
    const existingIngredient = this.avoidIngredients.get(id);
    if (!existingIngredient) return undefined;
    
    const updatedIngredient: AvoidIngredient = {
      ...existingIngredient,
      active,
    };
    this.avoidIngredients.set(id, updatedIngredient);
    return updatedIngredient;
  }
  
  // Cuisine preferences
  async getCuisinePreferences(userId: number): Promise<CuisinePreference[]> {
    return Array.from(this.cuisinePreferences.values()).filter(
      (cuisine) => cuisine.userId === userId,
    );
  }
  
  async addCuisinePreference(userId: number, cuisine: InsertCuisinePreference): Promise<CuisinePreference> {
    const id = this.currentCuisinePreferenceId++;
    const newCuisine: CuisinePreference = {
      ...cuisine,
      id,
      userId,
    };
    this.cuisinePreferences.set(id, newCuisine);
    return newCuisine;
  }
  
  async updateCuisinePreference(id: number, active: boolean): Promise<CuisinePreference | undefined> {
    const existingCuisine = this.cuisinePreferences.get(id);
    if (!existingCuisine) return undefined;
    
    const updatedCuisine: CuisinePreference = {
      ...existingCuisine,
      active,
    };
    this.cuisinePreferences.set(id, updatedCuisine);
    return updatedCuisine;
  }
  
  // Saved recipes
  async getSavedRecipes(userId: number): Promise<SavedRecipe[]> {
    return Array.from(this.savedRecipes.values()).filter(
      (recipe) => recipe.userId === userId,
    );
  }
  
  async getSavedRecipe(userId: number, recipeId: string): Promise<SavedRecipe | undefined> {
    return Array.from(this.savedRecipes.values()).find(
      (recipe) => recipe.userId === userId && recipe.recipeId === recipeId,
    );
  }
  
  async saveRecipe(userId: number, recipe: InsertSavedRecipe): Promise<SavedRecipe> {
    const id = this.currentSavedRecipeId++;
    const savedAt = new Date();
    const newRecipe: SavedRecipe = {
      ...recipe,
      id,
      userId,
      savedAt,
    };
    this.savedRecipes.set(id, newRecipe);
    return newRecipe;
  }
  
  async unsaveRecipe(userId: number, recipeId: string): Promise<boolean> {
    const recipe = Array.from(this.savedRecipes.values()).find(
      (r) => r.userId === userId && r.recipeId === recipeId,
    );
    if (recipe) {
      return this.savedRecipes.delete(recipe.id);
    }
    return false;
  }
  
  // Recipe settings
  async getRecipeSettings(userId: number): Promise<RecipeSettings | undefined> {
    return Array.from(this.recipeSettings.values()).find(
      (settings) => settings.userId === userId,
    );
  }
  
  async createRecipeSettings(userId: number, settings: InsertRecipeSettings): Promise<RecipeSettings> {
    const id = this.currentRecipeSettingsId++;
    const newSettings: RecipeSettings = {
      ...settings,
      id,
      userId,
    };
    this.recipeSettings.set(id, newSettings);
    return newSettings;
  }
  
  async updateRecipeSettings(userId: number, settings: Partial<InsertRecipeSettings>): Promise<RecipeSettings | undefined> {
    const existingSettings = Array.from(this.recipeSettings.values()).find(
      (s) => s.userId === userId,
    );
    if (!existingSettings) return undefined;
    
    const updatedSettings: RecipeSettings = {
      ...existingSettings,
      ...settings,
    };
    this.recipeSettings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
