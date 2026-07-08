import PropTypes from 'prop-types';
import { Area, XAxis, YAxis, Legend, Tooltip, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import { useTheme } from '@mui/material/styles';

import { fmtCompact } from '../utils';
import { ChartCard, ChartTooltip, useChartBase } from '../components';

// ----------------------------------------------------------------------

const areaGradient = (id, color) => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.85} />
    <stop offset="100%" stopColor={color} stopOpacity={0.3} />
  </linearGradient>
);

export default function PaymentsChart({ data, loading }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill, monthTick } = useChartBase();

  const methods = [
    { key: 'Наличка', id: 'pay-cash', color: theme.palette.primary.main },
    { key: 'Терминал', id: 'pay-terminal', color: theme.palette.info.main },
    { key: 'Клик', id: 'pay-click', color: theme.palette.warning.main },
    { key: 'Перечисление', id: 'pay-transfer', color: theme.palette.secondary.main },
  ];

  return (
    <ChartCard
      title="Оплаты по методам"
      subtitle="Разбивка по способам оплаты за каждый месяц"
      icon="solar:card-bold-duotone"
      color="secondary"
      loading={loading}
      isEmpty={!data.length}
    >
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
          <defs>{methods.map((m) => areaGradient(m.id, m.color))}</defs>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="month_name" tickFormatter={monthTick} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis width={56} tickFormatter={fmtCompact} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          {methods.map((m) => (
            <Area
              key={m.key}
              type="monotone"
              stackId="1"
              dataKey={m.key}
              name={m.key}
              stroke={m.color}
              strokeWidth={2}
              fill={`url(#${m.id})`}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

PaymentsChart.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
