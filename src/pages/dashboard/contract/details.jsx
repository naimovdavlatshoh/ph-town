import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { ContractDetailsView } from 'src/sections/contracts/view';

// ----------------------------------------------------------------------

export default function ContractDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Детали контракта</title>
      </Helmet>
      <ContractDetailsView id={`${id}`} />
    </>
  );
}
