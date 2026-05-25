# POS System - Backend Integration Documentation

## Overview

Your POS system is now fully connected to Supabase backend with the following features:

### ✅ Implemented Features

1. **User Authentication**
   - Sign up with role selection (Admin/Cashier)
   - Login with username and password
   - Session management with JWT tokens
   - Automatic session restoration on page reload

2. **Product Management**
   - Create new products (Admin only)
   - Update existing products (Admin only)
   - Real-time inventory updates
   - Persistent storage in Supabase KV store

3. **Sales Transactions**
   - Process sales with automatic receipt generation
   - Automatic inventory deduction
   - Payment processing (Cash, GCash, E-Wallet)
   - Transaction history viewable by both Admin and Cashier

4. **Data Persistence**
   - All data stored in Supabase
   - Real-time synchronization
   - Automatic demo data initialization

## Backend Architecture

```
Frontend (React) 
    ↓
API Client (/utils/api.ts)
    ↓
Supabase Edge Function (/supabase/functions/server/index.tsx)
    ↓
Supabase KV Store (Database)
```

## API Endpoints

### Authentication

- **POST** `/make-server-6f1f8962/auth/signup`
  - Sign up a new user
  - Body: `{ username, email, password, role, name }`

- **POST** `/make-server-6f1f8962/auth/login`
  - Login and get access token
  - Body: `{ username, password }`

- **GET** `/make-server-6f1f8962/auth/verify`
  - Verify current session
  - Headers: `Authorization: Bearer {accessToken}`

### Products

- **GET** `/make-server-6f1f8962/products`
  - Get all products

- **POST** `/make-server-6f1f8962/products`
  - Create new product (Admin only)
  - Body: Product data

- **PUT** `/make-server-6f1f8962/products/:id`
  - Update product (Admin only)
  - Body: Updated fields

### Sales

- **GET** `/make-server-6f1f8962/sales`
  - Get all sales (requires auth)

- **POST** `/make-server-6f1f8962/sales`
  - Create new sale (requires auth)
  - Body: Sale data
  - Automatically updates inventory

## Data Storage Structure

The system uses Supabase KV store with the following key patterns:

- `user:{username}` → User data by username
- `user:id:{userId}` → User data by Supabase user ID
- `product:{productId}` → Product data
- `sale:{saleId}` → Sale/transaction data

## Demo Accounts

The system automatically creates these accounts on first load:

### Admin Account
- **Username**: admin
- **Password**: admin123
- **Email**: admin@pos.com
- **Name**: Erica Monacillo

### Cashier Account
- **Username**: cashier
- **Password**: cashier123
- **Email**: cashier@pos.com
- **Name**: Jars Christian Lerio

## Features by Role

### Admin Role
- ✅ Full dashboard with overview stats
- ✅ Create/Edit products
- ✅ Manage inventory
- ✅ View all sales and transactions
- ✅ Generate reports (daily, weekly, monthly)
- ✅ Process sales at POS

### Cashier Role
- ✅ Process sales at POS
- ✅ View all transaction history
- ✅ View product catalog
- ✅ Limited to own permissions

## Testing the Backend Connection

1. **Check Connection Status**
   - Green indicator on login page = Connected
   - Red indicator = Connection issue
   - Backend status widget appears in bottom-right corner

2. **Test Workflow**
   ```
   1. Login with demo credentials
   2. Add a product (Admin) → Should persist after refresh
   3. Process a sale → Should update inventory
   4. Logout and login again → Data should be preserved
   5. Check transaction history → Sales should be listed
   ```

## Key Files

### Frontend
- `/App.tsx` - Main application with state management
- `/utils/api.ts` - API client for backend communication
- `/utils/supabase/info.tsx` - Supabase credentials
- `/components/BackendStatus.tsx` - Connection status indicator

### Backend
- `/supabase/functions/server/index.tsx` - Main server with all API routes
- `/supabase/functions/server/kv_store.tsx` - KV store utilities (protected)

## Security Notes

✅ **Implemented**:
- JWT token-based authentication
- Role-based access control
- Protected admin routes
- Secure password handling via Supabase Auth
- Auto-confirmed emails (for development)

⚠️ **For Production**:
- Set up email confirmation server
- Add rate limiting
- Implement HTTPS only
- Add input validation
- Enable audit logs
- Add data backup strategy

## Troubleshooting

### "Backend connection failed"
- Check if Supabase project is active
- Verify API keys in `/utils/supabase/info.tsx`
- Check browser console for error messages

### "Unauthorized" errors
- Clear localStorage and login again
- Check if access token is valid
- Verify user role permissions

### Data not persisting
- Check backend logs in Supabase dashboard
- Verify KV store operations
- Check network tab for failed requests

## Next Steps

### Recommended Enhancements
1. ✅ Add loading states (implemented)
2. ✅ Error handling (implemented)
3. Add offline support
4. Implement data export
5. Add receipt printing
6. Set up backup/restore
7. Add analytics dashboard
8. Implement barcode scanning

### Production Checklist
- [ ] Set up custom domain
- [ ] Configure email server
- [ ] Add SSL certificate
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Document API properly
- [ ] Add rate limiting
- [ ] Security audit

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify API endpoint responses
4. Test with demo accounts first

---

**Status**: ✅ Fully functional and connected to Supabase
**Last Updated**: November 29, 2025
**Owner**: Alok Dixit
