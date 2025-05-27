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
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { Badge, Tooltip, IconButton, badgeClasses, DialogActions } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider from 'src/components/hook-form/form-provider';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

function makeColor(value) {
  if (!value) {
    return '';
  }

  return value?.startsWith('-') ? 'red' : '';
}

const renderClientName = (client) => {
  if (client?.client_type === '0') {
    return `${client?.client_surname} ${client?.client_name || ''} ${
      client?.client_fathername || ''
    }`;
  }
  if (client?.client_type === '1') {
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
    payment_method,
    contract_number,
    type_of_expense,
    invoice_number,
  } = row;

  console.log('row', row);

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
    e.preventDefault();
    setOpenComment(true);
  };

  const confirm = useBoolean();
  const confirmDelete = useBoolean();

  const popover = usePopover();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDelete.onTrue();
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
        component={contract_id && RouterLink}
        href={contract_id && paths.dashboard.contracts.details(row.contract_id)}
        sx={{
          textDecoration: 'none',
          '&:last-child td, &:last-child th': { border: 0 },
        }}
      >
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{invoice_number}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{contract_number}</TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          {renderAvatar}
          {/* <Avatar alt={client_name} sx={{ mr: 2 }}>
            {client_name?.charAt(0).toUpperCase()}
          </Avatar> */}
          {client_name}

          <ListItemText
            disableTypography
            primary={
              <Link component={RouterLink} href={paths.dashboard.clients.details(row?.client_id)}>
                <Typography variant="body2" noWrap>
                  {renderClientName(row.client_info)}
                </Typography>{' '}
              </Link>
            }
            secondary={
              <Link
                noWrap
                variant="body2"
                onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {client_type === '0' && 'Физ.лицо'}
                {client_type === '1' && 'Юр.лицо'}
              </Link>
            }
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={handleTooltipClose}
            open={openComment}
            title={comments || 'Нет комментариев'}
          >
            <Iconify color="orange" icon="ic:baseline-comment" onClick={handleTooltipOpen} />
          </Tooltip>
        </TableCell>

        <TableCell sx={{ color: makeColor(payment_amount) }}>{fCurrency(payment_amount)}</TableCell>

        <TableCell>
          <Stack direction="row" gap={1}>
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
            {type_of_expense === '1' && (
              <Label variant="soft" color="default">
                Взнос
              </Label>
            )}
          </Stack>
        </TableCell>
        <TableCell align="center">{operator_name}</TableCell>
        <TableCell>
          <ListItemText
            primary={fDate(created_at)}
            secondary={fTime(created_at)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <Stack direction="row" gap={2}>
            <IconButton
              sx={{ color: 'info.main' }}
              color="default"
              onClick={(e) => {
                e.preventDefault();
                handlePrint(row);
              }}
            >
              <Iconify icon="material-symbols:print" />
            </IconButton>
            <IconButton sx={{ color: 'error.main' }} color="default" onClick={handleDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
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
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
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

  const onSubmit = handleSubmit(async (data) => {
    const newData = {
      comments: data.comments,
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
