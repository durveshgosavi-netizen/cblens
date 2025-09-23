import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DishCard from "./DishCard";
import DailyRecommendations from "./DailyRecommendations";
import { Camera, Calendar, MapPin, Utensils, ChefHat, Crown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MenuViewProps {
  onStartScan: () => void;
  selectedLocation: string;
}

interface WeeklyMenuData {
  id: string;
  day_name: string;
  day_date: string;
  hot_dish: string | null;
  green_dish: string | null;
  salad_1: string | null;
  salad_2: string | null;
}

interface ChefsChoice {
  id: string;
  kanpla_item_id: string;
  description: string;
  chef_notes: string;
}

export default function MenuView({ onStartScan, selectedLocation }: MenuViewProps) {
  const [todaysMenu, setTodaysMenu] = useState<WeeklyMenuData | null>(null);
  const [chefsChoice, setChefsChoice] = useState<ChefsChoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysMenu();
    fetchChefsChoice();
  }, [selectedLocation]);

  const fetchTodaysMenu = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('weekly_menus')
        .select('*')
        .eq('day_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching menu:', error);
      }

      setTodaysMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChefsChoice = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('chefs_choice')
        .select('*')
        .eq('canteen_location', selectedLocation)
        .eq('featured_date', today);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching chef\'s choice:', error);
      }

      setChefsChoice(data || []);
    } catch (error) {
      console.error('Error fetching chef\'s choice:', error);
    }
  };

  const getMenuDishes = () => {
    if (!todaysMenu) return [];
    
    return [
      { type: "Hot Dish", name: todaysMenu.hot_dish, category: "Main Course" },
      { type: "Green Dish", name: todaysMenu.green_dish, category: "Vegetarian" },
      { type: "Salad 1", name: todaysMenu.salad_1, category: "Fresh" },
      { type: "Salad 2", name: todaysMenu.salad_2, category: "Fresh" }
    ].filter(dish => dish.name);
  };

  const isChefChoice = (dishName: string) => {
    return chefsChoice.some(choice => 
      choice.description?.toLowerCase().includes(dishName?.toLowerCase())
    );
  };

  const menuDishes = getMenuDishes();

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
                  <span className="font-medium">
                    {new Date().toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{selectedLocation}</span>
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

      {/* Chef's Choice Section */}
      {chefsChoice.length > 0 && (
        <div className="px-6 -mt-4 mb-6">
          <Card className="shadow-card border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">Chef's Choice Today</span>
                <Badge className="ml-auto bg-yellow-500 text-white">
                  Special
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {chefsChoice.map((choice) => (
                  <div 
                    key={choice.id}
                    className="p-4 rounded-lg bg-white/80 border border-yellow-200"
                  >
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-800 mb-1">
                          {choice.description}
                        </h4>
                        {choice.chef_notes && (
                          <p className="text-sm text-yellow-700 italic">
                            "{choice.chef_notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu Display */}
      <div className="px-6 -mt-4 mb-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              <span className="font-medium">Today's Menu</span>
              <Badge variant="secondary" className="ml-auto">
                {loading ? "..." : `${menuDishes.length} dishes`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center text-muted-foreground py-4">
                Loading today's menu...
              </div>
            ) : menuDishes.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <ChefHat className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">No menu available</h3>
                  <p className="text-sm text-muted-foreground">
                    Menu for today has not been uploaded yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {menuDishes.map((dish, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isChefChoice(dish.name || '') 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChefChoice(dish.name || '') && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {dish.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{dish.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isChefChoice(dish.name || '') && (
                        <Badge className="text-xs bg-yellow-500 text-white">
                          Chef's Choice
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {dish.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Recommendations */}
      <div className="px-6 mb-6">
        <DailyRecommendations />
      </div>
    </div>
  );
}