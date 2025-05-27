import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import {
  Box,
  Stack,
  Button,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';

function CheckerboardStatusbar({ type, setType, openFilter }) {
  const lgUp = useResponsive('up', 'lg');
  const mdDown = useResponsive('down', 'md');

  const handleType = useCallback((event, newType) => {
    if (newType !== null) {
      setType(newType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack
      mb={3}
      direction={mdDown ? 'column' : 'row'}
      alignItems="center"
      justifyContent="space-between"
      gap={2}
    >
      {/* <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="caption">Кол-во найденных помещений: </Typography>
        <Box
          sx={{
            padding: 0.2,
            backgroundColor: 'rgba(0,0,0,0.1)',
            fontSize: 12,
            borderRadius: '2px',
          }}
        >
          23
        </Box>
      </Stack> */}

      <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center">
        {!lgUp && (
          <IconButton onClick={openFilter}>
            <Iconify icon="mi:filter" mr={0.5} />
          </IconButton>
        )}
        <ToggleButtonGroup exclusive value={type} size="small" onChange={handleType}>
          <ToggleButton color="primary" value="checkerboard">
            <Iconify icon="bxs:chess" mr={0.5} />
            {mdDown ? '' : ' Шахматка'}
          </ToggleButton>

          <ToggleButton color="primary" value="visual">
            <Iconify icon="lets-icons:3d-box" mr={0.5} />{' '}
            {mdDown ? '' : ' Визуальное представление'}
          </ToggleButton>
          <Link
            to="https://vr.ph.town/"
            target="_blank"
            rel="noopener"
            underline="none"
            sx={{ ml: 1 }}
          >
            <Button variant="contained" color="success" size="small" sx={{ height: 1 }}>
              360 Tour
            </Button>
          </Link>
        </ToggleButtonGroup>
      </Stack>

      <Stack direction="row" alignItems="center" gap={2}>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              backgroundColor: '#4caf50',
              borderRadius: '50%',
            }}
          />
          <Typography variant="caption">Свободно</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              backgroundColor: '#ff5722',
              borderRadius: '50%',
            }}
          />
          <Typography variant="caption">Продано</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              backgroundColor: '#ff9800',
              borderRadius: '50%',
            }}
          />
          <Typography variant="caption">Забронировано</Typography>
        </Stack>

        {/* <Stack direction="row" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              backgroundColor: '#9e9e9e',
              borderRadius: '50%',
            }}
          />
          <Typography variant="caption">Не продается</Typography>
        </Stack> */}
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
