import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, User, TrendingUp, CheckCircle, Target, Trophy, Brain, Zap } from "lucide-react";

export default function FeatureHighlight() {
  const phaseOneFeatures = [
    {
      icon: <User className="h-5 w-5" />,
      title: "Dietary Preferences",
      description: "Set your allergies, diet type, and food preferences for personalized recommendations",
      status: "live"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Daily Recommendations", 
      description: "Get personalized meal suggestions based on your nutrition history and preferences",
      status: "live"
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Chef's Choice",
      description: "Discover specially highlighted dishes chosen by our head chef",
      status: "live"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Meal Ratings",
      description: "Rate your meals and help improve the canteen experience for everyone",
      status: "live"
    }
  ];

  const phaseTwoFeatures = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Personal Goal Setting",
      description: "Set and track daily/weekly nutrition goals with progress monitoring",
      status: "new"
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Achievement System",
      description: "Earn badges and points for healthy eating habits and consistency",
      status: "new"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Streak Tracking",
      description: "Build and maintain daily nutrition tracking streaks",
      status: "new"
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Nutrition Insights",
      description: "Get predictive analytics and personalized nutrition recommendations",
      status: "new"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Phase 2 Features */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">New Phase 2 Features! 🚀</CardTitle>
            <Badge className="ml-auto bg-green-500 text-white">Just Released</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {phaseTwoFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                <div className="text-primary mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-center">
              Visit the <strong>Profile → Goals & Achievements</strong> tab to explore the new features!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1 Features */}
      <Card className="border border-muted">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Phase 1 Features</CardTitle>
            <Badge className="ml-auto bg-blue-500 text-white">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {phaseOneFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
                <div className="text-blue-500 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}