import { Helmet } from 'react-helmet-async';

import ClientCreateView from 'src/sections/client/client-create-view';

// ----------------------------------------------------------------------

export default function ClientCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Создание нового клиента</title>
      </Helmet>

      <ClientCreateView />
    </>
  );
}
