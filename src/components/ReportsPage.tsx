import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Sale, Product } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingCart, Receipt, Clock, User, CreditCard } from 'lucide-react';

interface ReportsPageProps {
  sales: Sale[];
  products: Product[];
}

export function ReportsPage({ sales, products }: ReportsPageProps) {
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailDialog(true);
  };

  // Calculate statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Daily sales data
  const getDailySales = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
        return saleDate === date;
      });
      const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue,
        transactions: daySales.length
      };
    });
  };

  // Weekly sales data
  const getWeeklySales = () => {
    const weeks = new Map<string, { revenue: number; transactions: number }>();
  
    sales.forEach(sale => {
      const date = new Date(sale.timestamp);
  
      // Get ISO week
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(
        (((date.getTime() - firstDayOfYear.getTime()) / 86400000) +
          firstDayOfYear.getDay() + 1) / 7
      );
  
      const key = `Week ${weekNumber}`;
  
      if (!weeks.has(key)) {
        weeks.set(key, { revenue: 0, transactions: 0 });
      }
  
      const w = weeks.get(key)!;
      w.revenue += sale.total;
      w.transactions += 1;
    });
  
    return Array.from(weeks.entries()).map(([week, data]) => ({
      week,
      revenue: data.revenue,
      transactions: data.transactions,
    }));
  };

  // Monthly sales data
  const getMonthlySales = () => {
    const months = new Map<string, { revenue: number; transactions: number }>();
  
    sales.forEach(sale => {
      const date = new Date(sale.timestamp);
      const key = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });
  
      if (!months.has(key)) {
        months.set(key, { revenue: 0, transactions: 0 });
      }
  
      const m = months.get(key)!;
      m.revenue += sale.total;
      m.transactions += 1;
    });
  
    return Array.from(months.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      transactions: data.transactions,
    }));
  };
  
  // Product sales data
  const getProductSales = () => {
    const productSales = new Map<
      number,
      { name: string; quantity: number; revenue: number }
    >();
  
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSales.get(item.product_id);
  
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          productSales.set(item.product_id, {
            name: item.product_name,
            quantity: item.quantity,
            revenue: item.subtotal
          });
        }
      });
    });
  
    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };
  

  // Category distribution
  const getCategoryDistribution = () => {
    const categories = new Map<string, number>();

    products.forEach(product => {
      const value = product.price * product.stock;
      categories.set(product.category, (categories.get(product.category) || 0) + value);
    });

    return Array.from(categories.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  const dailySalesData = getDailySales();
  const weeklySalesData = getWeeklySales();
  const monthlySalesData = getMonthlySales();
  const topProducts = getProductSales();
  const categoryData = getCategoryDistribution();

  const COLORS = ['#D1EDC5', '#a8dfa0', '#7fcd77', '#5bb84f', '#3a9d2e'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-[#1a5a1a]">Reports & Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">Track your business performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#D1EDC5] shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl text-[#1a5a1a]">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#D1EDC5] to-[#a8dfa0] p-3 rounded-xl">
                <DollarSign className="size-6 text-[#1a5a1a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D1EDC5] shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-2xl text-[#1a5a1a]">{totalTransactions}</p>
              </div>
              <div className="bg-gradient-to-br from-[#D1EDC5] to-[#a8dfa0] p-3 rounded-xl">
                <ShoppingCart className="size-6 text-[#1a5a1a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D1EDC5] shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Transaction</p>
                <p className="text-2xl text-[#1a5a1a]">₹{averageTransaction.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#D1EDC5] to-[#a8dfa0] p-3 rounded-xl">
                <TrendingUp className="size-6 text-[#1a5a1a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D1EDC5] shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inventory Value</p>
                <p className="text-2xl text-[#1a5a1a]">₹{totalInventoryValue.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#D1EDC5] to-[#a8dfa0] p-3 rounded-xl">
                <Package className="size-6 text-[#1a5a1a]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={reportPeriod} onValueChange={(v: string) => setReportPeriod(v as any)}>
        <TabsList className="bg-white border border-[#D1EDC5]">
          <TabsTrigger value="daily" className="data-[state=active]:bg-[#D1EDC5] data-[state=active]:text-[#1a5a1a]">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-[#D1EDC5] data-[state=active]:text-[#1a5a1a]">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-[#D1EDC5] data-[state=active]:text-[#1a5a1a]">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
              <CardTitle className="text-[#1a5a1a]">Sales Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#D1EDC5" name="Revenue (₹)" />
                  <Bar dataKey="transactions" fill="#a8dfa0" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#D1EDC5" name="Revenue (₹)" />
                  <Bar dataKey="transactions" fill="#a8dfa0" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#D1EDC5" name="Revenue (₹)" />
                <Bar dataKey="transactions" fill="#a8dfa0" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-[#D1EDC5] shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
            <CardTitle className="text-[#1a5a1a]">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-[#D1EDC5] to-[#a8dfa0] text-[#1a5a1a] w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#1a5a1a]">₹{product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No sales data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-[#D1EDC5] shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
            <CardTitle className="text-[#1a5a1a]">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No inventory data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-[#D1EDC5] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
          <CardTitle className="text-[#1a5a1a]">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Receipt #</th>
                  <th className="text-left py-3 px-4 text-gray-600">Date & Time</th>
                  <th className="text-left py-3 px-4 text-gray-600">Cashier</th>
                  <th className="text-left py-3 px-4 text-gray-600">Payment Method</th>
                  <th className="text-right py-3 px-4 text-gray-600">Items</th>
                  <th className="text-right py-3 px-4 text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.slice().reverse().map(sale => (
                    <tr 
                      key={sale.transaction_id} 
                      className="border-b border-gray-100 hover:bg-[#f0f9ed] cursor-pointer transition-colors"
                      onClick={() => handleSaleClick(sale)}
                    >
                      <td className="py-3 px-4 text-gray-900">{sale.receiptNumber}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(sale.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{sale.cashierName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">{sale.items.length}</td>
                      <td className="py-3 px-4 text-right text-[#1a5a1a]">₹{Number(sale.total ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      <Card className="border-[#D1EDC5] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
          <CardTitle className="text-[#1a5a1a]">Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-gray-600">Category</th>
                  <th className="text-right py-3 px-4 text-gray-600">Stock</th>
                  <th className="text-right py-3 px-4 text-gray-600">Value</th>
                  <th className="text-right py-3 px-4 text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600">{product.category}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{product.stock}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                    ₹{(product.price * product.stock).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {product.stock <= product.minStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      {selectedSale && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1a5a1a]">Transaction Details</DialogTitle>
              <DialogDescription>
                Complete transaction information for {selectedSale.receiptNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Receipt className="size-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Receipt Number</div>
                      <div className="text-gray-900">{selectedSale.receiptNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Date & Time</div>
                      <div className="text-gray-900">
                        {new Date(selectedSale.timestamp).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Cashier</div>
                      <div className="text-gray-900">{selectedSale.cashierName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="size-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Payment Method</div>
                      <div className="text-gray-900">{selectedSale.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#D1EDC5] rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#f0f9ed] to-white px-4 py-3 border-b border-[#D1EDC5]">
                  <h3 className="text-[#1a5a1a]">Items Purchased</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-xs text-gray-600">Product</th>
                        <th className="text-center py-3 px-4 text-xs text-gray-600">Quantity</th>
                        <th className="text-right py-3 px-4 text-xs text-gray-600">Price</th>
                        <th className="text-right py-3 px-4 text-xs text-gray-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{item.product_name}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-sm text-[#1a5a1a]">₹{item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-r from-[#D1EDC5] to-[#a8dfa0] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#1a5a1a]">Total Amount</span>
                  <span className="text-2xl text-[#1a5a1a]">₹{selectedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-[#1a5a1a]">Total Items</span>
                  <span className="text-[#1a5a1a]">
                    {selectedSale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}