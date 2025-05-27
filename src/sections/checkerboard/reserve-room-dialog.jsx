import * as Yup from 'yup';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDebounce } from 'src/hooks/use-debounce';

import { useGetClients, useSearchClients } from 'src/api/clients';

import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
    return `"${client?.business_name}". Директор: ${
      client?.business_director_name || 'Не заполнен'
    }`;
  }
  return '';
};

export default function ReserveRoomDialog({ open, onClose, onReserve, apartmentId }) {
  const [loading, setLoading] = useState();

  const [clientTerm, setClientTerm] = useState('');
  const [clientTermHelper, setClientTermHelper] = useState('');
  const debouncedQuery = useDebounce(clientTerm, 3);

  const { clients, clientsLoading } = useGetClients();
  const { searchResults, searchLoading } = useSearchClients(debouncedQuery);

  const ReserveSchema = Yup.object().shape({
    client: Yup.object().nullable().required('Выберите клиента'),
    comments: Yup.string().required('Поле обязательное'),
    expire_date: Yup.date()
      .required('Выберите дату бронирования')
      .min(new Date(), 'Дата не может быть в прошлом'),
  });

  const defaultValues = {
    comments: '',
    expire_date: new Date(),
  };

  const methods = useForm({
    resolver: yupResolver(ReserveSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      // Format date to YYYY-MM-DD format
      const formattedDate =
        data.expire_date instanceof Date
          ? data.expire_date.toISOString().split('T')[0]
          : data.expire_date;

      const temp = {
        apartment_id: apartmentId,
        client_id: data.client.client_id,
        comments: data.comments,
        expire_date: formattedDate,
      };

      onReserve(
        {
          apartment_id: apartmentId,
          client_id: data.client.client_id,
          comments: data.comments,
          expire_date: formattedDate,
        },
        () => {
          onClose();
          setLoading(false);
        }
      );
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  });

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Временное бронирование помещения</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} py={2}>
            <RHFAutocomplete
              loading={clientTerm?.length >= 3 ? searchLoading : clientsLoading}
              noOptionsText="Пусто"
              loadingText="Идет поиск..."
              inputValue={clientTermHelper}
              onInputChange={(event, newInputValue, type) => {
                if (type === 'reset') {
                  setClientTermHelper(newInputValue);
                }

                if (type === 'input') {
                  setClientTerm(newInputValue);
                  setClientTermHelper(newInputValue);
                }
              }}
              name="client"
              type="client"
              label="Клиент"
              placeholder="Выбрать клиента"
              fullWidth
              options={clientTerm?.length >= 3 ? searchResults : clients}
              getOptionLabel={(option) => renderClientName(option)}
              renderOption={(props, option) => (
                <Stack {...props} direction="row" justifyContent="space-between">
                  <Typography width={1}>{renderClientName(option)}</Typography>
                  {option?.counterparty_type === '2' && (
                    <Typography>{option?.counterparty_name}</Typography>
                  )}
                </Stack>
              )}
            />

            <RHFTextField
              name="expire_date"
              label="Срок действия"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split('T')[0],
              }}
              fullWidth
            />

            <RHFTextField
              name="comments"
              label="Комментарий"
              InputLabelProps={{ shrink: true }}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={loading}>
            Забронировать
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ReserveRoomDialog.propTypes = {
  onClose: PropTypes.func,
  onReserve: PropTypes.func,
  apartmentId: PropTypes.string,
  open: PropTypes.bool,
};
