import dayjs from 'dayjs';
import moment from 'moment';
import PropTypes from 'prop-types';
import { TemplateHandler } from 'easy-template-x';
import { useState, useEffect, useCallback } from 'react';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';

import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';

import { useGetContracts } from 'src/api/contract';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import ContractPreivewFullscreenDialog from './contract-preview-fullscreen-dialog';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

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

const convertWebPToPNG = async (webpBlob) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(webpBlob);
  });

// ----------------------------------------------------------------------

export default function ContractToolbar({
  invoice,
  currentStatus,
  statusOptions,
  onChangeStatus,
  contract,
}) {
  const [file, setFile] = useState();
  const {user} = useAuthContext()
  const [loadingUploadFile, setLoadingUploadFile] = useState(false);

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [previewBlob, setPreviewBlob] = useState();
  const [contractNumber, setContractNumber] = useState();
  const [downloadingContract, setDownloadingContract] = useState(false);
  const view = useBoolean();
  const printer = useBoolean();
  const { update, contractsLoading } = useGetContracts();

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.contracts.edit(contract?.contract_id));
  }, [contract?.contract_id, router]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateDocument = async (data) => {
    const template =
      data.contract_type === '0'
        ? await loadFile('/assets/contract_without_plan.docx')
        : await loadFile('/assets/contract  (4).docx');
    const img = await loadImage(data.layout_image);

    // const imgPNG = await convertWebPToPNG(imgWebP);

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
      price_square_meter: new Intl.NumberFormat('de-DE').format(data.price_square_meter),
      price_square_meter_text: convertNumberToWordsRu(data.price_square_meter, {
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
    const blob = await handler.process(template, templateData);

    const reader = new FileReader();

    reader.onload = () => {};

    reader.readAsArrayBuffer(blob);

    return blob;
  };

  const onPreviewDocument = useCallback(async () => {
    const generatedBlob = await generateDocument(contract);

    setPreviewBlob(generatedBlob);
    setContractNumber(contract?.contract_number);
  }, [contract, generateDocument]);

  const onPrintDocument = useCallback(async () => {
    const generatedBlob = await generateDocument(contract);

    setPreviewBlob(generatedBlob);
    setContractNumber(contract?.contract_number);
  }, [contract, generateDocument]);

  const onDownLoadFile = useCallback(
    async (id) => {
      setDownloadingContract(true);

      const generatedBlob = await generateDocument(contract);

      saveFile(`контракт-№${contract?.contract_number}.docx`, generatedBlob); // Сохраняем файл
      setDownloadingContract(false);
    },
    [contract, generateDocument]
  );

  useEffect(() => {
    if (view.value) {
      onPreviewDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.value]);

  useEffect(() => {
    if (printer.value) {
      onPrintDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printer.value]);

  const uploadDocumentCopy = async (e) => {
    try {
      const filePDF = e.target.files[0];

      // Проверка расширения файла
      const allowedExtensions = /(\.pdf)$/i;
      if (!allowedExtensions.exec(filePDF.name)) {
        enqueueSnackbar('Неправильный формат файла. Пожалуйста, загрузите PDF файл.', {
          variant: 'warning',
        });
        return;
      }

      // Проверка размера файла
      const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
      if (filePDF.size > maxSizeInBytes) {
        enqueueSnackbar('Файл слишком большой. Максимальный размер файла - 2MB.', {
          variant: 'warning',
        });
        return;
      }

      const formData = new FormData();

      formData.append('contract_copy', filePDF);

      setLoadingUploadFile(true);

      const { data } = await axios.post(endpoints.contract.uploadFile, formData);

      setFile(data?.contract_file_id);

      // const formData = new FormData();
      // formData.append('contract_id', 1);
      // formData.append('contract_file_id', 1);
      // update({
      //   contract_id: contract?.contract_id,
      //   contract_file_id: data?.contract_file_id,
      // });
    } catch (error) {
      enqueueSnackbar('Ошибка загрузки файла', {
        variant: 'error',
      });
    } finally {
      setLoadingUploadFile(false);
    }
  };

  const onSave = () => {
    const data = {
      contract_id: contract?.contract_id,
      contract_file_id: file,
      client_id: contract?.client_id,
      contract_type: contract?.contract_type,
      contract_number: contract?.contract_number,
      apartment_id: contract?.apartment_id,
      apartment_area: contract?.apartment_area,
      price_square_meter: contract?.price_square_meter,
      total_price: contract?.total_price,
      initial_payment: contract?.initial_payment,
    };

    update(data, () => {
      setFile(null);
      setLoadingUploadFile(false);
    });
  };

  return (
    <>
      <Stack
        spacing={3}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Stack direction="row" spacing={1} sx={{ width: 1 }}>
          {contract?.contract_status === '1' && (
            <Tooltip title="Редактировать">
              <IconButton onClick={handleEdit}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Посмотреть договор">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          {['1', '2'].includes(user?.role) && (
            <Tooltip title="Скачать файл">
              <IconButton onClick={() => onDownLoadFile()}>
                {downloadingContract ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Iconify icon="eva:cloud-download-fill" />
                )}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Печать">
            <IconButton onClick={printer.onTrue}>
              <Iconify icon="solar:printer-minimalistic-bold" />
            </IconButton>
          </Tooltip>

          {/* <Tooltip title="Send">
            <IconButton>
              <Iconify icon="iconamoon:send-fill" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton>
              <Iconify icon="solar:share-bold" />
            </IconButton>
          </Tooltip> */}
        </Stack>
        <Stack>
          {(contract?.contract_status === '1' && (
            <Tooltip
              title={
                file ? "Нажмите кнопку 'Сохранить' для сохранения" : 'Загрузить копию договора'
              }
            >
              <Stack direction="row" alignItems="center" gap={0.2}>
                {' '}
                <Button
                  color={file ? 'info' : 'warning'}
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  sx={{ minWidth: 200, color: '#637381' }}
                  startIcon={
                    loadingUploadFile ? (
                      <Iconify icon="line-md:uploading-loop" />
                    ) : (
                      <Iconify
                        icon={file ? 'vscode-icons:file-type-pdf2' : 'line-md:cloud-upload-loop'}
                      />
                    )
                  }
                >
                  Копия договора
                  <VisuallyHiddenInput type="file" onChange={uploadDocumentCopy} />
                </Button>
                {file && (
                  <LoadingButton
                    loading={contractsLoading}
                    onClick={onSave}
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="material-symbols:save-outline" />}
                  >
                    Сохранить
                  </LoadingButton>
                )}
              </Stack>
            </Tooltip>
          )) ||
            (contract?.contract_status === '2' && (
              <Tooltip title="Открыть файл договора">
                <Button
                  component="a"
                  href={contract?.contract_file_path}
                  role={undefined}
                  tabIndex={-1}
                  sx={{ minWidth: 200, color: '#637381' }}
                  startIcon={<Iconify icon="vscode-icons:file-type-pdf2" />}
                >
                  Копия договора
                </Button>
              </Tooltip>
            ))}
        </Stack>
      </Stack>

      {view.value && (
        <ContractPreivewFullscreenDialog
          mode="readOnly"
          blob={previewBlob}
          contractNumber={contractNumber}
          open={view.value}
          handleClose={view.onFalse}
        />
      )}

      {printer.value && (
        <ContractPreivewFullscreenDialog
          mode="readOnly"
          isPrint
          blob={previewBlob}
          contractNumber={contractNumber}
          open={printer.value}
          handleClose={printer.onFalse}
        />
      )}
    </>
  );
}

function saveFile(filename, blob) {
  // see: https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link

  // get downloadable url from the blob
  const blobUrl = URL.createObjectURL(blob);

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

ContractToolbar.propTypes = {
  currentStatus: PropTypes.string,
  invoice: PropTypes.object,
  onChangeStatus: PropTypes.func,
  statusOptions: PropTypes.array,
  contract: PropTypes.object.isRequired,
};
