import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import RoomImagesDialog from './room-imags-dialog';
import { RenderCellPrice } from '../product/product-table-row';

// ----------------------------------------------------------------------

export default function RoomTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleDeleteConfirm,
}) {
  const {
    apartment_id,
    apartment_area,
    apartment_name,
    created_at,
    layout_image,
    price_square_meter,
    uzs_full_price,
    rooms_number,
    stock_status,
    totalprice,
  } = row;

  const [selectedLayoutSrc, sestSelectedLayoutSrc] = useState();
  const [selectedId, setSelectedId] = useState();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const layerModal = useBoolean();

  const upload = useBoolean();

  const popover = usePopover();

  const { user } = useAuthContext();

  useEffect(
    () => () => {
      setSelectedId(null);
      sestSelectedLayoutSrc(null);
    },
    []
  );

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemText
            primary={apartment_name}
            secondary={`${apartment_area} м2`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{rooms_number}</TableCell>

        {['1', '2'].includes(user?.role) && (
          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <RenderCellPrice price={price_square_meter} /> $
          </TableCell>
        )}

        {['1', '2'].includes(user?.role) && (
          <TableCell sx={{ whiteSpace: 'nowrap' }}>
            {' '}
            <RenderCellPrice price={totalprice} /> $
          </TableCell>
        )}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {' '}
          <RenderCellPrice price={uzs_full_price} /> сум
        </TableCell>

        <TableCell>
          {/*
              0 - Свободна
              1 - Бронирована
              2 - Продана
            */}
          <Label
            variant="soft"
            color={
              (stock_status === '1' && 'success') ||
              (stock_status === '2' && 'warning') ||
              (stock_status === '3' && 'error') ||
              (stock_status === '4' && 'info') ||
              'default'
            }
          >
            {stock_status === '1' && 'Свободна'}
            {stock_status === '2' && 'Бронирована'}
            {stock_status === '3' && 'Продана'}
            {stock_status === '4' && 'Временно забронирована'}
          </Label>
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Изображения квартиры" placement="top" arrow>
            <IconButton
              color="primary"
              onClick={() => {
                setSelectedId(apartment_id);
                upload.onTrue();
              }}
            >
              <Iconify color="primary" icon="mdi:images" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={layout_image ? 'Посмотреть планировку' : 'Нет планировки'}
            placement="top"
            arrow
          >
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={
                layout_image
                  ? () => {
                      sestSelectedLayoutSrc(layout_image);
                      layerModal.onTrue();
                    }
                  : null
              }
            >
              <Iconify color="#02b9da" icon="mingcute:layout-11-fill" />
            </IconButton>
          </Tooltip>
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
              <Tooltip title="Удалить" placement="top" arrow>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    handleDeleteConfirm(row);
                  }}
                >
                  <Iconify color="#ff5631" icon="majesticons:delete-bin" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </TableCell>
      </TableRow>

      {/* <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} /> */}

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

      <Lightbox
        open={layerModal.value}
        close={() => {
          layerModal.onToggle();
          sestSelectedLayoutSrc(null);
        }}
        slides={[
          {
            src: selectedLayoutSrc,
            width: '100%',
            height: '100%',
          },
        ]}
      />

      {upload?.value && (
        <RoomImagesDialog
          roomId={selectedId}
          title="Изображения квартиры"
          open={upload.value}
          onClose={upload.onFalse}
        />
      )}
    </>
  );
}

RoomTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  handleDeleteConfirm: PropTypes.func,
};
