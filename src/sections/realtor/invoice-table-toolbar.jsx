import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { useSearchKassaBankCategories } from 'src/api/payments';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InvoiceTableToolbar({
  filters,
  onFilters,
  //
  dateError,
}) {
  const termDebounce = useDebounce(filters.category.term, 3);

  const { searchResults, searchLoading } = useSearchKassaBankCategories(termDebounce);

  const popover = usePopover();

  const handleFilterCategory = useCallback(
    (category) => {
      onFilters('category', {
        ...filters.category,
        id: category?.category_id,
        name: category?.category_name,
      });
    },
    [filters.category, onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);

      if (!filters.endDate) {
        onFilters('endDate', newValue);
      }
    },
    [filters.endDate, onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <DatePicker
          disableFuture={filters.endDate}
          label="Дата начала"
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{ textField: { fullWidth: true } }}
          sx={{
            maxWidth: { md: 180 },
          }}
        />

        <DatePicker
          disablePast={filters.startDate}
          label="Дата окончания"
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError,
              helperText: dateError && 'Дата окончания должна быть позже даты начала.',
            },
          }}
          sx={{
            maxWidth: { md: 180 },
            [`& .${formHelperTextClasses.root}`]: {
              position: { md: 'absolute' },
              bottom: { md: -40 },
            },
          }}
        />

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <Autocomplete
            key={filters.category.id}
            noOptionsText="Пусто"
            options={searchResults}
            fullWidth
            onChange={(event, newValue) => {
              handleFilterCategory(newValue);
            }}
            getOptionLabel={(option) => option?.category_name}
            renderOption={(props, option) => (
              <li {...props} key={option?.category_id}>
                {option?.category_name}
              </li>
            )}
            renderInput={(params) => {
              const baseField = {
                ...params,
                label: 'Поиск',
                placeholder: 'Поиск категорий...',
                inputProps: {
                  ...params.inputProps,
                  autoComplete: 'new-password',
                },
              };

              return (
                <TextField
                  value={filters.category.name}
                  onChange={(e) =>
                    onFilters('category', { ...filters.category, term: e.target.value })
                  }
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
                        {searchLoading ? (
                          <CircularProgress sx={{ mr: -0.5, ml: 0.5 }} color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </InputAdornment>
                    ),
                  }}
                />
              );
            }}
          />
          {/* <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterCategory}
            placeholder="Поиск клиента или номер контракта..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          /> */}
          {/* 
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

InvoiceTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
