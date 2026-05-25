import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { AdminDashboard } from './components/AdminDashboard';
import { CashierInterface } from './components/CashierInterface';
import { authAPI, salesAPI, healthCheck } from './utils/api';
import { fetchProducts, createProduct, updateProduct } from './api/products';
import { fetchCategories, type Category } from './api/categories';

// ========= Types =========

export interface User {
  id: string; // UUID from Supabase
  username: string;
  role: 'admin' | 'cashier';
  name: string;
}

export type Product = {
  id: string;
  name: string;
  category: string;
  categoryId?: number | null;
  price: number;
  stock: number;
  barcode: string;
  minStock: number;
};

export interface SaleItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  transaction_id: number;
  receiptNumber: string;
  total: number;
  timestamp: string;
  cashierName: string;
  paymentMethod: string;
  items: SaleItem[];
}

// ========= App Component =========

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check backend health
        const health = await healthCheck();
        console.log('Backend health:', health);

        // Verify Supabase session
        const { success, user } = await authAPI.verify();
        if (success && user) {
          console.log("RESTORED USER:", user);
          setCurrentUser(user);
          await loadData();
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    initializeApp();
  }, []);

  // Load products and sales
  const loadData = async () => {
    try {
      const [productsData, salesData, categoriesData] = await Promise.all([
        fetchProducts(),
        salesAPI.getAll(),
        fetchCategories()
      ]);

      setProducts(productsData);
      setSales(salesData);
      setCategories(categoriesData);
      
      if (productsData.length === 0) {
        alert("Warning: 0 products loaded from the database!");
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      alert(`Failed to load data from backend: ${error.message || 'Unknown error'}`);
    }
  };

  const reloadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to reload categories:', error);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await authAPI.login(username, password);
      
      if (!res.user?.id) {
        throw new Error("Login response missing user.id");
      }
      
      const loggedInUser: User = {
        id: res.user.id,
        username: res.user.username,
        role: res.user.role as 'admin' | 'cashier',
        name: res.user.name ?? res.user.username,
      };
      
      console.log("LOGIN USER:", loggedInUser);
      setCurrentUser(loggedInUser);
      setShowSignUp(false);
      await loadData();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setCurrentUser(null);
    setProducts([]);
    setSales([]);
  };  

  const handleSignUp = async (
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'cashier',
    name: string
  ): Promise<void> => {
    try {
      await authAPI.signup(username, email, password, role, name);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };  

  const handleGoToSignUp = () => {
    setShowSignUp(true);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
  };

  const handleUpdateProducts = async (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await createProduct(product, currentUser?.username || "Unknown");
      const productsData = await fetchProducts();
      setProducts(productsData);
      return { ...product, id: 'temp' };
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProduct(id, updates);
      const productsData = await fetchProducts();
      setProducts(productsData);

      const existing = productsData.find(p => p.id === id);
      return existing ?? ({ ...updates, id } as Product);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const handleAddSale = async (
    saleData: {
      paymentMethod: string;
      total: number;
      items: SaleItem[];
      cashierName: string;
    }
  ) => {
    if (!currentUser) {
      throw new Error('User not logged in');
    }
  
    try {
      const payload = {
        user_id: currentUser.id,
        payment_method: saleData.paymentMethod,
        total_amount: saleData.total,
        cashier: currentUser.username,
        items: saleData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      };
  
      const newSale = await salesAPI.create(payload);
  
      // Deduct stock for each item sold
      for (const item of saleData.items) {
        const product = products.find(p => p.id === String(item.product_id));
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await updateProduct(product.id, { stock: newStock });
        }
      }

      await loadData();
  
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
  
      return newSale;
    } catch (error) {
      console.error('Failed to add sale:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f0f9ed 0%, #ffffff 100%)' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a5a1a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (showSignUp) {
      return (
        <SignUpPage
          onSignUp={handleSignUp}
          onBackToLogin={handleBackToLogin}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToSignUp={handleGoToSignUp}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #f0f9ed 0%, #ffffff 100%)' }}
    >
      {currentUser.role === 'admin' ? (
        <AdminDashboard
          user={currentUser}
          products={products}
          sales={sales}
          categories={categories}
          onLogout={handleLogout}
          onUpdateProducts={handleUpdateProducts}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onAddSale={handleAddSale}
          reloadCategories={reloadCategories}
        />
      ) : (
        <CashierInterface
          user={currentUser}
          products={products}
          sales={sales}
          categories={categories}
          onLogout={handleLogout}
          onAddSale={handleAddSale}
        />
      )}
    </div>
  );
}

export default App;