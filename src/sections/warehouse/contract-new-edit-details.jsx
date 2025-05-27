/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import moment from 'moment';
import sum from 'lodash/sum';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers';
import Typography from '@mui/material/Typography';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableContainer,
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import FormProvider from 'src/components/hook-form/form-provider';

// ----------------------------------------------------------------------

export default function ContractNewEditDetails() {
  const { control, setValue, watch, resetField } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mounthPayList',
  });

  const values = watch();

  const totalOnRow = values.mounthPayList.map((item) => item.price);

  const subTotal = sum(totalOnRow);

  const handleAdd = (data) => {
    append(data);
    reset();
  };

  const handleRemove = (index) => {
    remove(index);
    setValue('months', +values.months - 1);
  };

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Выплачено</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subTotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Долги</Box>
        <Box
          sx={{
            width: 160,
            ...(subTotal && { color: 'error.main' }),
          }}
        >
          {subTotal ? `- ${fCurrency(values.totalAmount - subTotal)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Сумма</Box>
        <Box sx={{ width: 100 }}>{fCurrency(values.totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>

              <TableCell width={135} sx={{ typography: 'subtitle2' }}>
                Дата
              </TableCell>
              <TableCell width={200}>Сумма</TableCell>
              <TableCell width={50}>Операции</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell />

              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="subtitle2">Остаток</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" noWrap>
                  {fCurrency(values.totalAmount - values.initialPayment?.replace(/,/g, ''))}$
                </Typography>
              </TableCell>
            </TableRow>
            {values.mounthPayList.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="subtitle2">
                      {moment(row.date).format('DD.MM.YYYY')} г.
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{fCurrency(row.price)} сум</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleRemove(index)}>
                    <Iconify size={12} icon="uiw:delete" color="red" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  const PaymentMonthSchema = Yup.object().shape({
    date: Yup.string().required('Заполните поле'),
  });

  const defaultValues = useMemo(
    () => ({
      price: '',
      date: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(PaymentMonthSchema),
    defaultValues,
  });

  const {
    reset,
    watch: monthWatch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      handleAdd({
        date: data.date,
        price: '',
      });

      setValue('months', +values.months + 1);
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (values.months && values.months > 0) {
      const monthlyFee =
        (values.totalAmount - Number(values.initialPayment?.replace(/,/g, ''))) / values.months;

      setValue(
        'mounthPayList',
        values.mounthPayList?.map((mp) => ({ ...mp, price: monthlyFee }))
      );
      setValue('monthly_fee', monthlyFee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.months, values.initialPayment, values.apartment]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Детали:
      </Typography>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
          <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ width: 1 }}>
            <Controller
              name="date"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Дата оплаты"
                  value={field.value}
                  shouldDisableDate={(date) => date.getDate() === 30 || date.getDate() === 31}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                      size: 'small',
                    },
                  }}
                />
              )}
            />

            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              loading={isSubmitting}
              sx={{ flexShrink: 0 }}
              onClick={onSubmit}
            >
              Добавить
            </Button>
          </Stack>
        </Stack>
      </FormProvider>

      <>
        <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

        {values.mounthPayList.length > 0 ? (
          <>
            {renderList}
            {renderTotal}
          </>
        ) : (
          <Typography textAlign="center" color="red">
            Заполните график оплаты
          </Typography>
        )}
      </>
    </Box>
  );
}
