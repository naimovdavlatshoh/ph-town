import useSWR, { mutate } from 'swr';
import queryString from 'query-string';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetArrivals(page = 1, contractStatus = '', contractType = '', clientId) {
  const URL = endpoints.warehouse.arrivalList;

  const CREATE_URL = endpoints.warehouse.arrivalCreate;
  const DELETE_URL = endpoints.warehouse.arrivalDelete;
  const ARRIVAL_URL = endpoints.payment.payKassaSklad;

  const queryObject = {
    page,
  };

  if (contractStatus) {
    queryObject.contract_status = contractStatus;
  }

  if (contractType) {
    queryObject.contract_type = contractType;
  }

  if (clientId) {
    queryObject.client_id = clientId;
  }

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const create = useCallback(
    async (newArrival, cb) => {
      if (!newArrival) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newArrival);

      cb();
      return mutate(
        `${URL}?${query}`,
        { ...data, option: [result.data, ...data.option], count: +data.count + 1 },
        false
      );
    },
    [CREATE_URL, URL, data, query]
  );

  const pay = useCallback(
    async (arrivalData, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(ARRIVAL_URL, arrivalData);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [ARRIVAL_URL, URL, data, query]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!id) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: { arrival_id: id },
      });

      cb();

      return mutate(
        `${URL}?${query}`,
        {
          ...data,
          option: data.option.filter((m) => m.contract_id !== id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, query]
  );

  const memoizedValue = useMemo(
    () => ({
      arrivals: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      arrivalsLoading: isLoading,
      arrivalsError: error,
      arrivalsValidating: isValidating,
      arrivalsEmpty: !isLoading && !data?.option.length,
      create,
      remove,
      pay,
    }),
    [data?.option, data?.count, data?.page, isLoading, error, isValidating, create, remove, pay]
  );

  return memoizedValue;
}

export function useGetArrivalDetail(id) {
  const URL = id ? endpoints.warehouse.arrivalDetails : '';

  const queryObject = {
    arrival_id: id,
  };

  const query = queryString.stringify(queryObject);

  const path = id ? `${URL}?${query}` : '';

  const { data, isLoading, error, isValidating } = useSWR(path, fetcher);

  const memoizedValue = useMemo(
    () => ({
      arrival: data || null,
      arrivalLoading: isLoading,
      arrivalError: error,
      arrivalValidating: isValidating,
      arrivalEmpty: !isLoading && !data,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useGetExpenditure(page = 1, contractStatus = '', contractType = '') {
  const URL = endpoints.warehouse.expenditureList;
  const CREATE_URL = endpoints.warehouse.expenditureCreate;
  const DELETE_URL = endpoints.warehouse.expenditureDelete;

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
    async (newExpenditure, cb) => {
      if (!newExpenditure) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newExpenditure);

      cb();
      return mutate(
        `${URL}?${query}`,
        { ...data, option: [result.data, ...data.option], count: +data.count + 1 },
        false
      );
    },
    [CREATE_URL, URL, data, query]
  );

  const remove = useCallback(
    async (id, cb) => {
      if (!id) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: { arrival_id: id },
      });

      cb();

      return mutate(
        `${URL}?${query}`,
        {
          ...data,
          option: data.option.filter((m) => m.expenditure_id !== id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, query]
  );

  const memoizedValue = useMemo(
    () => ({
      expenditures: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      expendituresLoading: isLoading,
      expendituresError: error,
      expendituresValidating: isValidating,
      expendituresEmpty: !isLoading && !data?.option.length,
      create,
      remove,
    }),
    [data?.option, data?.count, data?.page, isLoading, error, isValidating, create, remove]
  );

  return memoizedValue;
}

export function useGetWarehouse(page = 1, contractStatus = '', contractType = '') {
  const URL = endpoints.warehouse.list;

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

  const memoizedValue = useMemo(
    () => ({
      warehouse: data?.option || [],
      count: data?.count || 0,
      page: data?.page || 1,
      warehouseLoading: isLoading,
      warehouseError: error,
      warehouseValidating: isValidating,
      warehouseEmpty: !isLoading && !data?.option.length,
    }),
    [data?.option, data?.count, data?.page, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useSearchWarehouse(query) {
  const URL = query
    ? [endpoints.warehouse.search, { method: 'post', data: { keyword: query } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      warehouseSearchResults: data || [],
      warehouseSearchLoading: isLoading,
      warehouseSearchError: error,
      warehouseSearchValidating: isValidating,
      warehouseSearchEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useSearchInvoice(query) {
  const URL = query
    ? [endpoints.warehouse.invoiceSearch, { method: 'post', data: { keyword: query } }]
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
