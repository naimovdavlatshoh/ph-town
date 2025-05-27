import * as Yup from 'yup';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Stack } from '@mui/system';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { Tooltip, IconButton, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { useGetKassaBankExpenditure } from 'src/api/payments';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider from 'src/components/hook-form/form-provider';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import InvoiceInfoDialog from './invoice-info-dialog';

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
    return `"${client?.client_surname}" - ${client?.client_name}`;
  }
  return '';
};

export default function PaymentsExpenditureTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const {
    cash_type,
    category_id,
    category_name,
    comments,
    created_at,
    kassa_id,
    operator_name,
    payment_amount,
    payment_method,
    payment_amount_usd,
    moment_usd_rate,
  } = row;

  const [openComment, setOpenComment] = useState(false);

  const handleTooltipClose = () => {
    setOpenComment(false);
  };

  const handleTooltipOpen = (e) => {
    e.preventDefault();
    setOpenComment(true);
  };

  const confirm = useBoolean();
  const confirmDelete = useBoolean();
  const view = useBoolean();

  const { kassBankExpedniture, kassBankExpednitureLoading } = useGetKassaBankExpenditure();

  const popover = usePopover();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDelete.onTrue();
  };

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          textDecoration: 'none',
        }}
      >
        <TableCell>{category_name}</TableCell>

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
        <TableCell sx={{ color: makeColor(payment_amount_usd) }}>
          {fCurrency(payment_amount_usd)}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={(cash_type === '0' && 'success') || (cash_type === '1' && 'info') || 'default'}
          >
            {(cash_type === '0' && 'UZS') || (cash_type === '1' && 'USD') || 'default'}
          </Label>
        </TableCell>
        <TableCell>{fCurrency(moment_usd_rate)}</TableCell>
        <TableCell>
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
          <Stack direction="row" gap={1}>
            <IconButton sx={{ color: 'info.main' }} color="default" onClick={view.onTrue}>
              <Iconify icon="mdi:eye" />
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
            kassaId={kassa_id}
          />
        }
      />
      {view.value && (
        <InvoiceInfoDialog
          open={view.value}
          data={kassBankExpedniture?.find((kb) => kb?.kassa_id === row?.kassa_id)}
          onClose={view.onFalse}
          loading={kassBankExpednitureLoading}
        />
      )}
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

PaymentsExpenditureTableRow.propTypes = {
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
  onDeleteRow: PropTypes.func,
  onClose: PropTypes.func,
  kassaId: PropTypes.string,
  contractId: PropTypes.string,
};
