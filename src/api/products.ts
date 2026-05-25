import { supabase } from '../utils/supabaseClient';
import type { Product } from '../App';

const CATEGORY_MAP: Record<string, number> = {
  Groceries: 1,
  Beverages: 2,
  Food: 3,
  Snacks: 4,
  Dairy: 5,
  Frozen: 6,
  Bakery: 7,
  "Meat & Seafood": 8,
  "Fruits & Vegetables": 9,
  "Personal Care": 10,
  Household: 11,
  Other: 12,
};

// Convert DB format -> React Product type
function convertToFrontend(p: any): Product {
  return {
    id: String(p.product_id),
    name: p.product_name,
    category: p.category_name || "Uncategorized",
    categoryId: p.category_id,
    price: p.price,
    stock: p.stock_quantity,
    barcode: p.barcode ?? "",
    minStock: p.min_stock ?? 0,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('product_id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (products || []).map(convertToFrontend);
}

export async function createProduct(
  input: Omit<Product, "id">,
  createdBy?: string
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .insert([
      {
        product_name: input.name,
        category_name: input.category,
        category_id: CATEGORY_MAP[input.category] || null,
        price: input.price,
        stock_quantity: input.stock,
        unit: "pcs",
        min_stock: input.minStock,
        barcode: input.barcode,
        created_by: createdBy ?? "Unknown",
      }
    ]);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  const body: any = {};
  if (updates.name !== undefined) body.product_name = updates.name;
  if (updates.price !== undefined) body.price = updates.price;
  if (updates.stock !== undefined) body.stock_quantity = updates.stock;
  if (updates.category !== undefined) {
    body.category_name = updates.category;
    body.category_id = CATEGORY_MAP[updates.category] ?? null;
  }
  if (updates.minStock !== undefined) body.min_stock = updates.minStock;
  if (updates.barcode !== undefined) body.barcode = updates.barcode;

  const { error } = await supabase
    .from('products')
    .update(body)
    .eq('product_id', Number(id));

  if (error) {
    throw new Error(error.message);
  }
}