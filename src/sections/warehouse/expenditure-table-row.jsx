import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';

import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import UserQuickEditForm from './user-quick-edit-form';
import { RenderCellCreatedAt } from '../checkerboard/client-table-row';

// ----------------------------------------------------------------------

export default function ExpenditureTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onPreviewDocument,
}) {
  const { project_name, material_name, firstname, lastname, amount, created_at } = row;

  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = () => {
    setOpenComment(true);
  };

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{project_name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{material_name}</TableCell>
        <TableCell>{amount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <RenderCellCreatedAt
            params={{
              row: {
                createdAt: created_at,
              },
            }}
          />
        </TableCell>
        <TableCell>{`${lastname} ${firstname}`}</TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

ExpenditureTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
