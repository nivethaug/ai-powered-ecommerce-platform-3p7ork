import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Clock, Search, Eye, Download } from 'lucide-react';
import { orderService } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: OrderStatus;
  item_count: number;
  created_at: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  bgColor?: string;
}

function StatCard({ title, value, icon, trend, bgColor = 'bg-blue-50' }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
          </div>
          <div className={`p-3 ${bgColor} rounded-full`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  // Fetch orders from backend API
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const result = await orderService.list();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch orders');
    },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600">Error loading orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
          trend="+8%"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          trend="+12%"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-6 h-6 text-yellow-500" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Processing"
          value={stats.processing}
          icon={<Package className="w-6 h-6 text-purple-500" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Filters */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders by customer, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{order.order_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.customer_email}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-600">{order.item_count}</td>
                    <td className="py-3 px-4 font-medium">${order.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase()}
                        </span>
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}