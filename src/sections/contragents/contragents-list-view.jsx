import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Stack, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetContragents } from 'src/api/contragents';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ContragentNewForm from './contragent-new-form';
import ContragentCategoriesFullscreen from './contragent-categories-fullscreen';

// ----------------------------------------------------------------------

const defaultFilters = {
  clientType: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function ContragentsListView() {
  const [selectedRow, setSelectedRow] = useState();

  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();
  const categoriesFullscreen = useBoolean();
  const confirmDelete = useBoolean();
  const newUser = useBoolean();
  const editUser = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const [page, setPage] = useState(0);

  const { contragents, contragentsLoading, count, create, update } = useGetContragents(page + 1);

  // console.log('awdawewa', searchResults);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedId, setSelectedId] = useState();

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  useEffect(() => {
    if (contragents.length) {
      setTableData(contragents);
    }
  }, [contragents]);

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

  const handleConfirmDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.client_id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  const onOpenEditForm = useCallback(
    (row) => {
      setSelectedRow(row);
      editUser.onTrue();
    },
    [editUser]
  );

  const onCloseEditForm = useCallback(
    (row) => {
      setSelectedRow(null);
      editUser.onFalse();
    },
    [editUser]
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
      minWidth: 260,
      hideable: false,
      renderCell: (params) =>
        params.row.client_type === '0' ? (
          `${params.row.client_surname || ''} ${params.row.client_name || ''} ${
            params.row.client_fathername || ''
          } `
        ) : (
          <Stack>
            <Typography>{params.row?.client_surname}</Typography>
            <Typography color="info.main" variant="caption">
              {params.row?.client_name}
            </Typography>
          </Stack>
        ),
    },
    {
      sortable: false,
      filterable: false,
      field: 'counterparty_name',
      headerName: 'Категория',
      width: 220,
      renderCell: (params) => params?.row?.counterparty_name,
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
          icon={<Iconify icon="solar:pen-bold" />}
          label="Изменить"
          onClick={() => onOpenEditForm(params.row)}
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
          heading="Список контрагентов"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Список контрагентов' },
          ]}
          action={
            <Stack direction="row" gap={1}>
              <Button
                color="info"
                variant="contained"
                onClick={categoriesFullscreen.onTrue}
                startIcon={<Iconify icon="icon-park-twotone:category-management" />}
              >
                Категории
              </Button>
              <Button
                onClick={newUser.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Новый контрагент
              </Button>
            </Stack>
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
            rows={contragents}
            columns={columns}
            loading={contragentsLoading}
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
                onPageChange: (_, nextPage) => setPage(nextPage),
              },
            }}
          />
        </Card>
      </Container>

      <ContragentCategoriesFullscreen
        open={categoriesFullscreen.value}
        handleClose={categoriesFullscreen.onFalse}
      />
      <ContragentNewForm open={newUser.value} onClose={newUser.onFalse} onCreate={create} />

      {selectedRow && (
        <ContragentNewForm
          open={editUser.value}
          onClose={onCloseEditForm}
          onUpdate={update}
          currentContragent={selectedRow}
        />
      )}
    </>
  );
}
