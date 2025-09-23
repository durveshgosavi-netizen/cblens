import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Utensils, Target } from "lucide-react";
import DietaryPreferences from "./DietaryPreferences";
import DailyRecommendations from "./DailyRecommendations";

export default function UserProfile() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preferences" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Dietary Preferences
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Daily Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences">
              <DietaryPreferences />
            </TabsContent>

            <TabsContent value="recommendations">
              <DailyRecommendations />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}