import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import Image from 'src/components/image';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Lightbox from 'src/components/lightbox/lightbox';
import { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ApartmentItem({ tour, onView, onEdit, onDelete, apartment }) {
  const popover = usePopover();

  const layerModal = useBoolean();

  const {
    apartment_name,
    layout_image,
    created_at,
    totalprice,
    apartment_area,
    rooms_number,
    price_square_meter,

    layout_name,
    stock_status,
    apartment_id,
  } = apartment;

  const renderRating = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        right: 8,
        zIndex: 9,
        borderRadius: 1,
        position: 'absolute',
        p: '2px 6px 2px 4px',
        typography: 'subtitle2',
        bgcolor: 'warning.lighter',
      }}
    >
      <Iconify icon="ic:twotone-meeting-room" sx={{ color: 'warning.main', mr: 0.25 }} />{' '}
      {apartment_name}
    </Stack>
  );

  const renderImages = (
    <Stack
      spacing={0.5}
      direction="row"
      sx={{
        p: (theme) => theme.spacing(1, 1, 0, 1),
      }}
    >
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        {renderRating}
        <Image
          onClick={layerModal.onTrue}
          alt={layout_name}
          src={layout_image}
          sx={{
            borderRadius: 1,
            height: 164,
            width: 1,
            '& img': {
              objectFit: 'fill',
            },
          }}
        />
      </Stack>
    </Stack>
  );

  const renderTexts = (
    <ListItemText
      sx={{
        p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
      }}
      primary={`Создано: ${fDateTime(created_at)}`}
      // secondary={
      //   <Link component={RouterLink} href={paths.dashboard.tour.details(id)} color="inherit">
      //     {name}
      //   </Link>
      // }
      primaryTypographyProps={{
        typography: 'caption',
        color: 'text.disabled',
      }}
      secondaryTypographyProps={{
        mt: 1,
        noWrap: true,
        component: 'span',
        color: 'text.primary',
        typography: 'subtitle1',
      }}
    />
  );

  const renderInfo = (
    <Stack
      spacing={1.5}
      sx={{
        position: 'relative',
        p: (theme) => theme.spacing(0, 2.5, 2.5, 2.5),
      }}
    >
      <Stack
        sx={{ position: 'absolute', bottom: 20, right: 8 }}
        justifyContent="space-between"
        alignItems="center"
        gap={4}
      >
        <Label
          variant="soft"
          color={
            (stock_status === '1' && 'success') ||
            (stock_status === '2' && 'warning') ||
            (stock_status === '3' && 'error') ||
            'default'
          }
        >
          {stock_status === '1' && 'Свободна'}
          {stock_status === '2' && 'Бронирована'}
          {stock_status === '3' && 'Продана'}
        </Label>
        {stock_status === '1' && (
          <Button
            variant="soft"
            color="warning"
            size="small"
            startIcon={<Iconify icon="healthicons:i-documents-accepted-outline" />}
            component={RouterLink}
            href={paths.dashboard.contracts.new(apartment_id)}
          >
            Оформить
          </Button>
        )}
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <Iconify icon="bxs:area" sx={{ color: 'error.main' }} />
        {apartment_area} м²
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <Iconify icon="cbi:rooms-front-door" sx={{ color: 'info.main' }} />
        {rooms_number}
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <Iconify icon="tabler:meter-square" sx={{ color: 'success.main' }} />
        {fCurrency(price_square_meter)} $
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <Iconify icon="solar:tag-price-outline" sx={{ color: 'main' }} />
        {fCurrency(totalprice)} $
      </Stack>
    </Stack>
  );

  return (
    <Card>
      {renderImages}

      {renderTexts}

      {renderInfo}

      <Lightbox
        open={layerModal.value}
        close={() => {
          layerModal.onToggle();
        }}
        slides={[
          {
            src: layout_image,
            width: '100%',
            height: '100%',
          },
        ]}
      />
    </Card>
  );
}

ApartmentItem.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  tour: PropTypes.object,
  apartment: PropTypes.object,
};
