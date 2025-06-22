import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Chip, Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function ClientDetailInfo({ data }) {
  const { user } = useAuthContext();
  const renderClientInfo = (
    <>
      <CardHeader title="Информация клиента" />
      <Stack direction="row" sx={{ p: 3 }}>
        {/* <Avatar alt={1} src={2} sx={{ width: 48, height: 48, mr: 2 }} /> */}

        <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2">
            {data?.client_type === '0'
              ? `${data?.client_surname || ''} ${data?.client_name || ''} ${
                  data?.client_fathername || ''
                }`
              : data?.business_name}
          </Typography>

          {data?.business_director_name && (
            <Box>
              Директор:
              <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
                {data?.business_director_name}
              </Box>
            </Box>
          )}

          {data?.phone_option?.find((phone) => phone.is_main === '1') && (
            <Box>
              Номер телефона:
              <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
                {data?.phone_option?.find((phone) => phone.is_main === '1')?.phone_number}
              </Box>
            </Box>
          )}
          {data?.phone_option?.find((phone) => phone.is_main === '0') && (
            <Box>
              Дополнительные номера:
              <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
                {data?.phone_option
                  ?.filter((phone) => phone.is_main === '0')
                  .map((phone) => `${phone?.phone_number}; `)}
              </Box>
            </Box>
          )}

          <Chip
            color="primary"
            label={data?.client_type === '0' ? 'Физическое лицо' : 'Юридическое лицо'}
          />
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
          {data?.passport_series}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            ПИНФЛ
          </Box>
          {data?.pinfl}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Дата рождения
          </Box>
          {data?.date_of_birth}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Кем выдан
          </Box>
          <Link underline="always" color="inherit">
            {data?.given_by}
          </Link>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Когда выдан
          </Box>
          <Link underline="always" color="inherit">
            {data?.date_of_issue}
          </Link>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Срок годности
          </Box>
          <Link underline="always" color="inherit">
            {data?.expire_date}
          </Link>
        </Stack>
        {['1', '2'].includes(user?.role) && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Файл:
            </Box>
            <Link underline="always" href={data?.download_link}>
              Скачать файл
            </Link>
          </Stack>
        )}
      </Stack>
    </>
  );

  const renderBusinessPassportInfo = (
    <>
      <CardHeader title="Данные клиента" />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {data?.passport_series && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Серия и номер
            </Box>
            {data?.passport_series}
          </Stack>
        )}

        {data?.given_by && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Кем выдан
            </Box>
            <Link underline="always" color="inherit">
              {data?.given_by}
            </Link>
          </Stack>
        )}

        {data?.date_of_issue && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Когда выдан
            </Box>
            <Link underline="always" color="inherit">
              {data?.date_of_issue}
            </Link>
          </Stack>
        )}

        {data?.business_bank_number && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Лицевой счет
            </Box>
            {data?.business_bank_number}
          </Stack>
        )}

        {data?.business_bank_name && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Банк
            </Box>
            {data?.business_bank_name}
          </Stack>
        )}

        {data?.data?.business_mfo && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              МФО
            </Box>
            {data?.business_mfo}
          </Stack>
        )}
        {data?.business_inn && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              ИНН
            </Box>
            {data?.business_inn}
          </Stack>
        )}
        {['1', '2'].includes(user?.role) && (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Файл:
            </Box>
            <Link underline="always" href={data?.file_path}>
              Скачать файл
            </Link>
          </Stack>
        )}
      </Stack>
    </>
  );

  const renderAdress = (
    <>
      <CardHeader title="Адрес" />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {data?.region_name && (
          <Stack direction="row">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Область
            </Box>
            {data?.region_name}
          </Stack>
        )}

        {data?.city_name && (
          <Stack direction="row">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Город/Район
            </Box>
            {data?.city_name}
          </Stack>
        )}

        {data?.address_by_passport && (
          <Stack direction="row">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              МФЙ, улица, дом
            </Box>
            {data?.address_by_passport}
          </Stack>
        )}

        {data?.address_by_passport && (
          <Stack direction="row">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Место работы
            </Box>
            {data?.address_by_passport}
          </Stack>
        )}
      </Stack>
    </>
  );

  const renderAdressBusiness = (
    <>
      <CardHeader title="Адрес" />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Область
          </Box>
          {data?.region_name}
        </Stack>

        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Город/Район
          </Box>
          {data?.city_name}
        </Stack>
        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            МФЙ, улица, дом
          </Box>
          {data?.business_address}
        </Stack>
      </Stack>
    </>
  );

  // const renderPayment = (
  //   <>
  //     <CardHeader title="Payment" />
  //     <Stack direction="row" alignItems="center" sx={{ p: 3, typography: 'body2' }}>
  //       <Box component="span" sx={{ color: 'text.secondary', flexGrow: 1 }}>
  //         Phone number
  //       </Box>

  //       {payment.cardNumber}
  //       <Iconify icon="logos:mastercard" width={24} sx={{ ml: 0.5 }} />
  //     </Stack>
  //   </>
  // );

  return (
    <Card>
      <Grid container>
        <Grid item xs={12} sm={6}>
          {renderClientInfo}
        </Grid>

        <Grid item xs={12} sm={6}>
          {data?.client_type === '0' ? renderPassportInfo : renderBusinessPassportInfo}
        </Grid>

        <Grid item xs={12} sm={6}>
          {data?.client_type === '0' ? renderAdress : renderAdressBusiness}
        </Grid>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
        {/*
        {renderPayment} */}
      </Grid>
    </Card>
  );
}

ClientDetailInfo.propTypes = {
  data: PropTypes.object,
};
