import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Product } from '../App';
import {
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  History,
  Plus,
  Filter,
} from 'lucide-react';

import {
  getInventoryLogs,
  addInventoryLog,
  InventoryLog,
  MovementType as BackendMovementType,
} from '../api/inventory';
import { fetchProducts } from '../api/products';

interface InventoryTrackingProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  currentUserName: string;
}

// Frontend shape used by this component
interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: MovementTypeFilter; // keep using lowercase types for filters
  quantity: number;
  quantityBefore?: number;
  quantityAfter?: number;
  userId?: string;
  userName?: string;
  reason?: string;
  notes?: string;
  referenceType?: string;
  referenceId?: string;
  timestamp: Date;
  current_stock?: number | null;
}

type StockFilter = 'all' | 'low' | 'normal' | 'high';
type MovementTypeFilter =
  | 'all'
  | 'initial'
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'return'
  | 'damage';
type MovementType = 'adjustment' | 'purchase' | 'return' | 'damage';

  function mapLogToMovement(log: InventoryLog): InventoryMovement {
    // 1) Determine movement type based on change_type text
    let movementType: MovementTypeFilter = 'adjustment';
    const t = log.change_type.toLowerCase();

    if (t.includes('sale')) movementType = 'sale';
    else if (t.includes('purchase')) movementType = 'purchase';
    else if (t.includes('return')) movementType = 'return';
    else if (t.includes('damage')) movementType = 'damage';
    else if (t.includes('initial')) movementType = 'initial';
    else if (t.includes('adjust')) movementType = 'adjustment';

    // 2) Parse remarks into reason / notes / userName
    let rawRemarks = log.remarks || '';
    let reason: string | undefined;
    let notes: string | undefined;
    let userName: string | undefined;

    if (rawRemarks) {
      const parts = rawRemarks.split('|').map((s) => s.trim());

      for (const part of parts) {
        const lower = part.toLowerCase();

        if (lower.startsWith('reason:')) {
          reason = part.slice('reason:'.length).trim();
        } else if (lower.startsWith('notes:')) {
          notes = part.slice('notes:'.length).trim();
        } else if (lower.startsWith('by:')) {
          userName = part.slice('by:'.length).trim();
        } else if (!reason) {
          // fallback for old logs like "damage" with no "Reason:" prefix
          reason = part;
        }
      }
    }

    // 3) BEFORE / AFTER using current_stock and special-case Initial Stock
    let quantityBefore: number | undefined;
    let quantityAfter: number | undefined;

    if (movementType === 'initial') {
      // Initial Stock: before = 0, after = quantity_change
      quantityBefore = 0;
      quantityAfter = log.quantity_change;
    } else if (
      typeof log.current_stock === 'number' &&
      !Number.isNaN(log.current_stock)
    ) {
      quantityAfter = log.current_stock;                        // AFTER
      quantityBefore = log.current_stock - log.quantity_change; // BEFORE = after - change
    }

    return {
      id: String(log.log_id),
      productId: String(log.product_id),
      productName: log.product_name || `Product #${log.product_id}`,
      movementType,
      quantity: log.quantity_change,
      quantityBefore,
      quantityAfter,
      userId: undefined,
      userName,
      reason,
      notes,
      referenceType: undefined,
      referenceId: undefined,
      timestamp: new Date(log.date_time),
    };
  }


export function InventoryTracking({
  products,
  onUpdateProducts,
  currentUserName,
}: InventoryTrackingProps) {
  const [activeSubTab, setActiveSubTab] = useState('stock-levels');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  // Movement filters
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] =
    useState<MovementTypeFilter>('all');
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(true);

  // Add adjustment dialog
  const [showAddAdjustment, setShowAddAdjustment] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState<{
    productId: string;
    quantity: string;
    reason: string;
    notes: string;
    type: MovementType;
  }>({
    productId: '',
    quantity: '',
    reason: '',
    notes: '',
    type: 'adjustment', // default selection
  });
  
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // === Load movements from backend ===
  const loadMovements = async () => {
    setLoadingMovements(true);
    try {
      const logs = await getInventoryLogs();
      setMovements(logs.map(mapLogToMovement));
    } catch (err) {
      console.error('Failed to load inventory logs:', err);
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const getStockStatus = (product: Product): 'low' | 'normal' | 'high' => {
    if (product.stock <= product.minStock) return 'low';
    if (product.stock <= product.minStock * 2) return 'normal';
    return 'high';
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);

    const status = getStockStatus(product);
    const matchesFilter = stockFilter === 'all' || status === stockFilter;

    return matchesSearch && matchesFilter;
  });

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.productName.toLowerCase().includes(movementSearch.toLowerCase()) ||
      (movement.userName || '')
        .toLowerCase()
        .includes(movementSearch.toLowerCase()) ||
      (movement.reason || '')
        .toLowerCase()
        .includes(movementSearch.toLowerCase());

    const matchesType =
      movementTypeFilter === 'all' ||
      movement.movementType === movementTypeFilter;

    return matchesSearch && matchesType;
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const normalStockProducts = products.filter((p) => {
    const status = getStockStatus(p);
    return status === 'normal';
  });
  const highStockProducts = products.filter((p) => {
    const status = getStockStatus(p);
    return status === 'high';
  });

  const totalStockValue = products.reduce(
    (sum, p) => sum + p.stock * p.price,
    0
  );
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  // Movement stats (based on real logs)
  const todayMovements = useMemo(() => {
    const todayStr = new Date().toDateString();
    return movements.filter(
      (m) => m.timestamp.toDateString() === todayStr
    );
  }, [movements]);

  const stockAdded = useMemo(
    () =>
      movements
        .filter((m) => m.quantity > 0)
        .reduce((sum, m) => sum + m.quantity, 0),
    [movements]
  );

  const stockRemoved = useMemo(
    () =>
      movements
        .filter((m) => m.quantity < 0)
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0),
    [movements]
  );

  const adjustmentsCount = useMemo(
    () => movements.filter((m) => m.movementType === 'adjustment').length,
    [movements]
  );

  const getMovementTypeBadge = (type: string) => {
    const configs = {
      initial: { label: 'Initial', className: 'bg-gray-100 text-gray-700' },
      purchase: { label: 'Purchase', className: 'bg-blue-100 text-blue-700' },
      sale: { label: 'Sale', className: 'bg-green-100 text-green-700' },
      adjustment: {
        label: 'Adjustment',
        className: 'bg-yellow-100 text-yellow-700',
      },
      return: { label: 'Return', className: 'bg-purple-100 text-purple-700' },
      damage: { label: 'Damage', className: 'bg-red-100 text-red-700' },
    };

    const config =
      configs[type as keyof typeof configs] || configs.adjustment;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleAddAdjustment = async () => {
    const selectedProduct = products.find(
      (p) => p.id === adjustmentForm.productId
    );
    if (!selectedProduct) {
      alert('Please select a product.');
      return;
    }
  
    const quantity = parseInt(adjustmentForm.quantity, 10);
  
    // Validate quantity
    if (isNaN(quantity) || quantity === 0) {
      alert(
        'Please enter a valid quantity (positive to add, negative to remove)'
      );
      return;
    }
  
    // Check if stock would go negative (client-side guard)
    if (selectedProduct.stock + quantity < 0) {
      alert(
        `Cannot remove ${Math.abs(
          quantity
        )} units. Only ${selectedProduct.stock} units available.`
      );
      return;
    }
  
    setSavingAdjustment(true);
  
    try {
      const remarksParts = [
        adjustmentForm.reason.trim(),
        adjustmentForm.notes.trim()
          ? `Notes: ${adjustmentForm.notes.trim()}`
          : '',
        `By: ${currentUserName}`,
      ].filter(Boolean);
  
      let backendChangeType: BackendMovementType;
      switch (adjustmentForm.type) {
        case 'purchase':
          backendChangeType = 'Purchase';
          break;
        case 'return':
          backendChangeType = 'Return';
          break;
        case 'damage':
          backendChangeType = 'Damage';
          break;
        case 'adjustment':
        default:
          backendChangeType = 'Adjustment';
          break;
      }
  
      // Call Flask /inventory – this will update Product.stock_quantity
      await addInventoryLog({
        product_id: Number(adjustmentForm.productId),
        change_type: backendChangeType,
        quantity_change: quantity,
        remarks: remarksParts.join(' | '),
      });
  
      // Refresh logs + products from backend
      const [logs, freshProducts] = await Promise.all([
        getInventoryLogs(),
        fetchProducts(),
      ]);
  
      setMovements(logs.map(mapLogToMovement));
      onUpdateProducts(freshProducts);
  
      setShowAddAdjustment(false);
      setAdjustmentForm({
        productId: '',
        quantity: '',
        reason: '',
        notes: '',
        type: 'adjustment',
      });
    } catch (error) {
      console.error('Error adding stock adjustment:', error);
      alert('Failed to add stock adjustment. Please try again.');
    } finally {
      setSavingAdjustment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-[#1a5a1a]">Inventory Management</h2>
        <p className="text-[#5B7A4A] mt-1">
          Monitor stock levels and track inventory movements
        </p>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-white border-2 border-[#D4E7C5] p-1 rounded-xl shadow-sm">
          <TabsTrigger
            value="stock-levels"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white rounded-lg transition-all"
          >
            <Package className="size-4 mr-2" />
            Stock Levels
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4A7C3A] data-[state=active]:to-[#5B8A47] data-[state=active]:text-white rounded-lg transition-all"
          >
            <History className="size-4 mr-2" />
            Movement History
          </TabsTrigger>
        </TabsList>

        {/* Stock Levels Tab */}
        <TabsContent value="stock-levels" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Total Stock Value</div>
                  <Package className="size-5 text-[#4A7C3A]" />
                </div>
                <div className="text-2xl text-[#2D5016]">
                ₹{totalStockValue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Total Units</div>
                  <TrendingUp className="size-5 text-[#4A7C3A]" />
                </div>
                <div className="text-2xl text-[#2D5016]">
                  {totalStockUnits}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 shadow-sm bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-red-800">Low Stock Items</div>
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <div className="text-2xl text-red-600">
                  {lowStockProducts.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Good Stock</div>
                  <TrendingUp className="size-5 text-green-600" />
                </div>
                <div className="text-2xl text-green-600">
                  {highStockProducts.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Filter */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <Package className="size-4" />
                <span>Filter by Stock Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  onClick={() => setStockFilter('all')}
                  className={`cursor-pointer px-4 py-2 ${
                    stockFilter === 'all'
                      ? 'bg-[#4A7C3A] hover:bg-[#3D6B2F] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  All ({products.length})
                </Badge>
                <Badge
                  onClick={() => setStockFilter('low')}
                  className={`cursor-pointer px-4 py-2 ${
                    stockFilter === 'low'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  Low Stock ({lowStockProducts.length})
                </Badge>
                <Badge
                  onClick={() => setStockFilter('normal')}
                  className={`cursor-pointer px-4 py-2 ${
                    stockFilter === 'normal'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                  }`}
                >
                  Normal Stock ({normalStockProducts.length})
                </Badge>
                <Badge
                  onClick={() => setStockFilter('high')}
                  className={`cursor-pointer px-4 py-2 ${
                    stockFilter === 'high'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  Good Stock ({highStockProducts.length})
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products by name, category, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#D1EDC5]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && stockFilter === 'all' && (
            <Card className="border-red-200 shadow-sm bg-gradient-to-r from-red-50 to-orange-50">
              <CardHeader className="border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="size-5 text-red-600" />
                  </div>
                  <CardTitle className="text-red-900">
                    Low Stock Alert
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lowStockProducts.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-100"
                    >
                      <div>
                        <div className="text-[#2D5016]">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600">
                          {product.stock} units
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {product.minStock}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {lowStockProducts.length > 6 && (
                  <div className="mt-3 text-center text-sm text-red-700">
                    +{lowStockProducts.length - 6} more items with low stock
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Table */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
              <CardTitle className="text-[#1a5a1a]">
                Stock Levels ({filteredProducts.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600">
                        Current Stock
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600">
                        Min Stock
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600">
                        Stock Value
                      </th>
                      <th className="text-center py-3 px-4 text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      const stockValue = product.stock * product.price;
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-gray-900">
                            {product.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {product.category}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`${
                                status === 'low'
                                  ? 'text-red-600'
                                  : status === 'normal'
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {product.minStock}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                          ₹{stockValue.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              className={`${
                                status === 'low'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                  : status === 'normal'
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                                  : 'bg-green-100 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {status === 'low' && (
                                <AlertTriangle className="size-3 mr-1" />
                              )}
                              {status === 'low'
                                ? 'Low'
                                : status === 'normal'
                                ? 'Normal'
                                : 'Good'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movement History Tab */}
        <TabsContent value="movements" className="space-y-6">
          {/* Movement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Stock Added Today</div>
                  <Plus className="size-5 text-[#4A7C3A]" />
                </div>
                <div className="text-2xl text-[#2D5016]">{stockAdded}</div>
              </CardContent>
            </Card>

            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">
                    Stock Removed Today
                  </div>
                  <TrendingDown className="size-5 text-[#4A7C3A]" />
                </div>
                <div className="text-2xl text-[#2D5016]">{stockRemoved}</div>
              </CardContent>
            </Card>

            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">
                    Adjustments Today
                  </div>
                  <Filter className="size-5 text-[#4A7C3A]" />
                </div>
                <div className="text-2xl text-[#2D5016]">
                  {adjustmentsCount}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D1EDC5] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">
                    Total Movements Today
                  </div>
                  <History className="size-5 text-[#4A7C3A]" />
                </div>
                <div className="text-2xl text-[#2D5016]">
                  {todayMovements.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Adjustment Button */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowAddAdjustment(true)}
                className="bg-[#4A7C3A] hover:bg-[#3D6B2F] text-white"
              >
                Add Adjustment
              </Button>
            </CardContent>
          </Card>

          {/* Add Adjustment Dialog */}
          <Dialog open={showAddAdjustment} onOpenChange={setShowAddAdjustment}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Stock Adjustment</DialogTitle>
                <DialogDescription>
                  Manually adjust stock levels. Use positive numbers to add
                  stock, negative numbers to remove stock.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">
                    Product
                  </Label>
                  <Select
                    value={adjustmentForm.productId}
                    onValueChange={(value: string) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        productId: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Current: {product.stock} units)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 10 (add) or -5 (remove)"
                      value={adjustmentForm.quantity}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          quantity: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter positive number to add, negative to remove
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Movement Type
                  </Label>
                  <Select
                    value={adjustmentForm.type}
                    onValueChange={(value: MovementType) =>
                      setAdjustmentForm({ ...adjustmentForm, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select movement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="damage">Damage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Physical count correction"
                    value={adjustmentForm.reason}
                    onChange={(e) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        reason: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Optional: Additional details about this adjustment"
                    value={adjustmentForm.notes}
                    onChange={(e) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        notes: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddAdjustment(false)}
                  disabled={savingAdjustment}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAdjustment}
                  className="bg-[#4A7C3A] hover:bg-[#3D6B2F] text-white"
                  disabled={savingAdjustment}
                >
                  {savingAdjustment ? 'Saving...' : 'Add Adjustment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Movement Filter */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <History className="size-4" />
                <span>Filter by Movement Type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  onClick={() => setMovementTypeFilter('all')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'all'
                      ? 'bg-[#4A7C3A] hover:bg-[#3D6B2F] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  All ({movements.length})
                </Badge>
                <Badge
                  onClick={() => setMovementTypeFilter('initial')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'initial'
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Initial (
                  {movements.filter((m) => m.movementType === 'initial').length})
                </Badge>
                <Badge
                  onClick={() => setMovementTypeFilter('purchase')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'purchase'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  Purchase (
                  {
                    movements.filter((m) => m.movementType === 'purchase')
                      .length
                  }
                  )
                </Badge>
                <Badge
                  onClick={() => setMovementTypeFilter('sale')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'sale'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  Sale (
                  {movements.filter((m) => m.movementType === 'sale').length})
                </Badge>
                <Badge
                  onClick={() => setMovementTypeFilter('adjustment')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'adjustment'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                  }`}
                >
                  Adjustment (
                  {
                    movements.filter((m) => m.movementType === 'adjustment')
                      .length
                  }
                  )
                </Badge>
                <Badge
                  onClick={() => setMovementTypeFilter('return')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'return'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  Return (
                  {movements.filter((m) => m.movementType === 'return').length})
                </Badge>
                <Badge
                  onClick={() => setMovementTypeFilter('damage')}
                  className={`cursor-pointer px-4 py-2 ${
                    movementTypeFilter === 'damage'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  Damage (
                  {movements.filter((m) => m.movementType === 'damage').length})
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search movements by product, user, or reason..."
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                  className="pl-10 border-[#D1EDC5]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Movement Table */}
          <Card className="border-[#D1EDC5] shadow-sm">
            <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
              <CardTitle className="text-[#1a5a1a]">
                Movement History ({filteredMovements.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600">
                        User
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600">
                        Quantity
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600">
                        Before
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600">
                        After
                      </th>
                      <th className="text-center py-3 px-4 text-gray-600">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600">
                        Notes
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 text-gray-600">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((movement) => (
                      <tr
                        key={movement.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-900">
                          {movement.productName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {movement.userName || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`${
                              movement.quantity < 0
                                ? 'text-red-600'
                                : movement.quantity > 0
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {movement.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {movement.quantityBefore ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {movement.quantityAfter ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getMovementTypeBadge(movement.movementType)}
                        </td>
                        <td className="py-3 px-4 text-left text-gray-600">
                          {movement.reason || '-'}
                        </td>
                        <td className="py-3 px-4 text-left text-gray-600">
                          {movement.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-left text-gray-600">
                          {movement.referenceType && movement.referenceId
                            ? `${movement.referenceType}: ${movement.referenceId}`
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-left text-gray-600">
                          {movement.timestamp.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!loadingMovements && filteredMovements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No movements found
                  </div>
                )}
                {loadingMovements && (
                  <div className="text-center py-8 text-gray-500">
                    Loading movements...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
