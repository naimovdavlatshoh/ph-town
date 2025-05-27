import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { ContractCreateView } from 'src/sections/contracts/view';

// ----------------------------------------------------------------------

export default function ContractCreatePage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Новый контракт</title>
      </Helmet>

      <ContractCreateView apartmentId={id} />
    </>
  );
}
