import axios from 'axios';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { countries } from 'src/assets/data';

import { useSnackbar } from 'src/components/snackbar';
import RHFInnField from 'src/components/hook-form/rhf-inn-field';
import RHFPassportField from 'src/components/hook-form/rhf-passport-field';
import FormProvider, { RHFUpload, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import ClientPhonesListForm from './client-phones-list-form';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentClient }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const { control } = useFormContext;

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    images: Yup.array().min(1, 'Images is required'),
    tags: Yup.array().min(2, 'Must have at least 2 tags'),
    category: Yup.string().required('Category is required'),
    price: Yup.number().moreThan(0, 'Price should not be $0.00'),
    description: Yup.string().required('Description is required'),
    // not required
    taxes: Yup.number(),
    newLabel: Yup.object().shape({
      enabled: Yup.boolean(),
      content: Yup.string(),
    }),
    saleLabel: Yup.object().shape({
      enabled: Yup.boolean(),
      content: Yup.string(),
    }),
    phones: Yup.lazy(() =>
      Yup.array().of(
        Yup.object({
          phone: Yup.string().required('Title is required'),
          isMain: Yup.boolean(),
        })
      )
    ),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentClient?.name || '',
      description: currentClient?.description || '',
      subDescription: currentClient?.subDescription || '',
      images: currentClient?.images || [],
      //
      code: currentClient?.code || '',
      sku: currentClient?.sku || '',
      price: currentClient?.price || 0,
      quantity: currentClient?.quantity || 0,
      priceSale: currentClient?.priceSale || 0,
      tags: currentClient?.tags || [],
      taxes: currentClient?.taxes || 0,
      gender: currentClient?.gender || '',
      category: currentClient?.category || '',
      colors: currentClient?.colors || [],
      sizes: currentClient?.sizes || [],
      newLabel: currentClient?.newLabel || { enabled: false, content: '' },
      saleLabel: currentClient?.saleLabel || { enabled: false, content: '' },
      phones: [{ phone: '', isMain: true }],
    }),
    [currentClient]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentClient) {
      reset(defaultValues);
    }
  }, [currentClient, defaultValues, reset]);

  useEffect(() => {
    if (includeTaxes) {
      setValue('taxes', 0);
    } else {
      setValue('taxes', currentClient?.taxes || 0);
    }
  }, [currentClient?.taxes, includeTaxes, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentClient ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.product.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const formData = new FormData();
      formData.append('pdf_file', acceptedFiles[0]);

      // const url = 'https://api.argon.uz/api/v1/clients/passport';
      // const url = 'https://api.ph.town/api/v1/clients/passport';
      const url = 'https://testapi.ph.town/api/v1/clients/passport';

      await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/form-data',
        },
      });
      const files = values.images || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const [typeEntity, setTypeEntity] = useState('individual');

  const handleChangeTypeEntity = useCallback((event, newTypeEntity) => {
    if (newTypeEntity !== null) {
      setTypeEntity(newTypeEntity);
    }
  }, []);

  const renderMain = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Детали" />}
        <Stack sx={{ p: 3 }} spacing={1}>
          <Typography variant="subtitle2">Тип клиента</Typography>
          <ToggleButtonGroup
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
                <ClientPhonesListForm />
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFTextField name="surname" label="Фамилия" />
                <RHFTextField name="firstname" label="Имя" />
                <RHFTextField name="lastname" label="Отчество" />
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
                <RHFTextField name="legalName" label="Юридическое название" />
                <RHFTextField name="directorName" label="Имя директора" />
                <ClientPhonesListForm />
                <RHFInnField name="inn" label="ИНН" placeholder="123456789" />
                <RHFPassportField name="mfo" label="МФО" placeholder="AA 123456" />
                <RHFUpload
                  title="Загрузите файл документа"
                  multiple
                  thumbnail
                  name="images"
                  maxSize={15728640.01}
                  onDrop={handleDrop}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={() => console.info('ON UPLOAD')}
                  type="field"
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
                  name="region"
                  type="country"
                  label="Область"
                  placeholder="Выберите область"
                  fullWidth
                  options={countries.map((option) => option.label)}
                  getOptionLabel={(option) => option}
                />
                <RHFTextField name="address" label="МФЙ, улица, дом" multiline rows={2} />
              </Stack>
            </Grid>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFAutocomplete
                  name="city"
                  type="country"
                  label="Город/Район"
                  placeholder="Выберите город или район"
                  fullWidth
                  options={countries.map((option) => option.label)}
                  getOptionLabel={(option) => option}
                />
                <RHFTextField name="address-job" label="Место работы" multiline rows={2} />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Grid>
  );

  const renderPricing = (
    <Grid xs={12} md={8}>
      <Card>
        {!mdUp && <CardHeader title="Pricing" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFTextField
            name="price"
            label="Regular Price"
            placeholder="0.00"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    $
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <RHFTextField
            name="priceSale"
            label="Sale Price"
            placeholder="0.00"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    $
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={<Switch checked={includeTaxes} onChange={handleChangeIncludeTaxes} />}
            label="Price includes taxes"
          />

          {!includeTaxes && (
            <RHFTextField
              name="taxes"
              label="Tax (%)"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      %
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          )}
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
          <Button variant="outlined" size="large">
            Отменить
          </Button>

          <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
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
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Stack spacing={2}>
                <RHFPassportField
                  name="passport"
                  label="Серия и номер паспорта"
                  placeholder="AA 1234567"
                />

                <Controller
                  name="passport-date"
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
                  name="passport-date"
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
                  name="createDate"
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
                <RHFTextField name="surname" label="Кем выдан" />
                <RHFTextField name="pinfl" label="ПИНФЛ" />
              </Stack>
            </Grid>
            <Grid xs={12} md={6}>
              <RHFUpload
                title="Загрузите копию паспорта"
                multiple
                thumbnail
                name="images"
                maxSize={15728640.01}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={() => console.info('ON UPLOAD')}
                type="field"
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

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderMain}

        {typeEntity === 'individual' ? (
          <>
            {clientsInfo}

            {passportInfo}

            {addressInfo}

            {/* {renderPricing} */}

            {renderActions}
          </>
        ) : (
          <>
            {legalInfo}
            {renderActions}
          </>
        )}
      </Grid>
    </FormProvider>
  );
}

ClientNewEditForm.propTypes = {
  currentClient: PropTypes.object,
};
