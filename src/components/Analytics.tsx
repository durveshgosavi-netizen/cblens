import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface NutritionData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  avgDailyCalories: number;
  dailyNutrition: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number; meals: number }>;
  weeklyNutrition: Array<{ week: string; calories: number; protein: number; carbs: number; fat: number; meals: number }>;
  monthlyNutrition: Array<{ month: string; calories: number; protein: number; carbs: number; fat: number; meals: number }>;
  macroDistribution: Array<{ name: string; value: number; percentage: number }>;
  calorieGoalProgress: number;
  proteinGoalProgress: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

// Daily nutrition goals (these could be user-configurable in the future)
const DAILY_GOALS = {
  calories: 2000,
  protein: 150, // grams
  carbs: 250,   // grams  
  fat: 65       // grams
};

export default function Analytics() {
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7");
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const { toast } = useToast();

  useEffect(() => {
    fetchNutritionData();
  }, [dateRange, viewMode]);

  const fetchNutritionData = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      // Fetch nutrition scans data
      const { data: scans, error } = await supabase
        .from('scans')
        .select('*')
        .gte('scan_timestamp', startDate.toISOString())
        .lte('scan_timestamp', endDate.toISOString())
        .order('scan_timestamp', { ascending: false });

      if (error) {
        console.error('Nutrition fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch nutrition data",
          variant: "destructive",
        });
        return;
      }

      if (!scans || scans.length === 0) {
        setData({
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          avgDailyCalories: 0,
          dailyNutrition: [],
          weeklyNutrition: [],
          monthlyNutrition: [],
          macroDistribution: [
            { name: 'Protein', value: 0, percentage: 0 },
            { name: 'Carbs', value: 0, percentage: 0 },
            { name: 'Fat', value: 0, percentage: 0 }
          ],
          calorieGoalProgress: 0,
          proteinGoalProgress: 0,
        });
        return;
      }

      // Calculate total nutrition
      const totalCalories = scans.reduce((sum, scan) => sum + (scan.scaled_calories || 0), 0);
      const totalProtein = scans.reduce((sum, scan) => sum + (scan.scaled_protein || 0), 0);
      const totalCarbs = scans.reduce((sum, scan) => sum + (scan.scaled_carbs || 0), 0);
      const totalFat = scans.reduce((sum, scan) => sum + (scan.scaled_fat || 0), 0);

      // Calculate daily nutrition
      const dailyGroups: Record<string, { calories: number; protein: number; carbs: number; fat: number; meals: number }> = {};
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyGroups[date] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
      }

      scans.forEach(scan => {
        const date = format(new Date(scan.scan_timestamp), 'yyyy-MM-dd');
        if (dailyGroups[date]) {
          dailyGroups[date].calories += scan.scaled_calories || 0;
          dailyGroups[date].protein += scan.scaled_protein || 0;
          dailyGroups[date].carbs += scan.scaled_carbs || 0;
          dailyGroups[date].fat += scan.scaled_fat || 0;
          dailyGroups[date].meals += 1;
        }
      });

      const dailyNutrition = Object.entries(dailyGroups)
        .map(([date, nutrition]) => ({
          date: format(new Date(date), 'MMM d'),
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein),
          carbs: Math.round(nutrition.carbs),
          fat: Math.round(nutrition.fat),
          meals: nutrition.meals
        }))
        .reverse();

      // Calculate weekly nutrition (group by weeks)
      const weeklyGroups: Record<string, { calories: number; protein: number; carbs: number; fat: number; meals: number }> = {};
      scans.forEach(scan => {
        const scanDate = new Date(scan.scan_timestamp);
        const weekStart = format(subDays(scanDate, scanDate.getDay()), 'yyyy-MM-dd');
        if (!weeklyGroups[weekStart]) {
          weeklyGroups[weekStart] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
        }
        weeklyGroups[weekStart].calories += scan.scaled_calories || 0;
        weeklyGroups[weekStart].protein += scan.scaled_protein || 0;
        weeklyGroups[weekStart].carbs += scan.scaled_carbs || 0;
        weeklyGroups[weekStart].fat += scan.scaled_fat || 0;
        weeklyGroups[weekStart].meals += 1;
      });

      const weeklyNutrition = Object.entries(weeklyGroups)
        .map(([week, nutrition]) => ({
          week: `Week of ${format(new Date(week), 'MMM d')}`,
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein),
          carbs: Math.round(nutrition.carbs),
          fat: Math.round(nutrition.fat),
          meals: nutrition.meals
        }))
        .sort((a, b) => new Date(a.week.replace('Week of ', '')).getTime() - new Date(b.week.replace('Week of ', '')).getTime());

      // Calculate monthly nutrition
      const monthlyGroups: Record<string, { calories: number; protein: number; carbs: number; fat: number; meals: number }> = {};
      scans.forEach(scan => {
        const month = format(new Date(scan.scan_timestamp), 'yyyy-MM');
        if (!monthlyGroups[month]) {
          monthlyGroups[month] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
        }
        monthlyGroups[month].calories += scan.scaled_calories || 0;
        monthlyGroups[month].protein += scan.scaled_protein || 0;
        monthlyGroups[month].carbs += scan.scaled_carbs || 0;
        monthlyGroups[month].fat += scan.scaled_fat || 0;
        monthlyGroups[month].meals += 1;
      });

      const monthlyNutrition = Object.entries(monthlyGroups)
        .map(([month, nutrition]) => ({
          month: format(new Date(month + '-01'), 'MMM yyyy'),
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein),
          carbs: Math.round(nutrition.carbs),
          fat: Math.round(nutrition.fat),
          meals: nutrition.meals
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      // Calculate macro distribution (calories from each macro)
      const proteinCalories = totalProtein * 4; // 4 calories per gram
      const carbCalories = totalCarbs * 4;     // 4 calories per gram  
      const fatCalories = totalFat * 9;        // 9 calories per gram
      const totalMacroCalories = proteinCalories + carbCalories + fatCalories;

      const macroDistribution = [
        { 
          name: 'Protein', 
          value: Math.round(proteinCalories),
          percentage: totalMacroCalories > 0 ? Math.round((proteinCalories / totalMacroCalories) * 100) : 0
        },
        { 
          name: 'Carbs', 
          value: Math.round(carbCalories),
          percentage: totalMacroCalories > 0 ? Math.round((carbCalories / totalMacroCalories) * 100) : 0
        },
        { 
          name: 'Fat', 
          value: Math.round(fatCalories),
          percentage: totalMacroCalories > 0 ? Math.round((fatCalories / totalMacroCalories) * 100) : 0
        }
      ];

      // Calculate goal progress
      const avgDailyCalories = Math.round(totalCalories / days);
      const avgDailyProtein = Math.round(totalProtein / days);
      const calorieGoalProgress = Math.round((avgDailyCalories / DAILY_GOALS.calories) * 100);
      const proteinGoalProgress = Math.round((avgDailyProtein / DAILY_GOALS.protein) * 100);

      setData({
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
        avgDailyCalories,
        dailyNutrition,
        weeklyNutrition,
        monthlyNutrition,
        macroDistribution,
        calorieGoalProgress,
        proteinGoalProgress,
      });
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nutrition data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportNutritionReport = () => {
    if (!data) return;

    const report = {
      reportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      dateRange: `Last ${dateRange} days`,
      nutritionSummary: {
        totalCalories: data.totalCalories,
        totalProtein: `${data.totalProtein}g`,
        totalCarbs: `${data.totalCarbs}g`, 
        totalFat: `${data.totalFat}g`,
        avgDailyCalories: data.avgDailyCalories,
        calorieGoalProgress: `${data.calorieGoalProgress}%`,
        proteinGoalProgress: `${data.proteinGoalProgress}%`,
      },
      dailyGoals: DAILY_GOALS,
      macroDistribution: data.macroDistribution,
      dailyNutrition: data.dailyNutrition,
      weeklyNutrition: data.weeklyNutrition,
      monthlyNutrition: data.monthlyNutrition,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrition-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Nutrition report exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Nutrition Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportNutritionReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Nutrition Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
                <p className="text-3xl font-bold">{data.avgDailyCalories}</p>
                <p className="text-xs text-muted-foreground">Goal: {DAILY_GOALS.calories} kcal</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${data.calorieGoalProgress >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {data.calorieGoalProgress}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Protein</p>
                <p className="text-3xl font-bold">{data.totalProtein}g</p>
                <p className="text-xs text-muted-foreground">Goal: {DAILY_GOALS.protein}g/{dateRange}d</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Carbs</p>
                <p className="text-3xl font-bold">{data.totalCarbs}g</p>
                <p className="text-xs text-muted-foreground">Goal: {DAILY_GOALS.carbs}g/{dateRange}d</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fat</p>
                <p className="text-3xl font-bold">{data.totalFat}g</p>
                <p className="text-xs text-muted-foreground">Goal: {DAILY_GOALS.fat}g/{dateRange}d</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrition Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {viewMode === 'daily' ? 'Daily' : viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Nutrition Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={
                viewMode === 'daily' ? data.dailyNutrition :
                viewMode === 'weekly' ? data.weeklyNutrition : 
                data.monthlyNutrition
              }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viewMode === 'daily' ? 'date' : viewMode === 'weekly' ? 'week' : 'month'} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Calories"
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="Protein (g)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Macro Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.macroDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.macroDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name) => [`${value} kcal`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Nutrition Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Macro Breakdown ({viewMode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={
                viewMode === 'daily' ? data.dailyNutrition :
                viewMode === 'weekly' ? data.weeklyNutrition : 
                data.monthlyNutrition
              }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viewMode === 'daily' ? 'date' : viewMode === 'weekly' ? 'week' : 'month'} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="protein" fill="hsl(var(--primary))" name="Protein (g)" />
                <Bar dataKey="carbs" fill="hsl(var(--accent))" name="Carbs (g)" />
                <Bar dataKey="fat" fill="hsl(var(--secondary))" name="Fat (g)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-muted-foreground">
                    {data.avgDailyCalories} / {DAILY_GOALS.calories} kcal
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(data.calorieGoalProgress, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(data.totalProtein / parseInt(dateRange))} / {DAILY_GOALS.protein}g
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(data.proteinGoalProgress, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(data.totalCarbs / parseInt(dateRange))} / {DAILY_GOALS.carbs}g
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((Math.round(data.totalCarbs / parseInt(dateRange)) / DAILY_GOALS.carbs) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Fat</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(data.totalFat / parseInt(dateRange))} / {DAILY_GOALS.fat}g
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-muted-foreground h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((Math.round(data.totalFat / parseInt(dateRange)) / DAILY_GOALS.fat) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}