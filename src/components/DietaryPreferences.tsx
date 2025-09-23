import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DietaryPreference {
  id: string;
  preference_type: string;
  preference_value: string;
}

const PREFERENCE_TYPES = [
  { value: "allergy", label: "Allergy" },
  { value: "intolerance", label: "Intolerance" },
  { value: "diet", label: "Diet Type" },
  { value: "restriction", label: "Restriction" },
  { value: "preference", label: "Preference" }
];

const COMMON_VALUES = {
  allergy: ["Nuts", "Dairy", "Eggs", "Fish", "Shellfish", "Soy", "Wheat", "Sesame"],
  intolerance: ["Lactose", "Gluten", "Fructose", "Histamine"],
  diet: ["Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Low-carb"],
  restriction: ["Halal", "Kosher", "No pork", "No beef", "No alcohol"],
  preference: ["Low sodium", "Low sugar", "High protein", "Organic", "Local"]
};

export default function DietaryPreferences() {
  const [preferences, setPreferences] = useState<DietaryPreference[]>([]);
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('dietary_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load dietary preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPreference = async () => {
    if (!newType || (!newValue && !customValue)) {
      toast({
        title: "Missing Information",
        description: "Please select a type and value",
        variant: "destructive"
      });
      return;
    }

    const value = customValue || newValue;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('dietary_preferences')
        .insert({
          user_id: user.id,
          preference_type: newType,
          preference_value: value
        });

      if (error) throw error;

      toast({
        title: "Added",
        description: `${value} added to your dietary preferences`
      });

      setNewType("");
      setNewValue("");
      setCustomValue("");
      fetchPreferences();
    } catch (error) {
      console.error('Error adding preference:', error);
      toast({
        title: "Error",
        description: "Failed to add preference",
        variant: "destructive"
      });
    }
  };

  const removePreference = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dietary_preferences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Removed",
        description: "Dietary preference removed"
      });

      fetchPreferences();
    } catch (error) {
      console.error('Error removing preference:', error);
      toast({
        title: "Error",
        description: "Failed to remove preference",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'allergy': return 'destructive';
      case 'intolerance': return 'secondary';
      case 'diet': return 'default';
      case 'restriction': return 'outline';
      case 'preference': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Dietary Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Dietary Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Preferences */}
        <div className="space-y-2">
          <Label>Current Preferences</Label>
          {preferences.length === 0 ? (
            <p className="text-muted-foreground text-sm">No dietary preferences set</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <Badge 
                  key={pref.id} 
                  variant={getTypeColor(pref.preference_type)}
                  className="flex items-center gap-1"
                >
                  {pref.preference_value}
                  <button
                    onClick={() => removePreference(pref.id)}
                    className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Add New Preference */}
        <div className="space-y-3 border-t pt-4">
          <Label>Add New Preference</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="type" className="text-xs">Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {PREFERENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value" className="text-xs">Value</Label>
              <Select value={newValue} onValueChange={setNewValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {newType && COMMON_VALUES[newType as keyof typeof COMMON_VALUES]?.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="custom" className="text-xs">Or enter custom value</Label>
            <Input
              id="custom"
              placeholder="Enter custom preference"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
          </div>

          <Button onClick={addPreference} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Preference
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}