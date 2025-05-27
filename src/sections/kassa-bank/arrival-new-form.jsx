/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { MenuItem, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDebounce } from 'src/hooks/use-debounce';

import { useAuthContext } from 'src/auth/hooks';

import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------
const PAYMENT_METHODS_OPTIONS = [
  {
    payment_method: '1',
    label: 'Наличка',
  },
  {
    payment_method: '3',
    label: 'Клик',
  },
];

export default function ArrivalNewForm({ open, onClose, data, pay }) {
  const [cashType, setCashType] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [categoryTerm, setCategoryTerm] = useState('');
  const [categoryTermHelper, setCategoryTermHelper] = useState('');
  const debouncedQuery = useDebounce(categoryTerm, 3);
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewPaymentsSchema = Yup.object().shape({
    arrival_amount: Yup.string().required('Введите сумму'),
    paymentMethod: Yup.string().required('Выберите метод оплаты'),
    comments: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      arrival_amount: '',
      paymentMethod: user?.role === '1' ? '3' : '1',
      comments: '',
    }),
    [user?.role]
  );

  const methods = useForm({
    resolver: yupResolver(NewPaymentsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    setPayLoading(true);
    try {
      pay(
        {
          arrival_amount: values?.arrival_amount?.replace(/,/g, ''),
          payment_method: values?.paymentMethod,
          comments: values?.comments,
        },
        () => {
          enqueueSnackbar('Операция прошла успешна!');
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

  const renderType1 = (
    <Stack spacing={2} pt={2}>
      {methods.watch('arrival')?.is_paid !== '3' && (
        <>
          <RHFCurrencyField
            name="arrival_amount"
            label="Сумма прихода"
            placeholder="0"
            decimalScale={0}
            InputLabelProps={{ shrink: true }}
          />

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
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack direction="row" justifyContent="space-between">
          <DialogTitle>Окно прихода</DialogTitle>
        </Stack>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {renderType1}
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton color="primary" type="submit" variant="contained" loading={payLoading}>
            Сохранить
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ArrivalNewForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  data: PropTypes.object.isRequired,
  pay: PropTypes.func,
};
