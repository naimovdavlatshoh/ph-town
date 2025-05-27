import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { ArrivalCreateView } from 'src/sections/warehouse/view';

// ----------------------------------------------------------------------

export default function ArrivalCreatePage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Новый приход</title>
      </Helmet>

      <ArrivalCreateView apartmentId={id} />
    </>
  );
}
