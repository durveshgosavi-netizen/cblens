import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Filter, 
  Search, 
  Camera, 
  UtensilsCrossed,
  Edit,
  Trash2,
  Clock,
  MapPin
} from "lucide-react";

// Mock history data
const mockHistoryItems = [
  {
    id: "1",
    timestamp: "2024-01-18T13:30:00Z",
    dishName: "Mediterranean Quinoa Bowl",
    portion: 1.2,
    nutrition: { calories: 504, protein: 22, carbs: 54, fat: 14 },
    source: "scan",
    canteen: "Main Campus",
    photoUrl: "/api/placeholder/80/80",
    confidence: 92,
    notes: "Perfect lunch choice!"
  },
  {
    id: "2",
    timestamp: "2024-01-18T09:15:00Z",
    dishName: "Greek Yogurt with Berries",
    portion: 1,
    nutrition: { calories: 180, protein: 15, carbs: 20, fat: 5 },
    source: "menu",
    canteen: "Main Campus",
    photoUrl: null,
    confidence: null,
    notes: ""
  },
  {
    id: "3",
    timestamp: "2024-01-17T19:45:00Z",
    dishName: "Grilled Salmon Fillet",
    portion: 1,
    nutrition: { calories: 380, protein: 32, carbs: 8, fat: 24 },
    source: "scan",
    canteen: "Harbour Office",
    photoUrl: "/api/placeholder/80/80",
    confidence: 88,
    notes: "Perfectly cooked!"
  },
  {
    id: "4",
    timestamp: "2024-01-17T12:20:00Z",
    dishName: "Caesar Salad",
    portion: 0.8,
    nutrition: { calories: 256, protein: 10, carbs: 12, fat: 19 },
    source: "manual",
    canteen: "Main Campus",
    photoUrl: null,
    confidence: null,
    notes: "Added extra chicken"
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCanteen, setSelectedCanteen] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'scan':
        return <Camera className="h-4 w-4" />;
      case 'menu':
        return <UtensilsCrossed className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'scan':
        return 'bg-cb-green-500';
      case 'menu':
        return 'bg-cb-blue-300';
      default:
        return 'bg-muted-foreground';
    }
  };

  const filteredItems = mockHistoryItems.filter((item) => {
    const matchesSearch = item.dishName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCanteen = selectedCanteen === "all" || item.canteen === selectedCanteen;
    const matchesSource = selectedSource === "all" || item.source === selectedSource;
    
    // Date filtering would go here
    return matchesSearch && matchesCanteen && matchesSource;
  });

  // Group items by date
  const groupedItems = filteredItems.reduce((groups, item) => {
    const date = new Date(item.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, typeof mockHistoryItems>);

  const totalCalories = filteredItems.reduce((sum, item) => sum + item.nutrition.calories, 0);
  const totalMeals = filteredItems.length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-conqueror text-cb-ink">Meal History</h1>
          <p className="text-muted-foreground">Track and review your nutrition journey</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cb-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cb-ink">{totalMeals}</p>
              <p className="text-sm text-muted-foreground">Total Meals</p>
            </CardContent>
          </Card>
          <Card className="cb-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cb-ink">{totalCalories}</p>
              <p className="text-sm text-muted-foreground">Total Calories</p>
            </CardContent>
          </Card>
          <Card className="cb-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cb-ink">
                {Math.round(totalCalories / (totalMeals || 1))}
              </p>
              <p className="text-sm text-muted-foreground">Avg per Meal</p>
            </CardContent>
          </Card>
          <Card className="cb-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cb-ink">
                {filteredItems.filter(item => item.source === 'scan').length}
              </p>
              <p className="text-sm text-muted-foreground">Scanned Meals</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="cb-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Canteen Filter */}
            <select
              value={selectedCanteen}
              onChange={(e) => setSelectedCanteen(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="all">All Canteens</option>
              <option value="Main Campus">Main Campus</option>
              <option value="Harbour Office">Harbour Office</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="all">All Sources</option>
              <option value="scan">Scanned</option>
              <option value="menu">From Menu</option>
              <option value="manual">Manual Entry</option>
            </select>

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg text-sm flex-1"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg text-sm flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Items */}
      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <Card className="cb-card">
            <CardContent className="p-8 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-cb-ink mb-2">No meals found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or start logging some meals!
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedItems).map(([date, items]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-cb-ink">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <div className="flex-1 h-px bg-border"></div>
                <Badge variant="secondary" className="text-xs">
                  {items.length} meal{items.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Meals for this date */}
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="cb-card hover:shadow-soft transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Photo or Icon */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-cb-green-100 flex items-center justify-center flex-shrink-0">
                          {item.photoUrl ? (
                            <div className="w-full h-full bg-cb-green-200 flex items-center justify-center text-xs text-cb-green-600">
                              Photo
                            </div>
                          ) : (
                            <UtensilsCrossed className="h-6 w-6 text-cb-green-500" />
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-cb-ink">{item.dishName}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(item.timestamp)}</span>
                                <MapPin className="h-3 w-3 ml-2" />
                                <span>{item.canteen}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSourceColor(item.source)} text-white border-0`}
                              >
                                {getSourceIcon(item.source)}
                                <span className="ml-1 capitalize">{item.source}</span>
                              </Badge>
                              {item.confidence && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.confidence}%
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Nutrition */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Calories</p>
                              <p className="font-semibold text-cb-ink">{item.nutrition.calories}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Protein</p>
                              <p className="font-semibold text-cb-ink">{item.nutrition.protein}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Carbs</p>
                              <p className="font-semibold text-cb-ink">{item.nutrition.carbs}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Fat</p>
                              <p className="font-semibold text-cb-ink">{item.nutrition.fat}g</p>
                            </div>
                          </div>

                          {/* Portion & Notes */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">
                                Portion: {item.portion}x
                              </span>
                              {item.notes && (
                                <span className="text-sm text-cb-green-600 italic">
                                  "{item.notes}"
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}