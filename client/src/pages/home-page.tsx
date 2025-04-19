import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useRecipes } from "@/hooks/use-recipes";
import { usePantry } from "@/hooks/use-pantry";
import DietaryTags, { DietaryTag } from "@/components/DietaryTags";
import { Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function HomePage() {
  const [sortBy, setSortBy] = useState("match");
  const { ingredients, isLoading: isPantryLoading } = usePantry();
  
  // In a real app, this would be fetched from user preferences
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([
    { id: "1", name: "Vegetarian", active: true },
    { id: "2", name: "Low Carb", active: true },
    { id: "3", name: "Gluten Free", active: false },
    { id: "4", name: "Dairy Free", active: false },
    { id: "5", name: "Vegan", active: false },
    { id: "6", name: "Keto", active: false },
    { id: "7", name: "High Protein", active: false },
  ]);

  const activeDietaryFilters = dietaryTags
    .filter(tag => tag.active)
    .map(tag => tag.name.toLowerCase().replace(' ', '-'));

  const { recipes, isLoading: isRecipesLoading, total } = useRecipes({
    sort: sortBy,
    diets: activeDietaryFilters,
    limit: 8
  });

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-light py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-merriweather font-bold mb-4">
                Discover recipes with what you already have
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Turn your pantry ingredients into delicious meals tailored to your dietary preferences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pantry">
                  <Button size="xl" variant="default" className="bg-white text-primary hover:bg-gray-100">
                    Update My Pantry
                  </Button>
                </Link>
                <Button size="xl" variant="secondary">
                  Find Recipes
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dietary Preferences Section */}
        <section className="bg-white py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-merriweather font-bold">Dietary Preferences</h2>
              <Link href="/preferences">
                <Button variant="link" className="text-secondary hover:text-secondary-light font-medium text-sm">
                  Edit Preferences
                </Button>
              </Link>
            </div>
            <DietaryTags tags={dietaryTags} />
          </div>
        </section>

        {/* Recipe Recommendations Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-merriweather font-bold mb-2">Recommended Recipes</h2>
                <p className="text-gray-600">
                  Based on your {isPantryLoading ? "..." : ingredients.length} pantry ingredients
                </p>
              </div>
              <div className="flex items-center mt-4 md:mt-0">
                <span className="mr-2 text-sm font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort recipes</SelectLabel>
                      <SelectItem value="match">Match Percentage</SelectItem>
                      <SelectItem value="time">Prep Time</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isRecipesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No recipes found. Try adjusting your filters or adding more ingredients to your pantry.</p>
              </div>
            ) : (
              <>
                {/* Recipe Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      matchPercentage={Math.round(100 - (recipe.missingIngredients * 5))}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {recipes.length < total && (
                  <div className="text-center mt-8">
                    <Button variant="link" className="text-secondary font-semibold hover:text-secondary-light inline-flex items-center">
                      <span>Load more recipes</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-merriweather font-bold mb-6">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pantry Management Card */}
              <div className="bg-background rounded-lg p-6 border border-gray-200">
                <div className="flex items-start">
                  <div className="bg-primary-light bg-opacity-20 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-merriweather font-bold mb-2">My Pantry</h3>
                    <p className="text-sm text-gray-600 mb-3">Manage your ingredients and get personalized recipe suggestions.</p>
                    <Link href="/pantry">
                      <a className="text-primary font-medium text-sm hover:text-primary-light">Update Pantry →</a>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Saved Recipes Card */}
              <div className="bg-background rounded-lg p-6 border border-gray-200">
                <div className="flex items-start">
                  <div className="bg-secondary-light bg-opacity-20 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-merriweather font-bold mb-2">Saved Recipes</h3>
                    <p className="text-sm text-gray-600 mb-3">Access your favorite recipes quickly for future reference.</p>
                    <Link href="/saved-recipes">
                      <a className="text-primary font-medium text-sm hover:text-primary-light">View Saved Recipes →</a>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dietary Settings Card */}
              <div className="bg-background rounded-lg p-6 border border-gray-200">
                <div className="flex items-start">
                  <div className="bg-accent bg-opacity-20 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-merriweather font-bold mb-2">Dietary Settings</h3>
                    <p className="text-sm text-gray-600 mb-3">Customize your dietary preferences and restrictions.</p>
                    <Link href="/preferences">
                      <a className="text-primary font-medium text-sm hover:text-primary-light">Adjust Settings →</a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
