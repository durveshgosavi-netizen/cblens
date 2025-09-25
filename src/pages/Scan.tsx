import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  Check, 
  Search,
  Info,
  Zap
} from "lucide-react";

interface DetectedDish {
  id: string;
  name: string;
  confidence: number;
  category: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  allergens: string[];
}

// Mock detection results
const mockDetections: DetectedDish[] = [
  {
    id: "1",
    name: "Mediterranean Quinoa Bowl",
    confidence: 92,
    category: "Green Dish",
    nutrition: { calories: 420, protein: 18, carbs: 45, fat: 12 },
    ingredients: ["quinoa", "chickpeas", "cucumber", "tomatoes", "feta", "olive oil"],
    allergens: ["dairy"]
  },
  {
    id: "2", 
    name: "Greek Salad",
    confidence: 78,
    category: "Salad",
    nutrition: { calories: 320, protein: 8, carbs: 15, fat: 28 },
    ingredients: ["lettuce", "tomatoes", "cucumber", "olives", "feta", "olive oil"],
    allergens: ["dairy"]
  }
];

export default function Scan() {
  const [step, setStep] = useState<'camera' | 'preview' | 'results' | 'nutrition'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<DetectedDish[]>([]);
  const [selectedDish, setSelectedDish] = useState<DetectedDish | null>(null);
  const [portion, setPortion] = useState([1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async () => {
    // Mock image capture
    setCapturedImage("/api/placeholder/400/300");
    setStep('preview');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      setStep('preview');
    }
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    setStep('results');
    
    // Mock processing delay
    setTimeout(() => {
      setDetections(mockDetections);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSelectDish = (dish: DetectedDish) => {
    setSelectedDish(dish);
    setStep('nutrition');
  };

  const calculateNutrition = (baseDish: DetectedDish, portionMultiplier: number) => {
    return {
      calories: Math.round(baseDish.nutrition.calories * portionMultiplier),
      protein: Math.round(baseDish.nutrition.protein * portionMultiplier),
      carbs: Math.round(baseDish.nutrition.carbs * portionMultiplier),
      fat: Math.round(baseDish.nutrition.fat * portionMultiplier),
    };
  };

  const handleSaveLog = () => {
    // Logic to save to history
    console.log("Saving to history:", selectedDish, portion[0]);
    // Reset to camera
    setStep('camera');
    setCapturedImage(null);
    setDetections([]);
    setSelectedDish(null);
    setPortion([1]);
  };

  // Camera Step
  if (step === 'camera') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-conqueror text-cb-ink mb-2">Scan Your Meal</h1>
          <p className="text-muted-foreground">Point your camera at food or upload a photo</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Camera View Placeholder */}
          <div className="w-full max-w-md aspect-square bg-cb-green-100 rounded-2xl border-2 border-dashed border-cb-green-300 flex flex-col items-center justify-center mb-6">
            <Camera className="h-16 w-16 text-cb-green-500 mb-4" />
            <p className="text-cb-green-600 text-center">Camera view would appear here</p>
            <p className="text-sm text-muted-foreground mt-2">Make sure your meal is well-lit</p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <Button 
              onClick={handleCapture}
              className="w-full cb-button-primary h-12"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture Photo
            </Button>
            
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload from Gallery
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview Step
  if (step === 'preview') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-conqueror text-cb-ink">Review Your Photo</h1>
            <p className="text-muted-foreground">Make sure the food is clearly visible</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setStep('camera')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake
          </Button>
        </div>

        <Card className="cb-card">
          <CardContent className="p-4">
            <div className="aspect-video bg-cb-green-100 rounded-xl mb-4 flex items-center justify-center">
              <p className="text-cb-green-600">Photo preview: {capturedImage}</p>
            </div>
            <Button 
              onClick={handleAnalyze}
              className="w-full cb-button-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Analyze Food
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Step
  if (step === 'results') {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-conqueror text-cb-ink">Detection Results</h1>
          <p className="text-muted-foreground">Select the dish that matches your meal</p>
        </div>

        {isProcessing ? (
          <Card className="cb-card">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full animate-pulse mx-auto mb-4"></div>
              <h3 className="font-medium text-cb-ink mb-2">Analyzing your meal...</h3>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {detections.map((dish) => (
              <Card 
                key={dish.id} 
                className="cb-card cursor-pointer hover:shadow-soft transition-all duration-200"
                onClick={() => handleSelectDish(dish)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-cb-ink">{dish.name}</h3>
                      <p className="text-sm text-muted-foreground">{dish.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={dish.confidence > 85 ? "default" : "secondary"}
                        className={dish.confidence > 85 ? "bg-cb-green-500" : ""}
                      >
                        {dish.confidence}% confident
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="font-semibold text-cb-ink">{dish.nutrition.calories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="font-semibold text-cb-ink">{dish.nutrition.protein}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="font-semibold text-cb-ink">{dish.nutrition.carbs}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Fat</p>
                      <p className="font-semibold text-cb-ink">{dish.nutrition.fat}g</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {dish.ingredients.slice(0, 4).map((ingredient) => (
                      <Badge key={ingredient} variant="outline" className="text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                    {dish.ingredients.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{dish.ingredients.length - 4} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="cb-card border-dashed">
              <CardContent className="p-4 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium text-cb-ink mb-1">Not listed?</h3>
                <p className="text-sm text-muted-foreground mb-3">Search our menu database</p>
                <Button variant="outline" className="w-full">
                  Search Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Nutrition Step
  if (step === 'nutrition' && selectedDish) {
    const adjustedNutrition = calculateNutrition(selectedDish, portion[0]);
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-conqueror text-cb-ink">Nutrition Details</h1>
            <p className="text-muted-foreground">Adjust portion size and save to your log</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setStep('results')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="cb-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedDish.name}</span>
              <Badge>{selectedDish.category}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Portion Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-cb-ink">Portion Size</label>
                <span className="text-sm text-muted-foreground">
                  {portion[0] === 0.5 ? "Half" : 
                   portion[0] === 1 ? "Normal" :
                   portion[0] === 1.5 ? "Large" : 
                   `${portion[0]}x`}
                </span>
              </div>
              <Slider
                value={portion}
                onValueChange={setPortion}
                min={0.5}
                max={2}
                step={0.25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>½</span>
                <span>1×</span>
                <span>1½</span>
                <span>2×</span>
              </div>
            </div>

            {/* Nutrition Facts */}
            <div>
              <h3 className="font-medium text-cb-ink mb-3">Nutrition Facts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-cb-green-100 rounded-lg text-center">
                  <p className="text-2xl font-bold text-cb-green-600">{adjustedNutrition.calories}</p>
                  <p className="text-sm text-cb-green-600">Calories</p>
                </div>
                <div className="p-3 bg-cb-blue-100 rounded-lg text-center">
                  <p className="text-2xl font-bold text-cb-blue-300">{adjustedNutrition.protein}g</p>
                  <p className="text-sm text-cb-blue-300">Protein</p>
                </div>
                <div className="p-3 bg-accent rounded-lg text-center">
                  <p className="text-2xl font-bold text-accent-foreground">{adjustedNutrition.carbs}g</p>
                  <p className="text-sm text-accent-foreground">Carbs</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{adjustedNutrition.fat}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                </div>
              </div>
            </div>

            {/* Allergens */}
            {selectedDish.allergens.length > 0 && (
              <div>
                <h3 className="font-medium text-cb-ink mb-2">Allergens</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDish.allergens.map((allergen) => (
                    <Badge key={allergen} variant="destructive">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Data Source */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-cb-ink">Data Source</p>
                  <p className="text-xs text-muted-foreground">
                    Nutrition values estimated from USDA database and canteen recipes. 
                    Portion size based on visual analysis.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveLog}
              className="w-full cb-button-primary"
            >
              <Check className="h-4 w-4 mr-2" />
              Save to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}