import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { MenuItem, Typography, InputAdornment } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { useGetFloors } from 'src/api/floor';
import { useGetBlocks } from 'src/api/block';
import { useGetClients, useSearchClients } from 'src/api/clients';
import { useGetContracts, useGetContractInfo, useSearchContracts } from 'src/api/contract';

import { LoadingScreen } from 'src/components/loading-screen';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, {
  RHFSelect,
  RHFCheckbox,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

import ContractInfo from '../contracts/contract-info';

// ----------------------------------------------------------------------

function makeColor(value) {
  if (!value) {
    return '';
  }

  return value?.startsWith('-') ? 'red' : '';
}

export default function PaymentsNewForm({
  entranceId,
  projectId,
  blockId,
  open,
  onClose,
  onCreate,
  onCreate2,
  data,
}) {
  const [loadingPay, setLoadingPay] = useState(false);
  const { contracts } = useGetContracts();

  const { blocks } = useGetBlocks(projectId);
  const { floors } = useGetFloors(entranceId);
  const [clientTerm, setClientTerm] = useState('');
  const [clientTermHelper, setClientTermHelper] = useState('');
  const [contractTerm, setContractTerm] = useState('');
  const debouncedQuery = useDebounce(clientTerm, 3);
  const debouncedContractQuery = useDebounce(contractTerm, 2);

  const { clients, clientsLoading } = useGetClients();
  const { searchResults, searchLoading } = useSearchClients(debouncedQuery);
  const { searchContractResults, searchContractLoading } =
    useSearchContracts(debouncedContractQuery);

  const currentBlock = blocks?.find((block) => block.block_id === blockId);

  const { enqueueSnackbar } = useSnackbar();

  const NewPaymentsSchema = Yup.object().shape({
    client: Yup.object().nullable().required('Выберите клиента'),
    contract: Yup.string().required('Выберите контракт'),
    paymentMethod: Yup.string().required('Выберите метод оплаты'),
    paymentAmount: Yup.string().required('Введите сумму'),
    comments: Yup.string(),
    typeOfExpense: Yup.bool().required(''),
  });

  const defaultValues = useMemo(
    () => ({
      client: data
        ? {
            client_id: data?.client_id,
            client_name: data?.client_name,
            client_surname: data?.client_surname,
            client_type: data?.client_type,
            business_inn: data?.business_inn,
            business_name: data?.business_name,
          }
        : null,
      contract: data ? data?.contract_id : '',
      paymentMethod: '1',
      cash_type: '1',
      paymentAmount: '',
      comments: '',
      typeOfExpense: data?.type_of_expense === '1',
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

  useEffect(() => {
    if (data) {
      methods.setValue('client', {
        client_id: data?.client_id,
        client_name: data?.client_name,
        client_surname: data?.client_surname,
        client_type: data?.client_type,
        business_inn: data?.business_inn,
        business_name: data?.business_name,
        contracts: [{ contract_id: data?.contract_id, contract_number: data?.contract_number }],
      });

      methods.setValue('contract', data?.contract_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onSubmit = handleSubmit(async (values) => {
    setLoadingPay(true);
    try {
      onCreate(
        {
          cash_type: '1',
          client_id: values?.client?.client_id,
          contract_id: values?.contract,
          payment_amount: values?.paymentAmount?.replace(/,/g, ''),
          payment_method: values?.paymentMethod,
          comments: values?.comments,
          type_of_expense: values?.typeOfExpense ? '1' : '0',
        },
        () => {
          refresh();
          enqueueSnackbar('Олпата прошла успешна!');
          handleClose();
        }
      );
    } catch (error) {
      setLoadingPay(false);
    }
  });

  const handleClose = () => {
    // eslint-disable-next-line no-unused-expressions
    !data && methods.reset();
    setLoadingPay(false);
    onClose();
  };

  const PAYMENT_METHODS_OPTIONS = [
    {
      payment_method: '1',
      label: 'Наличка',
    },
    {
      payment_method: '2',
      label: 'Терминал',
    },
    {
      payment_method: '3',
      label: 'Клик',
    },
    {
      payment_method: '4',
      label: 'Банк',
    },
  ];

  const CASH_TYPES_OPTIONS = [
    {
      value: '0',
      label: 'Доллар (USD)',
    },
    {
      value: '1',
      label: 'Сум (UZS)',
    },
  ];

  const {
    contract: contractData,
    contractLoading,
    refresh,
  } = useGetContractInfo(methods.watch('contract'));

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

  const renderType0 = (
    <Stack spacing={2} pt={2}>
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

      <RHFSelect
        fullWidth
        name="paymentMethod"
        label="Вариант оплаты"
        InputLabelProps={{ shrink: true }}
      >
        {PAYMENT_METHODS_OPTIONS.map((el, idx) => (
          <MenuItem key={el.idx} value={el.payment_method}>
            <Stack width="100%" direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption"> {el.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </RHFSelect>

      {/* <RHFSelect
      name="cashType"
      label="Валюта"
      InputLabelProps={{ shrink: true }}
      sx={{
        maxWidth: { md: 160 },
      }}
    >
      {CASH_TYPES_OPTIONS.map((el, idx) => (
        <MenuItem key={el.idx} value={el.value}>
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="caption"> {el.label}</Typography>
          </Stack>
        </MenuItem>
      ))}
    </RHFSelect> */}

      <RHFCurrencyField
        name="paymentAmount"
        label="Сумма оплаты"
        placeholder="0"
        decimalScale={0}
        allowNegative
        InputLabelProps={{ shrink: true }}
        InputProps={{
          sx: { color: makeColor(methods.watch().paymentAmount) },
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

  const renderType1 = (
    <>
      <Stack spacing={2} pt={2}>
        <RHFAutocomplete
          disabled={Boolean(data)}
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
          onChange={(event, newValue, reason) => {
            methods.setValue('client', newValue, { shouldValidate: true });
            if (reason === 'clear') {
              methods.setValue('contract', '');
            }
          }}
        />
        <RHFSelect
          disabled={Boolean(data)}
          fullWidth
          name="contract"
          label="Контракт"
          placeholder="Выберите контракт клиента"
          InputLabelProps={{ shrink: true }}
        >
          {methods.watch('client')?.contracts?.map((el, idx) => (
            <MenuItem key={el.idx} value={el.contract_id}>
              <Stack
                width="100%"
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="caption">Контракт - №{el.contract_number}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </RHFSelect>
        {methods.watch('contract') && (
          <ContractInfo title="Информация контракта" contract={contractData} />
        )}
        <RHFSelect
          name="paymentMethod"
          label="Вариант оплаты"
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          {PAYMENT_METHODS_OPTIONS.map((el, idx) => (
            <MenuItem key={el.idx} value={el.payment_method}>
              <Stack
                width="100%"
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="caption"> {el.label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </RHFSelect>

        {/* <RHFSelect
      name="cashType"
      label="Валюта"
      InputLabelProps={{ shrink: true }}
      sx={{
        maxWidth: { md: 160 },
      }}
    >
      {CASH_TYPES_OPTIONS.map((el, idx) => (
        <MenuItem key={el.idx} value={el.value}>
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="caption"> {el.label}</Typography>
          </Stack>
        </MenuItem>
      ))}
    </RHFSelect> */}

        <RHFCurrencyField
          name="paymentAmount"
          label="Сумма оплаты"
          placeholder="0"
          decimalScale={0}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position="start">Первоначальный взнос</InputAdornment>
                <RHFCheckbox name="typeOfExpense" label="  " />
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
      {contractLoading && (
        <Stack
          position="absolute"
          sx={{ top: 0, bottom: 0, right: 0, left: 0, zIndex: 99999, bgcolor: '#ffffffba' }}
        >
          <LoadingScreen />
        </Stack>
      )}
    </>
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Оплата контракта</DialogTitle>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {renderType1}
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" loading={loadingPay}>
            Оплатить
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

PaymentsNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onCreate2: PropTypes.func,
  open: PropTypes.bool,
  entranceId: PropTypes.string,
  projectId: PropTypes.string,
  blockId: PropTypes.string,
  data: PropTypes.object.isRequired,
};
