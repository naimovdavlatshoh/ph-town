import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import ClientEditView from 'src/sections/client/client-edit-view';

// ----------------------------------------------------------------------

export default function ProductEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Редактирование клиента</title>
      </Helmet>

      <ClientEditView id={`${id}`} />
    </>
  );
}
