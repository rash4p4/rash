import { useRecipeDetail } from "@/hooks/use-recipes";
import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Clock, Heart, FileText, ChevronLeft, Users, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const { recipe, isLoading } = useRecipeDetail(id);
  const { toast } = useToast();
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  
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

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
            <p className="text-gray-600 mb-6">
              The recipe you're looking for doesn't exist or was removed.
            </p>
            <Link href="/">
              <Button>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Recipes
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Link href="/">
              <Button variant="link" className="pl-0">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Recipes
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="relative">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 w-full">
                  <h1 className="text-3xl md:text-4xl font-merriweather font-bold text-white mb-2">
                    {recipe.title}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {recipe.diets.map((diet, index) => (
                      <span key={index} className="bg-secondary bg-opacity-80 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Total Time</div>
                    <div className="font-medium">{recipe.readyInMinutes} mins</div>
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
              
              <div className="mb-8">
                <h2 className="text-xl font-merriweather font-bold mb-3">Description</h2>
                <div className="text-gray-600 prose" dangerouslySetInnerHTML={{ __html: recipe.summary }} />
              </div>
              
              <Separator className="my-8" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-1">
                  <h2 className="text-xl font-merriweather font-bold mb-4">Ingredients</h2>
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
                          className={`ml-3 cursor-pointer ${checkedIngredients[ingredient.id] ? 'line-through text-gray-400' : ''}`}
                        >
                          {ingredient.original}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-xl font-merriweather font-bold mb-4">Instructions</h2>
                  {recipe.analyzedInstructions.length > 0 ? (
                    <ol className="space-y-6">
                      {recipe.analyzedInstructions[0].steps.map((step) => (
                        <li key={step.number} className="flex">
                          <div 
                            className={`rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                              checkedSteps[step.number] 
                                ? 'bg-gray-300 text-gray-600' 
                                : 'bg-secondary text-white'
                            }`}
                          >
                            {step.number}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-start">
                              <p className={`text-gray-700 ${checkedSteps[step.number] ? 'line-through text-gray-400' : ''}`}>
                                {step.step}
                              </p>
                              <Checkbox 
                                className="ml-2 mt-1 h-5 w-5 text-secondary rounded border-gray-300"
                                checked={checkedSteps[step.number] || false}
                                onCheckedChange={() => toggleStep(step.number)}
                              />
                            </div>
                            {step.ingredients.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {step.ingredients.map(ing => (
                                  <span key={ing.id} className="bg-primary bg-opacity-10 text-primary px-2 py-0.5 rounded text-xs">
                                    {ing.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-600">{recipe.instructions || "No detailed instructions available."}</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => saveRecipeMutation.mutate(recipe.id)}
                >
                  <Heart className={`mr-2 h-5 w-5 ${recipe.isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {recipe.isSaved ? 'Saved' : 'Save Recipe'}
                </Button>
                <Button className="flex items-center justify-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Start Cooking Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
