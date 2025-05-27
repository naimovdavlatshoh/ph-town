import { Helmet } from 'react-helmet-async';

import OverdueListView from 'src/sections/overdue/view/overdue-list-view';

// ----------------------------------------------------------------------

export default function ContractListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список контрактов</title>
      </Helmet>

      <OverdueListView />
    </>
  );
}
