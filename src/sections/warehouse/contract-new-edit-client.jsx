import { useEffect } from 'react';
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

import getStatusColor, { getStatusTitle } from 'src/utils/apartment-status';

import { _addressBooks } from 'src/_mock';

import Iconify from 'src/components/iconify';
import Lightbox from 'src/components/lightbox/lightbox';
import FileThumbnail from 'src/components/file-thumbnail/file-thumbnail';

import RoomListDialog from '../room/roomlist-dialog';
import ClientListDialog from '../client/client-list-dialog';

// ----------------------------------------------------------------------

export default function ClientNewEditClient() {
  const layerModal = useBoolean();

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
    setValue('totalAmount', values.apartment?.totalprice);
  }, [values.apartment, setValue]);

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
              <Typography variant="body2"> {client?.phone_option?.phone_number}</Typography>
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
                <Typography variant="subtitle2">{`Цена м2: ${apartment?.price_square_meter}`}</Typography>
                <Typography variant="subtitle2">{`Общая стоимость: ${apartment?.totalprice}`}</Typography>
              </Stack>
              <Stack sx={{ width: 120, height: 120 }} onClick={layerModal.onTrue}>
                <FileThumbnail
                  imageView
                  file={apartment?.layout_image}
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
        onSelect={(address) => setValue('apartment', address)}
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
