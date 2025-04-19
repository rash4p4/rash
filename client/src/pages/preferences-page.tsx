import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PreferencesPage() {
  const { toast } = useToast();
  
  // This would typically come from an API call in a real app
  const [preferences, setPreferences] = useState({
    diets: [
      { id: "vegetarian", name: "Vegetarian", active: true },
      { id: "vegan", name: "Vegan", active: false },
      { id: "gluten-free", name: "Gluten Free", active: false },
      { id: "dairy-free", name: "Dairy Free", active: false },
      { id: "low-carb", name: "Low Carb", active: true },
      { id: "keto", name: "Keto", active: false },
      { id: "paleo", name: "Paleo", active: false },
      { id: "high-protein", name: "High Protein", active: false },
    ],
    avoidIngredients: [
      { id: "peanuts", name: "Peanuts", active: true },
      { id: "shellfish", name: "Shellfish", active: false },
      { id: "eggs", name: "Eggs", active: false },
      { id: "soy", name: "Soy", active: false },
      { id: "tree-nuts", name: "Tree Nuts", active: false },
    ],
    cuisinePreferences: [
      { id: "italian", name: "Italian", active: true },
      { id: "mexican", name: "Mexican", active: true },
      { id: "asian", name: "Asian", active: false },
      { id: "mediterranean", name: "Mediterranean", active: true },
      { id: "american", name: "American", active: false },
      { id: "indian", name: "Indian", active: false },
      { id: "french", name: "French", active: false },
    ],
    settings: {
      excludeIngredients: true,
      prioritizeHealthy: true,
      showNutritionInfo: true,
      preferQuickRecipes: false,
      includeWinePairings: false,
    }
  });
  
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: typeof preferences) => {
      return apiRequest("POST", "/api/user/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Preferences saved",
        description: "Your dietary preferences have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const toggleDiet = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      diets: prev.diets.map(diet => 
        diet.id === id ? { ...diet, active: !diet.active } : diet
      )
    }));
  };
  
  const toggleIngredient = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      avoidIngredients: prev.avoidIngredients.map(ing => 
        ing.id === id ? { ...ing, active: !ing.active } : ing
      )
    }));
  };
  
  const toggleCuisine = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.map(cuisine => 
        cuisine.id === id ? { ...cuisine, active: !cuisine.active } : cuisine
      )
    }));
  };
  
  const toggleSetting = (key: keyof typeof preferences.settings) => {
    setPreferences(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key]
      }
    }));
  };
  
  const savePreferences = () => {
    savePreferencesMutation.mutate(preferences);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-merriweather font-bold mb-2">Dietary Preferences</h1>
              <p className="text-gray-600">
                Customize your recipe recommendations based on your dietary needs
              </p>
            </div>
            <Button 
              onClick={savePreferences} 
              size="lg" 
              className="mt-4 md:mt-0"
              disabled={savePreferencesMutation.isPending}
            >
              {savePreferencesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Dietary Restrictions</CardTitle>
                <CardDescription>
                  Select the dietary restrictions you follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preferences.diets.map(diet => (
                    <div key={diet.id} className="flex items-center justify-between">
                      <Label htmlFor={`diet-${diet.id}`} className="cursor-pointer flex-1">
                        {diet.name}
                      </Label>
                      <Switch 
                        id={`diet-${diet.id}`} 
                        checked={diet.active}
                        onCheckedChange={() => toggleDiet(diet.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ingredients to Avoid</CardTitle>
                <CardDescription>
                  Specify ingredients you want to exclude from recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preferences.avoidIngredients.map(ingredient => (
                    <div key={ingredient.id} className="flex items-center justify-between">
                      <Label htmlFor={`ing-${ingredient.id}`} className="cursor-pointer flex-1">
                        {ingredient.name}
                      </Label>
                      <Switch 
                        id={`ing-${ingredient.id}`} 
                        checked={ingredient.active}
                        onCheckedChange={() => toggleIngredient(ingredient.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cuisine Preferences</CardTitle>
                <CardDescription>
                  Select cuisines you enjoy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preferences.cuisinePreferences.map(cuisine => (
                    <div key={cuisine.id} className="flex items-center justify-between">
                      <Label htmlFor={`cuisine-${cuisine.id}`} className="cursor-pointer flex-1">
                        {cuisine.name}
                      </Label>
                      <Switch 
                        id={`cuisine-${cuisine.id}`} 
                        checked={cuisine.active}
                        onCheckedChange={() => toggleCuisine(cuisine.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recipe Settings</CardTitle>
                <CardDescription>
                  Customize your recipe experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="setting-exclude" className="cursor-pointer flex-1">
                      Strictly exclude avoided ingredients
                    </Label>
                    <Switch 
                      id="setting-exclude" 
                      checked={preferences.settings.excludeIngredients}
                      onCheckedChange={() => toggleSetting('excludeIngredients')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="setting-healthy" className="cursor-pointer flex-1">
                      Prioritize healthy recipes
                    </Label>
                    <Switch 
                      id="setting-healthy" 
                      checked={preferences.settings.prioritizeHealthy}
                      onCheckedChange={() => toggleSetting('prioritizeHealthy')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="setting-nutrition" className="cursor-pointer flex-1">
                      Show nutrition information
                    </Label>
                    <Switch 
                      id="setting-nutrition" 
                      checked={preferences.settings.showNutritionInfo}
                      onCheckedChange={() => toggleSetting('showNutritionInfo')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="setting-quick" className="cursor-pointer flex-1">
                      Prefer quick recipes (under 30 min)
                    </Label>
                    <Switch 
                      id="setting-quick" 
                      checked={preferences.settings.preferQuickRecipes}
                      onCheckedChange={() => toggleSetting('preferQuickRecipes')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="setting-wine" className="cursor-pointer flex-1">
                      Include wine pairing suggestions
                    </Label>
                    <Switch 
                      id="setting-wine" 
                      checked={preferences.settings.includeWinePairings}
                      onCheckedChange={() => toggleSetting('includeWinePairings')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
