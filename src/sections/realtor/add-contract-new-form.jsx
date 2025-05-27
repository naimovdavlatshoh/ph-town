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
import { InputAdornment } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDebounce } from 'src/hooks/use-debounce';

import { useAuthContext } from 'src/auth/hooks';
import { useGetRealtors, useSearchRealtors } from 'src/api/realtor';
import { useGetContracts, useSearchContracts } from 'src/api/contract';

import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, { RHFCheckbox, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

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

export default function AddContractNewForm({ open, onClose, data, create, update }) {
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

  const NewPaymentsSchema = Yup.object().shape({
    realtor_id: Yup.object().nullable().required('Выберите риэлтора'),
    contract_id: Yup.object().nullable().required('Выберите контракт'),
    amount: Yup.string().required('Введите сумму'),
    comments: Yup.string(),
    amountType: Yup.bool().required(''),
  });

  const defaultValues = useMemo(
    () => ({
      realtor_id: data
        ? {
            id: data.realtor_id,
            realtor_name: data.realtor_name,
          }
        : null,
      contract_id: data
        ? {
            contract_id: data.contract_id,
            contract_number: data.contract_number,
          }
        : null,
      amount: data?.amount || '',
      amountType: data?.amount_type ? data?.amount_type === '1' : false,
      comments: data?.comments || '',
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(NewPaymentsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (data) {
        update(
          {
            realtor_contract_id: data?.realtor_contract_id,
            realtor_id: values.realtor_id?.id,
            contract_id: values.contract_id?.contract_id,
            amount: parseFloat(values?.amount?.replace(/,/g, '')),
            amount_type: values?.amountType ? '1' : '0',
            comments: values?.comments,
          },
          () => {
            enqueueSnackbar('Контракт успешно прикреплен к риэлтору!');
            handleClose();
            setLoading(false);
          },
          () => {
            setLoading(false);
          }
        );
      } else {
        create(
          {
            realtor_id: values.realtor_id?.id,
            contract_id: values.contract_id?.contract_id,
            amount: parseFloat(values?.amount?.replace(/,/g, '')),
            amount_type: values?.amountType ? '1' : '0',
            comments: values?.comments,
          },
          () => {
            enqueueSnackbar('Контракт успешно прикреплен к риэлтору!');
            handleClose();
            setLoading(false);
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
    // eslint-disable-next-line no-unused-expressions
    !data && methods.reset();
    setLoading(false);
    onClose();
  };

  // useEffect(() => {
  //   methods.setValue('amount', '');

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [methods.watch('amountType')]);

  // console.log('@$52552', data, methods.watch());

  const renderType1 = (
    <Stack spacing={2} pt={2}>
      <RHFAutocomplete
        loading={realtorTerm?.length >= 3 ? searchLoading : realtorsLoading}
        noOptionsText="Пусто"
        loadingText="Идет поиск..."
        inputValue={realtorTermHelper}
        onInputChange={(event, newInputValue, type) => {
          if (type === 'reset') {
            setRealtorTermHelper(newInputValue);
          }

          if (type === 'input') {
            setRealtorTerm(newInputValue);
            setRealtorTermHelper(newInputValue);
          }
        }}
        name="realtor_id"
        type="realtor"
        label="Риэлторы"
        placeholder="Выбрать риэлтора"
        fullWidth
        options={realtorTerm?.length >= 3 ? searchResults : realtors}
        getOptionLabel={(option) => option?.realtor_name}
      />
      <RHFAutocomplete
        loading={contractTerm?.length >= 3 ? searchContractLoading : contractsLoading}
        noOptionsText="Пусто"
        loadingText="Идет поиск..."
        inputValue={contractTermHelper}
        onInputChange={(event, newInputValue, type) => {
          if (type === 'reset') {
            setContractTermHelper(newInputValue);
          }

          if (type === 'input') {
            setContractTerm(newInputValue);
            setContractTermHelper(newInputValue);
          }
        }}
        name="contract_id"
        type="contract"
        label="Контракты"
        placeholder="Выбрать контракт"
        fullWidth
        options={contractTerm?.length >= 3 ? searchContractResults : contracts}
        getOptionLabel={(option) => option?.contract_number}
      />

      <RHFCurrencyField
        name="amount"
        label="Сумма"
        placeholder="0"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <>
              <InputAdornment position="start">В процентах</InputAdornment>
              <RHFCheckbox name="amountType" label="  " />
            </>
          ),
        }}
      />
      <RHFTextField
        name="comments"
        label="Комментарий"
        InputLabelProps={{ shrink: true }}
        multiline
        rows={3}
      />
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack direction="row" justifyContent="space-between">
          <DialogTitle>Закрепление контракта к риэлтору</DialogTitle>
        </Stack>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {renderType1}
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton color="primary" type="submit" variant="contained" loading={loading}>
            {data ? 'Обновить' : 'Сохранить'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

AddContractNewForm.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  data: PropTypes.object.isRequired,
  create: PropTypes.func,
  update: PropTypes.func,
};
