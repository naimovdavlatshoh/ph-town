import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ClientTableToolbar({
  filters,
  onFilters,
  //
  clientTypeOptions,
}) {
  const popover = usePopover();

  const [clienType, setClientType] = useState(filters.clientType);

  const handleChangeClientType = useCallback((event) => {
    const {
      target: { value },
    } = event;
    setClientType(typeof value === 'string' ? value.split(',') : value);
  }, []);

  const handleCloseStock = useCallback(() => {
    onFilters('clientType', clienType);
  }, [clienType, onFilters]);

  return (
    <>
      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Тип клиента</InputLabel>

        <Select
          value={clienType}
          onChange={handleChangeClientType}
          input={<OutlinedInput label="Individual" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          onClose={handleCloseStock}
          sx={{ textTransform: 'capitalize' }}
        >
          {clientTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox disableRipple size="small" checked={clienType.includes(option.value)} />
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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

ClientTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  clientTypeOptions: PropTypes.array,
};
