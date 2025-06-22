import * as Yup from 'yup';
import moment from 'moment';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import queryString from 'query-string';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import { DatePicker } from '@mui/x-date-pickers';
import { Alert, Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import axios from 'src/utils/axios';

import { useGetRealtors, useSearchRealtors } from 'src/api/realtor';

import { RHFAutocomplete } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';
import FormProvider from 'src/components/hook-form/form-provider';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

export default function RealtorContractsExcelDialog({
  title = 'Экспортировать в Excel',
  list,
  action,
  //
  open,
  onClose,
  //
  selected,
  onSelect,
}) {
  const { user } = useAuthContext();
  const [exportRowsCount, setExportRowsCount] = useState(0);
  const [loadingCheckRowsData, setLoadingCheckRowsData] = useState(false);
  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
  const [realtorTerm, setRealtorTerm] = useState('');
  const [realtorTermHelper, setRealtorTermHelper] = useState('');
  const debouncedQuery = useDebounce(realtorTerm, 3);

  const { realtors, realtorsLoading } = useGetRealtors();
  const { searchResults, searchLoading } = useSearchRealtors(debouncedQuery);

  const RealtorExportSchema = Yup.object().shape({
    realtor_id: Yup.object(),
    startDate: Yup.mixed().nullable().required('Поле обязательное'),
    endDate: Yup.mixed()
      .required('Поле обязательное')
      .test(
        'date-min',
        'Дата окончания должна быть позже даты начала.',
        (value, { parent }) => value.getTime() > parent.startDate.getTime()
      ),
  });

  const defaultValues = useMemo(
    () => ({
      startDate: null,
      endDate: null,
    }),
    []
  );

  const handleClose = () => {
    // eslint-disable-next-line no-unused-expressions

    setExportRowsCount(0);
    setLoadingCheckRowsData(false);
    setLoadingExcelFile(false);
    setRealtorTerm('');
    setRealtorTermHelper('');
    methods.reset();
    onClose();
  };

  const methods = useForm({
    resolver: yupResolver(RealtorExportSchema),

    defaultValues,
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    setLoadingExcelFile(true);
    try {
      const queryObject = {};

      if (moment(values.startDate).isValid()) {
        queryObject.startdate = moment(values.startDate).valueOf();
      }

      if (moment(values.endDate).isValid()) {
        queryObject.enddate = moment(values.endDate).valueOf();
      }

      if (values.realtor_id) {
        queryObject.realtor_id = values.realtor_id?.realtor_id;
      }

      const query = queryString.stringify(queryObject);

      const result = await axios.get(`/api/v1/realtor/contract/excel?${query}`);

      if (!result?.data?.download_link) {
        enqueueSnackbar('Ссылка для скачивания не найдена', {
          variant: 'error',
        });
        return;
      }

      saveAs(result?.data?.download_link, `Риэлтор-экспорт.xlsx`);
      enqueueSnackbar('Файл успешно загружен!', {
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingExcelFile(false);
    }
  });

  const checkRowsExportData = async (values) => {
    const queryObject = {
      row_count: 1,
    };

    if (moment(values.startDate).isValid()) {
      queryObject.startdate = moment(values.startDate).valueOf();
    }

    if (moment(values.endDate).isValid()) {
      queryObject.enddate = moment(values.endDate).valueOf();
    }

    if (values.category) {
      queryObject.bank_category_id = values.category?.category_id;
    }

    const query = queryString.stringify(queryObject);

    setLoadingCheckRowsData(true);
    try {
      const result = await axios.get(`/api/v1/kassabank/excel?${query}`);

      setExportRowsCount(result?.data?.row_count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCheckRowsData(false);
    }
  };

  useEffect(() => {
    const values = methods.watch();

    if (!(values.startDate && values.endDate)) {
      return;
    }

    checkRowsExportData(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('category'), methods.watch('endDate'), methods.watch('startDate')]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers sx={{ position: 'relative' }}>
          <Stack spacing={2} pt={2}>
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  {...field}
                  label="Дата начала"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  {...field}
                  label="Дата окончания"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
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
              name="realtor_od"
              type="realtor"
              label="Риэлторы"
              placeholder="Выбрать риэлтора"
              fullWidth
              options={realtorTerm?.length >= 3 ? searchResults : realtors}
              getOptionLabel={(option) => `${option?.realtor_surname} ${option?.realtor_name}`}
            />
            {exportRowsCount >= 600 && (
              <Alert severity="warning">Реультат больше 600, но мы загрузим только 600</Alert>
            )}

            {exportRowsCount < 600 && exportRowsCount > 0 && (
              <Alert severity="info">Найдено результатов: {exportRowsCount}</Alert>
            )}
          </Stack>
          {loadingCheckRowsData && (
            <LoadingScreen
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 99999,
                background: '#fff',
              }}
              title="Проверка данных..."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Отменить
          </Button>
          {['1', '2'].includes(user?.role) && (
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loadingExcelFile}
              disabled={!(methods.watch().endDate && methods.watch().startDate)}
            >
              Скачать
            </LoadingButton>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

RealtorContractsExcelDialog.propTypes = {
  action: PropTypes.node,
  list: PropTypes.array,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.func,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (address) =>
        address.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        address.fullAddress.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        `${address.company}`.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
