import { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, DollarSign, TrendingUp, Edit, Trash2 } from 'lucide-react';
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

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  sales: number;
  trend: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Electronics', 'Clothing', 'Home & Garden', 'Sports'];

  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Wireless Bluetooth Headphones',
          price: 79.99,
          category: 'Electronics',
          stock: 45,
          status: 'in-stock',
          sales: 234,
          trend: 12.5,
        },
        {
          id: '2',
          name: 'Premium Cotton T-Shirt',
          price: 24.99,
          category: 'Clothing',
          stock: 8,
          status: 'low-stock',
          sales: 189,
          trend: -3.2,
        },
        {
          id: '3',
          name: 'Smart Home Speaker',
          price: 129.99,
          category: 'Electronics',
          stock: 0,
          status: 'out-of-stock',
          sales: 456,
          trend: 8.7,
        },
        {
          id: '4',
          name: 'Garden Tool Set',
          price: 49.99,
          category: 'Home & Garden',
          stock: 23,
          status: 'in-stock',
          sales: 98,
          trend: 15.3,
        },
        {
          id: '5',
          name: 'Yoga Mat Premium',
          price: 34.99,
          category: 'Sports',
          stock: 67,
          status: 'in-stock',
          sales: 312,
          trend: 22.1,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<Package className="w-6 h-6 text-blue-500" />}
          trend="+12%"
        />
        <StatCard
          title="Total Revenue"
          value="$45,678"
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          trend="+8%"
        />
        <StatCard
          title="Total Sales"
          value="1,289"
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
          trend="+15%"
        />
        <StatCard
          title="Low Stock Items"
          value="3"
          icon={<Package className="w-6 h-6 text-orange-500" />}
          trend="-2"
        />
      </div>

      {/* Filters */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Showing {filteredProducts.length} of {products.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Sales</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.category}</td>
                    <td className="py-3 px-4 font-medium">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600">{product.stock}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.sales}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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