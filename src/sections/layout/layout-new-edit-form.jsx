import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Divider, MenuItem } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios, { endpoints } from 'src/utils/axios';

import FormProvider, { RHFSelect, RHFUpload, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function LayoutNewEditForm({
  projectId,
  open,
  onClose,
  onCreate,
  onUpdate,
  currentLayout,
}) {
  const [layoutId, setLayoutId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => () => setLayoutId(null), []);

  const NewEditLayoutSchema = Yup.object().shape({
    layout_image: Yup.string().required('Поле обязательное'),
    layout_name: Yup.string().required('Поле обязательное'),
    layout_type: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      layout_image: currentLayout?.webp_file_path || '',
      layout_name: currentLayout?.layout_name || '',
      layout_type: currentLayout?.layout_type || '',
    }),
    [currentLayout]
  );

  const methods = useForm({
    resolver: yupResolver(NewEditLayoutSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
    setValue,
  } = methods;

  const values = methods.watch();

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const formData = new FormData();
        formData.append('layout_image', acceptedFiles[0]);

        const { data } = await axios.post(endpoints.layout.upload, formData, {
          headers: {
            'Content-Type': 'application/form-data',
          },
        });

        setLayoutId(data?.layout_id);

        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );

        methods.setValue('layout_image', newFiles[0], {
          shouldValidate: true,
        });
      } catch (error) {
        methods.setError('layout_image', {
          type: 'custom',
          message: error?.message || 'Error',
        });
      }
    },
    [methods]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('layout_image', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('layout_image', []);
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentLayout) {
        onCreate(
          {
            project_id: projectId,
            layout_id: layoutId,
            layout_name: data?.layout_name,
            layout_type: data?.layout_type,
          },
          () => {
            enqueueSnackbar('Планировка добавлена');
            handleClose();
          }
        );
      } else {
        onUpdate({
          project_id: data?.project_id,
          layout_id: data?.layout_id,
          layout_name: data?.layout_name,
          layout_type: data?.project_name,
        });
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
        <DialogTitle>
          {currentLayout ? 'Редактирование планировик' : 'Новая планировка'}
        </DialogTitle>

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
              <RHFTextField name="layout_name" label="Название планироки" />
              <RHFSelect name="layout_type" label="Тип планировки">
                {' '}
                <MenuItem value="">Не выбран</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {[
                  { label: 'Планировка квартиры', value: '1' },
                  { label: 'Планировка этажа', value: '0' },
                ].map((option) => (
                  <MenuItem key={option?.value} value={option?.value}>
                    {option?.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFUpload
                title="Загрузите планировку"
                thumbnail
                name="layout_image"
                maxSize={15728640.01}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={() => console.info('ON UPLOAD')}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentLayout ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

LayoutNewEditForm.propTypes = {
  onClose: PropTypes.func,
  projectId: PropTypes.string.isRequired,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  currentLayout: PropTypes.object,
};
