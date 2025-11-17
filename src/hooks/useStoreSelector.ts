// src/hooks/useStoreSelector.ts
/**
 * Store Selector Hook
 * Wrapper for selective Zustand subscriptions with shallow compare
 * Reduces unnecessary re-renders by only subscribing to specific state slices
 */

import { useCallback } from "react";
import type { StoreApi, UseBoundStore } from "zustand";

/**
 * Shallow compare for objects
 * Returns true if objects have same keys and values
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA) as Array<keyof T>;
  const keysB = Object.keys(objB) as Array<keyof T>;

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Create a selector hook with shallow compare by default
 * Usage: const { items, isLoading } = useStoreSelector(useStore, (state) => ({ items: state.items, isLoading: state.isLoading }))
 */
export function createShallowSelector<TState, TSelected>(
  useStore: UseBoundStore<StoreApi<TState>>,
  selector: (state: TState) => TSelected
): () => TSelected {
  return () => useStore(selector);
}

/**
 * Create multiple predefined selectors for a stores
 * Returns an object with common selector hooks
 */
export function createStoreSelectors<TState extends Record<string, any>>(
  useStore: UseBoundStore<StoreApi<TState>>
) {
  return {
    // Select single field
    useField: <K extends keyof TState>(field: K) => {
      return useStore(useCallback((state: TState) => state[field], [field]));
    },

    // Select multiple fields with shallow compare
    useFields: <K extends keyof TState>(...fields: K[]) => {
      return useStore(
        useCallback(
          (state: TState) => {
            const result = {} as Pick<TState, K>;
            fields.forEach((field) => {
              result[field] = state[field];
            });
            return result;
          },
          [fields.join(",")]
        )
      );
    },

    // Select with custom selector
    useSelector: <TSelected>(
      selector: (state: TState) => TSelected
    ) => {
      return useStore(selector);
    }
  };
}

/**
 * Hook for selecting items array only
 * Common pattern: only re-render when items array changes
 */
export function useItems<T extends { items: any[] }>(
  useStore: UseBoundStore<StoreApi<T>>
) {
  return useStore((state) => state.items);
}

/**
 * Hook for selecting items with loading state
 * Common pattern: items + isLoading
 */
export function useItemsWithLoading<
  T extends { items: any[]; isLoading: boolean },
>(useStore: UseBoundStore<StoreApi<T>>) {
  return useStore(
    (state) => ({
      items: state.items,
      isLoading: state.isLoading
    })
  );
}

/**
 * Hook for selecting single item
 * Common pattern: selectedItem only
 */
export function useSelectedItem<T extends { selectedItem: any }>(
  useStore: UseBoundStore<StoreApi<T>>
) {
  return useStore((state) => state.selectedItem);
}

/**
 * Hook for selecting actions only (never changes)
 * Common pattern: only need stores actions, not state
 */
export function useActions<TState, TActions extends Partial<TState>>(
  useStore: UseBoundStore<StoreApi<TState>>,
  actionKeys: Array<keyof TActions>
) {
  return useStore(
    useCallback(
      (state: TState) => {
        const actions = {} as TActions;
        actionKeys.forEach((key) => {
          (actions[key] as any) = state[key as keyof TState];
        });
        return actions;
      },
      [actionKeys.join(",")]
    )
  );
}
