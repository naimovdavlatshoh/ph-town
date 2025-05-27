import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import InputMask from 'react-input-mask';
import { Controller, useFormContext } from 'react-hook-form';

import { Box } from '@mui/system';
import { InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFPhoneField({ name, helperText, type, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputMask
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value?.toUpperCase());
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          mask="(99) 999-99-99"
          maskChar="_"
          {...other}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  +998
                </Box>
              </InputAdornment>
            ),
          }}
        >
          {(inputProps) => <TextField {...inputProps} />}
        </InputMask>
      )}
    />
  );
}

RHFPhoneField.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
};
