import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';
import { useGetContractInfo } from 'src/api/contract';

import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ArrivalApartmentDetails from '../arrival-apartment-details';

// ----------------------------------------------------------------------

export default function ArrivalDetailsView({ id }) {
  const settings = useSettingsContext();

  const { contract } = useGetContractInfo(id);

  const currentInvoice = _invoices.filter(
    (invoice) => invoice.id === 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1'
  )[0];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={contract?.contract_number}
        status={() => (
          <Label
            variant="soft"
            color={
              (contract?.contract_status === '2' && 'success') ||
              (contract?.contract_status === '1' && 'warning') ||
              (contract?.contract_status === '0' && 'error') ||
              'default'
            }
          >
            {(contract?.contract_status === '2' && 'Подписан') ||
              (contract?.contract_status === '1' && 'В процессе') ||
              (contract?.contract_status === '0' && 'Удален') ||
              ''}{' '}
          </Label>
        )}
        backLink={paths.dashboard.contracts.root}
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
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ArrivalApartmentDetails invoice={currentInvoice} contract={contract} />
    </Container>
  );
}

ArrivalDetailsView.propTypes = {
  id: PropTypes.string,
};
