/* eslint-disable no-unsafe-optional-chaining */
import moment from 'moment';
import sum from 'lodash/sum';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Table, TableRow, TableBody, TableCell, TableHead, TableContainer } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function ContractNewEditDetailsAuto() {
  const { control, setValue, watch, resetField } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mounthPayList',
  });

  const values = watch();


  const totalOnRow = values.mounthPayList.map((item) => +item.price);

  const subTotal = sum(totalOnRow);

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>

              <TableCell sx={{ typography: 'subtitle2' }}>Дата</TableCell>
              <TableCell>Сумма</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell />

              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="subtitle2">Остаток</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" noWrap>
                  {fCurrency(values.totalAmount - values.initialPayment?.replace(/,/g, ''))} сум
                </Typography>
              </TableCell>
            </TableRow>
            {values.mounthPayList.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="subtitle2">
                      {moment(row.date, 'DD-MM-YYYY').format('DD.MM.YYYY')} г.
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{fCurrency(row.price)} сум</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Детали:
      </Typography>

      {values.mounthPayList.length > 0 ? (
        <>{renderList}</>
      ) : (
        <Typography textAlign="center" color="red">
          Сгенерируйте график оплаты
        </Typography>
      )}
    </Box>
  );
}
