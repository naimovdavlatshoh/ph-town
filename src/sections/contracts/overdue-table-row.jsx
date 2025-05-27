import { useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Link, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function OverdueTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onPreviewDocument,
}) {
  const {
    client_id,
    contract_id,
    contract_payment_date,
    given_amount,
    monthly_fee,
    overdue_days,
    contract_number,
  } = row;

  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = () => {
    setOpenComment(true);
  };

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

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Link component={RouterLink} href={paths.dashboard.contracts.details(contract_id)}>
          {contract_number}
        </Link>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderClientName(row)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(contract_payment_date)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="h6" sx={{ color: 'red', fontSize: '14px !important' }}>
          {fCurrency(given_amount)} UZS
        </Typography>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fCurrency(monthly_fee)} UZS</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{overdue_days}</TableCell>
    </TableRow>
  );
}

OverdueTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
