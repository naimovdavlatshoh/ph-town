import useSWR, { mutate } from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCheckerboard(projectId) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const URL = projectId ? [endpoints.checkerboard.list, { params: { project_id: projectId } }] : '';

  const RESERVE_URL = endpoints.checkerboard.reserve;
  const DERESERVE_URL = endpoints.checkerboard.dereserve;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const reserve = useCallback(
    async (reserveData, cb) => {
      if (!reserveData) {
        return false;
      }
      const result = await axios.post(RESERVE_URL, reserveData);

      cb();
      return mutate(URL);
    },
    [RESERVE_URL, URL]
  );

  const dereserve = useCallback(
    async (dereserveId, cb) => {
      if (!dereserveId) {
        return false;
      }
      const result = await axios.delete(DERESERVE_URL, {
        data: {
          apartment_id: dereserveId,
        },
      });

      cb();
      return mutate(URL);
    },
    [DERESERVE_URL, URL]
  );

  const memoizedValue = useMemo(
    () => ({
      checkerboard: data || null,
      checkerboardLoading: isLoading,
      checkerboardError: error,
      checkerboardValidating: isValidating,
      objectsEmpty: !isLoading && !data,
      reserve,
      dereserve,
    }),
    [data, isLoading, error, isValidating, reserve, dereserve]
  );

  return memoizedValue;
}
