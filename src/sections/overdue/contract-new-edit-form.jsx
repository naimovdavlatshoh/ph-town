/* eslint-disable no-unsafe-optional-chaining */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dayjs/locale/ru';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import * as Yup from 'yup';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TemplateHandler } from 'easy-template-x';
import { useForm, Controller } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { yupResolver } from '@hookform/resolvers/yup';
// eslint-disable-next-line import/no-unresolved
import { useMemo, useState, useEffect, useCallback } from 'react';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';

import { Box } from '@mui/system';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid, Button, Divider, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';
import convertContractTypeToText from 'src/utils/convert-contract-type-to-text';

import { useGetCurrency } from 'src/api/currency';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

import ContractNewEditClient from './contract-new-edit-client';
import ContractNewEditDetails from './contract-new-edit-details';
import ContractNewEditStatusDate from './contract-new-edit-status-date';
import ClientNewEditPaymentType from './contract-new-edit-payment-type';
import ContractNewEditDetailsAuto from './contract-new-edit-details-auto';
import ContractPreivewFullscreenDialog from './contract-preview-fullscreen-dialog';

const getMonthlyPaymentAuto = (type) => {
  if (type === '1') {
    return 'Автоматически';
  }

  if (type === '2') {
    return 'Ручное заполнение';
  }

  return 'Автоматически';
};

// ----------------------------------------------------------------------

const loadFile = async (url) => {
  const response = await fetch(url);
  const template = await response.blob();
  return template;
};

const loadImage = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

function abbreviateName(fullName) {
  // Split the full name into separate words
  const words = fullName?.split(' ');

  // Get the first letter of each word
  const abbreviated = words?.map((word) => `${word[0]?.toUpperCase()}.`);

  // Join the abbreviated letters and add a dot at the end
  return abbreviated?.join(' ');
}

export default function ContractNewEditForm({ currentContract, apartmentId }) {
  const { currency } = useGetCurrency();
  const [contractData, setContractData] = useState();

  const [blob, setBlob] = useState();
  const router = useRouter();

  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  const previewContract = useBoolean();

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
  });

  window.moment = moment;
  window.dayjs = dayjs;

  const defaultValues = useMemo(
    () => ({
      is_barter: '',
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
    }),

    [currentContract]
  );

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContract]);

  const methods = useForm({
    resolver: yupResolver(NewContractSchema),
    defaultValues,
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods;

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
      setContractData(null);
      methods.reset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // const generateDocument = (data) => {
  //   loadFile('/assets/contract_template.docx', (error, content) => {
  //     if (error) {
  //       throw error;
  //     }

  //     const zip = new PizZip(content);

  //     const doc = new Docxtemplater(zip, {
  //       modules: [
  //         new ImageModule({
  //           getImage(tagValue, tagName) {
  //             return new Promise((resolve, reject) => {
  //               // eslint-disable-next-line no-shadow
  //               PizZipUtils.getBinaryContent(tagValue, (error, content) => {
  //                 if (error) {
  //                   console.log('GADW', tagValue);
  //                   return reject(error);
  //                 }

  //                 return resolve(content);
  //               });
  //             });
  //           },
  //           getSize(img, url, tagName) {
  //             return new Promise((resolve, reject) => {
  //               const image = new Image();
  //               image.src = url;
  //               image.onload = function () {
  //                 resolve([image.width * 0.1, image.height * 0.1]);
  //               };
  //               image.onerror = function (e) {
  //                 console.log('img, url, tagName : ', img, url, tagName);
  //                 alert(`An error occured while loading ${url}`);
  //                 reject(e);
  //               };
  //             }); // FOR FIXED SIZE IMAGE :
  //           },
  //         }),
  //       ],
  //       paragraphLoop: true,
  //       linebreaks: true,
  //     }).compile();

  //     const templateData = {
  //       client_name: `${data.client?.client_surname || ''}${
  //         data.client?.client_name ? ` ${data.client?.client_name}` : ''
  //       }${data.client?.client_fathername ? ` ${data.client?.client_fathername}` : ''}`,
  //       client_passport: data.client.passport_series,
  //       pinfl: data.client?.pinfl,
  //       date_of_issue: data?.client.date_of_issue,
  //       given_by: data.client.given_by,
  //       address_by_passport: data.client.address_by_passport,
  //       phone_number: data.client?.phone_option?.phone_number,
  //       layout_image: data.apartment.layout_image,
  //       price_square_meter: data.apartment.price_square_meter,
  //       price_square_meter_text: convertNumberToWordsRu(data.apartment.price_square_meter, {
  //         showNumberParts: {
  //           fractional: false,
  //         },
  //         showCurrency: {
  //           integer: false,
  //         },
  //       }),
  //       apartment_area: data.apartment.apartment_area,
  //       total_price: data.apartment.price_square_meter * data.apartment.apartment_area,
  //       total_price_text: convertNumberToWordsRu(
  //         data.apartment.price_square_meter * data.apartment.apartment_area,
  //         {
  //           showNumberParts: {
  //             fractional: false,
  //           },
  //           showCurrency: {
  //             integer: false,
  //           },
  //         }
  //       ),
  //       months: data.months,
  //     };

  //     console.log('TEMPLATE DATA', templateData, data);

  //     doc.renderAsync(templateData).then((a) => {
  //       console.log('HHHH', a);
  //       const out = doc.getZip().generate({
  //         type: 'blob',
  //         mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //       }); // Output the document using Data-URI

  //       setBlob(out);
  //     });

  //     // Отображаем PDF или выполняем другие действия с полученным Blob

  //     // saveAs(out, 'output.docx');
  //   });
  // };

  const generateDocument = async (data) => {
    let template;
    if (data.paymentType === 'Наличными') {
      if (data?.client?.client_type === '0') {
        template = await loadFile('/assets/contract_without_plan_ph.docx');
      }
      if (data?.client?.client_type === '1') {
        template = await loadFile('/assets/contract_business_without_plan_ph.docx');
      }
    } else {
      if (data?.client?.client_type === '0') {
        template = await loadFile('/assets/contract_ph.docx');
      }
      if (data?.client?.client_type === '1') {
        template = await loadFile('/assets/contract_business_ph.docx');
      }
    }

    const img = await loadImage(data.apartment.layout_image);

    const templateData = {
      contract_number: data.contract_number,
      contract_date: formatRussianDate(
        dayjs(data.contract_date).locale('ru').format('«D» MMMM YYYY [года]')
      ),
      contract_date2: formatRussianDate(
        dayjs(data.contract_date).locale('ru').format('«D» MMMM YYYY [г]')
      ),
      client_name:
        data?.client?.client_type === '0'
          ? `${data?.client?.client_surname || ''}${
              data?.client?.client_name ? ` ${data?.client?.client_name}` : ''
            }${data?.client?.client_fathername ? ` ${data?.client?.client_fathername}` : ''}`
          : data?.client?.business_name,
      director_name: data?.client?.business_director_name || '',
      project_name: data?.apartment?.project_name,
      client_address: data?.client?.business_address,
      client_passport: data?.client?.passport_series,
      bank_number: data?.client?.business_bank_number,
      bank_name: data?.client?.business_bank_name,
      mfo: data?.client?.business_mfo,
      inn:
        data?.client?.client_type === '0' ? data?.client?.client_inn : data?.client?.business_inn,
      pinfl: data?.client?.pinfl,
      date_of_issue: dayjs(data?.client?.date_of_issue).format('DD.MM.YYYY'),
      given_by: data?.client?.given_by,
      address_by_passport: data?.client?.address_by_passport,
      phones: data?.client?.phone_option?.map((phone) => phone?.phone_number)?.join('\n'),
      director_short_name: abbreviateName(data?.client?.business_director_name),
      layout_image: {
        _type: 'image',
        source: img,
        format: 'image/png',

        height: 135,
      },
      price_square_meter: new Intl.NumberFormat('de-DE').format(
        currency * data?.apartment?.price_square_meter
      ),
      price_square_meter_text: convertNumberToWordsRu(
        currency * data?.apartment?.price_square_meter,
        {
          showNumberParts: {
            fractional: false,
          },
          showCurrency: {
            integer: false,
          },
        }
      ),
      apartment_area: new Intl.NumberFormat('de-DE').format(data?.apartment?.apartment_area),
      total_price: new Intl.NumberFormat('de-DE').format(data?.totalAmount),
      total_price_text: convertNumberToWordsRu(data?.totalAmount, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      remain_payment: new Intl.NumberFormat('de-DE').format(
        data?.totalAmount - +data?.initialPayment?.replace(/,/g, '')
      ),
      remainder_amount: new Intl.NumberFormat('de-DE').format(
        // eslint-disable-next-line no-unsafe-optional-chaining
        data?.totalAmount - +data?.initialPayment?.replace(/,/g, '')
      ),
      remain_payment_text: convertNumberToWordsRu(
        data?.totalAmount - +data?.initialPayment?.replace(/,/g, ''),
        {
          showNumberParts: {
            fractional: false,
          },
          showCurrency: {
            integer: false,
          },
        }
      ),
      // eslint-disable-next-line eqeqeq
      has_initial_payment: data?.initialPayment && data?.initialPayment != '0',
      initial_payment: new Intl.NumberFormat('de-DE').format(
        data?.initialPayment?.replace(/,/g, '')
      ),
      // eslint-disable-next-line no-unsafe-optional-chaining
      initial_payment_text: convertNumberToWordsRu(data?.initialPayment?.replace(/,/g, ''), {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      months: data?.paymentday?.length,
      pays: data?.mounthPayList?.map((mp, idx) => ({
        num: idx + 1,
        // eslint-disable-next-line no-nested-ternary
        date: currentContract
          ? moment(mp?.date, 'DD-MM-YYYY', true).isValid()
            ? moment(mp?.date, 'DD-MM-YYYY').format('DD.MM.YYYY г.')
            : moment(mp?.date).format('DD.MM.YYYY г.')
          : data?.monthlyPaymentAuto === 'Автоматически'
            ? moment(mp?.date).format('DD.MM.YYYY г.')
            : moment(mp?.date, 'DD-MM-YYYY').format('DD.MM.YYYY г.'),
        price: new Intl.NumberFormat('de-DE').format(mp?.price),
      })),
      room_qty_text1: convertNumberToWordsRu(data?.apartment?.rooms_number, {
        currency: {
          currencyNameCases: ['комнатная', 'комнатные', 'комнатных'],
          currencyNameDeclensions: {
            nominative: ['комнатная', ''],
            genitive: ['комнатная', 'комнатная'],
          },
          fractionalPartNameCases: ['', '', ''],
          fractionalPartNameDeclensions: {
            nominative: ['', ''],
            genitive: ['', ''],
            dative: ['', ''],
            accusative: ['', ''],
            instrumental: ['', ''],
            prepositional: ['', ''],
          },
          currencyNounGender: {
            integer: 2,
            fractionalPart: 1,
            fractional: 0,
          },
          fractionalPartMinLength: 2,
        },
        showNumberParts: {
          fractional: false,
        },
        convertNumberToWords: {
          fractional: true,
        },
        showCurrency: {
          fractional: false,
        },
        declension: data?.apartment?.rooms_number === '1' ? 'nominative' : 'genitive',
      }).replace(/\s/g, ''),
      room_qty_text2: convertNumberToWordsRu(data?.apartment?.rooms_number, {
        currency: {
          currencyNameCases: ['комнатную', 'комнатная', 'комнатную'],
          currencyNameDeclensions: {
            nominative: ['комнатную', ''],
            genitive: ['комнатную', 'комнатную'],
          },
          fractionalPartNameCases: ['', '', ''],
          fractionalPartNameDeclensions: {
            nominative: ['', ''],
            genitive: ['', ''],
            dative: ['', ''],
            accusative: ['', ''],
            instrumental: ['', ''],
            prepositional: ['', ''],
          },
          currencyNounGender: {
            integer: 2,
            fractionalPart: 1,
            fractional: 0,
          },
          fractionalPartMinLength: 2,
        },
        showNumberParts: {
          fractional: false,
        },
        convertNumberToWords: {
          fractional: true,
        },
        showCurrency: {
          fractional: false,
        },
        declension: data?.apartment?.rooms_number === '1' ? 'nominative' : 'genitive',
      }).replace(/\s/g, ''),
      floor: `${data?.apartment?.floor_number}`,
      entrance: `${data?.apartment?.entrance_name}`,
      apartment_name: data?.apartment?.apartment_name,
    };

    const handler = new TemplateHandler();
    const doc = await handler.process(template, templateData);
    // saveFile('myTemplate - output.docx', doc);
    setBlob(doc);
  };

  function saveFile(filename, b) {
    // see: https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link

    // get downloadable url from the blob
    const blobUrl = URL.createObjectURL(b);

    // create temp link element
    let link = document.createElement('a');
    link.download = filename;
    link.href = blobUrl;

    // use the link to invoke a download
    document.body.appendChild(link);
    link.click();

    // remove the link
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      link = null;
    }, 0);
  }

  const handleCreateAndSend = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  const onSubmit = handleSubmit((data) => {
    generateDocument(data);
    setContractData(data);
    previewContract.onTrue();
  });

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
          <Box
            sx={{
              width: 160,
            }}
          >
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
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card>
          <ContractNewEditClient mode={currentContract ? 'edit' : ''} />

          <Grid container>
            <Grid sm={12} md={6} item>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                divider={
                  <Divider flexItem orientation="horizontal" sx={{ borderStyle: 'dashed' }} />
                }
                sx={{ p: 3 }}
              >
                {' '}
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
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
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
                <ClientNewEditPaymentType isEditMode={Boolean(currentContract)} />
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
          >
            Отменить
          </Button>

          <LoadingButton
            type="submit"
            size="large"
            variant="contained"
            loading={isSubmitting}
            // onClick={handleCreateAndSend}
          >
            Далее
          </LoadingButton>
        </Stack>
      </FormProvider>

      <ContractPreivewFullscreenDialog
        mode={currentContract ? 'update' : 'create'}
        blob={blob}
        handleClose={() => {
          previewContract.onFalse();
          setContractData(null);
        }}
        open={previewContract.value}
        data={contractData}
      />
    </>
  );
}

function formatRussianDate(dateString) {
  const months = {
    январь: 'января',
    февраль: 'февраля',
    март: 'марта',
    апрель: 'апреля',
    май: 'мая',
    июнь: 'июня',
    июль: 'июля',
    август: 'августа',
    сентябрь: 'сентября',
    октябрь: 'октября',
    ноябрь: 'ноября',
    декабрь: 'декабря',
  };

  const [day, month, year] = dateString.split(' ');
  const formattedMonth = months[month.toLowerCase()] || month.toLowerCase().replace(/ь$/, 'я');

  return `${day} ${formattedMonth} ${year} года`;
}

ContractNewEditForm.propTypes = {
  apartmentId: PropTypes.string,
  currentContract: PropTypes.object,
};
