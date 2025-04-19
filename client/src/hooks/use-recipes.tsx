import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  diets: string[];
  difficulty: string;
  missingIngredients: number;
  rating: number;
  isSaved: boolean;
}

export interface ExtendedIngredient {
  id: string;
  aisle: string;
  amount: number;
  consistency: string;
  image: string;
  name: string;
  original: string;
  unit: string;
}

export interface Step {
  number: number;
  step: string;
  ingredients: { id: string; name: string; localizedName: string; image: string }[];
  equipment: { id: string; name: string; localizedName: string; image: string }[];
}

export interface RecipeDetail extends Recipe {
  instructions: string;
  extendedIngredients: ExtendedIngredient[];
  analyzedInstructions: { name: string; steps: Step[] }[];
  preparationMinutes: number;
  cookingMinutes: number;
  cuisines: string[];
  dishTypes: string[];
  occasions: string[];
  winePairing: { pairedWines: string[]; pairingText: string; productMatches: any[] };
  difficulty: string;
  popularity: number;
}

interface RecipesOptions {
  sort?: string;
  diets?: string[];
  cuisine?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export function useRecipes(options: RecipesOptions = {}) {
  const { toast } = useToast();

  const queryParams = new URLSearchParams();
  if (options.sort) queryParams.append("sort", options.sort);
  if (options.diets && options.diets.length > 0) {
    options.diets.forEach(diet => queryParams.append("diet", diet));
  }
  if (options.cuisine) queryParams.append("cuisine", options.cuisine);
  if (options.query) queryParams.append("query", options.query);
  if (options.limit) queryParams.append("limit", options.limit.toString());
  if (options.offset) queryParams.append("offset", options.offset.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const {
    data,
    isLoading,
    error,
  } = useQuery<{ recipes: Recipe[]; total: number }>({
    queryKey: [`/api/recipes${queryString}`],
  });

  return {
    recipes: data?.recipes || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
}

export function useRecipeDetail(id: string) {
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery<RecipeDetail>({
    queryKey: [`/api/recipes/${id}`],
    enabled: Boolean(id),
  });

  return {
    recipe,
    isLoading,
    error,
  };
}

export function useSavedRecipes() {
  const {
    data: recipes = [],
    isLoading,
    error,
  } = useQuery<Recipe[]>({
    queryKey: ["/api/user/recipes/saved"],
  });

  return {
    recipes,
    isLoading,
    error,
  };
}

export function useRecipeActions() {
  const { toast } = useToast();

  const saveRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      await apiRequest("POST", `/api/user/recipes/saved/${recipeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/recipes/saved"] });
      toast({
        title: "Recipe saved",
        description: "The recipe has been added to your saved recipes"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save recipe",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const unsaveRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      await apiRequest("DELETE", `/api/user/recipes/saved/${recipeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/recipes/saved"] });
      toast({
        title: "Recipe removed",
        description: "The recipe has been removed from your saved recipes"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove recipe",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    saveRecipe: saveRecipeMutation.mutate,
    unsaveRecipe: unsaveRecipeMutation.mutate,
    isSaving: saveRecipeMutation.isPending,
    isRemoving: unsaveRecipeMutation.isPending
  };
}
