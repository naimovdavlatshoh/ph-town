import useSWR from 'swr';
import queryString from 'query-string';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBarterOne(page = 1) {
  const URL = endpoints.barterone.list;
  const RESALE_URL = endpoints.barterone.addResale;

  const query = queryString.stringify({ page });

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const addResale = useCallback(
    async (payload, onSuccess, onError) => {
      try {
        await axios.post(RESALE_URL, payload);
        mutate(`${URL}?${query}`);
        onSuccess?.();
      } catch (e) {
        onError?.(e);
      }
    },
    [RESALE_URL, URL, mutate, query]
  );

  const memoizedValue = useMemo(
    () => ({
      barterones: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      barteroneLoading: isLoading,
      barteroneError: error,
      barteroneValidating: isValidating,
      barteroneEmpty: !isLoading && !data?.option?.length,
      addResale,
    }),
    [data?.option, data?.count, isLoading, error, isValidating, addResale]
  );

  return memoizedValue;
}
