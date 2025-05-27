import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetProjectVisual(projectId) {
  const URL = projectId ? [endpoints.visual.project, { params: { project_id: projectId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      projectVisual: data || null,
      projectVisualLoading: isLoading,
      projectVisualError: error,
      projectVisualValidating: isValidating,
      projectVisualEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetBlockVisual(blockId) {
  const URL = blockId ? [endpoints.visual.block, { params: { block_id: blockId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      blockVisual: data || null,
      blockVisualLoading: isLoading,
      blockVisualError: error,
      blockVisualValidating: isValidating,
      blockVisualEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
