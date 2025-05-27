import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Autocomplete, CircularProgress } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import { useSearchContragents } from 'src/api/contragents';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ArrivalTableToolbar({
  filters,
  onFilters,
  //
  contractTypeOptions,
}) {
  const termDebounce = useDebounce(filters.contragent.term, 3);

  const { searchResults, searchLoading } = useSearchContragents(termDebounce);
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
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

  const handleFilterContragent = useCallback(
    (client) => {
      onFilters('contragent', {
        ...filters.contragent,
        id: client?.client_id,
        name: renderClientName(client),
      });
    },
    [filters.contragent, onFilters]
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
        width={0.5}
      >
        {/* <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Типы оплаты</InputLabel>

          <Select
            value={filters.contractType}
            onChange={handleContractType}
            input={<OutlinedInput label="Типы оплаты" />}
            renderValue={(selected) => selected?.label}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {contractTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} selected>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <Autocomplete
            key={filters.contragent.id}
            noOptionsText="Пусто"
            options={searchResults}
            fullWidth
            onChange={(event, newValue) => {
              handleFilterContragent(newValue);
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
                  fullWidth
                  value={filters.contragent.name}
                  onChange={(e) =>
                    onFilters('contragent', { ...filters.contragent, term: e.target.value })
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

          {/* <IconButton onClick={popover.onOpen}>
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

ArrivalTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  contractTypeOptions: PropTypes.array,
};
