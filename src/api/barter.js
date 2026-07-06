import useSWR from 'swr';
import { useMemo } from 'react';
import queryString from 'query-string';

import axios, { fetcher } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetSuppliers(page = 1) {
  const URL = '/api/v1/supplier/list';

  const queryObject = {
    page,
  };

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const memoizedValue = useMemo(() => {
    let suppliersList = [];
    if (Array.isArray(data)) {
      suppliersList = data;
    } else if (data?.option?.length) {
      suppliersList = data.option;
    }

    const suppliersCount = data?.count || (Array.isArray(data) ? data.length : 0);
    const isEmpty = !isLoading && (!Array.isArray(data) ? !data?.option?.length : !data?.length);

    return {
      suppliers: suppliersList,
      count: suppliersCount,
      suppliersLoading: isLoading,
      suppliersError: error,
      suppliersValidating: isValidating,
      suppliersEmpty: isEmpty,
      refresh: mutate,
    };
  }, [data, isLoading, error, isValidating, mutate]);

  return memoizedValue;
}

export function useSearchSuppliers(keyword) {
  const URL = '/api/v1/supplier/search';

  const { data, isLoading, error, mutate, isValidating } = useSWR(
    keyword ? [URL, keyword] : null,
    async (args) => {
      const [url, kw] = args;
      const response = await axios.post(url, { keyword: kw });
      return response.data;
    }
  );

  const memoizedValue = useMemo(() => {
    let suppliersList = [];
    if (data?.option?.length) {
      suppliersList = data.option;
    } else if (Array.isArray(data)) {
      suppliersList = data;
    }

    return {
      suppliers: suppliersList,
      suppliersLoading: isLoading,
      suppliersError: error,
      suppliersValidating: isValidating,
      suppliersEmpty: !isLoading && !suppliersList.length,
      refresh: mutate,
    };
  }, [data, isLoading, error, isValidating, mutate]);

  return memoizedValue;
}
