# 📝 KiraCart System Guidelines

This file outlines the core development rules, tech stack constraints, and UI/UX guidelines for maintaining and expanding the **KiraCart POS System**.

---

## 1. Tech Stack Constraints
* **Framework**: React (v18+) with TypeScript.
* **Build Tool**: Vite.
* **Styling**: Tailwind CSS is mandatory. Avoid writing custom CSS in `index.css` unless it's for global resets or specific browser overrides (e.g., `@media print` for receipts).
* **Database/Backend**: Supabase. All database calls should go through the API layer (`src/api/`). Do not write raw Supabase queries directly inside React components.
* **Desktop Wrapper**: Electron. Ensure all features are tested not just in the web browser, but also inside the standalone Electron environment.

## 2. General Architecture Rules
* **API Layer Separation**: All backend interactions must be defined in `src/api/` (e.g., `products.ts`, `categories.ts`).
* **Component Modularity**: Keep UI components small. Break large files (like `AdminDashboard.tsx` or `CashierInterface.tsx`) into sub-components if they exceed ~300 lines.
* **State Management**: Use React Hooks (`useState`, `useMemo`, `useEffect`). Pass state down as props for tightly coupled features.

## 3. UI/UX Design System
* **Brand Colors**: 
  * Primary Green: `#4A7C3A`
  * Secondary Light Green: `#5B8A47`, `#7BA568`
  * Background Gradients: `#FAFBF8` to `#F5F9F2`
* **Icons**: Strictly use `lucide-react` for all UI icons to maintain consistency.
* **Typography**: Maintain readable sizes. Use muted text (`text-gray-500` or `#5B7A4A`) for subtitles and stark colors for primary numbers (like total revenue).
* **Components**: Utilize the custom `src/components/ui/` components (built on Radix UI) for all interactive elements (Tabs, Dialogs, Cards).

## 4. Hardware & Printing Guidelines
* **Receipt Modal**: The `ReceiptModal.tsx` contains highly sensitive layout code. Any changes to this file must guarantee that the `window.print()` functionality is undisturbed. 
* **Print CSS**: The receipt relies on a dedicated `@media print` block to hide the dashboard UI and disable scrollbars physically so that 80mm thermal printers or standard paper printers format the receipt perfectly.

## 5. Deployment & Version Control
* **Repository**: `https://github.com/erica-monacillo/kiracart`
* **Commits**: Before pushing to the repository, verify that no `.env` keys containing sensitive live production data are staged.
