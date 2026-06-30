import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function PercentBar({ value, color }) {
  const num = Number(value) || 0;
  return (
    <Stack spacing={0.5} sx={{ minWidth: 90 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" fontWeight={600}>
          {num}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={num}
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Stack>
  );
}

PercentBar.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function BarterTwoTableRow({ row }) {
  const {
    contract_id,
    contract_number,
    client_full_name,
    supplier_name,
    percent_apartment,
    percent_supplier,
    barter_comments,
    created_at,
  } = row;

  const hasSupplier = supplier_name && supplier_name.trim() !== '';

  return (
    <TableRow hover sx={{ transition: 'background-color 0.15s' }}>

      {/* Контракт */}
      <TableCell>
        <Typography
          component={RouterLink}
          href={paths.dashboard.contracts.details(contract_id)}
          variant="body2"
          fontWeight={700}
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {contract_number}
        </Typography>
      </TableCell>

      {/* Клиент */}
      <TableCell>
        <Typography
          variant="body2"
          noWrap
          sx={{ color: 'success.dark', fontWeight: 500, maxWidth: 240 }}
        >
          {client_full_name}
        </Typography>
      </TableCell>

      {/* Поставщик */}
      <TableCell>
        {hasSupplier ? (
          <Label variant="soft" color="default">
            <Iconify icon="mdi:office-building-outline" width={14} sx={{ mr: 0.5 }} />
            {supplier_name}
          </Label>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </TableCell>

      {/* % Квартиры */}
      <TableCell sx={{ minWidth: 110 }}>
        <PercentBar value={percent_apartment} color="primary" />
      </TableCell>

      {/* % Поставщика */}
      <TableCell sx={{ minWidth: 110 }}>
        <PercentBar value={percent_supplier} color="warning" />
      </TableCell>

      {/* Комментарий */}
      <TableCell sx={{ maxWidth: 160 }}>
        {barter_comments ? (
          <Tooltip title={barter_comments} arrow>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'default',
                lineHeight: 1.4,
              }}
            >
              {barter_comments}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </TableCell>

      {/* Создано */}
      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {fDate(created_at)}
        </Typography>
      </TableCell>

      {/* Действия */}
      <TableCell align="right">
        <Tooltip title="Просмотр контракта" arrow>
          <IconButton
            component={RouterLink}
            href={paths.dashboard.contracts.details(contract_id)}
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            <Iconify icon="solar:eye-bold" width={18} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

BarterTwoTableRow.propTypes = {
  row: PropTypes.object,
};
