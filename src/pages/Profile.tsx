import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Utensils, 
  Target, 
  Zap,
  Apple,
  Shield,
  Smartphone,
  Settings,
  Bell,
  Link,
  ChevronRight,
  ExternalLink
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex.johnson@company.com",
  defaultCanteen: "Main Campus",
  joinedDate: "2023-12-01",
  totalScans: 47,
  currentStreak: 7
};

const mockDietaryPreferences = {
  allergies: ["nuts", "shellfish"],
  diets: ["vegetarian"],
  dislikes: ["mushrooms", "blue cheese"],
  preferences: ["high-protein", "low-sodium"]
};

const mockGoals = {
  dailyCalories: 1800,
  protein: 120,
  carbs: 200,
  fat: 70,
  weeklyMeals: 21,
  waterIntake: 8
};

const mockIntegrations = [
  { name: "Apple Health", connected: true, lastSync: "2 hours ago", icon: Apple },
  { name: "Google Fit", connected: false, lastSync: null, icon: Smartphone },
  { name: "Fitbit", connected: false, lastSync: null, icon: Zap },
  { name: "Garmin Connect", connected: false, lastSync: null, icon: Target }
];

const availableCanteens = [
  "Main Campus",
  "Harbour Office", 
  "Innovation Center",
  "Research Hub"
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("preferences");
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    goalAlerts: true,
    newMenuItems: false,
    achievements: true
  });

  const [goals, setGoals] = useState(mockGoals);

  const handleGoalChange = (key: string, value: number) => {
    setGoals(prev => ({ ...prev, [key]: value }));
  };

  const handleConnectIntegration = (integrationName: string) => {
    console.log(`Connecting to ${integrationName}`);
    // OAuth flow would be triggered here
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-conqueror text-cb-ink">Profile</h1>
            <p className="text-muted-foreground">Manage your preferences and settings</p>
          </div>
          
          <Card className="cb-card">
            <CardContent className="p-4 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-cb-ink">{mockUser.name}</h3>
              <p className="text-sm text-muted-foreground">{mockUser.email}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-cb-ink">{mockUser.totalScans}</p>
                  <p>Scans</p>
                </div>
                <div>
                  <p className="font-medium text-cb-ink">{mockUser.currentStreak}</p>
                  <p>Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="canteen">Canteen</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* Dietary Preferences */}
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-cb-green-500" />
                Dietary Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allergies */}
              <div>
                <label className="text-sm font-medium text-cb-ink mb-2 block">
                  Allergies & Intolerances
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mockDietaryPreferences.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive">
                      {allergy}
                      <button className="ml-2 text-xs">×</button>
                    </Badge>
                  ))}
                </div>
                <Input placeholder="Add allergies (e.g., nuts, dairy, gluten)" />
              </div>

              {/* Diets */}
              <div>
                <label className="text-sm font-medium text-cb-ink mb-2 block">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mockDietaryPreferences.diets.map((diet) => (
                    <Badge key={diet} className="bg-cb-green-500">
                      {diet}
                      <button className="ml-2 text-xs">×</button>
                    </Badge>
                  ))}
                </div>
                <Input placeholder="Add dietary restrictions (e.g., vegetarian, vegan, halal)" />
              </div>

              {/* Dislikes */}
              <div>
                <label className="text-sm font-medium text-cb-ink mb-2 block">
                  Food Dislikes
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mockDietaryPreferences.dislikes.map((dislike) => (
                    <Badge key={dislike} variant="outline">
                      {dislike}
                      <button className="ml-2 text-xs">×</button>
                    </Badge>
                  ))}
                </div>
                <Input placeholder="Add foods you dislike" />
              </div>

              {/* Preferences */}
              <div>
                <label className="text-sm font-medium text-cb-ink mb-2 block">
                  Nutrition Preferences
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mockDietaryPreferences.preferences.map((preference) => (
                    <Badge key={preference} className="bg-cb-blue-300">
                      {preference}
                      <button className="ml-2 text-xs">×</button>
                    </Badge>
                  ))}
                </div>
                <Input placeholder="Add nutrition preferences (e.g., high-protein, low-carb)" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-cb-green-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-cb-ink">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'mealReminders' && 'Get reminded to log your meals'}
                      {key === 'goalAlerts' && 'Notifications about your nutrition goals'}
                      {key === 'newMenuItems' && 'Alerts about new dishes and specials'}
                      {key === 'achievements' && 'Celebrate your milestones'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cb-green-500" />
                Nutrition Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-cb-ink mb-2 block">
                    Daily Calories (kcal)
                  </label>
                  <Input
                    type="number"
                    value={goals.dailyCalories}
                    onChange={(e) => handleGoalChange('dailyCalories', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-cb-ink mb-2 block">
                    Protein (grams)
                  </label>
                  <Input
                    type="number"
                    value={goals.protein}
                    onChange={(e) => handleGoalChange('protein', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-cb-ink mb-2 block">
                    Carbohydrates (grams)
                  </label>
                  <Input
                    type="number"
                    value={goals.carbs}
                    onChange={(e) => handleGoalChange('carbs', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-cb-ink mb-2 block">
                    Fat (grams)
                  </label>
                  <Input
                    type="number"
                    value={goals.fat}
                    onChange={(e) => handleGoalChange('fat', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-cb-ink mb-2 block">
                    Weekly Meals
                  </label>
                  <Input
                    type="number"
                    value={goals.weeklyMeals}
                    onChange={(e) => handleGoalChange('weeklyMeals', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-cb-ink mb-2 block">
                    Water Intake (glasses)
                  </label>
                  <Input
                    type="number"
                    value={goals.waterIntake}
                    onChange={(e) => handleGoalChange('waterIntake', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <Button className="cb-button-primary">
                Save Goals
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canteen" className="space-y-6">
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cb-green-500" />
                Canteen Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Default */}
              <div>
                <label className="text-sm font-medium text-cb-ink mb-2 block">
                  Default Canteen
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg">
                  {availableCanteens.map((canteen) => (
                    <option 
                      key={canteen} 
                      value={canteen}
                      selected={canteen === mockUser.defaultCanteen}
                    >
                      {canteen}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground mt-1">
                  This will be your primary location for menus and recommendations
                </p>
              </div>

              {/* Available Canteens */}
              <div>
                <label className="text-sm font-medium text-cb-ink mb-3 block">
                  All Available Locations
                </label>
                <div className="space-y-2">
                  {availableCanteens.map((canteen) => (
                    <div key={canteen} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-cb-green-500" />
                        <div>
                          <p className="font-medium text-cb-ink">{canteen}</p>
                          <p className="text-sm text-muted-foreground">
                            {canteen === mockUser.defaultCanteen ? 'Default location' : 'Available'}
                          </p>
                        </div>
                      </div>
                      {canteen === mockUser.defaultCanteen ? (
                        <Badge className="bg-cb-green-500">Default</Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Set as Default
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Services */}
              <div className="p-4 bg-cb-green-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-cb-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-cb-green-700">Location Services</h4>
                    <p className="text-sm text-cb-green-600 mt-1">
                      Enable location access to automatically detect nearby canteens and show relevant menus.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 border-cb-green-300 text-cb-green-700">
                      Enable Location Access
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Wearables & Health Apps */}
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-cb-green-500" />
                Health & Fitness Apps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockIntegrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-cb-ink">{integration.name}</h4>
                        {integration.connected ? (
                          <p className="text-sm text-cb-green-600">
                            Connected • Last sync: {integration.lastSync}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not connected</p>
                        )}
                      </div>
                    </div>
                    
                    {integration.connected ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cb-green-500">Connected</Badge>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleConnectIntegration(integration.name)}
                        className="cb-button-primary"
                        size="sm"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
              
              <div className="p-4 bg-cb-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-cb-blue-300 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-cb-blue-400">Sync Your Data</h4>
                    <p className="text-sm text-cb-blue-300 mt-1">
                      Connect your fitness apps to get a complete picture of your health and nutrition.
                      We'll sync calories burned, steps, and activity data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Corporate Wellness */}
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cb-green-500" />
                Corporate Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Link className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-cb-ink">Company Wellness Program</h4>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized nutrition data with your company's wellness platform
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-cb-ink">Privacy First</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All data shared with corporate wellness programs is anonymized and aggregated. 
                      Individual meal details are never shared.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Provider Integration */}
          <Card className="cb-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-cb-green-500" />
                Menu Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium text-cb-ink">Kanpla Menu System</h4>
                  <p className="text-sm text-muted-foreground">
                    Connected to receive real-time menu updates and nutrition data
                  </p>
                </div>
                <Badge className="bg-cb-green-500">Active</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  Menu data is automatically synchronized from your canteen's management system. 
                  This ensures accurate nutrition information and up-to-date availability.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}