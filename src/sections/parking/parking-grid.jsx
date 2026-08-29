import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import EmptyContent from 'src/components/empty-content/empty-content';

import ParkingSpot from './parking-spot';

// ----------------------------------------------------------------------

const ParkingGrid = ({ board, statusFilter }) => {
  const normalized = useMemo(
    () =>
      (board || []).map((block) => ({
        ...block,
        floors: [...(block.floors || [])]
          .sort((a, b) => Number(b.floor_number) - Number(a.floor_number))
          .map((floor) => ({
            ...floor,
            spots: (floor.spots || []).map((spot) => ({
              ...spot,
              isFiltered: statusFilter ? Number(spot.stock_status) !== statusFilter : false,
            })),
          })),
      })),
    [board, statusFilter]
  );

  if (!normalized.length) {
    return <EmptyContent title="Парковка пуста" description="Добавьте блоки и места парковки" />;
  }

  return (
    <Stack
      direction="row"
      gap={4}
      sx={{
        overflowX: 'auto',
        pb: 2,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-track': { borderRadius: 3, bgcolor: 'grey.200' },
        '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'grey.400' },
      }}
    >
      {normalized.map((block) => (
        <Box
          key={block.parking_block_id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Block header */}
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: 'primary.main',
              borderBottom: '1px solid',
              borderColor: 'primary.dark',
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: 'primary.contrastText', letterSpacing: '0.04em' }}
            >
              {block.block_name}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5 }}>
            <Stack gap={0.5}>
              {block.floors.map((floor) => (
                <Stack
                  key={floor.parking_floor_id}
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                >
                  {/* Floor number label */}
                  <Box
                    sx={{
                      width: 36,
                      minWidth: 36,
                      height: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pr: 1,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', lineHeight: 1 }}
                    >
                      {Number(floor.floor_number) < 0 ? `П${Math.abs(floor.floor_number)}` : floor.floor_number}
                    </Typography>
                  </Box>

                  {/* Spots row — «лента» парковочной полосы */}
                  <Stack
                    direction="row"
                    gap={0.5}
                    flexWrap="nowrap"
                    alignItems="flex-end"
                    sx={{
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      px: 0.75,
                      pt: 0.75,
                      pb: 0.5,
                      borderBottom: '2px dashed',
                      borderColor: 'grey.400',
                    }}
                  >
                    {floor.spots.length ? (
                      floor.spots.map((spot) => (
                        <ParkingSpot key={spot.parking_spot_id} spot={spot} />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ px: 1, py: 2 }}>
                        нет мест
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

ParkingGrid.propTypes = {
  board: PropTypes.array,
  statusFilter: PropTypes.number,
};

export default ParkingGrid;
