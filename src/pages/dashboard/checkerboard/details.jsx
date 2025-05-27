import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import ClientDetailView from 'src/sections/client/client-details-view';

// ----------------------------------------------------------------------

export default function ProductDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Детали </title>
      </Helmet>

      <ClientDetailView id={`${id}`} />
    </>
  );
}
