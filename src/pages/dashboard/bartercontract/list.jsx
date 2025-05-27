import { Helmet } from 'react-helmet-async';
import BarterContractListView from 'src/sections/bartercontracts/view/bartercontract-list-view';

// ----------------------------------------------------------------------

export default function BarterContractListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Список Бартер контрактов</title>
      </Helmet>

      <BarterContractListView />
    </>
  );
}
