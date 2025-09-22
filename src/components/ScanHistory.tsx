import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search, Filter, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Scan {
  id: string;
  scan_timestamp: string;
  confidence: 'high' | 'medium' | 'low';
  portion_preset: 'half' | 'normal' | 'large';
  estimated_grams: number;
  scaled_calories: number;
  scaled_protein: number;
  scaled_carbs: number;
  scaled_fat: number;
  notes?: string;
  photo_url?: string;
  canteen_location: string;
  kanpla_item_id: string;
  kanpla_items?: {
    name: string;
    category: string;
    image_url?: string;
  };
  profiles?: {
    full_name: string | null;
  };
}

export default function ScanHistory() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchScans();
  }, [confidenceFilter, dateFilter]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('scans')
        .select('*')
        .order('scan_timestamp', { ascending: false });

      if (confidenceFilter !== "all") {
        query = query.eq('confidence', confidenceFilter as 'high' | 'medium' | 'low');
      }

      if (dateFilter !== "all") {
        const now = new Date();
        let dateFrom: Date;
        
        switch (dateFilter) {
          case "today":
            dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            dateFrom = new Date(0);
        }
        
        query = query.gte('scan_timestamp', dateFrom.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setScans((data as any) || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch scan history. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredScans.map(scan => ({
      Date: format(new Date(scan.scan_timestamp), 'yyyy-MM-dd HH:mm'),
      Dish: `Dish from Menu`,
      Category: 'Danish Cuisine',
      Confidence: scan.confidence,
      Portion: getPortionLabel(scan.portion_preset),
      'Weight (g)': scan.estimated_grams,
      'Calories': scan.scaled_calories,
      'Protein (g)': scan.scaled_protein,
      'Carbs (g)': scan.scaled_carbs,
      'Fat (g)': scan.scaled_fat,
      Location: scan.canteen_location,
      Notes: scan.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredScans = scans.filter(scan =>
    scan.canteen_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    searchTerm === ""
  );

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPortionLabel = (portion: string) => {
    switch (portion) {
      case 'half': return '½× Portion';
      case 'normal': return '1× Portion';
      case 'large': return '1½× Portion';
      default: return portion;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Scan History</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scan History</h2>
        <Button variant="outline" onClick={exportToCSV} disabled={filteredScans.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredScans.length} scan{filteredScans.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan List */}
      <div className="space-y-4">
        {filteredScans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                {scans.length === 0 ? "No scans found. Start scanning to see your history!" : "No scans match your current filters."}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredScans.map((scan) => (
            <Card key={scan.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Dish Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">🍽️</span>
                    </div>
                  </div>

                  {/* Scan Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">Danish Menu Item</h3>
                        <p className="text-sm text-muted-foreground">Danish Cuisine</p>
                      </div>
                      <Badge variant={getConfidenceBadgeVariant(scan.confidence) as any}>
                        {scan.confidence} confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Portion</div>
                        <div className="font-medium">{getPortionLabel(scan.portion_preset)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Weight</div>
                        <div className="font-medium">{scan.estimated_grams}g</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Calories</div>
                        <div className="font-medium">{scan.scaled_calories} kcal</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Macros</div>
                        <div className="font-medium">
                          P:{scan.scaled_protein}g C:{scan.scaled_carbs}g F:{scan.scaled_fat}g
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(scan.scan_timestamp), 'MMM d, yyyy HH:mm')} • {scan.canteen_location}
                      </div>
                      {scan.notes && (
                        <div className="text-xs italic text-muted-foreground max-w-48 truncate">
                          "{scan.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}