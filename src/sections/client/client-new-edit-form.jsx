import * as Yup from 'yup';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFormContext } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import axios from 'src/utils/axios';

import { useGetRegions } from 'src/api/region';
import { useGetClients } from 'src/api/clients';

import { useSnackbar } from 'src/components/snackbar';
import RHFInnField from 'src/components/hook-form/rhf-inn-field';
import RHFPINFLField from 'src/components/hook-form/rhf-pinfl-field';
import RHFPassportField from 'src/components/hook-form/rhf-passport-field';
import FormProvider, { RHFUpload, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import ClientPhonesListForm from './client-phones-list-form';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentClient }) {
  const { createPersonalClient, createBusinessClient, updatePersonalClient, updateBusinessClient } =
    useGetClients();
  const { regions } = useGetRegions();
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [clientFileId, setClientFileId] = useState();
  const [passportType, setPassportType] = useState('0');

  const { control } = useFormContext;

  const [typeEntity, setTypeEntity] = useState('individual');

  useEffect(() => {
    if (currentClient) {
      if (currentClient?.client_type === '0') {
        setTypeEntity('individual');
      }

      if (currentClient?.client_type === '1') {
        setTypeEntity('legal');
      }

      setClientFileId(currentClient?.file_id);

      setPassportType(currentClient?.passport_type);
    }
  }, [currentClient]);

  const handleChangeTypeEntity = useCallback((event, newTypeEntity) => {
    if (newTypeEntity !== null) {
      setTypeEntity(newTypeEntity);
    }
  }, []);

  const NewPersonalClientSchema = Yup.object().shape({
    client_name: Yup.string().required('Заполните поле'),
    client_surname: Yup.string().required('Заполните поле'),
    client_fathername: Yup.string().required('Заполните поле'),
    client_inn: Yup.string()
      .required('Заполните поле')
      .matches(/^\d{9}$/, 'ИНН должен состоять из 9 цифр'),
    passport_series: Yup.string()
      .test('isFull', 'Введите полностью', (value) => /^[A-Z]{2} \d{7}$/.test(value))
      .required('Заполните поле'),
    pinfl: Yup.string().required('Заполните поле'),
    expire_date: Yup.string().required('Выберите дату'),
    date_of_issue: Yup.string().required('Выберите дату'),
    date_of_birth: Yup.string().required('Выберите дату'),
    given_by: Yup.string().required('Заполните поле'),

    region_by_passport: Yup.object().nullable().required('Заполните поле'),
    city_by_passport: Yup.object().nullable().required('Заполните поле'),
    address_by_passport: Yup.string().required('Заполните поле'),
    place_of_work: Yup.string().required('Заполните поле'),
    file: Yup.string().required('Загрузите сканер документа'),
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

  const NewBusinessClientSchema = Yup.object().shape({
    business_name: Yup.string().required('Заполните поле'),
    business_director_name: Yup.string().required('Заполните поле'),
    business_inn: Yup.string()
      .required('Заполните поле')
      .matches(/^\d{9}$/, 'ИНН должен состоять из 9 цифр'),
    business_mfo: Yup.string().required('Заполните поле'),
    business_region: Yup.object().nullable().required('Заполните поле'),
    business_city: Yup.object().nullable().required('Заполните поле'),
    business_address: Yup.string().required('Заполните поле'),
    business_bank_number: Yup.string().required('Заполните поле'),
    business_bank_name: Yup.string().required('Заполните поле'),
    passport_series: Yup.string()
      .test('isFull', 'Введите полностью', (value) => /^[A-Z]{2} \d{7}$/.test(value))
      .required('Заполните поле'),
    date_of_issue: Yup.string().required('Выберите дату'),
    given_by: Yup.string().required('Заполните поле'),
    file: Yup.string().required('Загрузите сканер документа'),
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

  const defaultValuesForPersonalClient = useMemo(
    () => ({
      client_name: currentClient?.client_name || '',
      client_surname: currentClient?.client_surname || '',
      client_fathername: currentClient?.client_fathername || '',
      client_inn: currentClient?.client_inn || '',
      passport_series: currentClient?.passport_series
        ? convertFormat(currentClient?.passport_series)
        : '',
      pinfl: currentClient?.pinfl || '',
      expire_date: moment(currentClient?.expire_date).isValid()
        ? moment(currentClient?.expire_date).toDate()
        : '',
      date_of_issue: moment(currentClient?.date_of_issue).isValid()
        ? moment(currentClient?.date_of_issue).toDate()
        : '',
      date_of_birth: moment(currentClient?.date_of_birth).isValid()
        ? moment(currentClient?.date_of_birth).toDate()
        : '',
      given_by: currentClient?.given_by || '',

      region_by_passport:
        regions.find((region) => region.region_id === currentClient?.region_by_passport) || null,
      city_by_passport:
        regions
          .find((region) => region.region_id === currentClient?.region_by_passport)
          ?.districts.find(
            (district) => district.district_id === currentClient?.city_by_passport
          ) || null,
      address_by_passport: currentClient?.address_by_passport || '',
      place_of_work: currentClient?.place_of_work || '',
      file: currentClient?.file_path || '',
      phones:
        currentClient?.phone_option.length &&
        currentClient?.phone_option?.map((phone) => ({
          phone_number: formatPhoneNumber(phone.phone_number),
          isMain: phone.is_main === '1',
          phoneId: phone.phone_id,
        })),
    }),
    [
      currentClient?.address_by_passport,
      currentClient?.city_by_passport,
      currentClient?.client_fathername,
      currentClient?.client_inn,
      currentClient?.client_name,
      currentClient?.client_surname,
      currentClient?.date_of_birth,
      currentClient?.date_of_issue,
      currentClient?.expire_date,
      currentClient?.file_path,
      currentClient?.given_by,
      currentClient?.passport_series,
      currentClient?.phone_option,
      currentClient?.pinfl,
      currentClient?.place_of_work,
      currentClient?.region_by_passport,
      regions,
    ]
  );

  const defaultValuesForBusinessClient = useMemo(
    () => ({
      business_name: currentClient?.business_name || '',
      business_director_name: currentClient?.business_director_name || '',
      business_inn: currentClient?.business_inn || '',
      business_mfo: currentClient?.business_mfo || '',
      business_region:
        regions.find((region) => region.region_id === currentClient?.business_region) || null,
      business_city:
        regions
          .find((region) => region.region_id === currentClient?.business_region)
          ?.districts.find((district) => district.district_id === currentClient?.business_city) ||
        null,
      business_address: currentClient?.business_address || '',
      business_bank_number: currentClient?.business_bank_number || '',
      business_bank_name: currentClient?.business_bank_name || '',

      passport_series: currentClient?.passport_series
        ? convertFormat(currentClient?.passport_series)
        : '',

      date_of_issue: moment(currentClient?.date_of_issue).isValid(currentClient?.date_of_issue)
        ? moment(currentClient?.date_of_issue).toDate()
        : '',
      given_by: currentClient?.given_by || '',
      file: currentClient?.file_path || '',
      phones:
        currentClient?.phone_option.length &&
        currentClient?.phone_option?.map((phone) => ({
          phone_number: formatPhoneNumber(phone.phone_number),
          isMain: phone.is_main === '1',
          phoneId: phone.phone_id,
        })),
    }),
    [
      currentClient?.business_address,
      currentClient?.business_bank_name,
      currentClient?.business_bank_number,
      currentClient?.business_city,
      currentClient?.business_director_name,
      currentClient?.business_inn,
      currentClient?.business_mfo,
      currentClient?.business_name,
      currentClient?.business_region,
      currentClient?.date_of_issue,
      currentClient?.file_path,
      currentClient?.given_by,
      currentClient?.passport_series,
      currentClient?.phone_option,
      regions,
    ]
  );

  const methodsForPersonalClient = useForm({
    mode: 'all',
    resolver: yupResolver(NewPersonalClientSchema),
    defaultValues: defaultValuesForPersonalClient,
  });

  const methodsForBusinessClient = useForm({
    mode: 'all',
    resolver: yupResolver(NewBusinessClientSchema),
    defaultValues: defaultValuesForBusinessClient,
  });

  const {
    setError: setErrorPersonal,
    reset: resetPersonal,
    watch: watchPersonal,
    setValue: setValuePersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { isSubmitting: isSubmittingPersonal },
  } = methodsForPersonalClient;

  const {
    setError: setErrorBusiness,
    reset: resetBusiness,
    watch: watchBusiness,
    setValue: setValueBusiness,
    handleSubmit: handleSubmitBusiness,
    formState: { isSubmitting: isSubmittingBusiness },
  } = methodsForBusinessClient;

  const valuesPersonal = watchPersonal();
  const valuesBusiness = watchBusiness();

  useEffect(() => {
    if (currentClient) {
      resetBusiness(defaultValuesForBusinessClient);
      resetPersonal(defaultValuesForPersonalClient);
    }
  }, [
    currentClient,
    defaultValuesForBusinessClient,
    defaultValuesForPersonalClient,
    resetPersonal,
    resetBusiness,
  ]);

  const onSubmitPersonal = handleSubmitPersonal(async (data) => {
    const values = {
      client_type: 0,
      client_file_id: clientFileId,
      passport_type: passportType,

      region_by_passport: data.region_by_passport?.region_id,
      city_by_passport: data.city_by_passport?.district_id,
      city_of_birth: data.city_by_passport?.district_id,
      pinfl: data.pinfl,
      passport_series: data.passport_series.replace(' ', ''),
      given_by: data.given_by,
      address_by_passport: data.address_by_passport,
      place_of_work: data.place_of_work,
      expire_date: moment(data.expire_date).valueOf(),
      date_of_issue: moment(data.date_of_issue).valueOf(),
      date_of_birth: moment(data.date_of_birth).valueOf(),

      client_name: data.client_name,
      client_surname: data.client_surname,
      client_fathername: data.client_fathername,

      client_inn: data.client_inn,

      phone_option: data.phones.map((phone) => ({
        is_main: phone?.isMain ? 1 : 0,
        phone_number: `+998${phone.phone_number?.replace(/\D/g, '')}`,
      })),
    };

    try {
      if (currentClient) {
        values.client_id = currentClient?.client_id;
        values.phone_option = data.phones.map((phone) => ({
          is_main: phone?.isMain ? 1 : 0,
          phone_number: `+998${phone.phone_number?.replace(/\D/g, '')}`,
          phone_id: phone.phoneId,
        }));
        updatePersonalClient(values);
      } else {
        createPersonalClient(values);
      }
      enqueueSnackbar(currentClient ? 'Информация клиента обновлена!' : 'Клиент зарегистрирован!');
      router.push(paths.dashboard.clients.root);
      console.info('DATA', data);
    } catch (error) {
      enqueueSnackbar({
        message: error?.message,
        variant: 'error',
      });
    }
  });

  const onSubmitBusiness = handleSubmitBusiness(async (data) => {
    const values = {
      client_type: 1,
      business_name: data.business_name,
      business_director_name: data.business_director_name,
      business_inn: data.business_inn,
      business_mfo: data.business_mfo,
      business_region: data.business_region?.region_id,
      business_city: data.business_city?.district_id,
      business_address: data.business_address,
      business_bank_number: data.business_bank_number,
      business_bank_name: data.business_bank_name,
      passport_series: data.passport_series.replace(' ', ''),
      given_by: data.given_by,
      date_of_issue: moment(data.date_of_issue).valueOf(),
      phone_option: data.phones.map((phone) => ({
        is_main: phone?.isMain ? 1 : 0,
        phone_number: `+998${phone.phone_number?.replace(/\D/g, '')}`,
      })),
      client_file_id: clientFileId,
    };

    try {
      if (currentClient) {
        values.client_id = currentClient?.client_id;
        values.phone_option = data.phones.map((phone) => ({
          is_main: phone?.isMain ? 1 : 0,
          phone_number: `+998${phone.phone_number?.replace(/\D/g, '')}`,
          phone_id: phone.phoneId,
        }));
        updateBusinessClient(values);
      } else {
        createBusinessClient(values);
      }

      enqueueSnackbar(currentClient ? 'Информация клиента обновлена!' : 'Клиент зарегистрирован!');
      router.push(paths.dashboard.clients.root);
      console.info('DATA', values);
    } catch (error) {
      enqueueSnackbar({
        message: error?.message,
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const formData = new FormData();
        formData.append('pdf_file', acceptedFiles[0]);

        // const url = 'https://api.argon.uz/api/v1/clients/passport';
        // const url = 'https://api.ph.town/api/v1/clients/passport';
        const url = 'https://testapi.ph.town/api/v1/clients/passport';

        const result = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'application/form-data',
          },
        });

        setClientFileId(result.data?.client_file_id);

        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );

        if (typeEntity === 'individual') {
          methodsForPersonalClient.setValue('file', newFiles[0], {
            shouldValidate: true,
          });
        } else {
          methodsForBusinessClient.setValue('file', newFiles[0], {
            shouldValidate: true,
          });
        }
      } catch (error) {
        if (typeEntity === 'individual') {
          setErrorPersonal('file', {
            type: 'custom',
            message: error?.message || 'Error',
          });
        } else {
          setErrorBusiness('file', {
            type: 'custom',
            message: error?.message || 'Error',
          });
        }
      }
    },
    [
      typeEntity,
      methodsForPersonalClient,
      methodsForBusinessClient,
      setErrorPersonal,
      setErrorBusiness,
    ]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      if (typeEntity === 'individual') {
        const filtered =
          valuesPersonal.images && valuesPersonal.images?.filter((file) => file !== inputFile);
        setValuePersonal('images', filtered);
      } else {
        const filtered =
          valuesBusiness.images && valuesBusiness.images?.filter((file) => file !== inputFile);
        setValueBusiness('images', filtered);
      }
    },
    [setValueBusiness, setValuePersonal, typeEntity, valuesBusiness.images, valuesPersonal.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    if (typeEntity === 'individual') {
      setValuePersonal('images', []);
    } else {
      setValueBusiness('images', []);
    }
  }, [typeEntity, setValuePersonal, setValueBusiness]);

  const renderMain = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Детали" />}
        <Stack sx={{ p: 3 }} spacing={1}>
          <Typography variant="subtitle2">Тип клиента</Typography>
          <ToggleButtonGroup
            disabled={currentClient}
            exclusive
            value={typeEntity}
            size="small"
            onChange={handleChangeTypeEntity}
          >
            <ToggleButton value="individual">Физическое лицо</ToggleButton>

            <ToggleButton value="legal">Юридическое лицо</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack spacing={3} sx={{ px: 3 }}>
          {/* <RHFTextField name="subDescription" label="Sub Description" multiline rows={4} /> */}

          {/* <Stack spacing={1.5}>
            <Typography variant="subtitle2">Content</Typography>
            <RHFEditor simple name="description" />
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Images</Typography>
            <RHFUpload
              multiple
              thumbnail
              name="images"
              maxSize={3145728}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAllFiles}
              onUpload={() => console.info('ON UPLOAD')}
            />
          </Stack> */}
        </Stack>
      </Card>
    </Grid>
  );

  const clientsInfo = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Инфо" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <Typography variant="subtitle2">Данные клиента</Typography>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFInnField name="client_inn" label="ИНН" placeholder="123456789" />
                <ClientPhonesListForm isNew={!currentClient} />
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFTextField name="client_surname" label="Фамилия" />
                <RHFTextField name="client_name" label="Имя" />
                <RHFTextField name="client_fathername" label="Отчество" />
              </Stack>
            </Grid>
          </Grid>

          {/* <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="phone" label="Номер телефона" />

            <RHFTextField name="sku" label="Product SKU" />

            <RHFTextField
              name="quantity"
              label="Quantity"
              placeholder="0"
              type="number"
              InputLabelProps={{ shrink: true }}
            />

            <RHFSelect native name="category" label="Category" InputLabelProps={{ shrink: true }}>
              {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
                <optgroup key={category.group} label={category.group}>
                  {category.classify.map((classify) => (
                    <option key={classify} value={classify}>
                      {classify}
                    </option>
                  ))}
                </optgroup>
              ))}
            </RHFSelect>

            <RHFMultiSelect
              checkbox
              name="colors"
              label="Colors"
              options={PRODUCT_COLOR_NAME_OPTIONS}
            />

            <RHFMultiSelect checkbox name="sizes" label="Sizes" options={PRODUCT_SIZE_OPTIONS} />
          </Box>

          <RHFAutocomplete
            name="tags"
            label="Tags"
            placeholder="+ Tags"
            multiple
            freeSolo
            options={_tags.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Gender</Typography>
            <RHFMultiCheckbox row name="gender" spacing={2} options={PRODUCT_GENDER_OPTIONS} />
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="saleLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField
              name="saleLabel.content"
              label="Sale Label"
              fullWidth
              disabled={!values.saleLabel.enabled}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="newLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField
              name="newLabel.content"
              label="New Label"
              fullWidth
              disabled={!values.newLabel.enabled}
            />
          </Stack> */}
        </Stack>
      </Card>
    </Grid>
  );

  const legalInfo = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Инфо" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <Typography variant="subtitle2">Данные юридического лица</Typography>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Stack spacing={2}>
                <RHFTextField name="business_name" label="Юридическое название" />
                <RHFTextField name="business_director_name" label="Имя директора" />
                <ClientPhonesListForm isNew={!currentClient} />
                <RHFInnField name="business_inn" label="ИНН" placeholder="123456789" />
                <RHFTextField name="business_mfo" label="МФО" />
                <RHFTextField name="business_bank_number" label="Лицевой счет" />
                <RHFTextField name="business_bank_name" label="Название банка" />
                <RHFUpload
                  accept={{ 'application/pdf': [] }}
                  title="Загрузите файл документа"
                  // multiple
                  thumbnail
                  name="file"
                  maxSize={15728640.01}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => console.info('ON UPLOAD')}
                />
              </Stack>
            </Grid>
          </Grid>

          {/* <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="phone" label="Номер телефона" />

            <RHFTextField name="sku" label="Product SKU" />

            <RHFTextField
              name="quantity"
              label="Quantity"
              placeholder="0"
              type="number"
              InputLabelProps={{ shrink: true }}
            />

            <RHFSelect native name="category" label="Category" InputLabelProps={{ shrink: true }}>
              {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
                <optgroup key={category.group} label={category.group}>
                  {category.classify.map((classify) => (
                    <option key={classify} value={classify}>
                      {classify}
                    </option>
                  ))}
                </optgroup>
              ))}
            </RHFSelect>

            <RHFMultiSelect
              checkbox
              name="colors"
              label="Colors"
              options={PRODUCT_COLOR_NAME_OPTIONS}
            />

            <RHFMultiSelect checkbox name="sizes" label="Sizes" options={PRODUCT_SIZE_OPTIONS} />
          </Box>

          <RHFAutocomplete
            name="tags"
            label="Tags"
            placeholder="+ Tags"
            multiple
            freeSolo
            options={_tags.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Gender</Typography>
            <RHFMultiCheckbox row name="gender" spacing={2} options={PRODUCT_GENDER_OPTIONS} />
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="saleLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField
              name="saleLabel.content"
              label="Sale Label"
              fullWidth
              disabled={!values.saleLabel.enabled}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="newLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField
              name="newLabel.content"
              label="New Label"
              fullWidth
              disabled={!values.newLabel.enabled}
            />
          </Stack> */}
        </Stack>
      </Card>
    </Grid>
  );

  const addressInfo = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Инфо" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <Typography variant="subtitle2">Адрес проживания</Typography>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFAutocomplete
                  name="region_by_passport"
                  type="region"
                  label="Область"
                  placeholder="Выберите область"
                  fullWidth
                  options={regions.map((option) => option)}
                  getOptionLabel={(option) => option.region_name || ''}
                />
                <RHFTextField
                  name="address_by_passport"
                  label="МФЙ, улица, дом"
                  multiline
                  rows={2}
                />
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFAutocomplete
                  disabled={!watchPersonal('region_by_passport')}
                  name="city_by_passport"
                  type="district"
                  label="Город/Район"
                  placeholder="Выберите город или район"
                  fullWidth
                  options={
                    watchPersonal('region_by_passport')?.districts?.map((option) => option) || []
                  }
                  getOptionLabel={(option) => option.district_name || ''}
                />
                <RHFTextField name="place_of_work" label="Место работы" multiline rows={2} />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Grid>
  );

  const addressInfoBusiness = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Инфо" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <Typography variant="subtitle2">Адрес проживания</Typography>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFAutocomplete
                  key={methodsForBusinessClient.watch().business_region}
                  name="business_region"
                  type="region"
                  label="Область"
                  placeholder="Выберите область"
                  fullWidth
                  options={regions.map((option) => option)}
                  getOptionLabel={(option) => option.region_name || ''}
                />
                <RHFTextField name="business_address" label="МФЙ, улица, дом" multiline rows={2} />
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFAutocomplete
                  key={methodsForBusinessClient.watch().business_city}
                  disabled={!watchBusiness('business_region')}
                  name="business_city"
                  type="district"
                  label="Город/Район"
                  placeholder="Выберите город или район"
                  fullWidth
                  options={
                    watchBusiness('business_region')?.districts?.map((option) => option) || []
                  }
                  getOptionLabel={(option) => option.district_name || ''}
                />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Grid>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}
        <Stack spacing={1} flexDirection="row">
          <Button
            component={RouterLink}
            href={paths.dashboard.clients.root}
            variant="outlined"
            size="large"
          >
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" size="large">
            {!currentClient ? 'Создать' : 'Обновить'}
          </LoadingButton>
        </Stack>
      </Grid>
    </>
  );

  const passportInfo = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Инфо" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <Typography variant="subtitle2">Паспортные данные</Typography>
          <ToggleButtonGroup
            exclusive
            value={passportType}
            size="small"
            onChange={(e) => {
              setPassportType(e.target.value);
            }}
          >
            <ToggleButton color="primary" value="0">
              Биометрический
            </ToggleButton>

            <ToggleButton color="primary" value="1">
              ID - карта
            </ToggleButton>
          </ToggleButtonGroup>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFPassportField
                  name="passport_series"
                  label="Серия и номер паспорта"
                  placeholder="AA 1234567"
                />

                <Controller
                  name="date_of_issue"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Дата выдачи"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
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
                  name="expire_date"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Срок действия"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
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
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Дата рождения"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
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
                <RHFTextField name="given_by" label="Кем выдан" />
                <RHFPINFLField name="pinfl" label="ПИНФЛ" />
              </Stack>
            </Grid>
            <Grid xs={12} md={6}>
              <RHFUpload
                accept={{ 'application/pdf': [] }}
                title="Загрузите копию паспорта"
                // multiple
                thumbnail
                name="file"
                maxSize={15728640.01}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={() => console.info('ON UPLOAD')}
              />
            </Grid>
          </Grid>

          {/* <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="phone" label="Номер телефона" />

            <RHFTextField name="sku" label="Product SKU" />

            <RHFTextField
              name="quantity"
              label="Quantity"
              placeholder="0"
              type="number"
              InputLabelProps={{ shrink: true }}
            />

            <RHFSelect native name="category" label="Category" InputLabelProps={{ shrink: true }}>
              {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
                <optgroup key={category.group} label={category.group}>
                  {category.classify.map((classify) => (
                    <option key={classify} value={classify}>
                      {classify}
                    </option>
                  ))}
                </optgroup>
              ))}
            </RHFSelect>

            <RHFMultiSelect
              checkbox
              name="colors"
              label="Colors"
              options={PRODUCT_COLOR_NAME_OPTIONS}
            />

            <RHFMultiSelect checkbox name="sizes" label="Sizes" options={PRODUCT_SIZE_OPTIONS} />
          </Box>

          <RHFAutocomplete
            name="tags"
            label="Tags"
            placeholder="+ Tags"
            multiple
            freeSolo
            options={_tags.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Gender</Typography>
            <RHFMultiCheckbox row name="gender" spacing={2} options={PRODUCT_GENDER_OPTIONS} />
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="saleLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField
              name="saleLabel.content"
              label="Sale Label"
              fullWidth
              disabled={!values.saleLabel.enabled}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="newLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField
              name="newLabel.content"
              label="New Label"
              fullWidth
              disabled={!values.newLabel.enabled}
            />
          </Stack> */}
        </Stack>
      </Card>
    </Grid>
  );

  const passportInfoForBussinessClient = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Инфо" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <Typography variant="subtitle2">Паспортные данные</Typography>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFPassportField
                  name="passport_series"
                  label="Серия и номер паспорта"
                  placeholder="AA 1234567"
                />

                <Controller
                  name="date_of_issue"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Дата выдачи"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
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
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFTextField name="given_by" label="Кем выдан" />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Grid>
  );

  return typeEntity === 'individual' ? (
    <FormProvider methods={methodsForPersonalClient} onSubmit={onSubmitPersonal}>
      <Grid container spacing={3}>
        {renderMain}

        <div style={{ width: '100%' }}>
          {clientsInfo}

          {passportInfo}

          {addressInfo}

          {/* {renderPricing} */}

          {renderActions}
        </div>
      </Grid>
    </FormProvider>
  ) : (
    <FormProvider methods={methodsForBusinessClient} onSubmit={onSubmitBusiness}>
      <Grid container spacing={3}>
        {renderMain}
        <div style={{ width: '100%' }}>
          {legalInfo}
          {passportInfoForBussinessClient}
          {addressInfoBusiness}
          {renderActions}
        </div>
      </Grid>
    </FormProvider>
  );
}

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

// Пример со вставкой пробела между буквами и цифрами
function convertFormat(inputString) {
  // Вставляем пробел после первых двух символов
  const convertedString = `${inputString.slice(0, 2)} ${inputString.slice(2)}`;

  return convertedString;
}

ClientNewEditForm.propTypes = {
  currentClient: PropTypes.object,
};
