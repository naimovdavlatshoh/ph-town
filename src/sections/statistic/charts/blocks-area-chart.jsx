import PropTypes from 'prop-types';
import { Bar, XAxis, YAxis, Legend, Tooltip, BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import { alpha, useTheme } from '@mui/material/styles';

import { fmtCompact } from '../utils';
import { ChartCard, ChartTooltip, useChartBase } from '../components';

// ----------------------------------------------------------------------

export default function BlocksAreaChart({ data, loading }) {
  const theme = useTheme();
  const { axisTick, gridStroke, cursorFill } = useChartBase();

  // Grey segment completes each column up to the block's total area.
  const chartData = data.map((d) => ({
    ...d,
    remaining_area: Math.max(d.total_area - d.area_sold_count - d.area_unsold_count, 0),
  }));

  return (
    <ChartCard
      title="Площадь по блокам"
      subtitle="Проданная и непроданная, м² (высота столбца — общая площадь)"
      icon="solar:ruler-angular-bold-duotone"
      color="info"
      loading={loading}
      isEmpty={!data.length}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="block_name" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={70} />
          <YAxis width={56} tickFormatter={fmtCompact} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar dataKey="area_sold_count" stackId="a" name="Проданная" fill={theme.palette.primary.main} maxBarSize={44} />
          <Bar dataKey="area_unsold_count" stackId="a" name="Непроданная" fill={theme.palette.error.main} maxBarSize={44} />
          <Bar dataKey="remaining_area" stackId="a" name="Остаток до общей" fill={alpha(theme.palette.grey[500], 0.24)} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

BlocksAreaChart.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
