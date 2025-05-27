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

import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ObjectNewEditForm({ open, onClose, onCreate, onUpdate, currentObject }) {
  const { enqueueSnackbar } = useSnackbar();

  const NeweditObjectSchema = Yup.object().shape({
    project_name: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      project_name: currentObject?.name || '',
    }),
    [currentObject?.name]
  );

  const methods = useForm({
    resolver: yupResolver(NeweditObjectSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentObject) {
        onCreate(data, () => {
          enqueueSnackbar('Объект создан');
          handleClose();
        });
      } else {
        onUpdate(
          {
            project_id: currentObject?.id,
            project_name: data.project_name,
          },
          () => {
            enqueueSnackbar('Объект обновлен');
            handleClose();
          }
        );
      }

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
        <DialogTitle>{currentObject ? 'Редактирование объекта' : 'Новый объект'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
              pt={2}
            >
              <RHFTextField name="project_name" label="Название объекта" />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentObject ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ObjectNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  currentObject: PropTypes.object,
};
