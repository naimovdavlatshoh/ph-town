import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Блоки парковки (по объекту)

export function useGetParkingBlocks(projectId) {
  const URL = projectId
    ? [endpoints.parking.blockList, { params: { project_id: projectId } }]
    : '';

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newBlock, cb) => {
      await axios.post(endpoints.parking.blockCreate, newBlock);
      cb?.();
      return mutate();
    },
    [mutate]
  );

  const update = useCallback(
    async (blockData, cb) => {
      await axios.post(endpoints.parking.blockUpdate, blockData);
      cb?.();
      return mutate();
    },
    [mutate]
  );

  const remove = useCallback(
    async (parkingBlockId, cb) => {
      await axios.delete(endpoints.parking.blockDelete, {
        data: { parking_block_id: parkingBlockId },
      });
      cb?.();
      return mutate();
    },
    [mutate]
  );

  return useMemo(
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
}

// ----------------------------------------------------------------------
// Этажи парковки (по блоку)

export function useGetParkingFloors(blockId) {
  const URL = blockId
    ? [endpoints.parking.floorList, { params: { parking_block_id: blockId } }]
    : '';

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newFloor, cb) => {
      await axios.post(endpoints.parking.floorCreate, newFloor);
      cb?.();
      return mutate();
    },
    [mutate]
  );

  const update = useCallback(
    async (floorData, cb) => {
      await axios.post(endpoints.parking.floorUpdate, floorData);
      cb?.();
      return mutate();
    },
    [mutate]
  );

  const remove = useCallback(
    async (parkingFloorId, cb) => {
      await axios.delete(endpoints.parking.floorDelete, {
        data: { parking_floor_id: parkingFloorId },
      });
      cb?.();
      return mutate();
    },
    [mutate]
  );

  return useMemo(
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
}

// ----------------------------------------------------------------------
// Парковочные места (по этажу)

export function useGetParkingSpots(floorId) {
  const URL = floorId
    ? [endpoints.parking.spotList, { params: { parking_floor_id: floorId } }]
    : '';

  const { data, isLoading, error, mutate, isValidating } = useSWR(URL, fetcher);

  const create = useCallback(
    async (newSpot, cb) => {
      await axios.post(endpoints.parking.spotCreate, newSpot);
      cb?.();
      return mutate();
    },
    [mutate]
  );

  const update = useCallback(
    async (spotData, cb) => {
      await axios.post(endpoints.parking.spotUpdate, spotData);
      cb?.();
      return mutate();
    },
    [mutate]
  );

  const remove = useCallback(
    async (parkingSpotId, cb) => {
      await axios.delete(endpoints.parking.spotDelete, {
        data: { parking_spot_id: parkingSpotId },
      });
      cb?.();
      return mutate();
    },
    [mutate]
  );

  return useMemo(
    () => ({
      spots: data?.length ? data : [],
      spotsLoading: isLoading,
      spotsError: error,
      spotsValidating: isValidating,
      spotsEmpty: !isLoading && !data?.length,
      create,
      update,
      remove,
    }),
    [data, isLoading, error, isValidating, create, update, remove]
  );
}

// ----------------------------------------------------------------------
// Дерево для Шахматки-Парковки: блок → этаж → место.
// Отдельного tree-эндпоинта нет, поэтому собираем из трёх списков.

async function parkingBoardFetcher(projectId) {
  const blocksRes = await axios.get(endpoints.parking.blockList, {
    params: { project_id: projectId },
  });
  const blocks = blocksRes.data || [];

  return Promise.all(
    blocks.map(async (block) => {
      const floorsRes = await axios.get(endpoints.parking.floorList, {
        params: { parking_block_id: block.parking_block_id },
      });
      const floors = floorsRes.data || [];

      const floorsWithSpots = await Promise.all(
        floors.map(async (floor) => {
          const spotsRes = await axios.get(endpoints.parking.spotList, {
            params: { parking_floor_id: floor.parking_floor_id },
          });
          return { ...floor, spots: spotsRes.data || [] };
        })
      );

      return { ...block, floors: floorsWithSpots };
    })
  );
}

export function useGetParkingBoard(projectId) {
  const { data, isLoading, error, isValidating } = useSWR(
    projectId ? ['parking-board', projectId] : null,
    ([, id]) => parkingBoardFetcher(id)
  );

  return useMemo(
    () => ({
      board: data || [],
      boardLoading: isLoading,
      boardError: error,
      boardValidating: isValidating,
      boardEmpty: !isLoading && !data?.length,
    }),
    [data, isLoading, error, isValidating]
  );
}
