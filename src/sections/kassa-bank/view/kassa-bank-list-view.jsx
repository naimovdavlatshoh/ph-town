// eslint-disable-next-line import/no-extraneous-dependencies
import isEqual from 'lodash/isEqual';
import { useNavigate } from 'react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import { Box, Stack, ButtonBase } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { _userList } from 'src/_mock';
import { useGetWarehouse, useGetExpenditure } from 'src/api/warehouse';
import { useGetKassaBankArrival, useGetKassaBankExpenditure } from 'src/api/payments';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useTable } from 'src/components/table';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ContractsBankExcelDialog from 'src/sections/contracts/contracts-bank-export-dialog';

import KassaBankArrivalListView from './kassa-bank-arrival-list-view';
import KassaBankExpenditureListView from './kassa-bank-expenditure-list-view';

// import ArrivalTableRow from '../arrival-table-row';
// import WarehouseNewForm from '../warehouse-new-form';
// import WarehouseTableRow from '../warehouse-table-row';
// import ArrivalExcelDialog from '../arrival-export-dialog';
// import ExpenditureTableRow from '../expenditure-table-row';
// import ExpenditureExcelDialog from '../expenditure-export.dialog';
// import WarehouseTableFiltersResult from '../warehouse-table-filters-result';

// ----------------------------------------------------------------------

const TABS_TYPE_OPTIONS = [
  { value: '1', label: 'Приходы' },
  { value: '2', label: 'Расходы' },
];

const defaultFilters = {
  name: '',
  status: { value: '1', label: 'Приходы' },
};

// ----------------------------------------------------------------------

export default function KassaBankListView() {
  const navigate = useNavigate();
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

  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
  const [previewBlob, setPreviewBlob] = useState();

  const [filters, setFilters] = useState(defaultFilters);

  const { count: expenditureCount } = useGetKassaBankExpenditure();
  const { count: arrivalCount } = useGetKassaBankArrival();
  const {
    create: createExpenditure,
    expenditures,
    expendituresEmpty,
    count: expendituresCount,
  } = useGetExpenditure(pageExpenditure + 1);
  const { warehouse, warehouseEmpty, count: warehouseCount } = useGetWarehouse(pageWarehouse + 1);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback(
    (name, value) => {
      const data = {
        value,
      };

      if (name === 'status') {
        data.label = TABS_TYPE_OPTIONS.find((status) => status.value === value)?.label;
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
          heading="Касса-Банк"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Касса-Банк' }]}
          action={
            <Stack
              onClick={exportToExcel.onTrue}
              component={ButtonBase}
              loading={loadingExcelFile}
              alignItems="center"
              width={100}
              height={50}
              sx={{
                // background: false ? '#01a76f33' : '#01a76f',
                background: '#01a76f',
                py: 1,
                px: 1,
                borderRadius: 0.5,
              }}
              direction="row"
            >
              <Iconify icon="healthicons:excel-logo" sx={{ width: 40, color: '#ffff' }} />
              <Box component="span" sx={{ color: '#fff', typography: 'body2' }}>
                Скачать
              </Box>
            </Stack>
          }
          // action={
          //   <Stack gap={1} direction="row">
          //     {' '}
          //     <Stack
          //       onClick={exportToExcel.onTrue}
          //       component={ButtonBase}
          //       // loading={loadingExcelFile}
          //       alignItems="center"
          //       width={100}
          //       height={50}
          //       sx={{
          //         background: '#01a76f',
          //         py: 1,
          //         px: 1,
          //         borderRadius: 1,
          //       }}
          //       direction="row"
          //     >
          //       <Iconify icon="healthicons:excel-logo" sx={{ width: 40, color: '#ffff' }} />
          //       <Box component="span" sx={{ color: '#fff', typography: 'body2' }}>
          //         Скачать
          //       </Box>
          //     </Stack>
          //     <Button
          //       onClick={openNew.onTrue}
          //       variant="contained"
          //       startIcon={<Iconify icon="mingcute:add-line" />}
          //     >
          //       Создать
          //     </Button>
          //   </Stack>
          // }
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
              mb: 4,
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
                      ((tab.value === '1' || tab.value === filters.status.value) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === '2' && 'error') ||
                      (tab.value === '1' && 'success') ||
                      'default'
                    }
                  >
                    {tab.value === '2' && expenditureCount}
                    {tab.value === '1' && arrivalCount}
                  </Label>
                }
              />
            ))}
          </Tabs>

          {/* <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            contractTypeOptions={TYPES_OPTIONS}
          /> */}
          {/* {canReset && (
            <WarehouseTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={arrivals.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}
          {filters.status.value === '1' && <KassaBankArrivalListView />}
          {filters.status.value === '2' && <KassaBankExpenditureListView />}
        </Card>
      </Container>

      <ContractsBankExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />

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
      {/* <WarehouseNewForm
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
      )} */}
    </>
  );
}

// ----------------------------------------------------------------------
