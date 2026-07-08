import PropTypes from 'prop-types';
import { Area, Line, XAxis, YAxis, Legend, Tooltip, CartesianGrid, ComposedChart, ResponsiveContainer } from 'recharts';

import { useTheme } from '@mui/material/styles';

import { fmtCompact } from '../utils';
import { ChartCard, ChartTooltip, useChartBase } from '../components';

// ----------------------------------------------------------------------

export default function SalesChart({ data, loading }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill, monthTick } = useChartBase();

  return (
    <ChartCard
      title="Статистика продаж"
      subtitle="Количество продаж и средняя цена за м² по месяцам"
      icon="solar:tag-price-bold-duotone"
      color="error"
      loading={loading}
      isEmpty={!data.length}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
          <defs>
            <linearGradient id="sales-count" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.error.main} stopOpacity={0.35} />
              <stop offset="100%" stopColor={theme.palette.error.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="month_name" tickFormatter={monthTick} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={fmtCompact} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="sales_count"
            name="Количество продаж"
            stroke={theme.palette.error.main}
            strokeWidth={2.5}
            fill="url(#sales-count)"
            dot={{ r: 3, fill: theme.palette.error.main, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="average_price"
            name="Средняя цена, м²"
            stroke={theme.palette.secondary.main}
            strokeWidth={3}
            dot={{ r: 4, fill: theme.palette.secondary.main }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

SalesChart.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
