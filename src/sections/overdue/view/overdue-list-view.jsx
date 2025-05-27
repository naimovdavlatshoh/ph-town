// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TemplateHandler } from 'easy-template-x';
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';

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
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

import axios, { endpoints } from 'src/utils/axios';

import { _userList } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';
import { useGetOverduedays } from 'src/api/contract';

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


import ContractsExcelDialog from '../contracts-export-dialog';

import ContractOverduesFullscreen from '../contract-overdues-fullscreen';
import ContractPreivewFullscreenDialog from '../contract-preview-fullscreen-dialog';
import OverdueTableRow from '../overdue-table-row';

// ----------------------------------------------------------------------

export const CONTRACT_TYPES_OPTIONS = [
  { value: '0', label: 'Наличные' },
  { value: '1', label: 'Рассрочка' },
];

export const CONTRACT_STATUS_OPTIONS = [
  { value: '2', label: 'Подтвержденные' },
  { value: '1', label: 'В процессе' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'Все' }, ...CONTRACT_STATUS_OPTIONS];
const TYPES_OPTIONS = [{ value: 'all', label: 'Все' }, ...CONTRACT_TYPES_OPTIONS];

const TABLE_HEAD = [
  { id: 'contract_number', label: 'Контракт' },
  { id: 'client_name', label: 'Клиент' },
  { id: 'contract_status', label: 'Дата платежа' },
  { id: 'contract_type', label: 'Оплачено' },
  { id: 'contract_file', label: 'Ежемесячная плата' },
  { id: 'comments', label: 'Просроченные дни' },
];

const defaultFilters = {
  client: '',
  contractType: { value: 'all', label: 'Все' },
  status: { value: 'all', label: 'Все' },
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

function abbreviateName(fullName) {
  const words = fullName?.split(' ');

  const abbreviated = words?.map((word) => `${word[0]?.toUpperCase()}.`);

  return abbreviated?.join(' ');
}

export default function OverdueListView() {
  const { page: pageNum } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();
  const [selectedId, setSelectedId] = useState();

  const exportToExcel = useBoolean();
  const confirm = useBoolean();
  const previewDocument = useBoolean();
  const overduesFullscreen = useBoolean();

  const onOpenDeleteModal = (id) => {
    setSelectedId(id);
    confirm.onTrue();
  };

  const onCloseDeleteModal = () => {
    setSelectedId(null);
    confirm.onFalse();
  };

  const [tableData, setTableData] = useState(_userList);
  const [previewBlob, setPreviewBlob] = useState();
  const [contractNumber, setContractNumber] = useState();

  const [filters, setFilters] = useState(defaultFilters);

  const { user } = useAuthContext();

  const { overduedaysLoading, overduedays, overduedaysEmpty, count } = useGetOverduedays(page);

  const debounceClient = useDebounce(filters.client, 3);
  // const { searchResults, searchResultsLoading } = useSearchClientsFromContract(debounceClient);

  useEffect(() => {
    setTableData(overduedays);
  }, [overduedays]);

  useEffect(() => {
    if (pageNum) {
      setPage(+pageNum);
    }
  }, [pageNum]);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  // const notFound = contractsEmpty;

  // const onDelete = () => {
  //   remove(selectedId, () => {
  //     enqueueSnackbar('Контракт удален успешно!');
  //     onCloseDeleteModal();
  //   });
  // };

  const handleFilters = useCallback(
    (name, value) => {
      let data = {
        value,
      };

      if (name === 'status') {
        data.label = STATUS_OPTIONS.find((status) => status.value === value)?.label;
      }

      if (name === 'contractType') {
        data.label = TYPES_OPTIONS.find((contract) => contract.value === value)?.label;
      }

      if (name === 'client') {
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

  // const handleEditRow = useCallback(
  //   (id) => {
  //     router.push(paths.dashboard.overdues.edit(id));
  //   },
  //   [router]
  // );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generateDocument = async (data) => {
    let template;
    // eslint-disable-next-line eqeqeq
    if (data.contract_type == 0) {
      if (data?.client_type === '0') {
        template = await loadFile('/assets/contract_without_plan_ph.docx');
      }
      if (data?.client_type === '1') {
        template = await loadFile('/assets/contract_business_without_plan_ph.docx');
      }
    } else {
      if (data?.client_type === '0') {
        template = await loadFile('/assets/contract_ph.docx');
      }
      if (data?.client_type === '1') {
        template = await loadFile('/assets/contract_business_ph.docx');
      }
    }

    const img = await loadImage(data.layout_image);

    const templateData = {
      contract_number: data.contract_number,
      contract_date: formatRussianDate(
        dayjs(data?.created_at).locale('ru').format('«D» MMMM YYYY [года]')
      ),
      contract_date2: formatRussianDate(
        dayjs(data?.created_at).locale('ru').format('«D» MMMM YYYY [г]')
      ),
      client_name:
        data?.client_type === '0'
          ? `${data?.client_surname || ''}${data?.client_name ? ` ${data?.client_name}` : ''}${
              data?.client_fathername ? ` ${data?.client_fathername}` : ''
            }`
          : data?.business_name,
      director_name: data?.business_director_name || '',
      project_name: data?.project_name,
      client_address: data?.business_address,
      client_passport: data.passport_series,
      bank_number: data?.business_bank_number,
      bank_name: data?.business_bank_name,
      mfo: data?.business_mfo,
      inn: data?.client_type === '0' ? data?.client_inn : data?.business_inn,
      pinfl: data.pinfl,
      date_of_issue: dayjs(data?.date_of_issue).format('DD.MM.YYYY'),
      given_by: data?.given_by,
      address_by_passport: data?.address_by_passport,
      phones: data?.phone_option?.map((phone) => phone?.phone_number)?.join('\n'),
      director_short_name: abbreviateName(data?.business_director_name),
      layout_image: {
        _type: 'image',
        source: img,
        format: 'image/png',

        height: 135,
      },
      price_square_meter: new Intl.NumberFormat('de-DE').format(data.price_square_meter),
      price_square_meter_text: convertNumberToWordsRu(data.price_square_meter, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      apartment_area: new Intl.NumberFormat('de-DE').format(data.apartment_area),
      total_price: new Intl.NumberFormat('de-DE').format(data?.total_price),
      total_price_text: convertNumberToWordsRu(data?.total_price, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      remain_payment: new Intl.NumberFormat('de-DE').format(
        // eslint-disable-next-line no-unsafe-optional-chaining
        data?.total_price - data?.initial_payment
      ),
      remainder_amount: new Intl.NumberFormat('de-DE').format(
        // eslint-disable-next-line no-unsafe-optional-chaining
        data?.total_price - data?.initial_payment
      ),
      // eslint-disable-next-line no-unsafe-optional-chaining
      remain_payment_text: convertNumberToWordsRu(data?.total_price - data?.initial_payment, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      // eslint-disable-next-line eqeqeq
      has_initial_payment: data?.initial_payment && data?.initial_payment != '0',
      initial_payment: new Intl.NumberFormat('de-DE').format(data?.initial_payment),
      // eslint-disable-next-line no-unsafe-optional-chaining
      initial_payment_text: convertNumberToWordsRu(data?.initial_payment, {
        showNumberParts: {
          fractional: false,
        },
        showCurrency: {
          integer: false,
        },
      }),
      months: data?.paymentday?.length,
      pays: data?.paymentday?.map((mp, idx) => ({
        num: idx + 1,
        date: moment(mp?.contract_payment_date, 'DD-MM-YYYY').format('DD.MM.YYYY г.'),
        price: new Intl.NumberFormat('de-DE').format(mp?.monthly_fee),
      })),
      room_qty_text1: convertNumberToWordsRu(data.rooms_number, {
        currency: {
          currencyNameCases: ['комнатная', 'комнатные', 'комнатных'],
          currencyNameDeclensions: {
            nominative: ['комнатная', ''],
            genitive: ['комнатная', 'комнатная'],
          },
          fractionalPartNameCases: ['', '', ''],
          fractionalPartNameDeclensions: {
            nominative: ['', ''],
            genitive: ['', ''],
            dative: ['', ''],
            accusative: ['', ''],
            instrumental: ['', ''],
            prepositional: ['', ''],
          },
          currencyNounGender: {
            integer: 2,
            fractionalPart: 1,
            fractional: 0,
          },
          fractionalPartMinLength: 2,
        },
        showNumberParts: {
          fractional: false,
        },
        convertNumberToWords: {
          fractional: true,
        },
        showCurrency: {
          fractional: false,
        },
        declension: data.rooms_number === '1' ? 'nominative' : 'genitive',
      }).replace(/\s/g, ''),
      room_qty_text2: convertNumberToWordsRu(data.rooms_number, {
        currency: {
          currencyNameCases: ['комнатную', 'комнатная', 'комнатную'],
          currencyNameDeclensions: {
            nominative: ['комнатную', ''],
            genitive: ['комнатную', 'комнатную'],
          },
          fractionalPartNameCases: ['', '', ''],
          fractionalPartNameDeclensions: {
            nominative: ['', ''],
            genitive: ['', ''],
            dative: ['', ''],
            accusative: ['', ''],
            instrumental: ['', ''],
            prepositional: ['', ''],
          },
          currencyNounGender: {
            integer: 2,
            fractionalPart: 1,
            fractional: 0,
          },
          fractionalPartMinLength: 2,
        },
        showNumberParts: {
          fractional: false,
        },
        convertNumberToWords: {
          fractional: true,
        },
        showCurrency: {
          fractional: false,
        },
        declension: data.rooms_number === '1' ? 'nominative' : 'genitive',
      }).replace(/\s/g, ''),
      floor: `${data.floor_number}`,
      entrance: `${data.entrance_name}`,
      apartment_name: data?.apartment_name,
      block_name: data?.block_name,
    };

    const handler = new TemplateHandler();
    const doc = await handler.process(template, templateData);

    // saveFile('myTemplate - output.docx', doc);
    setPreviewBlob(doc);
  };

  const onPreviewDocument = useCallback(
    async (id) => {
      const result = await axios.get(`${endpoints.contract.detail}?contract_id=${id}`);

      generateDocument(result.data);
      setContractNumber(result.data.contract_number);

      previewDocument.onTrue();
    },
    [generateDocument, previewDocument]
  );

  function formatRussianDate(dateString) {
    const months = {
      январь: 'января',
      февраль: 'февраля',
      март: 'марта',
      апрель: 'апреля',
      май: 'мая',
      июнь: 'июня',
      июль: 'июля',
      август: 'августа',
      сентябрь: 'сентября',
      октябрь: 'октября',
      ноябрь: 'ноября',
      декабрь: 'декабря',
    };

    const [day, month, year] = dateString.split(' ');
    const formattedMonth = months[month.toLowerCase()] || month.toLowerCase().replace(/ь$/, 'я');

    return `${day} ${formattedMonth} ${year} года`;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Список просроченных оплат"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Просроченных оплат' },
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

              {/* {['1', '2', '3'].includes(user?.role) && (
                <Button
                  component={RouterLink}
                  href={paths.dashboard.contracts.new('')}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Новый контракт
                </Button>
              )} */}
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          {/* <Tabs
            value={filters.status.value}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
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
                      (tab.value === '2' && 'success') ||
                      (tab.value === '1' && 'warning') ||
                      'default'
                    }
                  >
                    {(tab.value === '2' && (filters.client?.length >= 3 ? 0 : countConfirmed)) ||
                      (tab.value === '1' && (filters.client?.length >= 3 ? 0 : countProcess)) ||
                      (filters.client?.length >= 3 ? searchResults?.length : count)}
                  </Label>
                }
              />
            ))}
          </Tabs> */}

          {/* <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            contractTypeOptions={TYPES_OPTIONS}
          />

           {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={filters.client?.length >= 3 ? searchResults?.length : contracts?.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={overduedays?.length}
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size="medium" sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={overduedays?.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {overduedays.map((row) => (
                    <OverdueTableRow
                      key={row.contract_id}
                      row={row}
                      onSelectRow={() => {}}
                      onPreviewDocument={() => onPreviewDocument(row.contract_id)}
                      // onDeleteRow={(id) => onOpenDeleteModal(id)}
                      onEditRow={() => {}}
                    />
                  ))}

                  {/* <TableNoData notFound={notFound} /> */}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={Number(count)}
            page={page}
            rowsPerPage={20}
            rowsPerPageOptions={[]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(_, nextPage) => setPage(nextPage)}
            labelDisplayedRows={(paginationInfo) =>
              `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
            }
            //
            // onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
      {/* <ConfirmDialog
        open={confirm.value}
        onClose={onCloseDeleteModal}
        title="Удаление"
        content="Вы уверены что хотите удалить контракт?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      /> */}
      {previewDocument.value && (
        <ContractPreivewFullscreenDialog
          mode="readOnly"
          blob={previewBlob}
          contractNumber={contractNumber}
          open={previewDocument.value}
          handleClose={previewDocument.onFalse}
        />
      )}
      <ContractOverduesFullscreen
        open={overduesFullscreen.value}
        handleClose={overduesFullscreen.onFalse}
      />

      <ContractsExcelDialog open={exportToExcel.value} onClose={exportToExcel.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------
