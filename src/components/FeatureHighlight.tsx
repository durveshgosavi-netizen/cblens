import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, User, TrendingUp, CheckCircle } from "lucide-react";

export default function FeatureHighlight() {
  const features = [
    {
      icon: <User className="h-5 w-5" />,
      title: "Dietary Preferences",
      description: "Set your allergies, diet type, and food preferences for personalized recommendations",
      status: "new"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Daily Recommendations", 
      description: "Get personalized meal suggestions based on your nutrition history and preferences",
      status: "new"
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Chef's Choice",
      description: "Discover specially highlighted dishes chosen by our head chef",
      status: "new"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Meal Ratings",
      description: "Rate your meals and help improve the canteen experience for everyone",
      status: "new"
    }
  ];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">New Features Available!</CardTitle>
          <Badge className="ml-auto bg-green-500 text-white">Phase 1</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
              <div className="text-primary mt-0.5">
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{feature.title}</h4>
                  <Badge variant="secondary" className="text-xs">
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
            Visit the <strong>Profile</strong> tab to set your preferences and see personalized recommendations!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}