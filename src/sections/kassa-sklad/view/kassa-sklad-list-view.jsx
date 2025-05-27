import sumBy from 'lodash/sumBy';
import { isEqual, isSameDay } from 'date-fns';
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import { Box, ButtonBase } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter } from 'src/utils/format-time';

import { _invoices } from 'src/_mock';
import { useGetKassaSklad } from 'src/api/payments';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { shortDateLabel } from 'src/components/custom-date-range-picker';
import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import PaymentsNewForm from '../payments-new-form';
import PaymentsAnalytic from '../payments-analytic';
import PaymentsTableRow from '../payments-table-row';
// eslint-disable-next-line import/no-unresolved
import clickLogo from '../../../../public/logo/Click.png';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import PaymentsExcelDialog from '../payments-export-dialog';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'invoice', label: 'Инвойс' },
  { id: 'client', label: 'Клиент' },
  { id: 'comment', label: 'Комментарий' },
  { id: 'price', label: 'Сумма' },
  { id: 'payMethod', label: 'Метод оплаты' },
  { id: 'operator', label: 'Оператор', align: 'center' },
  { id: 'createDate', label: 'Дата оплаты' },
  { id: '' },
];

const defaultFilters = {
  client: {
    id: null,
    name: '',
    term: '',
  },
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function KassaSkladListView() {
  const { page: pageNum } = useParams();
  const navigate = useNavigate();
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
  const { cashInformation, kassSklad, count, create, create2, remove, pay } = useGetKassaSklad(
    page + 1,
    filters.startDate,
    filters.endDate,
    filters.client.id
  );

  useEffect(() => {
    setTableData(kassSklad);
  }, [kassSklad]);

  useEffect(() => {
    if (pageNum) {
      setPage(+pageNum);
    }
  }, [pageNum]);

  const denseHeight = 56;

  const canReset =
    !!filters.client?.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!kassSklad.length && canReset) || !kassSklad.length;

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
          heading="Касса-Склад"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Касса-Склад',
            },
          ]}
          action={
            <Stack direction="row" gap={1}>
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

              <Button
                onClick={newPayment.onTrue}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Оплатить
              </Button>
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <PaymentsAnalytic
                title={renderFilterDay(filters.startDate, filters.endDate)}
                total={byAllTotal}
                count={byAllCount}
                icon="pixelarticons:calendar-tomorrow"
                color={theme.palette.text.secondary}
              />
              <PaymentsAnalytic
                title="Наличные"
                total={byPaidTotal?.payment_amount || 0}
                count={byPaidTotal?.payment_method_count || 0}
                icon="iconoir:hand-cash"
                color={theme.palette.error.main}
              />

              <PaymentsAnalytic
                title="Терминал"
                total={byTerminalTotal?.payment_amount || 0}
                count={byTerminalTotal?.payment_method_count || 0}
                icon="solar:cash-out-outline"
                color={theme.palette.success.main}
              />

              <PaymentsAnalytic
                title="Click"
                total={byClickTotal?.payment_amount || 0}
                count={byClickTotal?.payment_method_count || 0}
                icon="mdi:bank-outline"
                iconSrc={clickLogo}
                color={theme.palette.info.main}
              />
              <PaymentsAnalytic
                title="Банк"
                total={byP2PTotal?.payment_amount || 0}
                count={byP2PTotal?.payment_method_count || 0}
                price={getTotalAmount('pending')}
                icon="solar:card-transfer-broken"
                color={theme.palette.warning.main}
              />
            </Stack>
          </Scrollbar>
        </Card>

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

          <InvoiceTableToolbar
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
              results={kassSklad.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

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
                  {kassSklad.map((row) => (
                    <PaymentsTableRow
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
            onPageChange={(_, nextPage) => navigate(`/dashboard/kassa-sklad/${nextPage}`)}
            labelDisplayedRows={(paginationInfo) =>
              `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
            }
          />
        </Card>
      </Container>

      <PaymentsNewForm open={newPayment.value} onClose={newPayment.onFalse} pay={pay} />

      <PaymentsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------
