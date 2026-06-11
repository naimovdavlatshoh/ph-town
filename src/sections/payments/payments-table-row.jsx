import axios from 'axios';
import * as Yup from 'yup';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import { Box, Stack } from '@mui/system';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
// import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { Badge, Tooltip, IconButton, badgeClasses, DialogActions } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider from 'src/components/hook-form/form-provider';

// ----------------------------------------------------------------------

function makeColor(value) {
  if (!value) {
    return '';
  }

  return value?.startsWith('-') ? 'red' : '';
}

const renderClientName = (client) => {
  if (String(client?.client_type) === '0') {
    return `${client?.client_surname || ''} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`.trim();
  }
  if (String(client?.client_type) === '1') {
    return `"${client?.business_name}". Директор: ${
      client?.business_director_name || 'Не заполнен'
    }`;
  }
  return '';
};

export default function PaymentsTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  // eslint-disable-next-line react/prop-types
  handlePrint,
  // eslint-disable-next-line react/prop-types
  printTemplateRef,
}) {
  const router = useRouter();

  const {
    cash_type,
    client_fathername,
    client_id,
    client_name,
    client_surname,
    client_type,
    comments,
    contract_id,
    created_at,
    kassa_id,
    operator_name,
    payment_amount,
    real_payment_amount_uzs,
    payment_amount_usd,
    contract_cash_type,
    contract_exchange_rate,
    payment_exchange_rate,
    payment_method,
    contract_number,
    type_of_expense,
    invoice_number,
    is_terminated,
  } = row;

  const contractTypeColor = (() => {
    if (contract_cash_type === '1') {
      return 'info';
    }
    if (contract_cash_type === '0') {
      return 'warning';
    }
    return 'default';
  })();

  const contractTypeLabel = (() => {
    if (contract_cash_type === '1') {
      return 'Сумовой';
    }
    if (contract_cash_type === '0') {
      return 'Долларовый';
    }
    return contract_cash_type;
  })();

  const [openComment, setOpenComment] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/assets/check.xls', {
          responseType: 'arraybuffer',
        });
        const excelData = new Uint8Array(response.data);
        const workbook = XLSX.read(excelData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setData(jsonData);
      } catch (error) {
        console.error('Error loading Excel file:', error);
      }
    };

    fetchData();
  }, []);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = (e) => {
    e.stopPropagation();
    setOpenComment(true);
  };

  const confirmDelete = useBoolean();

  const handleDelete = (e) => {
    e.stopPropagation();
    confirmDelete.onTrue();
  };

  const handleRowClick = () => {
    if (contract_id) {
      router.push(paths.dashboard.contracts.details(row.contract_id));
    }
  };

  const renderAvatar = (
    <Box sx={{ position: 'relative', mr: 2 }}>
      <Badge
        overlap="circular"
        color={row.contract_id ? 'success' : 'info'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Iconify icon={row.contract_id ? 'ri:contract-line' : 'mdi:cash-check'} width={16} />
        }
        sx={{
          [`& .${badgeClasses.badge}`]: {
            p: 0,
            width: 30,
          },
        }}
      >
        <Avatar>{client_name?.charAt(0).toUpperCase()}</Avatar>
      </Badge>
    </Box>
  );

  return (
    <>
      <TableRow
        hover
        selected={selected}
        onClick={handleRowClick}
        sx={{
          cursor: contract_id ? 'pointer' : 'default',
          '&:last-child td, &:last-child th': { border: 0 },
        }}
      >
        {/* Инвойс */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Label variant="soft" color="default">
            {invoice_number}
          </Label>
        </TableCell>

        {/* Договор */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {contract_number ? (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {contract_number}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* Клиент */}
        <TableCell sx={{ display: 'flex', alignItems: 'center', minWidth: 240 }}>
          {renderAvatar}
          <ListItemText
            disableTypography
            primary={
              <Link
                component={RouterLink}
                href={paths.dashboard.clients.details(row?.client_id)}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {renderClientName(row.client_info)}
                </Typography>
              </Link>
            }
            secondary={
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.25 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
                  {String(client_type) === '0' && 'Физ.лицо'}
                  {String(client_type) === '1' && 'Юр.лицо'}
                </Typography>
                {contract_cash_type !== undefined && contract_cash_type !== null && (
                  <Label variant="soft" color={contractTypeColor}>
                    {contractTypeLabel}
                  </Label>
                )}
              </Stack>
            }
          />
        </TableCell>

        {/* Комментарий */}
        <TableCell align="center">
          <Tooltip
            PopperProps={{ disablePortal: true }}
            onClose={handleTooltipClose}
            open={openComment}
            title={comments || 'Нет комментариев'}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleTooltipOpen(e);
              }}
            >
              <Iconify color={comments ? 'orange' : 'disabled'} icon="ic:baseline-comment" />
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Сумма (UZS) */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontFamily: 'monospace',
              color: makeColor(payment_amount) || 'text.primary',
            }}
          >
            {fCurrency(payment_amount)}
          </Typography>
        </TableCell>

        {/* В кассу */}
        <TableCell
          align="right"
          sx={{
            whiteSpace: 'nowrap',
            bgcolor: (t) => alpha(t.palette.success.main, 0.08),
          }}
        >
          {real_payment_amount_uzs ? (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontFamily: 'monospace',
                color: makeColor(real_payment_amount_uzs) || 'success.dark',
              }}
            >
              {fCurrency(real_payment_amount_uzs)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* Сумма (USD) */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {payment_amount_usd ? (
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                color: makeColor(payment_amount_usd) || 'text.secondary',
              }}
            >
              ${fCurrency(payment_amount_usd)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* Курс контракта */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {contract_exchange_rate ? (
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {fCurrency(contract_exchange_rate)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* Курс оплаты */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {payment_exchange_rate ? (
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {fCurrency(payment_exchange_rate)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* Метод оплаты */}
        <TableCell>
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            <Label
              variant="soft"
              color={
                (payment_method === '1' && 'error') ||
                (payment_method === '2' && 'success') ||
                (payment_method === '3' && 'info') ||
                (payment_method === '4' && 'warning') ||
                'default'
              }
            >
              {(payment_method === '1' && 'Наличка') ||
                (payment_method === '2' && 'Терминал') ||
                (payment_method === '3' && 'Клик') ||
                (payment_method === '4' && 'Банк') ||
                'default'}
            </Label>
            {is_terminated === '1' && (
              <Label variant="soft" color="error">
                Расторгнут
              </Label>
            )}
            {type_of_expense === '1' && (
              <Label variant="soft" color="default">
                Взнос
              </Label>
            )}
          </Stack>
        </TableCell>

        {/* Оператор */}
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2">{operator_name}</Typography>
        </TableCell>

        {/* Дата оплаты */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {created_at ? (
            <ListItemText
              primary={fDate(created_at)}
              secondary={fTime(created_at)}
              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
                color: 'text.disabled',
              }}
            />
          ) : (
            ''
          )}
        </TableCell>

        {/* Действия */}
        <TableCell align="right" sx={{ px: 1 }}>
          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Tooltip title="Печать">
              <IconButton
                sx={{ color: 'info.main' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrint(row);
                }}
              >
                <Iconify icon="material-symbols:print" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton sx={{ color: 'error.main' }} onClick={handleDelete}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content={
          <ConfirmContent
            onDeleteRow={onDeleteRow}
            onClose={confirmDelete.onFalse}
            contractId={contract_id}
            kassaId={kassa_id}
          />
        }
      />
    </>
  );
}

PaymentsTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};

const ConfirmContent = ({ onDeleteRow, onClose, kassaId, contractId }) => {
  const ConfirmSchema = Yup.object().shape({
    comments: Yup.string().required('Введите сообщение'),
  });

  const defaultValues = { comments: '' };

  const methods = useForm({
    resolver: yupResolver(ConfirmSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const newData = {
      comments: formData.comments,
      kassa_id: kassaId,
    };

    if (contractId) {
      newData.contract_id = contractId;
    }

    onDeleteRow(newData, () => {
      onClose();
      methods.reset();
    });
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack gap={2}>
        <Typography sx={{ typography: 'body2' }}>
          Вы уверены что хотите удалить операцию?
        </Typography>
        <RHFTextField
          rows={3}
          size="small"
          name="comments"
          label="Комментарий"
          multiline
          InputLabelProps={{ shrink: true }}
        />
        <DialogActions>
          <Button variant="contained" color="error" type="submit">
            Удалить
          </Button>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Закрыть
          </Button>
        </DialogActions>
      </Stack>
    </FormProvider>
  );
};

ConfirmContent.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  handlePrint: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onClose: PropTypes.func,
  kassaId: PropTypes.string,
  contractId: PropTypes.string,
  // eslint-disable-next-line react/no-unused-prop-types
  printTemplateRef: PropTypes.any,
};
