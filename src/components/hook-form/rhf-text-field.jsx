import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFTextField({ name, helperText, type, ...other }) {
  const { control } = useFormContext();
  const inputRef = useRef(null);

  // У type="number" прокрутка колеса мыши меняет значение на ±1 (например 12500 -> 12499).
  // Перехватываем нативное событие wheel с passive:false и полностью его блокируем —
  // значение не меняется, и поле при этом не теряет фокус.
  useEffect(() => {
    const el = inputRef.current;
    if (!el || type !== 'number') return undefined;

    const handleWheel = (event) => event.preventDefault();
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => el.removeEventListener('wheel', handleWheel);
  }, [type]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          inputRef={(el) => {
            field.ref(el);
            inputRef.current = el;
          }}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}

RHFTextField.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
};
