import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ExpenditureCurrencyChangeDialog({
  open,
  onClose,
  onSave,
  loadingSave,
  currency = '',
  ...other
}) {
  const [value, setValue] = useState(currency);

  useEffect(() => {
    if (currency) {
      setValue(currency);
    }
  }, [currency]);

  const onSubmit = () => {
    onSave(parseFloat(value?.replace(/,/g, '')));
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> Обновить курс доллара </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <NumericFormat
          customInput={TextField}
          label="Введите число"
          allowNegative={false}
          thousandSeparator
          fullWidth
          value={value}
          error={!value}
          helperText={!value ? 'Введите курс' : ' '}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button color="inherit" variant="contained" disabled sx={{ mr: -0.75 }}>
                  1 USD
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end' }}>
        {onClose && (
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Закрыть
          </Button>
        )}
        <LoadingButton
          disabled={!value}
          loading={loadingSave}
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="material-symbols:save" />}
          onClick={onSubmit}
        >
          Обновить
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

ExpenditureCurrencyChangeDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  loadingSave: PropTypes.bool,
  currency: PropTypes.string,
  onSave: PropTypes.func,
};
