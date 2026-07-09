import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Значение '' = «Все» = фильтр не отправляется на бэкенд.
const TYPE_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '0', label: 'Наличные' },
  { value: '1', label: 'Рассрочка' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '1', label: 'В процессе' },
  { value: '2', label: 'Подписан' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '1', label: 'Не оплачен' },
  { value: '2', label: 'Оплачен частично' },
  { value: '3', label: 'Оплачен полностью' },
];

const BARTER_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '1', label: 'Да' },
  { value: '0', label: 'Нет' },
];

const TERMINATED_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '1', label: 'Да' },
  { value: '0', label: 'Нет' },
];

const CASH_TYPE_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '0', label: 'USD' },
  { value: '1', label: 'SUM' },
];

// ----------------------------------------------------------------------

export default function UserTableToolbar({ filters, onFilters }) {
  const handleFilterClient = useCallback(
    (event) => {
      onFilters('client', event.target.value);
    },
    [onFilters]
  );

  const handleSelect = useCallback(
    (name) => (event) => {
      onFilters(name, event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      flexWrap="wrap"
      useFlexGap
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ p: 2.5 }}
    >
      <FilterSelect
        label="Тип"
        value={filters.contractType}
        onChange={handleSelect('contractType')}
        options={TYPE_OPTIONS}
      />

      <FilterSelect
        label="Статус договора"
        value={filters.contractStatus}
        onChange={handleSelect('contractStatus')}
        options={STATUS_OPTIONS}
      />

      <FilterSelect
        label="Статус оплаты"
        value={filters.contractPaymentStatus}
        onChange={handleSelect('contractPaymentStatus')}
        options={PAYMENT_STATUS_OPTIONS}
      />

      <FilterSelect
        label="Бартер"
        value={filters.isBarter}
        onChange={handleSelect('isBarter')}
        options={BARTER_OPTIONS}
      />

      <FilterSelect
        label="Расторгнутые"
        value={filters.isTerminated}
        onChange={handleSelect('isTerminated')}
        options={TERMINATED_OPTIONS}
      />

      <FilterSelect
        label="Валюта"
        value={filters.contractCashType}
        onChange={handleSelect('contractCashType')}
        options={CASH_TYPE_OPTIONS}
      />

      <TextField
        value={filters.client}
        onChange={handleFilterClient}
        placeholder="Поиск по клиенту..."
        sx={{ flexGrow: 1, width: { xs: 1, md: 'auto' }, minWidth: { md: 220 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};

// ----------------------------------------------------------------------

function FilterSelect({ label, value, onChange, options }) {
  return (
    <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
      <InputLabel shrink>{label}</InputLabel>

      <Select
        displayEmpty
        value={value}
        onChange={onChange}
        input={<OutlinedInput notched label={label} />}
        renderValue={(selected) => options.find((option) => option.value === selected)?.label}
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 240 },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

FilterSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array,
};
