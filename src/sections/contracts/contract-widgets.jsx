import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Конфигурация метрик по индексу: цвет из палитры + иконка.
const METRICS = [
  { colorKey: 'info', icon: 'solar:wallet-money-bold-duotone' },
  { colorKey: 'warning', icon: 'solar:hand-money-bold-duotone' },
  { colorKey: 'success', icon: 'solar:check-circle-bold-duotone' },
  { colorKey: 'error', icon: 'solar:pie-chart-2-bold-duotone' },
];

// ----------------------------------------------------------------------

// Плавный счётчик чисел (count-up) на requestAnimationFrame.
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    const end = Number(target) || 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - (1 - progress) ** 3;
      setValue(end * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// ----------------------------------------------------------------------

function ProgressRing({ percent, mainColor, lightColor, icon, delay }) {
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [mounted, setMounted] = useState(false);
  const animatedPercent = useCountUp(mounted ? percent : 0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const clamped = Math.min(Math.max(mounted ? percent : 0, 0), 100);
  const offset = circumference * (1 - clamped / 100);
  const gradientId = `ring-gradient-${mainColor.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box
        component="svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        sx={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor={mainColor} />
          </linearGradient>
        </defs>

        {/* Дорожка */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={alpha(mainColor, 0.16)}
          strokeWidth={stroke}
        />

        {/* Прогресс */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </Box>

      {/* Центр: иконка + процент */}
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ position: 'absolute', inset: 0 }}
      >
        <Iconify icon={icon} width={22} sx={{ color: mainColor, mb: 0.25 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: mainColor, lineHeight: 1 }}>
          {Math.round(animatedPercent)}%
        </Typography>
      </Stack>
    </Box>
  );
}

ProgressRing.propTypes = {
  percent: PropTypes.number,
  mainColor: PropTypes.string,
  lightColor: PropTypes.string,
  icon: PropTypes.string,
  delay: PropTypes.number,
};

// ----------------------------------------------------------------------

function MetricTile({ item, config, delay }) {
  const theme = useTheme();
  const palette = theme.palette[config.colorKey];
  const animatedTotal = useCountUp(Number(item.total) || 0);

  return (
    <Box
      sx={{
        p: 3,
        height: 1,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        background: `linear-gradient(135deg, ${alpha(palette.main, 0.08)} 0%, ${alpha(
          palette.main,
          0.02
        )} 100%)`,
        border: `1px solid ${alpha(palette.main, 0.12)}`,
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 16px 32px -12px ${alpha(palette.main, 0.4)}`,
        },
      }}
    >
      {/* Декоративное свечение в углу */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha(palette.main, 0.1),
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

      <Stack direction="row" alignItems="center" spacing={2.5} sx={{ position: 'relative' }}>
        <ProgressRing
          percent={Number(item.percent) || 0}
          mainColor={palette.main}
          lightColor={palette.light}
          icon={config.icon}
          delay={delay}
        />

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
            {item.label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
            {fNumber(Math.round(animatedTotal))}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

MetricTile.propTypes = {
  item: PropTypes.object,
  config: PropTypes.object,
  delay: PropTypes.number,
};

// ----------------------------------------------------------------------

export default function ContractWidgets({ initialPayment, chart, ...other }) {
  const { series } = chart;

  return (
    <Card {...other} sx={{ p: { xs: 2, md: 3 }, ...other.sx }}>
      <Box
        sx={{
          gap: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        {series.map((item, index) => (
          <MetricTile
            key={item.label}
            item={item}
            config={METRICS[index] || METRICS[0]}
            delay={index * 150}
          />
        ))}
      </Box>
    </Card>
  );
}

ContractWidgets.propTypes = {
  chart: PropTypes.object,
  initialPayment: PropTypes.bool,
  sx: PropTypes.object,
};
