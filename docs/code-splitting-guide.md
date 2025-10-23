# Code Splitting with Dynamic Imports Guide

## Overview

Code splitting breaks your application bundle into smaller chunks that are loaded on-demand. This reduces the initial bundle size and improves page load performance.

## What We Implemented

### 1. **Lazy Load Utility** (`src/utils/lazyLoad.tsx`)

A reusable wrapper that handles:
- Dynamic imports with `React.lazy()`
- Suspense boundaries for loading states
- Loading fallback UI with spinner

```typescript
const DashboardPage = lazyLoad(() => 
  import('../features/dashboard').then(m => ({ default: m.DashboardPage }))
);
```

### 2. **Router Configuration** (`src/router/index.tsx`)

Updated to use dynamic imports for all heavy features:

- **Eager loaded** (loaded immediately):
  - `ShopList` - Small, frequently used

- **Lazy loaded** (loaded on-demand):
  - Dashboard, Products, Orders, Employees, Reports, Settings
  - Each feature loads only when user navigates to that route

## How It Works

### Before (Static Import)
```typescript
// All code loaded upfront
import { DashboardPage } from '../features/dashboard';
```

### After (Dynamic Import)
```typescript
// Code loaded only when route is accessed
const DashboardPage = lazyLoad(() => 
  import('../features/dashboard').then(m => ({ default: m.DashboardPage }))
);
```

**Timeline:**
1. User visits `/dashboard`
2. Browser downloads dashboard chunk
3. Loading spinner shows while downloading
4. Dashboard renders when ready

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| Initial Bundle | ~500+ kB | ~150-200 kB |
| Initial Load | Slower | Faster ✓ |
| Route Navigation | Instant | Slight delay (1st time) |
| Memory Usage | Higher | Lower ✓ |

## Usage Examples

### Example 1: Using Lazy-Loaded Components

```typescript
// In router/index.tsx
const MyPage = lazyLoad(() => 
  import('../features/myfeature/pages/MyPage').then(m => ({ default: m.MyPage }))
);

// In route config
{
  path: 'myfeature',
  element: <MyPage />
}
```

### Example 2: Manual Lazy Loading in Components

```typescript
import { Suspense, lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Customizing Loading UI

Edit `src/utils/lazyLoad.tsx` to customize the loading fallback:

```typescript
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div>
      <YourCustomSpinner />
      <p>Loading page...</p>
    </div>
  </div>
);
```

## Monitoring Bundle Size

### Build Analysis

```bash
npm run build
```

Check the output for chunk sizes:
```
dist/index-abc123.js     150.5 kB
dist/dashboard-def456.js  45.2 kB
dist/orders-ghi789.js     38.7 kB
```

### Vite Plugin for Visualization

Install and use `rollup-plugin-visualizer`:

```bash
npm install --save-dev rollup-plugin-visualizer
```

Update `vite.config.ts`:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});
```

## Advanced: Manual Chunk Configuration

For more control, edit `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'dashboard': ['src/features/dashboard'],
          'orders': ['src/features/orders'],
          'products': ['src/features/products'],
          'employees': ['src/features/employees'],
          'reports': ['src/features/reports'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
```

## Performance Tips

1. **Prioritize Critical Routes**: Keep frequently-used pages eager-loaded
2. **Prefetch Routes**: Preload chunks when user hovers over navigation links
3. **Monitor Bundle**: Regularly check chunk sizes in build output
4. **Compress Images**: Use WebP format for images
5. **Cache Strategy**: Configure service worker for offline support

## Troubleshooting

### Issue: Chunks still too large

**Solution**: Split further by feature sub-sections
```typescript
const OrderList = lazyLoad(() => import('../features/orders/pages/OrderList'));
const OrderDetail = lazyLoad(() => import('../features/orders/pages/OrderDetail'));
```

### Issue: Loading spinner shows too often

**Solution**: Prefetch chunks on route hover
```typescript
const prefetchChunk = (importFunc) => {
  importFunc();
};

// On link hover
<Link onMouseEnter={() => prefetchChunk(() => import('...'))} />
```

### Issue: White flash during navigation

**Solution**: Keep previous page visible while loading
```typescript
<Suspense fallback={<PreviousPageContent />}>
  <NewPage />
</Suspense>
```

## Next Steps

1. ✅ Code splitting implemented
2. Monitor bundle size in production
3. Add prefetching for better UX
4. Consider service worker for offline support
5. Implement error boundaries for failed chunk loads

## References

- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [Suspense Documentation](https://react.dev/reference/react/Suspense)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
