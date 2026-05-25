# USE CASE DIAGRAM - POS System
## Alok Dixit's POSCart System
### Complete Use Case Analysis and Diagram

---

## 📊 Visual Use Case Diagram

```
                                    POS SYSTEM
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐                │
│  │   Authentication     │         │   Product Management │                │
│  │──────────────────────│         │──────────────────────│                │
│  │ • Login              │         │ • Add Product        │                │
│  │ • Logout             │         │ • Edit Product       │                │
│  │ • Verify Session     │         │ • Delete Product     │                │
│  └──────────────────────┘         │ • View Products      │                │
│                                   │ • Search Products    │                │
│                                   │ • Filter by Category │                │
│  ┌──────────────────────┐         │ • Manage Categories  │                │
│  │   Sales Processing   │         └──────────────────────┘                │
│  │──────────────────────│                                                  │
│  │ • Scan/Add to Cart   │         ┌──────────────────────┐                │
│  │ • Remove from Cart   │         │ Inventory Management │                │
│  │ • Apply Discount     │         │──────────────────────│                │
│  │ • Process Payment    │         │ • View Stock Levels  │                │
│  │ • Generate Receipt   │         │ • Adjust Stock       │                │
│  │ • Print Receipt      │         │ • View Movements     │                │
│  └──────────────────────┘         │ • Low Stock Alerts   │                │
│                                   │ • Stock History      │                │
│  ┌──────────────────────┐         └──────────────────────┘                │
│  │   Reports & Analytics│                                                  │
│  │──────────────────────│         ┌──────────────────────┐                │
│  │ • Daily Sales Report │         │   User Management    │                │
│  │ • Weekly Sales Report│         │──────────────────────│                │
│  │ • Monthly Sales      │         │ • View Users         │                │
│  │ • Inventory Summary  │         │ • Add User           │                │
│  │ • Low Stock Report   │         │ • Edit User          │                │
│  │ • Sales by Category  │         │ • Deactivate User    │                │
│  │ • Sales by Cashier   │         │ • Manage Roles       │                │
│  └──────────────────────┘         └──────────────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

        ┌─────────┐                              ┌─────────┐
        │  ADMIN  │                              │ CASHIER │
        │ (Erica) │                              │ (Jars)  │
        └────┬────┘                              └────┬────┘
             │                                        │
             │  All Use Cases                         │  Limited Use Cases
             │  (Full Access)                         │  (POS Operations)
             │                                        │
             └────────────────┬───────────────────────┘
                              │
                              │
                    ┌─────────▼─────────┐
                    │   POS SYSTEM      │
                    └───────────────────┘
                              │
                              │
                    ┌─────────▼─────────┐
                    │  Payment Gateway  │
                    │  (GCash, PayMaya) │
                    └───────────────────┘
```

---

## 🎭 Actors

### 1. **Admin** (Primary Actor)
- **Description:** System administrator with full access
- **Example User:** Erica Monacillo
- **Responsibilities:**
  - Manage products and inventory
  - Manage users and permissions
  - View all reports and analytics
  - Configure system settings
  - Oversee all operations
  - Perform manual stock adjustments

### 2. **Cashier** (Primary Actor)
- **Description:** Front-line user who processes sales
- **Example User:** Jars Christian Lerio
- **Responsibilities:**
  - Process customer transactions
  - Scan/add products to cart
  - Accept payments
  - Generate receipts
  - View own sales
  - Check product availability

### 3. **System** (Secondary Actor)
- **Description:** Automated system processes
- **Responsibilities:**
  - Auto-update stock levels
  - Create inventory movements
  - Generate receipt numbers
  - Trigger low stock alerts
  - Validate transactions
  - Maintain data integrity

### 4. **Payment Gateway** (External Actor)
- **Description:** Third-party payment processors
- **Examples:** GCash, PayMaya, Bank APIs
- **Responsibilities:**
  - Process electronic payments
  - Validate payment transactions
  - Return payment confirmation
  - Handle payment failures

---

## 📋 Complete Use Case List

### A. Authentication Use Cases

#### UC-A01: Login
- **Actor:** Admin, Cashier
- **Description:** User logs into the system
- **Preconditions:** User has valid credentials
- **Postconditions:** User session is created
- **Normal Flow:**
  1. User enters username/email and password
  2. System validates credentials
  3. System creates session token
  4. System redirects to appropriate dashboard
- **Alternative Flows:**
  - 2a. Invalid credentials → Show error message
  - 2b. Inactive account → Show error message
- **Includes:** Verify Session

#### UC-A02: Logout
- **Actor:** Admin, Cashier
- **Description:** User logs out of the system
- **Preconditions:** User is logged in
- **Postconditions:** Session is terminated
- **Normal Flow:**
  1. User clicks logout button
  2. System clears session data
  3. System redirects to login page
- **Alternative Flows:** None

#### UC-A03: Verify Session
- **Actor:** System
- **Description:** System verifies user session validity
- **Preconditions:** Session token exists
- **Postconditions:** Session validated or invalidated
- **Normal Flow:**
  1. System checks session token
  2. System validates token expiry
  3. System loads user data
- **Alternative Flows:**
  - 2a. Invalid/expired token → Redirect to login

---

### B. Sales Processing Use Cases

#### UC-B01: Process Sale Transaction
- **Actor:** Cashier, Admin
- **Description:** Complete a customer sale transaction
- **Preconditions:** 
  - User is authenticated
  - Cart has at least one item
  - Sufficient stock available
- **Postconditions:** 
  - Sale recorded
  - Stock updated
  - Receipt generated
  - Inventory movements created
- **Normal Flow:**
  1. Cashier scans/adds products to cart
  2. System displays product details and updates cart
  3. Cashier confirms cart items
  4. System calculates total
  5. Cashier selects payment method
  6. System processes payment
  7. System updates stock levels
  8. System creates inventory movements
  9. System generates receipt
  10. System displays receipt
- **Alternative Flows:**
  - 2a. Product not found → Show error
  - 2b. Insufficient stock → Show warning
  - 6a. Payment failed → Cancel transaction
  - 6b. Partial payment → Request remaining amount
- **Includes:** 
  - Update Stock
  - Create Inventory Movement
  - Generate Receipt
- **Extends:** 
  - Apply Discount (optional)

#### UC-B02: Scan/Add Product to Cart
- **Actor:** Cashier, Admin
- **Description:** Add a product to the shopping cart
- **Preconditions:** Product exists in catalog
- **Postconditions:** Product added to cart
- **Normal Flow:**
  1. User scans barcode or searches product
  2. System finds product by barcode/name
  3. System checks stock availability
  4. System adds product to cart
  5. System updates cart total
- **Alternative Flows:**
  - 2a. Product not found → Show error
  - 3a. Out of stock → Show warning, prevent add

#### UC-B03: Remove Product from Cart
- **Actor:** Cashier, Admin
- **Description:** Remove a product from the shopping cart
- **Preconditions:** Product exists in cart
- **Postconditions:** Product removed from cart
- **Normal Flow:**
  1. User clicks remove button on cart item
  2. System removes item from cart
  3. System recalculates cart total
- **Alternative Flows:** None

#### UC-B04: Apply Discount
- **Actor:** Cashier, Admin
- **Description:** Apply a discount to the sale
- **Preconditions:** Cart has items
- **Postconditions:** Discount applied to total
- **Normal Flow:**
  1. User enters discount amount or percentage
  2. System validates discount
  3. System applies discount to total
  4. System displays discounted amount
- **Alternative Flows:**
  - 2a. Invalid discount → Show error

#### UC-B05: Process Payment
- **Actor:** Cashier, Admin, Payment Gateway
- **Description:** Accept payment for the sale
- **Preconditions:** 
  - Cart has items
  - Total calculated
- **Postconditions:** Payment confirmed
- **Normal Flow:**
  1. User selects payment method (Cash, GCash, etc.)
  2. User enters payment amount
  3. For cash: System calculates change
  4. For e-wallet: System connects to payment gateway
  5. Payment gateway processes payment
  6. Payment gateway returns confirmation
  7. System records payment
- **Alternative Flows:**
  - 5a. Payment gateway unavailable → Fallback to cash
  - 6a. Payment failed → Request alternative payment
  - 6b. Insufficient payment → Request additional amount

#### UC-B06: Generate Receipt
- **Actor:** System
- **Description:** Create a receipt for the sale
- **Preconditions:** Sale completed
- **Postconditions:** Receipt generated with unique number
- **Normal Flow:**
  1. System generates unique receipt number
  2. System compiles sale details (items, prices, total)
  3. System adds timestamp and cashier info
  4. System formats receipt
  5. System displays receipt
- **Alternative Flows:** None

#### UC-B07: Print Receipt
- **Actor:** Cashier, Admin
- **Description:** Print physical receipt
- **Preconditions:** Receipt generated
- **Postconditions:** Receipt printed
- **Normal Flow:**
  1. User clicks print button
  2. System sends receipt to printer
  3. Receipt prints
- **Alternative Flows:**
  - 2a. Printer unavailable → Show error, allow retry

---

### C. Product Management Use Cases

#### UC-C01: Add Product
- **Actor:** Admin
- **Description:** Add a new product to the catalog
- **Preconditions:** 
  - User has admin role
  - Category exists
- **Postconditions:** 
  - Product created
  - Initial inventory movement recorded
- **Normal Flow:**
  1. Admin clicks "Add Product"
  2. System displays product form
  3. Admin enters product details (name, category, price, stock, barcode)
  4. Admin submits form
  5. System validates data
  6. System generates product ID
  7. System saves product
  8. System creates initial inventory movement
  9. System shows success message
- **Alternative Flows:**
  - 5a. Invalid data → Show validation errors
  - 5b. Duplicate barcode → Show error
- **Includes:** Create Inventory Movement

#### UC-C02: Edit Product
- **Actor:** Admin
- **Description:** Update existing product details
- **Preconditions:** 
  - User has admin role
  - Product exists
- **Postconditions:** Product updated
- **Normal Flow:**
  1. Admin selects product to edit
  2. System displays product form with current data
  3. Admin modifies product details
  4. Admin submits form
  5. System validates data
  6. System updates product
  7. System shows success message
- **Alternative Flows:**
  - 5a. Invalid data → Show validation errors
  - 5b. Duplicate barcode → Show error

#### UC-C03: Delete Product
- **Actor:** Admin
- **Description:** Remove a product from the catalog
- **Preconditions:** 
  - User has admin role
  - Product exists
- **Postconditions:** Product deleted
- **Normal Flow:**
  1. Admin selects product to delete
  2. System shows confirmation dialog
  3. Admin confirms deletion
  4. System deletes product
  5. System shows success message
- **Alternative Flows:**
  - 3a. Admin cancels → Return to product list

#### UC-C04: View Products
- **Actor:** Admin, Cashier
- **Description:** View list of all products
- **Preconditions:** User is authenticated
- **Postconditions:** Products displayed
- **Normal Flow:**
  1. User navigates to inventory/products
  2. System retrieves all products
  3. System displays products in table/grid
  4. System shows stock levels and prices
- **Alternative Flows:**
  - 2a. No products → Show empty state

#### UC-C05: Search Products
- **Actor:** Admin, Cashier
- **Description:** Search for products by name/barcode/category
- **Preconditions:** User is authenticated
- **Postconditions:** Matching products displayed
- **Normal Flow:**
  1. User enters search term
  2. System searches products by name, barcode, category
  3. System displays matching products
- **Alternative Flows:**
  - 3a. No matches → Show "no results" message

#### UC-C06: Filter Products by Category
- **Actor:** Admin, Cashier
- **Description:** Filter products by category
- **Preconditions:** 
  - User is authenticated
  - Categories exist
- **Postconditions:** Filtered products displayed
- **Normal Flow:**
  1. User selects category from filter
  2. System filters products by selected category
  3. System displays filtered products
- **Alternative Flows:**
  - 2a. No products in category → Show empty state

#### UC-C07: Manage Categories
- **Actor:** Admin
- **Description:** Add, edit, or delete product categories
- **Preconditions:** User has admin role
- **Postconditions:** Categories updated
- **Normal Flow:**
  1. Admin opens category management
  2. Admin adds/edits/deletes category
  3. System updates category list
  4. System shows success message
- **Alternative Flows:**
  - 2a. Delete category with products → Show error

---

### D. Inventory Management Use Cases

#### UC-D01: View Stock Levels
- **Actor:** Admin, Cashier
- **Description:** View current stock levels for all products
- **Preconditions:** User is authenticated
- **Postconditions:** Stock levels displayed
- **Normal Flow:**
  1. User navigates to inventory
  2. System retrieves all products
  3. System displays stock levels with status indicators
  4. System highlights low stock items
- **Alternative Flows:** None

#### UC-D02: Adjust Stock Manually
- **Actor:** Admin
- **Description:** Manually adjust product stock levels
- **Preconditions:** 
  - User has admin role
  - Product exists
- **Postconditions:** 
  - Stock updated
  - Inventory movement recorded
- **Normal Flow:**
  1. Admin selects product to adjust
  2. System displays adjustment form
  3. Admin enters quantity change (+/-)
  4. Admin enters reason and notes
  5. Admin submits form
  6. System validates adjustment
  7. System updates product stock
  8. System creates inventory movement record
  9. System shows success message
- **Alternative Flows:**
  - 6a. Invalid adjustment (stock < 0) → Show error
- **Includes:** Create Inventory Movement

#### UC-D03: View Inventory Movements
- **Actor:** Admin
- **Description:** View history of all stock changes
- **Preconditions:** User has admin role
- **Postconditions:** Movements displayed
- **Normal Flow:**
  1. Admin navigates to inventory movements
  2. System retrieves all movements
  3. System displays movements with filters
  4. Admin can filter by product, type, date, user
- **Alternative Flows:** None

#### UC-D04: View Low Stock Alerts
- **Actor:** Admin, Cashier
- **Description:** View products with low stock
- **Preconditions:** User is authenticated
- **Postconditions:** Low stock products displayed
- **Normal Flow:**
  1. System automatically checks stock levels
  2. System identifies products where stock <= minStock
  3. System displays low stock alerts
  4. User can view details and take action
- **Alternative Flows:**
  - 2a. No low stock items → Show success message

#### UC-D05: View Stock History
- **Actor:** Admin
- **Description:** View stock change history for a specific product
- **Preconditions:** 
  - User has admin role
  - Product exists
- **Postconditions:** History displayed
- **Normal Flow:**
  1. Admin selects product
  2. Admin clicks "View History"
  3. System retrieves all movements for product
  4. System displays chronological history
- **Alternative Flows:** None

#### UC-D06: Update Stock (System)
- **Actor:** System
- **Description:** Automatically update stock after sale
- **Preconditions:** Sale completed
- **Postconditions:** Stock updated
- **Normal Flow:**
  1. Sale is completed
  2. System deducts sold quantities from stock
  3. System validates stock levels
  4. System updates product records
- **Alternative Flows:**
  - 3a. Stock cannot go negative → Rollback transaction

#### UC-D07: Create Inventory Movement
- **Actor:** System
- **Description:** Record stock change in audit trail
- **Preconditions:** Stock change occurred
- **Postconditions:** Movement recorded
- **Normal Flow:**
  1. Stock change occurs (sale, adjustment, etc.)
  2. System creates movement record
  3. System records: product, user, type, quantity, reason
  4. System saves movement to database
- **Alternative Flows:** None

---

### E. Reports & Analytics Use Cases

#### UC-E01: View Daily Sales Report
- **Actor:** Admin
- **Description:** View sales report for current day
- **Preconditions:** User has admin role
- **Postconditions:** Report displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Daily Sales"
  3. System filters sales for current day
  4. System calculates totals and metrics
  5. System displays report with charts
- **Alternative Flows:**
  - 3a. No sales today → Show zero state

#### UC-E02: View Weekly Sales Report
- **Actor:** Admin
- **Description:** View sales report for current week
- **Preconditions:** User has admin role
- **Postconditions:** Report displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Weekly Sales"
  3. System filters sales for current week
  4. System calculates totals and trends
  5. System displays report with charts
- **Alternative Flows:** None

#### UC-E03: View Monthly Sales Report
- **Actor:** Admin
- **Description:** View sales report for current month
- **Preconditions:** User has admin role
- **Postconditions:** Report displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Monthly Sales"
  3. System filters sales for current month
  4. System calculates totals and comparisons
  5. System displays report with charts
- **Alternative Flows:** None

#### UC-E04: View Inventory Summary
- **Actor:** Admin
- **Description:** View summary of inventory status
- **Preconditions:** User has admin role
- **Postconditions:** Summary displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Inventory Summary"
  3. System calculates total stock, value, low stock count
  4. System displays summary with metrics
- **Alternative Flows:** None

#### UC-E05: View Low Stock Report
- **Actor:** Admin
- **Description:** View report of products with low stock
- **Preconditions:** User has admin role
- **Postconditions:** Report displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Low Stock Report"
  3. System filters products where stock <= minStock
  4. System displays report with recommendations
- **Alternative Flows:**
  - 3a. No low stock → Show success message

#### UC-E06: View Sales by Category
- **Actor:** Admin
- **Description:** View sales breakdown by product category
- **Preconditions:** User has admin role
- **Postconditions:** Report displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Sales by Category"
  3. System groups sales by product category
  4. System calculates totals per category
  5. System displays report with pie chart
- **Alternative Flows:** None

#### UC-E07: View Sales by Cashier
- **Actor:** Admin
- **Description:** View sales breakdown by cashier
- **Preconditions:** User has admin role
- **Postconditions:** Report displayed
- **Normal Flow:**
  1. Admin navigates to reports
  2. Admin selects "Sales by Cashier"
  3. System groups sales by cashier
  4. System calculates totals per cashier
  5. System displays report with comparison
- **Alternative Flows:** None

#### UC-E08: Export Report
- **Actor:** Admin
- **Description:** Export report data to file
- **Preconditions:** 
  - User has admin role
  - Report is displayed
- **Postconditions:** Report exported
- **Normal Flow:**
  1. Admin views report
  2. Admin clicks "Export"
  3. Admin selects format (PDF, CSV, Excel)
  4. System generates file
  5. System downloads file
- **Alternative Flows:**
  - 4a. Export failed → Show error

---

### F. User Management Use Cases

#### UC-F01: View Users
- **Actor:** Admin
- **Description:** View list of all users
- **Preconditions:** User has admin role
- **Postconditions:** Users displayed
- **Normal Flow:**
  1. Admin navigates to user management
  2. System retrieves all users
  3. System displays users with roles and status
- **Alternative Flows:** None

#### UC-F02: Add User
- **Actor:** Admin
- **Description:** Create a new user account
- **Preconditions:** User has admin role
- **Postconditions:** New user created
- **Normal Flow:**
  1. Admin clicks "Add User"
  2. System displays user form
  3. Admin enters user details (username, email, password, role)
  4. Admin submits form
  5. System validates data
  6. System creates user account
  7. System shows success message
- **Alternative Flows:**
  - 5a. Invalid data → Show validation errors
  - 5b. Duplicate username/email → Show error

#### UC-F03: Edit User
- **Actor:** Admin
- **Description:** Update existing user details
- **Preconditions:** 
  - User has admin role
  - Target user exists
- **Postconditions:** User updated
- **Normal Flow:**
  1. Admin selects user to edit
  2. System displays user form with current data
  3. Admin modifies user details
  4. Admin submits form
  5. System validates data
  6. System updates user
  7. System shows success message
- **Alternative Flows:**
  - 5a. Invalid data → Show validation errors

#### UC-F04: Deactivate User
- **Actor:** Admin
- **Description:** Deactivate a user account
- **Preconditions:** 
  - User has admin role
  - Target user exists and is active
- **Postconditions:** User deactivated
- **Normal Flow:**
  1. Admin selects user to deactivate
  2. System shows confirmation dialog
  3. Admin confirms deactivation
  4. System deactivates user
  5. System shows success message
- **Alternative Flows:**
  - 3a. Admin cancels → Return to user list

#### UC-F05: Manage Roles
- **Actor:** Admin
- **Description:** Assign or change user roles
- **Preconditions:** User has admin role
- **Postconditions:** User role updated
- **Normal Flow:**
  1. Admin selects user
  2. Admin changes role (admin/cashier)
  3. System updates user role
  4. System shows success message
- **Alternative Flows:** None

---

### G. Dashboard Use Cases

#### UC-G01: View Dashboard
- **Actor:** Admin, Cashier
- **Description:** View system dashboard with key metrics
- **Preconditions:** User is authenticated
- **Postconditions:** Dashboard displayed
- **Normal Flow:**
  1. User logs in
  2. System calculates key metrics
  3. System displays dashboard with:
     - Sales summary (today, week, month)
     - Recent transactions
     - Low stock alerts
     - Quick actions
- **Alternative Flows:** None

#### UC-G02: View Quick Stats
- **Actor:** Admin
- **Description:** View real-time statistics
- **Preconditions:** User has admin role
- **Postconditions:** Stats displayed
- **Normal Flow:**
  1. Admin views dashboard
  2. System calculates:
     - Total revenue (today/week/month)
     - Transaction count
     - Products sold
     - Low stock count
  3. System displays stats with trends
- **Alternative Flows:** None

---

## 🔗 Use Case Relationships

### «include» Relationships
- **Process Sale Transaction** includes:
  - Update Stock
  - Create Inventory Movement
  - Generate Receipt
- **Add Product** includes:
  - Create Inventory Movement
- **Adjust Stock Manually** includes:
  - Create Inventory Movement

### «extend» Relationships
- **Apply Discount** extends **Process Sale Transaction** (optional)
- **Print Receipt** extends **Generate Receipt** (optional)

### Generalization Relationships
- **Admin** and **Cashier** are both specializations of **User**
- **View Daily/Weekly/Monthly Sales Report** are specializations of **View Sales Report**

---

## 📊 Use Case Priority Matrix

| Priority | Use Case | Actor | Criticality |
|----------|----------|-------|-------------|
| **P0 (Critical)** | Login | Admin, Cashier | System access |
| **P0 (Critical)** | Process Sale Transaction | Cashier | Core business function |
| **P0 (Critical)** | Update Stock | System | Data integrity |
| **P0 (Critical)** | Generate Receipt | System | Legal requirement |
| **P1 (High)** | Add Product | Admin | Inventory management |
| **P1 (High)** | View Products | Admin, Cashier | Daily operations |
| **P1 (High)** | View Stock Levels | Admin, Cashier | Stock monitoring |
| **P1 (High)** | Process Payment | Cashier | Transaction completion |
| **P2 (Medium)** | View Daily Sales Report | Admin | Business insights |
| **P2 (Medium)** | Adjust Stock Manually | Admin | Inventory corrections |
| **P2 (Medium)** | View Low Stock Alerts | Admin | Reordering |
| **P2 (Medium)** | Manage Categories | Admin | Organization |
| **P3 (Low)** | View Inventory Movements | Admin | Audit trail |
| **P3 (Low)** | Export Report | Admin | Documentation |
| **P3 (Low)** | View Sales by Category | Admin | Analytics |
| **P3 (Low)** | Manage Users | Admin | Administration |

---

## 🎯 Use Case Scenarios (Detailed Examples)

### Scenario 1: Customer Purchases 2 Items (Cash Payment)

**Actors:** Cashier (Jars), Customer, System

**Flow:**
1. **Cashier** scans Rice 25kg barcode
   - **System** finds product, shows ₹1,250.00
   - **System** adds to cart, displays quantity: 1
2. **Cashier** scans Cooking Oil 1L barcode
   - **System** finds product, shows ₹180.00
   - **System** adds to cart, displays quantity: 1
3. **Cashier** reviews cart:
   - Rice 25kg × 1 = ₹1,250.00
   - Cooking Oil 1L × 1 = ₹180.00
   - **Total: ₹1,430.00**
4. **Cashier** selects payment method: Cash
5. **Customer** pays ₹1,500.00
6. **Cashier** enters cash received: ₹1,500.00
7. **System** calculates change: ₹70.00
8. **System** processes sale:
   - Deducts 1 from Rice 25kg stock (50 → 49)
   - Deducts 1 from Cooking Oil 1L stock (30 → 29)
   - Creates inventory movements (2 records)
   - Generates receipt: RCP-1733414400000
9. **System** displays receipt with all details
10. **Cashier** gives change and receipt to **Customer**

**Result:**
- ✅ Sale recorded
- ✅ Stock updated
- ✅ Receipt generated
- ✅ Audit trail created

---

### Scenario 2: Admin Adjusts Stock After Physical Count

**Actors:** Admin (Erica), System

**Flow:**
1. **Admin** performs physical inventory count
2. **Admin** finds only 25 units of Sugar (system shows 28)
3. **Admin** navigates to Inventory Management
4. **Admin** selects "Sugar 1kg" product
5. **Admin** clicks "Adjust Stock"
6. **System** displays adjustment form with current stock: 28
7. **Admin** enters:
   - Quantity change: -3
   - Reason: "Physical count correction"
   - Notes: "Found discrepancy during inventory check"
8. **Admin** submits form
9. **System** validates:
   - New stock: 28 + (-3) = 25 ✓
   - Stock not negative ✓
10. **System** updates Sugar stock: 28 → 25
11. **System** creates inventory movement:
    - Type: adjustment
    - Quantity: -3
    - Before: 28
    - After: 25
    - User: Erica Monacillo
12. **System** shows success message
13. **Admin** verifies new stock level: 25

**Result:**
- ✅ Stock corrected
- ✅ Discrepancy resolved
- ✅ Audit trail documented

---

### Scenario 3: Cashier Views Own Sales (Daily Report)

**Actors:** Cashier (Jars), System

**Flow:**
1. **Cashier** logs in
2. **System** displays dashboard
3. **Cashier** sees summary:
   - Sales Today: ₹12,450.00 (8 transactions)
4. **Cashier** clicks "View My Sales"
5. **System** filters sales where cashierId = "cashier-001"
6. **System** displays list:
   - RCP-1733414400000 | 14:30 | ₹1,430.00 | Cash
   - RCP-1733415600000 | 15:00 | ₹2,340.00 | GCash
   - ... (8 total)
7. **Cashier** clicks on receipt RCP-1733414400000
8. **System** displays full receipt details:
   - Items purchased
   - Payment method
   - Timestamp
   - Total
9. **Cashier** reviews transaction
10. **Cashier** closes detail view

**Result:**
- ✅ Cashier can view own performance
- ✅ Transaction history accessible
- ✅ Receipt details available

---

### Scenario 4: Admin Generates Monthly Sales Report

**Actors:** Admin (Erica), System

**Flow:**
1. **Admin** navigates to Reports section
2. **Admin** selects "Monthly Sales Report"
3. **System** retrieves all sales for current month (December 2024)
4. **System** calculates:
   - Total Revenue: ₹245,680.00
   - Transaction Count: 156 sales
   - Average Sale: ₹1,575.00
   - Top Product: Rice 25kg (45 units sold)
   - Top Category: Groceries (₹98,450.00)
5. **System** generates charts:
   - Daily sales trend (line chart)
   - Sales by category (pie chart)
   - Sales by payment method (bar chart)
6. **System** displays report
7. **Admin** reviews metrics
8. **Admin** clicks "Export to PDF"
9. **System** generates PDF file
10. **System** downloads "Monthly_Sales_Report_Dec2024.pdf"

**Result:**
- ✅ Business insights generated
- ✅ Performance measured
- ✅ Report exported for records

---

### Scenario 5: System Triggers Low Stock Alert

**Actors:** System, Admin (Erica)

**Flow:**
1. **Customer** purchases 3 units of Instant Noodles
2. **System** processes sale
3. **System** updates Instant Noodles stock: 12 → 9
4. **System** checks: 9 <= minStock (10) ✓
5. **System** creates low stock alert
6. **Admin** logs in next morning
7. **System** displays dashboard with:
   - ⚠️ 3 Low Stock Items
   - Red badge on Inventory menu
8. **Admin** clicks "View Low Stock Items"
9. **System** displays:
   - Instant Noodles | Stock: 9 | Min: 10 | Status: LOW
   - Sugar 1kg | Stock: 6 | Min: 10 | Status: LOW
   - Coffee 3-in-1 | Stock: 8 | Min: 10 | Status: LOW
10. **Admin** notes products to reorder
11. **Admin** plans purchase order

**Result:**
- ✅ Low stock detected automatically
- ✅ Admin alerted proactively
- ✅ Reordering can be planned

---

## 📐 Use Case Dependencies

```
Login (Required for all)
  │
  ├─→ View Dashboard
  │     │
  │     ├─→ View Quick Stats
  │     └─→ View Recent Sales
  │
  ├─→ Process Sale Transaction
  │     │
  │     ├─→ Scan/Add Product
  │     ├─→ Remove from Cart
  │     ├─→ Apply Discount (optional)
  │     ├─→ Process Payment
  │     │     └─→ Payment Gateway (external)
  │     ├─→ Generate Receipt
  │     │     └─→ Print Receipt (optional)
  │     ├─→ Update Stock (automatic)
  │     └─→ Create Inventory Movement (automatic)
  │
  ├─→ Inventory Management (Admin only)
  │     │
  │     ├─→ Add Product
  │     │     └─→ Create Inventory Movement
  │     ├─→ Edit Product
  │     ├─→ Delete Product
  │     ├─→ Adjust Stock
  │     │     └─→ Create Inventory Movement
  │     ├─→ View Stock Levels
  │     ├─→ View Movements
  │     └─→ View Low Stock Alerts
  │
  ├─→ Reports & Analytics (Admin only)
  │     │
  │     ├─→ Daily Sales Report
  │     ├─→ Weekly Sales Report
  │     ├─→ Monthly Sales Report
  │     ├─→ Inventory Summary
  │     ├─→ Low Stock Report
  │     ├─→ Sales by Category
  │     ├─→ Sales by Cashier
  │     └─→ Export Report (optional)
  │
  └─→ User Management (Admin only)
        │
        ├─→ View Users
        ├─→ Add User
        ├─→ Edit User
        ├─→ Deactivate User
        └─→ Manage Roles
```

---

## 🔐 Access Control Matrix

| Use Case | Admin | Cashier | System | Payment Gateway |
|----------|-------|---------|--------|-----------------|
| Login | ✓ | ✓ | - | - |
| Logout | ✓ | ✓ | - | - |
| Process Sale | ✓ | ✓ | ✓ | ✓ |
| Add/Edit/Delete Product | ✓ | - | - | - |
| View Products | ✓ | ✓ | - | - |
| Search Products | ✓ | ✓ | - | - |
| View Stock Levels | ✓ | ✓ | - | - |
| Adjust Stock | ✓ | - | ✓ | - |
| View Inventory Movements | ✓ | - | - | - |
| View All Sales | ✓ | - | - | - |
| View Own Sales | ✓ | ✓ | - | - |
| Generate Reports | ✓ | - | - | - |
| Export Reports | ✓ | - | - | - |
| Manage Users | ✓ | - | - | - |
| View Dashboard | ✓ | ✓ | - | - |
| Process Payment | ✓ | ✓ | ✓ | ✓ |
| Generate Receipt | ✓ | ✓ | ✓ | - |
| Low Stock Alerts | ✓ | ✓ | ✓ | - |

**Legend:**
- ✓ = Has access
- - = No access

---

## 🎨 Use Case State Diagram: Process Sale Transaction

```
                    [START]
                       │
                       ▼
              ┌─────────────────┐
              │   Empty Cart    │
              └────────┬─────────┘
                       │
                       │ Scan/Add Product
                       ▼
              ┌─────────────────┐
              │  Building Cart  │◄────┐
              └────────┬─────────┘     │
                       │               │
                       ├───────────────┘ Add More Products
                       │
                       │ Complete Cart
                       ▼
              ┌─────────────────┐
              │  Calculating    │
              │     Total       │
              └────────┬─────────┘
                       │
                       │
                       ▼
              ┌─────────────────┐
              │ Select Payment  │
              │     Method      │
              └────────┬─────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
            ▼          ▼          ▼
        [Cash]    [GCash]    [Card]
            │          │          │
            │          ▼          │
            │   ┌──────────────┐ │
            │   │Payment Gateway│ │
            │   │  Processing  │ │
            │   └──────┬───────┘ │
            │          │          │
            │     ┌────┴────┐    │
            │     ▼         ▼    │
            │ [Success] [Failed] │
            │     │         │    │
            │     │         └────┼─→ [RETRY/CANCEL]
            │     │              │
            └─────┴──────────────┘
                       │
                       ▼ Payment Confirmed
              ┌─────────────────┐
              │  Update Stock   │
              └────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │Create Inventory │
              │   Movements     │
              └────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │Generate Receipt │
              └────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │Display Receipt  │
              └────────┬─────────┘
                       │
                       ▼
                  [SUCCESS]
                       │
                   [RESET]
```

---

## 📊 Performance Requirements per Use Case

| Use Case | Response Time | Availability | Accuracy |
|----------|--------------|--------------|----------|
| Login | < 2s | 99.9% | 100% |
| Process Sale | < 3s | 99.9% | 100% |
| Update Stock | < 1s | 100% | 100% |
| Generate Receipt | < 2s | 99.9% | 100% |
| Search Products | < 500ms | 99.5% | 95% |
| View Dashboard | < 2s | 99% | 100% |
| Generate Reports | < 5s | 99% | 100% |
| Adjust Stock | < 2s | 99.9% | 100% |
| Payment Processing | < 10s | 95% | 100% |
| Print Receipt | < 5s | 95% | 100% |

---

## 🚀 Future Use Cases (Planned)

### Phase 2 Enhancements:
1. **Customer Loyalty Program**
   - Register Customer
   - Award Points
   - Redeem Points
   - View Customer History

2. **Multi-Store Management**
   - View All Stores
   - Consolidated Reports
   - Store Performance Analytics

3. **Offline Mode**
   - Sync Data When Online
   - Queue Transactions Offline
   - Conflict Resolution

4. **Advanced Reporting**
   - Profit/Loss Analysis
   - Trend Forecasting
   - Supplier Performance
   - Custom Report Builder

5. **Purchase Order Management**
   - Create Purchase Order
   - Approve Purchase Order
   - Receive Stock
   - Manage Suppliers

---

## 📝 Notes

### Use Case Documentation Standards:
- Each use case follows a standard template
- Preconditions clearly defined
- Normal and alternative flows documented
- Includes/extends relationships specified
- Access control clearly stated

### System Design Considerations:
- **Offline-First:** Most use cases work without backend
- **Real-Time Updates:** Stock and sales update immediately
- **Audit Trail:** All critical actions logged
- **Error Handling:** Alternative flows for failures
- **Security:** Role-based access control enforced

### Business Rules Embedded in Use Cases:
- Stock cannot go negative
- All transactions must have audit trail
- Receipt numbers are unique
- Cashiers can only view own sales
- Only admins can modify inventory
- All monetary calculations are in PHP (₹)

---

**Document Version:** 1.0  
**Created:** December 5, 2024  
**System Owner:** Alok Dixit  
**Developers:** Erica Monacillo, Jars Christian Lerio  
**Based on:** COMPLETE_ERD_DIAGRAM.md v2.0