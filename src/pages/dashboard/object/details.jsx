import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import ObjectDetailsView from 'src/sections/object/object-details-view';

// ----------------------------------------------------------------------

export default function ObjectDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Объект</title>
      </Helmet>

      <ObjectDetailsView id={`${id}`} />
    </>
  );
}
