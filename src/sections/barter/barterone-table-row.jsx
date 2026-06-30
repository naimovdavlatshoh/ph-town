import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';

// ----------------------------------------------------------------------

function getBarterObjectConfig(name) {
  if (name === 'Машина') {
    return { color: 'info', icon: 'mdi:car' };
  }
  // Магазин, Имущество, Другое — одинаковые
  return { color: 'warning', icon: 'mdi:office-building' };
}

// ----------------------------------------------------------------------

export default function BarterOneTableRow({ row, onAddResale }) {
  const {
    barter_id,
    contract_id,
    contract_number,
    client_full_name,
    barter_object_name,
    barter_comments,
    appraised_value,
    resale_value,
    resale_date,
    profit_amount,
    profit_status,
    created_at,
  } = row;

  const isPlus = String(profit_status) === '1';
  const resaleDialog = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const objectConfig = getBarterObjectConfig(barter_object_name);

  const ResaleSchema = Yup.object().shape({
    resale_value: Yup.string().required('Введите сумму'),
    resale_date: Yup.date().required('Введите дату').nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(ResaleSchema),
    defaultValues: { resale_value: '', resale_date: new Date() },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (values) => {
    onAddResale(
      {
        barter_id: Number(barter_id),
        resale_value: Number(String(values.resale_value).replace(/,/g, '')),
        resale_date: format(new Date(values.resale_date), 'yyyy-MM-dd'),
      },
      () => {
        enqueueSnackbar('Перепродажа добавлена!');
        resaleDialog.onFalse();
        methods.reset();
      },
      () => enqueueSnackbar('Ошибка при добавлении', { variant: 'error' })
    );
  });

  return (
    <>
      <TableRow hover sx={{ transition: 'background-color 0.15s' }}>

        {/* Контракт */}
        <TableCell>
          <Typography
            component={RouterLink}
            href={paths.dashboard.contracts.details(contract_id)}
            variant="body2"
            fontWeight={700}
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {contract_number}
          </Typography>
        </TableCell>

        {/* Клиент */}
        <TableCell>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {client_full_name}
          </Typography>
        </TableCell>

        {/* Тип бартера */}
        <TableCell>
          <Label variant="soft" color={objectConfig.color}>
            <Iconify icon={objectConfig.icon} width={14} sx={{ mr: 0.5 }} />
            {barter_object_name}
          </Label>
        </TableCell>

        {/* Комментарий */}
        <TableCell sx={{ maxWidth: 160 }}>
          {barter_comments ? (
            <Tooltip title={barter_comments} arrow>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  cursor: 'default',
                  lineHeight: 1.4,
                }}
              >
                {barter_comments}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* Сумма оценки */}
        <TableCell align="right">
          <Typography variant="body2" fontWeight={500} noWrap>
            {fNumber(appraised_value)}
          </Typography>
        </TableCell>

        {/* Сумма продажи */}
        <TableCell align="right">
          <Typography variant="body2" fontWeight={500} noWrap>
            {fNumber(resale_value)}
          </Typography>
        </TableCell>

        {/* Дата продажи */}
        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {fDate(resale_date)}
          </Typography>
        </TableCell>

        {/* Разница */}
        <TableCell align="right">
          <Typography
            variant="body2"
            fontWeight={700}
            noWrap
            sx={{ color: isPlus ? 'success.main' : 'error.main' }}
          >
            {profit_amount !== '0'
              ? `${isPlus ? '+' : '-'}${fNumber(profit_amount)}`
              : '0'}
          </Typography>
        </TableCell>

        {/* Статус */}
        <TableCell>
          <Label variant="soft" color={isPlus ? 'success' : 'error'}>
            <Iconify
              icon={isPlus ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
              width={14}
              sx={{ mr: 0.5 }}
            />
            {isPlus ? 'В Плюсе' : 'В Минусе'}
          </Label>
        </TableCell>

        {/* Создано */}
        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {fDate(created_at)}
          </Typography>
        </TableCell>

        {/* Действия */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Просмотр контракта" arrow>
              <IconButton
                component={RouterLink}
                href={paths.dashboard.contracts.details(contract_id)}
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <Iconify icon="solar:eye-bold" width={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Перепродажа" arrow>
              <IconButton
                size="small"
                onClick={resaleDialog.onTrue}
                sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main' } }}
              >
                <Iconify icon="solar:refresh-bold" width={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Диалог перепродажи */}
      <Dialog fullWidth maxWidth="xs" open={resaleDialog.value} onClose={resaleDialog.onFalse}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:refresh-bold" sx={{ color: 'warning.main' }} />
              <span>Перепродажа — {contract_number}</span>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2.5} pt={1}>
              <RHFCurrencyField
                name="resale_value"
                label="Сумма перепродажи"
                placeholder="0"
                decimalScale={0}
                InputLabelProps={{ shrink: true }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Дата перепродажи"
                  value={methods.watch('resale_date')}
                  onChange={(val) =>
                    methods.setValue('resale_date', val, { shouldValidate: true })
                  }
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: { fullWidth: true, InputLabelProps: { shrink: true } },
                  }}
                />
              </LocalizationProvider>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button color="inherit" variant="outlined" onClick={resaleDialog.onFalse}>
              Отмена
            </Button>
            <Button type="submit" variant="contained" color="warning" disabled={isSubmitting}>
              Сохранить
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
}

BarterOneTableRow.propTypes = {
  row: PropTypes.object,
  onAddResale: PropTypes.func,
};
