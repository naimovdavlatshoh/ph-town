import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
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

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

import { useGetContragentCategories, useSearchContragentCategories } from 'src/api/contragents';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const USER_ROLE = [
  {
    role: 2,
    label: 'Админ',
  },
  {
    role: 3,
    label: 'Оператор',
  },
];

export default function CategoryNewForm({ open, onClose, onCreate, onUpdate, currentCategory }) {
  const [categoryTerm, setCategoryTerm] = useState('');
  const [categoryTermHelper, setCategoryTermHelper] = useState('');
  const debouncedQuery = useDebounce(categoryTerm, 3);

  const { categories, categoriesLoading } = useGetContragentCategories();
  const { searchResults, searchLoading } = useSearchContragentCategories(debouncedQuery);

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const NewCategorySchema = Yup.object().shape({
    category_name: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      category_name: currentCategory?.category_name || '',
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(NewCategorySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentCategory) {
        onCreate(data, () => {
          enqueueSnackbar('Категория создана');
          handleClose();
        });
      } else {
        onUpdate(
          {
            ...data,
            category_id: currentCategory?.category_id,
          },
          () => {
            enqueueSnackbar('Категория обновлена');
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
        <DialogTitle>{currentCategory ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>

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
              <RHFTextField name="category_name" label="Название категории" />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentCategory ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

CategoryNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  currentCategory: PropTypes.object,
  open: PropTypes.bool,
};
