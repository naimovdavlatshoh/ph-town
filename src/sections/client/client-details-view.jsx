import PropTypes from 'prop-types';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import { useGetClientDetails } from 'src/api/clients';

import { useSettingsContext } from 'src/components/settings';

import ClientDetailsInfo from './client-details-info';
import ClientDetailsToolbar from './client-details-toolbar';
// import OrderDetailsItems from '../order-details-item';
// import OrderDetailsHistory from '../order-details-history';

// ----------------------------------------------------------------------

export default function ClientDetailsView({ id }) {
  const settings = useSettingsContext();

  const { client } = useGetClientDetails(id);

  // const currentOrder = _orders.filter((order) => order.id === id)[0];

  // const [status, setStatus] = useState(currentOrder.status);

  // const handleChangeStatus = useCallback((newValue) => {
  //   setStatus(newValue);
  // }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <ClientDetailsToolbar
        backLink={paths.dashboard.clients.root}
        orderNumber={client?.client_type === '0' ? client?.client_name : client?.business_name}
        createdAt={client?.created_at}
        entityType={client?.client_type}
        clientId={client?.client_id}
      />

      <Grid container spacing={3}>
        <Grid xs={12}>
          <ClientDetailsInfo data={client} />
        </Grid>
      </Grid>
    </Container>
  );
}

ClientDetailsView.propTypes = {
  id: PropTypes.string,
};
