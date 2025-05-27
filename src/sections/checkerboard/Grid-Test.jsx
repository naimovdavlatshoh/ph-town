import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import './Grid.css';
import CheckerboardFloor from './checkerboard-floor';

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
    <Stack gap={10}>
      {normalizeData?.map((b, idx) => (
        <Stack
          key={idx}
          gap={10}
          direction="row"
          justifyContent="space-between"
          sx={{
            overflowX: 'auto',
            pb: 10,
          }}
        >
          {b?.map((bl) => (
            <Stack gap={1} key={bl?.block_id} justifyContent="space-between">
              <Typography variant="subtitle1">{bl?.block_name}</Typography>
              <CheckerboardFloor
                floors={bl?.floors}
                roomsCountFilter={roomsCountFilter}
                roomsStatusFilter={roomsStatusFilter}
                roomsPriceFilter={roomsPriceFilter}
                roomsAreaFilter={roomsAreaFilter}
                reserve={reserve}
                dereserve={dereserve}
              />
            </Stack>
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
  roomsPriceFilter: PropTypes.string,
  roomsAreaFilter: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};

export default Grid;
