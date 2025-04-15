import { createContext as reactCreateContext, useContext } from "react";

/**
 * Creates a context with proper Fast Refresh compatibility
 * by ensuring consistent exports pattern
 */
export function createSafeContext<T>(defaultValue: T) {
  const Context = reactCreateContext<T>(defaultValue);

  function useContextHook() {
    return useContext(Context);
  }

  return [Context, useContextHook] as const;
}
