# 🧾 KiraCart POS System

KiraCart is a modern, standalone **Desktop Point-of-Sale (POS) Application**. 
It is built for performance and elegant UI, utilizing **React + Vite** for the frontend, styled with **Tailwind CSS**, and packaged as a native desktop application using **Electron**.

---

## ✨ Key Features
- **Standalone Desktop App**: Runs natively via Electron for offline-ready POS environments.
- **Supabase Backend Integration**: Real-time cloud database syncing for products, categories, and sales.
- **Role-Based Access**: Specialized interfaces for **Admins** (Dashboard, Inventory, Reports) and **Cashiers** (Transactions, Receipts).
- **Dynamic Receipt Generation**: Clean, printable transaction receipts with dedicated print styles.
- **Modern UI/UX**: Designed with smooth gradients, glassmorphism, and responsive layouts.

## 🚀 Tech Stack
- **Frontend Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons), Radix UI (Headless components)
- **Backend & Database**: Supabase (PostgreSQL)
- **Desktop Bundler**: Electron

---

## 🛠️ Installation & Setup

### Prerequisites
Before running the app, ensure you have installed:
- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/erica-monacillo/kiracart.git
cd kiracart
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
You will need to set up your Supabase connection. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running the Application

**Run in Web Browser (Development Mode):**
```bash
npm run dev
```

**Run as a Desktop App (Electron):**
*(Make sure to build or run your electron start script depending on package.json configuration)*
```bash
npm run electron:start
```

---

## 👨‍💻 Contributing & Development
- **Main Branch**: `main`
- Ensure all Tailwind classes are cleanly formatted.
- Avoid modifying core POS UI structures without testing the `@media print` layout for the receipt modal.

---
*Powered by KiraCart System*
