import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { InputAdornment } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGetLayoutsByType } from 'src/api/layout';

import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function RoomBasementNewEditForm({
  projectId,
  floorId,
  open,
  onClose,
  onCreate,
  currentRoom,
}) {
  const { layouts } = useGetLayoutsByType(projectId, 1);

  const NewEditRoomSchema = Yup.object().shape({
    apartment_name: Yup.string().required('Поле обязательное'),
    apartment_area: Yup.string().required('Поле обязательное'),
    price_square_meter: Yup.string().required('Поле обязательное'),
    rooms_number: Yup.string().required('Поле обязательное'),
    layout_id: Yup.object().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      apartment_name: currentRoom?.apartment_name || '',
      apartment_area: currentRoom?.apartment_area || '',
      price_square_meter: currentRoom?.price_square_meter || '',
      rooms_number: currentRoom?.rooms_number || '',
      layout_id: currentRoom?.layout_id
        ? {
            layout_id: currentRoom?.layout_id,
            layout_name: currentRoom?.layout_name,
            file_path: currentRoom?.layout_image,
          }
        : {},
    }),
    [currentRoom]
  );
  const methods = useForm({
    resolver: yupResolver(NewEditRoomSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      onCreate({
        floor_id: floorId,
        apartment_name: data?.apartment_name,
        price_square_meter: data?.price_square_meter,
        apartment_area: parseFloat(data?.apartment_area),
        rooms_number: data?.rooms_number,
        layout_id: data?.layout_id?.layout_id,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentRoom ? 'Редактирование помещения' : 'Новое помещение'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
              }}
              pt={2}
            >
              <RHFTextField name="apartment_name" label="Название(Номер) помещения" />
              <RHFTextField
                name="apartment_area"
                label="Площадь"
                placeholder="0.00"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        м²
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <RHFTextField
                name="price_square_meter"
                label="Цена за м²"
                placeholder="0.00"
                type="number"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        $
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <RHFTextField
                name="rooms_number"
                label="Количество комнат"
                placeholder="0"
                type="number"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <RHFAutocomplete
              name="layout_id"
              type="layout"
              label="Планировки"
              placeholder="Выбрать планировку"
              fullWidth
              options={layouts}
              getOptionLabel={(option) => option?.layout_name || ''}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentRoom ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

RoomBasementNewEditForm.propTypes = {
  projectId: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  open: PropTypes.bool,
  floorId: PropTypes.string,
  currentRoom: PropTypes.object,
};
