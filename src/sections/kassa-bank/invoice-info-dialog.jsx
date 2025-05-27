import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import ArrivalInfo from './arrival-info';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
    return `"${client?.business_name}". Директор: ${
      client?.business_director_name || 'Не заполнен'
    }`;
  }
  return '';
};

export default function InvoiceInfoDialog({ title = 'Информация ', open, onClose, data, loading }) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ position: 'relative' }}>
        <Stack spacing={2} pt={2}>
          <ArrivalInfo arrival={data} />
        </Stack>
        {loading && (
          <LoadingScreen
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 99999,
              background: '#fff',
            }}
            title="Загрузка данных..."
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={handleClose}>
          Отменить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

InvoiceInfoDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
  data: PropTypes.object,
  loading: PropTypes.bool,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (address) =>
        address.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        address.fullAddress.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        `${address.company}`.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
