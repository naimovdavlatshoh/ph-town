import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import { Paper, ButtonBase, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ClientNewEditPaymentType({ isEditMode = false }) {
  const { control, watch, setValue } = useFormContext();

  const values = watch();

  useEffect(() => {
    if (!isEditMode) {
      setValue('mounthPayList', []);
    }
  }, [isEditMode, setValue, values.monthlyPaymentAuto]);

  return (
    <Stack direction="row" alignItems="center" gap={5}>
      <Stack spacing={2} px={4} py={1}>
        <Typography variant="subtitle2">Тип оплаты</Typography>

        <Controller
          name="paymentType"
          control={control}
          render={({ field }) => (
            <Stack gap={2} direction="row">
              {[
                {
                  label: 'Наличными',
                  icon: (
                    <Iconify icon="material-symbols-light:payments" width={20} sx={{ mb: 0.2 }} />
                  ),
                },
                {
                  label: 'В рассрочку',
                  icon: <Iconify icon="mdi:ticket-percent" width={20} sx={{ mb: 0.2 }} />,
                },
              ].map((item) => (
                <Paper
                  component={ButtonBase}
                  variant="outlined"
                  onClick={() => field.onChange(item.label)}
                  sx={{
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 1,
                    typography: 'body',
                    flexDirection: 'column',
                    ...(item.label === field.value && {
                      borderWidth: 1,
                      borderColor: 'text.primary',
                    }),
                  }}
                >
                  {item.icon}
                  {item.label}
                </Paper>
              ))}
            </Stack>
          )}
        />
        <Controller
          name="is_barter"
          control={control}
          render={({ field }) => (
            <Paper
              component={ButtonBase}
              variant="outlined"
              onClick={() => field.onChange(!field.value)}
              sx={{
                px: 0.8,
                py: 0.3,
                borderRadius: 1,
                typography: 'body',
                flexDirection: 'column',
                ...(field.value && {
                  borderWidth: 1,
                  borderColor: 'text.primary',
                }),
              }}
            >
              <Iconify icon="mdi:ticket-percent" width={20} sx={{ mb: 0.2 }} />
              Бартер
            </Paper>
          )}
        />
      </Stack>

      {values.paymentType === 'В рассрочку' && (
        <Stack spacing={2} px={4} py={1}>
          <Typography variant="subtitle2">Оплата по месяцам</Typography>

          <Controller
            name="monthlyPaymentAuto"
            control={control}
            render={({ field }) => (
              <Stack gap={2} direction="row">
                {[
                  {
                    label: 'Автоматически',
                    icon: <Iconify icon="cbi:duco-auto" width={20} sx={{ mb: 0.2 }} />,
                  },
                  {
                    label: 'Ручное заполнение',
                    icon: <Iconify icon="pepicons-pencil:pen" width={20} sx={{ mb: 0.2 }} />,
                  },
                  {
                    label: 'Ручное заполнение 2',
                    icon: <Iconify icon="cbi:duco-auto" width={20} sx={{ mb: 0.2 }} />,
                  },
                ].map((item) => (
                  <Paper
                    component={ButtonBase}
                    variant="outlined"
                    key={item.label}
                    onClick={() => {
                      field.onChange(item.label);
                      console.log(item.label);
                    }}
                    sx={{
                      px: 0.8,
                      py: 0.3,
                      borderRadius: 1,
                      typography: 'body',
                      flexDirection: 'column',
                      ...(item.label === field.value && {
                        borderWidth: 1,
                        borderColor: 'text.primary',
                      }),
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Paper>
                ))}
              </Stack>
            )}
          />
        </Stack>
      )}
    </Stack>
  );
}

ClientNewEditPaymentType.propTypes = {
  isEditMode: PropTypes.bool,
};
