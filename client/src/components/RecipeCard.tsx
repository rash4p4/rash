import { Recipe } from "@/hooks/use-recipes";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Clock, Heart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
  matchPercentage?: number;
}

export default function RecipeCard({ recipe, matchPercentage }: RecipeCardProps) {
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
    onError: (error) => {
      toast({
        title: "Failed to save recipe",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveRecipeMutation.mutate(recipe.id);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow recipe-card">
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-48 object-cover"
        />
        {matchPercentage && (
          <div className="absolute top-3 left-3 bg-accent text-text font-bold px-2 py-1 rounded text-xs">
            {matchPercentage}% Match
          </div>
        )}
        <button 
          className="absolute top-3 right-3 bg-white bg-opacity-80 p-1.5 rounded-full shadow hover:bg-opacity-100"
          onClick={handleSave}
        >
          <Heart className={`h-5 w-5 ${recipe.isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-merriweather font-bold text-lg line-clamp-2">{recipe.title}</h3>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium">{recipe.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Clock className="h-4 w-4 mr-1" />
          <span>{recipe.readyInMinutes} mins</span>
          <span className="mx-2">•</span>
          <span>{recipe.difficulty}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.summary}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {recipe.missingIngredients === 0 ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Have All</span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Missing {recipe.missingIngredients} {recipe.missingIngredients === 1 ? 'item' : 'items'}
            </span>
          )}
          {recipe.diets.map((diet, index) => (
            <span key={index} className="bg-secondary bg-opacity-10 text-secondary text-xs px-2 py-1 rounded">
              {diet}
            </span>
          ))}
        </div>
        <Link href={`/recipe/${recipe.id}`}>
          <Button className="w-full">
            View Recipe
          </Button>
        </Link>
      </div>
    </div>
  );
}
