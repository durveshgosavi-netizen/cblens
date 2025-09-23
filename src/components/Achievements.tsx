import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Crown, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  earned_at?: string;
  progress?: any;
}

interface UserStreak {
  streak_type: string;
  current_count: number;
  best_count: number;
}

const ICON_MAP: { [key: string]: any } = {
  camera: Trophy,
  dumbbell: Medal,
  target: Star,
  compass: Zap,
  'balance-scale': Award,
  flame: Crown,
  'chef-hat': Crown,
  'message-circle': Star
};

const RARITY_COLORS = {
  common: "bg-gray-500",
  rare: "bg-blue-500", 
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      // Fetch user's earned achievements
      const { data: earnedAchievements } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', user.id);

      // Fetch user streaks
      const { data: userStreaks } = await supabase
        .from('nutrition_streaks')
        .select('*')
        .eq('user_id', user.id);

      setAchievements(allAchievements || []);
      
      if (earnedAchievements) {
        const earned = earnedAchievements.map(ua => ({
          ...ua.achievements,
          earned_at: ua.earned_at,
          progress: ua.progress
        }));
        setUserAchievements(earned);
        setTotalPoints(earned.reduce((sum, ach) => sum + ach.points, 0));
      }

      setStreaks(userStreaks || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Trophy;
    return <IconComponent className="h-6 w-6" />;
  };

  const isEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.id === achievementId);
  };

  const getStreakInfo = (type: string) => {
    return streaks.find(s => s.streak_type === type);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements & Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading achievements...</div>
        </CardContent>
      </Card>
    );
  }

  const categories = [...new Set(achievements.map(a => a.category))];

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{userAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {getStreakInfo('daily_tracking')?.current_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Math.round((userAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      {categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {categoryAchievements.map(achievement => {
                  const earned = isEarned(achievement.id);
                  
                  return (
                    <div 
                      key={achievement.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                        earned 
                          ? 'bg-primary/10 border-primary/20 shadow-sm' 
                          : 'bg-muted/30 border-muted opacity-60'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${earned ? 'bg-primary text-white' : 'bg-muted'}`}>
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <Badge 
                            className={`text-xs text-white ${RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]}`}
                          >
                            {achievement.rarity}
                          </Badge>
                          {earned && (
                            <Badge variant="secondary" className="text-xs">
                              Earned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-medium">{achievement.points} points</span>
                        </div>
                      </div>

                      {earned && (
                        <div className="text-right">
                          <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                          <div className="text-xs text-muted-foreground">
                            {new Date(userAchievements.find(ua => ua.id === achievement.id)?.earned_at || '').toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Current Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {streaks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Start tracking meals to build your first streak!
              </p>
            ) : (
              streaks.map(streak => (
                <div key={streak.streak_type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">
                      {streak.streak_type.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Best: {streak.best_count} days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {streak.current_count}
                    </div>
                    <div className="text-sm text-muted-foreground">days</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}