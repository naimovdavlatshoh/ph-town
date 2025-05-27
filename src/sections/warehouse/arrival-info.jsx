/* eslint-disable no-unsafe-optional-chaining */
import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Avatar, ListItemText } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import Lightbox from 'src/components/lightbox/lightbox';

// ----------------------------------------------------------------------

export default function ArrivalInfo({ title, contract, sx, ...other }) {
  const paidAmount = contract?.paymentlist?.reduce(
    (sum, payment) => sum + Number(payment?.payment_amount),
    0
  );

  const layoutModal = useBoolean();

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>

      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h3">{fCurrency(contract?.total_price)}</Typography>
          <Stack direction="row" spacing={2}>
            <Avatar
              onClick={layoutModal.onTrue}
              variant="rounded"
              alt={contract?.layout_name}
              src={contract?.layout_image}
              sx={{ width: 48, height: 48, flexShrink: 0, border: '1px solid rgba(0,0,0,.3)' }}
            />
            <Lightbox
              open={layoutModal.value}
              close={() => {
                layoutModal.onToggle();
              }}
              slides={[
                {
                  src: contract?.layout_image,
                  width: '100%',
                  height: '100%',
                },
              ]}
            />
            <ListItemText
              primary={contract?.project_name}
              secondary={
                <Box component="span" sx={{ mr: 0.5 }}>
                  {`${contract?.block_name}. ${contract?.entrance_name}. Этаж - ${contract?.floor_number}. ${contract?.apartment_name}`}
                </Box>
              }
              primaryTypographyProps={{
                noWrap: true,
              }}
              secondaryTypographyProps={{
                mt: 0.5,
              }}
            />
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Первоначальна оплата
          </Typography>
          <Typography variant="body2" color="#22c55d">
            + {fCurrency(contract?.initial_payment)}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Остаток
          </Typography>
          <Typography variant="body2" color="#ff5631">
            - {fCurrency(contract?.total_price - paidAmount)}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Оплачено
          </Typography>
          <Typography variant="subtitle1">{fCurrency(paidAmount) || paidAmount}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

ArrivalInfo.propTypes = {
  contract: PropTypes.object,
  sx: PropTypes.object,
  title: PropTypes.string,
};
