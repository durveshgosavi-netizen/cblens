import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DishCard from "./DishCard";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScanResultsProps {
  capturedImage: string;
  onBack: () => void;
  onSave: (result: any) => void;
  onRescan: () => void;
}

// Mock AI detection results
const mockDetectionResults = [
  {
    id: "1",
    name: "Grilled Salmon with Quinoa",
    category: "Main Course",
    protein: 32,
    carbs: 28,
    fat: 14,
    calories: 340,
    allergens: ["fish"],
    confidence: 0.92,
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
    confidence: 0.76,
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
    confidence: 0.61,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center&auto=format&q=80"
  }
];

export default function ScanResults({ capturedImage, onBack, onSave, onRescan }: ScanResultsProps) {
  const [selectedDish, setSelectedDish] = useState(mockDetectionResults[0]);
  const [portionSize, setPortionSize] = useState<"0.5" | "1" | "1.5">("1");
  const [estimatedWeight, setEstimatedWeight] = useState(250);
  const [notes, setNotes] = useState("");

  const portionMultiplier = parseFloat(portionSize);
  
  const adjustedNutrition = {
    protein: Math.round(selectedDish.protein * portionMultiplier),
    carbs: Math.round(selectedDish.carbs * portionMultiplier), 
    fat: Math.round(selectedDish.fat * portionMultiplier),
    calories: Math.round(selectedDish.calories * portionMultiplier),
    weight: Math.round(estimatedWeight * portionMultiplier)
  };

  const handleSave = async () => {
    if (!selectedDish) return;
    
    try {
      // Convert image to base64 if it's a data URL, otherwise keep as URL
      const photoBase64 = capturedImage.startsWith('data:') 
        ? capturedImage.split(',')[1] 
        : null;
      
      const scanData = {
        kanpla_item_id: selectedDish.id,
        confidence: selectedDish.confidence > 0.8 ? 'high' : selectedDish.confidence > 0.6 ? 'medium' : 'low',
        portion_preset: portionSize === '0.5' ? 'half' : portionSize === '1' ? 'normal' : 'large',
        estimated_grams: adjustedNutrition.weight,
        photo_base64: photoBase64,
        photo_url: !photoBase64 ? capturedImage : null,
        notes: notes || null,
        canteen_location: 'Main Campus',
        alternatives: mockDetectionResults.filter(dish => dish.id !== selectedDish.id)
      };

      const { data, error } = await supabase.functions.invoke('save-scan', {
        body: scanData
      });

      if (error) throw error;

      const result = {
        dish: selectedDish,
        portion: portionSize,
        nutrition: adjustedNutrition,
        capturedImage,
        notes,
        timestamp: new Date().toISOString(),
        scanId: data?.scanId
      };
      
      onSave(result);
    } catch (error) {
      console.error('Error saving scan:', error);
      // Still call onSave to show success, but the scan won't be persisted
      const result = {
        dish: selectedDish,
        portion: portionSize,
        nutrition: adjustedNutrition,
        capturedImage,
        notes,
        timestamp: new Date().toISOString()
      };
      onSave(result);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Scan Results</h2>
        <Button variant="ghost" onClick={onRescan}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Captured Image */}
        <Card className="overflow-hidden shadow-card">
          <CardContent className="p-0">
            <div className="aspect-video bg-warm-cream">
              <img 
                src={capturedImage} 
                alt="Captured plate" 
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Detection Results */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Detected Dishes</h3>
              <Badge variant="secondary">
                {mockDetectionResults.length} matches found
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDetectionResults.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                isSelected={selectedDish.id === dish.id}
                onSelect={() => setSelectedDish(dish)}
                showConfidence={true}
              />
            ))}
          </CardContent>
        </Card>

        {/* Portion Size Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Portion Size</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { value: "0.5", label: "½ Portion", desc: "Small" },
                { value: "1", label: "1× Portion", desc: "Standard" },
                { value: "1.5", label: "1½ Portion", desc: "Large" }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={portionSize === option.value ? "default" : "soft"}
                  className="h-auto p-4 flex-col"
                  onClick={() => setPortionSize(option.value as any)}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </Button>
              ))}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Estimated weight</div>
              <div className="text-lg font-semibold">{adjustedNutrition.weight}g ±15%</div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="text-lg font-semibold">Nutrition Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-primary-glow/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">{adjustedNutrition.calories}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-accent-vibrant">{adjustedNutrition.weight}g</div>
                <div className="text-sm text-muted-foreground">Est. Weight</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-accent-vibrant/10 rounded-lg">
                <Badge variant="protein" className="mb-2">Protein</Badge>
                <div className="font-semibold">{adjustedNutrition.protein}g</div>
              </div>
              <div className="text-center p-3 bg-primary-light/10 rounded-lg">
                <Badge variant="carbs" className="mb-2">Carbs</Badge>
                <div className="font-semibold">{adjustedNutrition.carbs}g</div>
              </div>
              <div className="text-center p-3 bg-warm-sand/30 rounded-lg">
                <Badge variant="fat" className="mb-2">Fat</Badge>
                <div className="font-semibold">{adjustedNutrition.fat}g</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pb-6">
          <Button variant="confirm" size="lg" className="w-full" onClick={handleSave}>
            <Save className="h-5 w-5 mr-2" />
            Save Scan
          </Button>
        </div>
      </div>
    </div>
  );
}