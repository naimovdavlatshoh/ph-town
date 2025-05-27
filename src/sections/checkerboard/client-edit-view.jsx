import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useGetProduct } from 'src/api/product';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ClientNewEditForm from './client-new-edit-form';

// ----------------------------------------------------------------------

export default function ClientEditView({ id }) {
  const settings = useSettingsContext();

  const { product: currentClient } = useGetProduct(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Редактирование клиента"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Клиент',
            href: paths.dashboard.clients.root,
          },
          { name: currentClient?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClientNewEditForm currentClient={currentClient} />
    </Container>
  );
}

ClientEditView.propTypes = {
  id: PropTypes.string,
};
