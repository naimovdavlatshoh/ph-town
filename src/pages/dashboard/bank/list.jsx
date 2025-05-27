import { Helmet } from 'react-helmet-async';

import KassaBankListView from 'src/sections/kassa-bank/view/kassa-bank-list-view';

// ----------------------------------------------------------------------

export default function BankPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Касса-Банк</title>
      </Helmet>

      <KassaBankListView />
    </>
  );
}
