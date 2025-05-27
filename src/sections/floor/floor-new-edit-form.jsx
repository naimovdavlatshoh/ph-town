import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { memo, useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Divider, MenuItem, Typography } from '@mui/material';

import { useGetFloors } from 'src/api/floor';
import { useGetBlocks } from 'src/api/block';
import { useGetLayoutsByType } from 'src/api/layout';

import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, { RHFSelect, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

function FloorNewEditForm({
  entranceId,
  projectId,
  blockId,
  open,
  onClose,
  onCreate,
  onUpdate,
  floorData,
}) {
  const { layouts } = useGetLayoutsByType(projectId, 0);
  const { blocks } = useGetBlocks(projectId);
  const { floors } = useGetFloors(entranceId);

  const currentBlock = blocks?.find((block) => block.block_id === blockId);

  const { enqueueSnackbar } = useSnackbar();

  const NewEditFloorSchema = Yup.object().shape({
    floor_number: Yup.string().required('Поле обязательное'),
    apartments_number: Yup.string().required('Поле обязательное'),
    layout_id: Yup.object().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      floor_number: floorData?.floor_number || '',
      apartments_number: floorData?.apartments_number || '',
      layout_id: null,
    }),
    [floorData]
  );

  const methods = useForm({
    resolver: yupResolver(NewEditFloorSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (floorData) {
        onUpdate(
          {
            floor_id: floorData?.floor_id,
            layout_id: data?.layout_id?.layout_id,
          },
          () => {
            enqueueSnackbar('Этаж обновлен');
            handleClose();
          }
        );
      } else {
        onCreate(
          {
            entrance_id: entranceId,
            floor_number: data?.floor_number,
            floor_type: 1,
            apartments_number: data?.apartments_number,
            layout_id: data?.layout_id?.layout_id,
          },
          () => {
            enqueueSnackbar('Этаж добавлен');
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

  const floorsGenerate = useMemo(
    () =>
      currentBlock?.max_floors
        ? [...Array(Number(currentBlock?.max_floors))].map((_, index) => {
            if (floors?.some((fl) => fl.floor_number === (index + 1).toString())) {
              return {
                disabled: true,
                floor: index + 1,
              };
            }

            return {
              disabled: false,
              floor: index + 1,
            };
          })
        : [],
    [currentBlock?.max_floors, floors]
  );

  useEffect(() => {
    if (floorData?.layout_id && layouts?.length) {
      const foundLayout = layouts.find((l) => l?.layout_id === floorData?.layout_id);
      methods.setValue('layout_id', foundLayout);
    }
  }, [floorData, floorData?.layout_id, layouts, methods]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{floorData ? 'Редактирование этажа' : 'Новый этаж'}</DialogTitle>

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
              <RHFSelect
                name="floor_number"
                label="Номер этажа"
                InputLabelProps={{ shrink: true }}
                sx={{
                  maxWidth: { md: 160 },
                }}
              >
                <MenuItem disabled value="">
                  <Typography variant="caption">Не выбран</Typography>
                </MenuItem>
                <Divider />
                {floorsGenerate.map((el) => (
                  <MenuItem disabled={el.disabled} key={el.floor} value={el.floor}>
                    <Stack
                      width="100%"
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="caption"> {el.floor} - Этаж</Typography>
                      {el.disabled && <Typography variant="caption">Существует</Typography>}
                    </Stack>
                  </MenuItem>
                ))}
              </RHFSelect>

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
            {floorData ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

FloorNewEditForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  entranceId: PropTypes.string,
  projectId: PropTypes.string,
  blockId: PropTypes.string,
  floorData: PropTypes.object,
};

export default memo(FloorNewEditForm);
