import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ClientDetailInfo({ customer, delivery, payment, shippingAddress }) {
  const renderClientInfo = (
    <>
      <CardHeader title="Информация клиента" />
      <Stack direction="row" sx={{ p: 3 }}>
        <Avatar
          alt={customer.name}
          src={customer.avatarUrl}
          sx={{ width: 48, height: 48, mr: 2 }}
        />

        <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2">Салахиддинов Сухроб</Typography>

          <Box sx={{ color: 'text.secondary' }}>+998000000000</Box>

          <Box>
            Дополнительные номера:
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              +998000000001
            </Box>
          </Box>

          <Chip color="primary" label="Физическое лицо" />
        </Stack>
      </Stack>
    </>
  );

  const renderPassportInfo = (
    <>
      <CardHeader title="Паспортные данные" />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Серия и номер
          </Box>
          AA 111111
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            ПИНФЛ
          </Box>
          12345678901234
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Дата рождения
          </Box>
          12345678901234
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Кем выдан
          </Box>
          <Link underline="always" color="inherit">
            Бухоро ИИБ
          </Link>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Когда выдан
          </Box>
          <Link underline="always" color="inherit">
            04.04.2012
          </Link>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Срок годности
          </Box>
          <Link underline="always" color="inherit">
            03.04.2012
          </Link>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Файл:
          </Box>
          <Link underline="always" href="#">
            Скачать файл
          </Link>
        </Stack>
      </Stack>
    </>
  );

  const renderAdress = (
    <>
      <CardHeader title="Адрес" />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Область
          </Box>
          {shippingAddress.fullAddress}
        </Stack>

        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Город/Район
          </Box>
          {shippingAddress.phoneNumber}
        </Stack>
        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            МФЙ, улица, дом
          </Box>
          {shippingAddress.phoneNumber}
        </Stack>
        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Место работы
          </Box>
          {shippingAddress.phoneNumber}
        </Stack>
      </Stack>
    </>
  );

  const renderPayment = (
    <>
      <CardHeader title="Payment" />
      <Stack direction="row" alignItems="center" sx={{ p: 3, typography: 'body2' }}>
        <Box component="span" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          Phone number
        </Box>

        {payment.cardNumber}
        <Iconify icon="logos:mastercard" width={24} sx={{ ml: 0.5 }} />
      </Stack>
    </>
  );

  return (
    <Card>
      <Stack>
        {renderClientInfo}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderPassportInfo}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderAdress}

        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
        {/* 
        {renderPayment} */}
      </Stack>
    </Card>
  );
}

ClientDetailInfo.propTypes = {
  customer: PropTypes.object,
  delivery: PropTypes.object,
  payment: PropTypes.object,
  shippingAddress: PropTypes.object,
};
