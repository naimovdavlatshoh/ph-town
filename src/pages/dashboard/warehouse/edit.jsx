import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { ArrivalEditView } from 'src/sections/warehouse/view';

// ----------------------------------------------------------------------

export default function ArrivalEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Редактирование прихода</title>
      </Helmet>

      <ArrivalEditView id={`${id}`} />
    </>
  );
}
