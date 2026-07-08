import PropTypes from 'prop-types';
import { Bar, XAxis, YAxis, Legend, Tooltip, BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import { useTheme } from '@mui/material/styles';

import { ChartCard, ChartTooltip, useChartBase } from '../components';

// ----------------------------------------------------------------------

export default function BlocksChart({ data, loading }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill } = useChartBase();

  return (
    <ChartCard
      title="Квартиры по блокам"
      subtitle="Проданные и непроданные"
      icon="solar:buildings-2-bold-duotone"
      color="primary"
      loading={loading}
      isEmpty={!data.length}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="block_name" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={70} />
          <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar dataKey="sold_count" stackId="a" name="Продано" fill={theme.palette.primary.main} maxBarSize={44} />
          <Bar dataKey="unsold_count" stackId="a" name="Не продано" fill={theme.palette.warning.main} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

BlocksChart.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
