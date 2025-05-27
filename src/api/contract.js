import useSWR, { mutate } from 'swr';
import queryString from 'query-string';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetContracts(page = 1, contractStatus = '', contractType = '') {
  const URL = endpoints.contract.list;
  const CREATE_URL = endpoints.contract.create;
  const CREATE_WITH_PLAN_URL = endpoints.contract.createWithPlan;
  const UPDATE_URL = endpoints.contract.update;
  const UPDATE_WITH_PLAN_URL = endpoints.contract.updateWithPlan;
  const DELETE_URL = endpoints.contract.delete;
  const UPLOAD_FILE_URL = endpoints.contract.uploadFile;
  const CONFIRM_URL = endpoints.contract.confirm;

  const queryObject = {
    page,
  };

  if (contractStatus) {
    queryObject.contract_status = contractStatus;
  }

  if (contractType) {
    queryObject.contract_type = contractType;
  }

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const create = useCallback(
    async (newContract, cb) => {
      if (!newContract) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newContract);

      cb();
      return mutate(URL, { ...data, option: [result.data, ...data.option] }, false);
    },
    [CREATE_URL, URL, data]
  );

  const createWithPlan = useCallback(
    async (newContract, cb) => {
      if (!newContract) {
        return false;
      }
      const result = await axios.post(CREATE_WITH_PLAN_URL, newContract);

      cb();
      return mutate(URL, { ...data, option: [result.data, ...data.option] }, false);
    },
    [CREATE_WITH_PLAN_URL, URL, data]
  );

  const update = useCallback(
    async (contract, cb) => {
      if (!contract) {
        return false;
      }

      mutate(URL, { ...data, contractsLoading: true }, false);

      const result = await axios.post(UPDATE_URL, contract);

      cb();
      return mutate(
        URL,
        {
          ...data,
          option: data.option.map(
            (c) => (c.contract_id === result.data?.contract_id ? result.data : c),
            false
          ),
        },
        false
      );
    },
    [UPDATE_URL, URL, data]
  );

  const updateWithPlan = useCallback(
    async (contract, cb) => {
      if (!contract) {
        return false;
      }
      const result = await axios.post(UPDATE_WITH_PLAN_URL, contract);

      cb();
      return mutate(
        URL,
        {
          ...data,
          option: data.option.map(
            (c) => (c.contract_id === result.data?.contract_id ? result.data : c),
            false
          ),
        },
        false
      );
    },
    [UPDATE_WITH_PLAN_URL, URL, data]
  );

  const confirm = useCallback(
    async (confirmData, cb) => {
      if (!confirmData) {
        return false;
      }

      mutate(URL, { ...data, contractsLoading: true }, false);

      const result = await axios.post(CONFIRM_URL, confirmData);

      cb();
      return mutate();
    },
    [CONFIRM_URL, URL, data]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!id) {
        return false;
      }
      const { result } = await axios.delete(DELETE_URL, {
        data: { contract_id: id },
      });

      cb();

      return mutate(`${URL}?${query}`);
    },
    [DELETE_URL, URL, query]
  );

  const uploadDocumentFile = useCallback(
    async (file, cb) => {
      if (!file) {
        return false;
      }
      const result = await axios.post(UPLOAD_FILE_URL, file);

      cb();
      return mutate(
        URL,
        {
          ...data,
          option: data.option.map(
            (c) => (c.contract_id === result.data?.contract_id ? result.data : c),
            false
          ),
        },
        false
      );
    },
    [UPLOAD_FILE_URL, URL, data]
  );

  const memoizedValue = useMemo(
    () => ({
      contracts: data?.option || [],
      count: data?.count || 0,
      countConfirmed: data?.confirmed_count || 0,
      countProcess: data?.process_count || 0,
      page: data?.page || 1,
      contractsLoading: isLoading,
      contractsError: error,
      contractsValidating: isValidating,
      contractsEmpty: !isLoading && !data?.option.length,
      create,
      createWithPlan,
      update,
      updateWithPlan,
      remove,
      confirm,
    }),
    [
      data?.option,
      data?.count,
      data?.confirmed_count,
      data?.process_count,
      data?.page,
      isLoading,
      error,
      isValidating,
      create,
      createWithPlan,
      update,
      updateWithPlan,
      remove,
      confirm,
    ]
  );

  return memoizedValue;
}

export function useGetContractInfo(id) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const URL = id ? [endpoints.contract.detail, { params: { contract_id: id } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const refresh = useCallback(async () => mutate(URL), [URL]);

  const memoizedValue = useMemo(
    () => ({
      contract: data || null,
      contractLoading: isLoading,
      contractError: error,
      contractValidating: isValidating,
      contractEmpty: !isLoading && !data,
      refresh,
    }),
    [data, isLoading, error, isValidating, refresh]
  );

  return memoizedValue;
}

export function useSearchContracts(query) {
  const URL = query
    ? [endpoints.contract.search, { method: 'post', data: { keyword: query } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchContractResults: data || [],
      searchContractLoading: isLoading,
      searchContractError: error,
      searchContractValidating: isValidating,
      searchContractEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useSearchClientsFromContract(query) {
  const URL = query
    ? [endpoints.contract.searchClient, { method: 'post', data: { keyword: query } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data || [],
      searchResultsLoading: isLoading,
      searchResultsError: error,
      searchResultsValidating: isValidating,
      searchResultsEmpty: !isLoading && !data,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetOverduedays(page = 1) {
  const URL = endpoints.contract.overduedays;

  const { data, isLoading, error, isValidating } = useSWR(`${URL}?page=${page}`, fetcher);

  const memoizedValue = useMemo(
    () => ({
      overduedays: data?.option || [],
      count: data?.count || 0,
      overduedaysLoading: isLoading,
      overduedaysError: error,
      overduedaysValidating: isValidating,
      overduedaysEmpty: !isLoading && !data?.option?.length,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}
