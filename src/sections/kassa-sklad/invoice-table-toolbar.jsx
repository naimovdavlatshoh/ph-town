import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { useSearchContragents } from 'src/api/contragents';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InvoiceTableToolbar({
  filters,
  onFilters,
  //
  dateError,
}) {
  const termDebounce = useDebounce(filters.client.term, 3);

  const { searchResults, searchLoading } = useSearchContragents(termDebounce);

  const popover = usePopover();

  const handleFilterClient = useCallback(
    (client) => {
      onFilters('client', {
        ...filters.client,
        id: client?.client_id,
        name: renderClientName(client),
      });
    },
    [filters.client, onFilters]
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

  const renderClientName = (client) => {
    if (client?.client_type === '0') {
      return `${client?.client_surname} ${client?.client_name || ''} ${
        client?.client_fathername || ''
      }`;
    }
    if (client?.client_type === '1') {
      return `"${client?.client_surname}" - ${client?.client_name}`;
    }
    return '';
  };

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
            key={filters.client.id}
            noOptionsText="Пусто"
            options={searchResults}
            fullWidth
            onChange={(event, newValue) => {
              handleFilterClient(newValue);
            }}
            getOptionLabel={(option) => renderClientName(option)}
            renderOption={(props, option) => (
              <li {...props} key={option?.client_id}>
                <Iconify key={option?.client_id} sx={{ mr: 1 }} />
                {renderClientName(option)}
              </li>
            )}
            renderInput={(params) => {
              const baseField = {
                ...params,
                label: 'Поиск',
                placeholder: 'Поиск контрагента...',
                inputProps: {
                  ...params.inputProps,
                  autoComplete: 'new-password',
                },
              };

              return (
                <TextField
                  value={filters.client.name}
                  onChange={(e) => onFilters('client', { ...filters.client, term: e.target.value })}
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
            onChange={handleFilterClient}
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
