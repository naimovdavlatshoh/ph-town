import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';
import { TableRow, TableCell, tableCellClasses } from '@mui/material';

import CheckerboardTableCell from './checkerboard-table-cell';

const CheckerboardTableRow = ({ row, reserve, dereserve }) => {
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

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

  return (
    <StyledTableRow>
      {row?.cell?.map((c, idx) => (
        <CheckerboardTableCell
          reserve={reserve}
          dereserve={dereserve}
          key={idx}
          cell={c}
          floorNumer={row?.floorNumber}
        />
      ))}
    </StyledTableRow>
  );
};

export default CheckerboardTableRow;

CheckerboardTableRow.propTypes = {
  row: PropTypes.object,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};
