/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Link, Stack, Avatar, Typography, IconButton, ListItemText } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber, fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import ArrivalPayDialog from './arrival-pay-dialog';
import ArrivalInfoDialog from './arrival-info-dialog';
import { RenderCellStock, RenderCellCreatedAt } from '../checkerboard/client-table-row';

// ----------------------------------------------------------------------

export default function ArrivalTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onPreviewDocument,
  pay,
}) {
  const {
    invoice_number,
    arrival_id,
    material_id,
    material_name,
    amount,
    price,
    delivery_price,
    client_id,
    client_type,
    client_name,
    client_surname,
    business_name,
    business_director_name,
    added_user_id,
    firstname,
    lastname,
    created_at,
    short_name,
    is_paid,
    total_price,
    payment_history,
  } = row;

  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = () => {
    setOpenComment(true);
  };

  const confirm = useBoolean();
  const payConfirm = useBoolean();
  const infoDialog = useBoolean();
  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{invoice_number}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          <RenderCellCreatedAt
            params={{
              row: {
                createdAt: created_at,
              },
            }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{material_name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {fNumber(amount)} {short_name}
        </TableCell>
        <TableCell>{fCurrency(price)} UZS</TableCell>
        <TableCell sx={{ color: is_paid === '1' ? 'red' : is_paid === '2' ? 'green' : '' }}>
          <RenderCellStock
            params={{
              row: {
                inventoryType:
                  (is_paid === '1' && 'out of stock') || (is_paid === '2' && 'low stock') || '',
                // eslint-disable-next-line no-unsafe-optional-chaining
                available: payment_history?.reduce((prev, curr) => prev + +curr?.payment_amount, 0),
                quantity: +total_price,
              },
            }}
          />
        </TableCell>
        <TableCell>
          <Tooltip
            title={delivery_price === '0' ? 'Бесплатная доставка' : 'Платная доставка'}
            placement="top"
            arrow
          >
            {delivery_price === '0' ? (
              <Stack direction="row" gap={1}>
                <Iconify icon="iconamoon:delivery-free-duotone" />
                <Iconify icon="emojione:free-button" />
              </Stack>
            ) : (
              <Stack direction="row" gap={1}>
                <Iconify icon="iconamoon:delivery-fast-duotone" />
                <Typography variant="caption">{fCurrency(delivery_price)} UZS</Typography>
              </Stack>
            )}
          </Tooltip>
        </TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={
              (client_type === '0' && `${client_surname} ${client_name}`) ||
              (client_type === '1' && `${client_surname} - ${client_name}`) ||
              'Неопределен'
            }
            src="Клиент"
            sx={{ mr: 2 }}
          />

          <ListItemText
            primary={
              <Link
                component={RouterLink}
                href={row?.client_id ? paths.dashboard.clients.details(row?.client_id) : ''}
              >
                {(client_type === '0' && `${client_surname} ${client_name}`) ||
                  (client_type === '1' && `"${client_surname}" - ${client_name}`) ||
                  'Неопределен'}
              </Link>
            }
            secondary={
              (client_type === '0' && 'Физическое лицо') ||
              (client_type === '1' && 'Юридическое лицо') ||
              'Неизвестный тип'
            }
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              variant: 'caption',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${lastname} ${firstname}`}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row">
            {is_paid === '1' ? (
              <IconButton onClick={payConfirm.onTrue} sx={{ color: 'success.main' }}>
                <Iconify icon="fluent:payment-48-filled" />
              </IconButton>
            ) : (
              <IconButton onClick={infoDialog.onTrue} sx={{ color: 'info.main' }}>
                <Iconify icon="mdi:eye" />
              </IconButton>
            )}
            <IconButton onClick={confirm.onTrue} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Подтверждение удаления"
        content="Вы действительно хотите удалить приход?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(row.arrival_id, confirm.onFalse);
            }}
          >
            Удалить
          </Button>
        }
      />
      {payConfirm.value && (
        <ArrivalPayDialog
          open={payConfirm.value}
          onClose={payConfirm.onFalse}
          data={row}
          pay={pay}
        />
      )}

      {infoDialog.value && (
        <ArrivalInfoDialog
          open={infoDialog.value}
          onClose={infoDialog.onFalse}
          data={row}
          pay={pay}
        />
      )}
    </>
  );
}

ArrivalTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  pay: PropTypes.func,
};
