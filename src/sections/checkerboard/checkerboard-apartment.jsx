import { useState } from 'react';
import PropTypes from 'prop-types';

import { Stack, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import getStatusColor, { getDisabledStatusColor } from 'src/utils/apartment-status';

import Iconify from 'src/components/iconify';

import CheckerboardRoomDetails from './checkerboard-room-details';

const CheckerboardApartment = ({ apartment, reserve, dereserve }) => {
  const [selectedRoom, setSelectRoom] = useState();

  const details = useBoolean();

  const handleOpenDrawer = (id, status) => {
    // if (status === '3') return;

    setSelectRoom(id);
    details.onTrue();
  };

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
        onClick={() =>
          !apartment?.isFilterRoom ||
          !apartment?.isFilterRoomStatus ||
          !apartment?.isFilterRoomPrice ||
          !apartment?.isFilterRoomArea
            ? {}
            : handleOpenDrawer(apartment.apartment_id, apartment?.stock_status)
        }
        sx={{
          borderRadius: '2px',
          margin:
            !apartment?.isFilterRoom ||
            !apartment?.isFilterRoomStatus ||
            !apartment?.isFilterRoomPrice ||
            !apartment?.isFilterRoomArea
              ? '2.5px'
              : 0,
          background:
            !apartment?.isFilterRoom ||
            !apartment?.isFilterRoomStatus ||
            !apartment?.isFilterRoomPrice ||
            !apartment?.isFilterRoomArea
              ? getDisabledStatusColor(apartment.stock_status)
              : getStatusColor(apartment.stock_status),
          color: '#fff',
          width:
            !apartment?.isFilterRoom ||
            !apartment?.isFilterRoomStatus ||
            !apartment?.isFilterRoomPrice ||
            !apartment?.isFilterRoomArea
              ? '25px'
              : '40px',
          height:
            !apartment?.isFilterRoom ||
            !apartment?.isFilterRoomStatus ||
            !apartment?.isFilterRoomPrice ||
            !apartment?.isFilterRoomArea
              ? '25px'
              : '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize:
            !apartment?.isFilterRoom ||
            !apartment?.isFilterRoomStatus ||
            !apartment?.isFilterRoomPrice ||
            !apartment?.isFilterRoomArea
              ? '8px'
              : '12px',
          cursor:
            !apartment?.isFilterRoom ||
            !apartment?.isFilterRoomStatus ||
            !apartment?.isFilterRoomPrice ||
            !apartment?.isFilterRoomArea
              ? 'no-drop'
              : 'pointer',
        }}
      >
        {apartment?.rooms_number}
        <Typography variant="caption">{apartment?.apartment_name}</Typography>
        {apartment?.stock_status === '4' && (
          <Iconify
            icon="mingcute:time-fill"
            sx={{
              position: 'absolute',
              top: 0,
              right: -1,
              width: '15px',
              height: '15px',
              color: '#fff',
            }}
          />
        )}
      </Stack>
      {selectedRoom && (
        <CheckerboardRoomDetails
          reserve={reserve}
          dereserve={dereserve}
          open={details.value}
          onClose={() => {
            setSelectRoom(null);
            details.onFalse();
          }}
          onDelete={() => {
            details.onFalse();
          }}
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
