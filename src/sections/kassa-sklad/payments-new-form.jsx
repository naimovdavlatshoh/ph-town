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
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { MenuItem, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDebounce } from 'src/hooks/use-debounce';

import { useGetArrivals, useSearchInvoice } from 'src/api/warehouse';

import { LoadingScreen } from 'src/components/loading-screen';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import ArrivalInfo from './arrival-info';

// ----------------------------------------------------------------------

function makeColor(value) {
  if (!value) {
    return '';
  }

  return value?.startsWith('-') ? 'red' : '';
}

export default function PaymentsNewForm({ open, onClose, data, pay }) {
  const [payLoading, setPayLoading] = useState(false);
  const [arrivalTerm, setArrivalTerm] = useState('');
  const [arrivalTermHelper, setArrivalTermHelper] = useState('');
  const debouncedQuery = useDebounce(arrivalTerm, 3);

  const { arrivals, arrivalsLoading } = useGetArrivals();
  const { searchResults, searchLoading } = useSearchInvoice(debouncedQuery);

  const { enqueueSnackbar } = useSnackbar();

  const NewPaymentsSchema = Yup.object().shape({
    arrival: Yup.object().nullable().required('Выберите инвойс'),
    paymentMethod: Yup.string().required('Выберите метод оплаты'),
    payment_method: Yup.string().required('Введите сумму'),
    comments: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      paymentMethod: '1',
      payment_method: '',
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

  useEffect(() => {
    if (data) {
      methods.setValue('client', {
        client_id: data?.client_id,
        client_name: data?.client_name,
        client_surname: data?.client_surname,
        client_type: data?.client_type,
        business_inn: data?.business_inn,
        business_name: data?.business_name,
        contracts: [{ contract_id: data?.contract_id, contract_number: data?.contract_number }],
      });

      methods.setValue('contract', data?.contract_id);
      methods.setValue('isContractPay', Boolean(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onSubmit = handleSubmit(async (values) => {
    setPayLoading(true);
    try {
      pay(
        {
          arrival_id: values?.arrival?.arrival_id,
          payment_amount: values?.payment_method?.replace(/,/g, ''),
          payment_method: values?.paymentMethod,
          comments: values?.comments,
        },
        () => {
          enqueueSnackbar('Олпата прошла успешна!');
          handleClose();
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

  const renderType1 = (
    <>
      <Stack spacing={2} pt={2}>
        <RHFAutocomplete
          disabled={Boolean(data)}
          loading={searchLoading}
          noOptionsText="Пусто"
          loadingText="Идет поиск..."
          inputValue={arrivalTermHelper}
          onInputChange={(event, newInputValue, type) => {
            if (type === 'reset') {
              setArrivalTermHelper(newInputValue);
            }

            if (type === 'input') {
              setArrivalTerm(newInputValue);
              setArrivalTermHelper(newInputValue);
            }
          }}
          name="arrival"
          type="arrival"
          label="Инвойс"
          placeholder="Выбрать инвойс"
          fullWidth
          options={arrivalTerm?.length >= 3 ? searchResults : arrivals}
          getOptionLabel={(option) => option?.invoice_number}
        />

        {methods.watch('arrival') && (
          <ArrivalInfo title="Информация" arrival={methods.watch('arrival')} />
        )}
        {methods.watch('arrival')?.is_paid !== '3' && (
          <>
            <RHFSelect
              name="paymentMethod"
              label="Вариант оплаты"
              InputLabelProps={{ shrink: true }}
              fullWidth
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
              name="payment_method"
              label="Сумма оплаты"
              placeholder="0"
              decimalScale={0}
              InputLabelProps={{ shrink: true }}
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
      {arrivalsLoading ||
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
        <DialogTitle>Окно оплаты</DialogTitle>

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
};
