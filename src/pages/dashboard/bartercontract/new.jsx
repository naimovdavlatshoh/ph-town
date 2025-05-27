import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

// import { ContractCreateView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

export default function BarterContractCreatePage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Новый контракт</title>
      </Helmet>

      {/* <InvoiceCreateView apartmentId={id} /> */}
    </>
  );
}
