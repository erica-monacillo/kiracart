import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Product } from '../App';
import { Plus, Pencil, Search, FolderOpen, Tag, Trash2 } from 'lucide-react';
import { fetchCategories, createCategory, deleteCategory, Category } from '../api/categories';

type ProductFormData = {
  name: string;
  category: string;   // dropdown category name
  price: string;
  stock: string;
  barcode: string;
  minStock: string;
};

interface ProductsManagementProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  onCategoriesUpdated?: () => void; 
}

const DEFAULT_CATEGORIES = [
  'Groceries',
  'Beverages',
  'Food',
  'Snacks',
  'Dairy',
  'Frozen',
  'Bakery',
  'Meat & Seafood',
  'Fruits & Vegetables',
  'Personal Care',
  'Household',
  'Other'
];

export function ProductsManagement({
  products,
  onUpdateProducts,
  onAddProduct,
  onUpdateProduct,
  onCategoriesUpdated,
}: ProductsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: '',
    stock: '',
    barcode: '',
    minStock: '1',
  });

  // Load categories from backend (with fallback to defaults)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const backendCategories = await fetchCategories();

        if (backendCategories.length > 0) {
          setCategories(backendCategories);
        } else {
          // Fallback if DB is empty: seed from DEFAULT_CATEGORIES just in UI
          setCategories(
            DEFAULT_CATEGORIES.map((name, index) => ({
              id: index + 1,
              name,
              imagePath: null,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load categories from backend:', error);
        // Fallback to default list
        setCategories(
          DEFAULT_CATEGORIES.map((name, index) => ({
            id: index + 1,
            name,
            imagePath: null,
          }))
        );
      }
    };

    loadCategories();
  }, []);

  // Filter products by search & category
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (categoryName: string) => {
    if (categoryName === 'All') return products.length;
    return products.filter(p => p.category === categoryName).length;
  };

  const handleDeleteCategory = async (category: Category) => {
    if (
      !confirm(
        `Delete category "${category.name}"? Products in this category will keep their category label.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory(category.id);
      setCategories(prev => prev.filter(c => c.id !== category.id));
      onCategoriesUpdated?.(); 
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      barcode: '',
      minStock: '1',
    });
    setEditingProduct(null);
    setShowAddDialog(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode,
      minStock: product.minStock.toString(),
    });
    setEditingProduct(product);
    setShowAddDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedBarcode = formData.barcode.trim();

    const isDuplicateBarcode = products.some(
      p =>
        p.barcode &&
        p.barcode === trimmedBarcode &&
        (!editingProduct || p.id !== editingProduct.id)
    );

    if (trimmedBarcode && isDuplicateBarcode) {
      alert('Barcode already exists. Please use a different barcode.');
      return;
    }

    const productData: Omit<Product, 'id'> = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      barcode: trimmedBarcode,
      minStock: parseInt(formData.minStock, 10),
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productData);
      } else {
        await onAddProduct(productData);
      }
      setShowAddDialog(false);
    } catch (error: any) {
      console.error('Failed to save product:', error);

      const message =
        (error instanceof Error && error.message) ||
        error?.response?.data?.error ||
        'Failed to save product. Please try again.';

      alert(message);
    }
  };

  // Add category with optional image
  const handleAddCategoryClick = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    // Prevent duplicates (case-insensitive)
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('Category already exists.');
      return;
    }

    try {
      // createCategory is assumed to be (name: string, imageFile?: File | null)
      const created = await createCategory(trimmed, newCategoryImage);
      setCategories(prev => [...prev, created]);
      onCategoriesUpdated?.();
      setNewCategoryName('');
      setNewCategoryImage(null);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl text-[#1a5a1a]">Products Management</h2>
          <p className="text-[#5B7A4A] mt-1">
            Manage your product catalog and categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCategoryDialog(true)}
            variant="outline"
            className="border-[#D1EDC5]"
          >
            <Tag className="size-4 mr-2" />
            Manage Categories
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-[#4A7C3A] to-[#5B8A47] hover:from-[#3D6B2F] hover:to-[#4A7C3A] text-white"
          >
            <Plus className="size-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <Card className="border-[#D1EDC5] shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <FolderOpen className="size-4" />
            <span>Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              onClick={() => setSelectedCategory('All')}
              className={`cursor-pointer px-4 py-2 ${
                selectedCategory === 'All'
                  ? 'bg-[#4A7C3A] hover:bg-[#3D6B2F] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All ({getCategoryCount('All')})
            </Badge>
            {categories.map(category => (
              <Badge
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`cursor-pointer px-4 py-2 ${
                  selectedCategory === category.name
                    ? 'bg-[#4A7C3A] hover:bg-[#3D6B2F] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category.name} ({getCategoryCount(category.name)})
              </Badge>
            ))}
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
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 border-[#D1EDC5]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-[#D1EDC5] shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#f0f9ed] to-white border-b border-[#D1EDC5]">
          <CardTitle className="text-[#1a5a1a]">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-gray-600">Category</th>
                  <th className="text-right py-3 px-4 text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-gray-600">Barcode</th>
                  <th className="text-center py-3 px-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.barcode}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="text-[#1a5a1a] hover:bg-[#f0f9ed]"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update product information below.'
                : 'Enter product details to add to inventory.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => {
                  setFormData(prev => ({
                    ...prev,
                    category: value,
                  }));
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={e =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock Level</Label>
                <Input
                  id="minStock"
                  type="number"
                  min={1}
                  value={formData.minStock}
                  onChange={e => {
                    const raw = e.target.value;

                    if (raw === '') {
                      setFormData({ ...formData, minStock: '1' });
                      return;
                    }

                    const num = Number(raw);
                    const clamped = Number.isNaN(num)
                      ? 1
                      : Math.max(1, num);

                    setFormData({
                      ...formData,
                      minStock: String(clamped),
                    });
                  }}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#4A7C3A] hover:bg-[#3D6B2F]"
              >
                {editingProduct ? 'Update' : 'Add'} Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add or remove product categories for your inventory.
            </DialogDescription>
          </DialogHeader>

          {/* Add New Category */}
          <div className="space-y-3">
            {/* Wrapper for inputs */}
            <div className="flex flex-col gap-7">

              {/* Name input + Add button */}
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Enter new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="
                    flex-1 h-10
                    rounded-l-md
                    border border-[#4A7C3A]
                  "
                />

                <Button
                  type="button"
                  onClick={handleAddCategoryClick}
                  className="
                    h-10 px-6
                    rounded-r-md
                    bg-[#4A7C3A] hover:bg-[#3D6B2F]
                    text-white
                  "
                >
                  <Plus className="size-4 mr-2" />
                  Add
                </Button>
              </div>


              {/* Image Picker under the field */}
              <div className="flex items-center gap-2 w-48 mt-4">
                <Label className="text-xs text-gray-600 mb-1">
                  Image (optional)
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCategoryImage(e.target.files?.[0] ?? null)}
                  className="
                    text-xs text-gray-700
                    rounded-md border border-gray-300
                    file:mr-3 file:py-1.5 file:px-3
                    file:rounded-md file:border-0
                    file:bg-[#4A7C3A] file:text-white
                    hover:file:bg-[#3D6B2F]
                  "
                />
              </div>

            </div>


            {/* Category List */}
            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="size-4 text-gray-400" />
                    <span className="text-gray-900">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryCount(category.name)} products
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setShowCategoryDialog(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
