import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Edit2, Trash2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  time_period: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
}

const GOAL_TYPES = [
  { value: "calories", label: "Daily Calories", unit: "kcal", recommended: 2000 },
  { value: "protein", label: "Daily Protein", unit: "g", recommended: 150 },
  { value: "carbs", label: "Daily Carbs", unit: "g", recommended: 250 },
  { value: "fat", label: "Daily Fat", unit: "g", recommended: 65 },
  { value: "water", label: "Daily Water", unit: "glasses", recommended: 8 },
  { value: "meals_per_day", label: "Meals per Day", unit: "meals", recommended: 3 }
];

export default function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: "",
    target_value: 0,
    time_period: "daily"
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.goal_type || !newGoal.target_value) {
      toast({
        title: "Missing Information",
        description: "Please select a goal type and target value",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          goal_type: newGoal.goal_type,
          target_value: newGoal.target_value,
          time_period: newGoal.time_period
        });

      if (error) throw error;

      toast({
        title: "Goal Added",
        description: "Your new goal has been set successfully!"
      });

      setNewGoal({ goal_type: "", target_value: 0, time_period: "daily" });
      setShowAddGoal(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive"
      });
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ is_active: false })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Goal Removed",
        description: "Goal has been deactivated"
      });

      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to remove goal",
        variant: "destructive"
      });
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalTypeInfo = (type: string) => {
    return GOAL_TYPES.find(gt => gt.value === type);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Setting & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading goals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Setting & Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Goals */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No goals set yet. Create your first goal!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const goalInfo = getGoalTypeInfo(goal.goal_type);
              const progress = getGoalProgress(goal);
              const isCompleted = progress >= 100;

              return (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{goalInfo?.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.current_value} / {goal.target_value} {goalInfo?.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Badge className="bg-green-500 text-white">
                          Completed!
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={`h-2 ${isCompleted ? 'bg-green-100' : ''}`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Update progress"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseFloat((e.target as HTMLInputElement).value);
                          if (value >= 0) {
                            updateGoalProgress(goal.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Update progress"]`) as HTMLInputElement;
                        const value = parseFloat(input.value);
                        if (value >= 0) {
                          updateGoalProgress(goal.id, value);
                          input.value = '';
                        }
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Goal */}
        {!showAddGoal ? (
          <Button onClick={() => setShowAddGoal(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Goal
          </Button>
        ) : (
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add New Goal</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Goal Type</Label>
                <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal(prev => ({ ...prev, goal_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Target Value</Label>
                <Input
                  type="number"
                  placeholder="Enter target"
                  value={newGoal.target_value || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                />
                {newGoal.goal_type && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: {getGoalTypeInfo(newGoal.goal_type)?.recommended} {getGoalTypeInfo(newGoal.goal_type)?.unit}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addGoal} className="flex-1">
                Add Goal
              </Button>
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}