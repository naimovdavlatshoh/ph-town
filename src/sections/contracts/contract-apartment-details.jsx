/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
// import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import { Button, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';
import { useGetPayments } from 'src/api/payments';
import { useGetContracts } from 'src/api/contract';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import EmptyContent from 'src/components/empty-content/empty-content';

import ContractWidgets from './contract-widgets';
import PaymentsNewForm from '../payments/payments-new-form';
import ContractPaymentListTable from './contract-payment-list-table';

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

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

// -------------------- Helpers --------------------

const InfoItem = ({ label, children }) => (
  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}
    >
      {label}
    </Typography>
    <Box sx={{ typography: 'subtitle2' }}>{children || '—'}</Box>
  </Stack>
);

InfoItem.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
};

const getPayDayStatus = (monthlyFee, givenAmount) => {
  const fee = Number(monthlyFee) || 0;
  const given = Number(givenAmount) || 0;
  if (given <= 0) return { color: 'default', label: 'Ожидает', percent: 0 };
  if (given >= fee) return { color: 'success', label: 'Оплачено', percent: 100 };
  return { color: 'warning', label: 'Частично', percent: fee ? (given * 100) / fee : 0 };
};

// ----------------------------------------------------------------------

export default function ContractApartmentDetails({ invoice, contract, refresh }) {
  const [currentStatus, setCurrentStatus] = useState(invoice.status);
  const { enqueueSnackbar } = useSnackbar();
  const [loadingUploadFile, setLoadingUploadFile] = useState(false);
  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
  const [loadingWord, setLoadingWord] = useState(false);
  const [file, setFile] = useState();

  const { user } = useAuthContext();

  const paymentDialog = useBoolean();

  const { create } = useGetPayments();
  const { update, confirm, contractsLoading } = useGetContracts();

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);

  const paidSum = useMemo(
    () =>
      contract?.paymentlist?.reduce((sum, nextItem) => sum + Number(nextItem.payment_amount), 0),
    [contract?.paymentlist]
  );

  const initialSum = useMemo(
    () =>
      contract?.paymentlist?.reduce(
        (sum, nextItem) =>
          sum + (nextItem?.type_of_expense === '1' ? Number(nextItem.payment_amount) : 0),
        0
      ),
    [contract?.paymentlist]
  );

  const uploadDocumentCopy = async (e) => {
    try {
      const filePDF = e.target.files[0];

      const allowedExtensions = /(\.pdf)$/i;
      if (!allowedExtensions.exec(filePDF.name)) {
        enqueueSnackbar('Неправильный формат файла. Пожалуйста, загрузите PDF файл.', {
          variant: 'warning',
        });
        return;
      }

      const maxSizeInBytes = 15728640.01;
      if (filePDF.size > maxSizeInBytes) {
        enqueueSnackbar('Файл слишком большой. Максимальный размер файла - 15MB.', {
          variant: 'warning',
        });
        return;
      }

      const formData = new FormData();
      formData.append('contract_copy', filePDF);

      setLoadingUploadFile(true);

      const { data } = await axios.post(endpoints.contract.uploadFile, formData);

      setFile(data?.contract_file_id);
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
    };

    confirm(data, () => {
      setFile(null);
      setLoadingUploadFile(false);
      refresh();
    });
  };

  const exportToExcel = async () => {
    setLoadingExcelFile(true);
    try {
      const result = await axios.get(
        `/api/v1/onecontract/excel?contract_id=${contract?.contract_id}`
      );

      if (!result?.data?.download_link) {
        enqueueSnackbar('Ошибка при скачивании файла', {
          variant: 'error',
        });
        return;
      }

      saveAs(result?.data?.download_link, `Контракт-${contract?.contract_number}.xlsx`);
      enqueueSnackbar('Файл успешно загружен!', {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar('Ошибка при скачивании файла', {
        variant: 'error',
      });
    } finally {
      setLoadingExcelFile(false);
    }
  };

  const downloadWord = async () => {
    setLoadingWord(true);
    try {
      const accessToken =
        sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');

      const response = await fetch('https://contractfile.ph.town/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ contract_id: contract?.contract_id }),
      });

      const result = await response.json();

      if (!result?.success) {
        enqueueSnackbar(result?.message || 'Не удалось сгенерировать файл', {
          variant: 'error',
        });
        return;
      }

      if (!result?.url) {
        enqueueSnackbar('Ссылка для скачивания не получена', { variant: 'error' });
        return;
      }

      saveAs(result.url, `Контракт-${contract?.contract_number || contract?.contract_id}.docx`);
      enqueueSnackbar('Файл успешно загружен!', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Ошибка при генерации файла', { variant: 'error' });
    } finally {
      setLoadingWord(false);
    }
  };

  // -------------------- Render: Шапка --------------------

  const renderClientName = () => {
    if (contract?.client_type === '0') {
      return `${contract?.client_surname || ''} ${contract?.client_name || ''} ${
        contract?.client_fathername || ''
      }`.trim();
    }
    return `${contract?.business_name || ''}${
      contract?.business_director_name ? `. Директор: ${contract.business_director_name}` : ''
    }`;
  };

  const renderCopyButton = () => {
    if (contract?.contract_status === '1') {
      return (
        <Tooltip title={file ? "Нажмите 'Сохранить' для сохранения" : 'Загрузить копию договора'}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Button
              color={file ? 'info' : 'warning'}
              variant="contained"
              component="label"
              role={undefined}
              tabIndex={-1}
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
                variant="contained"
                startIcon={<Iconify icon="material-symbols:save-outline" />}
              >
                Сохранить
              </LoadingButton>
            )}
          </Stack>
        </Tooltip>
      );
    }
    if (contract?.contract_status === '2') {
      return (
        <Tooltip title="Открыть файл договора">
          <Button
            component="a"
            href={contract?.download_link}
            variant="contained"
            color="error"
            role={undefined}
            tabIndex={-1}
            startIcon={<Iconify icon="vscode-icons:file-type-pdf2" />}
          >
            Копия договора
          </Button>
        </Tooltip>
      );
    }
    return null;
  };

  const renderContractInfo = (
    <Card sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="center">
        {/* Инфо-блок */}
        <Grid xs={12} md={8}>
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            }}
          >
            <InfoItem label="Контракт">{contract?.contract_number}</InfoItem>

            <InfoItem label="Клиент">{renderClientName()}</InfoItem>

            <InfoItem label="Телефон">
              <Stack spacing={0.25}>
                {contract?.phone_option?.length
                  ? contract.phone_option.map((phone) => (
                      <Typography key={phone?.phone_id} variant="body2">
                        {phone?.phone_number}
                      </Typography>
                    ))
                  : '—'}
              </Stack>
            </InfoItem>

            <InfoItem label="Помещение">
              {`${contract?.block_name || ''}, ${contract?.entrance_name || ''}, эт. ${
                contract?.floor_number || ''
              }, кв. ${contract?.apartment_name || ''}`}
            </InfoItem>
          </Box>
        </Grid>

        {/* Действия */}
        {/* Действия */}
        <Grid xs={12} md={4}>
          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={1}
            useFlexGap
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            alignItems="center"
            sx={{
              // одинаковая высота и базовая ширина для всех кнопок ряда
              '& .MuiButton-root': {
                height: 40,
                minWidth: 140,
                whiteSpace: 'nowrap',
              },
            }}
          >
            {renderCopyButton()}

            {contract?.contract_status === '2' && ['1', '2', '5'].includes(user?.role) && (
              <Button
                onClick={paymentDialog.onTrue}
                variant="contained"
                color="success"
                startIcon={<Iconify icon="solar:wad-of-money-bold" />}
              >
                Оплатить
              </Button>
            )}

            {['1', '2'].includes(user?.role) && (
              <LoadingButton
                onClick={downloadWord}
                loading={loadingWord}
                variant="contained"
                color="info"
                startIcon={<Iconify icon="vscode-icons:file-type-word" />}
              >
                Word
              </LoadingButton>
            )}

            {['1', '2'].includes(user?.role) && (
              <LoadingButton
                onClick={exportToExcel}
                loading={loadingExcelFile}
                variant="contained"
                color="success"
                startIcon={<Iconify icon="healthicons:excel-logo" />}
              >
                Excel
              </LoadingButton>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );

  // -------------------- Render: График оплат --------------------

  const paymentsDayList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 480 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>№</TableCell>
              <TableCell>Дата оплаты</TableCell>
              <TableCell align="center">Сумма</TableCell>
              <TableCell align="right">Оплачено</TableCell>
              <TableCell align="center" width={130}>
                Статус
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {contract?.paymentday?.map((row, index) => {
              const status = getPayDayStatus(row?.monthly_fee, row?.given_amount);
              return (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>

                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.contract_payment_date}</TableCell>

                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {fCurrency(row?.monthly_fee)}
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack spacing={0.5} alignItems="flex-end">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color:
                            status.color === 'success'
                              ? 'success.main'
                              : status.color === 'warning'
                                ? 'warning.main'
                                : 'text.disabled',
                        }}
                      >
                        {fCurrency(row?.given_amount)}
                      </Typography>
                      {status.color === 'warning' && (
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(status.percent, 100)}
                          color="warning"
                          sx={{ width: 80, height: 4, borderRadius: 1 }}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Label variant="soft" color={status.color}>
                      {status.label}
                    </Label>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <Stack spacing={1}>
      {renderContractInfo}

      <ContractWidgets
        initialPayment={contract?.initial_payment_status === '1'}
        chart={{
          series: [
            { label: 'Общая сумма', percent: 100, total: contract?.total_price || 0 },
            {
              label: 'Пер. платеж',
              percent:
                initialSum > 0
                  ? // eslint-disable-next-line no-unsafe-optional-chaining
                    (initialSum * 100) / contract?.total_price
                  : 0,
              total: contract?.initial_payment || 0,
            },
            {
              label: 'Оплачено',
              percent:
                paidSum > 0
                  ? // eslint-disable-next-line no-unsafe-optional-chaining
                    (paidSum * 100) / contract?.total_price
                  : 0,
              total: paidSum,
            },
            {
              label: 'Остаток',
              percent:
                // eslint-disable-next-line no-unsafe-optional-chaining
                contract?.total_price - paidSum > 0
                  ? // eslint-disable-next-line no-unsafe-optional-chaining
                    ((contract?.total_price - paidSum) * 100) /
                    // eslint-disable-next-line no-unsafe-optional-chaining
                    contract?.total_price
                  : 0,
              // eslint-disable-next-line no-unsafe-optional-chaining
              total: contract?.total_price - paidSum,
            },
          ],
        }}
      />

      <Grid container spacing={1}>
        <Grid xs={6}>
          <Card sx={{ py: 5, px: 5 }}>
            {contract?.paymentday?.length ? paymentsDayList : <EmptyContent title="Нет данных" />}
          </Card>
        </Grid>
        <Grid xs={6}>
          <Card sx={{ py: 5, px: 5 }}>
            {contract?.paymentlist?.length ? (
              <ContractPaymentListTable contract={contract} />
            ) : (
              <EmptyContent title="Нет данных" />
            )}
          </Card>
        </Grid>
      </Grid>

      {contract && (
        <PaymentsNewForm
          open={paymentDialog.value}
          onClose={paymentDialog.onFalse}
          data={contract}
          onCreate={create}
        />
      )}
    </Stack>
  );
}

ContractApartmentDetails.propTypes = {
  invoice: PropTypes.object,
  contract: PropTypes.object,
  refresh: PropTypes.func,
};
