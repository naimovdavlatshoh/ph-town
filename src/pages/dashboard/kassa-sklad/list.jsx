import { Helmet } from 'react-helmet-async';

import { KassaSkladListView } from 'src/sections/kassa-sklad/view';

// ----------------------------------------------------------------------

export default function PaymentListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Касса-Склад</title>
      </Helmet>

      <KassaSkladListView />
    </>
  );
}
