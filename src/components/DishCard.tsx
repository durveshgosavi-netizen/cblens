import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Utensils, Clock, Users } from "lucide-react";

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    category: string;
    image?: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    allergens: string[];
    confidence?: number;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  showConfidence?: boolean;
}

export default function DishCard({ dish, isSelected, onSelect, showConfidence }: DishCardProps) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "confidence-high";
    if (confidence >= 0.6) return "confidence-medium";
    return "confidence-low";
  };

  return (
    <Card 
      className={`group transition-all duration-200 hover:shadow-floating cursor-pointer border-2 ${
        isSelected ? 'border-primary shadow-floating bg-primary-glow/20' : 'border-border hover:border-primary/30'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground leading-tight">{dish.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Utensils className="h-3 w-3" />
              <span>{dish.category}</span>
            </div>
          </div>
          {showConfidence && dish.confidence && (
            <Badge variant={getConfidenceBadge(dish.confidence)} className="text-xs">
              {Math.round(dish.confidence * 100)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {dish.image && (
          <div className="aspect-video bg-warm-cream rounded-lg mb-4 overflow-hidden">
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-accent/20 rounded-lg">
            <Badge variant="protein" className="mb-1 text-xs">P</Badge>
            <div className="text-sm font-medium">{dish.protein}g</div>
          </div>
          <div className="text-center p-2 bg-primary-glow/30 rounded-lg">
            <Badge variant="carbs" className="mb-1 text-xs">C</Badge>
            <div className="text-sm font-medium">{dish.carbs}g</div>
          </div>
          <div className="text-center p-2 bg-warm-sand/40 rounded-lg">
            <Badge variant="fat" className="mb-1 text-xs">F</Badge>
            <div className="text-sm font-medium">{dish.fat}g</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-primary">{dish.calories} kcal</span>
          </div>
          {dish.allergens.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {dish.allergens.length} allergen{dish.allergens.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {onSelect && (
        <CardFooter className="pt-0">
          <Button 
            variant={isSelected ? "confirm" : "soft"} 
            className="w-full"
            size="sm"
          >
            {isSelected ? "Selected" : "Select Dish"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}