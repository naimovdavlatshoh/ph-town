import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

import { InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFCurrencyField({ name, helperText, type, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <NumericFormat
          customInput={TextField}
          label="Введите число"
          allowNegative={false}
          thousandSeparator
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...field}
          InputLabelProps={{ shrink: true }}
          FormHelperTextProps={{
            sx: {
              color: '#00acff',
            },
          }}
          InputProps={{
            disabled: other.disabled,
            endAdornment: (
              <InputAdornment position="end">{other?.endAdornmentLabel}</InputAdornment>
            ),
          }}
          {...other}
        />
      )}
    />
  );
}

RHFCurrencyField.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
};
