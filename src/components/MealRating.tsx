import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MealRatingProps {
  scanId: string;
  kanplaItemId: string;
  dishName: string;
  onRatingSubmitted?: () => void;
}

interface RatingState {
  overall: number;
  taste: number;
  portion: number;
  value: number;
}

export default function MealRating({ 
  scanId, 
  kanplaItemId, 
  dishName, 
  onRatingSubmitted 
}: MealRatingProps) {
  const [ratings, setRatings] = useState<RatingState>({
    overall: 0,
    taste: 0,
    portion: 0,
    value: 0
  });
  const [feedback, setFeedback] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const updateRating = (category: keyof RatingState, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const renderStarRating = (
    category: keyof RatingState, 
    label: string
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateRating(category, star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= ratings[category]
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const submitRating = async () => {
    if (ratings.overall === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meal_ratings')
        .insert({
          user_id: user.id,
          scan_id: scanId,
          kanpla_item_id: kanplaItemId,
          rating: ratings.overall,
          taste_rating: ratings.taste || null,
          portion_rating: ratings.portion || null,
          value_rating: ratings.value || null,
          feedback: feedback || null,
          would_recommend: wouldRecommend
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!"
      });

      onRatingSubmitted?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rate Your Meal</CardTitle>
        <Badge variant="outline" className="w-fit">
          {dishName}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        {renderStarRating('overall', 'Overall Rating *')}

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderStarRating('taste', 'Taste')}
          {renderStarRating('portion', 'Portion Size')}
          {renderStarRating('value', 'Value for Money')}
        </div>

        {/* Recommendation */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Would you recommend this dish?</label>
          <div className="flex gap-2">
            <Button
              variant={wouldRecommend === true ? "default" : "outline"}
              size="sm"
              onClick={() => setWouldRecommend(true)}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Yes
            </Button>
            <Button
              variant={wouldRecommend === false ? "destructive" : "outline"}
              size="sm"
              onClick={() => setWouldRecommend(false)}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              No
            </Button>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Feedback (Optional)</label>
          <Textarea
            placeholder="Share your thoughts about the meal..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={submitRating} 
          disabled={submitting || ratings.overall === 0}
          className="w-full"
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </Button>
      </CardContent>
    </Card>
  );
}