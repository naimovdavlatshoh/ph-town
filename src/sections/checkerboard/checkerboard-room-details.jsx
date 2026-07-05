/* eslint-disable no-unsafe-optional-chaining */
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { QRCode } from 'react-qrcode-logo';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Print } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { CUSTOM_BASE_URL } from 'src/utils/custom-base-url';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { useGetCurrency } from 'src/api/currency';
import { useGetApartmentInfo, useGetApartmentImages } from 'src/api/apartment';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import PhotoGallery from 'src/components/photogallery';
import Lightbox from 'src/components/lightbox/lightbox';
import { RHFRadioGroup } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider from 'src/components/hook-form/form-provider';
import RHFPINFLField from 'src/components/hook-form/rhf-pinfl-field';
import FileThumbnail from 'src/components/file-thumbnail/file-thumbnail';
import RHFCurrencyField from 'src/components/hook-form/rhf-currency-field';

import ReserveRoomDialog from './reserve-room-dialog';
import styles from './checkerboard-room-details.module.css';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  '1': { color: '#22c55e', label: 'Свободно' },
  '2': { color: '#f59e0b', label: 'Забронировано' },
  '3': { color: '#ef4444', label: 'Продано' },
  '4': { color: '#f59e0b', label: 'Временная бронь' },
  '5': { color: '#9ca3af', label: 'Не продаётся' },
};

const OPTION_CONFIG = {
  '1': { icon: 'mdi:elevator', label: 'Лифт' },
  '2': { icon: 'material-symbols:balcony', label: 'Балкон' },
  '3': { icon: 'mdi:weather-sunny', label: 'Солнечная сторона' },
  '4': { icon: 'mdi:hammer-wrench', label: 'Ремонт' },
};

function MetricCard({ icon, label, value, color }) {
  return (
    <Stack
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
        border: '1px solid',
        borderColor: 'divider',
        gap: 0.5,
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.75}>
        <Iconify icon={icon} width={16} sx={{ color: color || 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}

MetricCard.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function CheckerboardRoomDetails({
  roomId,
  open,
  onClose,
  onDelete,
  reserve,
  dereserve,
}) {
  const { currency } = useGetCurrency();
  const { apartment } = useGetApartmentInfo(roomId);
  const { images } = useGetApartmentImages(roomId);

  const [priceSquareMeter, setPriceSquareMeter] = useState(0);
  const [termPrice, setTermPrice] = useState(0);
  const [dollarCurrency, setDollarCurrency] = useState(false);
  const [loadingDereserve, setLoadingDereserve] = useState(false);
  const [toggleBron, setToggleBron] = useState(false);
  const [realDate, setRealDate] = useState('');
  const [selectedLayoutSrc, setSelectedLayoutSrc] = useState();
  const [showCalc, setShowCalc] = useState(false);

  const editAreaPrice = useBoolean();
  const reserveModal = useBoolean();
  const dereserveDialog = useBoolean();
  const layerModal = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(
    () => () => {
      setSelectedLayoutSrc(null);
      setPriceSquareMeter(0);
      editAreaPrice.onFalse();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const NewCalcSchema = Yup.object().shape({
    initialPrice: Yup.string(),
    time: Yup.string(),
    timeAnother: Yup.string(),
  });

  const defaultValues = useMemo(() => ({ timeAnother: '6', time: '', initialPrice: '0' }), []);

  const methods = useForm({ resolver: yupResolver(NewCalcSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = () => {
    setPriceSquareMeter(termPrice);
    editAreaPrice.onFalse();
  };

  useEffect(() => {
    if (methods.watch('timeAnother')) methods.setValue('time', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('timeAnother')]);

  useEffect(() => {
    if (methods.watch('time')) methods.setValue('timeAnother', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('time')]);

  useEffect(() => {
    if (apartment) {
      setPriceSquareMeter(apartment.price_square_meter);
      setTermPrice(apartment.price_square_meter);
    }
  }, [apartment]);

  useEffect(() => {
    if (dollarCurrency) {
      methods.setValue('initialPrice', `${methods.watch('initialPrice')?.replace(/,/g, '') / currency}` || '0');
    } else {
      methods.setValue('initialPrice', `${methods.watch('initialPrice')?.replace(/,/g, '') * currency}` || '0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, dollarCurrency]);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    fetch(`${CUSTOM_BASE_URL}/api/v1/realdate`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => setRealDate(data.date))
      .catch(() => {});
  }, []);

  const onDereserve = () => {
    setLoadingDereserve(true);
    try {
      dereserve(apartment?.apartment_id, () => {
        enqueueSnackbar('Бронь успешно удалена');
        setLoadingDereserve(false);
        dereserveDialog.onFalse();
      });
    } catch {
      enqueueSnackbar('Ошибка при удалении', { variant: 'error' });
      setLoadingDereserve(false);
    }
  };

  const status = apartment?.stock_status;
  const statusCfg = STATUS_CONFIG[status] || { color: '#9ca3af', label: '—' };
  const isSold = status === '3';
  const isFree = status === '1';
  const isTempReserved = status === '4';

  const totalUSD = apartment?.apartment_area * priceSquareMeter;
  const totalUZS = currency * totalUSD;
  const initialVal = Number(methods.watch('initialPrice')?.replace(/,/g, '') || 0);
  const months = Number(methods.watch('timeAnother') || methods.watch('time') || 1);
  const monthly = dollarCurrency ? (totalUSD - initialVal) / months : (totalUZS - initialVal) / months;

  // ── Печать: на экране показываем модал (.notPrint), а на печать —
  // отдельный чистый лист (.print). CSS @media print скрывает интерфейс
  // и разворачивает диалог на всю страницу. ──
  const handlePrint = () => {
    setTimeout(() => window.print(), 300);
  };

  const renderClientName = (client) => {
    if (!client) return '—';
    if (client?.client_type === '0' || client?.client_type === 0) {
      return `${client?.client_surname || ''} ${client?.client_name || ''} ${client?.client_fathername || ''}`.trim();
    }
    return `"${client?.business_name}". Директор: ${client?.business_director_name || 'Не заполнен'}`;
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {/* ── Colored header ── */}
        <Box
          className={styles.notPrint}
          sx={{
            bgcolor: statusCfg.color,
            px: 3,
            py: 2,
            background: `linear-gradient(135deg, ${statusCfg.color} 0%, ${alpha(statusCfg.color, 0.75)} 100%)`,
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack gap={0.25}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {apartment?.project_name} · {apartment?.block_name} · {apartment?.entrance_name}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
                Квартира {apartment?.apartment_name}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', letterSpacing: '0.05em' }}>
                  {statusCfg.label}
                </Typography>
              </Box>
              {realDate && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {realDate}
                </Typography>
              )}
              <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' } }}>
                <Iconify icon="mingcute:close-line" width={20} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Box className={styles.notPrint}>
          <Grid container sx={{ minHeight: 340 }}>
            {/* ── Left: Layout image ── */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                bgcolor: 'background.neutral',
                borderRight: { md: '1px solid' },
                borderColor: { md: 'divider' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                gap: 1.5,
                minHeight: { xs: 220, md: 'auto' },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxHeight: 280,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  cursor: apartment?.layout_image ? 'zoom-in' : 'default',
                  '& img': { objectFit: 'contain', width: '100%', height: '100%' },
                }}
                onClick={apartment?.layout_image ? () => { setSelectedLayoutSrc(apartment?.layout_image); layerModal.onTrue(); } : undefined}
              >
                <FileThumbnail
                  imageView
                  file={apartment?.layout_image || ''}
                  imgSx={{ borderRadius: 1.5, maxHeight: 280, objectFit: 'contain' }}
                />
              </Box>

              {/* Planировка label */}
              {apartment?.layout_name && !isSold && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Планировка: <strong>{apartment?.layout_name}</strong>
                </Typography>
              )}

              {/* Extra images */}
              {images?.length > 0 && !isSold && (
                <Box sx={{ width: '100%' }}>
                  <PhotoGallery images={images} />
                </Box>
              )}
            </Grid>

            {/* ── Right: Details ── */}
            <Grid item xs={12} md={7}>
              <Stack sx={{ p: 2.5 }} gap={2}>

                {/* Key metrics grid */}
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <MetricCard icon="mdi:vector-square" label="Площадь" value={`${fNumber(apartment?.apartment_area)} м²`} />
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard icon="mdi:door" label="Комнат" value={apartment?.rooms_number} />
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard icon="mdi:stairs" label="Этаж" value={apartment?.floor_number} />
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard icon="mdi:office-building" label="Подъезд" value={apartment?.entrance_name} />
                  </Grid>
                </Grid>

                {/* Price — hidden for sold */}
                {!isSold && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(statusCfg.color, 0.06),
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Стоимость
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {fNumber(priceSquareMeter)} USD/м²
                        </Typography>
                        <IconButton size="small" color="warning" onClick={editAreaPrice.onTrue} sx={{ width: 20, height: 20 }}>
                          <Iconify icon="dashicons:edit" width={13} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {editAreaPrice.value ? (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <TextField
                          size="small"
                          value={termPrice}
                          onChange={(e) => setTermPrice(e.target.value)}
                          placeholder="0"
                          InputProps={{
                            endAdornment: <InputAdornment position="end"><Typography variant="caption">USD</Typography></InputAdornment>,
                            sx: { fontSize: 13 },
                          }}
                          sx={{ flex: 1 }}
                        />
                        <IconButton onClick={onSubmit} color="success" size="small">
                          <Iconify icon="material-symbols:save" width={18} />
                        </IconButton>
                        <IconButton onClick={editAreaPrice.onFalse} size="small">
                          <Iconify icon="mingcute:close-line" width={18} />
                        </IconButton>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
                        <Typography variant="h5" fontWeight={800} sx={{ color: statusCfg.color }}>
                          {dollarCurrency
                            ? `${fCurrency(totalUSD)} USD`
                            : `${fCurrency(totalUZS)} UZS`}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 0, px: 0.75, py: 0.25, fontSize: 11, height: 22, borderRadius: 1 }}
                          onClick={() => setDollarCurrency(!dollarCurrency)}
                        >
                          {dollarCurrency ? '→ UZS' : '→ USD'}
                        </Button>
                      </Stack>
                    )}
                  </Box>
                )}

                {/* Options */}
                {apartment?.apartment_option?.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block' }}>
                      Опции
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {apartment?.apartment_option?.map((opt) => {
                        const cfg = OPTION_CONFIG[opt.option_id] || {};
                        return (
                          <Chip
                            key={opt.option_value_id}
                            size="small"
                            icon={cfg.icon ? <Iconify icon={cfg.icon} width={14} /> : undefined}
                            label={opt.option_name}
                            variant="outlined"
                            sx={{ fontSize: 11, height: 26 }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* Temp reservation info */}
                {isTempReserved && apartment?.temp_reservation_info && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'warning.light',
                      bgcolor: alpha('#f59e0b', 0.06),
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                      <Iconify icon="mingcute:time-fill" width={16} sx={{ color: 'warning.main' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'warning.dark' }}>
                        Временная бронь
                      </Typography>
                    </Stack>
                    <Stack gap={0.5}>
                      <InfoRow label="Клиент" value={renderClientName(apartment?.temp_reservation_info)} />
                      <InfoRow label="Оператор" value={apartment?.temp_reservation_info?.operator} />
                      <InfoRow label="До" value={<Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>{apartment?.temp_reservation_info?.expire_date}</Typography>} />
                      {apartment?.temp_reservation_info?.comments && (
                        <InfoRow label="Комментарий" value={apartment?.temp_reservation_info?.comments} />
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Contract info (sold / booked) */}
                {(status === '2' || status === '3') && apartment?.contract_number && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                      <Iconify icon="mdi:file-document-outline" width={16} sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
                        Контракт
                      </Typography>
                    </Stack>
                    <Stack gap={0.5}>
                      <InfoRow
                        label="Тип"
                        value={
                          <Label variant="soft" color={apartment?.client_type === '1' ? 'info' : 'warning'} sx={{ fontSize: 11 }}>
                            {apartment?.client_type === '1' ? 'Юр. лицо' : 'Физ. лицо'}
                          </Label>
                        }
                      />
                      <InfoRow label="Клиент" value={renderClientName(apartment)} />
                      <InfoRow
                        label="Контракт"
                        value={
                          <Typography
                            component={RouterLink}
                            href={paths.dashboard.contracts.details(apartment?.contract_id)}
                            variant="body2"
                            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {apartment?.contract_number}
                          </Typography>
                        }
                      />
                    </Stack>
                  </Box>
                )}

              </Stack>
            </Grid>
          </Grid>

          {/* ── Payment calculator (collapsible) ── */}
          {!isSold && (
            <>
              <Divider />
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  onClick={() => setShowCalc((v) => !v)}
                  endIcon={<Iconify icon={showCalc ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />}
                  sx={{ fontSize: 13, color: 'text.secondary' }}
                >
                  Калькулятор рассрочки
                </Button>
              </Box>

              <Collapse in={showCalc}>
                <Divider />
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <Stack gap={1.5}>
                        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                          <Stack gap={1.5}>
                            <RHFCurrencyField
                              size="small"
                              name="initialPrice"
                              label="Первоначальный взнос"
                              placeholder="0"
                              decimalScale={0}
                              allowNegative
                              InputLabelProps={{ shrink: true }}
                              endAdornmentLabel={dollarCurrency ? 'USD' : 'UZS'}
                            />
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <RHFRadioGroup
                                  row
                                  name="time"
                                  label="Срок (мес)"
                                  spacing={1}
                                  options={[
                                    { value: '24', label: '24' },
                                    { value: '36', label: '36' },
                                    { value: '48', label: '48' },
                                  ]}
                                />
                              </Grid>
                              <Grid item xs={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <RHFPINFLField name="timeAnother" label="Свой срок" size="small" />
                              </Grid>
                            </Grid>
                          </Stack>
                        </FormProvider>

                        {/* Summary cards */}
                        <Grid container spacing={1} mt={0.5}>
                          {[
                            { label: 'Общая сумма', icon: 'material-symbols:attach-money', value: dollarCurrency ? `${fCurrency(totalUSD)} USD` : `${fCurrency(totalUZS)} UZS` },
                            { label: 'Первый взнос', icon: 'solar:hand-money-outline', value: `${fCurrency(initialVal)} ${dollarCurrency ? 'USD' : 'UZS'}` },
                            { label: 'Ежемесячно', icon: 'mdi:calendar-month', value: `${fCurrency(monthly)} ${dollarCurrency ? 'USD' : 'UZS'}` },
                          ].map(({ label, icon, value }) => (
                            <Grid item xs={12} key={label}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}
                              >
                                <Stack direction="row" alignItems="center" gap={0.75}>
                                  <Iconify icon={icon} width={16} sx={{ color: 'success.main' }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
                                </Stack>
                                <Typography variant="subtitle2" fontWeight={700}>{value}</Typography>
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={7}>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, maxHeight: 260, overflow: 'auto' }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>Месяц</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>Платёж</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.from({ length: months }).map((_, i) => (
                              <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell align="right">{fCurrency(monthly)} {dollarCurrency ? 'USD' : 'UZS'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </>
          )}
          </Box>

          {/* ────────────────────────────────────────────────────────────
              Печатный лист — скрыт на экране (.print), виден только при
              печати. CSS @media print прячет весь остальной интерфейс.
             ──────────────────────────────────────────────────────────── */}
          <Box className={styles.print}>
            {/* ═══════════ СТРАНИЦА 1: планировки и изображения ═══════════ */}
            {/* Шапка */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ pt: 2 }}
            >
              <Stack direction="row" gap={2} alignItems="center">
                <Box component="img" src="/logo/logo-1.png" sx={{ width: 44, height: 44 }} />
                <Typography variant="h4">Premium House</Typography>
              </Stack>
              {realDate && <Typography variant="h6">{realDate}</Typography>}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* Статус + название квартиры */}
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width: 12, height: 12, bgcolor: statusCfg.color }} />
              <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
                {statusCfg.label}
              </Typography>
            </Stack>
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', textTransform: 'uppercase', mb: 1.5 }}
            >
              Квартира - {apartment?.apartment_name}
            </Typography>

            {/* Изображения: планировка + доп. фото (по 2 в ряд) */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FileThumbnail
                  imageView
                  file={apartment?.layout_image || ''}
                  imgSx={{ borderRadius: 1, width: '100%' }}
                />
              </Grid>
              {images?.map((img, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <Grid item xs={6} key={idx}>
                  <FileThumbnail
                    imageView
                    file={img?.webp_file_path || ''}
                    imgSx={{ borderRadius: 1, width: '100%' }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* ═══════════ СТРАНИЦА 2: данные (с новой страницы) ═══════════ */}
            <Box className={styles.pageBreak}>
              {/* Шапка страницы 2 */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pt: 2 }}
              >
                <Typography variant="h6">Инфо</Typography>
                {realDate && <Typography variant="h6">{realDate}</Typography>}
              </Stack>
              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

              {/* Стоимость */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Стоимость</Typography>
                <Stack alignItems="flex-end">
                  <Label
                    variant="soft"
                    sx={{ background: '#ffdd00', color: '#000', fontWeight: 700, fontSize: 16, px: 1.5, py: 2 }}
                  >
                    {dollarCurrency ? `${fCurrency(totalUSD)} USD` : `${fCurrency(totalUZS)} UZS`}
                  </Label>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(priceSquareMeter)} USD/м²
                  </Typography>
                </Stack>
              </Stack>

              {/* Характеристики: 2 колонки */}
              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={0.75}>
                    <InfoRow label="Проект" value={apartment?.project_name || '—'} />
                    <InfoRow label="Блок" value={apartment?.block_name || '—'} />
                    <InfoRow label="Подъезд" value={apartment?.entrance_name || '—'} />
                    <InfoRow label="Этаж" value={apartment?.floor_number ?? '—'} />
                    <InfoRow label="Площадь" value={`${fNumber(apartment?.apartment_area)} м²`} />
                    <InfoRow label="Комнат" value={apartment?.rooms_number ?? '—'} />
                    <InfoRow label="Планировка" value={apartment?.layout_name || '—'} />
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  {apartment?.apartment_option?.length > 0 && (
                    <Stack spacing={0.75}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Опции
                      </Typography>
                      {apartment.apartment_option.map((opt) => {
                        const cfg = OPTION_CONFIG[opt.option_id] || {};
                        return (
                          <Stack
                            key={opt.option_value_id}
                            direction="row"
                            alignItems="center"
                            gap={1}
                          >
                            {cfg.icon && <Iconify icon={cfg.icon} width={18} />}
                            <Typography variant="body2">{opt.option_name}</Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                </Grid>
              </Grid>

              {/* Контракт (для забронированных) */}
              {status === '2' && apartment?.contract_number && (
                <>
                  <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle1">Контракт</Typography>
                    <InfoRow label="Клиент" value={renderClientName(apartment)} />
                    <InfoRow label="Договор" value={apartment?.contract_number} />
                  </Stack>
                </>
              )}

            {/* Условия оплаты */}
            <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
            <Typography fontWeight={600} mb={1}>
              Условия оплаты
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={0.5}>
                  <Iconify icon="material-symbols:attach-money" width={22} />
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    Общая сумма
                  </Typography>
                  <Typography variant="subtitle1">
                    {dollarCurrency ? `${fCurrency(totalUSD)} USD` : `${fCurrency(totalUZS)} UZS`}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={0.5}>
                  <Iconify icon="solar:hand-money-outline" width={22} />
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    Первоначальный взнос
                  </Typography>
                  <Typography variant="subtitle1">
                    {`${fCurrency(initialVal)} ${dollarCurrency ? 'USD' : 'UZS'}`}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={0.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Iconify icon="mdi:calendar" width={22} />
                    <Typography variant="caption">{months} месяцев</Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    Ежемесячный платёж
                  </Typography>
                  <Typography variant="subtitle1">
                    {`${fCurrency(monthly)} ${dollarCurrency ? 'USD' : 'UZS'}`}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {/* График рассрочки */}
            <Typography fontWeight={600} mt={2} mb={1}>
              График рассрочки
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Месяц</TableCell>
                    <TableCell align="right">Ежемесячный платёж</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: months }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell align="right">
                        {fCurrency(monthly)} {dollarCurrency ? 'USD' : 'UZS'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Примечание */}
            <Stack gap={1} mt={2}>
              <Typography align="center" variant="body2">
                Agar xonadonning narxini oshirishga to&apos;g&apos;ridan-to&apos;g&apos;ri
                ta&apos;sir ko&apos;rsatadigan soliq qonunlariga o&apos;zgartirishlar va
                qo&apos;shimchalar kiritilsa; shuningdek, kadastr ishlariga muvofiq ushbu
                xonadonning umumiy maydonidagi o&apos;zgarishlar natijasida kompaniya
                ko&apos;rsatilgan narxlarni bir tomonlama o&apos;zgartirishga haqli.
              </Typography>
              <Typography align="center" variant="caption">
                Ko&apos;rsatilgan narxlar ma&apos;lumot uchun bo&apos;lib, kompaniya ushbu narxlarni
                shartnoma tuzilgunga qadar bir tomonlama o&apos;zgartirishga haqli.
              </Typography>
            </Stack>

            {/* QR-код */}
            <Stack className={styles.qrContainer} justifyContent="center" alignItems="center" mt={1}>
              <QRCode
                value={apartment?.vr_url || 'https://vr.ph.town/'}
                logoImage="/logo/logo-1.png"
                logoWidth={30}
                logoHeight={30}
                size={150}
                bgColor="#FFFFFF"
                fgColor="#000000"
                qrStyle="dots"
                logoPadding={1}
                logoPaddingStyle="circle"
                eyeRadius={[
                  [10, 10, 0, 10],
                  [10, 10, 10, 0],
                  [10, 0, 10, 10],
                ]}
              />
            </Stack>
            </Box>
          </Box>
        </DialogContent>

        {/* ── Actions ── */}
        <DialogActions className={styles.notPrint} sx={{ px: 2.5, py: 1.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          {/* Temp reserved: dereserve */}
          {isTempReserved && (
            <Button
              color="error"
              variant="contained"
              startIcon={<Iconify icon="tdesign:delete-time" />}
              onClick={dereserveDialog.onTrue}
            >
              Удалить бронь
            </Button>
          )}

          {/* Free: reserve + contract + VR */}
          {isFree && (
            <>
              <Button
                color="info"
                variant="contained"
                startIcon={<Iconify icon="mingcute:time-fill" />}
                onClick={reserveModal.onTrue}
              >
                Забронировать
              </Button>
              <Button
                variant="soft"
                color="warning"
                startIcon={<Iconify icon="healthicons:i-documents-accepted-outline" />}
                component={RouterLink}
                href={paths.dashboard.contracts.new(apartment?.apartment_id)}
              >
                Оформить
              </Button>
              {apartment?.vr_url && (
                <Button
                  variant="soft"
                  color="success"
                  startIcon={<Iconify icon="mdi:rotate-360" />}
                  onClick={() => window.open(apartment.vr_url, '_blank', 'noopener')}
                >
                  360 Tour
                </Button>
              )}
            </>
          )}

          <Box sx={{ flex: 1 }} />

          {!isSold && (
            <Button variant="outlined" color="inherit" startIcon={<Print />} onClick={handlePrint}>
              Печать
            </Button>
          )}
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reserve dialog */}
      {reserveModal.value && (
        <ReserveRoomDialog
          apartmentId={apartment?.apartment_id}
          open={reserveModal.value}
          onClose={() => { onClose(); reserveModal.onFalse(); }}
          onReserve={reserve}
        />
      )}

      {/* Dereserve confirm */}
      {dereserveDialog.value && (
        <ConfirmDialog
          open={dereserveDialog.value}
          onClose={dereserveDialog.onFalse}
          title="Удаление брони"
          content="Вы уверены, что хотите удалить бронь?"
          action={
            <LoadingButton variant="contained" color="error" loading={loadingDereserve} onClick={onDereserve}>
              Удалить
            </LoadingButton>
          }
        />
      )}

      {/* Image lightbox */}
      <Lightbox
        controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
        open={layerModal.value}
        close={() => { layerModal.onToggle(); setSelectedLayoutSrc(null); }}
        slides={[{ src: selectedLayoutSrc, width: '100%', height: '100%' }]}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" alignItems="baseline" gap={1}>
      <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 80 }}>
        {label}
      </Typography>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2">{value}</Typography>
      ) : (
        value
      )}
    </Stack>
  );
}

InfoRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
};

CheckerboardRoomDetails.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  roomId: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};
