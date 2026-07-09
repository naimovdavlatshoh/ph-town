import PropTypes from 'prop-types';
import { Bar, Line, XAxis, YAxis, Legend, Tooltip, CartesianGrid, ComposedChart, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fmtCompact } from '../utils';
import { ChartCard, useChartBase } from '../components';

// ----------------------------------------------------------------------

const fmtPct = (v) => `${Number(v ?? 0).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`;

function CollectionTooltip({ active, payload, label }) {
  const theme = useTheme();
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;
  const rate = d.total_expected > 0 ? (d.total_paid / d.total_expected) * 100 : 0;

  const rows = [
    { label: 'План', value: `${fmtCompact(d.total_expected)} сум`, color: theme.palette.text.disabled },
    { label: 'Собрано', value: `${fmtCompact(d.total_paid)} сум`, color: theme.palette.success.main },
    { label: 'Собрано за месяц', value: fmtPct(rate), color: theme.palette.text.secondary },
    { label: '% сбора (накопит.)', value: fmtPct(d.cumulative_rate), color: theme.palette.warning.main },
  ];

  return (
    <Box
      sx={{
        p: 1.5,
        minWidth: 220,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.customShadows?.dropdown || theme.shadows[8],
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Stack spacing={0.75}>
        {rows.map((r) => (
          <Stack key={r.label} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: r.color }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {r.label}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {r.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

CollectionTooltip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.any,
  payload: PropTypes.array,
};

export default function CollectionRateChart({ data, loading, explanation }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill, monthTick } = useChartBase();

  // Each column = plan (target). Green fill = collected, faint top = shortfall to plan.
  const months = (data?.months || []).map((m) => ({
    ...m,
    shortfall: Math.max(m.total_expected - m.total_paid, 0),
  }));

  return (
    <ChartCard
      title="Собираемость по рассрочке"
      subtitle="План, факт и процент сбора нарастающим итогом"
      icon="solar:hand-money-bold-duotone"
      color="success"
      loading={loading}
      isEmpty={!months.length}
      explanation={explanation}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.08),
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Собрано за {data?.year} год
          </Typography>
          <Typography variant="h3" sx={{ color: 'success.darker', lineHeight: 1.1 }}>
            {fmtPct(data?.collection_rate)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={3} sx={{ ml: { sm: 'auto' } }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              План
            </Typography>
            <Typography variant="h6">{fmtCompact(data?.total_expected)} сум</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Факт
            </Typography>
            <Typography variant="h6">{fmtCompact(data?.total_paid)} сум</Typography>
          </Box>
        </Stack>
      </Stack>

      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={months} margin={{ top: 8, right: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="month_name" tickFormatter={monthTick} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" width={56} tickFormatter={fmtCompact} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: cursorFill }} content={<CollectionTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar yAxisId="left" dataKey="total_paid" stackId="plan" name="Собрано (факт)" fill={theme.palette.success.main} maxBarSize={36} />
          <Bar yAxisId="left" dataKey="shortfall" stackId="plan" name="Недобор до плана" fill={alpha(theme.palette.grey[500], 0.22)} radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative_rate"
            name="% сбора (накопит.)"
            stroke={theme.palette.warning.main}
            strokeWidth={3}
            dot={{ r: 3, fill: theme.palette.warning.main, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

CollectionRateChart.propTypes = {
  data: PropTypes.object,
  explanation: PropTypes.string,
  loading: PropTypes.bool,
};
