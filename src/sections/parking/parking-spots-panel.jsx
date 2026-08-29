import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetParkingSpots } from 'src/api/parking';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import ParkingSpotNewEditForm from './parking-spot-new-edit-form';

// ----------------------------------------------------------------------

function formatMoney(value) {
  if (!value) return '';
  return Number(value).toLocaleString('ru-RU');
}

export default function ParkingSpotsPanel({ floorId }) {
  const { enqueueSnackbar } = useSnackbar();
  const { spots, spotsLoading, spotsEmpty, create, update, remove } = useGetParkingSpots(floorId);

  const newSpot = useBoolean();
  const [editSpot, setEditSpot] = useState(null);
  const [deleteSpot, setDeleteSpot] = useState(null);

  const onDelete = () => {
    remove(deleteSpot.parking_spot_id, () => {
      enqueueSnackbar('Место удалено');
      setDeleteSpot(null);
    });
  };

  return (
    <Box sx={{ pl: 2, py: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Места {spots.length ? `(${spots.length})` : ''}
        </Typography>
        <Button
          size="small"
          variant="soft"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" width={14} />}
          onClick={newSpot.onTrue}
        >
          Место
        </Button>
      </Stack>

      {spotsLoading && (
        <Typography variant="caption" color="text.disabled">
          Загрузка...
        </Typography>
      )}
      {spotsEmpty && (
        <Typography variant="caption" color="text.disabled">
          Мест нет
        </Typography>
      )}

      <Stack spacing={0.5}>
        {spots.map((spot) => (
          <Stack
            key={spot.parking_spot_id}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="subtitle2">{spot.spot_number}</Typography>
              <Label color={Number(spot.stock_status) === 2 ? 'error' : 'success'}>
                {spot.stock_status_text || (Number(spot.stock_status) === 2 ? 'продано' : 'свободно')}
              </Label>
              <Typography variant="caption" color="text.secondary">
                {formatMoney(spot.price_usd)} $
                {spot.price_uzs ? ` · ${formatMoney(spot.price_uzs)} сум` : ''}
              </Typography>
            </Stack>

            <Stack direction="row">
              <IconButton size="small" onClick={() => setEditSpot(spot)}>
                <Iconify width={16} icon="basil:edit-outline" color="orange" />
              </IconButton>
              <IconButton size="small" onClick={() => setDeleteSpot(spot)}>
                <Iconify width={16} icon="majesticons:delete-bin-line" color="red" />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ mt: 1.5, borderStyle: 'dashed' }} />

      <ParkingSpotNewEditForm
        floorId={floorId}
        open={newSpot.value}
        onClose={newSpot.onFalse}
        onCreate={create}
      />
      {editSpot && (
        <ParkingSpotNewEditForm
          floorId={floorId}
          currentSpot={editSpot}
          open={!!editSpot}
          onClose={() => setEditSpot(null)}
          onUpdate={update}
        />
      )}
      <ConfirmDialog
        open={!!deleteSpot}
        onClose={() => setDeleteSpot(null)}
        title="Удаление места"
        content={`Удалить место «${deleteSpot?.spot_number}»?`}
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </Box>
  );
}

ParkingSpotsPanel.propTypes = {
  floorId: PropTypes.string,
};
