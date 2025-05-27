import { Helmet } from 'react-helmet-async';

import CheckerboardView from 'src/sections/checkerboard/checkerboard-view';

// ----------------------------------------------------------------------

export default function ClientsListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Шахматка</title>
      </Helmet>

      <CheckerboardView />
    </>
  );
}
