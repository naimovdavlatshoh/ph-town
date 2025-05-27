import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton, { listItemButtonClasses } from '@mui/material/ListItemButton';

import { useDebounce } from 'src/hooks/use-debounce';

import { useGetClients, useSearchClients } from 'src/api/clients';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function ClientListDialog({
  title = 'Address Book',
  list,
  action,
  //
  open,
  onClose,
  //
  selected,
  onSelect,
}) {
  const [clientTerm, setClientTerm] = useState('');
  const [clientTermHelper, setClientTermHelper] = useState('');
  const debouncedQuery = useDebounce(clientTerm, 3);
  const { searchClient, clients } = useGetClients();
  const { searchResults, searchLoading } = useSearchClients(debouncedQuery);

  const notFound = clientTerm?.length >= 3 ? searchResults?.length : clients?.length;

  const handleSearchClient = useCallback((event) => {
    setClientTerm(event.target.value);
    setClientTermHelper(event.target.value);
  }, []);

  const handleSelectClient = useCallback(
    (address) => {
      onSelect(address);
      onClose();
    },
    [onClose, onSelect]
  );

  const renderList = (
    <Stack
      spacing={0.5}
      sx={{
        p: 0.5,
        maxHeight: 80 * 8,
        overflowX: 'hidden',
      }}
    >
      {(clientTerm?.length >= 3 ? searchResults : clients).map((client) => (
        <Stack
          key={client.client_id}
          spacing={0.5}
          component={ListItemButton}
          selected={selected(`${client.client_id}`)}
          onClick={() => handleSelectClient(client)}
          sx={{
            py: 1,
            px: 1.5,
            borderRadius: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            [`&.${listItemButtonClasses.selected}`]: {
              bgcolor: 'action.selected',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            },
          }}
        >
          <Stack
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="subtitle2">
              {client?.client_type === '1'
                ? `${client?.business_director_name} - "${client?.business_name}"`
                : `${client?.client_surname || ''} ${client?.client_name || ''} ${
                    client?.client_fathername || ''
                  }`}
            </Typography>

            {client.client_type === '1' ? (
              <Label color="info">Юр.лицо</Label>
            ) : (
              <Label color="warning">Физ.лицо</Label>
            )}
          </Stack>

          {client?.client_type === '1' ? (
            <Box sx={{ color: 'primary.main', typography: 'caption' }}>
              {`ИНН: ${client?.business_inn}, МФО: ${client?.business_mfo}`}
            </Box>
          ) : (
            <Box sx={{ color: 'primary.main', typography: 'caption' }}>
              {`Паспорт: ${client?.passport_series}. ПИНФЛ: ${client?.pinfl}`}
            </Box>
          )}

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {client?.address}
          </Typography>

          {client?.phone_option && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {client?.phone_option?.phone_number}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 3, pr: 1.5 }}
      >
        <Typography variant="h6"> {title} </Typography>

        {action && action}
      </Stack>

      <Stack sx={{ p: 2, pt: 0 }}>
        <TextField
          value={clientTerm}
          onChange={handleSearchClient}
          placeholder="Найти..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {!notFound ? <SearchNotFound query={clientTerm} sx={{ px: 3, pt: 5, pb: 10 }} /> : renderList}
      {searchLoading && (
        <LoadingScreen
          title={`Поиск по запросу "${clientTerm}"`}
          sx={{
            background: '#fff',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 999999,
          }}
        />
      )}
    </Dialog>
  );
}

ClientListDialog.propTypes = {
  action: PropTypes.node,
  list: PropTypes.array,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.func,
  title: PropTypes.string,
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
