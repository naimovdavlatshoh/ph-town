import * as React from 'react';
import PropTypes from 'prop-types';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { alpha, styled, useTheme } from '@mui/material/styles';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import getStatusColor, { getStatusTitle } from 'src/utils/apartment-status';

import { useGetObjectsTreeList } from 'src/api/object';

import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderRadius: theme.shape.borderRadius,
    marginBottom: 2,
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: theme.spacing(2),
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.16)}`,
  },
}));

// Ветка дерева (объект/блок/подъезд/этаж) — заголовок с иконкой.
const StyledTreeItem = React.forwardRef((props, ref) => {
  // eslint-disable-next-line react/prop-types
  const { labelIcon: LabelIcon, labelText, labelInfo, ...other } = props;

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', py: 0.75, pr: 0 }}>
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          {labelInfo != null && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {labelInfo}
            </Typography>
          )}
        </Box>
      }
      {...other}
      ref={ref}
    />
  );
});

// ----------------------------------------------------------------------

// Цвета статусов из палитры темы (валидный hex — работает с alpha()).
// 1 — Свободно, 2/4 — Забронировано, 3 — Продано, остальное — серый.
const STATUS_HEX = (theme) => ({
  1: theme.palette.success.main,
  2: theme.palette.warning.main,
  3: theme.palette.error.main,
  4: theme.palette.warning.main,
  5: theme.palette.grey[500],
});

// Соответствие квартиры поисковому запросу.
const matchApartment = (apartment, query) => {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  return (
    `${apartment?.apartment_name ?? ''}`.toLowerCase().includes(q) ||
    `${apartment?.rooms_number ?? ''}`.toLowerCase().includes(q)
  );
};

// Фильтрация всего дерева объектов по запросу с отбрасыванием пустых веток.
const filterTree = (objects, query) =>
  (objects || [])
    .map((object) => {
      const blocks = (object.block || [])
        .map((block) => {
          const entrances = (block.entrance || [])
            .map((entrance) => {
              const floors = (entrance.floor || [])
                .map((floor) => {
                  const apartments = (floor.apartments || []).filter((apt) =>
                    matchApartment(apt, query)
                  );
                  return apartments.length ? { ...floor, apartments } : null;
                })
                .filter(Boolean);
              return floors.length ? { ...entrance, floor: floors } : null;
            })
            .filter(Boolean);
          return entrances.length ? { ...block, entrance: entrances } : null;
        })
        .filter(Boolean);
      return blocks.length ? { ...object, block: blocks } : null;
    })
    .filter(Boolean);

// Все id узлов дерева (для авто-раскрытия при поиске).
const collectNodeIds = (objects) => {
  const ids = [];
  (objects || []).forEach((object) => {
    ids.push(`object-${object.project_id}`);
    (object.block || []).forEach((block) => {
      ids.push(`block-${block.block_id}`);
      (block.entrance || []).forEach((entrance) => {
        ids.push(`entrance-${entrance.entrance_id}`);
        (entrance.floor || []).forEach((floor) => {
          ids.push(`floor-${floor.floor_id}`);
        });
      });
    });
  });
  return ids;
};

// Подсчёт свободных квартир (stock_status === '1').
const countAvailable = (objects) => {
  let count = 0;
  (objects || []).forEach((object) =>
    (object.block || []).forEach((block) =>
      (block.entrance || []).forEach((entrance) =>
        (entrance.floor || []).forEach((floor) =>
          (floor.apartments || []).forEach((apt) => {
            if (apt?.stock_status === '1') count += 1;
          })
        )
      )
    )
  );
  return count;
};

// ----------------------------------------------------------------------

function LegendDot({ color, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Stack>
  );
}

LegendDot.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function RoomListDialog({
  title = 'Помещения',
  action,
  //
  open,
  onClose,
  //
  selected,
  onSelect,
}) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState([]);

  const { objectsTree } = useGetObjectsTreeList();

  const filteredTree = useMemo(
    () => filterTree(objectsTree, searchTerm),
    [objectsTree, searchTerm]
  );

  const availableTotal = useMemo(() => countAvailable(objectsTree), [objectsTree]);

  // При активном поиске раскрываем все совпавшие ветки автоматически.
  const autoExpanded = useMemo(() => collectNodeIds(filteredTree), [filteredTree]);
  const expandedToUse = searchTerm ? autoExpanded : expanded;

  const notFound = !filteredTree.length;

  const handleSelectApartment = useCallback(
    (apartment) => {
      if (apartment?.stock_status === '1') {
        onSelect(apartment);
        setSearchTerm('');
        onClose();
      }
    },
    [onClose, onSelect]
  );

  const handleClose = useCallback(() => {
    setSearchTerm('');
    onClose();
  }, [onClose]);

  const renderApartments = (apartments) =>
    apartments.map((apartment) => {
      const isAvailable = apartment.stock_status === '1';
      const isSelected = selected?.(apartment.apartment_id);
      // Гарантированно валидный hex-цвет из палитры (alph() не понимает 'gray'/undefined).
      const statusColor = STATUS_HEX(theme)[apartment.stock_status] || theme.palette.grey[500];
      const statusTitle = getStatusTitle(apartment.stock_status) || 'Недоступно';

      return (
        <StyledTreeItemRoot
          disabled={!isAvailable}
          key={`apt-${apartment.apartment_id}`}
          nodeId={`apt-${apartment.apartment_id}`}
          onClick={() => handleSelectApartment(apartment)}
          sx={{
            [`& > .${treeItemClasses.content}`]: {
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
              my: 0.5,
              ...(isSelected && {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }),
              ...(isAvailable && {
                cursor: 'pointer',
              }),
            },
          }}
          label={
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ py: 0.75, width: 1, opacity: isAvailable ? 1 : 0.6 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statusColor,
                  bgcolor: alpha(statusColor || theme.palette.grey[500], 0.12),
                }}
              >
                <Iconify icon="solar:home-2-bold-duotone" width={18} />
              </Box>

              <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  № {apartment.apartment_name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                  {`${apartment.rooms_number}-комн. · ${apartment.apartment_area} м²`}
                </Typography>
              </Stack>

              <Chip
                size="small"
                label={statusTitle}
                sx={{
                  height: 22,
                  color: statusColor,
                  fontWeight: 600,
                  bgcolor: alpha(statusColor || theme.palette.grey[500], 0.12),
                }}
              />

              {isAvailable && (
                <Iconify
                  icon="eva:arrow-ios-forward-fill"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              )}
            </Stack>
          }
        />
      );
    });

  const renderFloors = (floors) =>
    floors.map((floor) => (
      <StyledTreeItem
        key={`floor-${floor.floor_id}`}
        nodeId={`floor-${floor.floor_id}`}
        labelText={`Этаж ${floor.floor_number}`}
        labelInfo={`${floor.apartments.length} кв.`}
        labelIcon={() => <Iconify icon="material-symbols:floor" />}
      >
        {renderApartments(floor.apartments)}
      </StyledTreeItem>
    ));

  const renderEntrances = (entrances) =>
    entrances.map((entrance) => (
      <StyledTreeItem
        key={`entrance-${entrance.entrance_id}`}
        nodeId={`entrance-${entrance.entrance_id}`}
        labelText={entrance.entrance_name}
        labelIcon={() => <Iconify icon="mingcute:entrance-line" />}
      >
        {renderFloors(entrance.floor)}
      </StyledTreeItem>
    ));

  const renderBlocks = (blocks) =>
    blocks.map((block) => (
      <StyledTreeItem
        key={`block-${block.block_id}`}
        nodeId={`block-${block.block_id}`}
        labelText={`Блок ${block.block_name}`}
        labelIcon={() => <Iconify icon="fa-solid:building" />}
      >
        {renderEntrances(block.entrance)}
      </StyledTreeItem>
    ));

  const renderObjects = (objects) =>
    objects.map((object) => (
      <StyledTreeItem
        key={`object-${object.project_id}`}
        nodeId={`object-${object.project_id}`}
        labelText={object.project_name}
        labelIcon={() => <Iconify icon="solar:buildings-2-bold" />}
      >
        {renderBlocks(object.block)}
      </StyledTreeItem>
    ));

  const renderList = (
    <Box sx={{ px: 2.5, pb: 2 }}>
      <TreeView
        aria-label="apartments"
        expanded={expandedToUse}
        onNodeToggle={(event, nodeIds) => {
          if (!searchTerm) setExpanded(nodeIds);
        }}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 460 }}
      >
        {renderObjects(filteredTree)}
      </TreeView>
    </Box>
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Stack sx={{ p: 3, pb: 2 }} spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">{title}</Typography>
            <Chip
              size="small"
              color="success"
              variant="soft"
              label={`Свободно: ${availableTotal}`}
            />
          </Stack>

          {action && action}
        </Stack>

        <TextField
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Поиск по номеру или кол-ву комнат..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <Iconify
                  icon="eva:close-fill"
                  sx={{ color: 'text.disabled', cursor: 'pointer' }}
                  onClick={() => setSearchTerm('')}
                />
              </InputAdornment>
            ) : null,
          }}
        />

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <LegendDot color={getStatusColor('1')} label="Свободно" />
          <LegendDot color={getStatusColor('2')} label="Забронировано" />
          <LegendDot color={getStatusColor('3')} label="Продано" />
        </Stack>
      </Stack>

      {notFound ? (
        <SearchNotFound query={searchTerm || 'Нет данных'} sx={{ px: 3, pt: 3, pb: 8 }} />
      ) : (
        renderList
      )}
    </Dialog>
  );
}

RoomListDialog.propTypes = {
  action: PropTypes.node,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.func,
  title: PropTypes.string,
};
