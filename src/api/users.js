import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetUsers(page) {
  const URL = endpoints.users.list;
  const CREATE_URL = endpoints.users.create;
  const UPDATE_URL = endpoints.users.update;
  const DELETE_URL = endpoints.users.delete;

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?page=${page}`, fetcher);

  const create = useCallback(
    // eslint-disable-next-line consistent-return
    async (newUser, cb, errCb) => {
      try {
        if (!newUser) {
          return false;
        }
        const result = await axios.post(CREATE_URL, newUser);
        cb();
        return mutate(URL, result.data, false);
        // eslint-disable-next-line no-shadow
      } catch (error) {
        errCb();
      }
    },
    [URL, CREATE_URL, mutate]
  );

  const update = useCallback(
    // eslint-disable-next-line consistent-return
    async (userData, cb, errCb) => {
      try {
        if (!userData) {
          return false;
        }
        const result = await axios.post(UPDATE_URL, userData);

        cb();
        return mutate(URL);
        // eslint-disable-next-line no-shadow
      } catch (error) {
        errCb();
      }
    },
    [UPDATE_URL, mutate, URL]
  );

  const remove = useCallback(
    async (removeId, cb) => {
      if (!removeId) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: {
          user_id: removeId,
        },
      });
      cb();
      return mutate(URL, result.data, false);
    },
    [URL, DELETE_URL, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      users: data?.option || [],
      count: data?.all_items || 0,
      page: data?.page || 1,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.option?.length,
      create,
      remove,
      update,
    }),
    [
      data?.option,
      data?.all_items,
      data?.page,
      isLoading,
      error,
      isValidating,
      create,
      remove,
      update,
    ]
  );

  return memoizedValue;
}
