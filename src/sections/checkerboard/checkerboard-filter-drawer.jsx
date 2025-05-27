import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { paper } from 'src/theme/css';

import Scrollbar from 'src/components/scrollbar';

import CheckerboardFilterSidebar from './checkboard-filter-sidebar';

// ----------------------------------------------------------------------

export default function CheckerBoardFilterDrawer({ filterSetting, filterOptions }) {
  const theme = useTheme();

  const labelStyles = {
    mb: 1.5,
    color: 'text.disabled',
    fontWeight: 'fontWeightSemiBold',
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      {/* <Tooltip title="Reset">
        <IconButton onClick={settings.onReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={settings.onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton> */}
    </Stack>
  );

  return (
    <Drawer
      anchor="left"
      open={filterSetting.value}
      onClose={filterSetting.onFalse}
      slotProps={{
        backdrop: { invisible: true },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 280,
        },
        zIndex: 99999,
      }}
    >
      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          <CheckerboardFilterSidebar {...filterOptions} />
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}

CheckerBoardFilterDrawer.propTypes = {
  filterSetting: PropTypes.object,
  filterOptions: PropTypes.object,
};
