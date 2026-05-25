import React, { useState, useEffect } from 'react';
import type { Category } from '../api/categories';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Product, Sale } from '../App';
import { ProductsManagement } from './ProductsManagement';
import { InventoryTracking } from './InventoryTracking';
import { ReportsPage } from './ReportsPage';
import { SalesTransaction } from './SalesTransaction';
import { LogOut, LayoutDashboard, Package, FileText, ShoppingCart, TrendingUp, AlertTriangle, Boxes } from 'lucide-react';
import logo from '../assets/new logo.png';
import { API_BASE } from '../api/base';


interface AdminDashboardProps {
  user: User;
  products: Product[];
  sales: Sale[];
  onLogout: () => void;
  onUpdateProducts: (products: Product[]) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  onAddSale: (sale: any) => Promise<Sale>;
  categories: Category[];
  reloadCategories: () => Promise<void>;
}

export function AdminDashboard({ 
  user, 
  products, 
  sales, 
  onLogout, 
  onUpdateProducts,
  onAddProduct,
  onUpdateProduct,
  onAddSale,
  categories,
  reloadCategories
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.timestamp);
    return saleDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFBF8] to-[#F5F9F2]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#D4E7C5] sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logo} 
                alt="POS Logo" 
                className="w-16 h-16 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <div className="border-l-2 border-[#D4E7C5] pl-4">
                <h1 className="text-[#2D5016]">Admin Dashboard</h1>
                <p className="text-[#5B7A4A]">Welcome, {user.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout} 
              className="border-2 border-[#D4E7C5] text-[#2D5016] hover:bg-[#E8F5D4] hover:border-[#4A7C3A] transition-all"
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border-2 border-[#D4E7C5] p-1 rounded-xl shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <LayoutDashboard className="size-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="pos" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <ShoppingCart className="size-4 mr-2" />
              POS
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Boxes className="size-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Package className="size-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <FileText className="size-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border-2 border-[#D4E7C5] shadow-sm hover:shadow-lg hover:border-[#C8E6A0] transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#5B7A4A]">Total Products</div>
                  <Package className="size-5 text-[#7BA568] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-[#2D5016]">{products.length}</div>
                <div className="w-full h-1 bg-[#E8F5D4] rounded-full mt-3">
                  <div className="h-1 bg-gradient-to-r from-[#4A7C3A] to-[#7BA568] rounded-full w-3/4"></div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-sm hover:shadow-lg hover:border-red-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#5B7A4A]">Low Stock Items</div>
                  <AlertTriangle className="size-5 text-red-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-red-600">{lowStockProducts.length}</div>
                <div className="w-full h-1 bg-red-100 rounded-full mt-3">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{width: `${Math.min((lowStockProducts.length / products.length) * 100, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border-2 border-[#D4E7C5] shadow-sm hover:shadow-lg hover:border-[#C8E6A0] transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#5B7A4A]">Today's Sales</div>
                  <ShoppingCart className="size-5 text-[#7BA568] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-[#2D5016]">{todaySales.length}</div>
                <div className="w-full h-1 bg-[#E8F5D4] rounded-full mt-3">
                  <div className="h-1 bg-gradient-to-r from-[#4A7C3A] to-[#7BA568] rounded-full w-2/3"></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#4A7C3A] to-[#5B8A47] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white/90">Today's Revenue</div>
                  <TrendingUp className="size-5 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-white">₹{(todayRevenue ?? 0).toFixed(2)}
                </div>
                <div className="w-full h-1 bg-white/30 rounded-full mt-3">
                  <div className="h-1 bg-white rounded-full w-4/5"></div>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="size-5 text-red-600" />
                  </div>
                  <h3 className="text-red-900">Low Stock Alert</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-100">
                      <span className="text-[#2D5016]">{product.name}</span>
                      <span className="text-red-600">
                        {product.stock} / {product.minStock} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sales */}
            <div className="bg-white rounded-2xl border-2 border-[#D4E7C5] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#E8F5D4] rounded-xl">
                  <ShoppingCart className="size-5 text-[#4A7C3A]" />
                </div>
                <h3 className="text-[#2D5016]">Recent Sales</h3>
              </div>
              <div className="space-y-3">
                {sales.slice(0, 5).map(sale => (
                  <div key={sale.transaction_id} className="flex justify-between items-center p-3 rounded-xl hover:bg-[#F5F9F2] transition-colors border border-transparent hover:border-[#D4E7C5]">
                    <div>
                      <div className="text-[#2D5016]">{sale.receiptNumber}</div>
                      <div className="text-[#5B7A4A]">
                        {new Date(sale.timestamp).toLocaleString()} • {sale.cashierName}
                      </div>
                    </div>
                    <div className="text-[#4A7C3A] px-3 py-1 bg-[#E8F5D4] rounded-lg">
                    ₹{Number(sale.total ?? 0).toFixed(2)}
                    </div>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-[#5B7A4A] text-center py-8">No sales yet</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pos">
          <SalesTransaction
            user={user}
            products={products}
            onAddSale={onAddSale}
            categories={categories}
          />

          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement
              products={products}
              onUpdateProducts={onUpdateProducts}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onCategoriesUpdated={reloadCategories}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTracking
              products={products}
              onUpdateProducts={onUpdateProducts}
              currentUserName={user.name}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsPage sales={sales} products={products} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}