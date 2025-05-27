/* eslint-disable no-unsafe-optional-chaining */
import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Link,
  Paper,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  ListItemText,
  TableContainer,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

import { RenderCellCreatedAt } from '../client/client-table-row';

// ----------------------------------------------------------------------

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
    return `"${client?.client_surname}" - ${client?.client_name}`;
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
  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = () => {
    setOpenComment(true);
  };

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
        <Stack gap={4} direction="column" justifyContent="space-between" alignItems="flex-start">
          <Stack
            width={1}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Typography variant="h3">{fCurrency(arrival?.total_price)} UZS</Typography>
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              onClose={handleTooltipClose}
              open={openComment}
              title={arrival?.comments || 'Нет комментариев'}
            >
              <Iconify color="orange" icon="ic:baseline-comment" onClick={handleTooltipOpen} />
            </Tooltip>
          </Stack>
          <ListItemText
            disableTypography
            primary={
              <Typography color="success.main" variant="caption" sx={{ display: 'flex' }}>
                {renderClientName(arrival)}
              </Typography>
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
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Сырьё
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {arrival?.amount} {arrival?.short_name}
          </Typography>
          <Typography variant="body2" color="info.main">
            {arrival?.material_name}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Оплачено
          </Typography>
          <Typography variant="body2" color="success.main">
            + {fCurrency(paid)} UZS
          </Typography>
        </Stack>
        {fCurrency(arrival?.total_price - paid) && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Остаток
            </Typography>
            <Typography variant="subtitle1" color="error.main">
              {fCurrency(arrival?.total_price - paid)} UZS
            </Typography>
          </Stack>
        )}
      </Stack>
      {arrival?.payment_history?.length > 0 && (
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
      )}
    </Card>
  );
}

ArrivalInfo.propTypes = {
  arrival: PropTypes.object,
  sx: PropTypes.object,
  title: PropTypes.string,
};
