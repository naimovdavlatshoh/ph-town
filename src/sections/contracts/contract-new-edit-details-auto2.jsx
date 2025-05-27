/* eslint-disable no-unsafe-optional-chaining */
import moment from 'moment';
import sum from 'lodash/sum';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Table, TableRow, TableBody, TableCell, TableHead, TableContainer } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import axios, { endpoints } from 'src/utils/axios';

import { fCurrency } from 'src/utils/format-number';

import Scrollbar from 'src/components/scrollbar';
import { useState } from 'react';

// ----------------------------------------------------------------------

export default function ContractNewEditDetailsAuto2() {
  const { control, setValue, watch, trigger, resetField } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mounthPayList',
  });

  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const values = watch();

  const totalOnRow = values.mounthPayList?.map((item) => +item.price);

  const subTotal = sum(totalOnRow);

  console.log(values.mounthPayList);

  const handleEditStart = (index, currentPrice) => {
    setEditingIndex(index);
    setEditValue(currentPrice.toString());
  };

  const handleEditSave = async (index) => {
    const currentList = [...values.mounthPayList].map((item, idx) => ({
      date: moment(item.date).format('DD-MM-YYYY'),
      price: item.price,
      status: item.status !== undefined ? item.status : 0, // Preserve existing status
    }));

    // Update the price for the edited row
    currentList[index] = {
      ...currentList[index],
      price: parseFloat(editValue) || 0,
      status: 1, // Mark as edited
    };

    try {
      setLoading(true);
      const result = await axios.post(endpoints.contract.generatedateshand, {
        months: Number(values.months),
        total_price: values.totalAmount - values.initialPayment?.replace(/,/g, ''),
        details: currentList,
      });

      console.log(result.data);

      // Map backend response to mounthPayList format
      const mounthPayList = result.data?.payment_day?.map((date, idx) => ({
        date: moment(date, 'DD-MM-YYYY').toDate(),
        price: result.data?.monthly_fee[idx],
        status: result.data?.status[idx] || 0, // Use status from backend
      }));

      setValue('mounthPayList', mounthPayList);
      setValue('monthly_fee', result.data.monthly_fee);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Дата</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действие</TableCell>
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
              <TableCell />
              <TableCell />
            </TableRow>
            {values?.mounthPayList?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="subtitle2">
                      {moment(row.date, 'DD-MM-YYYY').format('DD.MM.YYYY')} г.
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      size="small"
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      sx={{ width: 120 }}
                      autoFocus
                    />
                  ) : (
                    <Typography>{fCurrency(row.price)} сум</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: (row.status || 0) === 1 ? 'success.light' : 'grey.300',
                      color: (row.status || 0) === 1 ? 'success.dark' : 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      display: 'inline-block',
                    }}
                  >
                    {(row.status || 0) === 1 ? 'Изменено' : 'Оригинал'}
                  </Box>
                </TableCell>

                <TableCell>
                  {editingIndex === index ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleEditSave(index)}
                        disabled={loading}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={handleEditCancel}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton size="small" onClick={() => handleEditStart(index, row.price)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
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

      {values?.mounthPayList?.length > 0 ? (
        <>{renderList}</>
      ) : (
        <Typography textAlign="center" color="red">
          Сгенерируйте график оплаты
        </Typography>
      )}
    </Box>
  );
}
