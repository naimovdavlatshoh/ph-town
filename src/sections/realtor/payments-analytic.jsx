import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber, fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function PaymentsAnalytic({ title, total, icon, iconSrc, color, percent, count }) {
  return (
    <Stack
      spacing={2.5}
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ width: 1, minWidth: 200 }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        {iconSrc ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={iconSrc} width="90%" style={{ color, position: 'absolute' }} />
        ) : (
          <Iconify icon={icon} width={32} sx={{ color, position: 'absolute' }} />
        )}

        <CircularProgress
          variant="determinate"
          value={percent}
          size={56}
          thickness={2}
          sx={{ color, opacity: 0.48 }}
        />

        <CircularProgress
          variant="determinate"
          value={100}
          size={56}
          thickness={3}
          sx={{
            top: 0,
            left: 0,
            opacity: 0.48,
            position: 'absolute',
            color: (theme) => alpha(theme.palette.grey[500], 0.16),
          }}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{title}</Typography>

        <Box component="span" sx={{ color: 'text.disabled', typography: 'caption' }}>
          {fNumber(total)}
        </Box>

        <Typography variant="caption">{count && `Операций: ${fCurrency(count)}`}</Typography>
      </Stack>
    </Stack>
  );
}

PaymentsAnalytic.propTypes = {
  color: PropTypes.string,
  iconSrc: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  percent: PropTypes.number,
  count: PropTypes.number,
  title: PropTypes.string,
  total: PropTypes.number,
};
