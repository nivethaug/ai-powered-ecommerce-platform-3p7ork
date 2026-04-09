import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, Download, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalRevenue: 45678.90,
    totalOrders: 1289,
    totalCustomers: 342,
    conversionRate: 3.24,
    averageOrderValue: 35.42,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
  });

  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [ordersData, setOrdersData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setRevenueData([
        { label: 'Mon', value: 4230 },
        { label: 'Tue', value: 5120 },
        { label: 'Wed', value: 4890 },
        { label: 'Thu', value: 6120 },
        { label: 'Fri', value: 7340 },
        { label: 'Sat', value: 8920 },
        { label: 'Sun', value: 9058 },
      ]);

      setOrdersData([
        { label: 'Mon', value: 120 },
        { label: 'Tue', value: 145 },
        { label: 'Wed', value: 138 },
        { label: 'Thu', value: 172 },
        { label: 'Fri', value: 198 },
        { label: 'Sat', value: 245 },
        { label: 'Sun', value: 271 },
      ]);

      setCategoryData([
        { label: 'Electronics', value: 18920 },
        { label: 'Clothing', value: 12450 },
        { label: 'Home & Garden', value: 7890 },
        { label: 'Sports', value: 6418 },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your store performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          trend={`${metrics.revenueGrowth}%`}
          trendUp={metrics.revenueGrowth > 0}
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
          trend={`${metrics.ordersGrowth}%`}
          trendUp={metrics.ordersGrowth > 0}
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          icon={<Users className="w-6 h-6 text-purple-500" />}
          trend={`${metrics.customersGrowth}%`}
          trendUp={metrics.customersGrowth > 0}
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
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
          value={`$${metrics.averageOrderValue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-teal-500" />}
          trend="+5.4%"
          trendUp={true}
          bgColor="bg-teal-50"
        />
        <MetricCard
          title="Revenue Growth"
          value={`${metrics.revenueGrowth}%`}
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
          title="Revenue by Day"
          color="#3b82f6"
        />
        <SimpleBarChart
          data={ordersData}
          title="Orders by Day"
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
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Revenue is trending up</p>
                <p className="text-sm text-green-700">
                  Your revenue has increased by {metrics.revenueGrowth}% compared to the previous period.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Weekend performance strong</p>
                <p className="text-sm text-blue-700">
                  Consider running promotions on weekdays to balance order distribution.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">Electronics leading category</p>
                <p className="text-sm text-purple-700">
                  Electronics category generates 41% of total revenue. Consider expanding this category.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}