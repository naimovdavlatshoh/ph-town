import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Alert, Avatar } from '@mui/material';
import Container from '@mui/material/Container';
import { DataGrid, GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetLayouts } from 'src/api/layout';
import { useGetObjects } from 'src/api/object';
import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useTable } from 'src/components/table';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import Lightbox from 'src/components/lightbox/lightbox';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import LayoutNewEditForm from './layout-new-edit-form';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
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

export default function ProductListView2({ projectId }) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();
  const layoutModal = useBoolean();
  const router = useRouter();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);
  const [selectedLayoutSrc, setSelectedLayoutSrc] = useState('');

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { layouts, layoutsLoading, count, create, remove, update } = useGetLayouts(
    projectId,
    paginationModel.page + 1
  );

  const { objects } = useGetObjects();

  const currentObject = objects?.find((obj) => obj?.project_id === projectId);

  const [rowCountState, setRowCountState] = useState(count || 0);

  useEffect(() => {
    setRowCountState((prevRowCountState) => (count !== undefined ? count : prevRowCountState));
  }, [count, setRowCountState]);

  const table = useTable();

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const layoutNew = useBoolean();

  const [selectedRow, setSelectedRow] = useState();

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  const productForm = useBoolean();

  const layoutEdit = useBoolean();

  const layoutDelete = useBoolean();

  const handleAddNewProduct = useCallback((address) => {
    console.info('ADDRESS', address);
  }, []);

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

  const onDeleteRow = useCallback(() => {
    remove(selectedRow?.layout_id, () => {
      enqueueSnackbar('Планировка удалена!');
      layoutDelete.onToggle();
    });
  }, [enqueueSnackbar, layoutDelete, remove, selectedRow?.layout_id]);

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  const handleEditRow = (row) => setSelectedRow(row);
  const handleDeleteRow = (row) => setSelectedRow(row);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const columns = [
    {
      field: 'layout_name',
      headerName: 'Название планировки',
      flex: 1,
      minWidth: 160,
      hideable: false,
      renderCell: (params) => params?.row?.layout_name || 'Без названия',
    },
    {
      field: 'layout_type',
      headerName: 'Тип',
      flex: 1,
      renderCell: (params) => (
        <Label
          variant="soft"
          color={
            (params?.row?.layout_type === '1' && 'success') ||
            (params?.row?.layout_type === '0' && 'warning') ||
            'default'
          }
        >
          {(params?.row?.layout_type === '1' && 'Квартира') ||
            (params?.row?.layout_type === '0' && 'Этажа')}
        </Label>
      ),
    },

    {
      field: 'webp_file_path',
      headerName: 'Изображение',
      width: 100,
      flex: 1,
      renderCell: (params) => (
        <Avatar
          onClick={() => {
            setSelectedLayoutSrc(params?.row?.webp_file_path);
            layoutModal.onTrue();
          }}
          sx={{ cursor: 'pointer' }}
          src={params?.row?.webp_file_path}
          variant="square"
        />
      ),
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
      getActions: (params) =>
        ['1', '2'].includes(user?.role)
          ? [
              // <GridActionsCellItem
              //   showInMenu
              //   icon={<Iconify icon="solar:pen-bold" />}
              //   label="Изменить"
              //   onClick={() => {
              //     handleEditRow(params.row);
              //     layoutEdit.onTrue();
              //   }}
              // />,
              <GridActionsCellItem
                showInMenu
                icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                label="Удалить"
                onClick={() => {
                  handleDeleteRow(params.row);
                  layoutDelete.onTrue();
                }}
                sx={{ color: 'error.main' }}
              />,
            ]
          : [],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading="Список планировок"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: currentObject?.project_name,
              href: paths.dashboard.object.details(currentObject?.project_id),
            },
            { name: 'Список планировок' },
          ]}
          action={
            ['1', '2'].includes(user?.role) && (
              <Button
                // component={RouterLink}
                // href={paths.dashboard.product.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={layoutNew.onTrue}
              >
                Новая планировка
              </Button>
            )
          }
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />
        {['1', '2'].includes(user?.role) && (
          <Alert severity="info">
            Создание планировки может быть как этажа, так и помещения отдельно. Размер изображения
            не должен превышать 2Мб.
          </Alert>
        )}

        <Card
          sx={{
            height: { xs: 800, md: 2 },
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            getRowId={(row) => row.layout_id}
            disableRowSelectionOnClick
            rows={layouts}
            columns={columns}
            getRowHeight={() => 'auto'}
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={rowCountState}
            pageSizeOptions={[10]}
            loading={layoutsLoading}
            onPaginationModelChange={setPaginationModel}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: () => (
                <GridToolbarContainer>
                  <Stack
                    spacing={1}
                    flexGrow={1}
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    {!!selectedRowIds.length && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                        onClick={confirmRows.onTrue}
                      >
                        Delete ({selectedRowIds.length})
                      </Button>
                    )}

                    {/* <GridToolbarColumnsButton /> */}
                    {/* <GridToolbarFilterButton /> */}
                    {/* <GridToolbarExport /> */}
                  </Stack>
                </GridToolbarContainer>
              ),
              noRowsOverlay: () => <EmptyContent title="Нет данных" />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              columnsPanel: {
                getTogglableColumns,
              },
              pagination: {
                labelRowsPerPage: 'Элементов на странице: ',
                labelDisplayedRows: (paginationInfo) =>
                  `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`,
              },
            }}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
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
      <Lightbox
        open={layoutModal.value}
        close={layoutModal.onToggle}
        slides={[
          {
            src: selectedLayoutSrc,
            width: '100%',
            height: '100%',
          },
        ]}
      />
      <ConfirmDialog
        open={layoutDelete.value}
        onClose={layoutDelete.onFalse}
        title="Удалить"
        content="Вы уверены, что хотите удалить планировку?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Удалить
          </Button>
        }
      />
      <LayoutNewEditForm
        projectId={projectId}
        onCreate={create}
        open={layoutNew.value}
        onClose={layoutNew.onToggle}
      />

      {selectedRow && (
        <LayoutNewEditForm
          currentLayout={selectedRow}
          onUpdate={update}
          open={layoutEdit.value}
          onClose={() => {
            layoutEdit.onToggle();
            setSelectedRow(null);
          }}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}

ProductListView2.propTypes = {
  projectId: PropTypes.string.isRequired,
};
