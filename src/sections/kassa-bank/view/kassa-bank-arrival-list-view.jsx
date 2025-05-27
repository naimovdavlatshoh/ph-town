import sumBy from 'lodash/sumBy';
import { isEqual, isSameDay } from 'date-fns';
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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter } from 'src/utils/format-time';

import { _invoices } from 'src/_mock';
import { useGetKassaBankArrival } from 'src/api/payments';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { shortDateLabel } from 'src/components/custom-date-range-picker';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import ArrivalNewForm from '../arrival-new-form';
// eslint-disable-next-line import/no-unresolved
import PaymentsExcelDialog from '../payments-export-dialog';
import PaymentsArrivalTableRow from '../payments-arrival-table-row';
import KassaBankCategoriesFullscreen from '../kassa-bank-categories-fullscreen';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'amount', label: 'Сумма' },
  { id: 'rate', label: 'По курсу' },
  { id: 'usd', label: 'В доллорах' },
  { id: 'comments', label: 'Комментарий' },
  { id: 'operator', label: 'Оператор', align: 'center' },
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

export default function KassaBankArrivalListView() {
  const categoriesFullScreen = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const exportToExcel = useBoolean();
  const confirm = useBoolean();

  const newPayment = useBoolean();

  const [tableData, setTableData] = useState(_invoices);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const { cashInformation, kassBankArrival, count, remove, pay } = useGetKassaBankArrival(
    page + 1,
    filters.startDate,
    filters.endDate,
    filters.category.id
  );

  useEffect(() => {
    setTableData(kassBankArrival);
  }, [kassBankArrival]);

  const denseHeight = 56;

  const canReset =
    !!filters.category?.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!kassBankArrival.length && canReset) || !kassBankArrival.length;

  const getInvoiceLength = (status) => tableData.filter((item) => item.status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalAmount'
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

  const byPaidTotal = cashInformation?.find((item) => item?.payment_method === '1');
  const byTerminalTotal = cashInformation?.find((item) => item?.payment_method === '2');
  const byClickTotal = cashInformation?.find((item) => item?.payment_method === '3');
  const byP2PTotal = cashInformation?.find((item) => item?.payment_method === '4');
  const byAllTotal = cashInformation?.reduce((sum, cur) => sum + Number(cur?.payment_amount), 0);
  const byAllCount = cashInformation?.reduce(
    (sum, cur) => sum + Number(cur?.payment_method_count),
    0
  );

  const TABS = [
    { value: 'all', label: 'Все', color: 'default', count: tableData.length },
    {
      value: 'paid',
      label: 'Наличные',
      color: 'error',
      count: getInvoiceLength('paid'),
    },
    {
      value: 'pending',
      label: 'Терминал',
      color: 'success',
      count: getInvoiceLength('pending'),
    },
    {
      value: 'overdue',
      label: 'Банк',
      color: 'warning',
      count: getInvoiceLength('overdue'),
    },
    {
      value: 'draft',
      label: 'Click',
      color: 'info',
      count: getInvoiceLength('draft'),
    },
  ];

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  // eslint-disable-next-line consistent-return
  const renderFilterDay = (startDay, endDay) => {
    if (!startDay && !endDay) {
      return 'За все время';
    }

    if (isEqual(startDay, endDay) && isSameDay(new Date(), startDay)) {
      return 'За сегодня';
    }

    return shortDateLabel(startDay, endDay);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lx'}>
        <CustomBreadcrumbs
          heading="Приходы"
          action={
            <Stack direction="row" gap={1}>
              <Button
                onClick={newPayment.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Приход
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
              results={kassBankArrival.length}
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
                  {kassBankArrival.map((row) => (
                    <PaymentsArrivalTableRow
                      key={row.kassa_id}
                      row={row}
                      onDeleteRow={(data, cb) => {
                        remove(data, cb);
                      }}
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

      {categoriesFullScreen.value && (
        <KassaBankCategoriesFullscreen
          handleClose={categoriesFullScreen.onFalse}
          open={categoriesFullScreen.value}
        />
      )}

      <ArrivalNewForm open={newPayment.value} onClose={newPayment.onFalse} pay={pay} />

      <PaymentsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------
