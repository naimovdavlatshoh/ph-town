import * as React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { styled, useTheme } from '@mui/material/styles';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import getStatusColor from 'src/utils/apartment-status';

import { useGetObjectsTreeList } from 'src/api/object';

import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
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
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

const StyledTreeItem = React.forwardRef((props, ref) => {
  const theme = useTheme();
  const {
    // eslint-disable-next-line react/prop-types
    bgColor,
    // eslint-disable-next-line react/prop-types
    color,
    // eslint-disable-next-line react/prop-types
    labelIcon: LabelIcon,
    // eslint-disable-next-line react/prop-types
    labelInfo,
    // eslint-disable-next-line react/prop-types
    labelText,
    // eslint-disable-next-line react/prop-types
    colorForDarkMode,
    // eslint-disable-next-line react/prop-types
    bgColorForDarkMode,

    ...other
  } = props;

  const styleProps = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color': theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  return (
    <StyledTreeItemRoot
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={styleProps}
      {...other}
      ref={ref}
    />
  );
});
// ----------------------------------------------------------------------

// const data = {
//   project_id: '13',
//   project_name: 'Dreamland Parkent 2',
//   is_active: '1',
//   created_at: '2024-01-24 12:27:11',
//   updated_at: '2024-01-25 12:28:42',
//   block: [
//     {
//       block_id: '39',
//       project_id: '13',
//       block_name: 'A',
//       max_entrances: '3',
//       max_floors: '5',
//       is_basement: '0',
//       block_image_path: null,
//       block_map_area: null,
//       is_active: '1',
//       created_at: '2024-01-24 12:27:27',
//       updated_at: null,
//       entrance: [
//         {
//           entrance_id: '14',
//           entrance_name: '1 - \u043f\u043e\u0434\u044a\u0435\u0437\u0434',
//           floor: [
//             {
//               floor_id: '21',
//               floor_number: '-1',
//               floor_type: '0',
//               apartments_number: '1',
//               apartments: [
//                 {
//                   apartment_id: '32',
//                   apartment_name: '\u0441\u043a\u043b\u0430\u0434',
//                   apartment_area: '50.00',
//                   rooms_number: '1',
//                   stock_status: '1',
//                   price_square_meter: '313123',
//                   totalprice: '15656150',
//                   layout_id: '26',
//                   layout_name: '1 \u0445\u043e\u043d\u0430 53',
//                   layout_type: '1',
//                   layout_image: 'https://api.argon.uz/layout_files/webp/nbA6WO54Oe.webp',
//                   created_at: '2024-01-24 12:29:03',
//                 },
//               ],
//             },
//             {
//               floor_id: '22',
//               floor_number: '1',
//               floor_type: '1',
//               apartments_number: '3',
//               apartments: [
//                 {
//                   apartment_id: '33',
//                   apartment_name: '1',
//                   apartment_area: '100.50',
//                   rooms_number: '3',
//                   stock_status: '1',
//                   price_square_meter: '12312',
//                   totalprice: '1237356',
//                   layout_id: '26',
//                   layout_name: '1 \u0445\u043e\u043d\u0430 53',
//                   layout_type: '1',
//                   layout_image: 'https://api.argon.uz/layout_files/webp/nbA6WO54Oe.webp',
//                   created_at: '2024-01-24 12:30:19',
//                 },
//                 {
//                   apartment_id: '35',
//                   apartment_name: '1 \u0445\u043e\u043d\u0430 46,,5',
//                   apartment_area: '46.50',
//                   rooms_number: '1',
//                   stock_status: '1',
//                   price_square_meter: '2500000',
//                   totalprice: '116250000',
//                   layout_id: '23',
//                   layout_name: '1 \u0445\u043e\u043d\u0430 46,,5',
//                   layout_type: '1',
//                   layout_image: 'https://api.argon.uz/layout_files/webp/kNJTPE8cqu.webp',
//                   created_at: '2024-01-25 14:37:34',
//                 },
//                 {
//                   apartment_id: '36',
//                   apartment_name: '1 \u0445\u043e\u043d\u0430 46,5',
//                   apartment_area: '46.50',
//                   rooms_number: '1',
//                   stock_status: '1',
//                   price_square_meter: '2300000',
//                   totalprice: '106950000',
//                   layout_id: '24',
//                   layout_name: '1 \u0445\u043e\u043d\u0430 46,5',
//                   layout_type: '1',
//                   layout_image: 'https://api.argon.uz/layout_files/webp/ZNEBqTLsW3.webp',
//                   created_at: '2024-01-25 14:37:52',
//                 },
//               ],
//             },
//             {
//               floor_id: '32',
//               floor_number: '2',
//               floor_type: '1',
//               apartments_number: '4',
//               apartments: [
//                 {
//                   apartment_id: '37',
//                   apartment_name: '1 \u0445\u043e\u043d\u0430 46',
//                   apartment_area: '46.00',
//                   rooms_number: '1',
//                   stock_status: '1',
//                   price_square_meter: '2000000',
//                   totalprice: '92000000',
//                   layout_id: '25',
//                   layout_name: '1 \u0445\u043e\u043d\u0430 46',
//                   layout_type: '1',
//                   layout_image: 'https://api.argon.uz/layout_files/webp/x7lCUNe8OJ.webp',
//                   created_at: '2024-01-25 14:39:49',
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           entrance_id: '15',
//           entrance_name: '2- \u043f\u043e\u0434\u044a\u0435\u0437\u0434',
//           floor: [],
//         },
//       ],
//     },
//   ],
// };

export default function RoomListDialog({
  title = 'Address Book',
  list,
  action,
  //
  open,
  onClose,
  //
  selected,
  onSelect,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const { objectsTree } = useGetObjectsTreeList();

  const dataFiltered = applyFilter({
    inputData: list,
    query: searchTerm,
  });

  const notFound = !dataFiltered.length && !!searchTerm;

  const handleSelectClient = useCallback(
    (apartment) => {
      if (apartment?.stock_status === '1') {
        onSelect(apartment);
        setSearchTerm('');
        onClose();
      }
    },
    [onClose, onSelect]
  );

  const checkApartmentsExistenceInBlock = (data) =>
    data.entrance &&
    data.entrance.some(
      (entrance) =>
        entrance.floor &&
        entrance.floor.some((floor) => floor.apartments && floor.apartments.length > 0)
    );
  const checkApartmentsExistenceInEntrance = (entrance) =>
    entrance.floor &&
    entrance.floor.some((floor) => floor.apartments && floor.apartments.length > 0);

  const checkApartmentsExistenceInFloor = (floor) =>
    floor.apartments && floor.apartments.length > 0;

  const renderApartments = (apartments) =>
    apartments.map((apartment) => (
      <StyledTreeItem
        disabled={apartment.stock_status !== '1'}
        key={uuidv4()}
        nodeId={uuidv4()}
        labelText={
          <Stack
            direction="row"
            sx={{ width: 1 }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>{apartment.apartment_name}</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 9,
                  borderRadius: '100%',
                  background: getStatusColor(apartment.stock_status),
                }}
              />
              <Typography variant="caption">Кол-во комнат: {apartment.rooms_number}</Typography>
            </Stack>
          </Stack>
        }
        labelIcon={() => <Iconify mr={1} icon="fluent:conference-room-48-filled" />}
        onClick={() => handleSelectClient(apartment)}

        // Добавьте другие свойства, которые вы хотите использовать
      />
    ));

  const renderFloors = (floors) =>
    floors.map(
      (floor) =>
        checkApartmentsExistenceInFloor(floor) && (
          <StyledTreeItem
            key={floor.floor_id}
            nodeId={uuidv4()}
            labelText={`Этаж - ${floor.floor_number}`}
            labelIcon={() => <Iconify mr={1} icon="material-symbols:floor" />}

            // Добавьте другие свойства, которые вы хотите использовать
          >
            {renderApartments(floor.apartments)}
          </StyledTreeItem>
        )
    );

  const renderEntrances = (entrances) =>
    entrances.map(
      (entrance) =>
        checkApartmentsExistenceInEntrance(entrance) && (
          <StyledTreeItem
            key={entrance.entrance_id}
            nodeId={uuidv4()}
            labelText={entrance.entrance_name}
            labelIcon={() => <Iconify mr={1} icon="mingcute:entrance-line" />}

            // Добавьте другие свойства, которые вы хотите использовать
          >
            {renderFloors(entrance.floor)}
          </StyledTreeItem>
        )
    );

  const renderBlocks = (blocks) =>
    blocks.map(
      (block) =>
        checkApartmentsExistenceInBlock(block) && (
          <StyledTreeItem
            key={block.block_id}
            nodeId={uuidv4()}
            labelText={`${block.block_name}`}
            labelIcon={() => <Iconify mr={1} icon="fa-solid:building" />}
            // Добавьте другие свойства, которые вы хотите использовать
          >
            {renderEntrances(block.entrance)}
          </StyledTreeItem>
        )
    );

  const renderObjects = (objects) =>
    objects.map((object) => (
      <StyledTreeItem
        key={object.project_id}
        nodeId={uuidv4()}
        labelText={`${object.project_name}`}
        labelIcon={() => <Iconify mr={1} icon="solar:buildings-2-bold" />}

        // Добавьте другие свойства, которые вы хотите использовать
      >
        {renderBlocks(object.block)}
      </StyledTreeItem>
    ));

  const renderList = (
    <Stack
      spacing={0.5}
      sx={{
        px: 1.5,
        py: 1,

        maxHeight: 80 * 8,
        overflowX: 'hidden',
      }}
    >
      <TreeView
        aria-label="gmail"
        defaultExpanded={['3']}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      >
        {renderObjects(objectsTree)}
      </TreeView>
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 3, pr: 1.5 }}
      >
        <Typography variant="h6"> {title} </Typography>

        {action && action}
      </Stack>

      {/* <Stack sx={{ p: 2, pt: 0 }}>
        <TextField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Найти..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack> */}

      {notFound ? <SearchNotFound query={searchTerm} sx={{ px: 3, pt: 5, pb: 10 }} /> : renderList}
    </Dialog>
  );
}

RoomListDialog.propTypes = {
  action: PropTypes.node,
  list: PropTypes.array,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.func,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (address) =>
        address.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        address.fullAddress.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        `${address.company}`.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
