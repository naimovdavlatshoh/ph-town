import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useGetCheckerboard } from 'src/api/checkerboard';

import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import Grid from './Grid-Test';
import VisualImageMapper from '../image-map/VisualIImageMapper';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '1', label: 'Свободно', color: '#22c55e' },
  { value: '2', label: 'Забронировано', color: '#f59e0b' },
  { value: '3', label: 'Продано', color: '#ef4444' },
];

// ----------------------------------------------------------------------

export default function CheckerboardView({ objectId }) {
  const [type, setType] = useState('checkerboard');
  const [roomsCountFilter, setRoomsCountFilter] = useState(null);
  const [roomsStatusFilter, setRoomsStatusFilter] = useState(null);

  const { checkerboard, reserve, dereserve, checkerboardLoading } = useGetCheckerboard(objectId);

  const [roomsPriceFilter, setRoomsPriceFilter] = useState([0, 99999999]);

  useEffect(() => {
    if (checkerboard) {
      setRoomsPriceFilter([
        Number(checkerboard?.min_price_apartment),
        Number(checkerboard?.max_price_apartment),
      ]);
    }
  }, [checkerboard]);

  const priceMin = Number(checkerboard?.min_price_apartment) || 0;
  const priceMax = Number(checkerboard?.max_price_apartment) || 99999999;

  const hasFilter = roomsCountFilter !== null || roomsStatusFilter !== null;

  const handleClear = useCallback(() => {
    setRoomsCountFilter(null);
    setRoomsStatusFilter(null);
    setRoomsPriceFilter([priceMin, priceMax]);
  }, [priceMin, priceMax]);

  return checkerboardLoading ? (
    <LoadingScreen title="Загружается шахматка..." />
  ) : (
    <Container maxWidth="100%" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ padding: 3 }}>

        {/* ── Single toolbar: filters + mode toggle ── */}
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >
          {/* Rooms count */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              Комнат:
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={roomsCountFilter}
              onChange={(_, v) => setRoomsCountFilter(v)}
            >
              {['1', '2', '3', '4', '5'].map((n) => (
                <ToggleButton
                  key={n}
                  value={n}
                  color="primary"
                  sx={{
                    width: 34,
                    height: 34,
                    fontWeight: 700,
                    fontSize: 13,
                    borderRadius: '8px !important',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* Status */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              Статус:
            </Typography>
            <Stack direction="row" gap={0.75}>
              {STATUS_OPTIONS.map(({ value, label, color }) => {
                const selected = roomsStatusFilter === value;
                return (
                  <Tooltip key={value} title={label} arrow>
                    <Box
                      onClick={() => setRoomsStatusFilter(selected ? null : value)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '7px',
                        bgcolor: color,
                        opacity: selected ? 1 : 0.28,
                        cursor: 'pointer',
                        outline: selected ? `2px solid ${color}` : '2px solid transparent',
                        outlineOffset: 2,
                        transition: 'all 0.15s ease',
                        '&:hover': { opacity: 0.85 },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* Mode toggle + 360 Tour */}
          <ToggleButtonGroup
            exclusive
            size="small"
            value={type}
            onChange={(_, v) => {
              if (v === '360tour') {
                window.open('https://vr.ph.town/', '_blank', 'noopener');
              } else if (v !== null) {
                setType(v);
              }
            }}
          >
            <ToggleButton color="primary" value="checkerboard" sx={{ px: 1.5, gap: 0.5, height: 34 }}>
              <Iconify icon="bxs:chess" width={16} />
              Шахматка
            </ToggleButton>
            <ToggleButton color="primary" value="visual" sx={{ px: 1.5, gap: 0.5, height: 34, display: 'none' }}>
              <Iconify icon="lets-icons:3d-box" width={16} />
              Визуальное
            </ToggleButton>
            <ToggleButton color="success" value="360tour" sx={{ px: 1.5, gap: 0.5, height: 34 }}>
              <Iconify icon="mdi:rotate-360" width={16} />
              360 Tour
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Clear — only when filter active */}
          {hasFilter && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button
                size="small"
                color="error"
                variant="soft"
                onClick={handleClear}
                startIcon={<Iconify icon="pajamas:clear-all" width={14} />}
                sx={{ height: 34, whiteSpace: 'nowrap' }}
              >
                Очистить
              </Button>
            </>
          )}
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* ── Content ── */}
        {type === 'checkerboard' ? (
          <Grid
            checkerboard={checkerboard}
            roomsCountFilter={roomsCountFilter}
            roomsStatusFilter={roomsStatusFilter}
            roomsPriceFilter={roomsPriceFilter}
            roomsAreaFilter={null}
            reserve={reserve}
            dereserve={dereserve}
          />
        ) : (
          <Stack overflow="auto" alignItems="center">
            <VisualImageMapper projectId={objectId} />
          </Stack>
        )}
      </Card>
    </Container>
  );
}

CheckerboardView.propTypes = {
  objectId: PropTypes.string,
};
