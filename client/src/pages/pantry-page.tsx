import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usePantry } from "@/hooks/use-pantry";
import { useState } from "react";
import { Loader2, PlusCircle, Search, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const addIngredientSchema = z.object({
  name: z.string().min(2, "Ingredient name must be at least 2 characters long"),
  amount: z.string().optional(),
  unit: z.string().optional()
});

export default function PantryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editIngredientId, setEditIngredientId] = useState<number | null>(null);
  
  const { 
    ingredients, 
    isLoading, 
    addIngredient, 
    removeIngredient, 
    updateIngredient,
    isAddingIngredient,
    isRemovingIngredient,
    isUpdatingIngredient
  } = usePantry();
  
  const form = useForm<z.infer<typeof addIngredientSchema>>({
    resolver: zodResolver(addIngredientSchema),
    defaultValues: {
      name: "",
      amount: "",
      unit: ""
    }
  });
  
  const handleAddIngredient = (values: z.infer<typeof addIngredientSchema>) => {
    // Convert amount to number if provided
    const ingredientData = {
      name: values.name,
      amount: values.amount ? parseFloat(values.amount) : undefined,
      unit: values.unit
    };
    
    if (editIngredientId !== null) {
      updateIngredient({
        id: editIngredientId,
        ...ingredientData
      });
    } else {
      addIngredient(ingredientData);
    }
    
    form.reset();
    setDialogOpen(false);
    setEditIngredientId(null);
  };
  
  const handleRemoveIngredient = (id: number) => {
    removeIngredient(id);
  };
  
  const handleEditIngredient = (ingredient: any) => {
    setEditIngredientId(ingredient.id);
    form.reset({
      name: ingredient.name,
      amount: ingredient.amount?.toString() || "",
      unit: ingredient.unit || ""
    });
    setDialogOpen(true);
  };
  
  const filteredIngredients = searchQuery.trim() === "" 
    ? ingredients 
    : ingredients.filter(ing => 
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Group ingredients by category (in a real app, each ingredient would have a category)
  const groupedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    // This is just a simple categorization for example purposes
    // In a real app, you would have proper categories in your data
    const firstLetter = ingredient.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(ingredient);
    return acc;
  }, {} as Record<string, typeof ingredients>);
  
  const sortedGroups = Object.keys(groupedIngredients).sort();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-merriweather font-bold mb-2">My Pantry</h1>
              <p className="text-gray-600">
                Manage your ingredients to get personalized recipe recommendations
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editIngredientId !== null ? "Edit Ingredient" : "Add Ingredient to Pantry"}
                  </DialogTitle>
                  <DialogDescription>
                    {editIngredientId !== null 
                      ? "Update your ingredient details below."
                      : "Enter the details of the ingredient you want to add to your pantry."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddIngredient)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredient Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Tomatoes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. grams" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" disabled={isAddingIngredient || isUpdatingIngredient}>
                        {(isAddingIngredient || isUpdatingIngredient) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editIngredientId !== null ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          editIngredientId !== null ? "Update Ingredient" : "Add to Pantry"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search ingredients..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredIngredients.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 mb-4">
                  {searchQuery.trim() !== "" 
                    ? "No ingredients found matching your search."
                    : "Your pantry is empty. Start by adding ingredients!"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setDialogOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Ingredient
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map(group => (
                <div key={group}>
                  <h2 className="text-xl font-merriweather font-bold mb-3">{group}</h2>
                  <Card>
                    <CardContent className="py-4">
                      <ul className="divide-y">
                        {groupedIngredients[group].map((ingredient, index) => (
                          <li key={ingredient.id} className="py-3 flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{ingredient.name}</h3>
                              {ingredient.amount && ingredient.unit && (
                                <p className="text-sm text-gray-500">
                                  {ingredient.amount} {ingredient.unit}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditIngredient(ingredient)}
                                disabled={isUpdatingIngredient || isRemovingIngredient}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveIngredient(ingredient.id)}
                                disabled={isRemovingIngredient}
                              >
                                {isRemovingIngredient && ingredient.id === editIngredientId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-merriweather font-bold mb-4">
              What happens with my pantry ingredients?
            </h2>
            <Separator className="mb-4" />
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Recipe Matching:</strong> We use your pantry ingredients to find recipes that you can make with what you already have.
              </p>
              <p>
                <strong>Reduced Food Waste:</strong> By tracking what you have, you'll be more likely to use ingredients before they expire.
              </p>
              <p>
                <strong>Shopping Suggestions:</strong> We'll help you identify key ingredients to buy that will unlock the most new recipes.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
