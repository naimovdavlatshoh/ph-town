import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter } from 'src/utils/format-time';

import { _invoices } from 'src/_mock';
import { useGetRealtorContracts } from 'src/api/realtor';

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

import AddContractNewForm from '../add-contract-new-form';
// eslint-disable-next-line import/no-unresolved
import PaymentsExcelDialog from '../payments-export-dialog';
import RealtorContractsTableRow from '../realtor-contracts-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'realtor', label: 'Риэлтор' },
  { id: 'contract', label: 'Контракт' },
  { id: 'contract_amount', label: 'Сумма контракта' },
  { id: 'realtor_amount', label: 'Сумма ' },
  { id: 'realtor_price', label: 'Сумма ' },
  { id: 'comments', label: 'Комментарий ' },
  // { id: 'createDate', label: 'Дата оплаты' },
  { id: 'operator', label: 'Оператор' },
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

export default function RealtorContractsListView() {
  const [rateChangeLoading, setRateChangeLoading] = useState(false);

  const rateModal = useBoolean();

  const [page, setPage] = useState(0);

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const exportToExcel = useBoolean();
  const confirm = useBoolean();
  const addContract = useBoolean();

  const newContract = useBoolean();

  const [tableData, setTableData] = useState(_invoices);
  const [selectedRow, setSelectedRow] = useState(_invoices);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const { realtorContracts, count, remove, create, update } = useGetRealtorContracts(page + 1);

  useEffect(() => {
    setTableData(realtorContracts);
  }, [realtorContracts]);

  const denseHeight = 56;

  const canReset =
    !!filters.category?.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!realtorContracts.length && canReset) || !realtorContracts.length;

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const { enqueueSnackbar } = useSnackbar();
  const onDelete = () => {
    remove(selectedRow?.realtor_contract_id, () => {
      enqueueSnackbar('Контракт успешно открепрен!');
      confirm.onFalse();
      setSelectedRow(null);
    });
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lx'}>
        <CustomBreadcrumbs
          heading="Контракты риэлторов"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
          action={
            <Stack direction="row" gap={1}>
              <Button
                onClick={addContract.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Закрепить контракт
              </Button>
            </Stack>
          }
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
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={realtorContracts.length}
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
                  {realtorContracts.map((row) => (
                    <RealtorContractsTableRow
                      key={row.kassa_id}
                      row={row}
                      onDeleteRow={(data, cb) => {
                        remove(data, cb);
                      }}
                      onSelectRow={setSelectedRow}
                      onEditRow={update}
                    />
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

      <AddContractNewForm open={addContract.value} onClose={addContract.onFalse} create={create} />

      <PaymentsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------
