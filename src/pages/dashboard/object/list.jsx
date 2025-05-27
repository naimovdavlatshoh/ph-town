import { Helmet } from 'react-helmet-async';

import ObjectListView from 'src/sections/object/object-list-view';

// ----------------------------------------------------------------------

export default function JobListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список объектов</title>
      </Helmet>

      <ObjectListView />
    </>
  );
}
