// eslint-disable-next-line import/no-extraneous-dependencies
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

import { useGetRealtors, useGetRealtorContracts } from 'src/api/realtor';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useTable } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import RealtorContractsExcelDialog from 'src/sections/realtor/realtor-contracts-export-dialog';

import RealtorsListView from './realtors-list-view';
import RealtorContractsListView from './realtor-contracts-list-view';

// import ArrivalTableRow from '../arrival-table-row';
// import WarehouseNewForm from '../warehouse-new-form';
// import WarehouseTableRow from '../warehouse-table-row';
// import ArrivalExcelDialog from '../arrival-export-dialog';
// import ExpenditureTableRow from '../expenditure-table-row';
// import ExpenditureExcelDialog from '../expenditure-export.dialog';
// import WarehouseTableFiltersResult from '../warehouse-table-filters-result';

// ----------------------------------------------------------------------

const TABS_TYPE_OPTIONS = [
  { value: '1', label: 'Список риэлторов' },
  { value: '2', label: 'Контракты риэлторов' },
];

const defaultFilters = {
  name: '',
  status: { value: '1', label: 'Список риэлторов' },
};

// ----------------------------------------------------------------------

export default function RealtorListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const exportToExcel = useBoolean();

  const confirm = useBoolean();

  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const { count: realtorContractsCount } = useGetRealtorContracts();
  const { count: realtorCount } = useGetRealtors();

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
          heading="Риэлторы"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Риэлторы' }]}
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
                    {tab.value === '2' && realtorContractsCount}
                    {tab.value === '1' && realtorCount}
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
          {filters.status.value === '1' && <RealtorsListView />}
          {filters.status.value === '2' && <RealtorContractsListView />}
        </Card>
      </Container>

      <RealtorContractsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />

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
