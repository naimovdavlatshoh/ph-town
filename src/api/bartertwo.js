import useSWR from 'swr';
import { useMemo } from 'react';
import queryString from 'query-string';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBarterTwo(page = 1) {
  const URL = endpoints.bartertwo.list;
  const query = queryString.stringify({ page });

  const { data, isLoading, error, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const memoizedValue = useMemo(
    () => ({
      bartertwos: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      bartertwoLoading: isLoading,
      bartertwoError: error,
      bartertwoValidating: isValidating,
      bartertwoEmpty: !isLoading && !data?.option?.length,
    }),
    [data?.option, data?.count, isLoading, error, isValidating]
  );

  return memoizedValue;
}
