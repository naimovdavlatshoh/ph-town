import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_LEGEND = [
  { color: '#22c55e', label: 'Свободно' },
  { color: '#ef4444', label: 'Продано' },
  { color: '#f59e0b', label: 'Забронировано' },
  { color: '#9ca3af', label: 'Не продаётся' },
];

function CheckerboardStatusbar({ type, setType, openFilter }) {
  const lgUp = useResponsive('up', 'lg');
  const mdDown = useResponsive('down', 'md');

  const handleType = useCallback((event, newType) => {
    if (newType !== null) setType(newType);
  }, [setType]);

  return (
    <Stack
      mb={3}
      direction={mdDown ? 'column' : 'row'}
      alignItems={mdDown ? 'flex-start' : 'center'}
      justifyContent="space-between"
      gap={2}
    >
      {/* Left: mode toggle + filter icon */}
      <Stack direction="row" alignItems="center" gap={1}>
        {!lgUp && (
          <IconButton size="small" onClick={openFilter} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Iconify icon="mi:filter" />
          </IconButton>
        )}

        <ToggleButtonGroup exclusive value={type} size="small" onChange={handleType}>
          <ToggleButton color="primary" value="checkerboard" sx={{ px: 1.5, gap: 0.5 }}>
            <Iconify icon="bxs:chess" width={16} />
            {!mdDown && 'Шахматка'}
          </ToggleButton>
          <ToggleButton color="primary" value="visual" sx={{ px: 1.5, gap: 0.5 }}>
            <Iconify icon="lets-icons:3d-box" width={16} />
            {!mdDown && 'Визуальное'}
          </ToggleButton>
        </ToggleButtonGroup>

        <Link to="https://vr.ph.town/" target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="success" size="small" sx={{ height: 32, px: 1.5 }}>
            360 Tour
          </Button>
        </Link>
      </Stack>

      {/* Right: status legend */}
      <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
        {STATUS_LEGEND.map(({ color, label }) => (
          <Stack key={label} direction="row" alignItems="center" gap={0.75}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '3px',
                bgcolor: color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export default CheckerboardStatusbar;

CheckerboardStatusbar.propTypes = {
  type: PropTypes.string,
  setType: PropTypes.func,
  openFilter: PropTypes.func,
};
