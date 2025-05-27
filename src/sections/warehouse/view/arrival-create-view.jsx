import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ArrivalNewEditForm from '../arrival-new-edit-form';

// ----------------------------------------------------------------------

export default function ArrivalCreateView({ apartmentId }) {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Новый контракт"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Контракты',
            href: paths.dashboard.contracts.root,
          },
          { name: 'Новый контракт' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ArrivalNewEditForm apartmentId={apartmentId} />
    </Container>
  );
}

ArrivalCreateView.propTypes = {
  apartmentId: PropTypes.string,
};
