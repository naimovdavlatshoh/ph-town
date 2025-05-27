import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import InputMask from 'react-input-mask';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFPINFLField({ name, helperText, type, ...other }) {
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
          mask="99999999999999"
          maskChar=""
          {...other}
        >
          {(inputProps) => <TextField {...inputProps} />}
        </InputMask>
      )}
    />
  );
}

RHFPINFLField.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
};
