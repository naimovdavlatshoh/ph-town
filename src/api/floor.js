import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetFloors(entranceId) {
  const URL = entranceId ? [endpoints.floor.list, { params: { entrance_id: entranceId } }] : '';

  const CREATE_URL = endpoints.floor.create;
  const UPDATE_URL = endpoints.floor.update;
  const DELETE_URL = endpoints.floor.delete;

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newFloor, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newFloor);
      cb();
      return mutate([...data, result.data]);
    },
    [CREATE_URL, data, mutate]
  );

  const update = useCallback(
    async (floorData, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, floorData);

      cb();
      return mutate([...data, result.data]);
    },
    [UPDATE_URL, data, mutate]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: { floor_id: id },
      });

      cb();
      return mutate(
        data.filter((floor) => floor.floor_id !== id, false),
        false
      );
    },
    [DELETE_URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      floors: data?.length ? data : [],
      floorsLoading: isLoading,
      floorsError: error,
      floorsValidating: isValidating,
      floorsEmpty: !isLoading && !data?.length,
      create,
      update,
      remove,
    }),
    [data, isLoading, error, isValidating, create, update, remove]
  );

  return memoizedValue;
}
