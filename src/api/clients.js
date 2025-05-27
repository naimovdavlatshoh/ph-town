import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetClients(page = 1) {
  const URL = endpoints.client.list;
  const CREATE_PERSONAL_URL = endpoints.client.createPersonal;
  const CREATE_BUSINESS_URL = endpoints.client.createBusiness;
  const UPDATE_PERSONAL_URL = endpoints.client.updatePersonal;
  const UPDATE_BUSINESS_URL = endpoints.client.updateBusiness;
  const SEARCH_URL = endpoints.client.search;
  const DELETE_URL = endpoints.client.delete;

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?page=${page}`, fetcher);

  const createPersonalClient = useCallback(
    async (newClientData) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_PERSONAL_URL, newClientData);
      return mutate([...data, result.data]);
    },
    [CREATE_PERSONAL_URL, data, mutate]
  );

  const createBusinessClient = useCallback(
    async (newClientData) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_BUSINESS_URL, newClientData);
      return mutate([...data, result.data]);
    },
    [CREATE_BUSINESS_URL, data, mutate]
  );

  const updatePersonalClient = useCallback(
    async (clientData) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_PERSONAL_URL, clientData);
      return mutate(data.map((client) => (client.id === result.id ? client : clientData), false));
    },
    [UPDATE_PERSONAL_URL, data, mutate]
  );

  const updateBusinessClient = useCallback(
    async (clientData) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_BUSINESS_URL, clientData);
      return mutate(data.map((client) => (client.id === result.id ? client : clientData), false));
    },
    [UPDATE_BUSINESS_URL, data, mutate]
  );

  const searchClient = useCallback(
    async (keyword) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(SEARCH_URL, {
        keyword,
      });
      return mutate(SEARCH_URL, { ...data, option: result.data }, false);
    },
    [SEARCH_URL, data, mutate]
  );

  const remove = useCallback(
    async (removeId) => {
      if (!removeId) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: {
          client_id: removeId,
        },
      });
      return mutate();
    },
    [DELETE_URL, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      clients: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      clientsLoading: isLoading,
      clientsError: error,
      clientsValidating: isValidating,
      clientsEmpty: !isLoading && !data?.option?.length,
      createPersonalClient,
      createBusinessClient,
      updatePersonalClient,
      updateBusinessClient,
      searchClient,
      remove,
    }),
    [
      data?.option,
      data?.count,
      data?.page,
      isLoading,
      error,
      isValidating,
      createPersonalClient,
      createBusinessClient,
      updatePersonalClient,
      updateBusinessClient,
      searchClient,
      remove,
    ]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetClientDetails(id) {
  const URL = id ? [endpoints.client.details, { params: { client_id: id } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      client: data,
      clientLoading: isLoading,
      clientError: error,
      clientValidating: isValidating,
      clientsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetMeasures() {
  const URL = endpoints.material.measurelist;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      measures: data || [],
      materialsLoading: isLoading,
      materialsError: error,
      materialsValidating: isValidating,
      materialsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProduct(productId) {
  const URL = productId ? [endpoints.product.details, { params: { productId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      product: data?.product,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchClients(query) {
  const URL = query ? [endpoints.client.search, { method: 'post', data: { keyword: query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
