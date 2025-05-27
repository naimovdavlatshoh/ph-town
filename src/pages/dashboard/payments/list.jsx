import { Helmet } from 'react-helmet-async';

import { PaymentsListView } from 'src/sections/payments/view';

// ----------------------------------------------------------------------

export default function PaymentListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список оплат</title>
      </Helmet>

      <PaymentsListView />
    </>
  );
}
