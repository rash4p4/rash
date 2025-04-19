import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Recipe, RecipeDetail } from "@/hooks/use-recipes";
import { Clock, Users, Info, Heart, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface RecipeModalProps {
  recipe: RecipeDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecipeModal({ recipe, open, onOpenChange }: RecipeModalProps) {
  const { toast } = useToast();
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset checked ingredients when recipe changes
    if (recipe && recipe.extendedIngredients) {
      const initialChecked: Record<string, boolean> = {};
      recipe.extendedIngredients.forEach(ingredient => {
        initialChecked[ingredient.id] = false;
      });
      setCheckedIngredients(initialChecked);
    }
  }, [recipe]);

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
    onError: (error) => {
      toast({
        title: "Failed to save recipe",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <DialogTitle className="text-2xl font-merriweather font-bold">{recipe.title}</DialogTitle>
          <DialogClose className="text-gray-500 hover:text-gray-700" />
        </DialogHeader>
        
        <div className="p-6">
          <div className="mb-6">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Prep Time</div>
                <div className="font-medium">{recipe.preparationMinutes || 10} mins</div>
              </div>
            </div>
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Cook Time</div>
                <div className="font-medium">{recipe.cookingMinutes || 15} mins</div>
              </div>
            </div>
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
              <Users className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Servings</div>
                <div className="font-medium">{recipe.servings} people</div>
              </div>
            </div>
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
              <Info className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Difficulty</div>
                <div className="font-medium">{recipe.difficulty || "Medium"}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.diets.map((diet, index) => (
              <span key={index} className="bg-secondary bg-opacity-10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                {diet}
              </span>
            ))}
            {recipe.cuisines && recipe.cuisines.map((cuisine, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {cuisine}
              </span>
            ))}
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-merriweather font-bold mb-3">Description</h3>
            <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: recipe.summary }} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-merriweather font-bold mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {recipe.extendedIngredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center">
                    <Checkbox 
                      id={`ingredient-${ingredient.id}`} 
                      checked={checkedIngredients[ingredient.id] || false}
                      onCheckedChange={() => toggleIngredient(ingredient.id)}
                      className="h-5 w-5 text-secondary rounded border-gray-300"
                    />
                    <label 
                      htmlFor={`ingredient-${ingredient.id}`}
                      className={`ml-3 ${checkedIngredients[ingredient.id] ? 'line-through text-gray-400' : ''}`}
                    >
                      {ingredient.original}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-xl font-merriweather font-bold mb-4">Instructions</h3>
              <ol className="space-y-6">
                {recipe.analyzedInstructions[0]?.steps.map((step) => (
                  <li key={step.number} className="flex">
                    <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      {step.number}
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-700">{step.step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              variant="accent" 
              className="flex items-center justify-center"
              onClick={() => saveRecipeMutation.mutate(recipe.id)}
            >
              <Heart className="h-5 w-5 mr-2" />
              Save Recipe
            </Button>
            <Button className="flex items-center justify-center">
              <FileText className="h-5 w-5 mr-2" />
              Start Cooking Mode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
