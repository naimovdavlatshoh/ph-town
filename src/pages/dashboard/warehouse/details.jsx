import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { ArrivalDetailsView } from 'src/sections/warehouse/view';

// ----------------------------------------------------------------------

export default function ArrivalDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Детали </title>
      </Helmet>
      <ArrivalDetailsView id={`${id}`} />
    </>
  );
}
