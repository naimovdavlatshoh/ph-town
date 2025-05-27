/* eslint-disable no-unsafe-optional-chaining */
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
import {
  Divider,
  MenuItem,
  Typography,
  ToggleButton,
  InputAdornment,
  ToggleButtonGroup,
} from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { fCurrency } from 'src/utils/format-number';

import { useGetObjects } from 'src/api/object';
import { useGetContractInfo } from 'src/api/contract';
import { useGetWarehouse, useSearchWarehouse } from 'src/api/warehouse';
import { useGetMaterials, useSearchMaterials } from 'src/api/materials';
import { useGetContragents, useSearchContragents } from 'src/api/contragents';

import Label from 'src/components/label';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';
import FormProvider, {
  RHFSelect,
  RHFCheckbox,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function WarehouseNewForm({ open, onClose, onCreate, onCreate2, data }) {
  const { objects, objectsLoading } = useGetObjects();
  const [clientTerm, setClientTerm] = useState('');
  const [clientTermHelper, setClientTermHelper] = useState('');
  const [materialData, setMaterial] = useState();

  const [materialTermHelper, setMaterialTermHelper] = useState('');
  const [warehouseTermHelper, setWarehouseTermHelper] = useState('');
  const [materialTerm, setMaterialTerm] = useState('');
  const [warehouseTerm, setWarehouseTerm] = useState('');
  const debouncedQuery = useDebounce(clientTerm, 3);
  const debouncedMaterialQuery = useDebounce(materialTerm, 2);
  const debouncedWarehouseQuery = useDebounce(warehouseTerm, 2);

  const { contragents, contragentsLoading } = useGetContragents();
  const { searchResults, searchLoading } = useSearchContragents(debouncedQuery);

  const [saveLoading, setSaveLoading] = useState(false);

  const { materials, materialsLoading } = useGetMaterials();

  const { searchResults: materialsResult, searchLoading: materialSearchLoading } =
    useSearchMaterials(debouncedMaterialQuery);

  const { warehouse, warehouseLoading } = useGetWarehouse();
  const { warehouseSearchResults, warehouseSearchLoading } =
    useSearchWarehouse(debouncedWarehouseQuery);

  const { enqueueSnackbar } = useSnackbar();

  const NewWarehouseSchema = Yup.object().shape({
    client: Yup.lazy(() =>
      Yup.object().when('type', ([type], schema) =>
        !type ? schema.required('Выберите клиента') : schema
      )
    ),
    material: Yup.object().nullable().required('Выберите сырьё'),
    type: Yup.bool().required('Выберите тип'),
    project_id: Yup.lazy(() =>
      Yup.string().when('type', ([type], schema) =>
        type ? schema.required('Выберите объект') : schema
      )
    ),
    delivery_price: Yup.lazy(() =>
      Yup.string().when('type', ([type], schema) =>
        !type ? schema.required('Введите сумму') : schema
      )
    ),
    isFree: Yup.bool().required(''),
    amount: Yup.string().required('Введите количество'),
    invoice_number: Yup.lazy(() =>
      Yup.string().when('type', ([type], schema) =>
        !type ? schema.required('Введите инвойс') : schema
      )
    ),
    price: Yup.lazy(() =>
      Yup.string().when('type', ([type], schema) =>
        !type ? schema.required('Введите сумму') : schema
      )
    ),
    comments: Yup.string().required('Введите комментарий'),
  });

  const defaultValues = useMemo(
    () => ({
      materail: null,
      amount: '',
      price: '',
      type: Boolean(data),
      isFree: false,
      comments: '',
      projectId: null,
      delivery_price: '',
      invoice_number: '',
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(NewWarehouseSchema),
    defaultValues,
  });

  useEffect(() => {
    if (methods.watch('isFree')) {
      methods.setValue('delivery_price', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('isFree')]);

  useEffect(() => {
    if (materialData) {
      methods.resetField('amount');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialData]);

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
      methods.setValue('type', Boolean(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onSubmit = handleSubmit(async (values) => {
    setSaveLoading(true);
    try {
      if (!values?.type) {
        onCreate(
          {
            client_id: values.client.client_id,
            material_id: values.material.material_id,
            material_name: values.material.material_name,
            amount: parseFloat(values.amount?.replace(/,/g, '')),
            price: parseFloat(values.price?.replace(/,/g, '')),
            delivery_price: parseFloat(values.delivery_price?.replace(/,/g, '')),
            invoice_number: values.invoice_number,
            comments: values.comments,
          },
          () => {
            refresh();
            enqueueSnackbar('Приход сохранен!');
            handleClose();
          }
        );
      } else {
        onCreate2(
          {
            project_id: values.project_id,
            material_id: values.material.material_id,
            amount: parseFloat(values.amount?.replace(/,/g, '')),
            comments: values.comments,
          },
          () => {
            enqueueSnackbar('Расход сохранен!');
            handleClose();
          }
        );
      }
    } catch (error) {
      setSaveLoading(false);
      console.error(error);
    }
  });

  const handleClose = () => {
    // eslint-disable-next-line no-unused-expressions
    if (!data) {
      methods.reset();
      setMaterial(null);
    }

    setSaveLoading(false);
    onClose();
  };

  const { refresh } = useGetContractInfo(methods.watch('contract'));

  const renderClientName = (client) => {
    if (client?.client_type === '0') {
      return `${client?.client_surname} ${client?.client_name || ''} ${
        client?.client_fathername || ''
      }`;
    }
    if (client?.client_type === '1') {
      return `"${client?.client_surname}" - ${client.client_name}`;
    }
    return '';
  };
  const renderType0 = (
    <Stack spacing={2} pt={2}>
      <RHFAutocomplete
        loading={clientTerm?.length >= 3 ? searchLoading : contragentsLoading}
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
        options={clientTerm?.length >= 3 ? searchResults : contragents}
        getOptionLabel={(option) => renderClientName(option)}
        renderOption={(props, option) => (
          <Stack
            {...props}
            key={option?.client_id}
            direction="row"
            sx={{
              justifyContent: 'space-between !important',
            }}
            width={1}
          >
            <Typography variant="caption">{renderClientName(option)}</Typography>
            <Typography variant="caption">{option?.counterparty_name}</Typography>
            <Typography variant="caption">
              {' '}
              {option?.client_type === '1' ? (
                <Label color="info">Юр.лицо</Label>
              ) : (
                <Label color="warning">Физ.лицо</Label>
              )}
            </Typography>
          </Stack>
        )}
      />

      <RHFAutocomplete
        noOptionsText="Пусто"
        loadingText="Идет поиск..."
        inputValue={materialTermHelper}
        onInputChange={(event, newInputValue, type) => {
          if (type === 'reset') {
            setMaterialTermHelper(newInputValue);
          }

          if (type === 'input') {
            setMaterialTerm(newInputValue);
            setMaterialTermHelper(newInputValue);
          }
        }}
        name="material"
        type="material"
        label="Сырьё"
        placeholder="Выбрать сырьё"
        fullWidth
        loading={materialTerm?.length >= 3 ? materialSearchLoading : materialsLoading}
        options={materialTerm?.length >= 3 ? materialsResult : materials}
        getOptionLabel={(option) => option?.material_name || ''}
      />

      <RHFTextField name="invoice_number" label="Инвойс номер" InputLabelProps={{ shrink: true }} />

      <RHFCurrencyField
        name="amount"
        label="Количество"
        placeholder="0"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">{methods.watch('material')?.unit_name}</InputAdornment>
          ),
        }}
      />

      <RHFCurrencyField
        name="price"
        label="Цена"
        placeholder="0"
        // decimalScale={0}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: <InputAdornment position="start">UZS</InputAdornment>,
        }}
      />
      <Divider>
        <Typography variant="caption" fontWeight={700} align="right">
          Общая сумма:{' '}
          {fCurrency(
            methods?.watch('amount')?.replace(/,/g, '') * methods?.watch('price')?.replace(/,/g, '')
          )}{' '}
          UZS
        </Typography>
      </Divider>

      <Stack direction="row" gap={1} alignItems="flex-end">
        <RHFCurrencyField
          name="delivery_price"
          label="Стоимость доставки"
          placeholder="0"
          decimalScale={0}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position="start">UZS</InputAdornment>
                <RHFCheckbox name="isFree" label="Бесплатно" />
              </>
            ),
            disabled: methods.watch('isFree'),
          }}
        />
      </Stack>
      <RHFTextField name="comments" label="Комментарии" multiline rows={2} />

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
    </Stack>
  );

  const renderType1 = (
    <Stack spacing={2} pt={2}>
      <RHFSelect
        name="project_id"
        label="Объект"
        InputLabelProps={{ shrink: true }}
        fullWidth
        loading={objectsLoading}
      >
        {objects.map((el, idx) => (
          <MenuItem key={el.project_id} value={el.project_id}>
            <Stack width="100%" direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption"> {el.project_name}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </RHFSelect>

      <RHFAutocomplete
        noOptionsText="Пусто"
        loadingText="Идет поиск..."
        inputValue={warehouseTermHelper}
        onInputChange={(event, newInputValue, type) => {
          if (type === 'reset') {
            setWarehouseTermHelper(newInputValue);
          }

          if (type === 'input') {
            setWarehouseTerm(newInputValue);
            setWarehouseTermHelper(newInputValue);
          }
        }}
        name="material"
        type="material"
        label="Сырьё"
        placeholder="Выбрать сырьё"
        fullWidth
        loading={warehouseTerm?.length >= 3 ? warehouseSearchLoading : warehouseLoading}
        options={warehouseTerm?.length >= 3 ? warehouseSearchResults : warehouse}
        getOptionLabel={(option) => `${option?.material_name} - ${option?.amount}` || ''}
        renderOption={(props, option) => (
          <Stack {...props} direction="row" justifyContent="space-between">
            <Typography width={1}>{option.material_name}</Typography>
            <Typography>{option.amount}</Typography>
          </Stack>
        )}
        customHandleChange={(material) => setMaterial(material)}
      />

      <RHFCurrencyField
        name="amount"
        label="Количество"
        placeholder="0"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">{methods.watch('material')?.unit_name}</InputAdornment>
          ),
        }}
        isAllowed={(values) => {
          const { floatValue } = values;
          if (!floatValue) return true;
          return floatValue <= materialData?.amount;
        }}
      />

      <RHFTextField name="comments" label="Комментарии" multiline rows={2} />

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
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Окно операций</DialogTitle>

        <DialogContent dividers sx={{ position: 'relative' }}>
          {!data && (
            <ToggleButtonGroup
              exclusive
              value={methods.watch('type') ? '1' : '0'}
              size="small"
              onChange={(e) => {
                methods.setValue('type', e.target.value === '1');
              }}
            >
              <ToggleButton color="primary" value="0">
                Приход
              </ToggleButton>

              <ToggleButton color="primary" value="1">
                Расход
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          {methods.watch('type') ? renderType1 : renderType0}
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>

          <LoadingButton color="primary" type="submit" variant="contained" loading={saveLoading}>
            Сохранить
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

WarehouseNewForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onCreate2: PropTypes.func,
  open: PropTypes.bool,
  entranceId: PropTypes.string,
  projectId: PropTypes.string,
  blockId: PropTypes.string,
  data: PropTypes.object.isRequired,
};
