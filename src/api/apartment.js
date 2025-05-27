import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetApartments(floorId, revalidateOnFocus = true) {
  const URL = floorId ? [endpoints.apartment.list, { params: { floor_id: floorId } }] : '';
  const UPLOAD_URL = endpoints.apartment.create;
  const UPDATE_URL = endpoints.apartment.update;
  const DELETE_URL = endpoints.apartment.delete;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    revalidateOnFocus: false,
  });

  const create = useCallback(
    async (newApartment, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPLOAD_URL, newApartment);

      cb();
      return mutate([...data, result.data], false);
    },
    [UPLOAD_URL, data, mutate]
  );

  const update = useCallback(
    async (newApartment, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, newApartment);

      cb();
      return mutate(
        data.map(
          (apartment) =>
            apartment.apartment_id === result?.data?.apartment_id ? result.data : apartment,
          false
        ),
        false
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
          apartment_id: id,
        },
      });

      cb();

      return mutate(
        data.filter((apartment) => apartment.apartment_id !== id, false),
        false
      );
    },
    [DELETE_URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      apartments: data?.length ? data : [],
      apartmentsLoading: isLoading,
      apartmentsError: error,
      apartmentsValidating: isValidating,
      apartmentsEmpty: !isLoading && !data?.length,
      create,
      update,
      remove,
    }),
    [data, isLoading, error, isValidating, create, update, remove]
  );

  return memoizedValue;
}

export function useGetApartmentInfo(apartmentId) {
  const URL = apartmentId
    ? [endpoints.apartment.info, { params: { apartment_id: apartmentId } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      apartment: data || null,
      apartmentLoading: isLoading,
      apartmentError: error,
      apartmentValidating: isValidating,
      apartmentEmpty: !isLoading && !data,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useGetApartmentsByFloor(floorId) {
  const URL = floorId ? [endpoints.apartment.list, { params: { floor_id: floorId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      apartments: data || null,
      apartmentsLoading: isLoading,
      apartmentsError: error,
      apartmentsValidating: isValidating,
      apartmentsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetApartmentOptions() {
  const URL = endpoints.apartment.apartmentoptions;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      apartmentOptions: data || null,
      apartmentOptionsLoading: isLoading,
      apartmentOptionsError: error,
      apartmentOptionsValidating: isValidating,
      apartmentOptionsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetApartmentImages(apartmentId) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const URL = apartmentId
    ? [endpoints.apartment.apartmentImages, { params: { apartment_id: apartmentId } }]
    : '';

  const UPLOAD_URL = endpoints.apartment.apartmentImageUpload;
  const DELETE_URL = endpoints.apartment.apartmentImageRemove;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const upload = useCallback(
    async (id, file, cb) => {
      if (!file) {
        return false;
      }
      const formData = new FormData();

      formData.append('apartment_image', file);

      await axios.post(`${UPLOAD_URL}?apartment_id=${id}`, formData);
      cb();

      return mutate();
    },
    [UPLOAD_URL, mutate]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!data) {
        return false;
      }
      await axios.delete(DELETE_URL, {
        data: {
          apartment_image_id: id,
        },
      });
      cb();

      return mutate();
    },
    [DELETE_URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      images: data || null,
      imagesLoading: isLoading,
      imagesError: error,
      imagesValidating: isValidating,
      imagesEmpty: !isLoading && !data,
      upload,
      remove,
    }),
    [data, error, isLoading, isValidating, remove, upload]
  );

  return memoizedValue;
}
