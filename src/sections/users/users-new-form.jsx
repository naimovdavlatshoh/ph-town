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
import { MenuItem, IconButton, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const USER_ROLE = [
  {
    role: 1,
    label: 'Админ',
  },
  {
    role: 2,
    label: 'Менеджер отдела продаж',
  },
  {
    role: 3,
    label: 'Оператор отдела продаж',
  },
  {
    role: 4,
    label: 'Менеджер склада',
  },
  {
    role: 5,
    label: 'Менеджер кассы',
  },
  {
    role: 6,
    label: 'Оператор склада',
  },
  {
    role: 7,
    label: 'Оператор банка',
  },
];

export default function UsersNewForm({ open, onClose, onCreate, onUpdate, currentUser }) {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const NewUserSchema = Yup.object().shape({
    firstname: Yup.string().required('Поле обязательное'),
    lastname: Yup.string().required('Поле обязательное'),
    email: Yup.string().required('Поле обязательное').email('Введите корректный e-mail'),
    password: Yup.string().required('Поле обязательное'),
    role: Yup.string().required('Поле обязательное'),
  });

  const defaultValues = useMemo(
    () => ({
      firstname: currentUser?.firstname || '',
      lastname: currentUser?.lastname || '',
      email: currentUser?.email || '',
      password: '',
      role: currentUser?.role || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      if (!currentUser) {
        onCreate(
          data,
          () => {
            enqueueSnackbar('Пользователь создан');
            setLoading(false);
            handleClose();
          },
          () => {
            setLoading(false);
          }
        );
      } else {
        onUpdate(
          {
            user_id: currentUser.user_id,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            password: data.password,
            role: data.role,
          },
          () => {
            enqueueSnackbar('Пользователь обновлен');
            setLoading(false);
            handleClose();
          },
          () => {
            setLoading(false);
          }
        );
      }
    } catch (error) {
      console.error(error);

      setLoading(false);
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
          {currentUser ? 'Редактировать пользователя' : 'Новый пользователь'}
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
              <RHFTextField name="lastname" label="Фамилия" />
              <RHFTextField name="firstname" label="Имя" />
              <RHFTextField name="email" label="Эл.почта" />

              <RHFTextField
                name="password"
                label="Пароль"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <RHFSelect name="role" label="Роль" placeholder="Выберите роль" options={USER_ROLE}>
                {USER_ROLE.map((role) => (
                  <MenuItem key={role?.role} value={role?.role}>
                    {role?.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={loading}>
            {currentUser ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

UsersNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  currentUser: PropTypes.object,
  open: PropTypes.bool,
};
