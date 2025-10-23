# 🎯 Zustand Selector Patterns Guide

## Table of Contents
1. [Why Use Selectors](#why-use-selectors)
2. [Basic Patterns](#basic-patterns)
3. [Advanced Patterns](#advanced-patterns)
4. [Real Examples](#real-examples)
5. [Common Mistakes](#common-mistakes)
6. [Performance Tips](#performance-tips)

---

## Why Use Selectors?

### The Problem

```typescript
// ❌ BAD: Subscribes to ENTIRE store
const store = useOrderStore();
// Component re-renders when ANY field in store changes:
// - orders, selectedOrder, draftOrder, draftItems, 
// - isLoading, error, statusValues, etc. (20+ fields)
```

**Result**: Component re-renders **10-15 times** unnecessarily when only 1 field is actually used.

### The Solution

```typescript
// ✅ GOOD: Selective subscription
const orders = useOrderStore(state => state.orders);
// Component ONLY re-renders when orders array changes
```

**Result**: Component re-renders **1-2 times** only when needed. **70-80% reduction**.

---

## Basic Patterns

### Pattern 1: Single Field Selection

**Use case**: Component only needs one field from store.

```typescript
function OrderCount() {
  // Only re-render when orders array changes
  const orders = useOrderStore(state => state.orders);
  
  return <div>Total: {orders.length}</div>;
}
```

### Pattern 2: Multiple Fields with Shallow Compare

**Use case**: Component needs 2-3 related fields.

```typescript
import { shallowEqual } from '@/hooks/useStoreSelector';

function OrderList() {
  // Only re-render when items OR isLoading changes
  const { items, isLoading } = useOrderStore(
    state => ({ 
      items: state.orders, 
      isLoading: state.isLoading 
    }),
    shallowEqual
  );
  
  if (isLoading) return <Spinner />;
  return <Table data={items} />;
}
```

### Pattern 3: Actions Only (Never Re-renders)

**Use case**: Component only needs actions, not state.

```typescript
function CreateOrderButton() {
  // This NEVER re-renders because actions are stable
  const createOrder = useOrderStore(state => state.createOrder);
  
  return <button onClick={() => createOrder(data)}>Create</button>;
}
```

### Pattern 4: Computed/Derived State

**Use case**: Component needs calculated value from store.

```typescript
function TotalRevenue() {
  // Only re-render when computed value changes
  const totalRevenue = useOrderStore(
    state => state.orders.reduce((sum, o) => sum + o.total, 0)
  );
  
  return <div>${totalRevenue}</div>;
}
```

---

## Advanced Patterns

### Pattern 5: Using Predefined Selectors

**Setup** (in store file):
```typescript
// src/features/orders/store/useOrderStore.ts
import { createCRUDStoreSelectors } from '@/store/crud.store.factory';

export const useOrderStore = create<OrderStore>()(...);

// Export predefined selectors
export const orderSelectors = createCRUDStoreSelectors(useOrderStore);
```

**Usage** (in component):
```typescript
import { orderSelectors } from '@/features/orders/store/useOrderStore';

function OrderList() {
  // Use predefined selectors
  const items = orderSelectors.useItems();
  const { isLoading, error } = orderSelectors.useDataState();
  const actions = orderSelectors.useActions(); // Never re-renders!
  
  return (
    <>
      {isLoading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      <Table data={items} onDelete={actions.deleteItem} />
    </>
  );
}
```

### Pattern 6: Filtered/Searched Lists

**Use case**: Component shows filtered subset of data.

```typescript
function PendingOrders() {
  // Memoize search term to avoid recreating selector
  const [status, setStatus] = useState('pending');
  
  // Only re-render when filtered result changes
  const pendingOrders = useOrderStore(
    useCallback(
      state => state.orders.filter(o => o.status === status),
      [status]
    ),
    shallowEqual
  );
  
  return <List items={pendingOrders} />;
}
```

### Pattern 7: Multiple Stores with Composition

**Use case**: Component needs data from multiple stores.

```typescript
function OrderSummary() {
  // Each subscription is independent
  const orders = useOrderStore(state => state.orders);
  const selectedShop = useShopStore(state => state.selectedShop);
  const employees = useEmployeeStore(state => state.employees);
  
  // Component only re-renders when any of these 3 fields change
  const shopOrders = useMemo(
    () => orders.filter(o => o.shop_id === selectedShop?.id),
    [orders, selectedShop]
  );
  
  return <div>Orders: {shopOrders.length}</div>;
}
```

### Pattern 8: Conditional Store Access

**Use case**: Only subscribe when certain condition is met.

```typescript
function OrderDetails({ orderId }: { orderId: string | null }) {
  // Only subscribe if orderId exists
  const order = useOrderStore(
    state => orderId ? state.orders.find(o => o.id === orderId) : null
  );
  
  if (!orderId) return <div>Select an order</div>;
  if (!order) return <div>Order not found</div>;
  
  return <OrderCard order={order} />;
}
```

---

## Real Examples

### Example 1: OrderList.tsx (Before & After)

**❌ BEFORE** (10+ unnecessary re-renders):
```typescript
export const OrderList: React.FC = () => {
  // Subscribes to EVERYTHING - 20+ fields
  const { 
    orders,           // ✓ needed
    deleteOrder,      // ✓ needed
    fetchOrders,      // ✓ needed
    selectedOrder,    // ✗ not used
    draftOrder,       // ✗ not used
    draftItems,       // ✗ not used
    isLoading,        // ✗ not used
    error,            // ✗ not used
    // ... 12 more unused fields
  } = useOrderStore();
  
  const { selectedShop } = useShopStore(); // All shop fields
  
  // Component re-renders whenever ANY field changes
  // Including fields we don't use!
}
```

**✅ AFTER** (70% reduction in re-renders):
```typescript
export const OrderList: React.FC = () => {
  // Only subscribe to what we need
  const orders = useOrderStore(state => state.orders);
  const deleteOrder = useOrderStore(state => state.deleteOrder);
  const fetchOrders = useOrderStore(state => state.fetchOrders);
  
  const selectedShop = useShopStore(state => state.selectedShop);
  
  // Component ONLY re-renders when:
  // 1. orders array changes
  // 2. selectedShop changes
  // Nothing else triggers re-render!
}
```

### Example 2: EmployeeList.tsx (Before & After)

**❌ BEFORE**:
```typescript
const { employees, isLoading, error, fetchEmployees, ...unused } = useEmployeeStore();
// 8 re-renders when only employees are displayed
```

**✅ AFTER**:
```typescript
const employees = useEmployeeStore(state => state.employees);
const isLoading = useEmployeeStore(state => state.isLoading);
const error = useEmployeeStore(state => state.error);
const fetchEmployees = useEmployeeStore(state => state.fetchEmployees);
// 2 re-renders - only when employees, isLoading, or error changes
```

### Example 3: Dashboard with Auto-refresh

**✅ OPTIMIZED**:
```typescript
function DashboardPage() {
  // Data subscriptions
  const { metrics, revenueChart, profitChart } = useDashboardStore(
    state => ({
      metrics: state.data.metrics,
      revenueChart: state.data.revenueChart,
      profitChart: state.data.profitChart,
    }),
    shallowEqual
  );
  
  // Actions (never re-render)
  const fetchData = useDashboardStore(state => state.fetchDashboardData);
  const refreshData = useDashboardStore(state => state.refreshDashboardData);
  
  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [refreshData]); // Stable function reference
  
  return (
    <>
      <MetricsCards data={metrics} />
      <RevenueChart data={revenueChart} />
      <ProfitChart data={profitChart} />
    </>
  );
}
```

---

## Common Mistakes

### Mistake 1: Destructuring Entire Store

```typescript
// ❌ WRONG - Still subscribes to everything
const { orders } = useOrderStore();

// ✅ RIGHT - Selective subscription
const orders = useOrderStore(state => state.orders);
```

### Mistake 2: Not Using Shallow Compare for Objects

```typescript
// ❌ WRONG - Creates new object every time, always re-renders
const data = useOrderStore(state => ({ 
  items: state.orders, 
  loading: state.isLoading 
}));

// ✅ RIGHT - Shallow compare prevents unnecessary re-renders
const data = useOrderStore(
  state => ({ items: state.orders, loading: state.isLoading }),
  shallowEqual
);
```

### Mistake 3: Inline Selector Functions

```typescript
// ⚠️ SUBOPTIMAL - Creates new function every render
function OrderList() {
  const pendingOrders = useOrderStore(
    state => state.orders.filter(o => o.status === 'pending')
  );
}

// ✅ BETTER - Memoize with useCallback
function OrderList() {
  const pendingOrders = useOrderStore(
    useCallback(
      state => state.orders.filter(o => o.status === 'pending'),
      [] // Only recreate if dependencies change
    )
  );
}

// ✅ BEST - Use useMemo for filtering
function OrderList() {
  const orders = useOrderStore(state => state.orders);
  const pendingOrders = useMemo(
    () => orders.filter(o => o.status === 'pending'),
    [orders]
  );
}
```

### Mistake 4: Subscribing to Rapidly Changing Values

```typescript
// ❌ WRONG - Re-renders on every keystroke
const searchTerm = useOrderStore(state => state.searchTerm);

// ✅ RIGHT - Use local state for UI inputs
const [searchTerm, setSearchTerm] = useState('');
const performSearch = useOrderStore(state => state.searchOrders);
```

---

## Performance Tips

### Tip 1: Measure Before Optimizing

```typescript
// Add React Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="OrderList" onRender={onRenderCallback}>
  <OrderList />
</Profiler>
```

### Tip 2: Use React DevTools

1. Open React DevTools
2. Go to Profiler tab
3. Click "Record"
4. Interact with your app
5. See which components re-render and why

### Tip 3: Split Heavy Components

```typescript
// Instead of one heavy component
function HeavyDashboard() {
  const metrics = useDashboardStore(state => state.metrics);
  const charts = useDashboardStore(state => state.charts);
  const tables = useDashboardStore(state => state.tables);
  // ... 100+ lines
}

// Split into smaller components
function Dashboard() {
  return (
    <>
      <MetricsSection />  {/* Only re-renders when metrics change */}
      <ChartsSection />   {/* Only re-renders when charts change */}
      <TablesSection />   {/* Only re-renders when tables change */}
    </>
  );
}
```

### Tip 4: Lazy Load Heavy Stores

```typescript
// Only load when needed
function AdminPanel() {
  const [showReports, setShowReports] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowReports(true)}>View Reports</button>
      {showReports && <ReportsComponent />}
    </>
  );
}
```

### Tip 5: Batch State Updates

```typescript
// ❌ BAD - Multiple store updates
function loadData() {
  set({ isLoading: true });        // Re-render 1
  const data = await fetch();
  set({ data });                    // Re-render 2
  set({ isLoading: false });        // Re-render 3
}

// ✅ GOOD - Single store update
function loadData() {
  set({ isLoading: true });
  const data = await fetch();
  set({ data, isLoading: false });  // Single re-render
}
```

---

## Quick Reference Card

| Pattern | Use Case | Re-render Trigger |
|---------|----------|-------------------|
| `state => state.field` | Single field | When field changes |
| `state => ({ a, b })` + shallow | Multiple fields | When any field changes |
| `state => state.action` | Actions only | Never (stable reference) |
| `state => computed` | Derived value | When result changes |
| Predefined selectors | Common patterns | Depends on selector |

---

## Checklist for Refactoring

- [ ] Identify components with `const { ...many fields } = useStore()`
- [ ] List which fields are actually used in component
- [ ] Replace destructuring with selective subscriptions
- [ ] Add `shallowEqual` for object selections
- [ ] Use `useCallback` for complex selectors
- [ ] Test that functionality still works
- [ ] Measure re-render reduction with React Profiler
- [ ] Document improvements in component comments

---

**Last Updated**: 2025-10-22  
**See Also**: 
- [OPTIMIZATION_RESULTS.md](./OPTIMIZATION_RESULTS.md)
- [React DevTools Profiler Guide](https://react.dev/learn/react-developer-tools)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
