import useSWR from 'swr';
import moment from 'moment';
import { useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import queryString from 'query-string';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBank(page = 1, startdate = '', enddate = '', clientId) {
  const URL = endpoints.bank.list;

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

  const { data, isLoading, error, isValidating } = useSWR(`${URL}?${query}`, fetcher);

  const memoizedValue = useMemo(
    () => ({
      payments: data?.option?.length ? data?.option : [],
      count: data?.count || 0,
      cashInformation: data?.cash_information?.length ? data?.cash_information : [],
      paymentsLoading: isLoading,
      paymentsError: error,
      paymentsValidating: isValidating,
      paymentsEmpty: !isLoading && !data?.option?.length,
    }),
    [data?.option, data?.count, data?.cash_information, isLoading, error, isValidating]
  );

  return memoizedValue;
}
