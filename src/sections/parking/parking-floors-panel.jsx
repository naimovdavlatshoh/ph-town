import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetParkingFloors } from 'src/api/parking';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import ParkingSpotsPanel from './parking-spots-panel';
import ParkingFloorNewEditForm from './parking-floor-new-edit-form';

// ----------------------------------------------------------------------

function floorLabel(floorNumber) {
  return Number(floorNumber) < 0 ? `Подвал ${floorNumber}` : `Этаж ${floorNumber}`;
}

export default function ParkingFloorsPanel({ blockId }) {
  const { enqueueSnackbar } = useSnackbar();
  const { floors, floorsLoading, floorsEmpty, create, update, remove } =
    useGetParkingFloors(blockId);

  const newFloor = useBoolean();
  const [editFloor, setEditFloor] = useState(null);
  const [deleteFloor, setDeleteFloor] = useState(null);

  const onDelete = () => {
    remove(deleteFloor.parking_floor_id, () => {
      enqueueSnackbar('Этаж удалён');
      setDeleteFloor(null);
    });
  };

  const sortedFloors = [...floors].sort(
    (a, b) => Number(b.floor_number) - Number(a.floor_number)
  );

  return (
    <Box sx={{ pl: 2, py: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Этажи {floors.length ? `(${floors.length})` : ''}
        </Typography>
        <Button
          size="small"
          variant="soft"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" width={14} />}
          onClick={newFloor.onTrue}
        >
          Этаж
        </Button>
      </Stack>

      {floorsLoading && (
        <Typography variant="caption" color="text.disabled">
          Загрузка...
        </Typography>
      )}
      {floorsEmpty && (
        <Typography variant="caption" color="text.disabled">
          Этажей нет
        </Typography>
      )}

      {sortedFloors.map((floor) => (
        <Accordion
          key={floor.parking_floor_id}
          disableGutters
          TransitionProps={{ unmountOnExit: true }}
          sx={{ '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 0.75 }}
        >
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: '100%', pr: 1 }}
            >
              <Typography variant="subtitle2">{floorLabel(floor.floor_number)}</Typography>
              <Stack direction="row" onClick={(e) => e.stopPropagation()}>
                <IconButton size="small" onClick={() => setEditFloor(floor)}>
                  <Iconify width={16} icon="basil:edit-outline" color="orange" />
                </IconButton>
                <IconButton size="small" onClick={() => setDeleteFloor(floor)}>
                  <Iconify width={16} icon="majesticons:delete-bin-line" color="red" />
                </IconButton>
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <ParkingSpotsPanel floorId={floor.parking_floor_id} />
          </AccordionDetails>
        </Accordion>
      ))}

      <ParkingFloorNewEditForm
        blockId={blockId}
        open={newFloor.value}
        onClose={newFloor.onFalse}
        onCreate={create}
      />
      {editFloor && (
        <ParkingFloorNewEditForm
          blockId={blockId}
          currentFloor={editFloor}
          open={!!editFloor}
          onClose={() => setEditFloor(null)}
          onUpdate={update}
        />
      )}
      <ConfirmDialog
        open={!!deleteFloor}
        onClose={() => setDeleteFloor(null)}
        title="Удаление этажа"
        content="Удалить этаж? Внутри не должно быть мест."
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </Box>
  );
}

ParkingFloorsPanel.propTypes = {
  blockId: PropTypes.string,
};
