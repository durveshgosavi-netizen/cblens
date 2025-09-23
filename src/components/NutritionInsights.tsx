import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Brain, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

interface NutritionInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  data: any;
  severity: string;
  is_read: boolean;
  created_at: string;
}

interface TrendData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionInsights() {
  const [insights, setInsights] = useState<NutritionInsight[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchInsights(),
        fetchTrendData(),
        generatePredictions()
      ]);
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const fetchTrendData = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('scan_timestamp, scaled_calories, scaled_protein, scaled_carbs, scaled_fat')
        .gte('scan_timestamp', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('scan_timestamp', { ascending: true });

      if (error) throw error;

      // Group by date and sum nutrition values
      const groupedData: { [key: string]: TrendData } = {};
      
      data?.forEach(scan => {
        const date = new Date(scan.scan_timestamp).toLocaleDateString();
        if (!groupedData[date]) {
          groupedData[date] = {
            date,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
        }
        
        groupedData[date].calories += scan.scaled_calories || 0;
        groupedData[date].protein += scan.scaled_protein || 0;
        groupedData[date].carbs += scan.scaled_carbs || 0;
        groupedData[date].fat += scan.scaled_fat || 0;
      });

      setTrendData(Object.values(groupedData));
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const generatePredictions = async () => {
    try {
      if (trendData.length < 3) return;

      // Simple prediction based on recent trends
      const recent = trendData.slice(-7);
      const avgCalories = recent.reduce((sum, day) => sum + day.calories, 0) / recent.length;
      const avgProtein = recent.reduce((sum, day) => sum + day.protein, 0) / recent.length;
      
      const predictions = {
        weeklyCalories: Math.round(avgCalories * 7),
        weeklyProtein: Math.round(avgProtein * 7),
        trend: avgCalories > 2200 ? 'increasing' : avgCalories < 1800 ? 'decreasing' : 'stable',
        recommendations: []
      };

      if (avgProtein < 100) {
        predictions.recommendations.push("Consider adding more protein-rich foods to your meals");
      }
      if (avgCalories < 1500) {
        predictions.recommendations.push("Your calorie intake seems low - ensure you're meeting your energy needs");
      }
      if (avgCalories > 2500) {
        predictions.recommendations.push("Monitor portion sizes to maintain a balanced calorie intake");
      }

      setPredictions(predictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;
      
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, is_read: true }
            : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const getInsightIcon = (type: string, severity: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'deficiency':
        return <AlertTriangle className="h-5 w-5" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      case 'prediction':
        return <Brain className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Nutrition Insights & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Analyzing your nutrition data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            14-Day Nutrition Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No data available. Start tracking meals to see trends!
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Calories"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Protein"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictions */}
      {predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Predictions & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium mb-1">Weekly Projection</h4>
                <p className="text-sm text-muted-foreground">
                  Based on current trends: ~{predictions.weeklyCalories} calories this week
                </p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <h4 className="font-medium mb-1">Trend Status</h4>
                <div className="flex items-center gap-2">
                  {predictions.trend === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : predictions.trend === 'decreasing' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm capitalize">{predictions.trend}</span>
                </div>
              </div>
            </div>
            
            {predictions.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Personalized Recommendations</h4>
                {predictions.recommendations.map((rec: string, index: number) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No insights available yet. Keep tracking to get personalized insights!
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map(insight => (
                <Alert key={insight.id} className={`${!insight.is_read ? 'border-primary' : ''}`}>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex gap-3">
                      {getInsightIcon(insight.insight_type, insight.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant={getSeverityColor(insight.severity) as any} className="text-xs">
                            {insight.insight_type}
                          </Badge>
                          {!insight.is_read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <AlertDescription>{insight.description}</AlertDescription>
                      </div>
                    </div>
                    {!insight.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(insight.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}