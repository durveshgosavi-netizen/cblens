import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Utensils, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  allergens: string[];
  avg_rating: number;
  rating_count: number;
  is_chefs_choice: boolean;
}

export default function DailyRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_recommendations')
        .select('*')
        .limit(5);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Today's Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading recommendations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Today's Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Utensils className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No recommendations available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    {item.is_chefs_choice && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {renderStars(item.avg_rating)}
                      {item.rating_count > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({item.rating_count})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{Math.round(item.calories_per_100g)} kcal</span>
                    <span>{item.protein_per_100g}g protein</span>
                    <span>{item.carbs_per_100g}g carbs</span>
                    <span>{item.fat_per_100g}g fat</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {item.is_chefs_choice && (
                    <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Chef's Choice
                    </Badge>
                  )}
                  {item.avg_rating > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      Highly Rated
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}