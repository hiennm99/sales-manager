// src/utils/lazyLoad.tsx
import { type ComponentType, lazy, Suspense } from "react";

import { LoadingFallback } from "./LoadingFallback";

/**
 * Wrapper for lazy-loaded components with loading fallback
 * Usage: const DashboardPage = lazyLoad(() => import('../features/dashboard'));
 */
export const lazyLoad = (
  importFunc: () => Promise<{ default: ComponentType<any> }>
) => {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
