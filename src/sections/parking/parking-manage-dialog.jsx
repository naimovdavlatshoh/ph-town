import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetParkingBlocks } from 'src/api/parking';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import EmptyContent from 'src/components/empty-content/empty-content';

import ParkingFloorsPanel from './parking-floors-panel';
import ParkingBlockNewEditForm from './parking-block-new-edit-form';

// ----------------------------------------------------------------------

export default function ParkingManageDialog({ projectId, projectName, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const { blocks, blocksLoading, blocksEmpty, create, update, remove } =
    useGetParkingBlocks(projectId);

  const newBlock = useBoolean();
  const [editBlock, setEditBlock] = useState(null);
  const [deleteBlock, setDeleteBlock] = useState(null);

  const onDelete = () => {
    remove(deleteBlock.parking_block_id, () => {
      enqueueSnackbar('Блок парковки удалён');
      setDeleteBlock(null);
    });
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <span>Парковка — {projectName}</span>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={newBlock.onTrue}
          >
            Новый блок
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 320 }}>
        {blocksLoading && (
          <Typography variant="body2" color="text.disabled">
            Загрузка...
          </Typography>
        )}
        {blocksEmpty && <EmptyContent title="Блоков парковки нет" sx={{ py: 6 }} />}

        {blocks.map((block) => (
          <Accordion
            key={block.parking_block_id}
            disableGutters
            TransitionProps={{ unmountOnExit: true }}
            sx={{ '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', pr: 1 }}
              >
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography variant="subtitle1">{block.block_name}</Typography>
                  <Label color="info">{block.spots_count ?? 0} мест</Label>
                </Stack>
                <Stack direction="row" onClick={(e) => e.stopPropagation()}>
                  <IconButton size="small" onClick={() => setEditBlock(block)}>
                    <Iconify width={18} icon="basil:edit-outline" color="orange" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteBlock(block)}>
                    <Iconify width={18} icon="majesticons:delete-bin-line" color="red" />
                  </IconButton>
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <ParkingFloorsPanel blockId={block.parking_block_id} />
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <ParkingBlockNewEditForm
        projectId={projectId}
        open={newBlock.value}
        onClose={newBlock.onFalse}
        onCreate={create}
      />
      {editBlock && (
        <ParkingBlockNewEditForm
          projectId={projectId}
          currentBlock={editBlock}
          open={!!editBlock}
          onClose={() => setEditBlock(null)}
          onUpdate={update}
        />
      )}
      <ConfirmDialog
        open={!!deleteBlock}
        onClose={() => setDeleteBlock(null)}
        title="Удаление блока парковки"
        content="Удалить блок? Внутри не должно быть этажей."
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </Dialog>
  );
}

ParkingManageDialog.propTypes = {
  projectId: PropTypes.string,
  projectName: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
