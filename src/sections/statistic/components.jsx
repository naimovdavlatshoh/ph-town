import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import { fmtFull } from './utils';

// ----------------------------------------------------------------------
// Shared chart styling (axis, grid, cursor, month tick)

export function useChartBase() {
  const theme = useTheme();
  return {
    axisTick: { fill: theme.palette.text.secondary, fontSize: 12 },
    gridStroke: theme.palette.divider,
    cursorFill: alpha(theme.palette.grey[500], 0.08),
    monthTick: (v) => (typeof v === 'string' ? v.slice(0, 3) : v),
  };
}

// ----------------------------------------------------------------------
// KPI card

export function StatCard({ title, value, subtitle, icon, color }) {
  const theme = useTheme();
  const c = theme.palette[color];

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(c.light, 0.18)} 0%, ${alpha(
          c.main,
          0.14
        )} 100%)`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.contrastText,
            background: `linear-gradient(135deg, ${c.light} 0%, ${c.main} 100%)`,
            boxShadow: `0 8px 16px 0 ${alpha(c.main, 0.32)}`,
          }}
        >
          <Iconify icon={icon} width={28} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ lineHeight: 1.2, color: `${color}.darker` }} noWrap>
            {value}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

StatCard.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  subtitle: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.node,
};

// ----------------------------------------------------------------------
// Chart wrapper: header + loading / empty states

export function ChartCard({ title, subtitle, icon, color, loading, isEmpty, children }) {
  const theme = useTheme();
  const c = theme.palette[color] || theme.palette.primary;

  let body = children;
  if (loading) {
    body = <Skeleton variant="rounded" height={360} />;
  } else if (isEmpty) {
    body = (
      <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: 360 }}>
        <Iconify
          icon="solar:chart-2-bold-duotone"
          width={64}
          sx={{ color: 'text.disabled', opacity: 0.5 }}
        />
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          Нет данных за выбранный период
        </Typography>
      </Stack>
    );
  }

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'flex',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            color: c.main,
            bgcolor: alpha(c.main, 0.12),
          }}
        >
          <Iconify icon={icon} width={24} />
        </Box>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {body}
    </Card>
  );
}

ChartCard.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  icon: PropTypes.string,
  isEmpty: PropTypes.bool,
  loading: PropTypes.bool,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------
// Themed tooltip

export function ChartTooltip({ active, payload, label, valueFormatter = fmtFull }) {
  const theme = useTheme();
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        p: 1.5,
        minWidth: 180,
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
        {payload.map((entry) => (
          <Stack
            key={entry.dataKey}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: entry.color || entry.stroke,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {entry.name}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {valueFormatter(entry.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.any,
  payload: PropTypes.array,
  valueFormatter: PropTypes.func,
};
