import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetBlocks } from 'src/api/block';
import { useGetObjects } from 'src/api/object';
import { _jobs, JOB_PUBLISH_OPTIONS } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import SectionTabs from '../room/section-tabs';
import BlockNewEditForm from './block-new-edit-form';
import ObjectDetailsToolbar from './block-details-toolbar';

// ----------------------------------------------------------------------

export default function BlockDetailsView({ id, projectId }) {
  const { objects } = useGetObjects();
  const { blocks, update } = useGetBlocks(projectId);

  const currentBlock = blocks?.find((block) => block.block_id === id);
  const currentObject = objects?.find((object) => object.project_id === projectId);
  const settings = useSettingsContext();

  const editBlock = useBoolean();

  const currentJob = _jobs.filter((job) => job.id === id)[0];

  const [publish, setPublish] = useState(currentJob?.publish);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <ObjectDetailsToolbar
          backLink={paths.dashboard.object.details(projectId)}
          // editLink={paths.dashboard.object.edit(`${currentJob?.id}`)}
          liveLink="#"
          onEdit={editBlock.onTrue}
          publish={publish || ''}
          onChangePublish={handleChangePublish}
          publishOptions={JOB_PUBLISH_OPTIONS}
        />

        <CustomBreadcrumbs
          heading={currentBlock?.block_name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Мои объекты',
              href: paths.dashboard.object.root,
            },
            {
              name: currentObject?.project_name,
              href: paths.dashboard.object.details(projectId),
            },
            { name: currentBlock?.block_name },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <SectionTabs blockId={id} projectId={projectId} />
      </Container>
      {currentBlock && (
        <BlockNewEditForm
          open={editBlock.value}
          onClose={editBlock.onFalse}
          currentBlock={currentBlock}
          onUpdate={update}
        />
      )}
    </>
  );
}

BlockDetailsView.propTypes = {
  id: PropTypes.string,
  projectId: PropTypes.string,
};
