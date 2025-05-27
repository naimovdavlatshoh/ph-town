import { Helmet } from 'react-helmet-async';

import { ArrivalListView } from 'src/sections/warehouse/view';

// ----------------------------------------------------------------------

export default function WarehouseListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Склад</title>
      </Helmet>

      <ArrivalListView />
    </>
  );
}
