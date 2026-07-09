import PropTypes from 'prop-types';
import { Area, XAxis, YAxis, Legend, Tooltip, CartesianGrid, ComposedChart, ResponsiveContainer } from 'recharts';

import { useTheme } from '@mui/material/styles';

import { fmtCompact } from '../utils';
import { ChartCard, ChartTooltip, useChartBase } from '../components';

// ----------------------------------------------------------------------

export default function InstallmentsChart({ data, loading, explanation }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill, monthTick } = useChartBase();

  return (
    <ChartCard
      title="План и факт оплат"
      subtitle="Ожидается против оплачено, по месяцам"
      icon="solar:chart-square-bold-duotone"
      color="info"
      loading={loading}
      isEmpty={!data.length}
      explanation={explanation}
    >
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
          <defs>
            <linearGradient id="installments-expected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.warning.main} stopOpacity={0.35} />
              <stop offset="100%" stopColor={theme.palette.warning.main} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="installments-paid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={0.4} />
              <stop offset="100%" stopColor={theme.palette.success.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="month_name" tickFormatter={monthTick} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis width={56} tickFormatter={fmtCompact} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="total_expected"
            name="Ожидается"
            stroke={theme.palette.warning.main}
            strokeWidth={2.5}
            fill="url(#installments-expected)"
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="total_paid"
            name="Оплачено"
            stroke={theme.palette.success.main}
            strokeWidth={2.5}
            fill="url(#installments-paid)"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

InstallmentsChart.propTypes = {
  data: PropTypes.array,
  explanation: PropTypes.string,
  loading: PropTypes.bool,
};
