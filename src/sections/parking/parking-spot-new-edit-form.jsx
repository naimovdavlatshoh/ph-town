import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ParkingSpotNewEditForm({
  floorId,
  open,
  onClose,
  onCreate,
  onUpdate,
  currentSpot,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    spot_number: Yup.string().required('Поле обязательное'),
    price: Yup.string().required('Поле обязательное'),
    stock_status: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      spot_number: currentSpot?.spot_number || '',
      price: currentSpot?.price_usd ? Number(currentSpot.price_usd) : '',
      stock_status: String(currentSpot?.stock_status || 1),
    }),
    [currentSpot]
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
    const price = Number(String(data.price).replace(/[^\d.]/g, ''));
    const stockStatus = Number(data.stock_status);

    try {
      if (currentSpot) {
        await onUpdate(
          {
            parking_spot_id: currentSpot.parking_spot_id,
            parking_floor_id: currentSpot.parking_floor_id,
            spot_number: data.spot_number,
            price,
            stock_status: stockStatus,
          },
          () => {
            enqueueSnackbar('Место обновлено');
            handleClose();
          }
        );
      } else {
        await onCreate(
          {
            parking_floor_id: floorId,
            spot_number: data.spot_number,
            price,
            stock_status: stockStatus,
          },
          () => {
            enqueueSnackbar('Место добавлено');
            handleClose();
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentSpot ? 'Редактирование места' : 'Новое место'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField name="spot_number" label="Номер места" placeholder="P-101" />

            <RHFCurrencyField
              name="price"
              label="Цена (USD)"
              placeholder="0"
              decimalScale={2}
              endAdornmentLabel="$"
              InputLabelProps={{ shrink: true }}
            />

            <RHFSelect name="stock_status" label="Статус" InputLabelProps={{ shrink: true }}>
              <MenuItem value="1">Свободно</MenuItem>
              <MenuItem value="2">Продано</MenuItem>
            </RHFSelect>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentSpot ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ParkingSpotNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  currentSpot: PropTypes.object,
  floorId: PropTypes.string,
};
