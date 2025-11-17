// src/utils/LoadingFallback.tsx
/**
 * Simple loading fallback UI for lazy-loaded components
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-100">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);
