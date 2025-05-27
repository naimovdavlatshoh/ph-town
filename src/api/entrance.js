import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetEntrances(blockId) {
  const URL = blockId ? [endpoints.entrance.list, { params: { block_id: blockId } }] : '';
  const CREATE_URL = endpoints.entrance.create;
  const UPDATE_URL = endpoints.entrance.update;
  const DELETE_URL = endpoints.entrance.delete;

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newEntrance, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newEntrance);

      cb();
      return mutate([...data, result.data]);
    },
    [CREATE_URL, data, mutate]
  );

  const update = useCallback(
    async (newEntrance) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, newEntrance);
      return mutate(
        data.map((entrance) => (entrance.id === result.id ? result : newEntrance), false)
      );
    },
    [UPDATE_URL, data, mutate]
  );

  const remove = useCallback(
    async (newEntrance) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(DELETE_URL, newEntrance);
      return mutate(
        data.filter((entrance) => (entrance.id === result.id ? result : newEntrance), false)
      );
    },
    [DELETE_URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      entrances: data?.length ? data : [],
      entrancesLoading: isLoading,
      entrancesError: error,
      entrancesValidating: isValidating,
      entrancesEmpty: !isLoading && !data?.length,
      create,
      update,
      remove,
    }),
    [data, isLoading, error, isValidating, create, update, remove]
  );

  return memoizedValue;
}
