import moment from 'moment';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import axios, { endpoints } from 'src/utils/axios';

import { RHFTextField } from 'src/components/hook-form';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';

// ----------------------------------------------------------------------

export default function ClientNewEditStatusDate() {
  const { control, watch, trigger, setValue } = useFormContext();

  const [loading, setLoading] = useState(false);

  const values = watch();

  // console.log(values);


  const generateMonth = async () => {
    if (
      values.initialPayment &&
      values.months &&
      values.startDay &&
      values.client &&
      values.apartment
    ) {
      setLoading(true);
      trigger();
      try {
        const result = await axios.post(endpoints.contract.generatedates, {
          startDay: moment(values.startDay).valueOf(),
          months: values.months,
          // eslint-disable-next-line no-unsafe-optional-chaining
          price: values.totalAmount - values.initialPayment?.replace(/,/g, ''),
        });

        const mounthPayList = result.data?.payment_day?.map((item, idx) => ({
          date: moment(result.data?.payment_day[idx], 'DD-MM-YYYY'),
          price: result.data?.monthly_fee[idx],
        }));

        setValue('mounthPayList', mounthPayList);
        setValue('monthly_fee', result.data.monthly_fee);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      trigger();
    }
  };

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <RHFCurrencyField
        name="initialPayment"
        label="Первоначальный платёж"
        value={values.initial_payment}
        placeholder="0"
      />
      {values.paymentType === 'В рассрочку' &&
        (values.monthlyPaymentAuto === 'Автоматически' ||
          values.monthlyPaymentAuto === 'Ручное заполнение 2') && (
          <>
            <RHFTextField name="months" label="Срок оплаты" value={values.months} placeholder="0" />

            <Controller
              name="startDay"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Начала платежа"
                  value={field.value}
                  // shouldDisableDate={(date) => date.getDate() >= 27}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              loading={loading}
              onClick={generateMonth}
            >
              Сгенерировать
            </LoadingButton>
          </>
        )}
    </Stack>
  );
}
