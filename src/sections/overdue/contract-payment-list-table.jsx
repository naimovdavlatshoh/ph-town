import PropTypes from 'prop-types';

import { Table, TableRow, TableBody, TableCell, TableHead, TableContainer } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ContractPaymentListRow from './contract-payment-list-row';

const ContractPaymentListTable = ({ contract }) => (
  <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
    <Scrollbar>
      <Table sx={{ minWidth: 660 }}>
        <TableHead>
          <TableRow>
            <TableCell width={40}>№</TableCell>

            <TableCell width={140} sx={{ typography: 'subtitle2' }}>
              Время оплаты
            </TableCell>
            <TableCell>Сумма оплаты</TableCell>

            <TableCell>Тип оплаты</TableCell>
            <TableCell>Комментарий</TableCell>

            <TableCell align="right">Оператор</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {contract?.paymentlist?.map((row, index) => (
            <ContractPaymentListRow key={row?.kassa_id} rowData={row} index={index} />
          ))}
        </TableBody>
      </Table>
    </Scrollbar>
  </TableContainer>
);

ContractPaymentListTable.propTypes = {
  contract: PropTypes.object,
};

export default ContractPaymentListTable;
