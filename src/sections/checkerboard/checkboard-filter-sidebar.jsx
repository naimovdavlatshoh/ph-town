import PropTypes from 'prop-types';

import {
  Box,
  Stack,
  Slider,
  Button,
  Divider,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import Iconify from 'src/components/iconify';

function valuetext(value) {
  return `${value} $`;
}

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
  const handleChange = (event, newValue) => {
    onToggle(newValue);
  };
  const handleChangeStatus = (event, newValue) => {
    onToggleStatus(newValue);
  };

  const handleChangeArea = (event, newValue) => {
    onToggleArea(newValue);
  };

  const handleChangePrice = (event, newValue) => {
    onTogglePrice(newValue);
  };

  const children = [
    <ToggleButton
      sx={{ width: '30px', height: '30px', border: '1px solid rgba(0,0,0,.05) !important' }}
      value="1"
      key="1"
    >
      1
    </ToggleButton>,
    <ToggleButton
      sx={{ width: '30px', height: '30px', border: '1px solid rgba(0,0,0,.05) !important' }}
      value="2"
      key="2"
    >
      2
    </ToggleButton>,
    <ToggleButton
      sx={{ width: '30px', height: '30px', border: '1px solid rgba(0,0,0,.05) !important' }}
      value="3"
      key="3"
    >
      3
    </ToggleButton>,
    <ToggleButton
      sx={{ width: '30px', height: '30px', border: '1px solid rgba(0,0,0,.05) !important' }}
      value="4"
      key="4"
    >
      4
    </ToggleButton>,
    <ToggleButton
      sx={{ width: '30px', height: '30px', border: '1px solid rgba(0,0,0,.05) !important' }}
      value="5"
      key="5"
    >
      5
    </ToggleButton>,
  ];

  const childrenStatus = [
    <ToggleButton
      sx={{
        width: '50px',
        height: '25px',
        border: '1px solid rgba(0,0,0,.05) !important',
        background: '#ff572280',

        '&:hover': {
          background: '#ff5722',
        },
        '&.Mui-selected': {
          background: '#ff5722', // Цвет при выборе
        },
        '&.Mui-selected:hover': {
          background: '#ff5722', // Цвет при выборе
        },
      }}
      value="3"
      key="3"
    >
      <Tooltip title="Проданные">
        <Box width="50px" height="25px" />
      </Tooltip>
    </ToggleButton>,

    <ToggleButton
      sx={{
        width: '50px',
        height: '25px',
        border: '1px solid rgba(0,0,0,.05) !important',
        background: '#4caf5054',
        '&:hover': {
          background: '#4caf50',
        },
        '&.Mui-selected': {
          background: '#4caf50', // Цвет при выборе
        },
        '&.Mui-selected:hover': {
          background: '#4caf50', // Цвет при выборе
        },
      }}
      value="1"
      key="1"
    >
      <Tooltip title="Свободные">
        <Box width="50px" height="25px" />
      </Tooltip>
    </ToggleButton>,

    <ToggleButton
      sx={{
        width: '50px',
        height: '25px',
        border: '1px solid rgba(0,0,0,.05) !important',
        background: '#ff980047',
        '&:hover': {
          background: '#ff9800',
        },
        '&.Mui-selected': {
          background: '#ff9800', // Цвет при выборе
        },
        '&.Mui-selected:hover': {
          background: '#ff9800', // Цвет при выборе
        },
      }}
      value="2"
      key="2"
    >
      <Tooltip title="Забронированные">
        <Box width="50px" height="25px" />
      </Tooltip>
    </ToggleButton>,
  ];

  const control = {
    value: selectedRoomFilter,
    onChange: handleChange,
    exclusive: true,
  };

  const controlArea = {
    value: selectedRoomAreaFilter,
    onChange: handleChangeArea,
    exclusive: true,
  };

  const controlStatus = {
    value: selectedRoomStatusFilter,
    onChange: handleChangeStatus,
    exclusive: true,
  };

  return (
    <Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption">Фильтр</Typography>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Button
            onClick={onClear}
            startIcon={<Iconify icon="pajamas:clear-all" width="12px" color="red" />}
          >
            <Typography variant="caption" color="red">
              Очистить
            </Typography>
          </Button>
        </Stack>
      </Stack>
      <Divider />
      <Stack py={2} gap={1}>
        <Typography variant="caption" textAlign="center">
          Кол-во комнат
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <ToggleButtonGroup color="primary" size="small" {...control}>
            {children}
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <Stack py={1} gap={1}>
        <Typography variant="caption" textAlign="center">
          Состояние
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <ToggleButtonGroup color="primary" size="small" {...controlStatus}>
            {childrenStatus}
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <Stack py={1} gap={1}>
        <Typography variant="caption" textAlign="center">
          Цена
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Slider
            getAriaLabel={() => 'Temperature range'}
            value={selectedRoomPriceFilter}
            onChange={handleChangePrice}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            {...sliderOptions}
          />
        </Stack>
      </Stack>
      {/* <Stack py={2} gap={1}>
        <Typography variant="caption" textAlign="center">
          Площадь
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <ToggleButtonGroup
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
            color="primary"
            size="small"
            {...controlArea}
          >
            {areaFilterOptions?.map((item) => (
              <ToggleButton
                sx={{ marginLeft: '4px !important' }}
                value={item.apartment_area}
                key={item.apartment_area}
              >
                {item.apartment_area} м2
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Stack> */}

      <Divider />
    </Stack>
  );
}

CheckerboardFilterSidebar.propTypes = {
  selectedRoomFilter: PropTypes.string,
  selectedRoomStatusFilter: PropTypes.string,
  selectedRoomPriceFilter: PropTypes.string,
  selectedRoomAreaFilter: PropTypes.string,
  onToggle: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onTogglePrice: PropTypes.func,
  onToggleArea: PropTypes.func,
  onClear: PropTypes.func,
  sliderOptions: PropTypes.object,
  areaFilterOptions: PropTypes.array,
};
