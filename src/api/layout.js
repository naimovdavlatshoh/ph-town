import useSWR, { mutate } from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetLayouts(projectId, page = 1) {
  let URL = '';

  const CREATE_URL = endpoints.layout.create;
  const UPDATE_URL = endpoints.layout.udapte;
  const DELETE_URL = endpoints.layout.delete;
  const LIST_BY_TYPE_URL = endpoints.layout.listByType;

  if (projectId) {
    URL = [endpoints.layout.list, { params: { project_id: projectId, page } }];
  } else {
    URL = '';
  }

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newObject, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newObject);

      cb();
      return mutate(
        `${URL}?project_id=${projectId}&page=${page}`,
        { ...data, option: [newObject, ...data.option] },
        false
      );
    },
    [CREATE_URL, URL, data, page, projectId]
  );

  const update = useCallback(
    async (newLayout) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, newLayout);
      return mutate(
        data.map(
          `${URL}?project_id=${projectId}&page=${page}`,
          (layout) => (layout.layout_id === result.layout_id ? result : newLayout),
          false
        ),
        false
      );
    },
    [UPDATE_URL, URL, data, page, projectId]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!id) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: { layout_id: id },
      });

      cb();

      return mutate(
        `${URL}?page=${page}`,
        {
          ...data,
          option: data.option.filter((layout) => layout.layout_id !== id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, page]
  );

  const memoizedValue = useMemo(
    () => ({
      layouts: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      page: data?.page || 1,
      layoutsLoading: isLoading,
      layoutsError: error,
      layoutsValidating: isValidating,
      layoutsEmpty: !isLoading && !data?.option?.length,
      create,
      remove,
      update,
    }),

    [create, data?.count, data?.option, data?.page, error, isLoading, isValidating, remove, update]
  );

  return memoizedValue;
}

export function useGetLayoutsByType(projectId, type = 1) {
  let URL = '';

  if (projectId) {
    URL = [endpoints.layout.listByType, { params: { project_id: projectId, layout_type: type } }];
  } else {
    URL = '';
  }

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      layouts: data?.length ? data : [],
      layoutsLoading: isLoading,
      layoutsError: error,
      layoutsValidating: isValidating,
      layoutsEmpty: !isLoading && !data?.option?.length,
    }),

    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
