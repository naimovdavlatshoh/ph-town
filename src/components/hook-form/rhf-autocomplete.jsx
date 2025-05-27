import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import { Controller, useFormContext } from 'react-hook-form';

import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { Stack, Avatar, Typography, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import { countries } from 'src/assets/data';

import Iconify from 'src/components/iconify';

import Label from '../label';

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

// ----------------------------------------------------------------------

export default function RHFAutocomplete({
  name,
  label,
  type,
  helperText,
  placeholder,
  customHandleChange,
  ...other
}) {
  const layoutModal = useBoolean();
  const [selectedLayoutSrc, setSelectedLayoutSrc] = useState();

  useEffect(() => () => setSelectedLayoutSrc(null), []);

  const { control, setValue } = useFormContext();

  const { multiple } = other;

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          if (type === 'country') {
            return (
              <Autocomplete
                {...field}
                id={`autocomplete-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => {
                  const country = getCountry(option);

                  if (!country.label) {
                    return null;
                  }

                  return (
                    <li {...props} key={country.label}>
                      <Iconify
                        key={country.label}
                        icon={`circle-flags:${country.code?.toLowerCase()}`}
                        sx={{ mr: 1 }}
                      />
                      {country.label} ({country.code}) +{country.phone}
                    </li>
                  );
                }}
                renderInput={(params) => {
                  const country = getCountry(params.inputProps.value);

                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  if (multiple) {
                    return <TextField {...baseField} />;
                  }

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{
                              ...(!country.code && {
                                display: 'none',
                              }),
                            }}
                          >
                            <Iconify
                              icon={`circle-flags:${country.code?.toLowerCase()}`}
                              sx={{ mr: -0.5, ml: 0.5 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => {
                    const country = getCountry(option);

                    return (
                      <Chip
                        {...getTagProps({ index })}
                        key={country.label}
                        label={country.label}
                        icon={<Iconify icon={`circle-flags:${country.code?.toLowerCase()}`} />}
                        size="small"
                        variant="soft"
                      />
                    );
                  })
                }
                {...other}
              />
            );
          }

          if (type === 'layout') {
            return (
              <Autocomplete
                {...field}
                id={`autocomplete-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => {
                  if (!option) {
                    return null;
                  }

                  return (
                    <li {...props} key={option?.layout_id}>
                      <Avatar
                        variant="rounded"
                        src={option?.file_path}
                        sx={{ mr: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLayoutSrc(option?.file_path);
                          layoutModal.onTrue();
                        }}
                      />
                      {option.layout_name || 'Без названия'}
                    </li>
                  );
                }}
                renderInput={(params) => {
                  const country = getCountry(params.inputProps.value);

                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  if (multiple) {
                    return <TextField {...baseField} />;
                  }

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{
                              ...(!field?.value?.file_path && {
                                display: 'none',
                              }),
                            }}
                          >
                            <Avatar
                              onClick={() => {
                                setSelectedLayoutSrc(field?.value?.file_path);
                                layoutModal.onTrue();
                              }}
                              variant="rounded"
                              src={field?.value?.file_path}
                              sx={{ cursor: 'pointer' }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'measureunit') {
            return (
              <Autocomplete
                {...field}
                id={`autocomplete-${name}`}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={!!error}
                    helperText={error ? error?.message : helperText}
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                {...other}
              />
            );
          }
          if (type === 'region') {
            return (
              <Autocomplete
                {...field}
                id={`autocomplete-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => {
                  if (!option) {
                    return null;
                  }

                  return (
                    <li {...props} key={option?.region_id}>
                      {option.region_name || 'Без названия'}
                    </li>
                  );
                }}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  if (multiple) {
                    return <TextField {...baseField} />;
                  }

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'district') {
            return (
              <Autocomplete
                {...field}
                id={`autocomplete-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => {
                  if (!option) {
                    return null;
                  }

                  return (
                    <li {...props} key={option?.district_id}>
                      {option.district_name || 'Без названия'}
                    </li>
                  );
                }}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  if (multiple) {
                    return <TextField {...baseField} />;
                  }

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'client') {
            return (
              <Autocomplete
                {...field}
                id={`client-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
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
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'bankCategory') {
            return (
              <Autocomplete
                {...field}
                id={`category-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => (
                  <Stack
                    {...props}
                    key={option?.category_id}
                    direction="row"
                    sx={{
                      justifyContent: 'space-between !important',
                    }}
                    width={1}
                  >
                    <Typography variant="caption">{option?.category_name}</Typography>
                  </Stack>
                )}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'arrival') {
            return (
              <Autocomplete
                {...field}
                id={`arrival-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => (
                  <Stack
                    {...props}
                    key={option?.arrival_id}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography width={1} variant="caption">
                      Инвойс: {option?.invoice_number}
                    </Typography>
                    <Typography width={1} variant="caption">
                      {option?.material_name}
                    </Typography>
                    <Stack width={1}>
                      <Typography width={1} variant="caption">
                        Общая сумма: {fCurrency(option?.total_price)} UZS
                      </Typography>
                      {option?.payment_history?.length > 0 && (
                        <Typography color="success.main" width={1} variant="caption">
                          Оплачено: +
                          {fCurrency(
                            // eslint-disable-next-line no-unsafe-optional-chaining
                            option?.payment_history?.reduce(
                              // eslint-disable-next-line no-unsafe-optional-chaining
                              (prev, curr) => prev + +curr?.payment_amount,
                              0
                            )
                          )}{' '}
                          UZS
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                )}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'contragentCategory') {
            return (
              <Autocomplete
                {...field}
                id={`contragentCategory-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => (
                  <li {...props} key={option?.counterparty_id}>
                    {option?.counterparty_name}
                  </li>
                )}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'material') {
            return (
              <Autocomplete
                {...field}
                id={`material-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => {
                  if (customHandleChange) {
                    customHandleChange(newValue);
                  }

                  setValue(name, newValue, { shouldValidate: true });
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option?.material_id}>
                    <Iconify key={option?.material_id} sx={{ mr: 1 }} />
                    {option?.material_name || ''}
                  </li>
                )}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {other.endAdornment || params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'contract') {
            return (
              <Autocomplete
                {...field}
                id={`contract-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => (
                  <li {...props} key={option?.contract_id}>
                    <Iconify key={option?.contract_id} sx={{ mr: 1 }} />
                    {option?.contract_number}
                  </li>
                )}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          if (type === 'realtor') {
            return (
              <Autocomplete
                {...field}
                id={`realtor-${name}`}
                autoHighlight={!multiple}
                disableCloseOnSelect={multiple}
                onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    <Iconify key={option?.id} sx={{ mr: 1 }} />
                    {option?.realtor_name}
                  </li>
                )}
                renderInput={(params) => {
                  const baseField = {
                    ...params,
                    label,
                    placeholder,
                    error: !!error,
                    helperText: error ? error?.message : helperText,
                    inputProps: {
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    },
                  };

                  return (
                    <TextField
                      {...baseField}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {other.loading ? (
                              <CircularProgress
                                sx={{ mr: -0.5, ml: 0.5 }}
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
                {...other}
              />
            );
          }

          return (
            <Autocomplete
              {...field}
              id={`autocomplete-${name}`}
              onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  placeholder={placeholder}
                  error={!!error}
                  helperText={error ? error?.message : helperText}
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password',
                  }}
                />
              )}
              {...other}
            />
          );
        }}
      />
      <Lightbox
        open={layoutModal.value}
        close={() => {
          layoutModal.onToggle();
          setSelectedLayoutSrc(null);
        }}
        slides={[
          {
            src: selectedLayoutSrc,
            width: '100%',
            height: '100%',
          },
        ]}
      />
    </>
  );
}

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
  placeholder: PropTypes.string,
  customHandleChange: PropTypes.func,
};

// ----------------------------------------------------------------------

export function getCountry(inputValue) {
  const option = countries.filter((country) => country.label === inputValue)[0];

  return {
    ...option,
  };
}
