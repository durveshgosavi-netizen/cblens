import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Processing achievements and streaks for user:', user_id);

    // Update streaks
    await updateStreaks(supabaseClient, user_id);
    
    // Check and award achievements
    await checkAchievements(supabaseClient, user_id);

    // Generate insights
    await generateInsights(supabaseClient, user_id);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing achievements:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function updateStreaks(supabaseClient: any, userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user scanned today
    const { data: todayScans } = await supabaseClient
      .from('scans')
      .select('id')
      .eq('user_id', userId)
      .gte('scan_timestamp', today + 'T00:00:00.000Z')
      .lt('scan_timestamp', today + 'T23:59:59.999Z');

    if (todayScans && todayScans.length > 0) {
      // Update daily tracking streak
      await updateDailyStreak(supabaseClient, userId);
    }

  } catch (error) {
    console.error('Error updating streaks:', error);
  }
}

async function updateDailyStreak(supabaseClient: any, userId: string) {
  const { data: existingStreak } = await supabaseClient
    .from('nutrition_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', 'daily_tracking')
    .single();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (existingStreak) {
    let newCount = existingStreak.current_count;
    
    if (existingStreak.last_activity_date === yesterday) {
      // Continue streak
      newCount += 1;
    } else if (existingStreak.last_activity_date !== today) {
      // Reset streak
      newCount = 1;
    }

    await supabaseClient
      .from('nutrition_streaks')
      .update({
        current_count: newCount,
        best_count: Math.max(newCount, existingStreak.best_count),
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingStreak.id);
  } else {
    // Create new streak
    await supabaseClient
      .from('nutrition_streaks')
      .insert({
        user_id: userId,
        streak_type: 'daily_tracking',
        current_count: 1,
        best_count: 1,
        last_activity_date: today
      });
  }
}

async function checkAchievements(supabaseClient: any, userId: string) {
  try {
    // Get user's current achievements
    const { data: userAchievements } = await supabaseClient
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    // Get all achievements
    const { data: allAchievements } = await supabaseClient
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (!allAchievements) return;

    // Get user stats
    const { data: scans } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('user_id', userId);

    const { data: ratings } = await supabaseClient
      .from('meal_ratings')
      .select('*')
      .eq('user_id', userId);

    const { data: streaks } = await supabaseClient
      .from('nutrition_streaks')
      .select('*')
      .eq('user_id', userId);

    for (const achievement of allAchievements) {
      if (earnedIds.includes(achievement.id)) continue;

      const criteria = achievement.criteria;
      let shouldAward = false;

      // Check different achievement criteria
      if (criteria.scans_count && scans && scans.length >= criteria.scans_count) {
        shouldAward = true;
      }
      
      if (criteria.consecutive_days) {
        const dailyStreak = streaks?.find(s => s.streak_type === 'daily_tracking');
        if (dailyStreak && dailyStreak.current_count >= criteria.consecutive_days) {
          shouldAward = true;
        }
      }

      if (criteria.meal_feedbacks && ratings && ratings.length >= criteria.meal_feedbacks) {
        shouldAward = true;
      }

      if (criteria.unique_dishes && scans) {
        const uniqueDishes = new Set(scans.map(s => s.kanpla_item_id));
        if (uniqueDishes.size >= criteria.unique_dishes) {
          shouldAward = true;
        }
      }

      if (shouldAward) {
        await supabaseClient
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          });

        console.log(`Awarded achievement: ${achievement.name} to user: ${userId}`);
      }
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

async function generateInsights(supabaseClient: any, userId: string) {
  try {
    // Get recent scan data for analysis
    const { data: recentScans } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .gte('scan_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('scan_timestamp', { ascending: false });

    if (!recentScans || recentScans.length === 0) return;

    // Calculate averages
    const avgCalories = recentScans.reduce((sum, scan) => sum + (scan.scaled_calories || 0), 0) / recentScans.length;
    const avgProtein = recentScans.reduce((sum, scan) => sum + (scan.scaled_protein || 0), 0) / recentScans.length;

    // Generate insights based on patterns
    const insights = [];

    if (avgProtein < 100) {
      insights.push({
        insight_type: 'deficiency',
        title: 'Low Protein Intake',
        description: `Your average protein intake is ${Math.round(avgProtein)}g per day. Consider adding more protein-rich foods.`,
        severity: 'warning',
        data: { avg_protein: avgProtein, target: 150 }
      });
    }

    if (avgCalories < 1500) {
      insights.push({
        insight_type: 'deficiency',
        title: 'Low Calorie Intake',
        description: `Your average daily calories (${Math.round(avgCalories)}) might be too low. Ensure you're meeting your energy needs.`,
        severity: 'warning',
        data: { avg_calories: avgCalories, target: 2000 }
      });
    }

    if (recentScans.length >= 5) {
      insights.push({
        insight_type: 'trend',
        title: 'Great Tracking Consistency!',
        description: `You've tracked ${recentScans.length} meals this week. Keep up the excellent habit!`,
        severity: 'info',
        data: { meals_tracked: recentScans.length }
      });
    }

    // Insert insights
    for (const insight of insights) {
      await supabaseClient
        .from('nutrition_insights')
        .insert({
          user_id: userId,
          ...insight,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

  } catch (error) {
    console.error('Error generating insights:', error);
  }
}