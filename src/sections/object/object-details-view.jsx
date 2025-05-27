import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import { Button } from '@mui/material';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetBlocks } from 'src/api/block';
import { useGetObjects } from 'src/api/object';
import { useAuthContext } from 'src/auth/hooks';
import { _jobs, JOB_PUBLISH_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import EmptyContent from 'src/components/empty-content/empty-content';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import BlockList from '../blocks/block-list';
import ObjectNewEditForm from './object-new-edit-form';
import ObjectDetailsToolbar from './object-details-toolbar';
import BlockNewEditForm from '../blocks/block-new-edit-form';

// ----------------------------------------------------------------------

export default function ObjectDetailsView({ id }) {
  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const { blocks, create, update: updateBlock, blocksEmpty, blocksLoading } = useGetBlocks(id);
  const { update: updateObject, objects } = useGetObjects();

  const currentObject = objects?.find((obj) => obj.project_id === id);

  const editObject = useBoolean();
  const newBlock = useBoolean();

  const currentJob = _jobs.filter((job) => job.id === id)[0];

  const [publish, setPublish] = useState(currentJob?.publish);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  return (
    <>
      {' '}
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <ObjectDetailsToolbar
          backLink={paths.dashboard.object.root}
          // editLink={paths.dashboard.object.edit(`${currentJob?.id}`)}
          liveLink="#"
          onEdit={editObject.onTrue}
          publish={publish || ''}
          onChangePublish={handleChangePublish}
          publishOptions={JOB_PUBLISH_OPTIONS}
        />
        <CustomBreadcrumbs
          heading={currentObject?.project_name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Мои объекты',
              href: paths.dashboard.object.root,
            },
            { name: currentObject?.project_name },
          ]}
          actionGap={1}
          action={[
            <Button
              color="primary"
              variant="contained"
              startIcon={<Iconify icon="file-icons:sketchup-layout" />}
              component={RouterLink}
              href={paths.dashboard.layout.root(currentObject?.project_id)}
            >
              Планировки
            </Button>,

            ['1', '2'].includes(user?.role) && (
              <Button
                onClick={newBlock.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Новый блок
              </Button>
            ),
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {blocksLoading && <LoadingScreen />}
        {blocksEmpty && <EmptyContent title="Объект пуст" />}
        <BlockList blocks={blocks} />
      </Container>
      {currentObject && (
        <ObjectNewEditForm
          open={editObject.value}
          onClose={editObject.onFalse}
          currentObject={currentObject}
          onUpdate={updateObject}
        />
      )}
      <BlockNewEditForm
        projectId={id}
        open={newBlock.value}
        onClose={newBlock.onFalse}
        onUpdate={updateBlock}
        onCreate={create}
      />
    </>
  );
}

ObjectDetailsView.propTypes = {
  id: PropTypes.string,
};
