import useSWR from 'swr';
// eslint-disable-next-line import/no-extraneous-dependencies
import queryString from 'query-string';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetRealtors(page = 1) {
  const URL = endpoints.realtors.list;
  const DELETE_URL = endpoints.realtors.delete;
  const CREATE_URL = endpoints.realtors.create;

  const queryObject = {
    page,
  };

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const create = useCallback(
    // eslint-disable-next-line consistent-return
    async (newPay, cb, errCb) => {
      try {
        if (!data) {
          return false;
        }
        const result = await axios.post(CREATE_URL, newPay);

        cb();
        return mutate(`${URL}?${query}`);
      } catch (err) {
        errCb();
      }
    },
    [CREATE_URL, URL, data, mutate, query]
  );

  const remove = useCallback(
    async (realtor_id, cb) => {
      if (!realtor_id) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: {
          realtor_id,
        },
      });

      cb();

      return mutate();
    },
    [DELETE_URL, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      realtors: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      realtorsLoading: isLoading,
      realtorsError: error,
      realtorsValidating: isValidating,
      realtorsEmpty: !isLoading && !data?.option?.length,
      create,
      remove,
    }),
    [
      data?.option,
      data?.count,
      data?.cash_information,
      isLoading,
      error,
      isValidating,
      create,
      remove,
    ]
  );

  return memoizedValue;
}

export function useSearchRealtors(query) {
  const URL = query
    ? [endpoints.realtors.search, { method: 'post', data: { keyword: query } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetPaymentInfo(contractId) {
  const URL = endpoints.payment.info;

  const { data, isLoading, error, mutate, isValidating } = useSWR(
    `${URL}?contract_id=${contractId}`,
    fetcher
  );

  const memoizedValue = useMemo(
    () => ({
      paymentData: data || null,
      paymentLoading: isLoading,
      paymentError: error,
      paymentValidating: isValidating,
      paymentEmpty: !isLoading && !data,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useGetRealtorContracts(page = 1) {
  const URL = endpoints.realtors.contractList;
  const DELETE_URL = endpoints.realtors.contractDelete;
  const CREATE_URL = endpoints.realtors.contractAdd;
  const UPDATE_URL = endpoints.realtors.contractUpdate;

  const queryObject = {
    page,
  };

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const create = useCallback(
    // eslint-disable-next-line consistent-return
    async (newData, cb, errCb) => {
      try {
        if (!data) {
          return false;
        }
        const result = await axios.post(CREATE_URL, newData);

        cb();
        return mutate(`${URL}?${query}`);
      } catch (err) {
        errCb();
      }
    },
    [CREATE_URL, URL, data, mutate, query]
  );

  const update = useCallback(
    // eslint-disable-next-line consistent-return
    async (newData, cb, errCb) => {
      try {
        if (!data) {
          return false;
        }
        const result = await axios.post(UPDATE_URL, newData);

        cb();
        return mutate(`${URL}?${query}`);
      } catch (err) {
        errCb();
      }
    },
    [UPDATE_URL, URL, data, mutate, query]
  );

  const remove = useCallback(
    // eslint-disable-next-line consistent-return
    async (deleteData, cb, errCb) => {
      try {
        if (!deleteData) {
          return false;
        }
        const result = await axios.delete(DELETE_URL, {
          data: {
            realtor_contract_id: deleteData,
          },
        });

        cb();

        return mutate();
      } catch (err) {
        errCb();
      }
    },
    [DELETE_URL, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      realtorContracts: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      realtorContractsLoading: isLoading,
      realtorContractsError: error,
      realtorContractsValidating: isValidating,
      realtorContractsEmpty: !isLoading && !data?.option?.length,
      create,
      update,
      remove,
    }),
    [
      data?.option,
      data?.count,
      data?.cash_information,
      isLoading,
      error,
      isValidating,
      create,
      update,
      remove,
    ]
  );

  return memoizedValue;
}

export function useGetKassaBankCategories(page = 1) {
  const URL = endpoints.payment.kassaBankCategories;
  const CREATE_URL = endpoints.payment.kassaBankCategoriesCreate;
  const UPDATE_URL = endpoints.payment.kassaBankCategoriesUpdate;

  const queryObject = {
    page,
  };

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const create = useCallback(
    async (newData, cb) => {
      if (!newData) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newData);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [CREATE_URL, URL, mutate, query]
  );

  const update = useCallback(
    async (updateData, cb) => {
      if (!updateData) {
        return false;
      }
      const result = await axios.post(UPDATE_URL, updateData);

      cb();

      return mutate(`${URL}?${query}`);
    },
    [UPDATE_URL, URL, mutate, query]
  );

  const memoizedValue = useMemo(
    () => ({
      kassBankCategories: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      currentUsdRate: data?.current_usd_rate,
      kassBankCategoriesLoading: isLoading,
      kassBankCategoriesError: error,
      kassBankCategoriesValidating: isValidating,
      kassBankCategoriesEmpty: !isLoading && !data?.option?.length,
      update,
      create,
    }),
    [
      data?.option,
      data?.count,
      data?.cash_information,
      data?.current_usd_rate,
      isLoading,
      error,
      isValidating,
      update,
      create,
    ]
  );

  return memoizedValue;
}

export function useSearchKassaBankCategories(query) {
  const URL = query
    ? [endpoints.payment.kassaBankSearch, { method: 'post', data: { keyword: query } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
