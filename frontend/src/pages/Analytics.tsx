import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, Download, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyticsService } from '@/services/database';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  bgColor?: string;
}

function MetricCard({ title, value, icon, trend, trendUp = true, bgColor = 'bg-blue-50' }: MetricCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trendUp ? '+' : ''}{trend}
              </p>
            )}
          </div>
          <div className={`p-3 ${bgColor} rounded-full`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
  color?: string;
}

function SimpleBarChart({ data, title, color = '#3b82f6' }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-600">{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7d');

  // Fetch overview metrics
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: () => analyticsService.getOverview({ period: dateRange }),
  });

  // Fetch revenue by period
  const { data: revenueResponse, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery({
    queryKey: ['analytics-revenue', dateRange],
    queryFn: () => analyticsService.getRevenueByPeriod({ period: dateRange }),
  });

  // Fetch orders by period
  const { data: ordersResponse, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['analytics-orders', dateRange],
    queryFn: () => analyticsService.getOrdersByPeriod({ period: dateRange }),
  });

  // Fetch revenue by category
  const { data: categoryResponse, isLoading: categoryLoading, refetch: refetchCategory } = useQuery({
    queryKey: ['analytics-category', dateRange],
    queryFn: () => analyticsService.getRevenueByCategory({ period: dateRange }),
  });

  const metrics = overviewData?.data || {};
  const revenueData = revenueResponse?.data?.data || [];
  const ordersData = ordersResponse?.data?.data || [];
  const categoryData = categoryResponse?.data?.data || [];

  const loading = overviewLoading || revenueLoading || ordersLoading || categoryLoading;

  const handleRefresh = () => {
    refetchOverview();
    refetchRevenue();
    refetchOrders();
    refetchCategory();
  };

  const handleExport = () => {
    alert('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (overviewData?.success === false || revenueResponse?.success === false) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics. Please try again.</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your store performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                >
                  {range === '7d' && 'Last 7 Days'}
                  {range === '30d' && 'Last 30 Days'}
                  {range === '90d' && 'Last 90 Days'}
                  {range === '1y' && 'Last Year'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${(metrics.total_revenue || 0).toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          trend={`${metrics.revenue_growth || 0}%`}
          trendUp={metrics.revenue_growth > 0}
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Total Orders"
          value={(metrics.total_orders || 0).toLocaleString()}
          icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
          trend={`${metrics.orders_growth || 0}%`}
          trendUp={metrics.orders_growth > 0}
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Total Customers"
          value={(metrics.total_customers || 0).toLocaleString()}
          icon={<Users className="w-6 h-6 text-purple-500" />}
          trend={`${metrics.customers_growth || 0}%`}
          trendUp={metrics.customers_growth > 0}
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversion_rate || 0}%`}
          icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
          trend="+2.1%"
          trendUp={true}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Average Order Value"
          value={`$${(metrics.average_order_value || 0).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-teal-500" />}
          trend="+5.4%"
          trendUp={true}
          bgColor="bg-teal-50"
        />
        <MetricCard
          title="Revenue Growth"
          value={`${metrics.revenue_growth || 0}%`}
          icon={<BarChart3 className="w-6 h-6 text-indigo-500" />}
          trend="+3.2%"
          trendUp={true}
          bgColor="bg-indigo-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={revenueData}
          title="Revenue by Period"
          color="#3b82f6"
        />
        <SimpleBarChart
          data={ordersData}
          title="Orders by Period"
          color="#10b981"
        />
      </div>

      <SimpleBarChart
        data={categoryData}
        title="Revenue by Category"
        color="#8b5cf6"
      />

      {/* Insights */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-powered recommendations for your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.revenue_growth > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Revenue is trending up</p>
                  <p className="text-sm text-green-700">
                    Your revenue has increased by {metrics.revenue_growth}% compared to the previous period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Revenue is trending down</p>
                  <p className="text-sm text-red-700">
                    Your revenue has decreased by {Math.abs(metrics.revenue_growth)}% compared to the previous period.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Performance overview</p>
                <p className="text-sm text-blue-700">
                  You've processed {metrics.total_orders} orders with an average value of ${metrics.average_order_value?.toFixed(2)}.
                </p>
              </div>
            </div>
            {categoryData.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Top category</p>
                  <p className="text-sm text-purple-700">
                    {categoryData[0].label} is your top category. Consider expanding inventory in this area.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}