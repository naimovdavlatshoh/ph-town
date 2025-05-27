import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Divider, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { bgGradient } from 'src/theme/css';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function BlockItem({ title, total, icon, color = 'primary', sx, ...other }) {
  const theme = useTheme();

  return (
    <Stack
      alignItems="center"
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2),
        }),
        py: 2,
        borderRadius: 2,
        textAlign: 'center',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h3">{fShortenNumber(total)}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.64 }}>
        Блок А
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.64, pt: 2 }}>
        Квартир (3)
      </Typography>
      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack sx={{ pt: 3 }} textAlign="center" direction="row" justifyContent="space-between">
        <IconButton>
          <Iconify width={20} icon="basil:edit-outline" color="orange" />
        </IconButton>
        <IconButton>
          {' '}
          <Iconify width={20} icon="majesticons:delete-bin-line" color="red" />
        </IconButton>
      </Stack>
    </Stack>
  );
}

BlockItem.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.number,
};
