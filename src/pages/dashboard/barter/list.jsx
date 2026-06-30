import { Helmet } from 'react-helmet-async';

import BarterListView from 'src/sections/barter/view/barter-list-view';

// ----------------------------------------------------------------------

export default function BarterListPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Контракты - Бартер</title>
      </Helmet>

      <BarterListView />
    </>
  );
}
