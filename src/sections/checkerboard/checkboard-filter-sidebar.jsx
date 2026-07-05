import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '1', label: 'Свободно', color: '#22c55e' },
  { value: '2', label: 'Забронировано', color: '#f59e0b' },
  { value: '3', label: 'Продано', color: '#ef4444' },
];

export default function CheckerboardFilterSidebar({
  areaFilterOptions,
  selectedRoomStatusFilter,
  selectedRoomAreaFilter,
  selectedRoomPriceFilter,
  selectedRoomFilter,
  onToggle,
  onToggleStatus,
  onTogglePrice,
  onToggleArea,
  onClear,
  sliderOptions,
}) {
  return (
    <Stack gap={0}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="subtitle2">Фильтр</Typography>
        <Button
          size="small"
          color="error"
          onClick={onClear}
          startIcon={<Iconify icon="pajamas:clear-all" width={14} />}
          sx={{ minWidth: 0, px: 1, fontSize: 12 }}
        >
          Очистить
        </Button>
      </Stack>

      <Divider />

      {/* Rooms count */}
      <Stack py={2} gap={1.5}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
          Кол-во комнат
        </Typography>
        <ToggleButtonGroup
          exclusive
          color="primary"
          size="small"
          value={selectedRoomFilter}
          onChange={(_, v) => onToggle(v)}
          sx={{ gap: 0.5 }}
        >
          {['1', '2', '3', '4', '5'].map((n) => (
            <ToggleButton
              key={n}
              value={n}
              sx={{
                width: 36,
                height: 36,
                fontWeight: 700,
                fontSize: 13,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&.Mui-selected': { borderColor: 'primary.main' },
              }}
            >
              {n}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Divider />

      {/* Status */}
      <Stack py={2} gap={1.5}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
          Состояние
        </Typography>
        <Stack direction="row" gap={1}>
          {STATUS_OPTIONS.map(({ value, label, color }) => {
            const selected = selectedRoomStatusFilter === value;
            return (
              <Tooltip key={value} title={label} arrow>
                <Box
                  onClick={() => onToggleStatus(selected ? null : value)}
                  sx={{
                    flex: 1,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: color,
                    opacity: selected ? 1 : 0.3,
                    cursor: 'pointer',
                    border: selected ? `2px solid ${color}` : '2px solid transparent',
                    outline: selected ? `2px solid` : 'none',
                    outlineColor: color,
                    outlineOffset: 2,
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>
        {selectedRoomStatusFilter && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {STATUS_OPTIONS.find((o) => o.value === selectedRoomStatusFilter)?.label}
          </Typography>
        )}
      </Stack>

      <Divider />

      {/* Price range */}
      <Stack py={2} gap={1.5}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
          Цена (USD)
        </Typography>
        <Box px={1}>
          <Slider
            value={selectedRoomPriceFilter}
            onChange={(_, v) => onTogglePrice(v)}
            valueLabelDisplay="auto"
            getAriaValueText={(v) => `${v} $`}
            size="small"
            {...sliderOptions}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {selectedRoomPriceFilter?.[0]?.toLocaleString()} $
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {selectedRoomPriceFilter?.[1]?.toLocaleString()} $
          </Typography>
        </Stack>
      </Stack>

      <Divider />
    </Stack>
  );
}

CheckerboardFilterSidebar.propTypes = {
  selectedRoomFilter: PropTypes.string,
  selectedRoomStatusFilter: PropTypes.string,
  selectedRoomPriceFilter: PropTypes.array,
  selectedRoomAreaFilter: PropTypes.string,
  onToggle: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onTogglePrice: PropTypes.func,
  onToggleArea: PropTypes.func,
  onClear: PropTypes.func,
  sliderOptions: PropTypes.object,
  areaFilterOptions: PropTypes.array,
};
