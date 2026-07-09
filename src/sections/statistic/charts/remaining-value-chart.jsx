import PropTypes from 'prop-types';
import { Bar, XAxis, YAxis, Tooltip, BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fmtFull, fmtCompact } from '../utils';
import { ChartCard, useChartBase } from '../components';

// ----------------------------------------------------------------------

function RemainingTooltip({ active, payload }) {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  const rows = [
    { label: 'Стоимость остатка', value: `$${fmtCompact(d.remaining_value)}` },
    { label: 'Квартир', value: fmtFull(d.remaining_count) },
    { label: 'Площадь', value: `${fmtFull(d.remaining_area)} м²` },
  ];

  return (
    <Box
      sx={{
        p: 1.5,
        minWidth: 200,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.customShadows?.dropdown || theme.shadows[8],
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {d.block_name}
      </Typography>
      <Stack spacing={0.75}>
        {rows.map((r) => (
          <Stack key={r.label} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {r.label}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {r.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

RemainingTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default function RemainingValueChart({ data, loading, explanation }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill } = useChartBase();

  return (
    <ChartCard
      title="Стоимость остатка по блокам"
      subtitle="Сумма непроданных квартир, USD"
      icon="solar:wad-of-money-bold-duotone"
      color="warning"
      loading={loading}
      isEmpty={!data.length}
      explanation={explanation}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="block_name" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={70} />
          <YAxis width={64} tickFormatter={(v) => `$${fmtCompact(v)}`} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<RemainingTooltip />} />
          <Bar dataKey="remaining_value" name="Стоимость остатка" fill={theme.palette.warning.main} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

RemainingValueChart.propTypes = {
  data: PropTypes.array,
  explanation: PropTypes.string,
  loading: PropTypes.bool,
};
