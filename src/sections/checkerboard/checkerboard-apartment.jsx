import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { getDisabledStatusColor } from 'src/utils/apartment-status';

import Iconify from 'src/components/iconify';

import CheckerboardRoomDetails from './checkerboard-room-details';

// formatUZS: разбиваем на группы и добавляем "сум"
function formatUZS(value) {
  if (!value) return '';
  return `${Number(value).toLocaleString('ru-RU')} сум`;
}

// ----------------------------------------------------------------------

const STATUS_BG = {
  '1': { bg: '#22c55e', shadow: 'rgba(34,197,94,0.4)' },
  '2': { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.4)' },
  '3': { bg: '#ef4444', shadow: 'rgba(239,68,68,0.4)' },
  '4': { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.4)' },
  '5': { bg: '#9ca3af', shadow: 'rgba(156,163,175,0.4)' },
};

const CheckerboardApartment = ({ apartment, reserve, dereserve }) => {
  const [selectedRoom, setSelectRoom] = useState();
  const details = useBoolean();

  const isFiltered =
    !apartment?.isFilterRoom ||
    !apartment?.isFilterRoomStatus ||
    !apartment?.isFilterRoomPrice ||
    !apartment?.isFilterRoomArea;

  const status = apartment?.stock_status;
  const colors = STATUS_BG[status] || { bg: '#9ca3af', shadow: 'rgba(0,0,0,0.2)' };

  const handleOpen = () => {
    if (isFiltered) return;
    setSelectRoom(apartment.apartment_id);
    details.onTrue();
  };

  const isSold = status === '3';

  const tooltipContent = !isFiltered ? (
    <Stack spacing={0.3}>
      <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12 }}>
        {apartment?.apartment_name}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {apartment?.apartment_area} м² · {apartment?.rooms_number}-комн.
      </Typography>
      {!isSold && apartment?.uzs_full_price && (
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          {formatUZS(apartment?.uzs_full_price)}
        </Typography>
      )}
    </Stack>
  ) : '';

  return (
    <>
      <Tooltip title={tooltipContent} arrow placement="top" disableHoverListener={isFiltered}>
        <Box
          onClick={handleOpen}
          sx={{
            position: 'relative',
            width: isFiltered ? 28 : 52,
            height: isFiltered ? 28 : 52,
            borderRadius: isFiltered ? '6px' : '10px',
            background: isFiltered
              ? getDisabledStatusColor(status)
              : colors.bg,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isFiltered ? 'default' : 'pointer',
            opacity: isFiltered ? 0.22 : 1,
            transition: 'all 0.18s ease',
            flexShrink: 0,
            '&:hover': isFiltered
              ? {}
              : {
                  transform: 'scale(1.12)',
                  boxShadow: `0 6px 16px ${colors.shadow}`,
                  zIndex: 2,
                },
          }}
        >
          {!isFiltered && (
            <>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: '#fff',
                }}
              >
                {apartment?.rooms_number}
              </Typography>
              <Typography
                sx={{
                  fontSize: 8.5,
                  lineHeight: 1.3,
                  color: 'rgba(255,255,255,0.88)',
                  letterSpacing: '0.01em',
                }}
              >
                {apartment?.apartment_name}
              </Typography>
            </>
          )}

          {status === '4' && !isFiltered && (
            <Iconify
              icon="mingcute:time-fill"
              sx={{
                position: 'absolute',
                top: 2,
                right: 3,
                width: 11,
                height: 11,
                color: 'rgba(255,255,255,0.9)',
              }}
            />
          )}
        </Box>
      </Tooltip>

      {selectedRoom && (
        <CheckerboardRoomDetails
          reserve={reserve}
          dereserve={dereserve}
          open={details.value}
          onClose={() => {
            setSelectRoom(null);
            details.onFalse();
          }}
          onDelete={details.onFalse}
          roomId={selectedRoom}
        />
      )}
    </>
  );
};

CheckerboardApartment.propTypes = {
  apartment: PropTypes.object,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};

export default CheckerboardApartment;
