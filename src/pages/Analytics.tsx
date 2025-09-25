import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Zap,
  Award,
  Leaf,
  ChevronRight
} from "lucide-react";

// Mock analytics data
const mockStats = {
  daily: {
    calories: { current: 1420, target: 1800, previous: 1350 },
    protein: { current: 85, target: 120, previous: 78 },
    carbs: { current: 180, target: 200, previous: 165 },
    fat: { current: 52, target: 70, previous: 48 }
  },
  weekly: {
    avgCalories: 1385,
    totalMeals: 16,
    streakDays: 7,
    achievements: 3
  }
};

const mockTrends = [
  { date: "Mon", calories: 1200, protein: 75, carbs: 150, fat: 45 },
  { date: "Tue", calories: 1450, protein: 88, carbs: 180, fat: 55 },
  { date: "Wed", calories: 1380, protein: 82, carbs: 170, fat: 52 },
  { date: "Thu", calories: 1520, protein: 92, carbs: 190, fat: 58 },
  { date: "Fri", calories: 1420, protein: 85, carbs: 180, fat: 52 },
  { date: "Sat", calories: 1300, protein: 78, carbs: 160, fat: 48 },
  { date: "Sun", calories: 1400, protein: 85, carbs: 175, fat: 50 }
];

const mockGoals = [
  { name: "Daily Calorie Target", current: 1420, target: 1800, unit: "kcal", progress: 79 },
  { name: "Protein Goal", current: 85, target: 120, unit: "g", progress: 71 },
  { name: "Weekly Meal Frequency", current: 16, target: 21, unit: "meals", progress: 76 },
  { name: "Sustainability Score", current: 8.2, target: 10, unit: "/10", progress: 82 }
];

const mockAchievements = [
  { name: "First Scan", description: "Completed your first meal scan", earned: true, date: "2 weeks ago" },
  { name: "Week Warrior", description: "Logged meals for 7 consecutive days", earned: true, date: "1 week ago" },
  { name: "Green Champion", description: "Chose 5 sustainable options", earned: true, date: "3 days ago" },
  { name: "Protein Power", description: "Met protein goals for 5 days", earned: false, progress: 80 },
  { name: "Variety Explorer", description: "Try 10 different dishes", earned: false, progress: 60 }
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");

  const NutritionCard = ({ title, current, target, unit, trend }: any) => (
    <Card className="cb-card">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <Badge variant={trend > 0 ? "default" : "secondary"} className="text-xs">
              {trend > 0 ? "+" : ""}{trend}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-cb-ink">{current}</span>
              <span className="text-sm text-muted-foreground">/ {target} {unit}</span>
            </div>
            
            <Progress 
              value={(current / target) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TrendChart = () => (
    <Card className="cb-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cb-green-500" />
          Weekly Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart visualization */}
          <div className="grid grid-cols-7 gap-2 h-32">
            {mockTrends.map((day, index) => (
              <div key={day.date} className="flex flex-col items-center justify-end space-y-1">
                <div 
                  className="w-full bg-cb-green-400 rounded-t"
                  style={{ height: `${(day.calories / 1600) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Daily Calories</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-conqueror text-cb-ink">Analytics & Progress</h1>
          <p className="text-muted-foreground">Track your nutrition journey and achievements</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cb-green-500" />
          <div className="flex gap-1">
            {["day", "week", "month"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod === period ? "cb-button-primary" : ""}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NutritionCard
              title="Calories"
              current={mockStats.daily.calories.current}
              target={mockStats.daily.calories.target}
              unit="kcal"
              trend={5.2}
            />
            <NutritionCard
              title="Protein"
              current={mockStats.daily.protein.current}
              target={mockStats.daily.protein.target}
              unit="g"
              trend={9.0}
            />
            <NutritionCard
              title="Carbs"
              current={mockStats.daily.carbs.current}
              target={mockStats.daily.carbs.target}
              unit="g"
              trend={9.1}
            />
            <NutritionCard
              title="Fat"
              current={mockStats.daily.fat.current}
              target={mockStats.daily.fat.target}
              unit="g"
              trend={8.3}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart />
            
            <Card className="cb-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cb-green-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-cb-green-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-cb-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-cb-green-700">Great Progress!</h4>
                      <p className="text-sm text-cb-green-600">
                        You're 79% towards your daily calorie goal. Keep it up!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-cb-blue-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-cb-blue-300 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-cb-blue-400">Protein Focus</h4>
                      <p className="text-sm text-cb-blue-300">
                        Consider adding more protein-rich foods to reach your goal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-700">Eco Impact</h4>
                      <p className="text-sm text-orange-600">
                        Your choices this week saved 2.3kg CO₂ equivalent.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockGoals.map((goal, index) => (
              <Card key={index} className="cb-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-cb-ink">{goal.name}</h3>
                      <Badge 
                        variant={goal.progress >= 80 ? "default" : "secondary"}
                        className={goal.progress >= 80 ? "bg-cb-green-500" : ""}
                      >
                        {goal.progress}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-cb-ink">{goal.current}</span>
                        <span className="text-sm text-muted-foreground">
                          / {goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="space-y-4">
            {mockAchievements.map((achievement, index) => (
              <Card 
                key={index} 
                className={`cb-card ${achievement.earned ? 'bg-cb-green-50 border-cb-green-200' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned 
                          ? 'bg-cb-green-500' 
                          : 'bg-muted'
                      }`}>
                        <Award className={`h-6 w-6 ${
                          achievement.earned ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-cb-ink">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned ? (
                          <p className="text-xs text-cb-green-600 mt-1">
                            Earned {achievement.date}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <Progress value={achievement.progress} className="h-2 w-32" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.progress}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {achievement.earned && (
                      <ChevronRight className="h-5 w-5 text-cb-green-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sustainability" className="space-y-6">
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">2.3kg</p>
                  <p className="text-sm text-green-600">CO₂ Saved</p>
                </div>
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">450L</p>
                  <p className="text-sm text-blue-600">Water Saved</p>
                </div>
                <div className="text-center p-4 bg-orange-100 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">8.2/10</p>
                  <p className="text-sm text-orange-600">Eco Score</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-cb-ink">This Week's Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Your sustainable food choices this week have made a positive environmental impact. 
                  Keep choosing plant-based options and locally sourced ingredients!
                </p>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">Eco-Friendly Choices</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 3 plant-based meals</li>
                    <li>• 2 locally sourced dishes</li>
                    <li>• 1 zero-waste option</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}