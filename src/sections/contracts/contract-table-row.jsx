import { useState } from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Link, Switch, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { CUSTOM_BASE_URL } from 'src/utils/custom-base-url';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './user-quick-edit-form';
import { RenderCellCreatedAt } from '../checkerboard/client-table-row';

// -------------------- Helpers --------------------

const getStatusColor = (isDeleted, isTerminated, status) => {
  if (isDeleted) return 'default';
  if (isTerminated) return 'error';
  if (status === '1') return 'warning';
  if (status === '2') return 'success';
  return 'default';
};

const getStatusLabel = (isDeleted, isTerminated, status) => {
  if (isDeleted) return 'Удален';
  if (isTerminated) return 'Расторгнут';
  if (status === '1') return 'В процессе';
  if (status === '2') return 'Подтвержден';
  return 'Не определен';
};

const getContractTypeColor = (type) => {
  if (type === '1') return 'success';
  if (type === '0') return 'warning';
  return 'default';
};

const getContractTypeLabel = (type) => {
  if (type === '1') return 'Рассрочка';
  if (type === '0') return 'Наличка';
  return 'Не определен';
};

// -------------------- Component --------------------

export default function ContractTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onTerminateRow,
  onPreviewDocument,
}) {
  const {
    send_an_sms,
    comments,
    contract_status,
    contract_file_path,
    contract_id,
    contract_number,
    contract_type,
    created_at,
    is_active,
    is_terminated,
  } = row;

  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => setOpenComment(false);
  const handleTooltipOpen = () => setOpenComment(true);

  const renderClientName = (client) => {
    if (client?.client_type === '0') {
      return `${client?.client_surname} ${client?.client_name || ''} ${
        client?.client_fathername || ''
      }`;
    }
    if (client?.client_type === '1') {
      return `${client?.business_name}. Директор: ${
        client?.business_director_name || 'Не заполнен'
      }`;
    }
    return '';
  };

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();

  const isDeleted = is_active === '0';
  const isTerminated = is_terminated === '1';

  const handleToggleSms = async (checked, contractId) => {
    const payload = {
      contract_id: contractId,
      send_an_sms: checked ? 1 : 0,
    };
    const token = sessionStorage.getItem('accessToken');

    try {
      const response = await fetch(`${CUSTOM_BASE_URL}/api/v1/contract/updatesms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update SMS setting');
      }
    } catch (error) {
      console.error('Failed to update SMS setting:', error);
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {['1', '2', '3'].includes(user?.role) ? (
            <Typography sx={isDeleted || isTerminated ? { color: 'text.disabled' } : {}}>
              {contract_number}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={isDeleted || isTerminated ? { color: 'text.disabled' } : {}}
            >
              {contract_number}
            </Typography>
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Link
            component={RouterLink}
            href={paths.dashboard.clients.details(row?.client_id)}
            sx={isDeleted || isTerminated ? { color: 'text.disabled' } : {}}
          >
            {renderClientName(row)}
          </Link>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={getStatusColor(isDeleted, isTerminated, contract_status)}
            sx={isDeleted || isTerminated ? { color: 'text.disabled' } : {}}
          >
            {getStatusLabel(isDeleted, isTerminated, contract_status)}
          </Label>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={getContractTypeColor(contract_type)}>
            {getContractTypeLabel(contract_type)}
          </Label>
        </TableCell>

        <TableCell>
          <IconButton onClick={onPreviewDocument} disabled={isDeleted || isTerminated}>
            <Iconify icon="material-symbols:contract-outline" />
          </IconButton>
        </TableCell>

        <TableCell>
          <Tooltip
            PopperProps={{ disablePortal: true }}
            onClose={handleTooltipClose}
            open={openComment}
            title={comments || 'Нет комментариев'}
          >
            <Iconify color="orange" icon="ic:baseline-comment" onClick={handleTooltipOpen} />
          </Tooltip>
        </TableCell>

        <TableCell>
          <RenderCellCreatedAt params={{ row: { createdAt: created_at } }} />
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Детали" placement="top" arrow>
            <IconButton
              disabled={isDeleted}
              color={quickEdit.value ? 'inherit' : 'default'}
              component={RouterLink}
              href={paths.dashboard.contracts.details(contract_id)}
            >
              <Iconify icon="lets-icons:view" />
            </IconButton>
          </Tooltip>

          {['1', '2'].includes(user?.role) && (
            <IconButton
              disabled={isDeleted || isTerminated}
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}

          <Switch
            disabled={isDeleted || contract_status !== '2' || is_terminated === 1}
            defaultChecked={send_an_sms === '1' && !isDeleted && !isTerminated}
            onChange={(event) => handleToggleSms(event.target.checked, contract_id)}
          />
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      {!isDeleted && !isTerminated && (
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 140 }}
        >
          {['1', '2'].includes(user?.role) && (
            <>
              <MenuItem
                onClick={() => {
                  onDeleteRow(contract_id);
                  popover.onClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
                Удалить
              </MenuItem>

              <MenuItem
                onClick={() => {
                  onTerminateRow(contract_id);
                  popover.onClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="mdi:close-circle-outline" />
                Расторгнуть
              </MenuItem>

              <MenuItem component={RouterLink} href={paths.dashboard.contracts.edit(contract_id)}>
                <Iconify icon="solar:pen-bold" />
                Изменить
              </MenuItem>
            </>
          )}
        </CustomPopover>
      )}
    </>
  );
}

ContractTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onTerminateRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
