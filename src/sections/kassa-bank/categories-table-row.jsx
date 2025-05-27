import { useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Tooltip, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

import { RenderCellCreatedAt } from '../checkerboard/client-table-row';

// ----------------------------------------------------------------------

export default function CategoriesTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onPreviewDocument,
}) {
  const { category_id, category_name, created_at } = row;

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

  const { user } = useAuthContext();

  return (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <RenderCellCreatedAt
          params={{
            row: {
              createdAt: created_at,
            },
          }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{category_name}</TableCell>
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

CategoriesTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
