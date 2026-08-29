import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useGetParkingBoard } from 'src/api/parking';

import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import ParkingGrid from './parking-grid';

// ----------------------------------------------------------------------

// stock_status: 1 = свободно, 2 = продано
const STATUS_OPTIONS = [
  { value: 1, label: 'Свободно', color: '#16a34a', icon: 'mdi:parking' },
  { value: 2, label: 'Продано', color: '#dc2626', icon: 'mdi:car' },
];

// ----------------------------------------------------------------------

export default function ParkingBoardView({ objectId }) {
  const [statusFilter, setStatusFilter] = useState(null);

  const { board, boardLoading } = useGetParkingBoard(objectId);

  const handleClear = useCallback(() => setStatusFilter(null), []);

  return boardLoading ? (
    <LoadingScreen title="Загружается шахматка-парковка..." />
  ) : (
    <Container maxWidth="100%" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ padding: 3 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          {/* Status */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
            >
              Статус:
            </Typography>
            <Stack direction="row" gap={0.75}>
              {STATUS_OPTIONS.map(({ value, label, color, icon }) => {
                const selected = statusFilter === value;
                return (
                  <Stack
                    key={value}
                    direction="row"
                    alignItems="center"
                    gap={0.5}
                    onClick={() => setStatusFilter(selected ? null : value)}
                    sx={{
                      px: 1,
                      height: 30,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color,
                      border: '1.5px solid',
                      borderColor: color,
                      bgcolor: selected ? color : 'transparent',
                      opacity: selected || statusFilter === null ? 1 : 0.4,
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: selected ? color : `${color}22` },
                      '& *': { color: selected ? '#fff !important' : `${color} !important` },
                    }}
                  >
                    <Iconify icon={icon} width={16} />
                    <Typography variant="caption" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                      {label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>

          {statusFilter !== null && (
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

        <ParkingGrid board={board} statusFilter={statusFilter} />
      </Card>
    </Container>
  );
}

ParkingBoardView.propTypes = {
  objectId: PropTypes.string,
};
