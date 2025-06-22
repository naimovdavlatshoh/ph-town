// eslint-disable-next-line import/no-extraneous-dependencies
import isEqual from 'lodash/isEqual';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { Box, Stack, ButtonBase } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

import { _userList } from 'src/_mock';
import { useSearchContragents } from 'src/api/contragents';
import { useGetArrivals, useGetWarehouse, useGetExpenditure } from 'src/api/warehouse';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { useAuthContext } from 'src/auth/hooks';
import ArrivalTableRow from '../arrival-table-row';
import WarehouseNewForm from '../warehouse-new-form';
import WarehouseTableRow from '../warehouse-table-row';
import ArrivalExcelDialog from '../arrival-export-dialog';
import ExpenditureTableRow from '../expenditure-table-row';
import ArrivalTableToolbar from '../arrival-table-toolbar';
import ExpenditureExcelDialog from '../expenditure-export.dialog';
import WarehouseTableFiltersResult from '../warehouse-table-filters-result';

// ----------------------------------------------------------------------

export const CONTRACT_TYPES_OPTIONS = [
  { value: '0', label: 'Наличные' },
  { value: '1', label: 'Рассрочка' },
];

export const TABS_OPTIONS = [
  { value: '1', label: 'Приходы' },
  { value: '2', label: 'Расходы' },
];

const TABS_TYPE_OPTIONS = [{ value: '3', label: 'Остатки' }, ...TABS_OPTIONS];
const TYPES_OPTIONS = [{ value: 'all', label: 'Все' }, ...CONTRACT_TYPES_OPTIONS];

const TABLE_HEAD_WAREHOUSE = [
  { id: 'material_id', label: 'ID сырья', width: 120 },
  { id: 'material_name', label: 'Сырьё' },
  { id: 'amount', label: 'Количество' },
];

const TABLE_HEAD_ARRIVAL = [
  { id: 'invoice_number', label: 'Инвойс номер' },
  { id: 'create_at', label: 'Дата' },
  { id: 'material_name', label: 'Сырьё' },
  { id: 'amount', label: 'Количество' },
  { id: 'price', label: 'Цена', minWidth: 150 },
  { id: 'total', label: 'Общая сумма', minWidth: 200 },
  { id: 'delivery_price', label: 'За доставку' },
  { id: 'client', label: 'Клиент', minWidth: 300 },
  { id: 'operator', label: 'Оператор' },
  { id: '', width: 88 },
];

const TABLE_HEAD_EXPENDITURE = [
  { id: 'project_name', label: 'Объект' },
  { id: 'material_name', label: 'Сырьё' },
  { id: 'amount', label: 'Кол-во' },
  { id: 'createdAt', label: 'Дата' },
  { id: 'operator', label: 'Оператор' },
];

const defaultFilters = {
  contragent: '',
  status: { value: '3', label: 'Остатки' },
};

// ----------------------------------------------------------------------

const loadFile = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  });
  const template = await response.blob();

  return template;
};

const loadImage = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

export default function ArrivalListView() {
  const { user } = useAuthContext();
  const [pageWarehouse, setPageWarehouse] = useState(0);
  const [pageArrival, setPageArrival] = useState(0);

  const [pageExpenditure, setPageExpenditure] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const openNew = useBoolean();
  const exportToExcel = useBoolean();
  const confirm = useBoolean();
  const previewDocument = useBoolean();

  const [tableData, setTableData] = useState(_userList);
  const [previewBlob, setPreviewBlob] = useState();

  const [filters, setFilters] = useState(defaultFilters);

  const {
    create: createArrival,
    arrivals,
    arrivalsEmpty,
    count: arrivalsCount,
    remove,
    pay,
  } = useGetArrivals(pageArrival + 1, '', '', filters.contragent.id);
  const {
    create: createExpenditure,
    expenditures,
    expendituresEmpty,
    count: expendituresCount,
  } = useGetExpenditure(pageExpenditure + 1);
  const { warehouse, warehouseEmpty, count: warehouseCount } = useGetWarehouse(pageWarehouse + 1);

  const debounceContragent = useDebounce(filters.contragent, 3);
  const { searchResults, searchResultsLoading } = useSearchContragents(debounceContragent);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback(
    (name, value) => {
      let data = {
        value,
      };

      if (name === 'status') {
        data.label = TABS_TYPE_OPTIONS.find((status) => status.value === value)?.label;
      }

      if (name === 'contractType') {
        data.label = TYPES_OPTIONS.find((contract) => contract.value === value)?.label;
      }

      if (name === 'contragent') {
        data = value;
      }

      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: data,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.contracts.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Склад"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Склад' }]}
          action={
            <Stack gap={1} direction="row">
              {' '}
              {['1', '2'].includes(user?.role) && (
                <Stack
                  onClick={exportToExcel.onTrue}
                  component={ButtonBase}
                  // loading={loadingExcelFile}
                  alignItems="center"
                  width={100}
                  height={50}
                  sx={{
                    background: '#01a76f',
                    py: 1,
                    px: 1,
                    borderRadius: 1,
                  }}
                  direction="row"
                >
                  <Iconify icon="healthicons:excel-logo" sx={{ width: 40, color: '#ffff' }} />
                  <Box component="span" sx={{ color: '#fff', typography: 'body2' }}>
                    Скачать
                  </Box>
                </Stack>
              )}
              <Button
                onClick={openNew.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Создать
              </Button>
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status.value}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS_TYPE_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status.value) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === '2' && 'error') ||
                      (tab.value === '1' && 'success') ||
                      'default'
                    }
                  >
                    {tab.value === '1' && arrivalsCount}
                    {tab.value === '2' && expendituresCount}
                    {tab.value === '3' && warehouseCount}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Stack direction="row" width={1}>
            {canReset && (
              <WarehouseTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                //
                onResetFilters={handleResetFilters}
                //
                results={arrivals.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            {filters.status.value === '1' && (
              <ArrivalTableToolbar
                filters={filters}
                onFilters={handleFilters}
                contractTypeOptions={TYPES_OPTIONS}
              />
            )}
          </Stack>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={arrivals.length}
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size="small" sx={{ minWidth: 960 }}>
                {filters.status.value === '3' && (
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD_WAREHOUSE}
                    rowCount={warehouseCount}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) => table.onSelectAllRows(checked)}
                  />
                )}
                {filters.status.value === '1' && (
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD_ARRIVAL}
                    rowCount={
                      filters.contragent?.length >= 3 ? searchResults?.length : arrivals?.length
                    }
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) => table.onSelectAllRows(checked)}
                  />
                )}
                {filters.status.value === '2' && (
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD_EXPENDITURE}
                    rowCount={expendituresCount}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) => table.onSelectAllRows(checked)}
                  />
                )}

                <TableBody>
                  {filters.status.value === '3' &&
                    warehouse.map((row) => (
                      <WarehouseTableRow
                        key={row.warehouse_id}
                        row={row}
                        selected={table.selected.includes(row.contract_id)}
                        onSelectRow={() => table.onSelectRow(row.contract_id)}
                        onEditRow={() => handleEditRow(row.contract_id)}
                      />
                    ))}

                  {filters.status.value === '2' &&
                    expenditures.map((row) => (
                      <ExpenditureTableRow
                        key={row.expenditure_id}
                        row={row}
                        selected={table.selected.includes(row.contract_id)}
                        onSelectRow={() => table.onSelectRow(row.contract_id)}
                        onEditRow={() => handleEditRow(row.contract_id)}
                      />
                    ))}
                  {filters.status.value === '1' &&
                    arrivals.map((row) => (
                      <ArrivalTableRow
                        pay={pay}
                        key={row.arrival_id}
                        row={row}
                        selected={table.selected.includes(row.contract_id)}
                        onSelectRow={() => table.onSelectRow(row.contract_id)}
                        onEditRow={() => handleEditRow(row.contract_id)}
                        onDeleteRow={remove}
                      />
                    ))}

                  {filters.status.value === '1' && <TableNoData notFound={arrivalsEmpty} />}
                  {filters.status.value === '2' && <TableNoData notFound={expendituresEmpty} />}
                  {filters.status.value === '3' && <TableNoData notFound={warehouseEmpty} />}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          {filters.status.value === '1' && (
            <TablePaginationCustom
              count={Number(
                filters.contragent?.length >= 3 ? searchResults?.length : arrivalsCount
              )}
              page={pageArrival}
              rowsPerPage={20}
              rowsPerPageOptions={[]}
              onPageChange={(_, nextPage) => setPageArrival(nextPage)}
              labelDisplayedRows={(paginationInfo) =>
                `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
              }
              //
              // onChangeDense={table.onChangeDense}
            />
          )}
          {filters.status.value === '2' && (
            <TablePaginationCustom
              count={Number(expendituresCount)}
              page={pageExpenditure}
              rowsPerPage={10}
              rowsPerPageOptions={[]}
              onPageChange={(_, nextPage) => setPageExpenditure(nextPage)}
              labelDisplayedRows={(paginationInfo) =>
                `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
              }
              //
              // onChangeDense={table.onChangeDense}
            />
          )}

          {filters.status.value === '3' && (
            <TablePaginationCustom
              count={Number(warehouseCount)}
              page={pageWarehouse}
              rowsPerPage={10}
              rowsPerPageOptions={[]}
              onPageChange={(_, nextPage) => setPageWarehouse(nextPage)}
              labelDisplayedRows={(paginationInfo) =>
                `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
              }
              //
              // onChangeDense={table.onChangeDense}
            />
          )}
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <WarehouseNewForm
        open={openNew.value}
        onClose={openNew.onFalse}
        onCreate={createArrival}
        onCreate2={createExpenditure}
      />
      {filters?.status?.value === '2' ? (
        <ExpenditureExcelDialog
          exportType={filters.status}
          open={exportToExcel.value}
          onClose={exportToExcel.onFalse}
        />
      ) : (
        <ArrivalExcelDialog
          exportType={filters.status}
          open={exportToExcel.value}
          onClose={exportToExcel.onFalse}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, contractType } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status.value !== 'all') {
    // inputData = inputData.filter((user) => user.status.value === status.value);
  }

  if (contractType.value !== 'all') {
    // inputData = inputData.filter((user) => contractType.includes(user.contract_type));
  }

  return inputData;
}
