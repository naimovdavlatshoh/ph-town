import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useGetContractInfo } from 'src/api/contract';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ArrivalNewEditForm from '../arrival-new-edit-form';

// ----------------------------------------------------------------------

export default function ArrivalEditView({ id }) {
  const settings = useSettingsContext();

  const { contract } = useGetContractInfo(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Редактирование контракта"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Контракты',
            href: paths.dashboard.contracts.root,
          },
          { name: contract?.contract_number },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {contract && <ArrivalNewEditForm currentContract={contract} />}
    </Container>
  );
}

ArrivalEditView.propTypes = {
  id: PropTypes.string,
};
