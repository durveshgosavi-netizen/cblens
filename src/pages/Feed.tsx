import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, 
  AlertTriangle, 
  Clock, 
  Heart,
  MessageCircle,
  Share,
  ChefHat,
  Leaf,
  Info
} from "lucide-react";

// Mock data
const mockNews = [
  {
    id: "1",
    type: "news",
    title: "Meet Chef Maria: Sustainable Cooking Pioneer",
    excerpt: "Chef Maria shares her journey towards zero-waste cooking and how she's transforming our canteen experience.",
    content: "Full article content would go here...",
    author: "CB Editorial Team",
    publishedAt: "2h ago",
    canteens: ["Main Campus", "Harbour Office"],
    image: "/api/placeholder/600/300",
    reactions: { likes: 24, comments: 8 },
    tags: ["sustainability", "chef-spotlight"]
  },
  {
    id: "2", 
    type: "news",
    title: "New Plant-Based Menu Items This Week",
    excerpt: "Discover our latest collection of delicious plant-based dishes, crafted with locally sourced ingredients.",
    content: "Full article content would go here...",
    author: "Nutrition Team",
    publishedAt: "4h ago",
    canteens: ["Main Campus"],
    image: "/api/placeholder/600/300",
    reactions: { likes: 18, comments: 5 },
    tags: ["plant-based", "new-menu"]
  }
];

const mockUpdates = [
  {
    id: "1",
    type: "update",
    title: "Friday lunch service moved to 12:30 PM",
    content: "Due to a special event, lunch service will start 30 minutes later than usual this Friday.",
    severity: "warning" as const,
    publishedAt: "30m ago",
    canteens: ["Main Campus"],
    effectiveFrom: "2024-01-19",
    effectiveTo: "2024-01-19"
  },
  {
    id: "2",
    type: "update", 
    title: "Veggie burger sold out - try our lentil wrap!",
    content: "Our popular veggie burger is sold out for today. We recommend trying our delicious Mediterranean lentil wrap as an alternative.",
    severity: "info" as const,
    publishedAt: "1h ago",
    canteens: ["Main Campus", "Harbour Office"],
    effectiveFrom: "2024-01-18",
    effectiveTo: "2024-01-18"
  }
];

export default function Feed() {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const allItems = [...mockNews, ...mockUpdates].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const filteredItems = activeTab === "all" ? allItems : 
    activeTab === "news" ? mockNews : mockUpdates;

  const handleReaction = (itemId: string, reactionType: string) => {
    console.log(`Reacting with ${reactionType} to item ${itemId}`);
  };

  const renderNewsItem = (item: any) => (
    <Card key={item.id} className="cb-card hover:shadow-soft transition-all duration-200">
      <CardContent className="p-0">
        {/* Hero Image */}
        {item.image && (
          <div className="cb-hero-image h-48">
            <div className="w-full h-full bg-cb-green-200 flex items-center justify-center text-cb-green-600">
              News Image: {item.title}
            </div>
          </div>
        )}
        
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <Badge className="bg-cb-blue-300 text-white">
                <Newspaper className="h-3 w-3 mr-1" />
                News
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.publishedAt}
              </span>
            </div>
            
            <h2 className="text-xl font-conqueror text-cb-ink">{item.title}</h2>
            <p className="text-muted-foreground">{item.excerpt}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag === 'sustainability' && <Leaf className="h-3 w-3 mr-1" />}
                {tag === 'chef-spotlight' && <ChefHat className="h-3 w-3 mr-1" />}
                {tag}
              </Badge>
            ))}
          </div>

          {/* Canteen Tags */}
          <div className="flex flex-wrap gap-1">
            {item.canteens.map((canteen: string) => (
              <Badge key={canteen} variant="secondary" className="text-xs">
                {canteen}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(item.id, 'like')}
                className="text-muted-foreground hover:text-cb-green-500"
              >
                <Heart className="h-4 w-4 mr-1" />
                {item.reactions.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-cb-green-500"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {item.reactions.comments}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-cb-green-500"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              className="text-cb-green-600"
            >
              {expandedItem === item.id ? 'Show Less' : 'Read More'}
            </Button>
          </div>

          {/* Expanded Content */}
          {expandedItem === item.id && (
            <div className="pt-4 border-t border-border">
              <p className="text-muted-foreground">{item.content}</p>
              <p className="text-sm text-muted-foreground mt-4">
                By {item.author}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderUpdateItem = (item: any) => (
    <Card 
      key={item.id} 
      className={`cb-card border-l-4 ${
        item.severity === 'warning' 
          ? 'border-l-cb-orange bg-orange-50' 
          : 'border-l-cb-blue-300 bg-cb-blue-100'
      }`}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
              item.severity === 'warning' ? 'text-cb-orange' : 'text-cb-blue-300'
            }`} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  Update
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.publishedAt}
                </span>
              </div>
              <h3 className="font-semibold text-cb-ink">{item.title}</h3>
              <p className="text-muted-foreground">{item.content}</p>
            </div>
          </div>
        </div>

        {/* Effective Dates */}
        {item.effectiveFrom && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              Effective: {item.effectiveFrom}
              {item.effectiveTo && item.effectiveTo !== item.effectiveFrom && ` - ${item.effectiveTo}`}
            </p>
          </div>
        )}

        {/* Canteen Tags */}
        <div className="flex flex-wrap gap-1">
          {item.canteens.map((canteen: string) => (
            <Badge key={canteen} variant="secondary" className="text-xs">
              {canteen}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-conqueror text-cb-ink">News & Updates</h1>
          <p className="text-muted-foreground">Stay informed about canteen news and operational updates</p>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="h-4 w-4 mr-2" />
              News
            </TabsTrigger>
            <TabsTrigger value="update">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Updates
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed Content */}
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <Card className="cb-card">
            <CardContent className="p-8 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-cb-ink mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground">
                No {activeTab === 'all' ? 'news or updates' : activeTab} available at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => 
            item.type === 'news' ? renderNewsItem(item) : renderUpdateItem(item)
          )
        )}
      </div>
    </div>
  );
}