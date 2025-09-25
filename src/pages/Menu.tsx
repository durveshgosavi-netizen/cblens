import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Filter, 
  Star, 
  Leaf, 
  ChefHat,
  Clock,
  Plus
} from "lucide-react";

// Mock menu data
const mockMenuItems = [
  {
    id: "1",
    name: "Mediterranean Quinoa Bowl",
    category: "Green Dish",
    description: "Fresh quinoa with roasted vegetables, chickpeas, and tahini dressing",
    calories: 420,
    protein: 18,
    carbs: 45,
    fat: 12,
    rating: 4.5,
    reviews: 23,
    tags: ["vegetarian", "high-protein", "gluten-free"],
    allergens: ["sesame"],
    station: "Wellness Station",
    price: "€8.50",
    isChefChoice: false,
    sustainability: "A"
  },
  {
    id: "2",
    name: "Grilled Salmon Fillet",
    category: "Hot Dish",
    description: "Atlantic salmon with herb butter, served with seasonal vegetables",
    calories: 380,
    protein: 32,
    carbs: 8,
    fat: 24,
    rating: 4.8,
    reviews: 45,
    tags: ["omega-3", "low-carb", "premium"],
    allergens: ["fish"],
    station: "Grill Station",
    price: "€12.90",
    isChefChoice: true,
    sustainability: "B"
  },
  {
    id: "3",
    name: "Classic Caesar Salad",
    category: "Salad",
    description: "Crisp romaine lettuce with parmesan, croutons, and caesar dressing",
    calories: 320,
    protein: 12,
    carbs: 15,
    fat: 24,
    rating: 4.2,
    reviews: 18,
    tags: ["vegetarian", "classic"],
    allergens: ["dairy", "gluten", "eggs"],
    station: "Salad Bar",
    price: "€6.50",
    isChefChoice: false,
    sustainability: "C"
  }
];

export default function Menu() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState("lunch");
  const [filters, setFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? 'fill-cb-orange text-cb-orange' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-conqueror text-cb-ink">Today's Menu</h1>
          <p className="text-muted-foreground">Discover delicious and nutritious options</p>
        </div>

        {/* Date and Meal Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cb-green-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
          
          <Tabs value={selectedMeal} onValueChange={setSelectedMeal}>
            <TabsList>
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-cb-green-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {["vegetarian", "vegan", "gluten-free", "high-protein", "low-carb"].map((filter) => (
            <Button
              key={filter}
              variant={filters.includes(filter) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter)}
              className={filters.includes(filter) ? "cb-button-primary" : ""}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMenuItems.map((item) => (
          <Card key={item.id} className="cb-card hover:shadow-soft transition-all duration-200">
            <CardContent className="p-0">
              {/* Dish Image Placeholder */}
              <div className="cb-hero-image h-48 mb-4">
                <div className="w-full h-full bg-cb-green-200 flex items-center justify-center text-cb-green-600">
                  Photo of {item.name}
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-cb-ink">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.station}</p>
                    </div>
                    {item.isChefChoice && (
                      <Badge className="bg-cb-orange text-white">
                        <ChefHat className="h-3 w-3 mr-1" />
                        Chef's Choice
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                {/* Nutrition & Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nutrition</p>
                    <div className="text-sm">
                      <span className="font-medium text-cb-ink">{item.calories} kcal</span>
                      <span className="text-muted-foreground ml-2">
                        P: {item.protein}g
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">({item.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      item.sustainability === 'A' ? 'border-green-500 text-green-600' :
                      item.sustainability === 'B' ? 'border-yellow-500 text-yellow-600' :
                      'border-orange-500 text-orange-600'
                    }`}
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    Eco {item.sustainability}
                  </Badge>
                </div>

                {/* Allergens */}
                {item.allergens.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contains:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen) => (
                        <Badge key={allergen} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-cb-ink">{item.price}</span>
                  <Button size="sm" className="cb-button-primary">
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockMenuItems.length === 0 && (
        <Card className="cb-card">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-cb-ink mb-2">No menu available</h3>
            <p className="text-sm text-muted-foreground">
              The menu for this date and meal time hasn't been uploaded yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}