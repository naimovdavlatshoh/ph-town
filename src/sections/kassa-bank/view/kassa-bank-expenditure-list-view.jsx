import sumBy from 'lodash/sumBy';
import { isEqual, isSameDay } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { Button, Typography } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { _invoices } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';
import { useGetKassaBankExpenditure } from 'src/api/payments';

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

import PaymentsNewForm from '../payments-new-form';
import PaymentsAnalytic from '../payments-analytic';
// eslint-disable-next-line import/no-unresolved
import clickLogo from '../../../../public/logo/Click.png';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import PaymentsExcelDialog from '../payments-export-dialog';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';
import PaymentsExpenditureTableRow from '../payments-expenditure-table-row';
import KassaBankCategoriesFullscreen from '../kassa-bank-categories-fullscreen';
import ExpenditureCurrencyChangeDialog from '../expenditure-currency-change-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'category', label: 'Категория' },
  { id: 'comment', label: 'Комментарий' },
  { id: 'priceUZS', label: 'Сумма в UZS' },
  { id: 'priceUSD', label: 'Сумма в USD' },
  { id: 'priceUSD', label: 'Валюта' },
  { id: 'rate', label: 'По курсу' },
  { id: 'payMethod', label: 'Метод оплаты' },
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

export default function KassaBankExpenditureListView() {
  const [rateChangeLoading, setRateChangeLoading] = useState(false);
  const categoriesFullScreen = useBoolean();
  const rateModal = useBoolean();

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

  const { user } = useAuthContext();

  const {
    cashInformation,
    kassBankExpedniture,
    count,
    remove,
    pay,
    currentUsdRate,
    setRate,
    balanceCash,
    balanceClick,
  } = useGetKassaBankExpenditure(page + 1, filters.startDate, filters.endDate, filters.category.id);

  useEffect(() => {
    setTableData(kassBankExpedniture);
  }, [kassBankExpedniture]);

  const denseHeight = 56;

  const canReset =
    !!filters.category?.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!kassBankExpedniture.length && canReset) || !kassBankExpedniture.length;

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

  const onChangeRate = (value) => {
    setRateChangeLoading(true);
    setRate(value, () => {
      rateModal.onFalse();
      setRateChangeLoading(false);
    });
  };

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
          heading="Расходы"
          action={
            <Stack direction="row" gap={1} alignItems="center">
              <Stack gap={0.5}>
                <Typography variant="caption" mr={2}>
                  Баланс (Наличка):{' '}
                  <span style={{ fontWeight: 900 }}> {fCurrency(balanceCash)} UZS</span>
                </Typography>
                <Typography variant="caption" mr={2}>
                  Баланс (Карта):{' '}
                  <span style={{ fontWeight: 900 }}> {fCurrency(balanceClick)} UZS</span>
                </Typography>
              </Stack>
              <Button
                color="success"
                variant="contained"
                onClick={rateModal.onTrue}
                startIcon={<Iconify icon="ri:exchange-box-fill" />}
              >
                1$ = {fCurrency(currentUsdRate)} UZS
              </Button>
              <Button
                color="info"
                variant="contained"
                onClick={categoriesFullScreen.onTrue}
                startIcon={<Iconify icon="icon-park-twotone:category-management" />}
              >
                Категории
              </Button>
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
              results={kassBankExpedniture.length}
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
                  {kassBankExpedniture.map((row) => (
                    <PaymentsExpenditureTableRow
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

      {rateModal.value && (
        <ExpenditureCurrencyChangeDialog
          onClose={rateModal.onFalse}
          open={rateModal.value}
          currency={currentUsdRate}
          loadingSave={rateChangeLoading}
          onSave={onChangeRate}
        />
      )}

      <PaymentsNewForm
        open={newPayment.value}
        onClose={newPayment.onFalse}
        pay={pay}
        balanceCash={balanceCash}
        balanceClick={balanceClick}
        // balance={user?.role === '1' ? balanceClick : balanceCash}
      />

      <PaymentsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------
