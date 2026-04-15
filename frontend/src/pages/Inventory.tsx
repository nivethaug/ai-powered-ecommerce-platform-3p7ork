import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Plus, Search, AlertTriangle, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { productService, Product } from '@/services/database';

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: string;
  currentStock: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  unitPrice: number;
  supplier?: string;
  lastRestocked?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  trend: 'up' | 'down' | 'stable';
}

// Helper function to calculate status from stock quantity
function calculateStatus(stockQuantity: number): InventoryItem['status'] {
  if (stockQuantity === 0) return 'out-of-stock';
  if (stockQuantity < 20) return 'low-stock';
  if (stockQuantity > 100) return 'overstocked';
  return 'in-stock';
}

// Helper function to map Product to InventoryItem
function mapProductToInventoryItem(product: Product): InventoryItem {
  const status = calculateStatus(product.stock_quantity);
  const maxStock = product.stock_quantity > 100 ? 150 : 100;

  return {
    id: product.id.toString(),
    name: product.name,
    sku: `SKU-${product.id.toString().padStart(4, '0')}`,
    category: product.category || 'Uncategorized',
    currentStock: product.stock_quantity,
    minStock: 10,
    maxStock: maxStock,
    reorderPoint: 15,
    unitPrice: product.price,
    supplier: 'Default Supplier',
    lastRestocked: product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : undefined,
    status: status,
    trend: 'stable' as const,
  };
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

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch products from database
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const result = await productService.list();
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    },
  });

  // Map products to inventory items
  const inventory: InventoryItem[] = products.map(mapProductToInventoryItem);

  // Extract unique categories from products
  const categorySet = new Set(products.map(p => p.category || 'Uncategorized'));
  const categories = ['all', ...Array.from(categorySet).sort()];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min((item.currentStock / item.maxStock) * 100, 100);
  };

  const getStockColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter((i) => i.status === 'in-stock').length,
    lowStock: inventory.filter((i) => i.status === 'low-stock').length,
    outOfStock: inventory.filter((i) => i.status === 'out-of-stock').length,
    totalValue: inventory.reduce((sum, item) => sum + item.currentStock * item.unitPrice, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load inventory. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Track stock levels and manage inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={<Box className="w-6 h-6 text-blue-500" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="In Stock"
          value={stats.inStock}
          icon={<Package className="w-6 h-6 text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Inventory Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Alerts */}
      {stats.lowStock > 0 || stats.outOfStock > 0 ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">
                  Attention Required: {stats.lowStock} items low stock, {stats.outOfStock} out of stock
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Items
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inventory by name, SKU, or supplier..."
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

      {/* Inventory Table */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Showing {filteredInventory.length} of {inventory.length} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Stock Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Unit Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const stockPercentage = getStockPercentage(item);
                  const stockColor = getStockColor(stockPercentage);

                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.id}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.sku || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{item.category}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.currentStock}</span>
                            <span className="text-gray-500 text-sm">/ {item.maxStock}</span>
                          </div>
                          <Progress value={stockPercentage} className="h-2" />
                          {item.minStock && item.reorderPoint && (
                            <p className="text-xs text-gray-500">
                              Min: {item.minStock} | Reorder at: {item.reorderPoint}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-600">{item.supplier || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        {item.trend === 'stable' && <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}