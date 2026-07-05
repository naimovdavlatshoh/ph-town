import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CheckerboardApartment from './checkerboard-apartment';

// ----------------------------------------------------------------------

const CheckerboardFloor = ({ floors, reserve, dereserve }) => (
  <Stack gap={0.5}>
    {floors?.map((f) => (
      <Stack key={f.floor_id || f.floor_number} direction="row" alignItems="center" gap={0.5}>
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
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: 'text.disabled',
              lineHeight: 1,
            }}
          >
            {f?.floor_number === '-1' ? 'П' : f?.floor_number}
          </Typography>
        </Box>

        {/* Apartments row */}
        <Stack direction="row" gap={0.4} flexWrap="nowrap" alignItems="center">
          {f?.apartments?.map((apartment) => (
            <CheckerboardApartment
              key={apartment?.apartment_id}
              apartment={apartment}
              reserve={reserve}
              dereserve={dereserve}
            />
          ))}
        </Stack>
      </Stack>
    ))}
  </Stack>
);

CheckerboardFloor.propTypes = {
  floors: PropTypes.array,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};

export default CheckerboardFloor;
