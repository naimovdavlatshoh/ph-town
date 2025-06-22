/* eslint-disable no-unsafe-optional-chaining */

// eslint-disable-next-line import/no-extraneous-dependencies
import clsx from 'clsx';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { QRCode } from 'react-qrcode-logo';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import { Print } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import IconButton from '@mui/material/IconButton';
import {
  Link,
  Grid,
  Paper,
  Table,
  Dialog,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber, fCurrency } from 'src/utils/format-number';
import getStatusColor, { getStatusTitle } from 'src/utils/apartment-status';

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

const getOptionIcon = (optionId) => {
  if (optionId === '1') return 'carbon:building';
  if (optionId === '2') return 'material-symbols:balcony';
  if (optionId === '3') return 'carbon:building-insights-3';
  if (optionId === '4') return 'fluent-mdl2:repair';

  return '';
};

export default function CheckerboardRoomDetails({
  roomId,
  open,
  onClose,
  onDelete,
  reserve,
  dereserve,
  ...other
}) {
  const { currency } = useGetCurrency();
  const { apartment } = useGetApartmentInfo(roomId);
  const { images } = useGetApartmentImages(roomId);
  const toggleTags = useBoolean(true);

  const [priceSquareMeter, setPriceSquareMeter] = useState(0);
  const [termPrice, setTermPrice] = useState(0);

  const editAreaPrice = useBoolean();
  const reserveModal = useBoolean();
  const dereserveDialog = useBoolean();

  const share = useBoolean();

  const properties = useBoolean(true);
  const contractProp = useBoolean(true);
  const layerModal = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [inviteEmail, setInviteEmail] = useState('');

  const [selectedLayoutSrc, sestSelectedLayoutSrc] = useState();
  const [loadingDereserve, setLoadingDereserve] = useState(false);
  const [dollarCurrency, setDollarCurrency] = useState(false);
  const [toggleBron, setToggleBron] = useState(false);
  const [realDate, setRealDate] = useState('');

  const toggleCurrency = () => setDollarCurrency(!dollarCurrency);

  const handleChangeInvite = useCallback((event) => {
    setInviteEmail(event.target.value);
  }, []);

  useEffect(
    () => () => {
      sestSelectedLayoutSrc(null);
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

  const defaultValues = useMemo(
    () => ({
      timeAnother: '6',
      time: '',
      initialPrice: '0',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewCalcSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = () => {
    setPriceSquareMeter(termPrice);
    editAreaPrice.onFalse();
  };

  useEffect(() => {
    if (methods.watch('timeAnother')) {
      methods.setValue('time', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('timeAnother')]);

  useEffect(() => {
    if (methods.watch('time')) {
      methods.setValue('timeAnother', '');
    }
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
      methods.setValue(
        'initialPrice',
        `${methods.watch('initialPrice')?.replace(/,/g, '') / currency}` || '0'
      );
    } else {
      methods.setValue(
        'initialPrice',
        `${methods.watch('initialPrice')?.replace(/,/g, '') * currency}` || '0'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, dollarCurrency]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken'); // sessionStorage dan tokenni olish

    fetch('https://testapi.ph.town/api/v1/realdate', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // tokenni headerga qo‘shish
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => setRealDate(data.date))
      .catch((err) => console.error('Xatolik:', err));
  }, []);
  const onDereserve = () => {
    setLoadingDereserve(true);
    try {
      dereserve(apartment?.apartment_id, () => {
        enqueueSnackbar('Бронь успешно удалена');
        setLoadingDereserve(false);
        dereserveDialog.onFalse();
      });
    } catch (error) {
      enqueueSnackbar('Ошибка при удалении', {
        variant: 'error',
      });

      setLoadingDereserve(false);
    }
  };

  const renderProperties = (
    <Grid container spacing={2}>
      {apartment?.stock_status !== '3' && (
        <>
          <Grid item xs={6}>
            {' '}
            <Stack spacing={1.5} py={1}>
              {properties.value && (
                <>
                  {/* <Stack
                direction="row"
                sx={{ typography: 'caption', textTransform: 'capitalize' }}
                className={styles.notPrint}
              >
                <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                  Добавлена
                </Box>
                {fDateTime(apartment?.created_at)}
              </Stack> */}
                  <Stack
                    direction="row"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                  >
                    <Typography variant="body2" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                      Блок
                    </Typography>
                    <Typography variant="body2">{apartment?.block_name}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                  >
                    <Typography variant="body2" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                      Этаж
                    </Typography>
                    <Typography variant="body2">{apartment?.floor_number}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                  >
                    <Typography variant="body2" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                      Площадь
                    </Typography>
                    <Typography variant="body2">{fNumber(apartment?.apartment_area)} м²</Typography>
                  </Stack>
                  {/* <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                  Цена за м²
                </Box>
                {fNumber(currency * apartment?.price_square_meter)} сум
              </Stack> */}

                  <Stack
                    direction="row"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                    alignItems="center"
                  >
                    {editAreaPrice.value ? (
                      <Stack
                        direction="row"
                        sx={{ typography: 'caption', textTransform: 'capitalize' }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ width: 80, color: 'text.secondary', mr: 2 }}
                        >
                          {' '}
                          Цена за м²
                        </Typography>
                        <Stack direction="row" alignItems="center">
                          <FormProvider methods={methods} onSubmit={onSubmit}>
                            <TextField
                              size="small"
                              label="Цена за м²"
                              value={termPrice}
                              onChange={(e) => setTermPrice(e.target.value)}
                              placeholder="0.00"
                              decimalScale={0}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Box component="span" sx={{ color: 'text.disabled' }}>
                                      USD
                                    </Box>
                                  </InputAdornment>
                                ),
                                sx: {
                                  width: 180,
                                  '& input': {
                                    padding: '4px 10px',
                                  },
                                },
                              }}
                            />
                          </FormProvider>
                          <IconButton onClick={onSubmit} color="success">
                            <Iconify icon="material-symbols:save" width={16} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    ) : (
                      <>
                        <Stack
                          direction="row"
                          sx={{ typography: 'caption', textTransform: 'capitalize' }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ width: 80, color: 'text.secondary', mr: 2 }}
                          >
                            {' '}
                            Цена за м²
                          </Typography>
                          <Typography variant="body2">
                            {' '}
                            {dollarCurrency
                              ? `${fNumber(priceSquareMeter)} USD`
                              : `${fNumber(currency * priceSquareMeter)} UZS`}
                          </Typography>
                        </Stack>
                        <IconButton color="warning" onClick={editAreaPrice.onTrue}>
                          <Iconify icon="dashicons:edit" width={16} />
                        </IconButton>
                      </>
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                  >
                    <Typography variant="body2" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                      Количество комнат
                    </Typography>
                    <Typography variant="body2"> {apartment?.rooms_number}</Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={1.5} py={1}>
              {apartment?.apartment_option?.length > 0 && (
                <>
                  <Stack
                    direction="row"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                  >
                    <Typography variant="body2" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                      Опции
                    </Typography>
                  </Stack>
                  <Stack gap={0.5}>
                    {apartment?.apartment_option?.map((option) => (
                      <Stack key={option.option_id} direction="row" gap={1} alignItems="center">
                        <Iconify sx={{ width: 20 }} icon={getOptionIcon(option.option_id)} />
                        <Typography variant="body2">{option.option_name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          </Grid>
        </>
      )}
    </Grid>
  );

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

  const renderContractInfo = (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        Контракт
        {apartment?.stock_status !== '3' && (
          <IconButton size="small" onClick={properties.onToggle}>
            <Iconify
              icon={
                contractProp.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
              }
            />
          </IconButton>
        )}
      </Stack>

      {contractProp.value && (
        <>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              {apartment?.client_type === '1' ? (
                <Label color="info">Юр.лицо</Label>
              ) : (
                <Label color="warning">Физ.лицо</Label>
              )}
            </Box>
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              Клиент
            </Box>
            {renderClientName(apartment)}
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              Контракт
            </Box>
            <Link
              component={RouterLink}
              href={paths.dashboard.contracts.details(apartment?.contract_id)}
            >
              {apartment?.contract_number}
            </Link>
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              Дата
            </Box>
            <Typography
              variant="p"
              href={paths.dashboard.contracts.details(apartment?.contract_id)}
            >
              {apartment?.created_at}
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  );

  console.log(apartment);


  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                onClick={toggleCurrency}
                component="img"
                src="/logo/logo-1.png"
                sx={{
                  width: 40,
                  height: 40,
                  display: 'inline-flex',
                }}
              />
              <Typography variant="h3">Premium House</Typography>
            </Stack>
            <Typography variant="h6">{realDate && realDate}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ px: 2.5, pt: 2.5, fontSize: 10, textTransform: 'uppercase' }}
          >
            <Box
              sx={{
                background: getStatusColor(apartment?.stock_status),
                width: 12,
                height: 12,
                mr: 1,
              }}
            />{' '}
            <Typography variant="subtitle2">{getStatusTitle(apartment?.stock_status)}</Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2.5, pb: 2.5 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              Квартира - {apartment?.apartment_name}
            </Typography>
            {/* <Typography sx={{ fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
              ID: {apartment?.apartment_id}
            </Typography> */}
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={6} className={styles.print}>
              <FileThumbnail
                imageView
                file={apartment?.layout_image || ''}
                imgSx={{ borderRadius: 1 }}
                onClick={
                  apartment?.layout_image
                    ? () => {
                        sestSelectedLayoutSrc(apartment?.layout_image);
                        layerModal.onTrue();
                      }
                    : null
                }
              />
            </Grid>

            {images?.map((img, idx) => (
              <Grid item xs={6} className={styles.print} key={idx}>
                <FileThumbnail
                  imageView
                  file={img?.webp_file_path}
                  imgSx={{ borderRadius: 1 }}
                  onClick={
                    img?.webp_file_path
                      ? () => {
                          sestSelectedLayoutSrc(img?.webp_file_path);
                          layerModal.onTrue();
                        }
                      : null
                  }
                />
              </Grid>
            ))}
            <Grid item xs={4} className={styles.notPrint}>
              {' '}
              <Stack
                spacing={2.5}
                justifyContent="center"
                sx={{
                  p: 2.5,
                  bgcolor: 'background.neutral',
                }}
                className={styles.notPrint}
              >
                <FileThumbnail
                  imageView
                  file={apartment?.layout_image || ''}
                  sx={{ width: 64, height: 64 }}
                  imgSx={{ borderRadius: 1 }}
                  onClick={
                    apartment?.layout_image
                      ? () => {
                          sestSelectedLayoutSrc(apartment?.layout_image);
                          layerModal.onTrue();
                        }
                      : null
                  }
                />

                {apartment?.stock_status !== '3' && (
                  <>
                    <Typography variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
                      Планировка: {apartment?.layout_name}
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ typography: 'subtitle2' }}
                    >
                      Изображения помещения
                    </Stack>
                    <>
                      {images?.length > 0 ? (
                        <Stack>
                          <PhotoGallery images={images} />
                        </Stack>
                      ) : (
                        <Typography variant="caption">Нет дополнительных изображений</Typography>
                      )}
                    </>
                  </>
                )}
              </Stack>
            </Grid>

            <Grid item xs={8} className={styles.notPrint}>
              {apartment?.stock_status !== '3' && (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ typography: 'subtitle2' }}
                  >
                    <Typography variant="h6">Инфо</Typography>

                    <IconButton size="small" onClick={properties.onToggle}>
                      <Iconify
                        icon={
                          properties.value
                            ? 'eva:arrow-ios-upward-fill'
                            : 'eva:arrow-ios-downward-fill'
                        }
                      />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ typography: 'caption', textTransform: 'capitalize' }}
                    py={1}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ width: 80, color: 'text.secondary', mr: 2 }}
                    >
                      Стоимость
                    </Typography>
                    <Stack alignItems="flex-end">
                      <Label
                        variant="soft"
                        sx={{ background: '#ffdd00', color: '#000', fontWeight: 500 }}
                      >
                        <Typography variant="body2">
                          {dollarCurrency
                            ? `${fNumber(apartment?.apartment_area * priceSquareMeter)} USD`
                            : `${fNumber(
                                currency * apartment?.apartment_area * priceSquareMeter
                              )} UZS`}
                        </Typography>
                      </Label>
                      <Typography variant="body2" sx={{ color: '#637381' }}>
                        {fNumber(
                          Number(apartment?.apartment_area * priceSquareMeter) /
                            Number(priceSquareMeter)
                        )}{' '}
                        М²
                      </Typography>
                    </Stack>
                  </Stack>
                </>
              )}

              {(apartment?.stock_status === '2' || apartment?.stock_status === '3') && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {renderContractInfo}
                </>
              )}
              <Divider sx={{ borderStyle: 'dashed' }} />
              {renderProperties}
              {/* <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ typography: 'subtitle2' }}
              className={styles.notPrint}
            >
              Изображения помещения
            </Stack>
            {images?.length > 0 ? (
              <Stack className={styles.notPrint}>
                <PhotoGallery images={images} />
              </Stack>
            ) : (
              <Typography variant="caption">Нет дополнительных изображений</Typography>
            )} */}

              <Lightbox
                controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
                open={layerModal.value}
                close={() => {
                  layerModal.onToggle();
                  sestSelectedLayoutSrc(null);
                }}
                slides={[
                  {
                    src: selectedLayoutSrc,
                    width: '100%',
                    height: '100%',
                  },
                ]}
              />
            </Grid>
            <Grid item xs={12} className={clsx(styles.print, styles.pageBreak)}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ typography: 'subtitle2' }}
              >
                <Typography variant="h6">Инфо</Typography>
                <Stack direction="row" alignItems="center">
                  <Typography variant="h6">{realDate && realDate}</Typography>
                  <IconButton size="small" onClick={properties.onToggle}>
                    <Iconify
                      icon={
                        properties.value
                          ? 'eva:arrow-ios-upward-fill'
                          : 'eva:arrow-ios-downward-fill'
                      }
                    />
                  </IconButton>
                </Stack>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ typography: 'caption', textTransform: 'capitalize' }}
                py={1}
              >
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ width: 80, color: 'text.secondary', mr: 2 }}
                >
                  Стоимость
                </Typography>
                <Stack alignItems="flex-end">
                  <Label
                    variant="soft"
                    sx={{ background: '#ffdd00', color: '#000', fontWeight: 500 }}
                  >
                    <Typography variant="body2">
                      {dollarCurrency
                        ? `${fNumber(apartment?.apartment_area * priceSquareMeter)} USD`
                        : `${fNumber(currency * apartment?.apartment_area * priceSquareMeter)} UZS`}
                    </Typography>
                  </Label>
                  <Typography variant="body2" sx={{ fontSize: 12, color: '#637381' }}>
                    {fNumber(
                      Number(apartment?.apartment_area * priceSquareMeter) /
                        Number(priceSquareMeter)
                    )}{' '}
                    М²
                  </Typography>
                </Stack>
              </Stack>
              {(apartment?.stock_status === '2' || apartment?.stock_status === '3') && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {renderContractInfo}
                </>
              )}
              <Divider sx={{ borderStyle: 'dashed' }} />
              {renderProperties}
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ typography: 'subtitle2' }}
                className={styles.notPrint}
              >
                <Typography variant="body2">Изображения помещения</Typography>
              </Stack>
              {images?.length > 0 ? (
                <Stack className={styles.notPrint}>
                  <PhotoGallery images={images} />
                </Stack>
              ) : (
                <Typography variant="caption">Нет дополнительных изображений</Typography>
              )}

              {/* <Lightbox
              controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
              open={layerModal.value}
              close={() => {
                layerModal.onToggle();
                sestSelectedLayoutSrc(null);
              }}
              slides={[
                {
                  src: selectedLayoutSrc,
                  width: '100%',
                  height: '100%',
                },
              ]}
            /> */}
            </Grid>
          </Grid>
          {apartment?.stock_status !== '3' && (
            <>
              <Typography fontWeight={600} mt={1} mb={1}>
                Условия оплаты
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      width={40}
                      height={40}
                      borderRadius="100%"
                      border="1px solid #e8ecee"
                    >
                      <Iconify icon="material-symbols:attach-money" />
                    </Box>
                    <Typography sx={{ color: 'success.main' }}>Общая сумма</Typography>
                    <Typography variant="h6">
                      {dollarCurrency
                        ? `${fCurrency(apartment?.apartment_area * priceSquareMeter)} USD`
                        : `${fCurrency(
                            currency * apartment?.apartment_area * priceSquareMeter
                          )} UZS`}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      width={40}
                      height={40}
                      borderRadius="100%"
                      border="1px solid #e8ecee"
                    >
                      <Iconify icon="solar:hand-money-outline" />
                    </Box>
                    <Typography sx={{ color: 'success.main' }}>Первоначальный взнос</Typography>
                    <Typography variant="h6">
                      {`${fCurrency(methods.watch('initialPrice')?.replace(/,/g, ''))} ${
                        dollarCurrency ? 'USD' : 'UZS'
                      }`}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={40}
                        height={40}
                        borderRadius="100%"
                        border="1px solid #e8ecee"
                      >
                        <Iconify icon="mdi:calendar" />
                      </Box>
                      {methods.watch('time') ? methods.watch('time') : methods.watch('timeAnother')}{' '}
                      месяц
                    </Stack>
                    <Typography sx={{ color: 'success.main' }}>Ежемесячный платеж</Typography>
                    <Typography variant="h6">
                      {dollarCurrency
                        ? `${fCurrency(
                            (apartment?.apartment_area * priceSquareMeter -
                              (methods.watch('initialPrice')?.replace(/,/g, '') || 0)) /
                              (methods.watch('timeAnother')
                                ? methods.watch('timeAnother')
                                : methods.watch('time'))
                          )} USD`
                        : `${fCurrency(
                            (currency * apartment?.apartment_area * priceSquareMeter -
                              (methods.watch('initialPrice')?.replace(/,/g, '') || 0)) /
                              (methods.watch('timeAnother')
                                ? methods.watch('timeAnother')
                                : methods.watch('time'))
                          )} UZS`}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Typography fontWeight={600} mt={2} mb={1} className={styles.notPrint}>
                Первоначальный взнос по желанию
              </Typography>
              <Grid container spacing={2} className={styles.notPrint}>
                <Grid item xs={4}>
                  <Stack sx={{ border: '1px solid #e8ecee', borderRadius: 0.5, p: 1 }} gap={1}>
                    <FormProvider methods={methods} onSubmit={onSubmit}>
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
                      <Grid container spacing={4}>
                        <Grid item xs={6}>
                          <RHFRadioGroup
                            row
                            name="time"
                            label="Срок(месяц)"
                            spacing={2}
                            options={[
                              { value: '24', label: '24' },
                              { value: '36', label: '36' },
                              { value: '48', label: '48' },
                            ]}
                          />
                        </Grid>
                        <Grid item xs={6} display="flex" alignItems="flex-end">
                          <RHFPINFLField name="timeAnother" label="" size="small" />
                        </Grid>
                      </Grid>
                    </FormProvider>
                  </Stack>
                </Grid>
                <Grid item xs={8}>
                  <TableContainer component={Paper}>
                    <Table size="small" aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Месяц</TableCell>
                          <TableCell align="right">Ежемесячный платёж</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from({
                          length: methods.watch('timeAnother')
                            ? +methods.watch('timeAnother')
                            : +methods.watch('time'),
                        }).map((_, index) => (
                          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              {index + 1}
                            </TableCell>
                            <TableCell align="right">
                              {dollarCurrency
                                ? `${fCurrency(
                                    (apartment?.apartment_area * priceSquareMeter -
                                      (methods.watch('initialPrice')?.replace(/,/g, '') || 0)) /
                                      (methods.watch('timeAnother')
                                        ? methods.watch('timeAnother')
                                        : methods.watch('time'))
                                  )} USD`
                                : `${fCurrency(
                                    (currency * apartment?.apartment_area * priceSquareMeter -
                                      (methods.watch('initialPrice')?.replace(/,/g, '') || 0)) /
                                      (methods.watch('timeAnother')
                                        ? methods.watch('timeAnother')
                                        : methods.watch('time'))
                                  )} UZS`}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </>
          )}

          <Stack gap={1} mt={2} className={styles.print}>
            <Typography align="center" variant="body2">
              Agar xonadonning narxini oshirishga to&apos;g&apos;ridan-to&apos;g&apos;ri ta&apos;sir
              ko&apos;rsatadigan soliq qonunlariga o&apos;zgartirishlar va qo&apos;shimchalar
              kiritilsa; shuningdek, kadastr ishlariga muvofiq ushbu xonadonning umumiy maydonidagi
              o&apos;zgarishlar natijasida kompaniya ko’rsatilgan narxlarni bir tomonlama
              o&apos;zgartirishga haqli.
            </Typography>
            <Typography align="center" variant="caption">
              Ko&apos;rsatilgan narxlar ma&apos;lumot uchun bo&apos;lib, kompaniya ushbu narxlarni
              shartnoma tuzilgunga qadar bir tomonlama o&apos;zgartirishga haqli.
            </Typography>
          </Stack>
          <Stack mt={1} className={styles.print} sx={{ background: 'red' }} justifyContent="center">
            <QRCode
              value={apartment?.vr_url || 'https://vr.ph.town/'}
              logoImage="/logo/logo-1.png"
              logoWidth={30}
              logoHeight={30}
              size={150}
              bgColor="#FFFFFF"
              fgColor="#000000"
              qrStyle="dots" // Стиль QR-кода
              logoPadding={1} // Отступ вокруг логотипа
              logoPaddingStyle="circle" // Форма отступа
              eyeRadius={[
                [10, 10, 0, 10], // Верхний левый
                [10, 10, 10, 0], // Верхний правый
                [10, 0, 10, 10], // Нижний левый
              ]}
            />
          </Stack>
        </DialogContent>
        <DialogActions className={styles.notPrint}>
          {apartment?.stock_status === '4' && (
            <Stack direction="row" alignItems="center" gap={2}>
              <Typography>
                {!toggleBron && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setToggleBron(!toggleBron);
                    }}
                    sx={{ px: 4, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    Временный бронь
                    <VisibilityOutlinedIcon fontSize="small" />
                  </Button>
                )}
                {toggleBron && (
                  <>
                    Клиент{' '}
                    <Link
                      component={RouterLink}
                      href={paths.dashboard.clients.details(
                        apartment?.temp_reservation_info?.client_id
                      )}
                    >
                      {`${renderClientName(apartment?.temp_reservation_info)}`}
                    </Link>{' '}
                    забронировал помещение до <span style={{color:"red"}}>{apartment?.temp_reservation_info?.expire_date}</span> через
                    оператора <span style={{color:"green"}}>{apartment?.temp_reservation_info?.operator}{' '}</span> <br />
                    Комментарий : <span style={{color:"green"}}>{apartment?.temp_reservation_info?.comments}</span>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => setToggleBron(false)}
                      sx={{ textTransform: 'none', minWidth: 0, ml: 1 }}
                    >
                      Закрыть
                    </Button>
                  </>
                )}
              </Typography>
              <Button
                color="error"
                variant="contained"
                startIcon={<Iconify icon="tdesign:delete-time" />}
                onClick={dereserveDialog.onTrue}
                sx={{ px: 4, mr: 2 }}
              >
                Удалить бронь
              </Button>
            </Stack>
          )}
          {apartment?.stock_status === '1' && (
            <>
              <Link
                to={apartment?.vr_url || 'https://vr.ph.town/'}
                target="_blank"
                rel="noopener"
                underline="none"
                component={RouterLink}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{ height: 1, py: 0.8 }}
                >
                  360 Tour
                </Button>
              </Link>

              <Stack sx={{ p: 2.5 }} className={styles.notPrint} direction="row" gap={2}>
                <Button
                  fullWidth
                  color="info"
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:time-fill" />}
                  onClick={reserveModal.onTrue}
                  sx={{ px: 4 }}
                >
                  Забронировать
                </Button>{' '}
                <Button
                  fullWidth
                  variant="soft"
                  color="warning"
                  startIcon={<Iconify icon="healthicons:i-documents-accepted-outline" />}
                  component={RouterLink}
                  href={paths.dashboard.contracts.new(apartment?.apartment_id)}
                >
                  Оформить
                </Button>{' '}
              </Stack>
            </>
          )}
          {apartment?.stock_status !== '3' && (
            <Button sx={{ px: 4 }} variant="contained" onClick={handlePrint} startIcon={<Print />}>
              Распечатать
            </Button>
          )}
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      {reserveModal.value && (
        <ReserveRoomDialog
          apartmentId={apartment?.apartment_id}
          open={reserveModal.value}
          onClose={() => {
            onClose();
            reserveModal.onFalse();
          }}
          onReserve={reserve}
        />
      )}

      {dereserveDialog.value && (
        <ConfirmDialog
          open={dereserveDialog.value}
          onClose={dereserveDialog.onFalse}
          title="Удаление бронь"
          content="Вы уверены что хотите удалить бронь?"
          action={
            <LoadingButton
              variant="contained"
              color="error"
              loading={loadingDereserve}
              onClick={onDereserve}
            >
              Удалить
            </LoadingButton>
          }
        />
      )}
    </>
  );
}

CheckerboardRoomDetails.propTypes = {
  open: PropTypes.bool,
  item: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  favorited: PropTypes.bool,
  onCopyLink: PropTypes.func,
  onFavorite: PropTypes.func,
  roomId: PropTypes.string,
  reserve: PropTypes.func,
  dereserve: PropTypes.func,
};
