import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { ContractEditView } from 'src/sections/contracts/view';

// ----------------------------------------------------------------------

export default function ContractEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Редактирование контракта</title>
      </Helmet>

      <ContractEditView id={`${id}`} />
    </>
  );
}
