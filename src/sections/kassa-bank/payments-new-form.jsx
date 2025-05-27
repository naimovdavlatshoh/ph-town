/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Check } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Switch, MenuItem, Typography, InputAdornment } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { fCurrency } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';
import {
  useGetKassaBankCategories,
  useGetKassaBankExpenditure,
  useSearchKassaBankCategories,
} from 'src/api/payments';

import { LoadingScreen } from 'src/components/loading-screen';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import ArrivalInfo from './arrival-info';

const Android12Switch = styled(Switch)(({ theme }) => ({
  width: '80px',
  height: '35px',
  padding: 0,

  '& .MuiSwitch-track': {
    borderRadius: 22 / 4,
    background: '#00B8D9',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      content: '"UZS"',
      color: '#fff',
      fontSize: 12,
      left: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    '&::after': {
      content: '"USD"',
      color: '#fff',
      fontSize: 12,
      right: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 0,
    left: 0,
    right: 0,
    height: '100%',
    transform: 'translateX(-18px)',
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    transform: 'translateX(18px)',
  },

  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: '50%',
    height: 'calc(100% - 5px)',
    borderRadius: 2,
    // margin: 2,
  },
}));

// ----------------------------------------------------------------------

function makeColor(value) {
  if (!value) {
    return '';
  }

  return value?.startsWith('-') ? 'red' : '';
}

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
    return `"${client?.client_surname}" - ${client.client_name}`;
  }
  return '';
};

export default function PaymentsNewForm({ open, onClose, data, pay, balanceCash, balanceClick }) {
  const [cashType, setCashType] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [categoryTerm, setCategoryTerm] = useState('');
  const [categoryTermHelper, setCategoryTermHelper] = useState('');
  const debouncedQuery = useDebounce(categoryTerm, 3);

  const { kassBankCategories, kassBankCategoriesLoading } = useGetKassaBankCategories();

  const { searchResults, searchLoading } = useSearchKassaBankCategories(debouncedQuery);

  const { currentUsdRate } = useGetKassaBankExpenditure();

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewPaymentsSchema = Yup.object().shape({
    category: Yup.object().nullable().required('Выберите категорию'),
    paymentMethod: Yup.string().required('Выберите метод оплаты'),
    payment_amount: Yup.string().required('Введите сумму'),
    comments: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      paymentMethod: '1',
      payment_amount: '',
      comments: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewPaymentsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const convertCurrency = () => {
    if (!methods.watch('payment_amount')) return;

    let newPaymentAmount = parseFloat(methods.watch('payment_amount')?.replace(/,/g, ''));

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(newPaymentAmount)) {
      newPaymentAmount = 0;
    }

    if (!cashType) {
      // Конвертация из рублей в доллары
      newPaymentAmount /= currentUsdRate;
    } else {
      // Конвертация из долларов в рубли
      newPaymentAmount *= currentUsdRate;
    }

    methods.setValue('payment_amount', `${Math.round(newPaymentAmount)}`);
    setCashType(cashType);
  };

  useEffect(() => {
    if (data) {
      methods.setValue('category', data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    methods.resetField('payment_amount');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('paymentMethod')]);

  const onSubmit = handleSubmit(async (values) => {
    setPayLoading(true);
    try {
      pay(
        {
          bank_category_id: values?.category?.category_id,
          payment_amount: values?.payment_amount?.replace(/,/g, ''),
          payment_method: values?.paymentMethod,
          cash_type: Number(!cashType),
          comments: values?.comments,
        },
        () => {
          enqueueSnackbar('Олпата прошла успешна!');
          handleClose();
          setPayLoading(false);
        },
        () => {
          setPayLoading(false);
        }
      );
    } catch (error) {
      console.error(error);
      setPayLoading(false);
    }
  });

  const handleClose = () => {
    // eslint-disable-next-line no-unused-expressions
    !data && methods.reset();
    setPayLoading(false);
    onClose();
  };

  const PAYMENT_METHODS_OPTIONS = [
    {
      payment_method: '1',
      label: 'Наличка',
    },
    // {
    //   payment_method: '2',
    //   label: 'Терминал',
    // },
    {
      payment_method: '3',
      label: 'Клик',
    },
    // {
    //   payment_method: '4',
    //   label: 'Банк',
    // },
  ];

  const CASH_TYPES_OPTIONS = [
    {
      value: '0',
      label: 'Доллар (USD)',
    },
    {
      value: '1',
      label: 'Сум (UZS)',
    },
  ];

  useEffect(() => {
    if (currentUsdRate) {
      convertCurrency();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashType]);

  const isAllowedUZS = (values) => {
    const { floatValue } = values;

    if (!floatValue) return true;

    return floatValue <= (methods.watch('paymentMethod') === '1' ? balanceCash : balanceClick);
  };

  const isAllowedUSD = (values) => {
    const { floatValue } = values;
    if (!floatValue) return true;
    return (
      floatValue <=
      (
        (methods.watch('paymentMethod') === '1' ? balanceCash : balanceClick) / currentUsdRate
      ).toFixed(2)
    );
  };

  const renderType1 = (
    <>
      <Stack spacing={2} pt={2}>
        <RHFAutocomplete
          disabled={Boolean(data)}
          loading={searchLoading}
          noOptionsText="Пусто"
          loadingText="Идет поиск..."
          inputValue={categoryTermHelper}
          onInputChange={(event, newInputValue, type) => {
            if (type === 'reset') {
              setCategoryTermHelper(newInputValue);
            }

            if (type === 'input') {
              setCategoryTerm(newInputValue);
              setCategoryTermHelper(newInputValue);
            }
          }}
          name="category"
          type="client"
          label="Категория"
          placeholder="Выбрать категорию"
          fullWidth
          options={categoryTerm?.length >= 3 ? searchResults : kassBankCategories}
          getOptionLabel={(option) => option?.category_name}
          renderOption={(props, option) => (
            <Stack
              {...props}
              key={option?.client_id}
              direction="row"
              sx={{
                justifyContent: 'space-between !important',
              }}
              width={1}
            >
              <Typography variant="caption">{option?.category_name}</Typography>
            </Stack>
          )}
        />

        {data && <ArrivalInfo title="Информация" arrival={data} />}
        {methods.watch('arrival')?.is_paid !== '3' && (
          <>
            <RHFSelect
              name="paymentMethod"
              label="Вариант оплаты"
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={user?.role !== '1'}
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

            {/* <RHFSelect
      name="cashType"
      label="Валюта"
      InputLabelProps={{ shrink: true }}
      sx={{
        maxWidth: { md: 160 },
      }}
    >
      {CASH_TYPES_OPTIONS.map((el, idx) => (
        <MenuItem key={el.idx} value={el.value}>
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
    </RHFSelect> */}

            <RHFCurrencyField
              name="payment_amount"
              label="Сумма оплаты"
              placeholder="0"
              decimalScale={0}
              isAllowed={cashType ? isAllowedUZS : isAllowedUSD}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Android12Switch checked={cashType} onChange={() => setCashType(!cashType)} />
                  </InputAdornment>
                ),
              }}
              helperText={
                methods.watch('payment_amount')?.replace(/[.,]/g, '') &&
                methods.watch('payment_amount')?.replace(/[.,]/g, '') !== '0' &&
                (cashType
                  ? `${fCurrency(methods.watch('payment_amount')?.replace(/,/g, ''))} UZS = ${
                      // eslint-disable-next-line no-unsafe-optional-chaining
                      fCurrency(
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        Math.round(
                          methods.watch('payment_amount')?.replace(/,/g, '') / currentUsdRate
                        )
                      )
                    } USD`
                  : `${fCurrency(methods.watch('payment_amount')?.replace(/,/g, ''))} USD = ${
                      // eslint-disable-next-line no-unsafe-optional-chaining
                      fCurrency(
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        // eslint-disable-next-line no-unsafe-optional-chaining
                        Math.round(
                          methods.watch('payment_amount')?.replace(/,/g, '') * currentUsdRate
                        )
                      )
                    } UZS`)
              }
            />

            <RHFTextField
              name="comments"
              label="Комментарий"
              InputLabelProps={{ shrink: true }}
              multiline
              rows={3}
            />
          </>
        )}
      </Stack>
      {kassBankCategoriesLoading ||
        (searchLoading && (
          <Stack
            position="absolute"
            sx={{ top: 0, bottom: 0, right: 0, left: 0, zIndex: 99999, bgcolor: '#ffffffba' }}
          >
            <LoadingScreen />
          </Stack>
        ))}
    </>
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack direction="row" justifyContent="space-between">
          <DialogTitle>Окно оплаты</DialogTitle>
          <DialogTitle variant="subtitle2" fontWeight="bold">
            <Stack direction="column" alignItems="flex-start" gap={0.5}>
              <Typography variant="caption">
                <span style={{ fontWeight: 900 }}>Баланс (Наличка):</span> {fCurrency(balanceCash)}{' '}
                UZS
              </Typography>
              <Typography variant="caption">
                <span style={{ fontWeight: 900 }}>Баланс (Карта):</span> {fCurrency(balanceClick)}{' '}
                UZS
              </Typography>
            </Stack>
          </DialogTitle>
        </Stack>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {renderType1}
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          {methods.watch('arrival')?.is_paid !== '3' ? (
            <LoadingButton color="primary" type="submit" variant="contained" loading={payLoading}>
              Оплатить
            </LoadingButton>
          ) : (
            <Button variant="contained" disabled startIcon={<Check />} color="primary">
              Оплачено
            </Button>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

PaymentsNewForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  data: PropTypes.object.isRequired,
  pay: PropTypes.func,
  balanceCash: PropTypes.string,
  balanceClick: PropTypes.string,
};
