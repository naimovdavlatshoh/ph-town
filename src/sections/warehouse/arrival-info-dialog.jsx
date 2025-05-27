/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import moment from 'moment';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import {
  Paper,
  Table,
  Button,
  Divider,
  MenuItem,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
  TableContainer,
} from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { useGetClients, useSearchClients } from 'src/api/clients';

import { RHFSelect } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';

import { RenderCellCreatedAt } from '../client/client-table-row';

// ----------------------------------------------------------------------

const PAYMENT_METHODS_OPTIONS = [
  {
    payment_method: '1',
    label: 'Наличка',
  },
  {
    payment_method: '2',
    label: 'Терминал',
  },
  {
    payment_method: '3',
    label: 'Клик',
  },
  {
    payment_method: '4',
    label: 'Банк',
  },
];

const getPaymentMethodTitle = (id) => {
  if (id === '1') return 'Наличка';
  if (id === '2') return 'Терминал';
  if (id === '3') return 'Клик';
  if (id === '4') return 'Банк';

  return '';
};

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
    return `"${client?.business_name}". Директор: ${
      client?.business_director_name || 'Не заполнен'
    }`;
  }
  return '';
};

export default function ArrivalInfoDialog({
  title = 'Инфо о приходе',
  data,
  list,
  action,
  //
  open,
  onClose,
  pay,
  //
  selected,
  onSelect,
  exportType,
}) {
  const [loadingCheckRowsData, setLoadingCheckRowsData] = useState(false);
  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
  const [clientTerm, setClientTerm] = useState('');
  const [clientTermHelper, setClientTermHelper] = useState('');
  const debouncedQuery = useDebounce(clientTerm, 3);

  const { clients, clientsLoading } = useGetClients();
  const { searchResults, searchLoading } = useSearchClients(debouncedQuery);

  const [loading, setLoading] = useState(false);

  const NewWarehouseSchema = Yup.object().shape({
    payment_amount: Yup.string()
      .required('Введите сумму')
      // eslint-disable-next-line no-unsafe-optional-chaining
      .test('min', 'Минимальная сумма 1 UZS', (value) => +value?.replace(/,/g, '') >= 1)
      .test(
        'max',
        `Максимальная сумма ${fCurrency(
          data?.total_price -
            data?.payment_history?.reduce((prev, curr) => prev + +curr?.payment_amount, 0)
        )} UZS`,
        // eslint-disable-next-line no-unsafe-optional-chaining
        (value) =>
          +value?.replace(/,/g, '') <=
          +data?.total_price -
            data?.payment_history?.reduce((prev, curr) => prev + +curr?.payment_amount, 0)
      ),
    payment_method: Yup.string().required('Выберите вариант оплаты'),
  });

  const defaultValues = useMemo(
    () => ({
      payment_amount: '',
      payment_method: '',
    }),
    []
  );

  const handleClose = () => {
    // eslint-disable-next-line no-unused-expressions

    setLoading(false);
    methods.reset();
    onClose();
  };

  const methods = useForm({
    resolver: yupResolver(NewWarehouseSchema),

    defaultValues,
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);

    try {
      pay(
        {
          arrival_id: data?.arrival_id,
          payment_amount: values?.payment_amount?.replace(/,/g, ''),
          payment_method: values?.payment_method,
        },
        () => {
          enqueueSnackbar('Файл успешно загружен!', {
            variant: 'success',
          });
          handleClose();
        }
      );
    } catch (error) {
      setLoading(false);
      console.error(error);
    } finally {
      // setLoading(false);
    }
  });

  const checkRowsExportData = async (values) => {
    let url = '';

    if (exportType?.value === '1') {
      url = '/api/v1/arrival/excel';
    }
    if (exportType?.value === '2') {
      url = '/api/v1/expenditure/excel';
    }

    if (exportType?.value === '3') {
      url = '/api/v1/warehouse/excel';
    }

    const queryObject = {
      row_count: 1,
    };

    if (moment(values.startDate).isValid()) {
      queryObject.startdate = moment(values.startDate).valueOf();
    }

    if (moment(values.endDate).isValid()) {
      queryObject.enddate = moment(values.endDate).valueOf();
    }

    if (values.client) {
      queryObject.client_id = values.client?.client_id;
    }

    const query = queryString.stringify(queryObject);

    setLoadingCheckRowsData(true);
    try {
      const result = await axios.get(`${url}?${query}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCheckRowsData(false);
    }
  };

  useEffect(() => {
    const values = methods.watch();

    if (!(values.startDate && values.endDate)) {
      return;
    }

    checkRowsExportData(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('client'), methods.watch('endDate'), methods.watch('startDate')]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={0.5}>
            {title}
            {exportType?.label && <Typography variant="caption">({exportType?.label})</Typography>}
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ position: 'relative' }}>
          <Stack pt={1} direction="row" justifyContent="space-between">
            <Typography>Инвойс: {data?.invoice_number}</Typography>
          </Stack>
          <Stack pt={1} direction="row" justifyContent="space-between">
            <Typography>Клиент: {`${data?.client_surname} ${data?.client_name}`}</Typography>
          </Stack>
          <Stack py={1} direction="row" justifyContent="space-between">
            <Typography>Сырьё: {data?.material_name}</Typography>
            <Typography>Кол-во: 100 {data?.unit_name}</Typography>
          </Stack>
          <Divider />
          <Stack mb={3} pt={1} direction="column" justifyContent="space-between">
            <Typography sx={{ textDecoration: 'underline' }}>
              Сумма оплаты: {fCurrency(data?.total_price)} UZS
            </Typography>
            <Typography sx={{ textDecoration: 'underline' }}>
              Оплачено:{' '}
              {fCurrency(
                // eslint-disable-next-line no-unsafe-optional-chaining
                data?.payment_history?.reduce((prev, curr) => prev + +curr?.payment_amount, 0)
              )}
              UZS
            </Typography>
          </Stack>
          {loadingCheckRowsData && (
            <LoadingScreen
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 99999,
                background: '#fff',
              }}
              title="Проверка данных..."
            />
          )}
          <Typography fontWeight={700} mt={2}>
            История оплат
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Метод</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.payment_history?.map((row, idx) => (
                  <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <RenderCellCreatedAt
                        params={{
                          row: {
                            created_at: row?.created_at,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {getPaymentMethodTitle(row?.payment_method)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" color="success.main">
                        +{fCurrency(row?.payment_amount)} UZS
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>{' '}
          {data?.is_paid !== '3' && (
            <>
              <Typography fontWeight={700} mt={2}>
                Оплатить остаток
              </Typography>
              <Stack spacing={2} pt={2}>
                <RHFSelect
                  fullWidth
                  name="payment_method"
                  label="Вариант оплаты"
                  InputLabelProps={{ shrink: true }}
                >
                  {PAYMENT_METHODS_OPTIONS.map((el, idx) => (
                    <MenuItem key={el.idx} value={el.payment_method}>
                      <Stack
                        width="100%"
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="caption"> {el.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFCurrencyField
                  name="payment_amount"
                  label="Цена"
                  placeholder="0"
                  decimalScale={0}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: <InputAdornment position="start">UZS</InputAdornment>,
                  }}
                />
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          {data?.is_paid !== '3' && (
            <LoadingButton type="submit" variant="contained" color="primary" loading={loading}>
              Оплатить
            </LoadingButton>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ArrivalInfoDialog.propTypes = {
  action: PropTypes.node,
  pay: PropTypes.func,
  list: PropTypes.array,
  exportType: PropTypes.object,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.func,
  title: PropTypes.string,
  data: PropTypes.object,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (address) =>
        address.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        address.fullAddress.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        `${address.company}`.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
