import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ClientDetailsToolbar({
  entityType,
  backLink,
  createdAt,
  orderNumber = 'Client Name',
  clientId,
}) {
  const popover = usePopover();

  const { user } = useAuthContext();

  return (
    <Stack
      spacing={3}
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Stack spacing={1} direction="row" alignItems="flex-start">
        <IconButton component={RouterLink} href={backLink}>
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Stack spacing={0.5}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Typography variant="h4"> Клиент: {orderNumber} </Typography>
            <Label variant="soft" color={(entityType === '0' && 'success') || 'default'}>
              {entityType === '0' ? 'Физическое лицо' : 'Юридическое лицо'}
            </Label>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {fDateTime(createdAt)}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        flexGrow={1}
        spacing={1.5}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
      >
        {['1', '2'].includes(user?.role) && (
          <Button
            component={RouterLink}
            href={paths.dashboard.clients.edit(clientId)}
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Изменить
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

ClientDetailsToolbar.propTypes = {
  backLink: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  orderNumber: PropTypes.string,
  entityType: PropTypes.string,
  clientId: PropTypes.string,
};
