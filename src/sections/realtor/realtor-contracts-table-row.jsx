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
import { Tooltip, IconButton, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider from 'src/components/hook-form/form-provider';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import AddContractNewForm from './add-contract-new-form';

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

export default function RealtorContractsTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const {
    amount,
    amount_type,
    comments,
    contract_id,
    contract_number,
    operator_name,
    realtor_contract_id,
    realtor_id,
    realtor_name,
    realtor_price,
    realtor_surname,
    total_price,
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
  const edit = useBoolean();

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
        <TableCell>{`${realtor_surname} ${realtor_name}`}</TableCell>
        <TableCell>{contract_number}</TableCell>

        <TableCell>{fCurrency(total_price)} UZS</TableCell>
        <TableCell>{fCurrency(realtor_price)} UZS</TableCell>
        <TableCell>
          {fCurrency(amount)} {amount_type !== '1' ? 'UZS' : '%'}
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

        {/* <TableCell>
          <Label
            variant="soft"
            color={(cash_type === '0' && 'success') || (cash_type === '1' && 'info') || 'default'}
          >
            {(cash_type === '0' && 'UZS') || (cash_type === '1' && 'USD') || 'default'}
          </Label>
        </TableCell> */}

        <TableCell align="center">{operator_name}</TableCell>
        {/* <TableCell>
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
        </TableCell> */}

        <TableCell align="right" sx={{ px: 1 }}>
          <Stack direction="row" gap={1}>
            <IconButton sx={{ color: 'info.warning' }} color="default" onClick={edit.onTrue}>
              <Iconify icon="solar:pen-bold" />
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
        title="Открепление контракта"
        content="Вы уверены что хотите открепить контракт?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(
                row?.realtor_contract_id,
                () => {
                  confirmDelete.onFalse();
                },
                () => {
                  confirmDelete.onFalse();
                }
              );
            }}
          >
            Удалить
          </Button>
        }
      />
      {edit.value && (
        <AddContractNewForm
          open={edit.value}
          data={row}
          onClose={edit.onFalse}
          update={onEditRow}
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
    </>
  );
}

RealtorContractsTableRow.propTypes = {
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
