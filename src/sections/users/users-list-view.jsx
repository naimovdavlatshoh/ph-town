import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetUsers } from 'src/api/users';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UsersNewForm from './users-new-form';
import { RenderCellRole } from './client-table-row';
import { RenderCellCreatedAt } from '../client/client-table-row';

// ----------------------------------------------------------------------

const defaultFilters = {
  clientType: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function UsersListView() {
  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();
  const confirmDelete = useBoolean();
  const newUser = useBoolean();
  const editUser = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  const [page, setPage] = useState(0);

  const { users, usersLoading, count, remove, create, update } = useGetUsers(page + 1);

  // console.log('awdawewa', searchResults);

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedId, setSelectedId] = useState();

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [editData, setEditData] = useState();

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  useEffect(() => {
    if (users.length) {
      setTableData(users);
    }
  }, [users]);

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
      enqueueSnackbar('Пользователь удален успешно!');
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
    (data) => {
      setEditData(data);
      editUser.onTrue();
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
      field: 'user_name',
      headerName: 'Ф.И.О',
      flex: 1,
      minWidth: 200,
      hideable: false,
      renderCell: (params) => `${params.row.lastname} ${params.row.firstname}`,
    },
    {
      sortable: false,
      filterable: false,
      field: 'user_role',
      headerName: 'Роль',
      width: 250,
      renderCell: (params) => <RenderCellRole params={params} />,
    },
    {
      sortable: false,
      filterable: false,
      field: 'email',
      headerName: 'Эл.почта',
      width: 300,
      renderCell: (params) => params.row.email,
    },
    {
      sortable: false,
      filterable: false,
      field: 'created_at',
      headerName: 'Создан',
      width: 110,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
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
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Удалить"
          onClick={() => {
            handleConfirmDeleteRow(params.row.user_id);
          }}
          sx={{ color: 'error.main' }}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Изменить"
          onClick={() => {
            handleEditRow(params.row);
          }}
          sx={{ color: 'warning.main' }}
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
          heading="Список пользователей"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Список пользователей' },
          ]}
          action={
            <Button
              onClick={newUser.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Новый пользователь
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
            getRowId={(row) => row?.user_id}
            disableRowSelectionOnClick
            rows={users}
            columns={columns}
            loading={usersLoading}
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

      <UsersNewForm open={newUser.value} onClose={newUser.onFalse} onCreate={create} />

      {editData && (
        <UsersNewForm
          open={editUser.value}
          onClose={() => {
            setEditData(null);
            editUser.onFalse();
          }}
          currentUser={editData}
          onUpdate={update}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content="Вы уверены что хотите удалить пользователя?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </>
  );
}
