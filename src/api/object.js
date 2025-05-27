import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetObjects() {
  const URL = endpoints.object.list;
  const CREATE_URL = endpoints.object.create;
  const UPDATE_URL = endpoints.object.update;

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newObject, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newObject);

      cb();
      return mutate([...data, result.data], false);
    },
    [CREATE_URL, data, mutate]
  );

  const update = useCallback(
    async (newObject, cb) => {
      if (!data) {
        return false;
      }

      const result = await axios.post(UPDATE_URL, newObject);

      cb();
      return mutate(
        data.map(
          (object) => (object.project_id === result.project_id ? result.data : object),
          false
        )
      );
    },
    [UPDATE_URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      objects: data?.length ? data : [],
      objectsLoading: isLoading,
      objectsError: error,
      objectsValidating: isValidating,
      objectsEmpty: !isLoading && !data?.length,
      create,
      update,
    }),
    [data, isLoading, error, isValidating, create, update]
  );

  return memoizedValue;
}

export function useGetObjectsTreeList() {
  const URL = endpoints.object.treelist;

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      objectsTree: data?.length ? data : [],
      objectsTreeLoading: isLoading,
      objectsTreeError: error,
      objectsTreeValidating: isValidating,
      objectsTreeEmpty: !isLoading && !data?.length,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}
