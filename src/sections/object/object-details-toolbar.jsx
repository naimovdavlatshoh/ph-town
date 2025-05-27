import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ObjectDetailsToolbar({
  publish,
  backLink,
  editLink,
  onEdit,
  liveLink,
  publishOptions,
  onChangePublish,
  sx,
  ...other
}) {
  const popover = usePopover();
  const { user } = useAuthContext();

  return (
    <Stack
      spacing={1.5}
      direction="row"
      sx={{
        mb: { xs: 3, md: 5 },
        ...sx,
      }}
      {...other}
    >
      <Button
        component={RouterLink}
        href={backLink}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Назад
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      {publish === 'published' && (
        <Tooltip title="Go Live">
          <IconButton component={RouterLink} href={liveLink}>
            <Iconify icon="eva:external-link-fill" />
          </IconButton>
        </Tooltip>
      )}

      {['1', '2'].includes(user?.role) && (
        <Tooltip title="Редактировать">
          <IconButton onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

ObjectDetailsToolbar.propTypes = {
  backLink: PropTypes.string,
  editLink: PropTypes.string,
  liveLink: PropTypes.string,
  onChangePublish: PropTypes.func,
  onEdit: PropTypes.func,
  publish: PropTypes.string,
  publishOptions: PropTypes.array,
  sx: PropTypes.object,
};
