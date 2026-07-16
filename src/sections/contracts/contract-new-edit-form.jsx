/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/system';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid, Button, Divider, MenuItem, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';
import convertContractTypeToText from 'src/utils/convert-contract-type-to-text';

import { useGetCurrency } from 'src/api/currency';
import { useGetContracts } from 'src/api/contract';

import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import ContractNewEditClient from './contract-new-edit-client';
import ContractNewEditDetails from './contract-new-edit-details';
import ContractNewEditStatusDate from './contract-new-edit-status-date';
import ClientNewEditPaymentType from './contract-new-edit-payment-type';
import ContractNewEditDetailsAuto from './contract-new-edit-details-auto';
import ContractNewEditDetailsAuto2 from './contract-new-edit-details-auto2';

// ----------------------------------------------------------------------

const getContractCashType = (cashType) => {
  if (cashType === 1) return 'SUM';
  if (cashType === 0) return 'USD';
  return 'SUM';
};

const getMonthlyPaymentAuto = (type) => {
  if (type === '1') return 'Автоматически';
  if (type === '2') return 'Ручное заполнение';
  return 'Автоматически';
};

// is_barter в форме — строка ('1' | '2' | ''). На бэке признак бартера хранится
// в barter_type (1|2), поэтому при редактировании читаем его, с фолбэком на is_barter.
const getIsBarterValue = (contract) => {
  if (contract?.barter_type) return String(contract.barter_type);
  if (contract?.is_barter) return String(contract.is_barter);
  return '';
};

// ----------------------------------------------------------------------

export default function ContractNewEditForm({ currentContract, apartmentId }) {
  const { currency } = useGetCurrency();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { create, createWithPlan, update, updateWithPlan } = useGetContracts();

  const [submitting, setSubmitting] = useState(false);

  const NewContractSchema = Yup.object().shape({
    client: Yup.mixed().nullable().required('Выберите клиента'),
    apartment: Yup.mixed().nullable().required('Выберите квартиру'),
    mounthPayList: Yup.lazy(() =>
      Yup.array()
        .when('paymentType', ([paymentType], schema) =>
          paymentType === 'В рассрочку' ? schema.min(1, 'dwdw').required('Выбор') : schema
        )
        .of(
          Yup.object({
            date: Yup.string().required('Выберите дату'),
            price: Yup.string().required('Введите сумму'),
          })
        )
    ),
    monthly_fee: Yup.lazy(() =>
      Yup.array().when('paymentType', ([paymentType], schema) =>
        paymentType === 'В рассрочку' ? schema : schema
      )
    ),
    monthlyPaymentAuto: Yup.string().when('paymentType', ([paymentType], schema) =>
      paymentType === 'В рассрочку' ? schema.required('Выберите способ') : schema
    ),
    totalAmount: Yup.number().required('Выберите квартиру'),
    paymentType: Yup.string().required('Выберите тип оплаты'),
    initialPayment: Yup.string().when('paymentType', ([paymentType], schema) =>
      paymentType === 'В рассрочку' ? schema.required('Заполните поле') : schema
    ),
    contract_number: Yup.string().required('Заполните поле'),
    contract_cash_type: Yup.string().required('Выберите валюту'),
    // Курс доллара обязателен ВСЕГДА (цена за квадрат — в долларах)
    contract_exchange_rate: Yup.string()
      .required('Укажите курс доллара')
      .test('positive', 'Курс должен быть больше 0', (value) => {
        const n = parseFloat(String(value ?? '').replace(/,/g, ''));
        return !Number.isNaN(n) && n > 0;
      }),
    startDay: Yup.string().when(
      ['paymentType', 'monthlyPaymentAuto'],
      ([paymentType, monthlyPaymentAuto], schema) =>
        paymentType === 'В рассрочку' && monthlyPaymentAuto === 'Автоматически'
          ? schema.required('Выберите дату')
          : schema
    ),
    months: Yup.string().when(
      ['paymentType', 'monthlyPaymentAuto'],
      ([paymentType, monthlyPaymentAuto], schema) =>
        paymentType === 'В рассрочку' && monthlyPaymentAuto === 'Автоматически'
          ? schema.test('min', 'Заполните поле', (value) => value > 0).required('Заполните поле')
          : schema
    ),
    contract_date: Yup.string().required('Выберите дату'),
    comments: Yup.string().required('Введите комментарий'),
    barter_object: Yup.string().when('is_barter', ([is_barter], schema) =>
      is_barter === '1' ? schema.required('Выберите тип бартера') : schema
    ),
    appraised_value: Yup.string().when('is_barter', ([is_barter], schema) =>
      is_barter === '1' ? schema.required('Введите сумму оценки') : schema
    ),
    barter_comments: Yup.string(),
    supplier_id: Yup.string().when('is_barter', ([is_barter], schema) =>
      is_barter === '2' ? schema.required('Выберите поставщика') : schema
    ),
    percent_apartment: Yup.string().when('is_barter', ([is_barter], schema) =>
      is_barter === '2' ? schema.required('Введите процент квартиры') : schema
    ),
    percent_supplier: Yup.string().when('is_barter', ([is_barter], schema) =>
      is_barter === '2' ? schema.required('Введите процент поставщика') : schema
    ),
  });

  const defaultValues = useMemo(
    () => ({
      is_barter: getIsBarterValue(currentContract),
      barter_object: currentContract?.barter_object || '',
      appraised_value: currentContract?.appraised_value || '',
      barter_comments: currentContract?.barter_comments || '',
      supplier_id: currentContract?.supplier_id || '',
      supplier_name: currentContract?.supplier_name || '',
      supplier: currentContract?.supplier_id
        ? {
            supplier_id: currentContract.supplier_id,
            supplier_name: currentContract.supplier_name || '',
          }
        : null,
      percent_apartment: currentContract?.percent_apartment || '',
      percent_supplier: currentContract?.percent_supplier || '',
      client: currentContract
        ? {
            client_id: currentContract?.client_id,
            client_type: currentContract?.client_type,
            client_name: currentContract?.client_name,
            client_surname: currentContract?.client_surname,
            client_fathername: currentContract?.client_fathername,
            business_director_name: currentContract?.business_director_name,
            business_name: currentContract?.business_name,
            business_mfo: currentContract?.business_mfo,
            business_inn: currentContract?.business_inn,
            passport_series: currentContract?.passport_series,
            pinfl: currentContract?.pinfl,
            phone_option: currentContract?.phone_option,
            address_by_passport: currentContract?.address_by_passport,
          }
        : null,
      apartment: currentContract
        ? {
            apartment_id: currentContract?.apartment_id,
            apartment_name: currentContract?.apartment_name,
            apartment_area: currentContract?.apartment_area,
            layout_image: currentContract?.layout_image,
            rooms_number: currentContract?.rooms_number,
            totalprice: currentContract?.total_price,
            price_square_meter: currentContract?.price_square_meter,
            entrance_name: currentContract?.entrance_name,
            floor_number: currentContract?.floor_number,
            block_name: currentContract?.block_name,
          }
        : null,
      mounthPayList: currentContract?.paymentday?.length
        ? currentContract?.paymentday?.map((pd, idx) => ({
            num: idx + 1,
            date: pd.contract_payment_date,
            price: pd.monthly_fee,
          }))
        : [],
      monthlyPaymentAuto: currentContract
        ? getMonthlyPaymentAuto(currentContract?.date_type)
        : 'Автоматически',
      totalAmount: currentContract ? currentContract?.total_price : '0',
      paymentType: currentContract
        ? convertContractTypeToText(currentContract?.contract_type)
        : 'Наличными',
      initialPayment: currentContract ? currentContract?.initial_payment : '0',
      startDay: currentContract?.paymentday?.length
        ? moment('20-03-2024', 'DD-MM-YYYY').toDate()
        : '',
      months: currentContract ? currentContract?.paymentday?.length : '',
      contract_number: currentContract?.contract_number || '',
      monthly_fee: currentContract?.paymentday?.length ? currentContract?.monthly_fee : [],
      contract_date: currentContract?.date_of_birth
        ? moment(currentContract?.created_at).toDate()
        : moment().toDate(),
      contract_cash_type: getContractCashType(currentContract?.contract_cash_type),
      contract_exchange_rate: currentContract?.contract_exchange_rate || '',
    }),
    [currentContract]
  );

  const methods = useForm({
    resolver: yupResolver(NewContractSchema),
    defaultValues,
  });

  const { reset, handleSubmit, control } = methods;

  // --- Заполнение формы при редактировании ---
  useEffect(() => {
    if (currentContract) {
      methods.setValue('client', {
        client_id: currentContract?.client_id,
        client_type: currentContract?.client_type,
        client_name: currentContract?.client_name,
        client_surname: currentContract?.client_surname,
        client_fathername: currentContract?.client_fathername,
        business_director_name: currentContract?.business_director_name,
        business_name: currentContract?.business_name,
        business_mfo: currentContract?.business_mfo,
        business_inn: currentContract?.business_inn,
        passport_series: currentContract?.passport_series,
        pinfl: currentContract?.pinfl,
        phone_option: currentContract?.phone_option,
        address_by_passport: currentContract?.address_by_passport,
      });

      methods.setValue('apartment', {
        apartment_id: currentContract?.apartment_id,
        apartment_name: currentContract?.apartment_name,
        apartment_area: currentContract?.apartment_area,
        layout_image: currentContract?.layout_image,
        rooms_number: currentContract?.rooms_number,
        totalprice: currentContract?.total_price,
        price_square_meter: currentContract?.price_square_meter,
        entrance_name: currentContract?.entrance_name,
        floor_number: currentContract?.floor_number,
        block_name: currentContract?.block_name,
      });

      methods.setValue(
        'mounthPayList',
        currentContract?.paymentday?.map((pd) => ({
          date: pd.contract_payment_date,
          price: pd.monthly_fee,
        }))
      );

      methods.setValue('monthlyPaymentAuto', getMonthlyPaymentAuto(currentContract?.date_type));
      methods.setValue('totalAmount', currentContract?.total_price);
      methods.setValue('paymentType', convertContractTypeToText(currentContract?.contract_type));
      methods.setValue('initialPayment', currentContract?.initial_payment);
      methods.setValue('startDay', moment('20-03-2024', 'DD-MM-YYYY').toDate());
      methods.setValue('contract_number', currentContract?.contract_number);
      methods.setValue(
        'monthly_fee',
        currentContract?.paymentday?.map((item) => item?.monthly_fee)
      );
      methods.setValue('contract_cash_type', getContractCashType(currentContract?.contract_cash_type));
      methods.setValue('contract_exchange_rate', currentContract?.contract_exchange_rate || '');

      // --- Бартер ---
      methods.setValue('is_barter', getIsBarterValue(currentContract));
      methods.setValue('barter_object', currentContract?.barter_object || '');
      methods.setValue('appraised_value', currentContract?.appraised_value || '');
      methods.setValue('barter_comments', currentContract?.barter_comments || '');
      methods.setValue('supplier_id', currentContract?.supplier_id || '');
      methods.setValue('supplier_name', currentContract?.supplier_name || '');
      methods.setValue(
        'supplier',
        currentContract?.supplier_id
          ? {
              supplier_id: currentContract.supplier_id,
              supplier_name: currentContract.supplier_name || '',
            }
          : null
      );
      methods.setValue('percent_apartment', currentContract?.percent_apartment || '');
      methods.setValue('percent_supplier', currentContract?.percent_supplier || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContract]);

  const fetchApartmentById = useCallback(async () => {
    const { data } = await axios.get(`${endpoints.apartment.info}?apartment_id=${apartmentId}`);
    methods.setValue('apartment', data);
  }, [apartmentId, methods]);

  useEffect(() => {
    if (apartmentId) {
      fetchApartmentById(apartmentId);
    }
  }, [apartmentId, fetchApartmentById]);

  useEffect(
    () => () => {
      methods.reset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // --- watch-эффекты ---
  useEffect(() => {
    methods.setValue('initialPayment', currentContract ? currentContract?.initial_payment : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('paymentType')]);

  useEffect(() => {
    methods.setValue('initialPayment', currentContract ? currentContract?.initial_payment : '');
    methods.setValue('months', currentContract ? currentContract?.paymentday?.length : '');
    methods.setValue(
      'mounthPayList',
      currentContract
        ? currentContract?.paymentday?.map((pd) => ({
            date: pd.contract_payment_date,
            price: pd.monthly_fee,
          }))
        : []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('monthlyPaymentAuto')]);

  useEffect(() => {
    methods.setValue(
      'mounthPayList',
      currentContract
        ? currentContract?.paymentday?.map((pd) => ({
            date: pd.contract_payment_date,
            price: pd.monthly_fee,
          }))
        : []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('initialPayment'), methods.watch('startDay')]);

  // ----------------------------------------------------------------------
  // Сборка payload для backend
  // ----------------------------------------------------------------------
  const buildPayload = (data) => {
    const rate = parseFloat(String(data?.contract_exchange_rate ?? '').replace(/,/g, ''));

    const base = {
      created_at: moment(data?.contract_date).valueOf(),
      client_id: data?.client?.client_id,
      contract_number: data?.contract_number,
      apartment_id: data?.apartment?.apartment_id,
      apartment_area: data?.apartment?.apartment_area,
      price_square_meter: data?.apartment?.price_square_meter,
      // Сумма квартиры в сумах приходит с бэка (uzs_full_price). Курс доллара из формы —
      // справочное поле (курс на дату старого договора) и на сумму не влияет.
      total_price: data?.totalAmount,
      initial_payment: parseFloat(data?.initialPayment?.replace(/,/g, '')),
      comments: data?.comments,
      is_barter: data.is_barter === '1' || data.is_barter === '2' ? 1 : 0,
      barter_type:
        data.is_barter === '1' || data.is_barter === '2' ? Number(data.is_barter) : null,
      ...(data.is_barter === '1' && {
        barter_object: Number(data.barter_object),
        appraised_value: parseFloat(String(data.appraised_value).replace(/,/g, '')),
        barter_comments: (data.barter_comments || '').trim(),
      }),
      ...(data.is_barter === '2' && {
        supplier_id: Number(data.supplier_id),
        supplier_name: data.supplier_name || '',
        percent_apartment: parseFloat(String(data.percent_apartment).replace(/,/g, '')) || 0,
        percent_supplier: parseFloat(String(data.percent_supplier).replace(/,/g, '')) || 0,
      }),
      contract_cash_type: data?.contract_cash_type === 'SUM' ? 1 : 0,
      contract_exchange_rate: rate,
    };

    if (data.paymentType === 'Наличными') {
      return { ...base, contract_type: 0 };
    }

    // В рассрочку
    return {
      ...base,
      contract_type: 1,
      date_type: data?.monthlyPaymentAuto === 'Автоматически' ? 1 : 2,
      monthly_fee: data?.monthly_fee,
      payment_day: data?.mounthPayList?.map((mp) =>
        moment(mp.date).isValid()
          ? moment(mp.date).format('DD-MM-YYYY')
          : moment(mp.date, 'DD-MM-YYYY').format('DD-MM-YYYY')
      ),
    };
  };

  // ----------------------------------------------------------------------
  // Сабмит
  // ----------------------------------------------------------------------
  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const isInstallment = data.paymentType === 'В рассрочку';
      const payload = buildPayload(data);

      let result;

      if (currentContract) {
        const updatePayload = { ...payload, contract_id: currentContract?.contract_id };
        result = isInstallment
          ? await updateWithPlan(updatePayload, () => {})
          : await update(updatePayload, () => {});
      } else {
        result = isInstallment
          ? await createWithPlan(payload, () => {})
          : await create(payload, () => {});
      }

      enqueueSnackbar(currentContract ? 'Контракт обновлён' : 'Контракт создан', {
        variant: 'success',
      });

      reset();

      const contractId = result?.contract_id ?? currentContract?.contract_id;

      if (contractId) {
        router.push(paths.dashboard.contracts.details(contractId));
      } else {
        router.push(paths.dashboard.contracts.root);
      }
    } catch (error) {
      console.error(error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        (typeof error === 'string' ? error : 'Не удалось сохранить контракт');

      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  });

  const renderTotal = (
    <Stack spacing={2} alignItems="flex-end" sx={{ p: 3, textAlign: 'right', typography: 'body2' }}>
      {methods.watch().totalAmount && (
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Общая сумма:</Box>
          <Box sx={{ width: 160, typography: 'subtitle2' }}>
            {`${fCurrency(methods.watch().totalAmount)} сум`}
          </Box>
        </Stack>
      )}

      {methods.watch().initialPayment && (
        <Stack direction="row">
          <Box sx={{ color: 'text.secondary' }}>Первоначальный взнос:</Box>
          <Box sx={{ width: 160 }}>
            {`${fCurrency(methods.watch().initialPayment?.replace(/,/g, ''))} сум`}
          </Box>
        </Stack>
      )}

      {methods.watch().totalAmount && (
        <Stack direction="row" sx={{ typography: 'subtitle1' }}>
          <Box>Итого:</Box>
          <Box sx={{ width: 160 }}>
            {fCurrency(
              methods.watch().totalAmount - methods.watch().initialPayment?.replace(/,/g, '')
            )}{' '}
            сум
          </Box>
        </Stack>
      )}
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card>
        <ContractNewEditClient mode={currentContract ? 'edit' : ''} />

        <Grid container>
          <Grid sm={12} md={6} item>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              divider={<Divider flexItem orientation="horizontal" sx={{ borderStyle: 'dashed' }} />}
              sx={{ p: 3 }}
            >
              <RHFTextField
                size="small"
                name="contract_number"
                label="Номер контракта"
                fullWidth={false}
                placeholder=""
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>№</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2, mb: 2 }}
              />
              <Controller
                name="contract_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Дата выдачи"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    disableFuture
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
            </Stack>

            {methods.watch('client') && methods.watch('apartment') && (
              <Stack spacing={2} sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <RHFSelect
                    name="contract_cash_type"
                    label="Валюта"
                    size="small"
                    sx={{ maxWidth: 200 }}
                  >
                    <MenuItem value="SUM">SUM</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </RHFSelect>

                  <RHFTextField
                    name="contract_exchange_rate"
                    label="Курс доллара *"
                    size="small"
                    type="number"
                    sx={{ maxWidth: 200 }}
                  />
                </Stack>

                <ClientNewEditPaymentType isEditMode={Boolean(currentContract)} />
              </Stack>
            )}
          </Grid>

          <Grid sm={12} md={6} item>
            {renderTotal}
          </Grid>

          <Grid item sm={12}>
            {methods.watch('paymentType') === 'В рассрочку' &&
              methods.watch('monthlyPaymentAuto') === 'Автоматически' && (
                <>
                  <ContractNewEditStatusDate />
                  <ContractNewEditDetailsAuto />
                </>
              )}
            {methods.watch('paymentType') === 'В рассрочку' &&
              methods.watch('monthlyPaymentAuto') === 'Ручное заполнение' && (
                <>
                  <ContractNewEditStatusDate />
                  <ContractNewEditDetails />
                </>
              )}
            {methods.watch('paymentType') === 'В рассрочку' &&
              methods.watch('monthlyPaymentAuto') === 'Ручное заполнение 2' && (
                <>
                  <ContractNewEditStatusDate />
                  <ContractNewEditDetailsAuto2 />
                </>
              )}
          </Grid>

          {methods.watch('client') && methods.watch('apartment') && (
            <Grid item sm={6}>
              <Stack spacing={2} px={4} py={1}>
                <RHFTextField name="comments" label="Комментарий" />
              </Stack>
            </Grid>
          )}
        </Grid>
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          color="inherit"
          size="large"
          variant="outlined"
          component={RouterLink}
          href={paths.dashboard.contracts.root}
          disabled={submitting}
        >
          Отменить
        </Button>

        <LoadingButton type="submit" size="large" variant="contained" loading={submitting}>
          {currentContract ? 'Обновить' : 'Создать'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

ContractNewEditForm.propTypes = {
  apartmentId: PropTypes.string,
  currentContract: PropTypes.object,
};