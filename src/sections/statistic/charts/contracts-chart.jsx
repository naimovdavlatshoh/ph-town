import PropTypes from 'prop-types';
import { Area, Line, XAxis, YAxis, Legend, Tooltip, CartesianGrid, ComposedChart, ResponsiveContainer } from 'recharts';

import { useTheme } from '@mui/material/styles';

import { ChartCard, ChartTooltip, useChartBase } from '../components';

// ----------------------------------------------------------------------

export default function ContractsChart({ data, loading }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill, monthTick } = useChartBase();

  return (
    <ChartCard
      title="Контракты по месяцам"
      subtitle="Подписанные и расторгнутые"
      icon="solar:document-add-bold-duotone"
      color="primary"
      loading={loading}
      isEmpty={!data.length}
    >
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16 }}>
          <defs>
            <linearGradient id="contracts-signed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="month_name" tickFormatter={monthTick} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="signed_contracts"
            name="Подписано"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            fill="url(#contracts-signed)"
            dot={{ r: 3, fill: theme.palette.primary.main, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="terminated_contracts"
            name="Расторгнуто"
            stroke={theme.palette.error.main}
            strokeWidth={2}
            dot={{ r: 3, fill: theme.palette.error.main, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

ContractsChart.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
