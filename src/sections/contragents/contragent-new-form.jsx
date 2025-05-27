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
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

import { useGetContragentCategories, useSearchContragentCategories } from 'src/api/contragents';

import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import ClientPhonesListForm from './client-phones-list-form';

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

function formatPhoneNumber(inputNumber) {
  // Удаление всех нецифровых символов из входящего номера
  const cleanedNumber = inputNumber.replace(/\D/g, '');

  // Проверка, чтобы убедиться, что номер содержит нужное количество цифр
  if (cleanedNumber.length !== 12) {
    console.error('Некорректный формат номера');
    return inputNumber;
  }

  const regionCode = cleanedNumber.slice(3, 5);
  const remainingDigits = cleanedNumber.slice(5);

  // Форматирование номера
  const formattedNumber = `(${regionCode}) ${remainingDigits.slice(0, 3)}-${remainingDigits.slice(
    3,
    5
  )}-${remainingDigits.slice(5)}`;

  return formattedNumber;
}

export default function ContragentNewForm({
  open,
  onClose,
  onCreate,
  onUpdate,
  currentContragent,
}) {
  const [categoryTerm, setCategoryTerm] = useState('');
  const [categoryTermHelper, setCategoryTermHelper] = useState('');
  const debouncedQuery = useDebounce(categoryTerm, 3);

  const { categories, categoriesLoading } = useGetContragentCategories();
  const { searchResults, searchLoading } = useSearchContragentCategories(debouncedQuery);

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  useEffect(() => {
    if (currentContragent) {
      if (currentContragent.client_type === '1') {
        setTypeEntity('legal');
      } else {
        setTypeEntity('individual');
      }
    }
  }, [currentContragent]);

  const NewContragentSchema = Yup.object().shape({
    client_name: Yup.string().required('Поле обязательное'),
    client_surname: Yup.string().required('Поле обязательное'),
    counterparty_id: Yup.object().required('Выберите категорию'),
    phones: Yup.lazy(() =>
      Yup.array().of(
        Yup.object({
          phone_number: Yup.string()
            .test('isFull', 'Введите номер полностью', (value) =>
              /^\(\d{2}\) \d{3}-\d{2}-\d{2}$/.test(value)
            )
            .required('Заполните поле'),
          isMain: Yup.boolean(),
        })
      )
    ),
  });

  const defaultValues = useMemo(
    () => ({
      client_name: currentContragent?.client_name || '',
      client_surname: currentContragent?.client_surname || '',
      counterparty_id: currentContragent?.counterparty_id
        ? {
            counterparty_id: currentContragent.counterparty_id,
            counterparty_name: currentContragent.counterparty_name,
          }
        : undefined,
      phones:
        currentContragent?.phone_option.length &&
        currentContragent?.phone_option?.map((phone) => ({
          phone_number: formatPhoneNumber(phone.phone_number),
          isMain: phone.is_main === '1',
          phoneId: phone.phone_id,
        })),
    }),
    [currentContragent]
  );

  const methods = useForm({
    resolver: yupResolver(NewContragentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentContragent) {
        onCreate(
          {
            client_type: typeEntity === 'legal' ? '1' : '0',
            client_name: data?.client_name,
            client_surname: data?.client_surname,
            counterparty_id: data?.counterparty_id?.counterparty_id,
            phone_option: data.phones.map((phone) => ({
              is_main: phone?.isMain ? 1 : 0,
              phone_number: `+998${phone.phone_number?.replace(/\D/g, '')}`,
            })),
          },
          () => {
            enqueueSnackbar('Контрагент создан');
            handleClose();
          }
        );
      } else {
        onUpdate(
          {
            client_id: currentContragent?.client_id,
            client_type: typeEntity === 'legal' ? '1' : '0',
            client_name: data?.client_name,
            client_surname: data?.client_surname,
            counterparty_id: data?.counterparty_id?.counterparty_id,
            phone_option: data.phones.map((phone) => ({
              phone_id: phone?.phoneId,
              is_main: phone?.isMain ? 1 : 0,
              phone_number: `+998${phone.phone_number?.replace(/\D/g, '')}`,
            })),
          },
          () => {
            enqueueSnackbar('Данные контрагента обновлены');
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

  const [typeEntity, setTypeEntity] = useState('individual');

  const handleChangeTypeEntity = useCallback((event, newTypeEntity) => {
    if (newTypeEntity !== null) {
      setTypeEntity(newTypeEntity);
    }
  }, []);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          {currentContragent ? 'Редактировать контрагента' : 'Новый контрагент'}
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
              <RHFTextField
                name="client_surname"
                label={typeEntity === 'legal' ? 'Название бизнеса' : 'Фамилия'}
              />
              <RHFTextField name="client_name" label={typeEntity === 'legal' ? 'ИНН' : 'Имя'} />
              <RHFAutocomplete
                loading={categoryTerm?.length >= 3 ? searchLoading : categoriesLoading}
                noOptionsText="Пусто"
                loadingText="Идет поиск..."
                inputValue={categoryTermHelper}
                onInputChange={(event, newInputValue, type) => {
                  if (type === 'reset') {
                    setCategoryTermHelper(newInputValue);
                  }

                  if (type === 'input') {
                    setCategoryTerm(newInputValue);
                    setCategoryTermHelper(newInputValue);
                  }
                }}
                name="counterparty_id"
                type="contragentCategory"
                label="Категория"
                placeholder="Выбрать категорию"
                fullWidth
                options={categoryTerm?.length >= 3 ? searchResults : categories}
                getOptionLabel={(option) => option?.counterparty_name}
              />
              <Stack spacing={1}>
                <Typography variant="body2">Тип клиента</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={typeEntity}
                  size="small"
                  onChange={handleChangeTypeEntity}
                >
                  <ToggleButton color="primary" value="individual">
                    Физическое лицо
                  </ToggleButton>

                  <ToggleButton color="primary" value="legal">
                    Юридическое лицо
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <ClientPhonesListForm isNew={false} />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {currentContragent ? 'Обновить' : 'Создать'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ContragentNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  currentContragent: PropTypes.object,
  open: PropTypes.bool,
};
