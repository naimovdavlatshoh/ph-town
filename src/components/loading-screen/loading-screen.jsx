import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

export default function LoadingScreen({ title, sx, ...other }) {
  return (
    <Stack
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        ...sx,
      }}
      {...other}
    >
      {title && <Typography>{title}</Typography>}
      <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 360 }} />
    </Stack>
  );
}

LoadingScreen.propTypes = {
  sx: PropTypes.object,
  title: PropTypes.string,
};
