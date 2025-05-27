/* eslint-disable no-plusplus */
import * as React from 'react';
import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import CheckerboardTableRow from './checkerboard-table-row';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

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

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

function isInRange(number, range) {
  return number >= Math.min(...range) && number <= Math.max(...range);
}

export default function CheckerboardTable({
  data,
  roomsCountFilter,
  roomsStatusFilter,
  roomsPriceFilter,
  roomsAreaFilter,
  reserve,
  dereserve,
}) {
  const getGroupedRows = useMemo(() => {
    const rows2 = [];

    for (let i = 0; i < data?.length; i += 1) {
      const block = data[i];

      for (let j = 0; j < block.entrance.length; j += 1) {
        const entrance = block.entrance[j];

        for (let k = 0; k < block.max_floors; k += 1) {
          const floor = entrance.floor[k];

          if (floor) {
            const existingFloor = rows2.find((item) => item.floorNumber === floor.floor_number);

            const maxRooms = floor?.apartments_number;

            if (existingFloor) {
              const existingBlock = existingFloor.cell.find(
                (item) => item.blockId === block.block_id
              );

              if (existingBlock) {
                let lastIndex = existingBlock.data.lastIndexOf(
                  existingBlock.data.find((element) => element !== null)
                );

                floor.apartments.forEach((apartment) => {
                  existingBlock.data[++lastIndex] = apartment;
                });
              } else {
                // const withEmptyRooms = [...Array(+maxRooms)].map((_, index) => {
                //   const apartment = floor.apartments[index];

                //   if (apartment) {
                //     return apartment;
                //   }
                //   return null;
                // });

                existingFloor.cell.push({
                  blockId: block.block_id,

                  data: [
                    ...floor.apartments.map((apartment) => ({
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
                  ],
                });
              }
            } else {
              // const withEmptyRooms = [...Array(+maxRooms)].map((_, index) => {
              //   const apartment = floor.apartments[index];

              //   if (apartment) {
              //     return apartment;
              //   }
              //   return null;
              // });

              rows2.push({
                floorNumber: floor.floor_number,
                cell: [
                  {
                    blockId: block.block_id,
                    data: floor.apartments.map((apartment) => ({
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
                  },
                ],
              });
            }
          } else {
            const foundFloor = rows2.find((f) => f.floorNumber === `${k + 1}`);

            if (!foundFloor) {
              rows2?.push({
                floorNumber: `${k + 1}`,
                cell: [{ blockId: block.block_id }],
              });
            }

            // if (foundFloor) {
            //   rows2.push({
            //     floorNumber: k,
            //     cell: [
            //       {
            //         blockId: block.block_id,
            //       },
            //     ],
            //   });
            // }
          }
        }
      }
    }

    return rows2;
  }, [data, roomsAreaFilter, roomsCountFilter, roomsPriceFilter, roomsStatusFilter]);

  return (
    <TableContainer>
      <Table size="small" dense>
        <TableHead>
          <TableRow>
            {data?.map((c, idx) => (
              <StyledTableCell key={idx}>{c.block_name}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {getGroupedRows
            .sort((a, b) => b.floorNumber - a.floorNumber)
            ?.map((row, idx) => (
              <CheckerboardTableRow reserve={reserve} dereserve={dereserve} key={idx} row={row} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CheckerboardTable.propTypes = {
  data: PropTypes.object,
  roomsCountFilter: PropTypes.string,
  roomsStatusFilter: PropTypes.string,
  roomsPriceFilter: PropTypes.string,
  roomsAreaFilter: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};
