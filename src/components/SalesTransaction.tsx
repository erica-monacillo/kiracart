// SalesTransaction.tsx
import React, { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { User, Product, Sale, SaleItem } from "../App";
import { Plus, Minus, Trash2, Search, ShoppingCart } from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import { ReceiptModal } from "./ReceiptModal";
import { API_BASE } from "../api/base";


import { ImageWithFallback } from "./figma/ImageWithFallback";


// Optional Category type (minimal)
export interface Category {
  id: number | string;
  name: string;
  imagePath?: string | null; // backend-stored filename if uploaded
}

interface SalesTransactionProps {
  user: User;
  products: Product[];
  onAddSale: (sale: any) => Promise<Sale>;
  // optional categories passed from parent (backend-driven)
  categories?: Category[];
}

function normalizeCategoryName(name: string) {
  return name
    .replace(/\s*&\s*/g, " & ")       // normalize "&"
    .replace(/\s*\/\s*/g, "/")        // normalize "/"
    .replace(/\s+/g, " ")             // collapse spaces
    .replace(/\s+/g, "")              // remove all spaces
    .trim();
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  groceries: "from-blue-100 to-blue-200",
  beverages: "from-amber-100 to-amber-200",
  food: "from-orange-100 to-orange-200",
  snacks: "from-pink-100 to-pink-200",

  dairy: "from-green-100 to-green-200",
  frozen: "from-blue-100 to-blue-200",
  bakery: "from-yellow-100 to-yellow-200",

  // Must match normalizeCategoryName() EXACTLY
  "meat&seafood": "from-red-100 to-red-200",
  "fruits&vegetables": "from-green-100 to-green-200",

  personalcare: "from-purple-100 to-purple-200",
  household: "from-pink-100 to-pink-200",
  babyproducts: "from-orange-100 to-orange-200",
  "toiletries/hygiene": "from-indigo-100 to-indigo-200",

  // All Products FIX
  allproducts: "from-gray-100 to-gray-200",

  // fallback
  other: "from-gray-100 to-gray-200",
};


const DEFAULT_GRADIENT = "from-gray-100 to-gray-200";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='100%25' height='100%25' fill='%23eef2e7'/%3E%3Ctext x='50%25' y='50%25' fill='%2390a88a' font-family='Arial' font-size='20' text-anchor='middle' alignment-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export function SalesTransaction({
  user,
  products,
  onAddSale,
  categories: backendCategories,
}: SalesTransactionProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  // Use only backend categories
  const categories = useMemo(() => {
    return backendCategories || [];
  }, [backendCategories]);
  

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);

    if (!selectedCategory) return matchesSearch;

    // if selectedCategory is "All", allow everything
    if (selectedCategory === "All") return matchesSearch;

    return matchesSearch && product.category === selectedCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Product out of stock!");
      return;
    }

    const existingItem = cart.find((item) => item.product_id === Number(product.id));
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("Not enough stock available!");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === Number(product.id)
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: Number(product.id),
          product_name: product.name,
          quantity: 1,
          price: product.price,
          subtotal: product.price,
        },
      ]);
    }
  };

  const updateQuantity = (productId: number, change: number) => {
    const product = products.find((p) => Number(p.id) === productId);
    if (!product) return;

    setCart(
      cart.map((item) => {
        if (item.product_id === Number(product.id)) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return item;
          if (newQuantity > product.stock) {
            alert("Not enough stock available!");
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (sale: {
    paymentMethod: string;
    total: number;
    items: SaleItem[];
    cashReceived?: number;
    change?: number;
  }) => {
    if (!sale.items.length) return;

    try {
      // 1 Save sale to backend
      const savedSale = await onAddSale({
        paymentMethod: sale.paymentMethod,
        total: sale.total,
        items: sale.items,
        cashierName: user.name,
      });
  
      // 2 Store receipt data FIRST
      setLastSale({
        receiptNumber: `RCP-${savedSale.transaction_id}`,
        items: sale.items,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        cashierName: user.name,
        cashReceived:
          sale.paymentMethod === 'Cash' ? sale.cashReceived : undefined,
        change:
          sale.paymentMethod === 'Cash' ? sale.change : undefined,
      });
  
      // 3 Close payment modal
      setShowPaymentModal(false);
  
      // 4 Open receipt
      setShowReceipt(true);
  
      // 5 Clear cart LAST
      clearCart();
  
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };
   
  // Helper: get image URL to use for a category
  const getCategoryImageUrl = (cat: Category | { name: string; imagePath?: string | null }) => {
    return cat.imagePath || FALLBACK_IMAGE;
  };

  // derive counts
  const getCategoryCount = (categoryName: string) => {
    if (categoryName === "All") return products.length;
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-[#D1EDC5] shadow-md">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#D1EDC5] rounded-full"
                />
              </div>
            </div>

            <div className="bg-gray-100 rounded-3xl p-6 mb-4 min-h-[350px] max-h-[350px] overflow-y-auto">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        product.stock <= 0
                          ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-white border-[#D1EDC5] hover:border-[#a8dfa0] hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      <div className="text-sm text-gray-900 mb-1">{product.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{product.category}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#1a5a1a]">₹{product.price.toFixed(2)}</span>
                        <span
                          className={`text-xs ${
                            product.stock <= product.minStock ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          Stock: {product.stock}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {selectedCategory ? `No products in ${selectedCategory}` : "No products found"}
                </div>
              )}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {/* All Products card */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`relative overflow-hidden rounded-2xl p-4 transition-all 
                  bg-gradient-to-br ${CATEGORY_GRADIENTS["allproducts"]}
                  ${selectedCategory === null ? 'ring-4 ring-[#4a9d5f]' : ''}
                `}
              >

                <div className="relative w-full h-20 mb-2 overflow-hidden rounded-lg flex items-center justify-center border border-gray-200">
                    <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS["all"]} opacity-70`}></div>
                    <img
                      src="https://media.istockphoto.com/photos/shopping-basket-full-of-variety-of-grocery-products-food-and-drink-on-picture-id1319625327?b=1&k=20&m=1319625327&s=170667a&w=0&h=FRRQT4yPOTumTJkCOmthHBcRvzoGvqw7drlSlYZhUNo="
                      alt="All Products"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="relative text-sm text-gray-700"> </div>
                </div>

                <span className="text-xs text-gray-800 text-center">All</span>
              </button>

              {categories
              .filter((c): c is Category => typeof c?.name === "string")
              .map(category => {

                const safeName = category.name ?? "Other";
                const key = normalizeCategoryName(safeName).toLowerCase();
                const gradient =
                  CATEGORY_GRADIENTS[key] || CATEGORY_GRADIENTS["other"];
                const imageToUse = getCategoryImageUrl(category);

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(safeName)}
                    className={`relative rounded-2xl p-4 transition-all hover:scale-105 ${
                      selectedCategory === safeName ? "ring-4 ring-[#4a9d5f]" : ""
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl`} />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-full h-20 mb-2 overflow-hidden rounded-lg">
                        <ImageWithFallback
                          src={imageToUse}
                          alt={safeName}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>

                      <span className="text-xs text-gray-800 text-center">
                        {safeName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="space-y-4">
        <Card className="border-[#D1EDC5] shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#D1EDC5] to-[#a8dfa0]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-[#1a5a1a]">
                <ShoppingCart className="size-5 mr-2" />
                Cart
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-[#1a5a1a] hover:bg-white/50">
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Cart is empty</div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[400px] overflow-y-auto space-y-3">
                  {cart.map((item) => (
                    <div key={item.product_id} className="bg-[#f0f9ed] p-3 rounded-xl border border-[#D1EDC5]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{item.product_name}</div>
                          <div className="text-xs text-gray-500">₹{item.price.toFixed(2)} each</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, -1)}
                            disabled={item.quantity <= 1}
                            className="border-[#D1EDC5] hover:bg-white"
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="text-sm text-gray-900 w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="border-[#D1EDC5] hover:bg-white"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-[#1a5a1a]">₹{item.subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#D1EDC5] pt-3 mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-2xl text-[#1a5a1a]">₹{calculateTotal().toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-[#D1EDC5] to-[#a8dfa0] hover:from-[#a8dfa0] hover:to-[#7fcd77] text-[#1a5a1a]"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showPaymentModal && (
        <PaymentModal
          total={calculateTotal()}
          cart={cart}
          cashierName={user.name}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      {showReceipt && lastSale && (
        <ReceiptModal
          receiptNumber={lastSale.receiptNumber}
          items={lastSale.items}
          total={lastSale.total}
          paymentMethod={lastSale.paymentMethod}
          cashierName={lastSale.cashierName}
          cashReceived={lastSale.cashReceived}
          change={lastSale.change}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
