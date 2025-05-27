import * as React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Stack, Button, Tooltip, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGetEntrances } from 'src/api/entrance';

import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import EmptyContent from 'src/components/empty-content/empty-content';

import FloorsFromSection from './floors-from-section';
import EntranceNewEditForm from '../entrance/entrance-new-edit-form';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SectionTabs({ blockId, projectId }) {
  const [value, setValue] = React.useState(0);
  const { entrances, create, update, entrancesLoading, entrancesEmpty } = useGetEntrances(blockId);
  const { user } = useAuthContext();

  const newEntrance = useBoolean();
  const editEntrance = useBoolean();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (entrances?.length) {
      setValue(entrances[0].entrance_id);
    }
  }, [entrances]);

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange}>
            {entrances?.map((entrance, index) => (
              <Tab
                label={`Подъезд: ${entrance?.entrance_name}`}
                {...a11yProps(entrance?.entrance_id)}
                value={entrance?.entrance_id}
              />
            ))}
            {/* <Tab label="Секция 1" {...a11yProps(0)} />
          <Tab label="Секция 2" {...a11yProps(1)} />
          <Tab label="Секция 3" {...a11yProps(2)} /> */}
            {['1', '2'].includes(user?.role) && (
              <Stack
                sx={{ width: '100%', ml: 3 }}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  disabled={entrancesLoading}
                  onClick={newEntrance.onTrue}
                  sx={{ alignSelf: 'center' }}
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Подъезд
                </Button>
                {['1', '2'].includes(user?.role) && (
                  <>
                    {' '}
                    <Tooltip title="Редактировать подъезд" placement="top" arrow>
                      <IconButton color="inherit" onClick={editEntrance.onTrue}>
                        <Iconify color="#ffb017" icon="solar:pen-bold" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
            )}
          </Tabs>
        </Box>

        {entrancesLoading && <LoadingScreen />}
        {entrancesEmpty && <EmptyContent title="Нет подъездов" description="Добавьте подъезд" />}

        {entrances?.map((entrance, index) => (
          <CustomTabPanel value={value} index={entrance?.entrance_id}>
            <FloorsFromSection
              blockId={blockId}
              entracneId={entrance?.entrance_id}
              projectId={projectId}
            />
          </CustomTabPanel>
        ))}
      </Box>
      <EntranceNewEditForm
        blockId={blockId}
        open={newEntrance.value}
        onClose={newEntrance.onFalse}
        onCreate={create}
      />

      {editEntrance.value && (
        <EntranceNewEditForm
          blockId={blockId}
          // eslint-disable-next-line eqeqeq
          currentEntrance={entrances?.find((en) => en?.entrance_id == value)}
          open={editEntrance.value}
          onClose={editEntrance.onFalse}
          onUpdate={update}
        />
      )}
    </>
  );
}

SectionTabs.propTypes = {
  projectId: PropTypes.string,
  blockId: PropTypes.string,
};
