import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

export function useDebounce(value, minLength = 0, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    let handler;

    if (value?.length >= minLength) {
      handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
    }

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, minLength]);

  return debouncedValue;
}
