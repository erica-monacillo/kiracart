# Complete ERD (Entity Relationship Diagram) - POS System

## Alok Dixit's Point of Sale System

### Current Implementation (v2.0) - localStorage with Backend Fallback

---

## 📊 Visual ERD Diagram (Current Implementation)

```
┌─────────────────────────┐
│       USERS             │
│─────────────────────────│
│ PK: id (string)         │
│     username            │
│     email               │
│     password            │
│     name                │
│     role                │
└────────────┬────────────┘
             │
             │ 1:N (cashier_id)
             │
             ├──────────────────────────────────────┐
             │                                      │
             │                                      │
┌────────────▼────────────┐              ┌─────────▼──────────┐
│    CATEGORIES           │              │    SALES           │
│─────────────────────────│              │────────────────────│
│ PK: id (string)         │              │ PK: id (string)    │
│     name                │              │     receipt_number │
│                         │              │ FK: cashier_id     │
│                         │              │     cashier_name   │
│                         │              │     total          │
│                         │              │     payment_method │
└─────────┬───────────────┘              │     timestamp      │
          │                              │     items[]        │
          │ 1:N                          └─────────┬──────────┘
          │                                        │──────────────
┌─────────▼───────────────┐                                      │ 1:N
│    PRODUCTS             │                                      │
│─────────────────────────│                            ┌─────────▼─────────┐
│ PK: id (string)         │                            │   SALE_ITEMS      │
│ FK: category_id         │────────────────────────────┤───────────────────│
│     name                │                            │     product_id    │
│     category (string)   │ ◄── Also stores name       │     product_name  │
│     price               │     for denormalization    │     quantity      │
│     stock               │                            │     price         │
│     barcode             │                            │     subtotal      │
│     min_stock           │                            └───────────────────┘
└─────────┬───────────────┘
          │
          │ N:1
          │
          │
          └──────────────────────────────┐
                                         │
                                         │
┌─────────────────────────────────────────▼───────────────────┐
│          INVENTORY_MOVEMENTS (Audit Trail)                  │
│─────────────────────────────────────────────────────────────│
│ PK: id (string)                                            │
│ FK: product_id → PRODUCTS                                  │
│     product_name                                            │
│ FK: user_id → USERS                                        │
│     user_name                                               │
│     movement_type (initial, purchase, sale, adjustment...)  │
│     quantity (+/-)                                          │
│     quantity_before                                         │
│     quantity_after                                          │
│     reason                                                  │
│     notes                                                   │
│     reference_type                                          │
│     reference_id                                            │
│     timestamp                                               │
└─────────────────────────────────────────────────────────────┘
```

**Note on Implementation:**

- In current localStorage implementation, CATEGORIES exist but are stored in component state (not persisted)
- In backend/database implementation, CATEGORIES is a proper table with IDs
- PRODUCTS store both `categoryId` (FK) and `category` (string) for denormalization

---

## 📋 Complete Table Definitions (Current Implementation)

### 1. **USERS Table**

**Purpose:** Store user accounts (Admin, Cashier)  
**Storage:** localStorage key: `pos_users` + Backend: KV Store

| Field Name | Data Type | Required | Description                     |
| ---------- | --------- | -------- | ------------------------------- |
| id         | string    | Yes      | Unique user identifier          |
| username   | string    | Yes      | User login username             |
| email      | string    | Yes      | User login email                |
| password   | string    | Yes      | Password (hashed in production) |
| name       | string    | Yes      | Full display name               |
| role       | enum      | Yes      | 'admin' or 'cashier'            |

**Validation Rules:**

- `email` must be unique
- `username` must be unique
- `role` must be either 'admin' or 'cashier'

**Default Demo Data:**

```javascript
{
  id: 'admin-001',
  username: 'admin',
  email: 'admin@pos.com',
  password: 'admin123',
  role: 'admin',
  name: 'Erica Monacillo'
},
{
  id: 'cashier-001',
  username: 'cashier',
  email: 'cashier@pos.com',
  password: 'cashier123',
  role: 'cashier',
  name: 'Jars Christian Lerio'
}
```

**Access:**

- Read: All authenticated users
- Create: Public (signup)
- Update: Owner only
- Delete: Admin only

---

### 2. **CATEGORIES Table (Backend/Database)**

**Purpose:** Organized product categorization system  
**Storage:** Backend: KV Store (for database implementation)  
**Note:** Currently NOT used in localStorage implementation (see section 2.1 below)

| Field Name | Data Type | Required | Default | Description                    |
| ---------- | --------- | -------- | ------- | ------------------------------ |
| id         | string    | Yes      | -       | Unique category identifier     |
| name       | string    | Yes      | -       | Category name (must be unique) |

**Validation Rules:**

- `name` must be unique
- Cannot delete categories with products assigned
- Only admins can create/update/deactivate categories

**Storage Keys (Backend):**

- `category:{id}` - Individual category lookup
- `category:name:{name}` - Lookup by category name

**Demo Categories (Backend):**

```javascript
[
  { id: 'cat-001', name: 'Groceries', description: 'Grocery items', isActive: true },
  { id: 'cat-002', name: 'Beverages', description: 'Drinks and beverages', isActive: true },
  { id: 'cat-003', name: 'Food', description: 'Food items', isActive: true },
  { id: 'cat-004', name: 'Snacks', description: 'Snack items', isActive: true },
  { id: 'cat-005', name: 'Dairy', description: 'Dairy products', isActive: true },
  { id: 'cat-006', name: 'Frozen', description: 'Frozen items', isActive: true },
  { id: 'cat-007', name: 'Bakery', description: 'Bakery products', isActive: true },
  { id: 'cat-008', name: 'Meat & Seafood', description: 'Meat and seafood products', isActive: true },
  { id: 'cat-009', name: 'Fruits & Vegetables', description: 'Fresh produce', isActive: true },
  { id: 'cat-010', name: 'Personal Care', description: 'Personal care items', isActive: true },
  { id: 'cat-011', name: 'Household', description: 'Household items', isActive: true },
  { id: 'cat-012', name: 'Other', description: 'Other items', isActive: true }
]
```

**Access:**

- Read: All authenticated users
- Create: Admin only
- Update: Admin only
- Delete/Deactivate: Admin only (only if no products assigned)

**Relationship with PRODUCTS:**

- One category → Many products (1:N)
- Products reference categories via `categoryId` (FK)
- Products also store `categoryName` (denormalized) for historical accuracy

---

### 2.1 **CATEGORIES (Component State - Current Implementation)**

**Purpose:** Provide category options for product classification  
**Storage:** UI component state (InventoryManagement.tsx)  
**Type:** String array (not a database table)

**⚠️ CURRENT IMPLEMENTATION: Categories have NO IDs or Primary Keys**

**Data Structure:**

```javascript
// Categories are simply an array of strings
const categories = [
  'Groceries',
  'Beverages',
  'Food',
  // ... more category names
];

// NOT objects with IDs like this:
// ❌ const categories = [{ id: '1', name: 'Groceries' }];
```

**How Products Reference Categories:**

```typescript
interface Product {
  id: string;
  name: string;
  category: string;  // ⚠️ Stores the category NAME directly, not an ID
  price: number;
  stock: number;
  barcode: string;
  minStock: number;
}

// Example:
{
  id: 'prod-001',
  name: 'Rice 25kg',
  category: 'Groceries',  // ← Direct string value, NOT a foreign key
  price: 1250,
  stock: 50
}
```

**Implementation Details:**

- Categories are stored in React component state, not in localStorage or database
- Categories are **plain strings**, not objects
- **No ID/PK:** Categories cannot be referenced by ID
- **No foreign key:** Products store the category name directly
- Default categories are hard-coded in the component
- Admins can dynamically add/remove categories during runtime
- Category changes are NOT persisted across page refreshes
- Products store category as a plain string value (fully denormalized)

**Default Categories List:**

```javascript
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
```

**Category Management Features:**

- ✅ Add new categories (runtime only)
- ✅ Delete categories (doesn't affect existing products)
- ✅ Filter products by category
- ✅ Count products per category
- ❌ Persist custom categories (resets on refresh)
- ❌ Rename categories (would orphan existing products)
- ❌ Category IDs (not implemented)
- ❌ Category metadata (description, color, icon)

**Why No IDs?**

- **Simplicity:** No need for foreign keys or joins
- **Flexibility:** Products can have any category string
- **Historical Accuracy:** If category system changes, products retain their original category
- **Performance:** No additional lookups needed
- **Offline-First:** No complex relational data to manage
- **Less Code:** No ID generation or management logic needed

**Trade-offs:**

- ✅ **Pros:** Simple, fast, flexible, works offline, no ID management
- ❌ **Cons:** No category-level metadata, spelling variations possible, no persistence for custom categories, cannot track category changes over time

**Implications:**

```javascript
// ✅ This works (string comparison)
const groceryProducts = products.filter(p => p.category === 'Groceries');

// ��� This doesn't exist (no IDs)
const category = categories.find(c => c.id === 'cat-001');

// ⚠️ Category renaming is problematic
// If you rename 'Groceries' to 'Food Items', existing products still say 'Groceries'
// You would need to manually update all products with that category
```

**Future Enhancement Plan (If IDs Are Needed):**
If category management needs to be more robust with IDs, create a proper CATEGORIES table:

```javascript
// Future structure with IDs (not implemented yet)
interface Category {
  id: string;              // ← Add primary key
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
}

// Store categories in localStorage
localStorage.setItem('pos_categories', JSON.stringify(categories));

// Then update Product to reference category by ID (with denormalization)
interface Product {
  // ... other fields
  categoryId: string;      // ← Foreign key to CATEGORIES
  categoryName: string;    // ← Denormalized for historical accuracy
}

// Example with IDs:
{
  id: 'prod-001',
  name: 'Rice 25kg',
  categoryId: 'cat-001',        // ← Reference by ID
  categoryName: 'Groceries',    // ← Store name for history
  price: 1250,
  stock: 50
}
```

---

### 3. **PRODUCTS Table**

**Purpose:** Store product catalog and inventory  
**Storage:** localStorage key: `pos_products` + Backend: KV Store

| Field Name | Data Type | Required | Default | Description               |
| ---------- | --------- | -------- | ------- | ------------------------- |
| id         | string    | Yes      | -       | Unique product identifier |
| name       | string    | Yes      | -       | Product name              |
| category   | string    | Yes      | -       | Product category          |
| price      | number    | Yes      | -       | Selling price (₹)         |
| stock      | number    | Yes      | 0       | Current stock quantity    |
| barcode    | string    | Yes      | -       | Product barcode/SKU       |
| minStock   | number    | Yes      | 10      | Minimum stock threshold   |

**Validation Rules:**

- `price` must be >= 0
- `stock` must be >= 0
- `minStock` must be >= 0
- `barcode` must be unique

**Default Categories:**

- Groceries
- Beverages
- Food
- Snacks
- Dairy
- Frozen
- Bakery
- Meat & Seafood
- Fruits & Vegetables
- Personal Care
- Household
- Other

**Default Demo Data:**

```javascript
{
  id: 'prod-001',
  name: 'Rice 25kg',
  category: 'Groceries',
  price: 1250,
  stock: 50,
  barcode: '8901234567890',
  minStock: 10
},
{
  id: 'prod-002',
  name: 'Cooking Oil 1L',
  category: 'Groceries',
  price: 180,
  stock: 30,
  barcode: '8901234567891',
  minStock: 5
}
// ... more demo products
```

**Stock Status Logic:**

- **Low Stock:** `stock <= minStock` (Red warning)
- **Normal Stock:** `stock <= minStock * 2` (Orange warning)
- **Good Stock:** `stock > minStock * 2` (Green status)

**Access:**

- Read: All authenticated users
- Create: Admin only
- Update: Admin only
- Delete: Admin only

---

### 4. **SALES Table**

**Purpose:** Store completed sale transactions  
**Storage:** localStorage key: `pos_sales` + Backend: KV Store

| Field Name    | Data Type | Required | Description                     |
| ------------- | --------- | -------- | ------------------------------- |
| id            | string    | Yes      | Unique sale identifier          |
| receiptNumber | string    | Yes      | Unique receipt number           |
| cashierId     | string    | Yes      | ID of cashier who made sale     |
| cashierName   | string    | Yes      | Name of cashier                 |
| items         | array     | Yes      | Array of sale items (see below) |
| total         | number    | Yes      | Total sale amount (₹)           |
| paymentMethod | string    | Yes      | Payment method used             |
| timestamp     | Date      | Yes      | Sale completion timestamp       |

**Sale Items (embedded array):**

```typescript
interface SaleItem {
  productId: string; // Reference to product
  productName: string; // Product name at time of sale
  quantity: number; // Quantity sold
  price: number; // Unit price at time of sale
  subtotal: number; // quantity * price
}
```

**Payment Methods:**

- `cash` - Cash payment
- `gcash` - GCash e-wallet
- `paymaya` - PayMaya e-wallet
- `card` - Credit/Debit card
- `bank_transfer` - Bank transfer

**Receipt Number Format:**
`RCP-{timestamp}` (e.g., "RCP-1733414400000")

**Validation Rules:**

- `items` array must not be empty
- `total` must equal sum of all item subtotals
- `total` must be >= 0
- Each item quantity must be > 0
- Each item price must be >= 0

**Automatic Actions on Sale:**

1. Deduct product stock for each item
2. Create inventory movement records for audit trail
3. Generate unique receipt number
4. Record timestamp

**Example Sale Record:**

```javascript
{
  id: 'sale-1733414400000-abc123',
  receiptNumber: 'RCP-1733414400000',
  cashierId: 'cashier-001',
  cashierName: 'Jars Christian Lerio',
  items: [
    {
      productId: 'prod-001',
      productName: 'Rice 25kg',
      quantity: 2,
      price: 1250,
      subtotal: 2500
    }
  ],
  total: 2500,
  paymentMethod: 'cash',
  timestamp: new Date('2024-12-05T14:30:00')
}
```

**Access:**

- Read: All authenticated users (cashiers see only their sales)
- Create: All authenticated users (creates with their user ID)
- Update: Not allowed (sales are immutable)
- Delete: Not allowed (sales are immutable)

---

### 5. **INVENTORY_MOVEMENTS Table**

**Purpose:** Complete audit trail of all stock changes  
**Storage:** localStorage key: `pos_inventory_movements` + Backend: KV Store

| Field Name     | Data Type | Required | Description                         |
| -------------- | --------- | -------- | ----------------------------------- |
| id             | string    | Yes      | Unique movement identifier          |
| productId      | string    | Yes      | Product affected                    |
| productName    | string    | Yes      | Product name at time of movement    |
| userId         | string    | Yes      | User who performed the action       |
| userName       | string    | Yes      | User name at time of movement       |
| movementType   | enum      | Yes      | Type of movement (see below)        |
| quantity       | number    | Yes      | Quantity changed (+/-)              |
| quantityBefore | number    | Yes      | Stock level before change           |
| quantityAfter  | number    | Yes      | Stock level after change            |
| reason         | string    | No       | Reason for movement                 |
| notes          | string    | No       | Additional notes                    |
| referenceType  | string    | No       | Type of reference (sale, purchase)  |
| referenceId    | string    | No       | Reference ID (e.g., receipt number) |
| timestamp      | Date      | Yes      | When movement occurred              |

**Movement Types:**

- `initial` - Initial stock entry when product is created
- `purchase` - Stock received from supplier
- `sale` - Stock sold to customer (negative quantity)
- `adjustment` - Manual stock correction (positive or negative)
- `return` - Customer return (positive quantity)
- `damage` - Damaged/expired items removed (negative quantity)

**Validation Rules:**

- `quantityAfter` must equal `quantityBefore + quantity`
- All movements are immutable once created
- Movements automatically created for:
  - New product creation (initial)
  - Sales transactions (sale)
  - Manual adjustments (adjustment)

**Example Movement Records:**

```javascript
// Sale movement (automatic)
{
  id: 'mov-1733414400000-xyz789',
  productId: 'prod-001',
  productName: 'Rice 25kg',
  userId: 'cashier-001',
  userName: 'Jars Christian Lerio',
  movementType: 'sale',
  quantity: -2,
  quantityBefore: 50,
  quantityAfter: 48,
  referenceType: 'sale',
  referenceId: 'RCP-1733414400000',
  timestamp: new Date('2024-12-05T14:30:00')
}

// Manual adjustment (user-initiated)
{
  id: 'mov-1733414500000-def456',
  productId: 'prod-002',
  productName: 'Cooking Oil 1L',
  userId: 'admin-001',
  userName: 'Erica Monacillo',
  movementType: 'adjustment',
  quantity: -3,
  quantityBefore: 30,
  quantityAfter: 27,
  reason: 'Physical count correction',
  notes: 'Found 3 damaged bottles during inventory check',
  timestamp: new Date('2024-12-05T15:00:00')
}
```

**Access:**

- Read: All authenticated users
- Create: Automatic (sales) or Admin (adjustments)
- Update: Not allowed (immutable)
- Delete: Not allowed (immutable)

---

### 6. **SESSIONS Table** (In-Memory/LocalStorage)

**Purpose:** User authentication sessions  
**Storage:** localStorage key: `pos_current_user` + `pos_access_token`

| Field Name  | Data Type | Description                |
| ----------- | --------- | -------------------------- |
| user        | User      | Current authenticated user |
| accessToken | string    | Session token              |

**Session Management:**

- Sessions persist across page refreshes
- Token format: `local-{timestamp}` for localStorage sessions
- Sessions cleared on logout
- Auto-verify on app initialization

---

## 🔗 Relationship Summary

### One-to-Many (1:N) Relationships

| Parent Table | Child Table         | Relationship                      | Enforced By         |
| ------------ | ------------------- | --------------------------------- | ------------------- |
| USERS        | SALES               | 1 user (cashier) creates N sales  | cashierId field     |
| USERS        | INVENTORY_MOVEMENTS | 1 user performs N movements       | userId field        |
| PRODUCTS     | SALE_ITEMS          | 1 product appears in N sale items | productId field     |
| PRODUCTS     | INVENTORY_MOVEMENTS | 1 product has N movements         | productId field     |
| SALES        | SALE_ITEMS          | 1 sale contains N items           | Embedded in items[] |

### Data Integrity

**Referential Integrity:**

- Sale items reference products by ID (stored with product name for historical record)
- Inventory movements reference both products and users by ID (with names for historical record)
- Sales reference users (cashier) by ID (with name for historical record)

**Why Store Names?**

- Historical accuracy: If a product name changes, past sales/movements show the name at that time
- User name changes: Past transactions show who actually performed the action
- Denormalization for performance: No joins needed for display

---

## 📊 Data Flow Examples

### Example 1: Processing a Sale

**User Action:** Cashier completes a sale transaction

**System Flow:**

1. **Validate Cart:**
   - Check all products exist
   - Verify sufficient stock for all items
   - Calculate totals

2. **Create Sale Record:**

```javascript
const newSale = {
  id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  receiptNumber: `RCP-${Date.now()}`,
  cashierId: currentUser.id,
  cashierName: currentUser.name,
  items: [
    {
      productId: 'prod-001',
      productName: 'Rice 25kg',
      quantity: 2,
      price: 1250,
      subtotal: 2500
    }
  ],
  total: 2500,
  paymentMethod: 'cash',
  timestamp: new Date()
};
```

3. **Update Product Stock:**

```javascript
// For each item in sale
items.forEach(item => {
  const product = products.find(p => p.id === item.productId);
  product.stock -= item.quantity;
  // Save to localStorage
  localStorage.setItem('pos_products', JSON.stringify(products));
});
```

4. **Create Inventory Movements:**

```javascript
// For each item in sale
items.forEach(item => {
  const movement = {
    id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId: item.productId,
    productName: item.productName,
    userId: currentUser.id,
    userName: currentUser.name,
    movementType: 'sale',
    quantity: -item.quantity,
    quantityBefore: product.stock + item.quantity,
    quantityAfter: product.stock,
    referenceType: 'sale',
    referenceId: newSale.receiptNumber,
    timestamp: new Date()
  };
  // Save to localStorage
});
```

5. **Save Sale:**

```javascript
localStorage.setItem('pos_sales', JSON.stringify([newSale, ...existingSales]));
```

---

### Example 2: Manual Stock Adjustment

**User Action:** Admin manually adjusts stock (e.g., after physical inventory count)

**System Flow:**

1. **Get Current Product:**

```javascript
const product = products.find(p => p.id === selectedProductId);
const adjustmentQty = parseInt(form.quantity); // e.g., -3 to remove 3 units
```

2. **Validate Adjustment:**

```javascript
if (product.stock + adjustmentQty < 0) {
  throw new Error('Cannot adjust below 0');
}
```

3. **Update Product Stock:**

```javascript
const updatedProduct = {
  ...product,
  stock: product.stock + adjustmentQty
};
localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
```

4. **Create Inventory Movement:**

```javascript
const movement = {
  id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  productId: product.id,
  productName: product.name,
  userId: currentUser.id,
  userName: currentUser.name,
  movementType: 'adjustment',
  quantity: adjustmentQty,
  quantityBefore: product.stock,
  quantityAfter: product.stock + adjustmentQty,
  reason: form.reason,
  notes: form.notes,
  timestamp: new Date()
};
localStorage.setItem('pos_inventory_movements', JSON.stringify([movement, ...movements]));
```

---

### Example 3: Adding a New Product

**User Action:** Admin adds a new product to inventory

**System Flow:**

1. **Create Product:**

```javascript
const newProduct = {
  id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: form.name,
  category: form.category,
  price: parseFloat(form.price),
  stock: parseInt(form.stock),
  barcode: form.barcode,
  minStock: parseInt(form.minStock)
};
```

2. **Save Product:**

```javascript
localStorage.setItem('pos_products', JSON.stringify([...products, newProduct]));
```

3. **Create Initial Inventory Movement:**

```javascript
const movement = {
  id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  productId: newProduct.id,
  productName: newProduct.name,
  userId: currentUser.id,
  userName: currentUser.name,
  movementType: 'initial',
  quantity: newProduct.stock,
  quantityBefore: 0,
  quantityAfter: newProduct.stock,
  reason: 'Initial stock entry',
  timestamp: new Date()
};
localStorage.setItem('pos_inventory_movements', JSON.stringify([movement, ...movements]));
```

---

## 🔐 Data Validation & Business Rules

### Product Validation

```javascript
// Stock cannot be negative
if (product.stock < 0) throw new Error('Stock cannot be negative');

// Price must be positive
if (product.price <= 0) throw new Error('Price must be greater than 0');

// Barcode must be unique
const duplicateBarcode = products.find(p => p.barcode === newBarcode && p.id !== productId);
if (duplicateBarcode) throw new Error('Barcode already exists');
```

### Sale Validation

```javascript
// Cart must not be empty
if (cart.length === 0) throw new Error('Cart is empty');

// Check stock availability
cart.forEach(item => {
  const product = products.find(p => p.id === item.productId);
  if (product.stock < item.quantity) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }
});

// Total must match items
const calculatedTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
if (total !== calculatedTotal) throw new Error('Total mismatch');
```

### Inventory Movement Validation

```javascript
// Quantity after must equal quantity before + quantity
if (movement.quantityAfter !== movement.quantityBefore + movement.quantity) {
  throw new Error('Movement calculation error');
}

// Stock cannot go below 0
if (movement.quantityAfter < 0) {
  throw new Error('Stock cannot be negative');
}
```

---

## 💾 Storage Strategy

### LocalStorage Keys

- `pos_users` - User accounts array
- `pos_products` - Products array
- `pos_sales` - Sales array
- `pos_inventory_movements` - Inventory movements array
- `pos_current_user` - Current session user object
- `pos_access_token` - Session token
- `pos_initialized` - Initialization flag

### Backend Fallback (Supabase)

- All localStorage operations have backend API fallback
- Backend APIs attempt to sync with Supabase Functions + KV Store
- On API failure, automatically falls back to localStorage
- Data structure identical between localStorage and backend

### Data Sync Strategy

```javascript
// Try backend first, fallback to localStorage
async function getData() {
  try {
    const response = await fetch(API_ENDPOINT);
    if (response.ok) {
      return await response.json();
    }
    // Fallback to localStorage
    return getFromLocalStorage();
  } catch (error) {
    // Fallback to localStorage
    return getFromLocalStorage();
  }
}
```

---

## 📈 Performance Considerations

### Indexing Strategy (In-Memory)

```javascript
// Create lookup maps for O(1) access
const productMap = new Map(products.map(p => [p.id, p]));
const userMap = new Map(users.map(u => [u.id, u]));

// Quick lookups
const product = productMap.get(productId);
const user = userMap.get(userId);
```

### Query Optimization

```javascript
// Filter in memory (products array typically < 1000 items)
const lowStockProducts = products.filter(p => p.stock <= p.minStock);

// Sort for reports
const sortedSales = sales.sort((a, b) => b.timestamp - a.timestamp);

// Aggregate calculations
const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
```

### Data Limits

- Products: ~1000 items (localStorage limit ~5MB)
- Sales: ~10,000 transactions (rotation recommended)
- Movements: ~50,000 records (rotation recommended)

---

## 🔄 Future Enhancements (Planned ERD Extensions)

### Upcoming Tables

**SUPPLIERS**

- Track product suppliers
- Purchase order management
- Supplier contact information

**CUSTOMERS**

- Customer loyalty program
- Customer purchase history
- Contact information

**MULTI_STORE**

- Store/branch management
- Consolidated reporting

**PROMOTIONS**

- Discount campaigns
- Bundle pricing
- Time-based promotions

**PURCHASE_ORDERS**

- Stock ordering workflow
- Supplier integration
- Receiving management

---

## 📝 Notes

### Data Integrity Guarantees

✅ **Guaranteed:**

- No orphaned records (parent exists for all child records)
- Audit trail completeness (all stock changes logged)
- Historical accuracy (names stored at time of transaction)
- Transaction atomicity (sale + stock update + movements happen together)

✅ **Validation:**

- Stock cannot go negative
- All prices must be positive
- All quantities must be positive
- Receipt numbers are unique
- Barcodes are unique

### Performance Characteristics

- **Read operations:** O(n) for filters, O(1) with Maps
- **Write operations:** O(1) for appends, O(n) for updates
- **Storage:** ~5MB localStorage limit
- **Scalability:** Suitable for single-store operations (< 1000 products)

### System Design Philosophy

- **Resilience:** Works offline with localStorage fallback
- **Simplicity:** Flat data structures, no complex joins
- **Auditability:** Complete history via inventory_movements
- **Maintainability:** Clear separation of concerns
- **Scalability:** Ready for backend migration when needed

---

**Document Version:** 2.0  
**Last Updated:** December 5, 2024  
**System Owner:** Alok Dixit  
**Developers:** Erica Monacillo, Jars Christian Lerio