import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import './Grid.css';
import CheckerboardFloor from './checkerboard-floor';

// ----------------------------------------------------------------------

function isInRange(number, range) {
  return number >= Math.min(...range) && number <= Math.max(...range);
}

const Grid = ({
  checkerboard,
  roomsCountFilter,
  roomsStatusFilter,
  roomsPriceFilter,
  roomsAreaFilter,
  reserve,
  dereserve,
}) => {
  const normalizeData = useMemo(() => {
    let data = [];

    if (checkerboard?.block) {
      data = checkerboard?.block?.map((b) =>
        b?.map((bl) => {
          const floors = [];
          const maxFloors = bl?.max_floors;

          // eslint-disable-next-line no-plusplus
          for (let i = 0; i <= maxFloors; i++) {
            const existFloor = bl?.entrance[0]?.floor[i];

            if (existFloor) {
              floors.push({
                ...existFloor,
                apartments: existFloor?.apartments.map((apartment) => ({
                  ...apartment,
                  isFilterRoom: roomsCountFilter
                    ? apartment.rooms_number === roomsCountFilter
                    : true,
                  isFilterRoomStatus: roomsStatusFilter
                    ? apartment.stock_status === roomsStatusFilter
                    : true,
                  isFilterRoomArea: roomsAreaFilter
                    ? apartment.apartment_area === roomsAreaFilter
                    : true,
                  isFilterRoomPrice: isInRange(apartment?.totalprice, roomsPriceFilter),
                })),
              });
            } else if (maxFloors > i) {
              floors.push({
                apartments: [],
                floor_number: i + 1,
                floor_type: '1',
              });
            }
          }

          return {
            ...bl,
            floors: floors.reverse(),
          };
        })
      );
    }

    return data;
  }, [checkerboard?.block, roomsAreaFilter, roomsCountFilter, roomsPriceFilter, roomsStatusFilter]);

  return (
    <Stack gap={6}>
      {normalizeData?.map((b, idx) => (
        <Stack
          key={idx}
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
          {b?.map((bl) => (
            <Box
              key={bl?.block_id}
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
                <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.contrastText', letterSpacing: '0.04em' }}>
                  {bl?.block_name}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5 }}>
                <CheckerboardFloor
                  floors={bl?.floors}
                  reserve={reserve}
                  dereserve={dereserve}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

Grid.propTypes = {
  checkerboard: PropTypes.object,
  roomsCountFilter: PropTypes.string,
  roomsStatusFilter: PropTypes.string,
  roomsPriceFilter: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  roomsAreaFilter: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};

export default Grid;
