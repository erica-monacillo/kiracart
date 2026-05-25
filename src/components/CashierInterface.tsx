import React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Product, Sale } from '../App';
import { SalesTransaction } from './SalesTransaction';
import { LogOut, ShoppingCart, Receipt, Clock, User as UserIcon, CreditCard, History } from 'lucide-react';
import logo from '../assets/new logo.png';

import type { Category } from '../api/categories';

interface CashierInterfaceProps {
  user: User;
  products: Product[];
  sales: Sale[];
  categories: Category[];
  onLogout: () => void;
  onAddSale: (sale: any) => Promise<Sale>;
}

export function CashierInterface({ user, products, sales, categories, onLogout, onAddSale }: CashierInterfaceProps) {
  const [activeTab, setActiveTab] = useState('pos');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailDialog(true);
  };

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
                <h1 className="text-[#2D5016]">Cashier POS</h1>
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
              value="pos" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <ShoppingCart className="size-4 mr-2" />
              POS
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <History className="size-4 mr-2" />
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos">
            <SalesTransaction
              user={user}
              products={products}
              categories={categories}
              onAddSale={onAddSale}
            />
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-2 border-[#D4E7C5] shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#E8F5D4] to-white border-b-2 border-[#D4E7C5]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <History className="size-5 text-[#4A7C3A]" />
                  </div>
                  <CardTitle className="text-[#2D5016]">Transaction History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#D4E7C5] bg-[#F5F9F2]">
                        <th className="text-left py-4 px-4 text-[#2D5016]">Receipt #</th>
                        <th className="text-left py-4 px-4 text-[#2D5016]">Date & Time</th>
                        <th className="text-left py-4 px-4 text-[#2D5016]">Cashier</th>
                        <th className="text-left py-4 px-4 text-[#2D5016]">Payment Method</th>
                        <th className="text-right py-4 px-4 text-[#2D5016]">Items</th>
                        <th className="text-right py-4 px-4 text-[#2D5016]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length > 0 ? (
                        sales.slice().reverse().map(sale => (
                          <tr 
                            key={sale.transaction_id} 
                            className="border-b border-[#D4E7C5] hover:bg-[#F5F9F2] cursor-pointer transition-all"
                            onClick={() => handleSaleClick(sale)}
                          >
                            <td className="py-4 px-4 text-[#2D5016]">{sale.receiptNumber}</td>
                            <td className="py-4 px-4 text-[#5B7A4A]">
                              {new Date(sale.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-4 px-4 text-[#5B7A4A]">{sale.cashierName}</td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8F5D4] text-[#4A7C3A] border border-[#C8E6A0]">
                                {sale.paymentMethod}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right text-[#2D5016]">{sale.items.length}</td>
                            <td className="py-4 px-4 text-right text-[#4A7C3A]">₹{Number(sale.total ?? 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#5B7A4A]">
                            <History className="size-12 mx-auto mb-2 text-[#C8E6A0]" />
                            No transactions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Detail Dialog */}
      {selectedSale && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-[#D4E7C5] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#2D5016] flex items-center gap-3">
                <div className="p-2 bg-[#E8F5D4] rounded-xl">
                  <Receipt className="size-5 text-[#4A7C3A]" />
                </div>
                Transaction Details
              </DialogTitle>
              <DialogDescription className="text-[#5B7A4A]">
                Complete transaction information for {selectedSale.receiptNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#F5F9F2] rounded-xl border border-[#D4E7C5]">
                    <Receipt className="size-5 text-[#4A7C3A] mt-0.5" />
                    <div>
                      <div className="text-[#5B7A4A]">Receipt Number</div>
                      <div className="text-[#2D5016]">{selectedSale.receiptNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#F5F9F2] rounded-xl border border-[#D4E7C5]">
                    <Clock className="size-5 text-[#4A7C3A] mt-0.5" />
                    <div>
                      <div className="text-[#5B7A4A]">Date & Time</div>
                      <div className="text-[#2D5016]">
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
                  <div className="flex items-start gap-3 p-3 bg-[#F5F9F2] rounded-xl border border-[#D4E7C5]">
                    <UserIcon className="size-5 text-[#4A7C3A] mt-0.5" />
                    <div>
                      <div className="text-[#5B7A4A]">Cashier</div>
                      <div className="text-[#2D5016]">{selectedSale.cashierName}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#F5F9F2] rounded-xl border border-[#D4E7C5]">
                    <CreditCard className="size-5 text-[#4A7C3A] mt-0.5" />
                    <div>
                      <div className="text-[#5B7A4A]">Payment Method</div>
                      <div className="text-[#2D5016]">{selectedSale.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-2 border-[#D4E7C5] rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#E8F5D4] to-white px-4 py-3 border-b-2 border-[#D4E7C5]">
                  <h3 className="text-[#2D5016]">Items Purchased</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#D4E7C5] bg-[#F5F9F2]">
                        <th className="text-left py-3 px-4 text-[#2D5016]">Product</th>
                        <th className="text-center py-3 px-4 text-[#2D5016]">Quantity</th>
                        <th className="text-right py-3 px-4 text-[#2D5016]">Price</th>
                        <th className="text-right py-3 px-4 text-[#2D5016]">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item, index) => (
                        <tr key={index} className="border-b border-[#D4E7C5]">
                          <td className="py-3 px-4 text-[#2D5016]">{item.product_name}</td>
                          <td className="py-3 px-4 text-center text-[#2D5016]">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-[#5B7A4A]">₹{item.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-[#4A7C3A]">₹{item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-br from-[#4A7C3A] to-[#5B8A47] rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Total Amount</span>
                  <span className="text-white">₹{selectedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/90">Total Items</span>
                  <span className="text-white">
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