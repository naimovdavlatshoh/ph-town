import { Helmet } from 'react-helmet-async';

import { ContractListView } from 'src/sections/contracts/view';

// ----------------------------------------------------------------------

export default function ContractListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список контрактов</title>
      </Helmet>

      <ContractListView />
    </>
  );
}
