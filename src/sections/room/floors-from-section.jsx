import * as React from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Stack, Button, Tooltip, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetFloors } from 'src/api/floor';
import { useAuthContext } from 'src/auth/hooks';
import { useGetApartments } from 'src/api/apartment';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import EmptyContent from 'src/components/empty-content/empty-content';

import RoomNewEditForm from './room-new-edit-form';
import RoomTableByFloor from './room-table-by-floor';
import FloorNewEditForm from '../floor/floor-new-edit-form';
import FloorBasementNewEditForm from '../floor/floor-basement-new-edit-form';

export default function FloorsFromSection({ entracneId, blockId, projectId }) {
  const {
    floors,
    create: createFloor,
    update: updateFloor,
    floorsEmpty,
    floorsLoading,
    remove,
  } = useGetFloors(entracneId);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedFloorId, setSelectedFloorId] = useState();
  const [selectedFloor, setSelectedFloor] = useState();
  const { user } = useAuthContext();

  const { create: createApartment } = useGetApartments(selectedFloorId, false);

  const newRoom = useBoolean();

  const newFloor = useBoolean();
  const editFloor = useBoolean();

  const newBasement = useBoolean();

  const confirmDelete = useBoolean();

  useEffect(
    () => () => {
      setSelectedFloorId(null);
      setSelectedFloor(null);
    },
    []
  );

  const handleConfirmDeleteRow = useCallback(
    (id) => {
      setSelectedFloorId(id);
      // const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Функционал в разработке...', { variant: 'info' });
    },
    [enqueueSnackbar]
  );

  const onDelete = () => {
    remove(selectedFloorId, () => {
      enqueueSnackbar('Этаж успешно удален!');
      confirmDelete.onFalse();
    });
  };

  return (
    <>
      <div>
        {['1', '2'].includes(user?.role) && (
          <Button
            onClick={newFloor.onTrue}
            sx={{ alignSelf: 'center', mb: 1 }}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Верхний этаж
          </Button>
        )}
        {floors?.map((floor) => (
          <Accordion expanded key={floor?.floor_id} sx={{ border: '1px solid rgba(0,0,0,.1)' }}>
            <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
              <Stack
                width="100%"
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography>
                  {floor?.floor_number === '-1' ? 'Подвал' : `${floor?.floor_number} - Этаж`}
                </Typography>
                {['1', '2'].includes(user?.role) && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFloorId(floor?.floor_id);
                        newRoom.onTrue();
                      }}
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                    >
                      Добавить помещение
                    </Button>
                    <Tooltip title="Редактировать этаж" placement="top" arrow>
                      <IconButton
                        color="inherit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFloor(floor);
                          editFloor.onTrue();
                        }}
                      >
                        <Iconify color="#ffb017" icon="solar:pen-bold" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить этаж" placement="top" arrow>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFloorId(floor?.floor_id);
                          confirmDelete.onTrue();
                        }}
                      >
                        <Iconify color="red" icon="majesticons:delete-bin-line" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <RoomTableByFloor floorId={floor?.floor_id} projectId={projectId} />
            </AccordionDetails>
          </Accordion>
        ))}
        {floorsLoading && <LoadingScreen />}

        {floorsEmpty && <EmptyContent title="Нет этажей" />}
        {['1', '2'].includes(user?.role) && (
          <Button
            onClick={newBasement.onTrue}
            sx={{ alignSelf: 'center', mt: 1 }}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Подвал
          </Button>
        )}
      </div>

      <RoomNewEditForm
        projectId={projectId}
        floorId={selectedFloorId}
        onCreate={createApartment}
        open={newRoom.value}
        onClose={() => {
          setSelectedFloorId(null);
          newRoom.onFalse();
        }}
      />

      <FloorNewEditForm
        projectId={projectId}
        blockId={blockId}
        entranceId={entracneId}
        open={newFloor.value}
        onClose={newFloor.onFalse}
        onCreate={createFloor}
      />

      {editFloor.value && (
        <FloorNewEditForm
          projectId={projectId}
          blockId={blockId}
          entranceId={entracneId}
          open={editFloor.value}
          onClose={editFloor.onFalse}
          onUpdate={updateFloor}
          floorData={selectedFloor}
        />
      )}

      <FloorBasementNewEditForm
        projectId={projectId}
        entranceId={entracneId}
        onCreate={createFloor}
        open={newBasement.value}
        onClose={newBasement.onFalse}
      />

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content="Вы уверены, что хотите удалить этаж?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </>
  );
}

FloorsFromSection.propTypes = {
  entracneId: PropTypes.string,
  projectId: PropTypes.string,
  blockId: PropTypes.string,
};
