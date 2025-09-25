import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Camera, 
  UtensilsCrossed, 
  TrendingUp, 
  Clock,
  ChefHat,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from "lucide-react";

// Mock data - will be replaced with real data
const mockMenuItems = [
  { id: 1, name: "Mediterranean Bowl", category: "Green Dish", calories: 420, tags: ["vegetarian", "high-protein"] },
  { id: 2, name: "Grilled Salmon", category: "Hot Dish", calories: 380, tags: ["omega-3", "low-carb"] },
  { id: 3, name: "Quinoa Salad", category: "Salad", calories: 320, tags: ["vegan", "gluten-free"] },
];

const mockNews = [
  { id: 1, title: "Meet Chef Maria: Sustainable Cooking Pioneer", type: "news", time: "2h ago" },
  { id: 2, title: "New Plant-Based Menu Items This Week", type: "news", time: "4h ago" },
  { id: 3, title: "Reducing Food Waste Together", type: "news", time: "1d ago" },
];

const mockUpdates = [
  { id: 1, title: "Friday lunch service moved to 12:30 PM", type: "update", severity: "warning", time: "30m ago" },
  { id: 2, title: "Veggie burger sold out - try our lentil wrap!", type: "update", severity: "info", time: "1h ago" },
];

const mockRecommendations = [
  { id: 1, name: "Grilled Chicken Salad", reason: "High protein", badges: ["chef's choice"] },
  { id: 2, name: "Roasted Vegetable Pasta", reason: "Vegetarian", badges: ["low-carb alternative"] },
  { id: 3, name: "Superfood Smoothie Bowl", reason: "Energy boost", badges: ["antioxidant rich"] },
];

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-conqueror text-cb-ink">Good afternoon! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening at Main Campus today</p>
      </div>

      {/* Active Updates Banner */}
      {mockUpdates.length > 0 && (
        <div className="space-y-3">
          {mockUpdates.map((update) => (
            <Card key={update.id} className={`border-l-4 ${
              update.severity === 'warning' ? 'border-l-cb-orange bg-orange-50' : 'border-l-cb-blue-300 bg-cb-blue-100'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      update.severity === 'warning' ? 'text-cb-orange' : 'text-cb-blue-300'
                    }`} />
                    <div>
                      <p className="font-medium text-cb-ink">{update.title}</p>
                      <p className="text-sm text-muted-foreground">{update.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {update.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cb-card-elevated cursor-pointer hover:shadow-elevated transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-cb-ink mb-2">Scan Your Meal</h3>
                <p className="text-muted-foreground">Get instant nutrition insights</p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <Link to="/scan">
              <Button className="w-full mt-4 cb-button-primary">
                Start Scanning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="cb-card cursor-pointer hover:shadow-soft transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-cb-ink mb-2">Today's Menu</h3>
                <p className="text-muted-foreground">View all available dishes</p>
              </div>
              <div className="w-12 h-12 bg-cb-green-200 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-cb-green-600" />
              </div>
            </div>
            <Link to="/menu">
              <Button variant="outline" className="w-full mt-4">
                Browse Menu
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Menu Preview */}
      <Card className="cb-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-cb-green-500" />
              Today's Highlights
            </CardTitle>
            <Link to="/menu">
              <Button variant="ghost" size="sm" className="text-cb-green-600">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockMenuItems.map((item) => (
              <div key={item.id} className="p-4 border border-border rounded-xl hover:shadow-soft transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-cb-ink">{item.name}</h4>
                  <Badge variant="secondary" className="text-xs">{item.calories} kcal</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card className="cb-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cb-green-500" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecommendations.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-cb-green-50 transition-all duration-200">
                <div>
                  <h4 className="font-medium text-cb-ink">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                </div>
                <div className="flex gap-1">
                  {item.badges.map((badge) => (
                    <Badge key={badge} className="text-xs bg-cb-green-500 text-white">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News Ticker */}
      <Card className="cb-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cb-green-500" />
              Latest News
            </CardTitle>
            <Link to="/feed">
              <Button variant="ghost" size="sm" className="text-cb-green-600">
                Read All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockNews.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-cb-green-50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <ChefHat className="h-4 w-4 text-cb-green-500" />
                  <div>
                    <h4 className="font-medium text-cb-ink">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cb-card text-center">
          <CardContent className="p-4">
            <TrendingUp className="h-6 w-6 text-cb-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-cb-ink">1,420</p>
            <p className="text-sm text-muted-foreground">Avg Daily kcal</p>
          </CardContent>
        </Card>
        <Card className="cb-card text-center">
          <CardContent className="p-4">
            <Sparkles className="h-6 w-6 text-cb-blue-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-cb-ink">7</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="cb-card text-center">
          <CardContent className="p-4">
            <UtensilsCrossed className="h-6 w-6 text-cb-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-cb-ink">23</p>
            <p className="text-sm text-muted-foreground">Meals Logged</p>
          </CardContent>
        </Card>
        <Card className="cb-card text-center">
          <CardContent className="p-4">
            <ChefHat className="h-6 w-6 text-cb-orange mx-auto mb-2" />
            <p className="text-2xl font-bold text-cb-ink">8</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}