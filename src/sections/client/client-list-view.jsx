import isEqual from 'lodash/isEqual';
import { useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Link, Typography } from '@mui/material';
import {
  DataGrid,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useParams, useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClients, useSearchClients } from 'src/api/clients';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { RenderCellEntityType } from './client-table-row';
import ClientTableFiltersResult from './client-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  clientType: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function ClientListView() {
  const { page: pageNum } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();
  const confirmDelete = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const [page, setPage] = useState(0);
  const [clientTerm, setClientTerm] = useState('');

  const { clients, clientsLoading, count, remove } = useGetClients(page + 1);
  const { searchResults, searchLoading } = useSearchClients(
    clientTerm?.length >= 3 ? clientTerm : ''
  );

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedId, setSelectedId] = useState();

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  useEffect(() => {
    if (clients.length) {
      setTableData(clients);
    }
  }, [clients]);

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

  const handleConfirmDeleteRow = useCallback(
    (id) => {
      if (!id) {
        return;
      }

      setSelectedId(id);
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const onDelete = () => {
    remove(selectedId, () => {
      confirmDelete.onFalse();
      setSelectedId(null);
    });
  };

  const handleConfirmDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.client_id));

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

  const columns = [
    {
      sortable: false,
      filterable: false,
      field: 'client_name',
      headerName: 'Ф.И.О / Название',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => (
        <Link component={RouterLink} href={paths.dashboard.clients.details(params?.row?.client_id)}>
          {params.row.client_type === '0'
            ? `${params.row.client_surname || ''} ${params.row.client_name || ''} ${
                params.row.client_fathername || ''
              } `
            : params.row?.business_name}
        </Link>
      ),
    },
    {
      sortable: false,
      filterable: false,
      field: 'client_type',
      headerName: 'Тип клиента',
      width: 110,
      renderCell: (params) => <RenderCellEntityType params={params} />,
    },
    {
      sortable: false,
      filterable: false,
      field: 'address_by_passport',
      headerName: 'Адрес',
      minWidth: 160,
      flex: 1,
      renderCell: (params) =>
        params.row.client_type === '0'
          ? `${params.row.city_by_passport}. ${params.row.address_by_passport}`
          : `${params.row.business_city}. ${params.row.business_address}`,
    },

    {
      sortable: false,
      filterable: false,
      field: 'phone_option',
      headerName: 'Телефон',
      width: 160,
      renderCell: (params) => (
        <Stack>
          {params?.row?.phone_option?.map((phone) => (
            <Typography variant="body2" color={phone?.is_main === '1' && 'primary'}>
              {phone?.phone_number}
            </Typography>
          ))}
        </Stack>
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
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="Посмотреть"
          onClick={() => handleViewRow(params.row.client_id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Изменить"
          onClick={() => handleEditRow(params.row.client_id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Удалить"
          onClick={() => {
            handleConfirmDeleteRow(params.row.client_id);
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

  const onFilterChange = useCallback((filterModel) => {
    // Here you save the data you need from the filter model
    setClientTerm(filterModel?.quickFilterValues[0]);
  }, []);

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
          heading="Список клиентов"
          links={[
            { name: 'Dashboard', href: paths.dashboard.object.root },
            {
              name: 'Клиенты',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.clients.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Новый клиент
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
            height: { xs: 800, md: 2 },
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            filterDebounceMs={500}
            modefilterMode="server"
            onFilterModelChange={onFilterChange}
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
            getRowId={(row) => row?.client_id}
            disableRowSelectionOnClick
            rows={clientTerm ? searchResults : clients}
            columns={columns}
            loading={clientsLoading || searchLoading}
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
                <>
                  <GridToolbarContainer>
                    {/* <ClientTableToolbar
                      filters={filters}
                      onFilters={handleFilters}
                      clientTypeOptions={CLIENT_TYPE_OPTIONS}
                    /> */}

                    <GridToolbarQuickFilter
                      autoFocus
                      size="medium"
                      // value={clientTerm}
                      // onChange={handleSearchChange}
                    />

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

                      <GridToolbarColumnsButton />
                      {/* <GridToolbarFilterButton /> */}
                      <GridToolbarExport />
                    </Stack>
                  </GridToolbarContainer>

                  {canReset && (
                    <ClientTableFiltersResult
                      filters={filters}
                      onFilters={handleFilters}
                      onResetFilters={handleResetFilters}
                      results={count}
                      sx={{ p: 2.5, pt: 0 }}
                    />
                  )}
                </>
              ),
              noRowsOverlay: () => <EmptyContent title="Нет данных" />,
              noResultsOverlay: () => <EmptyContent title="Данные не найдены" />,
            }}
            slotProps={{
              columnsPanel: {
                getTogglableColumns,
              },
              pagination: {
                labelRowsPerPage: 'Элементов на странице: ',
                labelDisplayedRows: (paginationInfo) =>
                  `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`,
                page,
                count,
                onPageChange: (_, nextPage) => navigate(`/dashboard/clients/${nextPage}`),
              },
            }}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content="Вы уверены что хотите удалить клиента?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </>
  );
}
