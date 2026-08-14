import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';
import { useGetContractInfo } from 'src/api/contract';

import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ContractApartmentDetails from '../contract-apartment-details';

// ----------------------------------------------------------------------

export default function ContractDetailsView({ id }) {
  const settings = useSettingsContext();

  const { contract, refresh } = useGetContractInfo(id);

  const currentInvoice = _invoices.filter(
    (invoice) => invoice.id === 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1'
  )[0];

  // Состояние контракта в том же порядке приоритетов, что и в списке (getStatusConfig):
  // Удален -> Расторгнут -> В процессе -> Подтвержден.
  const getStatusLabel = () => {
    if (contract?.is_active === '0') return { color: 'default', label: 'Удален' };
    if (contract?.is_terminated === '1') return { color: 'error', label: 'Расторгнут' };
    if (contract?.contract_status === '1') return { color: 'warning', label: 'В процессе' };
    if (contract?.contract_status === '2') return { color: 'success', label: 'Подтвержден' };
    return { color: 'default', label: '' };
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={contract?.contract_number}
        status={() => {
          const status = getStatusLabel();
          return (
            <Label variant="soft" color={status.color}>
              {status.label}
            </Label>
          );
        }}
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

      <ContractApartmentDetails invoice={currentInvoice} contract={contract} refresh={refresh} />
    </Container>
  );
}

ContractDetailsView.propTypes = {
  id: PropTypes.string,
};
