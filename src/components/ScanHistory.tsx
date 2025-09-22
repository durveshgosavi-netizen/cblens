import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Scan {
  id: string;
  scan_timestamp: string;
  confidence: 'high' | 'medium' | 'low';
  portion_preset: 'half' | 'normal' | 'large';
  estimated_grams: number;
  scaled_protein: number;
  scaled_carbs: number;
  scaled_fat: number;
  scaled_calories: number;
  canteen_location: string;
  notes?: string;
  manual_override: boolean;
  photo_url?: string;
  kanpla_items: {
    name: string;
    category: string;
    image_url?: string;
  };
  profiles: {
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
  }, []);

  const fetchScans = async () => {
    try {
      let query = supabase
        .from('scans')
        .select(`
          *,
          kanpla_items (name, category, image_url),
          profiles (full_name)
        `)
        .order('scan_timestamp', { ascending: false });

      // Apply filters
      if (confidenceFilter !== "all") {
        query = query.eq('confidence', confidenceFilter as 'high' | 'medium' | 'low');
      }

      if (dateFilter === "today") {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('scan_timestamp', today);
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('scan_timestamp', weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch scan history",
          variant: "destructive",
        });
        return;
      }

      setScans((data as unknown as Scan[]) || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvHeaders = [
      'Date',
      'Time',
      'Dish Name',
      'Category',
      'Confidence',
      'Portion',
      'Weight (g)',
      'Protein (g)',
      'Carbs (g)',
      'Fat (g)',
      'Calories',
      'Location',
      'Scanned By',
      'Notes'
    ];

    const csvData = scans.map(scan => [
      format(new Date(scan.scan_timestamp), 'yyyy-MM-dd'),
      format(new Date(scan.scan_timestamp), 'HH:mm:ss'),
      scan.kanpla_items.name,
      scan.kanpla_items.category,
      scan.confidence,
      scan.portion_preset,
      scan.estimated_grams,
      scan.scaled_protein,
      scan.scaled_carbs,
      scan.scaled_fat,
      scan.scaled_calories,
      scan.canteen_location,
      scan.profiles.full_name,
      scan.notes || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cb-lens-scans-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Scan history exported to CSV successfully",
    });
  };

  const filteredScans = scans.filter(scan =>
    scan.kanpla_items.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.kanpla_items.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.canteen_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  const getPortionLabel = (portion: string) => {
    switch (portion) {
      case 'half': return '½×';
      case 'normal': return '1×';
      case 'large': return '1½×';
      default: return portion;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes, categories, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-full sm:w-40">
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
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline" className="whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredScans.length} scan{filteredScans.length !== 1 ? 's' : ''} found
          </div>
        </CardContent>
      </Card>

      {/* Scan List */}
      <div className="space-y-4">
        {filteredScans.map((scan) => (
          <Card key={scan.id} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {scan.kanpla_items.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={scan.kanpla_items.image_url}
                      alt={scan.kanpla_items.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{scan.kanpla_items.name}</h3>
                      <p className="text-sm text-muted-foreground">{scan.kanpla_items.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getConfidenceBadgeVariant(scan.confidence)}>
                        {scan.confidence} confidence
                      </Badge>
                      {scan.manual_override && (
                        <Badge variant="outline">Manual Override</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Portion:</span>
                      <p className="font-medium">{getPortionLabel(scan.portion_preset)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <p className="font-medium">{scan.estimated_grams}g</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Calories:</span>
                      <p className="font-medium">{Math.round(scan.scaled_calories)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Protein:</span>
                      <p className="font-medium">{scan.scaled_protein}g</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(scan.scan_timestamp), 'MMM d, yyyy HH:mm')}
                    </div>
                    <div>
                      {scan.canteen_location}
                    </div>
                    <div>
                      by {scan.profiles.full_name || 'Unknown User'}
                    </div>
                  </div>

                  {scan.notes && (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <span className="text-muted-foreground">Note:</span> {scan.notes}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredScans.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No scans found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}