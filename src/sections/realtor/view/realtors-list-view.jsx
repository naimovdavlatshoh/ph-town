import { useState } from 'react';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetRealtors } from 'src/api/realtor';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import RealtorNewForm from '../realtor-new-form';
import RealtorTableRow from '../realtor-table-row';
// eslint-disable-next-line import/no-unresolved
import PaymentsExcelDialog from '../payments-export-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'companyName', label: 'Название фирмы' },
  { id: 'surname', label: 'Фамилия' },
  { id: 'name', label: 'Имя' },
  { id: 'phone', label: 'Номер телефона ' },
  { id: 'createDate', label: 'Дата оплаты' },
  { id: '' },
];

const defaultFilters = {
  category: {
    id: null,
    name: '',
    term: '',
  },
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function RealtorsListView() {
  const categoriesFullScreen = useBoolean();

  const [page, setPage] = useState(0);

  const settings = useSettingsContext();

  const exportToExcel = useBoolean();
  const confirm = useBoolean();

  const newRealtor = useBoolean();

  const { realtors, count, remove, create } = useGetRealtors(page + 1);

  const notFound = !realtors.length || !realtors.length;

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lx'}>
        <CustomBreadcrumbs
          heading="Список риэлторов"
          action={
            <Stack direction="row" gap={1}>
              <Button
                onClick={newRealtor.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Новый риэлтор
              </Button>
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          {/* <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs> */}

          {/* <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
          /> */}

          {/* {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={realtors.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size="small" sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {realtors.map((row) => (
                    <RealtorTableRow key={row.kassa_id} row={row} onDeleteRow={remove} />
                  ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={count}
            page={page}
            rowsPerPage={10}
            rowsPerPageOptions={[]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            labelDisplayedRows={(paginationInfo) =>
              `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
            }
          />
        </Card>
      </Container>

      <RealtorNewForm open={newRealtor.value} onClose={newRealtor.onFalse} create={create} />

      <PaymentsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------
