import * as Yup from 'yup';
import PropTypes from 'prop-types';
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

import { countries } from 'src/assets/data';

import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ClientNewForm({ open, onClose, onCreate }) {
  const NewProductSchema = Yup.object().shape({
    material_name: Yup.string().required('Поле обязательное'),
    measure_unit_id: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = {
    material_name: '',
    measure_unit_id: '',
  };

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
      onCreate({
        name: data.name,
        phoneNumber: data.phoneNumber,
        fullAddress: `${data.address}, ${data.city}, ${data.state}, ${data.country}, ${data.zipCode}`,
        addressType: data.addressType,
        primary: data.primary,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Новый продукт</DialogTitle>

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
                type="country"
                label="Единицы измерения"
                placeholder="Выберите единицу измерения"
                options={countries.map((option) => option.label)}
                getOptionLabel={(option) => option}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Создать
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ClientNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  open: PropTypes.bool,
};
