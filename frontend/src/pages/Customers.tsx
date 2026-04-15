import { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, Calendar, TrendingUp, DollarSign, Edit, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { customerService, type Customer as ApiCustomer } from '@/services/database';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'vip';
  lastOrder: string;
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

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'vip'>('all');

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const result = await customerService.list();

        if (result.success && result.data) {
          // Transform API data to match frontend interface
          const transformedCustomers: Customer[] = result.data.map((apiCustomer: ApiCustomer) => ({
            id: `CUST-${String(apiCustomer.id).padStart(3, '0')}`,
            name: apiCustomer.name,
            email: apiCustomer.email,
            phone: apiCustomer.phone || 'N/A',
            location: apiCustomer.location || 'N/A',
            avatar: apiCustomer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiCustomer.name}`,
            joinedDate: apiCustomer.joined_date ? new Date(apiCustomer.joined_date).toISOString().split('T')[0] : 'N/A',
            totalOrders: apiCustomer.total_orders,
            totalSpent: apiCustomer.total_spent,
            status: apiCustomer.status as 'active' | 'inactive' | 'vip',
            lastOrder: apiCustomer.last_order_date ? new Date(apiCustomer.last_order_date).toISOString().split('T')[0] : 'N/A',
          }));

          setCustomers(transformedCustomers);
        } else {
          console.error('Failed to load customers:', result.error);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    vip: customers.filter((c) => c.status === 'vip').length,
    inactive: customers.filter((c) => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer base and relationships</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.total}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          trend="+12%"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Active Customers"
          value={stats.active}
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          trend="+8%"
          bgColor="bg-green-50"
        />
        <StatCard
          title="VIP Customers"
          value={stats.vip}
          icon={<DollarSign className="w-6 h-6 text-purple-500" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          trend="+15%"
          bgColor="bg-green-50"
        />
      </div>

      {/* Filters */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'inactive', 'vip'] as const).map((status) => (
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={customer.avatar} alt={customer.name} />
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription className="text-xs">{customer.id}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(customer.status)}>
                  {customer.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{customer.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {customer.joinedDate}</span>
              </div>
              <div className="pt-3 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                  <Ban className="w-4 h-4 mr-1" />
                  Ban
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}