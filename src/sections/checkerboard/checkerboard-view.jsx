import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Card, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
import { useGetCheckerboard } from 'src/api/checkerboard';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';

import Grid from './Grid-Test';
import CheckerboardStatusbar from './checkerboard-statusbar';
import VisualImageMapper from '../image-map/VisualIImageMapper';
import CheckerboardFilterSidebar from './checkboard-filter-sidebar';
import CheckerBoardFilterDrawer from './checkerboard-filter-drawer';
import {
  RenderCellStock,
  RenderCellPrice,
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
} from './client-table-row';

// ----------------------------------------------------------------------

const ENTITIES_OPTIONS = [
  { value: 'individual', label: 'Физическое лицо' },
  { value: 'legal', label: 'Юридическое лицо' },
];

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function CheckerboardView({ objectId }) {
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();
  const filterSetting = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const { checkerboard, reserve, dereserve, checkerboardLoading } = useGetCheckerboard(objectId);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  const [type, setType] = useState('checkerboard');

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);
    },
    [enqueueSnackbar, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.clients.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.clients.details(id));
    },
    [router]
  );

  const [roomsCountFilter, setRoomsCountFilter] = useState();
  const [roomsStatusFilter, setRoomsStatusFilter] = useState();
  const [roomsAreaFilter, setRoomsAreaFilter] = useState();
  const [roomsPriceFilter, setRoomsPriceFilter] = useState([
    Number(checkerboard?.min_price_apartment),
    Number(checkerboard?.max_price_apartment),
  ]);

  useEffect(() => {
    if (checkerboard) {
      setRoomsPriceFilter([
        Number(checkerboard?.min_price_apartment),
        Number(checkerboard?.max_price_apartment),
      ]);
    }
  }, [checkerboard]);

  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      filterable: false,
    },
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'createdAt',
      headerName: 'Create at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      field: 'inventoryType',
      headerName: 'Stock',
      width: 160,
      type: 'singleSelect',
      valueOptions: PRODUCT_STOCK_OPTIONS,
      renderCell: (params) => <RenderCellStock params={params} />,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 140,
      editable: true,
      renderCell: (params) => <RenderCellPrice params={params} />,
    },
    {
      field: 'entityType',
      headerName: 'Тип клиента',
      width: 110,
      type: 'singleSelect',
      editable: true,
      valueOptions: ENTITIES_OPTIONS,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const lgUp = useResponsive('up', 'lg');

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return checkerboardLoading ? (
    <LoadingScreen title="Загружается шахматка..." />
  ) : (
    <>
      <Container
        maxWidth="100%"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction={lgUp ? 'row' : 'column'} gap={2}>
          <Stack width="300px" display={!lgUp || type === 'visual' ? 'none' : ''}>
            <Card sx={{ padding: 2 }}>
              <CheckerboardFilterSidebar
                areaFilterOptions={checkerboard?.apartment_area_list}
                selectedRoomFilter={roomsCountFilter}
                selectedRoomStatusFilter={roomsStatusFilter}
                selectedRoomAreaFilter={roomsAreaFilter}
                selectedRoomPriceFilter={roomsPriceFilter}
                onToggle={(count) => {
                  if (count === roomsCountFilter) {
                    setRoomsCountFilter(null);
                  } else {
                    setRoomsCountFilter(count);
                  }
                }}
                onToggleStatus={(status) => {
                  if (status === roomsStatusFilter) {
                    setRoomsStatusFilter(null);
                  } else {
                    setRoomsStatusFilter(status);
                  }
                }}
                onToggleArea={(area) => {
                  if (area === roomsAreaFilter) {
                    setRoomsAreaFilter(null);
                  } else {
                    setRoomsAreaFilter(area);
                  }
                }}
                onTogglePrice={(status) => {
                  setRoomsPriceFilter(status);
                }}
                onClear={() => {
                  setRoomsCountFilter(null);
                  setRoomsStatusFilter(null);
                  setRoomsPriceFilter([
                    Number(checkerboard?.min_price_apartment),
                    Number(checkerboard?.max_price_apartment),
                  ]);
                  setRoomsAreaFilter(null);
                }}
                sliderOptions={{
                  min: checkerboard?.min_price_apartment,
                  max: checkerboard?.max_price_apartment,
                  marks: [
                    {
                      value: Number(checkerboard?.min_price_apartment),
                      label: (
                        <Typography marginLeft={5} variant="caption">
                          {checkerboard?.min_price_apartment} UZS
                        </Typography>
                      ),
                    },
                    {
                      value: Number(checkerboard?.max_price_apartment),
                      label: (
                        <Typography marginRight={5} variant="caption">
                          {checkerboard?.max_price_apartment} UZS
                        </Typography>
                      ),
                    },
                  ],
                }}
              />
            </Card>
          </Stack>
          <Stack width={!lgUp || type === 'visual' ? '100%' : 'calc(100% - 300px)'}>
            <Card sx={{ padding: 3 }}>
              <CheckerboardStatusbar
                type={type}
                setType={setType}
                openFilter={filterSetting.onTrue}
              />
              {type === 'checkerboard' ? (
                <Grid
                  checkerboard={checkerboard}
                  roomsCountFilter={roomsCountFilter}
                  roomsStatusFilter={roomsStatusFilter}
                  roomsPriceFilter={roomsPriceFilter}
                  roomsAreaFilter={roomsAreaFilter}
                  reserve={reserve}
                  dereserve={dereserve}
                />
              ) : (
                // checkerboard?.block?.map((ch, idx) => (
                //   <CheckerboardTable
                //     reserve={reserve}
                //     dereserve={dereserve}
                //     key={idx}
                //     data={ch}
                //     roomsCountFilter={roomsCountFilter}
                //     roomsStatusFilter={roomsStatusFilter}
                //     roomsPriceFilter={roomsPriceFilter}
                //     roomsAreaFilter={roomsAreaFilter}
                //   />
                // ))
                <Stack overflow="auto" alignItems="center">
                  <VisualImageMapper projectId={objectId} />
                </Stack>
              )}
            </Card>
          </Stack>
        </Stack>
      </Container>

      <CheckerBoardFilterDrawer
        filterSetting={filterSetting}
        filterOptions={{
          areaFilterOptions: checkerboard?.apartment_area_list,
          selectedRoomFilter: roomsCountFilter,
          selectedRoomStatusFilter: roomsStatusFilter,
          selectedRoomAreaFilter: roomsAreaFilter,
          selectedRoomPriceFilter: roomsPriceFilter,
          onToggle: (count) => {
            if (count === roomsCountFilter) {
              setRoomsCountFilter(null);
            } else {
              setRoomsCountFilter(count);
            }
          },
          onToggleStatus: (status) => {
            if (status === roomsStatusFilter) {
              setRoomsStatusFilter(null);
            } else {
              setRoomsStatusFilter(status);
            }
          },
          onToggleArea: (area) => {
            if (area === roomsAreaFilter) {
              setRoomsAreaFilter(null);
            } else {
              setRoomsAreaFilter(area);
            }
          },
          onTogglePrice: (status) => {
            setRoomsPriceFilter(status);
          },
          onClear: () => {
            setRoomsCountFilter(null);
            setRoomsStatusFilter(null);
            setRoomsPriceFilter([
              Number(checkerboard?.min_price_apartment),
              Number(checkerboard?.max_price_apartment),
            ]);
            setRoomsAreaFilter(null);
          },
          sliderOptions: {
            min: checkerboard?.min_price_apartment,
            max: checkerboard?.max_price_apartment,
            marks: [
              {
                value: Number(checkerboard?.min_price_apartment),
                label: (
                  <Typography marginLeft={5} variant="caption">
                    {checkerboard?.min_price_apartment} UZS
                  </Typography>
                ),
              },
              {
                value: Number(checkerboard?.max_price_apartment),
                label: (
                  <Typography marginRight={5} variant="caption">
                    {checkerboard?.max_price_apartment} UZS
                  </Typography>
                ),
              },
            ],
          },
        }}
      />

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds?.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock?.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish?.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}

CheckerboardView.propTypes = {
  objectId: PropTypes.string,
};
