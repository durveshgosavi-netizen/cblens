import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DishCard from "./DishCard";
import { Camera, Calendar, MapPin, Utensils } from "lucide-react";

interface MenuViewProps {
  onStartScan: () => void;
}

// Mock menu data
const mockMenuData = {
  date: "Today, March 15",
  location: "Canteen North Wing",
  dishes: [
    {
      id: "1",
      name: "Grilled Salmon with Quinoa",
      category: "Main Course",
      protein: 32,
      carbs: 28,
      fat: 14,
      calories: 340,
      allergens: ["fish"],
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&auto=format&q=80"
    },
    {
      id: "2", 
      name: "Mediterranean Bowl",
      category: "Healthy Choice",
      protein: 18,
      carbs: 42,
      fat: 12,
      calories: 320,
      allergens: ["nuts"],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80"
    },
    {
      id: "3",
      name: "Chicken Tikka Masala",
      category: "International",
      protein: 28,
      carbs: 35,
      fat: 16,
      calories: 380,
      allergens: ["dairy"],
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center&auto=format&q=80"
    },
    {
      id: "4",
      name: "Vegan Buddha Bowl",
      category: "Plant-Based",
      protein: 15,
      carbs: 38,
      fat: 10,
      calories: 280,
      allergens: [],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80"
    }
  ]
};

export default function MenuView({ onStartScan }: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const categories = ["all", "Main Course", "Healthy Choice", "International", "Plant-Based"];
  
  const filteredDishes = selectedCategory === "all" 
    ? mockMenuData.dishes 
    : mockMenuData.dishes.filter(dish => dish.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-glow to-fresh-mint p-6 pb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">CB Lens</h1>
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
              Admin
            </Badge>
          </div>
          
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{mockMenuData.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{mockMenuData.location}</span>
                </div>
              </div>
              
              <Button variant="scan" size="lg" className="w-full" onClick={onStartScan}>
                <Camera className="h-5 w-5 mr-2" />
                Start Scanning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-6 -mt-4 mb-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              <span className="font-medium">Today's Menu</span>
              <Badge variant="secondary" className="ml-auto">
                {filteredDishes.length} dishes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "soft"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Dishes" : category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dishes Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </div>
  );
}