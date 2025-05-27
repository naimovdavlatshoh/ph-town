import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import { Stack } from '@mui/system';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGetMeasures } from 'src/api/materials';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ProductEditForm({ currentProduct, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const { measures } = useGetMeasures();

  const EditProductSchema = Yup.object().shape({
    material_name: Yup.string().required('Name is required'),
    measure_unit_id: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address'),
  });

  const defaultValues = useMemo(
    () => ({
      material_name: currentProduct?.material_name || '',
      measure_unit_id: currentProduct?.unit_name || '',
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: yupResolver(EditProductSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Редактирования продукта</DialogTitle>

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
                getOptionLabel={(option) => option.unit_name}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Обновить
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ProductEditForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentProduct: PropTypes.object,
};
