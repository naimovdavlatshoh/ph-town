import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBlocks(objectId) {
  const URL = objectId ? [endpoints.block.list, { params: { project_id: objectId } }] : '';

  const CREATE_URL = endpoints.block.create;
  const UPDATE_URL = endpoints.block.update;
  const DELETE_URL = endpoints.block.delete;

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newBlock, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newBlock);
      cb();
      return mutate((prevData) => [...prevData, result.data], false);
    },
    [CREATE_URL, data, mutate]
  );

  const update = useCallback(
    async (newBlock, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, newBlock);
      cb();
      return mutate(
        data.map((block) => (block.block_id === result.block_id ? result.data : block), false)
      );
    },
    [UPDATE_URL, data, mutate]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!data) {
        return false;
      }
      await axios.delete(DELETE_URL, {
        data: {
          block_id: id,
        },
      });
      cb();
      return mutate(
        data.filter((block) => block.block_id !== id, false),
        false
      );
    },
    [DELETE_URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      blocks: data?.length ? data : [],
      blocksLoading: isLoading,
      blocksError: error,
      blocksValidating: isValidating,
      blocksEmpty: !isLoading && !data?.length,
      create,
      update,
      remove,
    }),
    [data, isLoading, error, isValidating, create, update, remove]
  );

  return memoizedValue;
}
