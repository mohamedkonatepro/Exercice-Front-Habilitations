import { useEffect, useState } from "react";

/**
 * Returns the value delayed by `delayMs`: while it keeps changing (typing),
 * the debounced value does not move. Avoids one request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
