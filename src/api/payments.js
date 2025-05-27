import useSWR from 'swr';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import queryString from 'query-string';
import { useMemo, useCallback } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetPayments(page = 1, startdate = '', enddate = '', clientId) {
  const URL = endpoints.payment.list;
  const DELETE_URL = endpoints.payment.delete;
  const CREATE_URL = endpoints.payment.pay;
  const CREATE_URL2 = endpoints.payment.pay2;

  const queryObject = {
    page,
  };

  if (moment(startdate).isValid()) {
    queryObject.startdate = moment(startdate).valueOf();
  }

  if (moment(enddate).isValid()) {
    queryObject.enddate = moment(enddate).valueOf();
  }

  if (clientId) {
    queryObject.client_id = clientId;
  }

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const create = useCallback(
    async (newPay, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newPay);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [CREATE_URL, URL, data, mutate, query]
  );

  const create2 = useCallback(
    async (newPay, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL2, newPay);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [CREATE_URL2, URL, data, mutate, query]
  );

  const remove = useCallback(
    async (deleteData, cb) => {
      if (!deleteData) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: deleteData,
      });

      cb();

      return mutate(
        URL,
        {
          ...data,
          option: data.option.filter((m) => m.kassa_id !== deleteData?.kassa_id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      payments: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      paymentsLoading: isLoading,
      paymentsError: error,
      paymentsValidating: isValidating,
      paymentsEmpty: !isLoading && !data?.option?.length,
      create,
      create2,
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
      create2,
      remove,
    ]
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

export function useGetKassaSklad(page = 1, startdate = '', enddate = '', clientId) {
  const URL = endpoints.payment.payKassaSkladList;
  const DELETE_URL = endpoints.payment.deleteKassaSklad;
  const CREATE_URL = endpoints.payment.pay;
  const CREATE_URL2 = endpoints.payment.pay2;
  const PAY_URL = endpoints.payment.payKassaSklad;

  const queryObject = {
    page,
  };

  if (moment(startdate).isValid()) {
    queryObject.startdate = moment(startdate).valueOf();
  }

  if (moment(enddate).isValid()) {
    queryObject.enddate = moment(enddate).valueOf();
  }

  if (clientId) {
    queryObject.client_id = clientId;
  }

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const pay = useCallback(
    async (payData, cb) => {
      if (!payData) {
        return false;
      }
      const result = await axios.post(PAY_URL, payData);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [PAY_URL, URL, mutate, query]
  );

  const create = useCallback(
    async (newPay, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL, newPay);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [CREATE_URL, URL, data, mutate, query]
  );

  const create2 = useCallback(
    async (newPay, cb) => {
      if (!data) {
        return false;
      }
      const result = await axios.post(CREATE_URL2, newPay);

      cb();
      return mutate(`${URL}?${query}`);
    },
    [CREATE_URL2, URL, data, mutate, query]
  );

  const remove = useCallback(
    async (deleteData, cb) => {
      if (!deleteData) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: deleteData,
      });

      cb();

      return mutate(
        URL,
        {
          ...data,
          option: data.option.filter((m) => m.kassa_id !== deleteData?.kassa_id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      kassSklad: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      kassSkladLoading: isLoading,
      kassSkladError: error,
      kassSkladValidating: isValidating,
      kassSkladEmpty: !isLoading && !data?.option?.length,
      create,
      create2,
      remove,
      pay,
    }),
    [
      data?.option,
      data?.count,
      data?.cash_information,
      isLoading,
      error,
      isValidating,
      create,
      create2,
      remove,
      pay,
    ]
  );

  return memoizedValue;
}

export function useGetKassaBankExpenditure(page = 1, startdate = '', enddate = '', categoryId) {
  const URL = endpoints.payment.kassaBankExpenditureList;
  const DELETE_URL = endpoints.payment.kassaBankDeleteExpenditure;
  const PAY_URL = endpoints.payment.kassaBankPayExpenditure;
  const SET_RATE_URL = endpoints.payment.kassaBankSetRateExpenditure;

  const queryObject = {
    page,
  };

  if (moment(startdate).isValid()) {
    queryObject.startdate = moment(startdate).valueOf();
  }

  if (moment(enddate).isValid()) {
    queryObject.enddate = moment(enddate).valueOf();
  }

  if (categoryId) {
    queryObject.bank_category_id = categoryId;
  }

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const pay = useCallback(
    // eslint-disable-next-line consistent-return
    async (payData, cb = () => {}, errorCb = () => {}) => {
      if (!payData) {
        return false;
      }
      try {
        const result = await axios.post(PAY_URL, payData);

        cb();
        return mutate(`${URL}?${query}`);
      } catch (e) {
        errorCb();
      }
    },
    [PAY_URL, URL, mutate, query]
  );

  const remove = useCallback(
    async (deleteData, cb) => {
      if (!deleteData) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: deleteData,
      });

      cb();

      return mutate(
        URL,
        {
          ...data,
          option: data.option.filter((m) => m.kassa_id !== deleteData?.kassa_id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, mutate]
  );

  const setRate = useCallback(
    // eslint-disable-next-line consistent-return
    async (rate, cb = () => {}, errorCb = () => {}) => {
      if (!rate) {
        return false;
      }
      try {
        const result = await axios.post(SET_RATE_URL, {
          dollar_rate: rate,
        });

        cb();
        return mutate(`${URL}?${query}`);
      } catch (e) {
        errorCb();
      }
    },
    [SET_RATE_URL, URL, mutate, query]
  );

  const memoizedValue = useMemo(
    () => ({
      kassBankExpedniture: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      kassBankExpednitureLoading: isLoading,
      kassBankExpednitureError: error,
      kassBankExpednitureValidating: isValidating,
      kassBankExpednitureEmpty: !isLoading && !data?.option?.length,
      currentUsdRate: data?.current_usd_rate,
      balanceCash: data?.balance_cash,
      balanceClick: data?.balance_click,
      remove,
      pay,
      setRate,
    }),
    [
      data?.option,
      data?.count,
      data?.cash_information,
      data?.current_usd_rate,
      data?.balance_cash,
      data?.balance_click,
      isLoading,
      error,
      isValidating,
      remove,
      pay,
      setRate,
    ]
  );

  return memoizedValue;
}

export function useGetKassaBankArrival(page = 1, startdate = '', enddate = '', categoryId) {
  const URL = endpoints.payment.kassaBankArrivalList;
  const DELETE_URL = endpoints.payment.kassaBankDeleteArrival;
  const PAY_URL = endpoints.payment.kassaBankPayArrival;

  const queryObject = {
    page,
  };

  if (moment(startdate).isValid()) {
    queryObject.startdate = moment(startdate).valueOf();
  }

  if (moment(enddate).isValid()) {
    queryObject.enddate = moment(enddate).valueOf();
  }

  if (categoryId) {
    queryObject.bank_category_id = categoryId;
  }

  const query = queryString.stringify(queryObject);

  const { data, isLoading, error, mutate, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const pay = useCallback(
    // eslint-disable-next-line consistent-return
    async (payData, cb = () => {}, errorCb = () => {}) => {
      if (!payData) {
        return false;
      }
      try {
        const result = await axios.post(PAY_URL, payData);

        cb();
        return mutate(`${URL}?${query}`);
      } catch (e) {
        errorCb();
      }
    },
    [PAY_URL, URL, mutate, query]
  );

  const remove = useCallback(
    async (deleteData, cb) => {
      if (!deleteData) {
        return false;
      }
      const result = await axios.delete(DELETE_URL, {
        data: deleteData,
      });

      cb();

      return mutate(
        URL,
        {
          ...data,
          option: data.option.filter((m) => m.kassa_id !== deleteData?.kassa_id, false),
          count: data.count - 1,
        },
        false
      );
    },
    [DELETE_URL, URL, data, mutate]
  );

  const memoizedValue = useMemo(
    () => ({
      kassBankArrival: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      kassBankArrivalLoading: isLoading,
      kassBankArrivalError: error,
      kassBankArrivalValidating: isValidating,
      kassBankArrivalEmpty: !isLoading && !data?.option?.length,
      currentUsdRate: data?.current_usd_rate,
      remove,
      pay,
    }),
    [
      data?.option,
      data?.count,
      data?.cash_information,
      data?.current_usd_rate,
      isLoading,
      error,
      isValidating,
      remove,
      pay,
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
