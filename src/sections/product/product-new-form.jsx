import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGetMeasures } from 'src/api/materials';

import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ProductNewForm({ open, onClose, onCreate, onUpdate, currentProduct }) {
  const { measures } = useGetMeasures();

  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    material_name: Yup.string().required('Поле обязательное'),
    measure_unit_id: Yup.object().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      material_name: currentProduct?.material_name || '',
      measure_unit_id: currentProduct?.unit_id
        ? {
            id: currentProduct.unit_id,
            unit_name: currentProduct.unit_name,
          }
        : {},
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentProduct) {
        onCreate(
          {
            material_name: data.material_name,
            measure_unit_id: data.measure_unit_id.id,
          },
          () => {
            enqueueSnackbar('Материал добавлен');
            handleClose();
          }
        );
      } else {
        onUpdate(
          {
            material_id: currentProduct.material_id,
            material_name: currentProduct.material_name,
            new_material_name: data.material_name,
            measure_unit_id: data.measure_unit_id.id,
          },
          () => {
            enqueueSnackbar('Материал обновлен');
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

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentProduct ? 'Редактировать материал' : 'Новый материал'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: '2fr 1fr',
              }}
              pt={2}
            >
              <RHFTextField name="material_name" label="Название продукта" />
              <RHFAutocomplete
                name="measure_unit_id"
                type="measureunit"
                label="Единицы измерения"
                placeholder="Выберите единицу измерения"
                options={measures}
                getOptionLabel={(option) => option.unit_name || ''}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentProduct ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ProductNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  currentProduct: PropTypes.object,
  open: PropTypes.bool,
};
