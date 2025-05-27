import useSWR, { mutate } from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMaterials(page = 0) {
  const URL = endpoints.material.list;
  const CREATE_URL = endpoints.material.create;
  const UPDATE_URL = endpoints.material.update;
  const DELETE_URL = endpoints.material.delete;

  const { data, isLoading, error, isValidating } = useSWR(`${URL}?page=${page}`, fetcher);

  const create = useCallback(
    async (newMaterial, cb) => {
      if (!newMaterial) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newMaterial);

      cb();
      return mutate(URL, { ...data, option: [result.data, ...data.option] }, false);
    },
    [CREATE_URL, URL, data]
  );

  const update = useCallback(
    async (material, cb) => {
      if (!material) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, material);

      cb();
      return mutate(
        URL,
        {
          ...data,
          option: data.option.map(
            (m) => (m.material_id === result.data?.material_id ? result.data : m),
            false
          ),
        },
        false
      );
    },
    [UPDATE_URL, URL, data]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!id) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: { material_id: id },
      });

      cb();

      return mutate(
        URL,
        {
          ...data,
          option: data.option.filter((m) => m.material_id !== id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data]
  );

  const memoizedValue = useMemo(
    () => ({
      materials: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      materialsLoading: isLoading,
      materialsError: error,
      materialsValidating: isValidating,
      materialsEmpty: !isLoading && !data?.option.length,
      create,
      update,
      remove,
    }),
    [data?.option, data?.count, data?.page, isLoading, error, isValidating, create, update, remove]
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

export function useSearchMaterials(query) {
  const URL = query
    ? [endpoints.material.search, { method: 'post', data: { keyword: query } }]
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
