import isEqual from 'lodash/isEqual';
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { DataGrid, GridActionsCellItem, GridToolbarContainer } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetMaterials } from 'src/api/materials';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewForm from '../product-new-form';

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

export default function ProductListView2() {
  const { page: pageNum } = useParams();
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const confirmDelete = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const [page, setPage] = useState(0);

  const { materials, count, materialsLoading, create, update, remove } = useGetMaterials(page + 1);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [selectedRow, setSelectedRow] = useState();

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  const productForm = useBoolean();

  const productEdit = useBoolean();

  useEffect(() => {
    if (materials.length) {
      setTableData(materials);
    }
  }, [materials]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const onDelete = () => {
    remove(selectedRow?.material_id, () => {
      enqueueSnackbar('Материал успешно удален');
      confirmDelete.onFalse();
    });
  };

  useEffect(() => {
    if (pageNum) {
      setPage(+pageNum);
    }
  }, [pageNum]);

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

  const handleEditRow = (row) => setSelectedRow(row);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const columns = [
    {
      sortable: false,
      filterable: false,
      field: 'material_name',
      headerName: 'Название продукта',
      flex: 2,
      minWidth: 160,
      hideable: false,
    },
    {
      sortable: false,
      filterable: false,
      field: 'unit_name',
      headerName: 'Единица измерения',
      width: 100,
      flex: 1,
      editable: true,
    },

    {
      sortable: false,
      filterable: false,
      field: 'short_name',
      headerName: 'Сокращение',
      width: 100,
      editable: true,
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
          icon={<Iconify icon="solar:pen-bold" />}
          label="Изменить"
          onClick={() => {
            handleEditRow(params.row);
            productEdit.onTrue();
          }}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Удалить"
          onClick={() => {
            handleEditRow(params.row);
            confirmDelete.onTrue();
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lx'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading="Список материалов"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Материалы',
            },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={productForm.onTrue}
            >
              Новый материал
            </Button>
          }
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Card
          sx={{
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            getRowId={(row) => row.material_id}
            localeText={{
              toolbarColumns: 'Колонки',
              columnsPanelTextFieldLabel: 'Найти колонку',
              columnsPanelTextFieldPlaceholder: 'Название колонки',
              toolbarExport: 'Экспорт',
              toolbarExportCSV: 'Скачать как CSV',
              toolbarExportPrint: 'Печать',
              toolbarQuickFilterPlaceholder: 'Поиск…',
              columnMenuHideColumn: 'Спрятать колонку',
              columnMenuManageColumns: 'Управление колонками',
              columnMenuLabel: 'Меню',
            }}
            // checkboxSelection
            disableRowSelectionOnClick
            rows={tableData}
            columns={columns}
            loading={materialsLoading}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
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
                        onClick={confirmDelete.onTrue}
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
                page,
                count,
                onPageChange: (_, nextPage) => {
                  navigate(`/dashboard/product2/${nextPage}`);
                },
                labelDisplayedRows: (paginationInfo) =>
                  `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`,
              },
            }}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content="Вы уверены что хотите удалить материал?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />

      <ProductNewForm open={productForm.value} onClose={productForm.onFalse} onCreate={create} />

      {selectedRow && (
        <ProductNewForm
          currentProduct={selectedRow}
          open={productEdit.value}
          onClose={() => {
            productEdit.onFalse();
            setSelectedRow(null);
          }}
          onUpdate={update}
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
