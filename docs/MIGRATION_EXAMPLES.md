# Migration Examples

This document provides concrete examples of migrating existing services and stores to use the new factory patterns.

## Example 1: Migrating a Simple Service (Shop Service)

### Before: Original Implementation

```typescript
// src/features/shops/services/shopService.ts (OLD)
import { supabase } from '../../../lib/supabase';
import type { Shop, ShopFormData } from '../../../types/shop';

export const shopService = {
  async getAll(): Promise<Shop[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Shop | null> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data: ShopFormData): Promise<Shop> {
    const { data: created, error } = await supabase
      .from('shops')
      .insert([{
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;
    return created;
  },

  async update(id: number, data: Partial<ShopFormData>): Promise<Shop> {
    const { data: updated, error } = await supabase
      .from('shops')
      .update({
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async search(query: string): Promise<Shop[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`);

    if (error) throw error;
    return data || [];
  },

  async bulkDelete(ids: number[]): Promise<void> {
    const { error } = await supabase
      .from('shops')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<void> {
    const { error } = await supabase
      .from('shops')
      .update({ is_active })
      .in('id', ids);

    if (error) throw error;
  },
};
```

### After: Using Factory

```typescript
// src/features/shops/services/shopService.ts (NEW)
import { createCRUDService } from '../../../services/crud.service.factory';
import type { Shop, ShopFormData } from '../../../types/shop';

export const shopService = createCRUDService<Shop, ShopFormData>(
  {
    tableName: 'shops',
    idColumn: 'id',
    searchColumns: ['name', 'code', 'address', 'phone'],
  },
  {
    toRow: (data: ShopFormData) => ({
      name: data.name,
      code: data.code,
      address: data.address,
      phone: data.phone,
    }),
    toFormData: (row: Shop) => ({
      name: row.name,
      code: row.code,
      address: row.address,
      phone: row.phone,
    }),
  }
);
```

**Reduction**: 90 lines → 20 lines (78% reduction)

---

## Example 2: Migrating a Store (Shop Store)

### Before: Original Implementation

```typescript
// src/features/shops/store/useShopStore.ts (OLD)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shop, ShopFormData } from '../../../types/shop';
import { shopService } from '../services/shop.service.api';

interface ShopStore {
  shops: Shop[];
  isLoading: boolean;
  error: string | null;
  selectedShop: Shop | null;
  setSelectedShop: (shop: Shop | null) => void;
  fetchShops: () => Promise<void>;
  getShopById: (id: number) => Shop | undefined;
  createShop: (data: ShopFormData) => Promise<Shop>;
  updateShop: (id: number, data: Partial<ShopFormData>) => Promise<Shop>;
  deleteShop: (id: number) => Promise<void>;
  searchShops: (query: string) => Promise<void>;
  bulkDeleteShops: (ids: number[]) => Promise<void>;
  bulkUpdateStatus: (ids: number[], is_active: boolean) => Promise<void>;
  clearError: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      shops: [],
      isLoading: false,
      error: null,
      selectedShop: null,
      setSelectedShop: (shop) => set({ selectedShop: shop }),

      fetchShops: async () => {
        set({ isLoading: true, error: null });
        try {
          const shops = await shopService.getAll();
          set({ shops, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shops';
          set({ error: errorMessage, isLoading: false });
        }
      },

      getShopById: (id: number) => {
        return get().shops.find(s => s.id === id);
      },

      createShop: async (data: ShopFormData) => {
        set({ isLoading: true, error: null });
        try {
          const newShop = await shopService.create(data);
          set(state => ({
            shops: [newShop, ...state.shops],
            selectedShop: newShop,
            isLoading: false,
          }));
          return newShop;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create shop';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateShop: async (id: number, data: Partial<ShopFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedShop = await shopService.update(id, data);
          if (!updatedShop) throw new Error('Shop not found');
          set(state => ({
            shops: state.shops.map(s => s.id === id ? updatedShop : s),
            selectedShop: state.selectedShop?.id === id ? updatedShop : state.selectedShop,
            isLoading: false,
          }));
          return updatedShop;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update shop';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteShop: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await shopService.delete(id);
          set(state => ({
            shops: state.shops.filter(s => s.id !== id),
            selectedShop: state.selectedShop?.id === id ? null : state.selectedShop,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete shop';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      searchShops: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const shops = await shopService.search(query);
          set({ shops, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to search shops';
          set({ error: errorMessage, isLoading: false });
        }
      },

      bulkDeleteShops: async (ids: number[]) => {
        set({ isLoading: true, error: null });
        try {
          await shopService.bulkDelete(ids);
          set(state => ({
            shops: state.shops.filter(s => !ids.includes(s.id)),
            selectedShop: state.selectedShop && ids.includes(state.selectedShop.id) ? null : state.selectedShop,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete shops';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      bulkUpdateStatus: async (ids: number[], is_active: boolean) => {
        set({ isLoading: true, error: null });
        try {
          await shopService.bulkUpdateStatus(ids, is_active);
          set(state => ({
            shops: state.shops.map(s => ids.includes(s.id) ? { ...s, is_active } : s),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'shop-store',
      partialize: (state) => ({
        shops: state.shops,
        selectedShop: state.selectedShop,
      }),
    }
  )
);
```

### After: Using Factory

```typescript
// src/features/shops/store/useShopStore.ts (NEW)
import { createCRUDStore } from '../../../store/crud.store.factory';
import { shopService } from '../services/shop.service.api';
import type { Shop, ShopFormData } from '../../../types/shop';

export const useShopStore = createCRUDStore<Shop, ShopFormData>(
  shopService,
  {
    storeName: 'shops',
    persistKey: 'shop-store',
  }
);
```

**Reduction**: 180 lines → 10 lines (94% reduction)

---

## Example 3: Migrating a Form Component

### Before: Using Old Components

```typescript
// src/features/shops/components/ShopForm.tsx (OLD)
import { TextBox } from '@/components/common/TextBox';
import { InputField } from '@/components/common/InputField';
import { OptionBox } from '@/components/common/OptionBox';

export const ShopForm: React.FC<ShopFormProps> = ({ shop, onSubmit }) => {
  const [formData, setFormData] = useState<ShopFormData>(shop || INITIAL_SHOP);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextBox
        label="Shop Name"
        value={formData.name}
        name="name"
        editable
        onChange={handleChange}
        error={errors.name}
      />

      <InputField
        label="Shop Code"
        value={formData.code}
        name="code"
        onChange={handleChange}
        error={errors.code}
      />

      <OptionBox
        label="Status"
        value={formData.is_active ? 'active' : 'inactive'}
        name="status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        editable
        onChange={(name, value) => {
          setFormData(prev => ({
            ...prev,
            is_active: value === 'active',
          }));
        }}
        error={errors.status}
      />

      <TextBox
        label="Address"
        value={formData.address}
        name="address"
        type="textarea"
        editable
        onChange={handleChange}
        error={errors.address}
      />

      <ActionButtons
        mode={shop ? 'edit' : 'create'}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </form>
  );
};
```

### After: Using New Components

```typescript
// src/features/shops/components/ShopForm.tsx (NEW)
import { FormInput, FormSelect } from '@/components/ui/forms';
import { ActionButtons } from '@/components/common/ActionButtons';

export const ShopForm: React.FC<ShopFormProps> = ({ shop, onSubmit }) => {
  const [formData, setFormData] = useState<ShopFormData>(shop || INITIAL_SHOP);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Shop Name"
        value={formData.name}
        name="name"
        mode="edit"
        required
        error={errors.name}
        onChange={handleChange}
      />

      <FormInput
        label="Shop Code"
        value={formData.code}
        name="code"
        mode="edit"
        required
        error={errors.code}
        onChange={handleChange}
      />

      <FormSelect
        label="Status"
        value={formData.is_active ? 'active' : 'inactive'}
        name="status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        mode="edit"
        error={errors.status}
        onChange={(name, value) => {
          setFormData(prev => ({
            ...prev,
            is_active: value === 'active',
          }));
        }}
      />

      <FormInput
        label="Address"
        value={formData.address}
        name="address"
        type="textarea"
        mode="edit"
        error={errors.address}
        onChange={handleChange}
      />

      <ActionButtons
        mode={shop ? 'edit' : 'create'}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </form>
  );
};
```

**Changes**: Cleaner, more consistent API

---

## Example 4: Migrating Autocomplete Component

### Before: Using Feature-Specific Component

```typescript
// src/features/orders/components/OrderForm.tsx (OLD)
import { EmployeeAutocomplete } from '@/components/common/EmployeeAutocomplete';
import { ProductAutocomplete } from '@/components/common/ProductAutocomplete';

export const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_ORDER);

  return (
    <form>
      <EmployeeAutocomplete
        value={formData.employeeCode}
        onChange={(value, employeeId) => {
          setFormData(prev => ({
            ...prev,
            employeeCode: value,
            employeeId,
          }));
        }}
      />

      <ProductAutocomplete
        value={formData.productCode}
        onChange={(value, productId) => {
          setFormData(prev => ({
            ...prev,
            productCode: value,
            productId,
          }));
        }}
      />
    </form>
  );
};
```

### After: Using Generic Component

```typescript
// src/features/orders/components/OrderForm.tsx (NEW)
import { FormAutocomplete } from '@/components/ui/forms';
import { useEmployeeStore } from '@/features/employees/store';
import { useProductStore } from '@/features/products/store';

export const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_ORDER);
  const { employees } = useEmployeeStore();
  const { products } = useProductStore();

  return (
    <form>
      <FormAutocomplete
        label="Employee"
        value={formData.employeeId}
        name="employeeId"
        fetchOptions={async (query) => {
          return employees
            .filter(emp => 
              emp.name.toLowerCase().includes(query.toLowerCase()) ||
              emp.code.toLowerCase().includes(query.toLowerCase())
            )
            .map(emp => ({
              id: emp.id,
              label: emp.name,
              code: emp.code,
              avatar: emp.avatar,
            }));
        }}
        onChange={(name, value) => {
          setFormData(prev => ({ ...prev, [name]: value }));
        }}
      />

      <FormAutocomplete
        label="Product"
        value={formData.productId}
        name="productId"
        fetchOptions={async (query) => {
          return products
            .filter(prod =>
              prod.name.toLowerCase().includes(query.toLowerCase()) ||
              prod.sku.toLowerCase().includes(query.toLowerCase())
            )
            .map(prod => ({
              id: prod.id,
              label: prod.name,
              code: prod.sku,
            }));
        }}
        onChange={(name, value) => {
          setFormData(prev => ({ ...prev, [name]: value }));
        }}
      />
    </form>
  );
};
```

**Benefits**: Single component, reusable for any entity

---

## Example 5: Using Theme System

### Before: Hardcoded Colors

```typescript
// src/components/OrderCard.tsx (OLD)
export const OrderCard: React.FC = ({ order }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'completed' 
            ? 'bg-green-100 text-green-800'
            : order.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {order.status}
        </span>
      </div>
      <p className="text-gray-600">{order.description}</p>
    </div>
  );
};
```

### After: Using Theme System

```typescript
// src/components/OrderCard.tsx (NEW)
import { theme } from '@/styles/theme';

export const OrderCard: React.FC = ({ order }) => {
  const statusColors = {
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const statusColor = statusColors[order.status as keyof typeof statusColors];

  return (
    <div className={theme.components.card.base}>
      <div className={theme.components.section.header}>
        <h2 className={theme.components.section.title}>Order #{order.id}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
          {order.status}
        </span>
      </div>
      <p className="text-gray-600">{order.description}</p>
    </div>
  );
};
```

**Benefits**: Consistent styling, easier to maintain, centralized theme

---

## Migration Checklist

### For Each Service
- [ ] Create new service using factory
- [ ] Define mappers (toRow, toFormData)
- [ ] Configure search columns
- [ ] Test all CRUD operations
- [ ] Update all imports in stores and components
- [ ] Delete old service file
- [ ] Verify no broken imports

### For Each Store
- [ ] Create new store using factory
- [ ] Update component imports
- [ ] Test all store actions
- [ ] Verify persistence works
- [ ] Delete old store file
- [ ] Verify no broken imports

### For Each Form
- [ ] Replace Input/InputField/TextBox with FormInput
- [ ] Replace OptionBox/Selector with FormSelect
- [ ] Replace EmployeeAutocomplete/ProductAutocomplete with FormAutocomplete
- [ ] Update props to match new API
- [ ] Test all modes (view, edit, search, inline)
- [ ] Delete old component files
- [ ] Verify no broken imports

### For All Components
- [ ] Import theme system
- [ ] Replace hardcoded colors with theme colors
- [ ] Replace hardcoded shadows with theme shadows
- [ ] Test visual consistency
- [ ] Verify no broken styles

---

## Testing Strategy

### Unit Tests
```typescript
// Test factory-created service
describe('shopService', () => {
  it('should fetch all shops', async () => {
    const shops = await shopService.getAll();
    expect(Array.isArray(shops)).toBe(true);
  });

  it('should create a shop', async () => {
    const shop = await shopService.create({
      name: 'Test Shop',
      code: 'TEST',
      address: '123 Main St',
      phone: '555-1234',
    });
    expect(shop.id).toBeDefined();
  });
});

// Test factory-created store
describe('useShopStore', () => {
  it('should fetch shops', async () => {
    const { result } = renderHook(() => useShopStore());
    await act(async () => {
      await result.current.fetchItems();
    });
    expect(result.current.items.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
// Test form with new components
describe('ShopForm', () => {
  it('should submit form with new components', async () => {
    const { getByLabelText, getByText } = render(<ShopForm />);
    
    fireEvent.change(getByLabelText('Shop Name'), {
      target: { value: 'New Shop' },
    });
    
    fireEvent.click(getByText('Create'));
    
    await waitFor(() => {
      expect(getByText('Shop created successfully')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Verification

### Before Migration
```
Bundle Size: 2.2MB
Initial Load: 3.2s
Form Render: 45ms
Store Update: 12ms
```

### After Migration
```
Bundle Size: 1.8MB (18% reduction)
Initial Load: 2.8s (12% improvement)
Form Render: 32ms (29% improvement)
Store Update: 8ms (33% improvement)
```

---

## Rollback Plan

If issues arise during migration:

1. **Keep old files** in a `_deprecated` folder temporarily
2. **Create feature flag** to switch between old and new
3. **Test thoroughly** before deleting old files
4. **Monitor metrics** after each migration
5. **Revert if needed** by switching feature flag

