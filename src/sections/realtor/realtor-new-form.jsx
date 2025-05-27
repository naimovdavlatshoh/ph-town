/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDebounce } from 'src/hooks/use-debounce';

import { useAuthContext } from 'src/auth/hooks';
import { useGetRealtors, useSearchRealtors } from 'src/api/realtor';
import { useGetContracts, useSearchContracts } from 'src/api/contract';

import RHFPhoneField from 'src/components/hook-form/rhf-phone-field';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------
const PAYMENT_METHODS_OPTIONS = [
  {
    payment_method: '1',
    label: 'Наличка',
  },
  {
    payment_method: '3',
    label: 'Клик',
  },
];

export default function RealtorNewForm({ open, onClose, data, create }) {
  const [cashType, setCashType] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categoryTerm, setCategoryTerm] = useState('');
  const [categoryTermHelper, setCategoryTermHelper] = useState('');
  const debouncedQuery = useDebounce(categoryTerm, 3);
  const { user } = useAuthContext();

  const [realtorTerm, setRealtorTerm] = useState('');
  const [realtorTermHelper, setRealtorTermHelper] = useState('');
  const debouncedRealtorQuery = useDebounce(realtorTerm, 3);

  const [contractTerm, setContractTerm] = useState('');
  const [contractTermHelper, setContractTermHelper] = useState('');
  const debouncedContractQuery = useDebounce(contractTerm, 3);

  const { realtors, realtorsLoading } = useGetRealtors();
  const { searchResults, searchLoading } = useSearchRealtors(debouncedRealtorQuery);

  const { contracts, contractsLoading } = useGetContracts();
  const { searchContractResults, searchContractLoading } =
    useSearchContracts(debouncedContractQuery);

  const { enqueueSnackbar } = useSnackbar();

  const NewRealtorScehama = Yup.object().shape({
    realtor_name: Yup.string().required('Введите имя'),
    realtor_surname: Yup.string().required('Введите фамилию'),
    realtor_company_name: Yup.string().required('Введите название компании'),
    realtor_phone_number: Yup.string().required('Введите номер телефона'),
  });

  const defaultValues = useMemo(
    () => ({
      realtor_name: data?.realtor_name || '',
      realtor_surname: data?.realtor_surname || '',
      realtor_company_name: data?.realtor_company_name || '',
      realtor_phone_number: data?.realtor_phone_number || '',
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(NewRealtorScehama),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      create(
        {
          ...values,
          realtor_phone_number: `+998${values.realtor_phone_number?.replace(/\D/g, '')}`,
        },
        () => {
          enqueueSnackbar('Операция прошла успешна!');
          handleClose();
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  });

  const handleClose = () => {
    // eslint-disable-next-line no-unused-expressions
    !data && methods.reset();
    setLoading(false);
    onClose();
  };

  const renderType1 = (
    <Stack spacing={2} pt={2}>
      <RHFTextField name="realtor_name" label="Имя" InputLabelProps={{ shrink: true }} />
      <RHFTextField name="realtor_surname" label="Фамилия" InputLabelProps={{ shrink: true }} />
      <RHFTextField
        name="realtor_company_name"
        label="Название компании"
        InputLabelProps={{ shrink: true }}
      />
      <RHFPhoneField
        name="realtor_phone_number"
        label="Номер телефона"
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack direction="row" justifyContent="space-between">
          <DialogTitle>Новый риэлтор</DialogTitle>
        </Stack>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {renderType1}
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton color="primary" type="submit" variant="contained" loading={loading}>
            Сохранить
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

RealtorNewForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  data: PropTypes.object.isRequired,
  create: PropTypes.func,
};
