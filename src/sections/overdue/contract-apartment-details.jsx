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
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { Button, Tooltip, ButtonBase } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';
import { useGetPayments } from 'src/api/payments';
import { useGetContracts } from 'src/api/contract';

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

// ----------------------------------------------------------------------

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

export default function ContractApartmentDetails({ invoice, contract, refresh }) {
  const [currentStatus, setCurrentStatus] = useState(invoice.status);
  const { enqueueSnackbar } = useSnackbar();
  const [loadingUploadFile, setLoadingUploadFile] = useState(false);
  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
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

      // Проверка расширения файла
      const allowedExtensions = /(\.pdf)$/i;
      if (!allowedExtensions.exec(filePDF.name)) {
        enqueueSnackbar('Неправильный формат файла. Пожалуйста, загрузите PDF файл.', {
          variant: 'warning',
        });
        return;
      }

      // Проверка размера файла
      const maxSizeInBytes = 15728640.01; // 2 MB
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

  const renderContractInfo = (
    <Card sx={{ py: 3, textAlign: 'center', typography: 'subtitle2', fontSize: 16 }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        <Stack width={1}>
          Контракт
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            {contract?.contract_number}
          </Box>
        </Stack>
        <Stack width={1}>
          Клиент
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            {contract?.client_type === '0' ? (
              <>
                {contract?.client_name?.charAt(0).toUpperCase()}.
                {contract?.client_fathername?.charAt(0).toUpperCase()}.
                {contract?.client_surname || ''}
              </>
            ) : (
              `${contract?.business_name}. ${contract?.business_director_name}`
            )}
          </Box>
        </Stack>
        <Stack width={1}>
          Номер телефона
          <Stack
            direction="row"
            component="span"
            justifyContent="center"
            sx={{ color: 'text.secondary', typography: 'body2' }}
          >
            {contract?.phone_option?.map((phone) => (
              <Typography key={phone?.phone_id} variant="body2">
                {phone?.phone_number};
              </Typography>
            ))}
          </Stack>
        </Stack>
        <Stack width={1}>
          Инфо. помещения
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            {`${contract?.block_name}. ${contract?.entrance_name}. ${contract?.floor_number}. ${contract?.apartment_name} - кв.`}
          </Box>
        </Stack>{' '}
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
                  href={contract?.download_link}
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
        <Stack gap={1} width={1} alignItems="center">
          {contract?.contract_status === '2' && ['1', '2', '5'].includes(user?.role) && (
            <Stack
              onClick={paymentDialog.onTrue}
              component={ButtonBase}
              alignItems="center"
              width={100}
              height={50}
              sx={{ background: '#01a76f', py: 1, px: 1, borderRadius: 0.5 }}
            >
              <Iconify icon="uiw:pay" sx={{ width: 40, color: '#ffff' }} />
              <Box component="span" sx={{ color: '#fff', typography: 'body2' }}>
                Оплатить
              </Box>
            </Stack>
          )}
          {['1', '2'].includes(user?.role) && (
            <Stack
              onClick={exportToExcel}
              component={ButtonBase}
              loading={loadingExcelFile}
              alignItems="center"
              width={100}
              height={50}
              sx={{
                background: loadingExcelFile ? '#01a76f33' : '#01a76f',
                py: 1,
                px: 1,
                borderRadius: 0.5,
              }}
              direction="row"
            >
              <Iconify icon="healthicons:excel-logo" sx={{ width: 40, color: '#ffff' }} />
              <Box component="span" sx={{ color: '#fff', typography: 'body2' }}>
                Скачать
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(invoice.subTotal)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Shipping</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          {fCurrency(-invoice.shipping)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          {fCurrency(-invoice.discount)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Taxes</TableCell>
        <TableCell width={120}>{fCurrency(invoice.taxes)}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(invoice.totalAmount)}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderFooter = (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant="subtitle2">NOTES</Typography>

        <Typography variant="body2">
          We appreciate your business. Should you need us to add VAT or extra notes let us know!
        </Typography>
      </Grid>

      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant="subtitle2">Have a Question?</Typography>

        <Typography variant="body2">support@minimals.cc</Typography>
      </Grid>
    </Grid>
  );

  const paymentsDayList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 430 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>№</TableCell>

              <TableCell>Даты оплаты</TableCell>

              <TableCell align="center">Сумма оплаты</TableCell>

              <TableCell align="right">Оплачено</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {contract?.paymentday?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{row?.contract_payment_date}</TableCell>

                <TableCell align="center">{fCurrency(row?.monthly_fee)}</TableCell>

                <TableCell
                  align="right"
                  sx={{
                    color: row?.monthly_fee === row?.given_amount ? '#118D57' : '#B76E00',
                    fontWeight: '700',
                  }}
                >
                  {fCurrency(row?.given_amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  // eslint-disable-next-line no-unsafe-optional-chaining

  return (
    <Stack spacing={1}>
      {/* <ContractToolbar
        contract={contract}
        invoice={invoice}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      /> */}
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
        <Grid item xs={6}>
          <Card sx={{ py: 5, px: 5 }}>
            {' '}
            {contract?.paymentday?.length ? paymentsDayList : <EmptyContent title="Нет данных" />}
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ py: 5, px: 5 }}>
            {' '}
            {contract?.paymentlist?.length ? (
              <ContractPaymentListTable contract={contract} />
            ) : (
              <EmptyContent title="Нет данных" />
            )}
          </Card>
        </Grid>
      </Grid>

      <PaymentsNewForm
        open={paymentDialog.value}
        onClose={paymentDialog.onFalse}
        data={contract}
        onCreate={create}
      />
    </Stack>
  );
}

ContractApartmentDetails.propTypes = {
  invoice: PropTypes.object,
  contract: PropTypes.object,
  refresh: PropTypes.func,
};
