import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel, { formControlLabelClasses } from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

export function RHFCheckbox({ name, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <FormControlLabel control={<Checkbox {...field} checked={field.value} />} {...other} />

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFCheckbox.propTypes = {
  helperText: PropTypes.string,
  name: PropTypes.string,
};

// ----------------------------------------------------------------------

export function RHFMultiCheckbox({
  mode = '',
  asyncAdd,
  asyncDelete,
  row,
  name,
  label,
  options,
  spacing,
  helperText,
  sx,
  ...other
}) {
  const { control } = useFormContext();

  const getSelected = async (selectedItems, item) => {
    if (mode !== 'update') {
      return selectedItems?.find((selectedItem) => selectedItem?.value === item?.value)
        ? selectedItems.filter((option) => option?.value !== item?.value)
        : [...selectedItems, item];
    }

    if (selectedItems?.find((selectedItem) => selectedItem?.value === item?.value)) {
      const result = await asyncDelete(
        selectedItems?.find((selectedItem) => selectedItem?.value === item?.value),
        selectedItems
      );

      return result;
    }

    const result = await asyncAdd(item, selectedItems);

    return result;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset">
          {label && (
            <FormLabel component="legend" sx={{ typography: 'body2' }}>
              {label}
            </FormLabel>
          )}

          <FormGroup
            sx={{
              ...(row && {
                flexDirection: 'row',
              }),
              [`& .${formControlLabelClasses.root}`]: {
                '&:not(:last-of-type)': {
                  mb: spacing || 0,
                },
                ...(row && {
                  mr: 0,
                  '&:not(:last-of-type)': {
                    mr: spacing || 2,
                  },
                }),
              },
              ...sx,
            }}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={field.value?.find((item) => item?.value === option.value)}
                    onChange={async () => field.onChange(await getSelected(field.value, option))}
                  />
                }
                label={option.label}
                {...other}
              />
            ))}
          </FormGroup>

          {(!!error || helperText) && (
            <FormHelperText error={!!error} sx={{ mx: 0 }}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}

RHFMultiCheckbox.propTypes = {
  helperText: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  options: PropTypes.array,
  row: PropTypes.bool,
  spacing: PropTypes.number,
  sx: PropTypes.object,
  mode: PropTypes.string,
  asyncAdd: PropTypes.func,
  asyncDelete: PropTypes.func,
};
