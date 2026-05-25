# POS System Database Structure (ERD Tables)

This document outlines all the database tables/entities used in the POS system backend with Supabase.

---

## Overview

The POS system uses **6 core tables** plus **2 junction tables** for a fully normalized relational database design:

1. **USERS** - User accounts and authentication
2. **CATEGORIES** - Product categories
3. **PRODUCTS** - Product catalog
4. **INVENTORY_MOVEMENTS** - Stock tracking and audit trail
5. **SALES** - Sales transactions
6. **SALE_ITEMS** - Items in each sale (junction table)
7. **PAYMENT_TRANSACTIONS** - Payment details for sales
8. **SESSIONS** - User login sessions (managed by Supabase Auth)

---

## 1. **USERS Table**

Stores user accounts with authentication and role information.

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string (UUID) | PRIMARY KEY | Unique identifier (from Supabase Auth) |
| **username** | string | UNIQUE, NOT NULL | Login username |
| **email** | string | UNIQUE, NOT NULL | User's email address |
| **password** | string (hashed) | NOT NULL | Encrypted password (handled by Supabase Auth) |
| **role** | enum | NOT NULL | Either 'admin' or 'cashier' |
| **name** | string | NOT NULL | Display name of the user |
| **isActive** | boolean | NOT NULL, DEFAULT true | Account status |
| **createdAt** | timestamp | NOT NULL | Account creation date |
| **updatedAt** | timestamp | NULLABLE | Last update timestamp |

### Storage Keys:
- `user:{username}` - Lookup by username
- `user:id:{id}` - Lookup by user ID

### Demo Data:
- **Admin User**: username: `admin`, password: `admin123`, name: `Erica Monacillo`
- **Cashier User**: username: `cashier`, password: `cashier123`, name: `Jars Christian Lerio`

### Access Control:
- **Admin**: Full access to all features (products, sales, reports, user management)
- **Cashier**: Limited to POS transactions and viewing their own sales

---

## 2. **CATEGORIES Table**

Stores product categories for organization and reporting.

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string | PRIMARY KEY | Unique category identifier |
| **name** | string | UNIQUE, NOT NULL | Category name (e.g., "Groceries", "Beverages") |
| **description** | string | NULLABLE | Category description |
| **isActive** | boolean | NOT NULL, DEFAULT true | Whether category is active |
| **createdAt** | timestamp | NOT NULL | Category creation date |
| **updatedAt** | timestamp | NULLABLE | Last update timestamp |

### Storage Keys:
- `category:{id}` - Individual category lookup
- `category:name:{name}` - Lookup by category name

### Demo Categories:
- Groceries
- Beverages
- Food
- Personal Care
- Household Items

### Business Logic:
- Categories cannot be deleted if products are assigned to them
- Only admins can create/update/deactivate categories
- Used for filtering products and generating category-wise reports

---

## 3. **PRODUCTS Table**

Stores product catalog information.

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string | PRIMARY KEY | Unique product identifier |
| **categoryId** | string | FOREIGN KEY → Categories.id | Product category |
| **name** | string | NOT NULL | Product name/title |
| **description** | string | NULLABLE | Product description |
| **price** | number (decimal) | NOT NULL, > 0 | Selling price in PHP |
| **cost** | number (decimal) | NULLABLE, >= 0 | Cost price (for profit calculation) |
| **currentStock** | number (integer) | NOT NULL, >= 0 | Current stock quantity (computed from inventory movements) |
| **barcode** | string | UNIQUE, NULLABLE | Product barcode for scanning |
| **sku** | string | UNIQUE, NULLABLE | Stock Keeping Unit code |
| **minStock** | number (integer) | NOT NULL, DEFAULT 10 | Minimum stock threshold for low stock alerts |
| **maxStock** | number (integer) | NULLABLE | Maximum stock level |
| **unit** | string | NOT NULL, DEFAULT "pcs" | Unit of measurement (pcs, kg, liter, pack, etc.) |
| **isActive** | boolean | NOT NULL, DEFAULT true | Whether product is available for sale |
| **createdAt** | timestamp | NOT NULL | Product creation date |
| **updatedAt** | timestamp | NULLABLE | Last update timestamp |

### Storage Keys:
- `product:{id}` - Individual product lookup
- `product:barcode:{barcode}` - Lookup by barcode
- `product:sku:{sku}` - Lookup by SKU

### Demo Products:
1. Rice 25kg - ₹1,250 (Groceries)
2. Cooking Oil 1L - ₹180 (Groceries)
3. Sugar 1kg - ₹65 (Groceries)
4. Coffee 3-in-1 Pack - ₹120 (Beverages)
5. Instant Noodles Pack - ₹85 (Food)

### Business Logic:
- `currentStock` is calculated/updated based on INVENTORY_MOVEMENTS
- Low stock alerts trigger when `currentStock <= minStock`
- Only admins can create/update products
- Products cannot be deleted, only deactivated

---

## 4. **INVENTORY_MOVEMENTS Table**

Tracks all stock changes with full audit trail.

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string | PRIMARY KEY | Unique movement identifier |
| **productId** | string | FOREIGN KEY → Products.id, NOT NULL | Product being moved |
| **movementType** | enum | NOT NULL | Type: 'initial', 'purchase', 'sale', 'adjustment', 'return', 'damage' |
| **quantity** | number (integer) | NOT NULL | Quantity changed (positive or negative) |
| **quantityBefore** | number (integer) | NOT NULL | Stock level before movement |
| **quantityAfter** | number (integer) | NOT NULL | Stock level after movement |
| **referenceType** | string | NULLABLE | Reference type: 'sale', 'purchase_order', 'manual' |
| **referenceId** | string | NULLABLE | ID of related record (e.g., saleId) |
| **reason** | string | NULLABLE | Reason for adjustment/damage |
| **notes** | string | NULLABLE | Additional notes |
| **userId** | string | FOREIGN KEY → Users.id, NOT NULL | User who performed the movement |
| **timestamp** | timestamp | NOT NULL | When the movement occurred |

### Storage Keys:
- `inventory_movement:{id}` - Individual movement lookup
- `inventory_movement:product:{productId}` - All movements for a product

### Movement Types:
- **initial**: Initial stock entry when product is created
- **purchase**: Stock received from supplier
- **sale**: Stock sold to customer (negative quantity)
- **adjustment**: Manual stock adjustment (counting, corrections)
- **return**: Customer return (positive quantity)
- **damage**: Damaged/expired goods removed (negative quantity)

### Business Logic:
- Every stock change creates an inventory movement record
- Provides complete audit trail for stock discrepancies
- `Products.currentStock` = SUM of all inventory movements for that product
- Negative quantities for outgoing stock (sales, damage)
- Positive quantities for incoming stock (purchases, returns)

---

## 5. **SALES Table**

Stores completed sales transactions (header information).

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string | PRIMARY KEY | Unique sale identifier |
| **receiptNumber** | string | UNIQUE, NOT NULL | Unique receipt number (format: `RCP-{timestamp}`) |
| **cashierId** | string | FOREIGN KEY → Users.id, NOT NULL | ID of the cashier who processed the sale |
| **cashierName** | string | NOT NULL | Name of the cashier (denormalized for performance) |
| **subtotal** | number (decimal) | NOT NULL, >= 0 | Sum of all item subtotals |
| **tax** | number (decimal) | NOT NULL, DEFAULT 0 | Tax amount (if applicable) |
| **discount** | number (decimal) | NOT NULL, DEFAULT 0 | Discount amount |
| **total** | number (decimal) | NOT NULL, > 0 | Final total: subtotal + tax - discount |
| **status** | enum | NOT NULL, DEFAULT 'completed' | Status: 'pending', 'completed', 'cancelled', 'refunded' |
| **timestamp** | timestamp | NOT NULL | When the sale was completed |
| **createdAt** | timestamp | NOT NULL | Record creation date |
| **updatedAt** | timestamp | NULLABLE | Last update timestamp |

### Storage Keys:
- `sale:{id}` - Individual sale lookup
- `sale:receipt:{receiptNumber}` - Lookup by receipt number

### Business Logic:
- Receipt number is auto-generated on creation
- Sale creation triggers inventory movements for each item
- Sales can be voided/refunded (status change)
- Requires authentication (cashier or admin role)
- Total = sum of all SALE_ITEMS subtotals

---

## 6. **SALE_ITEMS Table** (Junction Table)

Stores individual items within each sale.

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string | PRIMARY KEY | Unique sale item identifier |
| **saleId** | string | FOREIGN KEY → Sales.id, NOT NULL | Parent sale transaction |
| **productId** | string | FOREIGN KEY → Products.id, NOT NULL | Product sold |
| **productName** | string | NOT NULL | Product name at time of sale (snapshot) |
| **productSku** | string | NULLABLE | Product SKU at time of sale |
| **quantity** | number (integer) | NOT NULL, > 0 | Quantity sold |
| **unitPrice** | number (decimal) | NOT NULL, > 0 | Unit price at time of sale |
| **subtotal** | number (decimal) | NOT NULL, > 0 | Calculated: quantity × unitPrice |
| **discount** | number (decimal) | NOT NULL, DEFAULT 0 | Item-level discount |
| **createdAt** | timestamp | NOT NULL | Record creation date |

### Storage Keys:
- `sale_item:{id}` - Individual item lookup
- `sale_item:sale:{saleId}` - All items for a sale

### Business Logic:
- Each item creates a corresponding inventory movement (type: 'sale')
- Stores snapshot of product data at time of sale (price may change later)
- Subtotal = (unitPrice × quantity) - discount
- Cannot be modified after sale is completed

---

## 7. **PAYMENT_TRANSACTIONS Table**

Stores payment details for each sale (supports split payments).

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string | PRIMARY KEY | Unique payment transaction identifier |
| **saleId** | string | FOREIGN KEY → Sales.id, NOT NULL | Related sale |
| **paymentMethod** | enum | NOT NULL | Method: 'cash', 'gcash', 'paymaya', 'card', 'bank_transfer' |
| **amount** | number (decimal) | NOT NULL, > 0 | Amount paid via this method |
| **referenceNumber** | string | NULLABLE | Payment reference/transaction ID (for e-wallets, cards) |
| **provider** | string | NULLABLE | Payment provider (e.g., "GCash", "Visa", "Mastercard") |
| **status** | enum | NOT NULL, DEFAULT 'completed' | Status: 'pending', 'completed', 'failed', 'refunded' |
| **cashReceived** | number (decimal) | NULLABLE | Cash received (for cash payments) |
| **changeGiven** | number (decimal) | NULLABLE | Change given (for cash payments) |
| **timestamp** | timestamp | NOT NULL | When payment was processed |
| **createdAt** | timestamp | NOT NULL | Record creation date |

### Storage Keys:
- `payment_transaction:{id}` - Individual payment lookup
- `payment_transaction:sale:{saleId}` - All payments for a sale
- `payment_transaction:reference:{referenceNumber}` - Lookup by reference

### Payment Methods:
- **cash**: Physical cash payment
- **gcash**: GCash e-wallet
- **paymaya**: PayMaya e-wallet
- **card**: Credit/debit card payment
- **bank_transfer**: Bank transfer

### Business Logic:
- Supports split payments (one sale can have multiple payment transactions)
- Sum of payment amounts must equal sale total
- E-wallet and card payments require referenceNumber
- Cash payments record cashReceived and changeGiven
- Failed payments do not complete the sale

---

## 8. **SESSIONS Table** (Managed by Supabase Auth)

Stores active user sessions for authentication.

### Fields:
| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **id** | string (UUID) | PRIMARY KEY | Unique session identifier |
| **userId** | string | FOREIGN KEY → Users.id, NOT NULL | User who owns the session |
| **accessToken** | string (JWT) | UNIQUE, NOT NULL | JWT access token |
| **refreshToken** | string | UNIQUE, NOT NULL | JWT refresh token |
| **expiresAt** | timestamp | NOT NULL | Token expiration time |
| **createdAt** | timestamp | NOT NULL | Session start time |

### Business Logic:
- Managed automatically by Supabase Auth
- Tokens expire after configured time (default: 1 hour)
- Refresh tokens used to get new access tokens
- Sessions are invalidated on logout

---

## Entity Relationships Diagram

```
                    ┌─────────────┐
                    │   USERS     │
                    └──────┬──────┘
                           │
                    ┌──────┴──────────────────────┐
                    │                              │
             ┌──────▼──────┐              ┌───────▼────────┐
             │    SALES    │              │   INVENTORY_   │
             │             │              │   MOVEMENTS    │
             └──────┬──────┘              └───────┬────────┘
                    │                              │
         ┌──────────┼──────────┐                  │
         │          │          │                  │
  ┌──────▼──────┐  │   ┌──────▼──────────┐       │
  │ SALE_ITEMS  │  │   │   PAYMENT_      │       │
  │             │  │   │   TRANSACTIONS  │       │
  └──────┬──────┘  │   └─────────────────┘       │
         │         │                              │
         │         │         ┌────────────────────┘
         │         │         │
      ┌──▼─────────▼─────────▼──┐
      │      PRODUCTS           │
      └──────┬──────────────────┘
             │
      ┌──────▼──────┐
      │ CATEGORIES  │
      └─────────────┘
```

### Relationship Details:

1. **CATEGORIES → PRODUCTS** (One-to-Many)
   - One category contains many products
   - Foreign Key: `Products.categoryId` references `Categories.id`
   - Cascade: Category cannot be deleted if products exist

2. **USERS → SALES** (One-to-Many)
   - One user (cashier) can process many sales
   - Foreign Key: `Sales.cashierId` references `Users.id`
   - Cascade: User cannot be deleted if sales exist

3. **SALES → SALE_ITEMS** (One-to-Many)
   - One sale contains many items
   - Foreign Key: `SaleItems.saleId` references `Sales.id`
   - Cascade: Deleting sale deletes all sale items

4. **PRODUCTS → SALE_ITEMS** (One-to-Many)
   - One product can appear in many sale items
   - Foreign Key: `SaleItems.productId` references `Products.id`
   - Cascade: Product cannot be deleted if used in sales

5. **SALES → PAYMENT_TRANSACTIONS** (One-to-Many)
   - One sale can have multiple payment transactions (split payment)
   - Foreign Key: `PaymentTransactions.saleId` references `Sales.id`
   - Cascade: Deleting sale deletes payment transactions

6. **USERS → INVENTORY_MOVEMENTS** (One-to-Many)
   - One user can create many inventory movements
   - Foreign Key: `InventoryMovements.userId` references `Users.id`
   - Cascade: User cannot be deleted if inventory movements exist

7. **PRODUCTS → INVENTORY_MOVEMENTS** (One-to-Many)
   - One product has many inventory movements
   - Foreign Key: `InventoryMovements.productId` references `Products.id`
   - Cascade: Product cannot be deleted if movements exist

8. **SALES → INVENTORY_MOVEMENTS** (One-to-Many, Optional)
   - One sale creates multiple inventory movements (one per item)
   - Soft relationship via `referenceId` + `referenceType`
   - No direct foreign key constraint

---

## Current Implementation vs. Proposed Structure

### ⚠️ Current Implementation:
The current backend uses a **simplified structure**:
- Products table with embedded category string
- Sales table with embedded items array
- No separate inventory tracking
- Payment method stored as string in Sale

### ✅ Proposed Structure (Above):
The document above shows the **recommended normalized structure** for a production POS system:
- Separate CATEGORIES table
- Separate SALE_ITEMS junction table
- Separate INVENTORY_MOVEMENTS tracking table
- Separate PAYMENT_TRANSACTIONS table

---

## Additional Backend Components

### 1. **Supabase Auth Users**
- Managed by Supabase Auth service
- Stores encrypted passwords and session tokens
- User metadata includes: username, role, name
- Provides JWT tokens for API authentication

### 2. **KV Store (Key-Value Store)**
- Used for fast data storage and retrieval
- Prefixes used:
  - `user:` - User data by username
  - `user:id:` - User data by ID
  - `category:` - Category data
  - `product:` - Product data
  - `product:barcode:` - Product lookup by barcode
  - `sale:` - Sales data
  - `sale_item:` - Sale items data
  - `payment_transaction:` - Payment data
  - `inventory_movement:` - Inventory movement data

---

## API Endpoints Summary

### Authentication Endpoints:
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/verify` - Verify JWT token
- `POST /auth/logout` - Invalidate session

### Category Endpoints:
- `GET /categories` - Get all categories (public)
- `POST /categories` - Create category (admin only)
- `PUT /categories/:id` - Update category (admin only)
- `DELETE /categories/:id` - Deactivate category (admin only)

### Product Endpoints:
- `GET /products` - Get all products (public)
- `GET /products/:id` - Get product by ID
- `GET /products/barcode/:barcode` - Get product by barcode
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Deactivate product (admin only)

### Inventory Endpoints:
- `GET /inventory/movements` - Get all inventory movements (admin only)
- `GET /inventory/movements/product/:productId` - Get movements for a product
- `POST /inventory/movements` - Create inventory movement (admin only)
- `GET /inventory/alerts` - Get low stock alerts

### Sales Endpoints:
- `GET /sales` - Get all sales (authenticated)
- `GET /sales/:id` - Get sale by ID
- `GET /sales/receipt/:receiptNumber` - Get sale by receipt number
- `POST /sales` - Create new sale (authenticated, auto-updates stock)
- `PUT /sales/:id/status` - Update sale status (admin only, for refunds/cancellations)

### Payment Endpoints:
- `GET /payments/sale/:saleId` - Get payments for a sale
- `POST /payments` - Create payment transaction
- `PUT /payments/:id/status` - Update payment status

### Report Endpoints:
- `GET /reports/sales/daily` - Daily sales report
- `GET /reports/sales/weekly` - Weekly sales report
- `GET /reports/sales/monthly` - Monthly sales report
- `GET /reports/inventory/summary` - Inventory summary
- `GET /reports/inventory/low-stock` - Low stock report
- `GET /reports/sales/by-category` - Sales by category
- `GET /reports/sales/by-cashier` - Sales by cashier

### System Endpoints:
- `POST /initialize` - Initialize demo data
- `GET /health` - Health check

---

## Data Flow Example: Processing a Sale

### Step-by-Step Process:

1. **Cashier scans/selects products** 
   - Frontend: User selects products and builds cart
   - Each item added shows current stock availability

2. **Calculate totals**
   - Frontend: Calculates subtotal, tax, discount, and total
   - Validates sufficient stock for each item

3. **Payment processing**
   - Frontend: Cashier selects payment method(s)
   - For e-wallets/cards: System may integrate with payment gateway

4. **Create sale transaction**
   - Request: `POST /sales` with items, total, payment info
   - Backend validates authentication and authorization

5. **Database operations (Transaction)**
   ```
   BEGIN TRANSACTION
   
   a. Create SALE record
      - Generate receipt number
      - Store sale header (total, cashier, timestamp)
      - Status = 'completed'
   
   b. Create SALE_ITEMS records
      - For each item in cart
      - Store product snapshot (price, name at time of sale)
   
   c. Create PAYMENT_TRANSACTION record(s)
      - Store payment method, amount, reference
      - For split payments: create multiple records
   
   d. Create INVENTORY_MOVEMENTS records
      - For each item sold
      - movementType = 'sale'
      - quantity = negative (outgoing stock)
      - referenceType = 'sale', referenceId = sale.id
   
   e. Update PRODUCTS stock
      - For each product: currentStock -= quantity sold
      - Trigger low stock alerts if necessary
   
   COMMIT TRANSACTION
   ```

6. **Receipt generation**
   - Backend returns sale data with receipt number
   - Frontend displays receipt modal
   - Option to print or email receipt

7. **Post-sale actions**
   - Update dashboard statistics
   - Refresh product stock levels in UI
   - Log transaction in audit trail

---

## Indexes for Performance

### Recommended Database Indexes:

#### USERS Table:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`
- UNIQUE INDEX on `email`

#### CATEGORIES Table:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`
- INDEX on `isActive`

#### PRODUCTS Table:
- PRIMARY KEY on `id`
- INDEX on `categoryId` (foreign key)
- UNIQUE INDEX on `barcode`
- UNIQUE INDEX on `sku`
- INDEX on `isActive`
- COMPOSITE INDEX on `(categoryId, isActive)` for category filtering

#### INVENTORY_MOVEMENTS Table:
- PRIMARY KEY on `id`
- INDEX on `productId` (foreign key, frequently queried)
- INDEX on `userId` (foreign key)
- INDEX on `timestamp` (for date range queries)
- INDEX on `movementType` (for filtering by type)
- COMPOSITE INDEX on `(productId, timestamp)` for product history

#### SALES Table:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `receiptNumber`
- INDEX on `cashierId` (foreign key)
- INDEX on `timestamp` (for date range queries)
- INDEX on `status` (for filtering)
- COMPOSITE INDEX on `(timestamp, status)` for reports

#### SALE_ITEMS Table:
- PRIMARY KEY on `id`
- INDEX on `saleId` (foreign key, frequently joined)
- INDEX on `productId` (foreign key, for product sales analysis)

#### PAYMENT_TRANSACTIONS Table:
- PRIMARY KEY on `id`
- INDEX on `saleId` (foreign key)
- INDEX on `referenceNumber` (for payment lookup)
- INDEX on `paymentMethod` (for payment method reports)
- INDEX on `timestamp` (for date range queries)

---

## Security Considerations

### Authentication & Authorization:
- JWT tokens required for authenticated endpoints
- Tokens stored in localStorage on client (consider httpOnly cookies for production)
- Role-based access control (admin vs cashier)
- Password hashing with bcrypt (handled by Supabase Auth)

### Data Validation:
- Stock levels checked before sale completion
- Price validation to prevent negative values
- Quantity validation to prevent overselling
- Username/email uniqueness enforced at database level
- Payment amount validation (must equal sale total)

### Audit Trail:
- All inventory movements logged with userId
- Sale modifications tracked (status changes)
- User actions logged for accountability
- Timestamps on all records for forensics

### Error Handling:
- Graceful degradation if backend is unavailable
- Transaction rollback if any step fails
- Clear error messages for user feedback
- Retry logic for network failures

### Data Privacy:
- User passwords never exposed in API responses
- Sensitive payment data (card numbers) not stored
- Only necessary user data returned in API responses

---

## Migration Path: Current → Proposed Structure

To migrate from the current simplified structure to the proposed normalized structure:

### Phase 1: Add new tables
1. Create CATEGORIES table and migrate existing category strings
2. Create SALE_ITEMS table and migrate embedded items from SALES
3. Create PAYMENT_TRANSACTIONS table and migrate payment info from SALES
4. Create INVENTORY_MOVEMENTS table and initialize with current stock

### Phase 2: Update relationships
1. Add categoryId foreign key to PRODUCTS
2. Update PRODUCTS to reference CATEGORIES
3. Update SALES to remove embedded items array
4. Update SALES to remove payment method field

### Phase 3: Update API endpoints
1. Modify product endpoints to use categoryId
2. Modify sales endpoints to create SALE_ITEMS records
3. Add inventory movement endpoints
4. Add payment transaction endpoints

### Phase 4: Update frontend
1. Update product forms to use category dropdown
2. Update sales processing to handle separate tables
3. Add inventory movement UI
4. Add payment transaction UI

### Phase 5: Data validation
1. Verify all existing sales migrated correctly
2. Verify inventory movements match current stock
3. Verify payment transactions sum to sale totals
4. Run data integrity checks

---

## Future Enhancements

Based on your project requirements, these additional tables may be needed:

### **LOYALTY_CUSTOMERS Table**
- `id`, `name`, `phone`, `email`, `points`, `tier`, `joinedAt`, `lastVisit`

### **LOYALTY_TRANSACTIONS Table**
- `id`, `customerId`, `saleId`, `pointsEarned`, `pointsRedeemed`, `timestamp`

### **STORES Table** (Multi-store feature)
- `id`, `name`, `address`, `city`, `province`, `phone`, `managerId`, `isActive`

### **SUPPLIERS Table**
- `id`, `name`, `contactPerson`, `phone`, `email`, `address`, `isActive`

### **PURCHASE_ORDERS Table**
- `id`, `supplierId`, `orderNumber`, `orderDate`, `expectedDate`, `receivedDate`, `status`, `total`

### **PURCHASE_ORDER_ITEMS Table**
- `id`, `purchaseOrderId`, `productId`, `quantity`, `costPrice`, `subtotal`

### **DISCOUNTS Table**
- `id`, `name`, `type` (percentage/fixed), `value`, `startDate`, `endDate`, `isActive`

### **PRODUCT_DISCOUNTS Table** (junction)
- `id`, `productId`, `discountId`

### **AUDIT_LOGS Table**
- `id`, `userId`, `action`, `tableName`, `recordId`, `oldValue`, `newValue`, `timestamp`

### **SHIFT_SESSIONS Table**
- `id`, `userId`, `startTime`, `endTime`, `openingCash`, `closingCash`, `totalSales`, `status`

---

## Technologies Used

- **Backend Framework**: Deno + Hono (lightweight, modern web framework)
- **Database**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Storage**: KV Store (key-value storage for fast lookups)
- **Authentication**: Supabase Auth (JWT-based, session management)
- **API Style**: RESTful JSON API
- **Real-time**: Supabase Real-time (for live updates)

---

## Performance Considerations

### Query Optimization:
- Use indexes on frequently queried columns
- Avoid N+1 queries with proper joins
- Implement pagination for large result sets
- Cache frequently accessed data (categories, products)

### Stock Updates:
- Use database transactions for sale processing
- Implement optimistic locking to prevent overselling
- Queue inventory movements for batch processing if needed

### Reporting:
- Pre-calculate aggregates for dashboard metrics
- Use materialized views for complex reports
- Implement report caching with TTL

### Scalability:
- Database connection pooling
- Horizontal scaling for read replicas
- CDN for static assets
- Rate limiting on API endpoints

---

## Backup & Recovery

### Backup Strategy:
- Automated daily backups (Supabase automatic backups)
- Point-in-time recovery capability
- Transaction log backups
- Off-site backup storage

### Recovery Procedures:
- Database restore from backup
- Transaction replay from logs
- Data integrity validation after restore
- Disaster recovery plan documented

---

## Compliance & Standards

### Philippines Requirements:
- BIR (Bureau of Internal Revenue) compliance
- VAT calculation and reporting
- Official receipt requirements
- Sales transaction reporting

### Data Retention:
- Sales records: 7 years (BIR requirement)
- User data: As per Privacy Act
- Audit logs: Minimum 3 years
- Inventory records: 5 years

---

## Notes

- All monetary values are stored in **Philippine Pesos (PHP)** as decimal numbers
- Timestamps are stored in **ISO 8601 format** with timezone
- The system uses **denormalization** where appropriate for performance (e.g., cashierName in SALES)
- **Soft deletes** preferred over hard deletes (using isActive flag)
- **Immutable records**: Sales and inventory movements cannot be modified after creation
- **Audit trail** maintained for all critical operations
- Real-time inventory updates ensure stock accuracy
- The system is designed for **offline mode capability** with local storage sync (future enhancement)