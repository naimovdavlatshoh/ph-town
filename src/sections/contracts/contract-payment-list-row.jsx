import { useState } from 'react';
import PropTypes from 'prop-types';

import { Stack, Tooltip, TableRow, TableCell } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

const ContractPaymentListRow = ({ rowData, index }) => {
  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = () => {
    setOpenComment(true);
  };

  return (
    <TableRow key={rowData?.kassa_id}>
      <TableCell>{index + 1}</TableCell>

      <TableCell>{rowData?.created_at}</TableCell>

      <TableCell align="center">{fCurrency(rowData?.payment_amount)}</TableCell>

      <TableCell align="center">
        <Stack direction="row" gap={1}>
          <Label
            variant="soft"
            color={
              (rowData?.payment_method === '1' && 'error') ||
              (rowData?.payment_method === '2' && 'success') ||
              (rowData?.payment_method === '3' && 'info') ||
              (rowData?.payment_method === '4' && 'warning') ||
              'default'
            }
          >
            {(rowData?.payment_method === '1' && 'Наличка') ||
              (rowData?.payment_method === '2' && 'Терминал') ||
              (rowData?.payment_method === '3' && 'Клик') ||
              (rowData?.payment_method === '4' && 'Банк') ||
              'default'}
          </Label>
          {rowData?.type_of_expense === '1' && (
            <Label variant="soft" color="default">
              Взнос
            </Label>
          )}
        </Stack>
      </TableCell>
      <TableCell align="center">
        {' '}
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          open={openComment}
          title={rowData?.comments || 'Нет комментариев'}
        >
          <Iconify color="orange" icon="ic:baseline-comment" onClick={handleTooltipOpen} />
        </Tooltip>
      </TableCell>

      <TableCell align="right">{rowData?.operator}</TableCell>
    </TableRow>
  );
};

ContractPaymentListRow.propTypes = {
  rowData: PropTypes.object,
  index: PropTypes.number,
};

export default ContractPaymentListRow;
