import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Trophy, Brain, TrendingUp } from "lucide-react";
import GoalSetting from "./GoalSetting";
import Achievements from "./Achievements";
import NutritionInsights from "./NutritionInsights";

export default function GoalsAndGamification() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Goals & Gamification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="goals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goals">
              <GoalSetting />
            </TabsContent>

            <TabsContent value="achievements">
              <Achievements />
            </TabsContent>

            <TabsContent value="insights">
              <NutritionInsights />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}