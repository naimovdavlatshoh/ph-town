import useSWR, { mutate } from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCurrency() {
  const URL = endpoints.currency.info;
  const CREATE_URL = endpoints.currency.create;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (value, cb) => {
      if (!value) {
        return false;
      }
      const result = await axios.post(CREATE_URL, {
        dollar_rate: value,
      });

      cb();
      return mutate(URL, result?.data, false);
    },
    [CREATE_URL, URL]
  );

  const memoizedValue = useMemo(
    () => ({
      currency: data?.dollar_rate || '',
      currencyLoading: isLoading,
      currencyError: error,
      currencyValidating: isValidating,
      currencyEmpty: !isLoading && !data?.dollar_rate,
      create,
    }),
    [create, data?.dollar_rate, error, isLoading, isValidating]
  );

  return memoizedValue;
}
