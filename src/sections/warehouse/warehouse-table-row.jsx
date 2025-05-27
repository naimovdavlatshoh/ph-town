import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function WarehouseTableRow({ row, selected }) {
  const { material_name, material_id, amount } = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{material_id}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{material_name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fNumber(amount)}</TableCell>
    </TableRow>
  );
}

WarehouseTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};
