import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User ingredients (pantry items)
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: integer("amount"),
  unit: text("unit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User dietary preferences
export const dietaryPreferences = pgTable("dietary_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preference: text("preference").notNull(), // e.g., vegetarian, vegan, gluten-free
  active: boolean("active").default(true),
});

// Ingredients to avoid (allergies, etc.)
export const avoidIngredients = pgTable("avoid_ingredients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  ingredient: text("ingredient").notNull(),
  active: boolean("active").default(true),
});

// Cuisine preferences
export const cuisinePreferences = pgTable("cuisine_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cuisine: text("cuisine").notNull(), // e.g., Italian, Mexican, Asian
  active: boolean("active").default(true),
});

// Saved recipes
export const savedRecipes = pgTable("saved_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recipeId: text("recipe_id").notNull(),
  title: text("title").notNull(),
  image: text("image"),
  savedAt: timestamp("saved_at").defaultNow(),
}, (table) => {
  return {
    uniqueRecipe: uniqueIndex("unique_saved_recipe").on(table.userId, table.recipeId),
  };
});

// Recipe settings
export const recipeSettings = pgTable("recipe_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  excludeIngredients: boolean("exclude_ingredients").default(true),
  prioritizeHealthy: boolean("prioritize_healthy").default(true),
  showNutritionInfo: boolean("show_nutrition_info").default(true),
  preferQuickRecipes: boolean("prefer_quick_recipes").default(false),
  includeWinePairings: boolean("include_wine_pairings").default(false),
});

// Insert schemas using Zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).pick({
  name: true,
  amount: true,
  unit: true,
});

export const insertDietaryPreferenceSchema = createInsertSchema(dietaryPreferences).pick({
  preference: true,
  active: true,
});

export const insertAvoidIngredientSchema = createInsertSchema(avoidIngredients).pick({
  ingredient: true,
  active: true,
});

export const insertCuisinePreferenceSchema = createInsertSchema(cuisinePreferences).pick({
  cuisine: true,
  active: true,
});

export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).pick({
  recipeId: true,
  title: true,
  image: true,
});

export const insertRecipeSettingsSchema = createInsertSchema(recipeSettings).pick({
  excludeIngredients: true,
  prioritizeHealthy: true,
  showNutritionInfo: true,
  preferQuickRecipes: true,
  includeWinePairings: true,
});

// Types derived from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type InsertDietaryPreference = z.infer<typeof insertDietaryPreferenceSchema>;
export type InsertAvoidIngredient = z.infer<typeof insertAvoidIngredientSchema>;
export type InsertCuisinePreference = z.infer<typeof insertCuisinePreferenceSchema>;
export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type InsertRecipeSettings = z.infer<typeof insertRecipeSettingsSchema>;

// Types derived from tables
export type User = typeof users.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
export type DietaryPreference = typeof dietaryPreferences.$inferSelect;
export type AvoidIngredient = typeof avoidIngredients.$inferSelect;
export type CuisinePreference = typeof cuisinePreferences.$inferSelect;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type RecipeSettings = typeof recipeSettings.$inferSelect;

// Custom schemas
export const recipeFiltersSchema = z.object({
  sort: z.string().optional(),
  diets: z.array(z.string()).optional(),
  cuisine: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type RecipeFilters = z.infer<typeof recipeFiltersSchema>;
