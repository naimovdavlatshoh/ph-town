import { Helmet } from 'react-helmet-async';
import StatisticView from 'src/sections/statistic/statistic-view';

// ----------------------------------------------------------------------

export default function ProductListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Product List</title>
      </Helmet>

      <StatisticView />
    </>
  );
}
