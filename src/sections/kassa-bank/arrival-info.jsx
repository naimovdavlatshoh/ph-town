/* eslint-disable no-unsafe-optional-chaining */
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, ListItemText } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
    return `"${client?.business_name}". Директор: ${
      client?.business_director_name || 'Не заполнен'
    }`;
  }
  return '';
};

const getPaymentMethodTitle = (id) => {
  if (id === '1') return 'Наличка';
  if (id === '2') return 'Терминал';
  if (id === '3') return 'Клик';
  if (id === '4') return 'Банк';

  return '';
};

export default function ArrivalInfo({ title, arrival, sx, ...other }) {
  const paidAmount = arrival?.paymentlist?.reduce(
    (sum, payment) => sum + Number(payment?.payment_amount),
    0
  );

  const layoutModal = useBoolean();

  const paid = arrival?.payment_history?.reduce((prev, curr) => prev + +curr?.payment_amount, 0);

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>

      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            <Label color="info">Оплачено в {arrival?.cash_type === '1' ? 'USD' : 'UZS'}</Label>
            <Stack
              direction="row"
              gap={0.2}
              alignItems="baseline"
              position="relative"
              width="max-content"
            >
              <Typography variant="h3">
                {fCurrency(
                  arrival?.cash_type === '1' ? arrival?.payment_amount_usd : arrival?.payment_amount
                )}{' '}
                {arrival?.cash_type === '1' ? 'USD' : 'UZS'}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{ position: 'absolute', bottom: 5, right: 'calc(-100% - 10px)' }}
              >
                ={' '}
                {fCurrency(
                  arrival?.cash_type === '1' ? arrival?.payment_amount : arrival?.payment_amount_usd
                )}{' '}
                {arrival?.cash_type === '1' ? 'UZS' : 'USD'}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2}>
            <ListItemText
              disableTypography
              primary={
                <Link
                  component={RouterLink}
                  href={paths.dashboard.clients.details(arrival?.client_id)}
                >
                  <Typography variant="body2" noWrap>
                    {`1 USD = ${fCurrency(arrival?.moment_usd_rate)} UZS`}
                  </Typography>{' '}
                </Link>
              }
              secondary={
                <Link
                  noWrap
                  variant="body2"
                  // onClick={onViewRow}
                  sx={{ color: 'text.disabled', cursor: 'pointer' }}
                >
                  {arrival?.client_type === '0' && 'Физ.лицо'}
                  {arrival?.client_type === '1' && 'Юр.лицо'}
                </Link>
              }
            />
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Метод оплаты
          </Typography>
          <Typography variant="body2" color="success.main">
            <Label
              variant="soft"
              color={
                (arrival?.payment_method === '1' && 'error') ||
                (arrival?.payment_method === '2' && 'success') ||
                (arrival?.payment_method === '3' && 'info') ||
                (arrival?.payment_method === '4' && 'warning') ||
                'default'
              }
            >
              {getPaymentMethodTitle(arrival?.payment_method)}
            </Label>
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Категория
          </Typography>
          <Typography variant="body2">{arrival?.category_name}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Оператор
          </Typography>
          <Typography variant="body2">{arrival?.operator_name}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Комментарий
          </Typography>
          <Typography variant="body2">{arrival?.comments || 'Нет комментариев'}</Typography>
        </Stack>
      </Stack>
      {/* {arrival?.payment_history?.length > 0 && (
        <>
          <Typography mt={2} variant="subtitle2" gutterBottom>
            История
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Метод</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrival?.payment_history?.map((row, idx) => (
                  <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <RenderCellCreatedAt
                        params={{
                          row: {
                            created_at: row?.created_at,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {getPaymentMethodTitle(row?.payment_method)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" color="success.main">
                        +{fCurrency(row?.payment_amount)} UZS
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>{' '}
        </>
      )} */}
    </Card>
  );
}

ArrivalInfo.propTypes = {
  arrival: PropTypes.object,
  sx: PropTypes.object,
  title: PropTypes.string,
};
