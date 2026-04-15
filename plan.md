# Plan: Load Inventory from Database

## Status: APPROVED ✅

## Description
The Inventory page (`/inventory`) currently displays mock data hardcoded in the component. The backend already has a fully functional Products API with database integration, but the frontend isn't using it. This plan will connect the Inventory page to the real database via the existing `productService`.

## Steps

### 1. Update Inventory Page (`frontend/src/pages/Inventory.tsx`)
**Changes:**
- Replace mock data `useEffect` with real API call using `productService.list()`
- Import `useQuery` from `@tanstack/react-query` for data fetching (already used in Products page)
- Add error handling and loading states
- Map `Product` type to `InventoryItem` type:
  - Use `stock_quantity` for `currentStock`
  - Calculate `status` based on stock levels
  - Generate default values for missing fields (sku, minStock, maxStock, etc.)
- Update stats calculation to use real data

**Lines to modify:** 56-145 (mock data and loading logic)

### 2. Update InventoryItem Interface (`frontend/src/pages/Inventory.tsx`)
**Changes:**
- Make missing fields optional (sku, minStock, maxStock, reorderPoint, supplier, lastRestocked)
- Add helper function to calculate status from stock_quantity

**Lines to modify:** 15-29 (interface definition)

### 3. Update Frontend ai_index
**Files to update:**
- `frontend/agent/ai_index/symbols.json` — Update Inventory component description to note database integration
- `frontend/agent/ai_index/summaries.json` — Update Inventory.tsx summary to reflect real data connection

**Symbols to modify:**
- `Inventory` component — Update description and note database integration via productService

## ai_index Update Checklist
- [ ] Update `frontend/agent/ai_index/symbols.json` - Inventory component description
- [ ] Update `frontend/agent/ai_index/summaries.json` - Inventory.tsx file summary

## Open Questions (Resolved)
- **Missing Inventory Fields**: Using Option A — Use current Product model fields only, calculate status from stock_quantity, use placeholder values for missing fields
- **Inventory vs Products**: Keeping as separate views (Inventory = stock-focused, Products = catalog-focused)

## Complexity
**Medium** - Frontend-only changes with data mapping, no backend modifications required

## Files to Modify
1. `frontend/src/pages/Inventory.tsx` — Main changes (API integration + data mapping)
2. `frontend/agent/ai_index/symbols.json` — Update Inventory component documentation
3. `frontend/agent/ai_index/summaries.json` — Update file summary
