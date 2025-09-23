import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsData {
  totalScans: number;
  avgConfidence: number;
  topDishes: Array<{ name: string; count: number; category: string }>;
  scansPerDay: Array<{ date: string; count: number }>;
  confidenceDistribution: Array<{ confidence: string; count: number; percentage: number }>;
  avgPortionSize: number;
  locationBreakdown: Array<{ location: string; count: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      // Fetch scans data
      const { data: scans, error } = await supabase
        .from('scans')
        .select('*')
        .gte('scan_timestamp', startDate.toISOString())
        .lte('scan_timestamp', endDate.toISOString())
        .order('scan_timestamp', { ascending: false });

      if (error) {
        console.error('Analytics fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        });
        return;
      }

      if (!scans) {
        setData({
          totalScans: 0,
          avgConfidence: 0,
          topDishes: [],
          scansPerDay: [],
          confidenceDistribution: [],
          avgPortionSize: 0,
          locationBreakdown: [],
        });
        return;
      }

      // Calculate analytics
      const totalScans = scans.length;
      
      // Average confidence (high=3, medium=2, low=1)
      const confidenceScore = scans.reduce((sum, scan) => {
        const score = scan.confidence === 'high' ? 3 : scan.confidence === 'medium' ? 2 : 1;
        return sum + score;
      }, 0);
      const avgConfidence = totalScans > 0 ? (confidenceScore / totalScans) * 33.33 : 0; // Convert to percentage

      // Top dishes - get dish names from alternatives or try to fetch from kanpla_items
      const dishCounts: Record<string, { count: number; category: string }> = {};
      scans.forEach(scan => {
        let dishName = 'Unknown Dish';
        let category = 'Unknown Category';
        
        // Check if we have alternatives data
        if (scan.alternatives && Array.isArray(scan.alternatives) && scan.alternatives.length > 0) {
          const selectedDish = scan.alternatives.find((alt: any) => alt.id === scan.kanpla_item_id) || scan.alternatives[0];
          dishName = (selectedDish as any)?.name || 'Unknown Dish';
          category = (selectedDish as any)?.category || 'Unknown Category';
        } else if (typeof scan.kanpla_item_id === 'string' && scan.kanpla_item_id.startsWith('menu-')) {
          // Extract dish name from menu item ID
          dishName = scan.kanpla_item_id.replace(/^menu-\w+-\d{4}-\d{2}-\d{2}$/, 'Menu Item');
          category = 'Daily Menu';
        }
        
        if (!dishCounts[dishName]) {
          dishCounts[dishName] = { count: 0, category };
        }
        dishCounts[dishName].count++;
      });
      
      const topDishes = Object.entries(dishCounts)
        .map(([name, data]) => ({ name, count: data.count, category: data.category }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Scans per day
      const dailyCounts: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyCounts[date] = 0;
      }
      
      scans.forEach(scan => {
        const date = format(new Date(scan.scan_timestamp), 'yyyy-MM-dd');
        if (dailyCounts.hasOwnProperty(date)) {
          dailyCounts[date]++;
        }
      });

      const scansPerDay = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date: format(new Date(date), 'MMM d'), count }))
        .reverse();

      // Confidence distribution
      const confidenceMap: Record<string, number> = { high: 0, medium: 0, low: 0 };
      scans.forEach(scan => {
        confidenceMap[scan.confidence]++;
      });

      const confidenceDistribution = Object.entries(confidenceMap).map(([confidence, count]) => ({
        confidence: confidence.charAt(0).toUpperCase() + confidence.slice(1),
        count,
        percentage: totalScans > 0 ? Math.round((count / totalScans) * 100) : 0,
      }));

      // Average portion size (convert to grams)
      const totalGrams = scans.reduce((sum, scan) => sum + scan.estimated_grams, 0);
      const avgPortionSize = totalScans > 0 ? Math.round(totalGrams / totalScans) : 0;

      // Location breakdown
      const locationCounts: Record<string, number> = {};
      scans.forEach(scan => {
        locationCounts[scan.canteen_location] = (locationCounts[scan.canteen_location] || 0) + 1;
      });

      const locationBreakdown = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

      setData({
        totalScans,
        avgConfidence,
        topDishes,
        scansPerDay,
        confidenceDistribution,
        avgPortionSize,
        locationBreakdown,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!data) return;

    const report = {
      reportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      dateRange: `Last ${dateRange} days`,
      summary: {
        totalScans: data.totalScans,
        averageConfidence: `${data.avgConfidence.toFixed(1)}%`,
        averagePortionSize: `${data.avgPortionSize}g`,
      },
      topDishes: data.topDishes,
      confidenceDistribution: data.confidenceDistribution,
      locationBreakdown: data.locationBreakdown,
      dailyScans: data.scansPerDay,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cb-lens-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analytics report exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAnalytics} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-3xl font-bold">{data.totalScans}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-3xl font-bold">{data.avgConfidence.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Portion</p>
                <p className="text-3xl font-bold">{data.avgPortionSize}g</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Avg</p>
                <p className="text-3xl font-bold">
                  {Math.round(data.totalScans / parseInt(dateRange))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Scans */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Scan Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.scansPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.confidenceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ confidence, percentage }) => `${confidence} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.confidenceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Dishes */}
        <Card>
          <CardHeader>
            <CardTitle>Most Scanned Dishes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topDishes} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Location Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Scans by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.locationBreakdown.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.location}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(location.count / data.totalScans) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {location.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}