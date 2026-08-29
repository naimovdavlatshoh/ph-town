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

export default function ParkingFloorNewEditForm({
  blockId,
  open,
  onClose,
  onCreate,
  onUpdate,
  currentFloor,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    floor_number: Yup.number()
      .typeError('Введите целое число')
      .integer('Только целое число')
      .required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({ floor_number: currentFloor?.floor_number ?? '' }),
    [currentFloor]
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
      if (currentFloor) {
        await onUpdate(
          {
            parking_floor_id: currentFloor.parking_floor_id,
            parking_block_id: currentFloor.parking_block_id,
            floor_number: data.floor_number,
          },
          () => {
            enqueueSnackbar('Этаж обновлён');
            handleClose();
          }
        );
      } else {
        await onCreate({ parking_block_id: blockId, floor_number: data.floor_number }, () => {
          enqueueSnackbar('Этаж добавлен');
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
        <DialogTitle>{currentFloor ? 'Редактирование этажа' : 'Новый этаж'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField
              name="floor_number"
              label="Номер этажа"
              type="number"
              helperText="Целое число. Отрицательное — для подвала (например, -1)"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentFloor ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ParkingFloorNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  currentFloor: PropTypes.object,
  blockId: PropTypes.string,
};
