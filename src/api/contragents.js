import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetContragents(page = 1) {
  const URL = endpoints.contragents.list;
  const CREATE_URL = endpoints.contragents.create;
  const UPDATE_URL = endpoints.contragents.update;

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?page=${page}`, fetcher);

  const create = useCallback(
    async (newContragent, cb) => {
      if (!newContragent) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newContragent);
      cb();
      return mutate(
        URL,
        {
          ...data,
          option: [result.data, ...data.option],
        },
        false
      );
    },
    [CREATE_URL, URL, data, mutate]
  );

  const update = useCallback(
    async (contragent, cb) => {
      if (!contragent) {
        return false;
      }

      mutate(URL, { ...data, contragentsLoading: true }, false);

      const result = await axios.post(UPDATE_URL, contragent);

      cb();
      return mutate(
        URL,
        {
          ...data,
          option: data.option.map(
            (c) => (c.client_id === result.data?.client_id ? result.data : c),
            false
          ),
        },
        false
      );
    },
    [UPDATE_URL, URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      contragents: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      contragentsLoading: isLoading,
      contragentsError: error,
      contragentsValidating: isValidating,
      contragentsEmpty: !isLoading && !data?.option?.length,
      create,
      update,
    }),
    [data?.option, data?.count, data?.page, isLoading, error, isValidating, create, update]
  );

  return memoizedValue;
}

export function useGetContragentCategories(page) {
  const URL = endpoints.contragents.categoryList;
  const CREATE_URL = endpoints.contragents.categoryCreate;
  const UPDATE_URL = endpoints.contragents.categoryUpdate;

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?page=${page}`, fetcher);

  const create = useCallback(
    async (newCategory, cb) => {
      if (!newCategory) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newCategory);
      cb();
      return mutate(
        URL,
        {
          ...data,
          option: [result.data, ...data.option],
        },
        false
      );
    },
    [CREATE_URL, URL, data, mutate]
  );

  const update = useCallback(
    async (category, cb) => {
      if (!category) {
        return false;
      }

      mutate(URL, { ...data, categoriesLoading: true }, false);

      const result = await axios.post(UPDATE_URL, category);

      cb();
      return mutate(
        URL,
        {
          ...data,
          option: data.option.map(
            (c) => (c.counterparty_id === result.data?.counterparty_id ? result.data : c),
            false
          ),
        },
        false
      );
    },
    [UPDATE_URL, URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      categories: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
      categoriesEmpty: !isLoading && !data?.option?.length,
      create,
      update,
    }),
    [data?.option, data?.count, data?.page, isLoading, error, isValidating, create, update]
  );

  return memoizedValue;
}

export function useSearchContragents(query) {
  const URL = query
    ? [endpoints.contragents.search, { method: 'post', data: { keyword: query } }]
    : '';

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

export function useSearchContragentCategories(query) {
  const URL = query
    ? [endpoints.contragents.categorySearch, { method: 'post', data: { keyword: query } }]
    : '';

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
