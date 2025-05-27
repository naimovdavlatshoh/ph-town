// eslint-disable-next-line import/no-extraneous-dependencies
import 'dayjs/locale/ru';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import * as Yup from 'yup';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TemplateHandler } from 'easy-template-x';
// eslint-disable-next-line import/no-extraneous-dependencies
import { yupResolver } from '@hookform/resolvers/yup';
// eslint-disable-next-line import/no-unresolved
import { useMemo, useState, useEffect, useCallback } from 'react';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';

import { Box } from '@mui/system';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, Divider, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';
import convertContractTypeToText from 'src/utils/convert-contract-type-to-text';

import { useGetCurrency } from 'src/api/currency';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

import ContractNewEditClient from './contract-new-edit-client';
import ContractNewEditDetails from './contract-new-edit-details';
import ContractNewEditStatusDate from './contract-new-edit-status-date';
import ClientNewEditPaymentType from './contract-new-edit-payment-type';
import ContractNewEditDetailsAuto from './contract-new-edit-details-auto';
import ContractPreivewFullscreenDialog from './arrival-preview-fullscreen-dialog';

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

export default function ArrivalNewEditForm({ currentContract, apartmentId }) {
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
      Yup.string().when('paymentType', ([paymentType], schema) =>
        paymentType === 'В рассрочку' ? schema.required('Заполните поле') : schema
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
          ? schema.required('Заполните поле')
          : schema
    ),
  });

  window.moment = moment;
  window.dayjs = dayjs;

  const defaultValues = useMemo(
    () => ({
      client: currentContract
        ? {
            client_id: currentContract?.client_id,
            client_type: currentContract?.client_type,
            client_name: currentContract?.client_name,
            client_surname: currentContract?.client_surname,
            client_fathername: currentContract?.client_fathername,
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
          }
        : null,
      mounthPayList: currentContract?.paymentday?.length
        ? currentContract?.paymentday?.map((pd) => ({
            date: pd.contract_payment_date,
            price: pd.monthly_fee,
          }))
        : [],
      monthlyPaymentAuto: 'Автоматически',
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
      monthly_fee: currentContract?.paymentday?.length
        ? currentContract?.paymentday[0]?.monthly_fee
        : '',
    }),
    [currentContract]
  );

  const methods = useForm({
    resolver: yupResolver(NewContractSchema),
    defaultValues,
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting },
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
    const template =
      data.paymentType === 'Наличными'
        ? await loadFile('/assets/contract_without_plan.docx')
        : await loadFile('/assets/contract  (4).docx');
    const img = await loadImage(data.apartment.layout_image);

    const templateData = {
      contract_number: data.contract_number,
      contract_date: formatRussianDate(dayjs().locale('ru').format('«D» MMMM YYYY [года]')),
      contract_date2: formatRussianDate(dayjs().locale('ru').format('«D» MMMM YYYY [г]')),
      client_name: `${data.client_surname || ''}${data.client_name ? ` ${data.client_name}` : ''}${
        data.client_fathername ? ` ${data.client_fathername}` : ''
      }`,
      client_passport: data.passport_series,
      pinfl: data.pinfl,
      date_of_issue: dayjs(data?.date_of_issue).format('DD.MM.YYYY'),
      given_by: data.given_by,
      address_by_passport: data.address_by_passport,
      phones: data.phone_option?.map((phone) => ({ phone: phone?.phone_number })),
      layout_image: {
        _type: 'image',
        source: img,
        format: 'image/png',

        height: 135,
      },
      price_square_meter: new Intl.NumberFormat('de-DE').format(currency * data.price_square_meter),
      price_square_meter_text: convertNumberToWordsRu(currency * data.price_square_meter, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      apartment_area: new Intl.NumberFormat('de-DE').format(data.apartment_area),
      total_price: new Intl.NumberFormat('de-DE').format(data?.total_price),
      total_price_text: convertNumberToWordsRu(data?.total_price, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      remain_payment: new Intl.NumberFormat('de-DE').format(
        // eslint-disable-next-line no-unsafe-optional-chaining
        data?.total_price - data?.initial_payment
      ),
      remainder_amount: new Intl.NumberFormat('de-DE').format(
        // eslint-disable-next-line no-unsafe-optional-chaining
        data?.total_price - data?.initial_payment
      ),
      // eslint-disable-next-line no-unsafe-optional-chaining
      remain_payment_text: convertNumberToWordsRu(data?.total_price - data?.initial_payment, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      // eslint-disable-next-line eqeqeq
      has_initial_payment: data?.initial_payment && data?.initial_payment != '0',
      initial_payment: new Intl.NumberFormat('de-DE').format(data?.initial_payment),
      // eslint-disable-next-line no-unsafe-optional-chaining
      initial_payment_text: convertNumberToWordsRu(data?.initial_payment, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      months: data?.paymentday?.length,
      pays: data?.paymentday?.map((mp) => ({
        date: moment(mp?.contract_payment_date, 'DD-MM-YYYY').format('DD.MM.YYYY г.'),
        price: new Intl.NumberFormat('de-DE').format(mp?.monthly_fee),
      })),
      room_qty_text1: convertNumberToWordsRu(data.rooms_number, {
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
        declension: data.rooms_number === '1' ? 'nominative' : 'genitive',
      }).replace(/\s/g, ''),
      room_qty_text2: convertNumberToWordsRu(data.rooms_number, {
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
        declension: data.rooms_number === '1' ? 'nominative' : 'genitive',
      }).replace(/\s/g, ''),
      floor: `${data.floor_number}`,
      entrance: `${data.entrance_name}`,
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

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card>
          <ContractNewEditClient />
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            divider={<Divider flexItem orientation="horizontal" sx={{ borderStyle: 'dashed' }} />}
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
            />
          </Stack>

          {methods.watch('client') && methods.watch('apartment') && (
            <ClientNewEditPaymentType isEditMode={currentContract} />
          )}

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
        mode="create"
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

ArrivalNewEditForm.propTypes = {
  apartmentId: PropTypes.string,
  currentContract: PropTypes.object,
};
