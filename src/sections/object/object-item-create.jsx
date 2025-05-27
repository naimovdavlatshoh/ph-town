import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ObjectItemCreate({ onCreate }) {
  const popover = usePopover();

  return (
    <>
      <Card sx={{ border: '1px dashed rgba(0,0,0,0.3)' }}>
        <Stack sx={{ p: 3, pb: 2 }} textAlign="center" alignItems="center">
          <Iconify
            width={80}
            icon="mdi:office-building-plus-outline"
            color="rgba(0,0,0,0.6)"
            marginBottom={2}
          />

          <Button variant="contained" color="primary" onClick={onCreate}>
            Добавить объект
          </Button>
        </Stack>
      </Card>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onView();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover> */}
    </>
  );
}

ObjectItemCreate.propTypes = {
  onCreate: PropTypes.func,
};
