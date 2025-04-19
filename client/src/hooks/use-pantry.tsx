import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Ingredient {
  id: number;
  name: string;
  amount?: number;
  unit?: string;
}

export interface AddIngredientRequest {
  name: string;
  amount?: number;
  unit?: string;
}

export function usePantry() {
  const { toast } = useToast();

  const {
    data: ingredients = [],
    isLoading,
    error,
  } = useQuery<Ingredient[]>({
    queryKey: ["/api/user/pantry"],
  });

  const addIngredientMutation = useMutation({
    mutationFn: async (ingredient: AddIngredientRequest) => {
      return apiRequest("POST", "/api/user/pantry", ingredient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/pantry"] });
      toast({
        title: "Ingredient added",
        description: "The ingredient has been added to your pantry",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add ingredient",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeIngredientMutation = useMutation({
    mutationFn: async (ingredientId: number) => {
      return apiRequest("DELETE", `/api/user/pantry/${ingredientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/pantry"] });
      toast({
        title: "Ingredient removed",
        description: "The ingredient has been removed from your pantry",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove ingredient",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: async ({ id, ...ingredient }: Ingredient) => {
      return apiRequest("PATCH", `/api/user/pantry/${id}`, ingredient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/pantry"] });
      toast({
        title: "Ingredient updated",
        description: "The ingredient has been updated in your pantry",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update ingredient",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    ingredients,
    isLoading,
    error,
    addIngredient: addIngredientMutation.mutate,
    removeIngredient: removeIngredientMutation.mutate,
    updateIngredient: updateIngredientMutation.mutate,
    isAddingIngredient: addIngredientMutation.isPending,
    isRemovingIngredient: removeIngredientMutation.isPending,
    isUpdatingIngredient: updateIngredientMutation.isPending,
  };
}
