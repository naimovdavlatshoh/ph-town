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
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';

// ----------------------------------------------------------------------

export default function BlockNewEditForm({
  projectId,
  open,
  onClose,
  onCreate,
  onUpdate,
  currentBlock,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const BlockObjectSchema = Yup.object().shape({
    block_name: Yup.string().required('Поле обязательное'),
    is_basement: Yup.bool().required('Поле обязательное'),
    max_entrances: Yup.string().required('Поле обязательное'),
    max_floors: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      block_name: currentBlock?.block_name || '',
      is_basement: currentBlock?.is_basement || false,
      max_entrances: currentBlock?.max_entrances || '',
      max_floors: currentBlock?.max_floors || '',
    }),
    [currentBlock]
  );

  const methods = useForm({
    resolver: yupResolver(BlockObjectSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentBlock) {
        onCreate({ ...data, project_id: projectId }, () => {
          enqueueSnackbar('Блок создан');
          handleClose();
        });
      } else {
        onUpdate(
          {
            block_id: currentBlock?.block_id,
            project_id: currentBlock?.project_id,
            block_name: data?.block_name,
            max_entrances: data?.max_entrances,
            max_floors: data?.max_floors,
          },
          () => {
            enqueueSnackbar('Блок обновлен');
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
        <DialogTitle>{currentBlock ? 'Редактирование блока' : 'Новый блок'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <RHFTextField name="block_name" label="Название блока" sx={{ mt: 2 }} />
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 2fr)',
              }}
            >
              <RHFCurrencyField
                name="max_entrances"
                label="Максимальное количество подъездов"
                placeholder="0"
                decimalScale={0}
                thousandSeparator={false}
                InputLabelProps={{ shrink: true }}
              />
              <RHFCurrencyField
                name="max_floors"
                label="Максимальное количество этажей"
                placeholder="0"
                decimalScale={0}
                thousandSeparator={false}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
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

BlockNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  currentBlock: PropTypes.object,
  projectId: PropTypes.string,
};
