/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import { ButtonBase } from '@mui/material';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import { useGetPayments } from 'src/api/payments';
import { INVOICE_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import EmptyContent from 'src/components/empty-content/empty-content';

import ArrivalToolbar from './arrival-toolbar';
import ArrivalWidgets from './arrival-widgets';
import PaymentsNewForm from '../payments/payments-new-form';

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

export default function ArrivalApartmentDetails({ invoice, contract }) {
  const [currentStatus, setCurrentStatus] = useState(invoice.status);
  const paymentDialog = useBoolean();

  const { create } = useGetPayments();

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);

  const paidSum = useMemo(
    () => contract?.paymentday?.reduce((sum, nextItem) => sum + Number(nextItem.given_amount), 0),
    [contract?.paymentday]
  );

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
                {contract?.client_surname?.charAt(0).toUpperCase()}.{contract?.client_surname || ''}
              </>
            ) : (
              `${contract?.business_name}. ${contract?.business_director_name}`
            )}
          </Box>
        </Stack>
        <Stack width={1}>
          Номер телефона
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            {contract?.phone_option?.phone_number || ''}
          </Box>
        </Stack>
        <Stack width={1}>
          Инфо. помещения
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            {`${contract?.block_name}. ${contract?.entrance_name}. ${contract?.floor_number}. ${contract?.apartment_name} - кв.`}
          </Box>
        </Stack>{' '}
        {contract?.contract_status === '2' && (
          <Stack width={1} alignItems="center">
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
          </Stack>
        )}
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

  const paymentsList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 660 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>№</TableCell>

              <TableCell width={140} sx={{ typography: 'subtitle2' }}>
                Время оплаты
              </TableCell>
              <TableCell>Сумма оплаты</TableCell>

              <TableCell>Валюта</TableCell>
              <TableCell>Тип оплаты</TableCell>

              <TableCell align="right">Оператор</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {contract?.paymentlist?.map((row, index) => (
              <TableRow key={row?.kassa_id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{row?.created_at}</TableCell>

                <TableCell align="center">{fCurrency(row?.payment_amount)}</TableCell>
                <TableCell align="center">
                  {row?.cash_type === '0' ? '$' : row?.cash_type === '1' ? '$' : '-'}
                </TableCell>

                <TableCell align="center">
                  {' '}
                  <Label
                    variant="soft"
                    color={
                      (row?.payment_method === '1' && 'error') ||
                      (row?.payment_method === '2' && 'success') ||
                      (row?.payment_method === '3' && 'info') ||
                      (row?.payment_method === '4' && 'warning') ||
                      'default'
                    }
                  >
                    {(row?.payment_method === '1' && 'Наличка') ||
                      (row?.payment_method === '2' && 'Терминал') ||
                      (row?.payment_method === '3' && 'Клик') ||
                      (row?.payment_method === '4' && 'Банк') ||
                      'default'}
                  </Label>
                </TableCell>
                <TableCell align="right">{row?.operator}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <Stack spacing={1}>
      <ArrivalToolbar
        contract={contract}
        invoice={invoice}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      />
      {renderContractInfo}

      <ArrivalWidgets
        chart={{
          series: [
            { label: 'Общая сумма', percent: 100, total: contract?.total_price || 0 },
            {
              label: 'Пер. платеж',
              percent:
                contract?.initial_payment > 0
                  ? // eslint-disable-next-line no-unsafe-optional-chaining
                    (contract?.initial_payment * 100) / contract?.total_price
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
                    ((contract?.total_price - paidSum) * 100) / contract?.total_price
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
            {contract?.paymentlist?.length ? paymentsList : <EmptyContent title="Нет данных" />}
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

ArrivalApartmentDetails.propTypes = {
  invoice: PropTypes.object,
  contract: PropTypes.object,
};
