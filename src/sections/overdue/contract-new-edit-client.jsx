/* eslint-disable no-unsafe-optional-chaining */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import { Box } from '@mui/system';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fCurrency } from 'src/utils/format-number';
import getStatusColor, { getStatusTitle } from 'src/utils/apartment-status';

import { _addressBooks } from 'src/_mock';
import { useGetCurrency } from 'src/api/currency';

import Iconify from 'src/components/iconify';
import Lightbox from 'src/components/lightbox/lightbox';
import FileThumbnail from 'src/components/file-thumbnail/file-thumbnail';

import RoomListDialog from '../room/roomlist-dialog';
import ClientListDialog from '../client/client-list-dialog';

// ----------------------------------------------------------------------

export default function ContractNewEditClient({ mode = '' }) {
  const layerModal = useBoolean();
  const { currency } = useGetCurrency();

  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const mdUp = useResponsive('up', 'md');

  const values = watch();

  const { client, apartment } = values;

  const from = useBoolean();

  const to = useBoolean();

  useEffect(() => {
    if (mode === 'edit') {
      return;
    }

    setValue('totalAmount', values.apartment?.uzs_full_price);
  }, [values.apartment, setValue, mode]);

  return (
    <>
      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={
          <Divider
            flexItem
            orientation={mdUp ? 'vertical' : 'horizontal'}
            sx={{ borderStyle: 'dashed' }}
          />
        }
        sx={{ p: 3 }}
      >
        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Клиент:
            </Typography>

            <IconButton onClick={from.onTrue}>
              <Iconify icon={client ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {client ? (
            <Stack spacing={1}>
              <Typography variant="h6">
                {client?.client_type === '1'
                  ? `${client?.business_director_name} - "${client?.business_name}"`
                  : `${client?.client_surname} ${client?.client_name} ${client?.client_fathername}`}
              </Typography>

              <Typography variant="body2">
                {client?.client_type === '1'
                  ? client?.business_address
                  : client?.address_by_passport}
              </Typography>
              <Typography variant="body2" link>
                {client?.client_type === '1'
                  ? `ИНН: ${client?.business_inn}. МФО: ${client?.business_mfo}`
                  : `Паспорт: ${client?.passport_series}. ПИНФЛ: ${client?.pinfl}`}
              </Typography>
              {client?.phone_option?.find((phone) => phone.is_main === '1') && (
                <Stack direction="row" gap={0.5}>
                  <Typography variant="body2">Номер телефона:</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.25 }}>
                    {client?.phone_option?.find((phone) => phone.is_main === '1')?.phone_number}
                  </Typography>
                </Stack>
              )}
              {client?.phone_option?.find((phone) => phone.is_main === '0') && (
                <Stack direction="row" gap={0.5}>
                  <Typography variant="body2">Дополнительные номера:</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.25 }}>
                    {client?.phone_option
                      ?.filter((phone) => phone.is_main === '0')
                      .map((phone) => `${phone?.phone_number}; `)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.client?.message}
            </Typography>
          )}
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Квартира:
            </Typography>

            <IconButton onClick={to.onTrue}>
              <Iconify icon={apartment ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {apartment ? (
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack>
                <Stack direction="row" alignItems="center">
                  <Box
                    sx={{
                      background: getStatusColor(apartment?.stock_status),
                      width: 12,
                      height: 12,
                      mr: 1,
                    }}
                  />{' '}
                  {getStatusTitle(apartment?.stock_status)}
                </Stack>
                <Typography variant="subtitle2">{apartment?.apartment_name}</Typography>
                <Typography variant="body2">{`Площадь: ${apartment?.apartment_area} м2`}</Typography>
                <Typography variant="body2">
                  {' '}
                  {`Кол-во комнат: ${apartment?.rooms_number}`}
                </Typography>
                <Typography variant="body2"> {`Блок: ${apartment?.block_name}`}</Typography>
                <Typography variant="body2"> {`Этаж: ${apartment?.floor_number}`}</Typography>
                <Typography variant="body2"> {`Подъезд: ${apartment?.entrance_name}`}</Typography>
                <Typography variant="subtitle2">
                  {`Цена м2: ${fCurrency(apartment?.price_square_meter * currency)}`} сум
                </Typography>
                <Typography variant="subtitle2">
                  {`Общая стоимость: ${fCurrency(apartment?.totalprice * currency)}`} сум
                </Typography>
              </Stack>
              <Stack sx={{ width: 120, height: 120 }} onClick={layerModal.onTrue}>
                <FileThumbnail
                  imageView
                  file={apartment?.layout_image || ''}
                  sx={{ maxWidth: 64, height: 64 }}
                  imgSx={{ borderRadius: 1, border: '1px dashed rgba(0,0,0,.2)', p: 2 }}
                />

                <Lightbox
                  open={layerModal.value}
                  close={() => {
                    layerModal.onToggle();
                  }}
                  slides={[
                    {
                      src: apartment?.layout_image,
                      width: '100%',
                      height: '100%',
                    },
                  ]}
                />
              </Stack>
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.apartment?.message}
            </Typography>
          )}
        </Stack>
      </Stack>

      <ClientListDialog
        title="Клиенты"
        open={from.value}
        onClose={from.onFalse}
        selected={(selectedId) => client?.id === selectedId}
        onSelect={(address) => setValue('client', address)}
        list={_addressBooks}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.clients.new}
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Добавить
          </Button>
        }
      />

      <RoomListDialog
        title="Помещения"
        open={to.value}
        onClose={to.onFalse}
        selected={(selectedId) => apartment?.id === selectedId}
        onSelect={(aprt) => setValue('apartment', aprt)}
        list={_addressBooks}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.object.root}
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Новое помещение
          </Button>
        }
      />
    </>
  );
}

ContractNewEditClient.propTypes = {
  mode: PropTypes.string,
};
