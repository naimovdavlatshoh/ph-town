import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
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

const getStatusConfig = (isDeleted, isTerminated, status) => {
  if (isDeleted) return { color: 'default', label: 'Удален', icon: 'solar:trash-bin-trash-bold' };
  if (isTerminated) return { color: 'error', label: 'Расторгнут', icon: 'mdi:close-circle-outline' };
  if (status === '1') return { color: 'warning', label: 'В процессе', icon: 'solar:clock-circle-bold' };
  if (status === '2') return { color: 'success', label: 'Подтвержден', icon: 'solar:check-circle-bold' };
  return { color: 'default', label: 'Не определен', icon: 'solar:question-circle-bold' };
};

const getContractTypeConfig = (type) => {
  if (type === '1') return { color: 'info', label: 'Рассрочка', icon: 'solar:calendar-bold' };
  if (type === '0') return { color: 'success', label: 'Наличка', icon: 'solar:wad-of-money-bold' };
  return { color: 'default', label: 'Не определен', icon: 'solar:question-circle-bold' };
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

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const { user } = useAuthContext();

  const isDeleted = is_active === '0';
  const isTerminated = is_terminated === '1';
  const isInactive = isDeleted || isTerminated;

  const statusConfig = getStatusConfig(isDeleted, isTerminated, contract_status);
  const typeConfig = getContractTypeConfig(contract_type);

  const isBusiness = row?.client_type === '1';

  const renderPrimaryName = () => {
    if (row?.client_type === '0') {
      return `${row?.client_surname || ''} ${row?.client_name || ''} ${
        row?.client_fathername || ''
      }`.trim();
    }
    if (isBusiness) {
      return row?.business_name || 'Без названия';
    }
    return '—';
  };

  const renderSecondaryName = () => {
    if (isBusiness) {
      return `Директор: ${row?.business_director_name || 'Не заполнен'}`;
    }
    return 'Физическое лицо';
  };

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

  const hasComment = Boolean(comments);

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          ...(isInactive && {
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }),
        }}
      >
        {/* Контракт */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography
            variant="subtitle2"
            sx={{ color: isInactive ? 'text.disabled' : 'text.primary' }}
          >
            {contract_number}
          </Typography>
        </TableCell>

        {/* Клиент */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack spacing={0.25}>
            <Link
              component={RouterLink}
              href={paths.dashboard.clients.details(row?.client_id)}
              color="inherit"
              sx={{
                typography: 'subtitle2',
                cursor: 'pointer',
                color: isInactive ? 'text.disabled' : 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {renderPrimaryName()}
            </Link>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {renderSecondaryName()}
            </Typography>
          </Stack>
        </TableCell>

        {/* Состояние */}
        <TableCell>
          <Label
            variant="soft"
            color={statusConfig.color}
            startIcon={<Iconify icon={statusConfig.icon} />}
          >
            {statusConfig.label}
          </Label>
        </TableCell>

        {/* Тип */}
        <TableCell>
          <Label
            variant="soft"
            color={typeConfig.color}
            startIcon={<Iconify icon={typeConfig.icon} />}
          >
            {typeConfig.label}
          </Label>
        </TableCell>

        {/* Файл */}
        <TableCell>
          <Tooltip title="Просмотр документа" placement="top" arrow>
            <Box component="span">
              <IconButton
                onClick={onPreviewDocument}
                disabled={isInactive}
                sx={{
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                  },
                }}
              >
                <Iconify icon="material-symbols:contract-outline" />
              </IconButton>
            </Box>
          </Tooltip>
        </TableCell>

        {/* Комментарий */}
        <TableCell align="center">
          <Tooltip
            PopperProps={{ disablePortal: true }}
            onClose={handleTooltipClose}
            open={openComment}
            title={comments || 'Нет комментариев'}
            arrow
          >
            <IconButton
              size="small"
              onMouseEnter={handleTooltipOpen}
              onMouseLeave={handleTooltipClose}
              onClick={handleTooltipOpen}
            >
              <Iconify
                icon={hasComment ? 'solar:chat-round-dots-bold' : 'solar:chat-round-line-duotone'}
                sx={{ color: hasComment ? 'warning.main' : 'text.disabled' }}
              />
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Создано */}
        <TableCell>
          <RenderCellCreatedAt params={{ row: { createdAt: created_at } }} />
        </TableCell>

        {/* Действия */}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
            <Tooltip title="Детали" placement="top" arrow>
              <Box component="span">
                <IconButton
                  disabled={isDeleted}
                  color={quickEdit.value ? 'inherit' : 'default'}
                  component={RouterLink}
                  href={paths.dashboard.contracts.details(contract_id)}
                >
                  <Iconify icon="lets-icons:view" />
                </IconButton>
              </Box>
            </Tooltip>

            {['1', '2'].includes(user?.role) && (
              <IconButton
                disabled={isInactive}
                color={popover.open ? 'inherit' : 'default'}
                onClick={popover.onOpen}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            )}

            <Tooltip title="Отправка SMS" placement="top" arrow>
              <Box component="span">
                <Switch
                  size="small"
                  disabled={isDeleted || contract_status !== '2' || is_terminated === 1}
                  defaultChecked={send_an_sms === '1' && !isInactive}
                  onChange={(event) => handleToggleSms(event.target.checked, contract_id)}
                />
              </Box>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      {!isInactive && (
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