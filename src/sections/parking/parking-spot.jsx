import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// stock_status: 1 = свободно, 2 = продано
const STATUS = {
  1: { color: '#16a34a', tint: 'rgba(34,197,94,0.14)', icon: 'mdi:parking', label: 'свободно' },
  2: { color: '#dc2626', tint: 'rgba(239,68,68,0.14)', icon: 'mdi:car', label: 'продано' },
};

function formatUZS(value) {
  if (!value) return '';
  return `${Number(value).toLocaleString('ru-RU')} сум`;
}

function formatUSD(value) {
  if (!value) return '';
  return `${Number(value).toLocaleString('ru-RU')} $`;
}

const ParkingSpot = ({ spot }) => {
  const status = Number(spot?.stock_status);
  const s = STATUS[status] || { color: '#9ca3af', tint: 'rgba(148,163,184,0.18)', icon: 'mdi:parking', label: '' };
  const isSold = status === 2;
  const isFiltered = spot?.isFiltered;

  const tooltipContent = (
    <Stack spacing={0.3}>
      <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12 }}>
        Место {spot?.spot_number}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {spot?.stock_status_text || s.label}
      </Typography>
      {spot?.price_usd && (
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          {formatUSD(spot?.price_usd)}
          {spot?.price_uzs ? ` · ${formatUZS(spot?.price_uzs)}` : ''}
        </Typography>
      )}
    </Stack>
  );

  if (isFiltered) {
    return (
      <Box
        sx={{
          width: 26,
          height: 34,
          borderRadius: '4px',
          bgcolor: s.tint,
          border: '1px dashed',
          borderColor: s.color,
          opacity: 0.35,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Box
        sx={{
          position: 'relative',
          width: 50,
          height: 66,
          flexShrink: 0,
          borderRadius: '3px 3px 6px 6px',
          bgcolor: s.tint,
          // «Разметка»: белые боковые линии + верхняя, низ открыт (въезд)
          borderTop: `3px solid ${s.color}`,
          borderLeft: `3px solid ${s.color}`,
          borderRight: `3px solid ${s.color}`,
          borderBottom: '3px solid transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          cursor: 'default',
          transition: 'all 0.18s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 14px ${s.tint}`,
            zIndex: 2,
          },
        }}
      >
        <Iconify icon={s.icon} width={isSold ? 26 : 22} sx={{ color: s.color }} />
        <Typography
          sx={{
            fontSize: 9.5,
            fontWeight: 800,
            lineHeight: 1,
            color: s.color,
            letterSpacing: '0.02em',
            maxWidth: '100%',
            px: 0.25,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {spot?.spot_number}
        </Typography>
      </Box>
    </Tooltip>
  );
};

ParkingSpot.propTypes = {
  spot: PropTypes.object,
};

export default ParkingSpot;
