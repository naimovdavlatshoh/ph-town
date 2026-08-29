import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ParkingBlockNewEditForm({
  projectId,
  open,
  onClose,
  onCreate,
  onUpdate,
  currentBlock,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    block_name: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({ block_name: currentBlock?.block_name || '' }),
    [currentBlock]
  );

  const methods = useForm({ resolver: yupResolver(Schema), defaultValues });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentBlock) {
        await onUpdate(
          {
            parking_block_id: currentBlock.parking_block_id,
            project_id: currentBlock.project_id,
            block_name: data.block_name,
          },
          () => {
            enqueueSnackbar('Блок парковки обновлён');
            handleClose();
          }
        );
      } else {
        await onCreate({ project_id: projectId, block_name: data.block_name }, () => {
          enqueueSnackbar('Блок парковки создан');
          handleClose();
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          {currentBlock ? 'Редактирование блока парковки' : 'Новый блок парковки'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField name="block_name" label="Название блока" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentBlock ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ParkingBlockNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  currentBlock: PropTypes.object,
  projectId: PropTypes.string,
};
