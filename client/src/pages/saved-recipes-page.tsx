import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSavedRecipes } from "@/hooks/use-recipes";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function SavedRecipesPage() {
  const { recipes, isLoading } = useSavedRecipes();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-merriweather font-bold mb-2">Saved Recipes</h1>
            <p className="text-gray-600">
              Your collection of favorite recipes for easy access
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : recipes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No saved recipes yet</h2>
              <p className="text-gray-600 mb-6">
                Start exploring recipes and save your favorites to access them quickly later.
              </p>
              <Link href="/">
                <Button>Browse Recipes</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
