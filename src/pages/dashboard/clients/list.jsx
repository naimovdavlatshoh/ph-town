import { Helmet } from 'react-helmet-async';

import ClientListView from 'src/sections/client/client-list-view';

// ----------------------------------------------------------------------

export default function ClientsListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список клиентов</title>
      </Helmet>

      <ClientListView />
    </>
  );
}
