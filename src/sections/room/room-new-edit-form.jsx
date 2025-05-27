import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { memo, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, InputAdornment } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios, { endpoints } from 'src/utils/axios';

import { useGetLayoutsByType } from 'src/api/layout';
import { useGetApartmentOptions } from 'src/api/apartment';

import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFAutocomplete,
  RHFMultiCheckbox,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

function RoomNewEditForm({ projectId, floorId, open, onClose, currentRoom, onCreate, onUpdate }) {
  const { layouts } = useGetLayoutsByType(projectId, 1);
  const { apartmentOptions } = useGetApartmentOptions();

  const { enqueueSnackbar } = useSnackbar();

  const NewEditRoomSchema = Yup.object().shape({
    apartment_name: Yup.string().required('Поле обязательное'),
    apartment_area: Yup.string().required('Поле обязательное'),
    price_square_meter: Yup.string().required('Поле обязательное'),
    rooms_number: Yup.string().required('Поле обязательное'),
    layout_id: Yup.object().required('Поле обязательное'),
    penthouse_status: Yup.boolean().required('Выбор обязателен'),
    vr_url: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      vr_url: currentRoom?.vr_url || '',
      penthouse_status: currentRoom?.penthouse_status
        ? currentRoom?.penthouse_status === '1'
        : false,
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
      apartment_option: currentRoom
        ? currentRoom?.apartment_option?.map((opt) => ({
            label: opt?.option_name,
            value: opt?.option_id,
            optionValueId: opt?.option_value_id,
          }))
        : [],
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
      if (currentRoom) {
        onUpdate(
          {
            floor_id: floorId,
            apartment_name: data?.apartment_name,
            price_square_meter: data?.price_square_meter.replace(/,/g, ''),
            apartment_area: parseFloat(data?.apartment_area.replace(/,/g, '')),
            rooms_number: data?.rooms_number,
            layout_id: data?.layout_id?.layout_id,
            apartment_id: currentRoom?.apartment_id,
            penthouse_status: data?.penthouse_status ? '1' : '0',
            vr_url: data?.vr_url || null,
          },
          () => {
            enqueueSnackbar('Помещение обновлено');
            handleClose();
          }
        );
      } else {
        onCreate(
          {
            floor_id: floorId,
            apartment_name: data?.apartment_name,
            price_square_meter: data?.price_square_meter?.replace(/,/g, ''),
            apartment_area: parseFloat(data?.apartment_area.replace(/,/g, '')),
            rooms_number: data?.rooms_number,
            layout_id: data?.layout_id?.layout_id,
            apartment_option: data?.apartment_option?.map((option) => ({
              option_id: option?.value,
            })),
            penthouse_status: data?.penthouse_status ? '1' : '0',
            vr_url: data?.vr_url || null,
          },
          () => {
            enqueueSnackbar('Помещение добавлено');
            handleClose();
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  // eslint-disable-next-line consistent-return
  const asyncAdd = async (item, prevList) => {
    const { data } = await axios.post(endpoints.apartment.apartmentoptionAdd, {
      apartment_id: currentRoom?.apartment_id,
      option_id: item?.value,
    });
    if (data?.message === 'Ok') {
      return [...prevList, item];
    }
  };

  // eslint-disable-next-line consistent-return
  const asyncDelete = async (item, prevList) => {
    const { data } = await axios.delete(endpoints.apartment.apartmentoptionDelete, {
      data: {
        option_value_id: item?.optionValueId,
      },
    });

    if (data?.message === 'Ok') {
      return prevList.filter((option) => option?.value !== item?.value);
    }
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
              {/* <RHFTextField
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
              /> */}
              <RHFCurrencyField
                name="apartment_area"
                label="Площадь"
                placeholder="0.00"
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
              {/* <RHFTextField
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
              /> */}
              <RHFCurrencyField
                name="price_square_meter"
                label="Цена за м²"
                placeholder="0.00"
                decimalScale={0}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        $
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <RHFCurrencyField
                name="rooms_number"
                label="Количество комнат"
                placeholder="0"
                decimalScale={0}
                thousandSeparator={false}
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
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <RHFTextField name="vr_url" label="Ссылка на VR 360" />
              </Grid>
              <Grid item xs={4}>
                <RHFSwitch name="penthouse_status" label="Пентхаус" />
              </Grid>
            </Grid>
            <RHFMultiCheckbox
              name="apartment_option"
              key={2}
              options={apartmentOptions?.map((option) => ({
                value: option?.option_id,
                label: option?.option_name,
              }))}
              mode={currentRoom ? 'update' : ''}
              asyncAdd={asyncAdd}
              asyncDelete={asyncDelete}
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

RoomNewEditForm.propTypes = {
  projectId: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  floorId: PropTypes.string,
  currentRoom: PropTypes.object,
};

export default memo(RoomNewEditForm);
