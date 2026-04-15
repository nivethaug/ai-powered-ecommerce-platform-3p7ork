// AI Insights Page - Displays AI-powered business insights and forecasts
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, RefreshCw, AlertTriangle, Info, Filter, X } from "lucide-react";
import { aiInsightsService } from "@/services/database";

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  trend: string;
  value?: number;
  change_percent: number;
  helpful_percentage: number;
  total_feedback: number;
}

interface InsightsResponse {
  insights: Insight[];
  total_count: number;
  generated_at: string;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterTrend, setFilterTrend] = useState<string>("all");

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiInsightsService.getAllInsights();

      if (response.success && response.data) {
        setInsights(response.data.insights || []);
      } else {
        setError(response.error || "Failed to load insights");
      }
    } catch (err) {
      setError("An error occurred while loading insights");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
  };

  const handleClearFilters = () => {
    setFilterType("all");
    setFilterSeverity("all");
    setFilterTrend("all");
  };

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      if (filterType !== "all" && insight.type !== filterType) return false;
      if (filterSeverity !== "all" && insight.severity !== filterSeverity) return false;
      if (filterTrend !== "all" && insight.trend !== filterTrend) return false;
      return true;
    });
  }, [insights, filterType, filterSeverity, filterTrend]);

  const hasActiveFilters = filterType !== "all" || filterSeverity !== "all" || filterTrend !== "all";

  const handleFeedback = async (insightId: string, isHelpful: boolean) => {
    try {
      await aiInsightsService.submitInsightFeedback(insightId, isHelpful);

      // Update the insight locally
      setInsights(prevInsights =>
        prevInsights.map(insight => {
          if (insight.id === insightId) {
            const newTotal = insight.total_feedback + 1;
            const newPositive = isHelpful
              ? Math.round((insight.helpful_percentage / 100) * insight.total_feedback) + 1
              : Math.round((insight.helpful_percentage / 100) * insight.total_feedback);

            return {
              ...insight,
              helpful_percentage: Math.round((newPositive / newTotal) * 100),
              total_feedback: newTotal
            };
          }
          return insight;
        })
      );
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "default";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "growing":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatValue = (value?: number) => {
    if (value === undefined) return null;
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            Sales forecasting and business intelligence
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filters</CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary">{filteredInsights.length} of {insights.length}</Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="ghost"
                size="sm"
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trend</label>
              <Select value={filterTrend} onValueChange={setFilterTrend}>
                <SelectTrigger>
                  <SelectValue placeholder="All trends" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trends</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="declining">Declining</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInsights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active recommendations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Helpful Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInsights.length > 0
                ? Math.round(
                    filteredInsights.reduce((sum, i) => sum + i.helpful_percentage, 0) / filteredInsights.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">User satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredInsights.filter(i => i.severity === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {hasActiveFilters ? `Filtered Insights (${filteredInsights.length})` : "Sales Forecasting & Insights"}
        </h2>

        {filteredInsights.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {hasActiveFilters ? (
                  <>
                    <p>No insights match your filters.</p>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p>No insights available yet.</p>
                    <p className="text-sm mt-2">Add some orders and products to generate insights.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getSeverityIcon(insight.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge variant={getSeverityColor(insight.severity) as any}>
                            {insight.severity}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insight.trend)}
                        <span className="text-sm font-medium capitalize">{insight.trend}</span>
                      </div>
                      {insight.value !== undefined && (
                        <div className="text-sm font-semibold">
                          {formatValue(insight.value)}
                        </div>
                      )}
                      {insight.change_percent !== 0 && (
                        <div className={`text-sm font-medium ${
                          insight.change_percent > 0 ? "text-green-600" :
                          insight.change_percent < 0 ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                          {insight.change_percent > 0 ? "+" : ""}{insight.change_percent}%
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{insight.helpful_percentage}% helpful</span>
                      </div>
                      <span>•</span>
                      <span>{insight.total_feedback} feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFeedback(insight.id, true)}
                        className="h-8"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeedback(insight.id, false)}
                        className="h-8"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
