import { Helmet } from 'react-helmet-async';

import RealtorListView from 'src/sections/realtor/view/realtor-list-view';

// ----------------------------------------------------------------------

export default function RealtorPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Риэлторы</title>
      </Helmet>

      <RealtorListView />
    </>
  );
}
