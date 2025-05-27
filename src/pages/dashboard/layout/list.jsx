import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import LayoutListView from 'src/sections/layout/layout-list-view';

// ----------------------------------------------------------------------

export default function LayoutListPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Список планировок</title>
      </Helmet>

      <LayoutListView projectId={id} />
    </>
  );
}
