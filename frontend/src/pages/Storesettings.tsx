import { useState, useEffect } from 'react';
import { Settings, Save, Bell, Palette, Globe, Shield, CreditCard, Users, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StoreSettings {
  general: {
    name: string;
    description: string;
    email: string;
    phone: string;
    currency: string;
    timezone: string;
    language: string;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    logo: string;
    favicon: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    customerNotifications: boolean;
    inventoryAlerts: boolean;
    weeklyReports: boolean;
  };
  payment: {
    provider: string;
    stripePublicKey: string;
    paypalEmail: string;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingRate: number;
    processingTime: string;
  };
}

export default function Storesettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    general: {
      name: 'AI-Powered Ecommerce Store',
      description: 'Your one-stop shop for amazing products',
      email: 'store@example.com',
      phone: '+1 (555) 123-4567',
      currency: 'USD',
      timezone: 'America/New_York',
      language: 'en',
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3b82f6',
      logo: '',
      favicon: '',
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      customerNotifications: true,
      inventoryAlerts: true,
      weeklyReports: false,
    },
    payment: {
      provider: 'stripe',
      stripePublicKey: 'pk_test_...',
      paypalEmail: '',
    },
    shipping: {
      freeShippingThreshold: 50,
      defaultShippingRate: 5.99,
      processingTime: '1-2 business days',
    },
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleInputChange = (section: keyof StoreSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-1">Manage your store configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Smartphone className="w-4 h-4 mr-2" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  value={settings.general.name}
                  onChange={(e) => handleInputChange('general', 'name', e.target.value)}
                  placeholder="Your store name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Description</Label>
                <Textarea
                  id="store-description"
                  value={settings.general.description}
                  onChange={(e) => handleInputChange('general', 'description', e.target.value)}
                  placeholder="Brief description of your store"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    value={settings.general.email}
                    onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                    placeholder="store@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone</Label>
                  <Input
                    id="store-phone"
                    type="tel"
                    value={settings.general.phone}
                    onChange={(e) => handleInputChange('general', 'phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => handleInputChange('general', 'currency', value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleInputChange('general', 'timezone', value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => handleInputChange('general', 'language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleInputChange('appearance', 'theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={settings.appearance.logo}
                  onChange={(e) => handleInputChange('appearance', 'logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="order-notif">Order Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified for new orders</p>
                </div>
                <Switch
                  id="order-notif"
                  checked={settings.notifications.orderNotifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'orderNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="customer-notif">Customer Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified for new customer registrations</p>
                </div>
                <Switch
                  id="customer-notif"
                  checked={settings.notifications.customerNotifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'customerNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inventory-alerts">Inventory Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when stock is low</p>
                </div>
                <Switch
                  id="inventory-alerts"
                  checked={settings.notifications.inventoryAlerts}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'inventoryAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'weeklyReports', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>Configure payment methods for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-provider">Payment Provider</Label>
                <Select
                  value={settings.payment.provider}
                  onValueChange={(value) => handleInputChange('payment', 'provider', value)}
                >
                  <SelectTrigger id="payment-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Public Key</Label>
                <Input
                  id="stripe-key"
                  value={settings.payment.stripePublicKey}
                  onChange={(e) => handleInputChange('payment', 'stripePublicKey', e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  value={settings.payment.paypalEmail}
                  onChange={(e) => handleInputChange('payment', 'paypalEmail', e.target.value)}
                  placeholder="paypal@example.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Shipping Configuration</CardTitle>
              <CardDescription>Set up shipping options for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="free-shipping">Free Shipping Threshold ($)</Label>
                <Input
                  id="free-shipping"
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-shipping">Default Shipping Rate ($)</Label>
                <Input
                  id="default-shipping"
                  type="number"
                  value={settings.shipping.defaultShippingRate}
                  onChange={(e) => handleInputChange('shipping', 'defaultShippingRate', parseFloat(e.target.value))}
                  placeholder="5.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processing-time">Processing Time</Label>
                <Input
                  id="processing-time"
                  value={settings.shipping.processingTime}
                  onChange={(e) => handleInputChange('shipping', 'processingTime', e.target.value)}
                  placeholder="1-2 business days"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security preferences for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>SSL Enabled:</strong> Your store is secured with SSL encryption.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}