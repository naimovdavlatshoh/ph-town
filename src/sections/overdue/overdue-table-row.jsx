import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Тип клиента: 0 — физлицо, 1 — юрлицо (в новом ответе приходит числом)
const isBusiness = (row) => Number(row?.client_type) === 1;

function getDisplayName(row) {
  if (isBusiness(row)) return row?.business_name || 'Без названия';
  return [row?.client_surname, row?.client_name, row?.client_fathername]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function formatPhone(phone) {
  if (!phone) return '';
  const d = String(phone).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('998')) {
    return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  return phone;
}

// Цвет по тяжести просрочки
function overdueColor(days) {
  if (days >= 90) return 'error';
  if (days >= 30) return 'warning';
  return 'info';
}

// «дни» с правильным склонением
function pluralDays(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'дня';
  return 'дней';
}

// «платёж» с правильным склонением
function pluralPayments(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'платёж';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'платежа';
  return 'платежей';
}

// ----------------------------------------------------------------------

export default function OverdueTableRow({ row, selected }) {
  const {
    contract_id,
    contract_number,
    phone_number,
    overdue_days,
    overdue_months,
    first_overdue_date,
    total_debt,
  } = row;

  const displayName = getDisplayName(row);
  const business = isBusiness(row);
  const initial = (displayName || '?').charAt(0).toUpperCase();

  return (
    <TableRow hover selected={selected}>
      {/* Контракт */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Link
          component={RouterLink}
          href={paths.dashboard.contracts.details(contract_id)}
          sx={{ fontWeight: 600 }}
        >
          {contract_number}
        </Link>
      </TableCell>

      {/* Клиент */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 15,
              bgcolor: business ? 'info.lighter' : 'primary.lighter',
              color: business ? 'info.darker' : 'primary.darker',
            }}
          >
            {initial}
          </Avatar>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName || '—'}
            </Typography>
            <Label variant="soft" color={business ? 'info' : 'default'} sx={{ height: 18, fontSize: 11 }}>
              {business ? 'Юр. лицо' : 'Физ. лицо'}
            </Label>
          </Stack>
        </Stack>
      </TableCell>

      {/* Телефон */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {phone_number ? (
          <Link
            href={`tel:${phone_number}`}
            color="inherit"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Iconify icon="solar:phone-bold" width={16} sx={{ color: 'text.disabled' }} />
            {formatPhone(phone_number)}
          </Link>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </TableCell>

      {/* Первая просрочка */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack spacing={0.25}>
          <Typography variant="body2">{first_overdue_date || '—'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {overdue_months} {pluralPayments(Number(overdue_months))}
          </Typography>
        </Stack>
      </TableCell>

      {/* Просрочка (дни) */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label variant="soft" color={overdueColor(Number(overdue_days))} sx={{ fontWeight: 700 }}>
          {overdue_days} {pluralDays(Number(overdue_days))}
        </Label>
      </TableCell>

      {/* Задолженность */}
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 700 }}>
          {fCurrency(total_debt)} UZS
        </Typography>
      </TableCell>

      {/* Действия */}
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        <Tooltip title="Открыть контракт" placement="top" arrow>
          <IconButton
            color="default"
            component={RouterLink}
            href={paths.dashboard.contracts.details(contract_id)}
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

OverdueTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};
