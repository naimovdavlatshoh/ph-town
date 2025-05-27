import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import BlockDetailsView from 'src/sections/blocks/block-details-view';

// ----------------------------------------------------------------------

export default function ObjectDetailsPage() {
  const params = useParams();

  const { blockId, projectId } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Блок</title>
      </Helmet>

      <BlockDetailsView id={blockId} projectId={projectId} />
    </>
  );
}
