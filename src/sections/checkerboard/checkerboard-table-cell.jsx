import { useState } from 'react';
import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';
import { Box, Stack, TableCell, Typography, tableCellClasses } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import getStatusColor, { getDisabledStatusColor } from 'src/utils/apartment-status';

import Iconify from 'src/components/iconify';

import CheckerboardRoomDetails from './checkerboard-room-details';

const CheckerboardTableCell = ({ cell, floorNumer, reserve, dereserve }) => {
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    paddingTop: 3,
    paddingBottom: 3,
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const [selectedRoom, setSelectRoom] = useState();

  const details = useBoolean();

  const handleOpenDrawer = (id, status) => {
    if (status === '3') return;

    setSelectRoom(id);
    details.onTrue();
  };

  return (
    <>
      <StyledTableCell>
        <Stack direction="row" gap={1} alignItems="center" position="relative">
          <Box sx={{ width: '40px', height: '20px' }}>
            {floorNumer === '-1' ? 'Подвал' : `${floorNumer}`}
          </Box>
          {cell?.data?.map((item, index) => (
            <Stack
              direction="column"
              alignItems="center"
              justifyContent="center"
              position="relative"
              onClick={() =>
                !item?.isFilterRoom ||
                !item?.isFilterRoomStatus ||
                !item?.isFilterRoomPrice ||
                !item?.isFilterRoomArea
                  ? {}
                  : handleOpenDrawer(item.apartment_id, item?.stock_status)
              }
              key={index}
              sx={{
                borderRadius: '2px',
                margin:
                  !item?.isFilterRoom ||
                  !item?.isFilterRoomStatus ||
                  !item?.isFilterRoomPrice ||
                  !item?.isFilterRoomArea
                    ? '2.5px'
                    : 0,
                background:
                  !item?.isFilterRoom ||
                  !item?.isFilterRoomStatus ||
                  !item?.isFilterRoomPrice ||
                  !item?.isFilterRoomArea
                    ? getDisabledStatusColor(item.stock_status)
                    : getStatusColor(item.stock_status),
                color: '#fff',
                width:
                  !item?.isFilterRoom ||
                  !item?.isFilterRoomStatus ||
                  !item?.isFilterRoomPrice ||
                  !item?.isFilterRoomArea
                    ? '25px'
                    : '40px',
                height:
                  !item?.isFilterRoom ||
                  !item?.isFilterRoomStatus ||
                  !item?.isFilterRoomPrice ||
                  !item?.isFilterRoomArea
                    ? '25px'
                    : '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize:
                  !item?.isFilterRoom ||
                  !item?.isFilterRoomStatus ||
                  !item?.isFilterRoomPrice ||
                  !item?.isFilterRoomArea
                    ? '8px'
                    : '12px',
                cursor:
                  !item?.isFilterRoom ||
                  !item?.isFilterRoomStatus ||
                  !item?.isFilterRoomPrice ||
                  !item?.isFilterRoomArea
                    ? 'no-drop'
                    : 'pointer',
              }}
            >
              {item?.rooms_number}
              <Typography variant="caption">{item?.apartment_name}</Typography>
              {item?.stock_status === '4' && (
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
          ))}
        </Stack>
      </StyledTableCell>

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
    </>
  );
};

export default CheckerboardTableCell;

CheckerboardTableCell.propTypes = {
  cell: PropTypes.object,
  floorNumer: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};
