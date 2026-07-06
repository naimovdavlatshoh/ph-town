import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import { Paper, MenuItem, ButtonBase, Typography } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { useGetSuppliers, useSearchSuppliers } from 'src/api/barter';

import Iconify from 'src/components/iconify';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ClientNewEditPaymentType({ isEditMode = false }) {
  const { control, watch, setValue } = useFormContext();

  const values = watch();
  const [supplierTerm, setSupplierTerm] = useState('');
  const [supplierTermHelper, setSupplierTermHelper] = useState('');

  const debouncedSupplierTerm = useDebounce(supplierTerm, 0, 400);

  const { suppliers: allSuppliers, suppliersLoading: allLoading } = useGetSuppliers(1);
  const { suppliers: searchedSuppliers, suppliersLoading: searchLoading } =
    useSearchSuppliers(debouncedSupplierTerm.length >= 3 ? debouncedSupplierTerm : '');

  const filteredSuppliers = debouncedSupplierTerm.length >= 3 ? searchedSuppliers : allSuppliers;
  const suppliersLoading = debouncedSupplierTerm.length >= 3 ? searchLoading : allLoading;

  useEffect(() => {
    if (values.is_barter === '2' && values.supplier) {
      setValue('supplier_id', values.supplier.supplier_id);
      setValue('supplier_name', values.supplier.supplier_name);
    }
  }, [values.supplier, values.is_barter, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      setValue('mounthPayList', []);
    }
  }, [isEditMode, setValue, values.monthlyPaymentAuto]);

  return (
    <Stack direction="row" alignItems="flex-start" gap={5}>
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
                  key={item.label}
                  component={ButtonBase}
                  variant="outlined"
                  onClick={() => field.onChange(item.label)}
                  sx={{
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 1,
                    typography: 'body',
                    flexDirection: 'column',
                    minWidth: 140,
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
            <Stack gap={2} direction="row">
              {[
                {
                  label: 'Бартер 1',
                  value: '1',
                  icon: <Iconify icon="mdi:ticket-percent" width={20} sx={{ mb: 0.2 }} />,
                },
                {
                  label: 'Бартер 2',
                  value: '2',
                  icon: <Iconify icon="mdi:ticket-percent" width={20} sx={{ mb: 0.2 }} />,
                },
              ].map((item) => (
                <Paper
                  key={item.value}
                  component={ButtonBase}
                  variant="outlined"
                  onClick={() => field.onChange(field.value === item.value ? '' : item.value)}
                  sx={{
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 1,
                    typography: 'body',
                    flexDirection: 'column',
                    minWidth: 140,
                    ...(field.value === item.value && {
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

      {values.is_barter === '1' && (
        <Stack spacing={2} px={4} py={1} sx={{ minWidth: 300 }}>
          <Typography variant="subtitle2">Поля бартера 1</Typography>
          <RHFSelect name="barter_object" label="Тип бартера" size="small">
            <MenuItem value="1">Машина</MenuItem>
            <MenuItem value="2">Имущество</MenuItem>
            <MenuItem value="3">Магазин</MenuItem>
            <MenuItem value="4">Другое</MenuItem>
          </RHFSelect>
          <RHFCurrencyField
            name="appraised_value"
            label="Сумма оценки"
            size="small"
            decimalScale={0}
          />
          <RHFTextField
            name="barter_comments"
            label="Комментарий к бартеру"
            size="small"
            multiline
            rows={3}
          />
        </Stack>
      )}

      {values.is_barter === '2' && (
        <Stack spacing={2} px={4} py={1} sx={{ minWidth: 300 }}>
          <Typography variant="subtitle2">Поля бартера 2</Typography>
          <RHFAutocomplete
            loading={suppliersLoading}
            noOptionsText="Пусто"
            loadingText="Идет поиск..."
            inputValue={supplierTermHelper}
            onInputChange={(event, newInputValue) => {
              setSupplierTermHelper(newInputValue || '');
              setSupplierTerm(newInputValue || '');
            }}
            name="supplier"
            label="Поставщик"
            placeholder="Выбрать поставщика"
            size="small"
            options={filteredSuppliers}
            getOptionLabel={(option) => option?.supplier_name || ''}
            isOptionEqualToValue={(option, value) => option?.supplier_id === value?.supplier_id}
            onChange={(event, newValue) => {
              setValue('supplier', newValue, { shouldValidate: true });
              if (newValue) {
                setValue('supplier_id', newValue.supplier_id);
                setValue('supplier_name', newValue.supplier_name);
              } else {
                setValue('supplier_id', '');
                setValue('supplier_name', '');
              }
            }}
          />
          <RHFTextField
            name="percent_apartment"
            label="Процент квартиры"
            size="small"
            type="number"
          />
          <RHFTextField
            name="percent_supplier"
            label="Процент поставщика"
            size="small"
            type="number"
          />
        </Stack>
      )}

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
