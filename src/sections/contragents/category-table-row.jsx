import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Tooltip, IconButton } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';

import { RenderCellCreatedAt } from '../checkerboard/client-table-row';

// ----------------------------------------------------------------------

export default function CategoryTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onPreviewDocument,
}) {
  const { counterparty_id, counterparty_name, created_at } = row;

  const { user } = useAuthContext();

  return (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{counterparty_name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <RenderCellCreatedAt
          params={{
            row: {
              createdAt: created_at,
            },
          }}
        />
      </TableCell>
      <TableCell sx={{ px: 1, whiteSpace: 'nowrap', textAlign: 'center' }}>
        {['1', '2'].includes(user?.role) && (
          <>
            {' '}
            <Tooltip title="Редактировать" placement="top" arrow>
              <IconButton
                color="inherit"
                onClick={() => {
                  onEditRow(row);
                }}
              >
                <Iconify color="#ffb017" icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

CategoryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
