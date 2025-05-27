import { Helmet } from 'react-helmet-async';

import ContragentListView from 'src/sections/contragents/contragents-list-view';

// ----------------------------------------------------------------------

export default function ContragentListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список контрагентов</title>
      </Helmet>

      <ContragentListView />
    </>
  );
}
