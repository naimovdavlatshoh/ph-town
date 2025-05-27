import * as Yup from 'yup';
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

import { useGetLayoutsByType } from 'src/api/layout';

import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';

// ----------------------------------------------------------------------

export default function FloorBasementNewEditForm({
  entranceId,
  projectId,
  blockId,
  open,
  onClose,
  onCreate,
}) {
  const { layouts } = useGetLayoutsByType(projectId, 0);

  const { enqueueSnackbar } = useSnackbar();

  const NewEditFloorBasementSchema = Yup.object().shape({
    apartments_number: Yup.string().required('Поле обязательное'),
    layout_id: Yup.object().required('Поле обязательное'),
  });

  const defaultValues = {
    apartments_number: '',
    layout_id: null,
  };

  const methods = useForm({
    resolver: yupResolver(NewEditFloorBasementSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      onCreate(
        {
          entrance_id: entranceId,
          floor_number: -1,
          floor_type: '0',
          apartments_number: data?.apartments_number,
          layout_id: data?.layout_id?.layout_id,
        },
        () => {
          enqueueSnackbar('Подвал добавлен');
          handleClose();
        }
      );
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
        <DialogTitle>Добавление подвала</DialogTitle>

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
              <RHFCurrencyField
                name="apartments_number"
                label="Количество помещений"
                placeholder="0"
                decimalScale={0}
                thousandSeparator={false}
                InputLabelProps={{ shrink: true }}
              />

              <RHFAutocomplete
                name="layout_id"
                type="layout"
                label="Планировки"
                placeholder="Выбрать планировку"
                fullWidth
                options={layouts}
                getOptionLabel={(option) => option?.layout_name || ''}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
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

FloorBasementNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  open: PropTypes.bool,
  entranceId: PropTypes.string,
  projectId: PropTypes.string,
  blockId: PropTypes.string,
};
