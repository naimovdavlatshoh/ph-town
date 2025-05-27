import PropTypes from 'prop-types';

import { Box, Stack } from '@mui/material';

import CheckerboardApartment from './checkerboard-apartment';

function isInRange(number, range) {
  return number >= Math.min(...range) && number <= Math.max(...range);
}

const CheckerboardFloor = ({
  floors,
  roomsCountFilter,
  roomsStatusFilter,
  roomsPriceFilter,
  roomsAreaFilter,
  reserve,
  dereserve,
}) => {
  const handleOpenDrawer = () => {};

  return (
    <Stack gap={1}>
      {floors?.map((f) => (
        <Stack key={f.floor_id} gap={1} direction="row" alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
            }}
          >
            {f?.floor_number}
          </Box>
          {f?.apartments?.map((apartment) => (
            <CheckerboardApartment
              key={apartment?.apartment_id}
              apartment={apartment}
              reserve={reserve}
              dereserve={dereserve}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

CheckerboardFloor.propTypes = {
  floors: PropTypes.object,
  roomsCountFilter: PropTypes.string,
  roomsStatusFilter: PropTypes.string,
  roomsPriceFilter: PropTypes.string,
  roomsAreaFilter: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};

export default CheckerboardFloor;
