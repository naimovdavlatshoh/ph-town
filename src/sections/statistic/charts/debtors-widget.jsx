import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { ChartCard } from '../components';
import { fmtFull, fmtCompact } from '../utils';

// ----------------------------------------------------------------------
// Depth-of-overdue → color (shallow = warning, deep = error)

const BUCKET_COLOR = {
  '1_30': 'warning',
  '31_60': 'error',
  '60_plus': 'error',
};

function Stat({ label, value, sub }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h4" sx={{ lineHeight: 1.2 }} noWrap>
        {value}
      </Typography>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }} noWrap>
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

Stat.propTypes = {
  label: PropTypes.string,
  sub: PropTypes.string,
  value: PropTypes.node,
};

export default function DebtorsWidget({ data, loading, explanation }) {
  const theme = useTheme();
  const total = Number(data?.total_overdue_amount) || 0;
  const buckets = data?.buckets || [];

  return (
    <ChartCard
      title="Должники по рассрочке"
      subtitle="Просроченные и ещё не закрытые платежи на текущую дату"
      icon="solar:danger-triangle-bold-duotone"
      color="error"
      loading={loading}
      isEmpty={!data}
      explanation={explanation}
    >
      <Stack
        direction="row"
        spacing={2}
        divider={<Divider orientation="vertical" flexItem />}
        sx={{ mb: 3 }}
      >
        <Stat label="Сумма долга" value={`${fmtCompact(total)} сум`} />
        <Stat label="Должников" value={fmtFull(data?.debtors_count)} sub="договоров" />
        <Stat label="Просрочено" value={fmtFull(data?.overdue_installments_count)} sub="платежей" />
      </Stack>

      <Stack spacing={2}>
        {buckets.map((b) => {
          const amount = Number(b.overdue_amount) || 0;
          const pct = total > 0 ? (amount / total) * 100 : 0;
          const color = theme.palette[BUCKET_COLOR[b.bucket] || 'warning'].main;

          return (
            <Box key={b.bucket}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.75 }}>
                <Typography variant="body2">{b.label}</Typography>
                <Stack direction="row" spacing={1.5} alignItems="baseline">
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {fmtFull(b.debtors_count)} долж. · {fmtFull(b.overdue_installments_count)} плат.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {fmtCompact(amount)} сум
                  </Typography>
                </Stack>
              </Stack>
              <Box sx={{ height: 8, borderRadius: 1, bgcolor: alpha(color, 0.16), overflow: 'hidden' }}>
                <Box sx={{ width: `${pct}%`, height: 1, bgcolor: color, borderRadius: 1 }} />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </ChartCard>
  );
}

DebtorsWidget.propTypes = {
  data: PropTypes.object,
  explanation: PropTypes.string,
  loading: PropTypes.bool,
};
