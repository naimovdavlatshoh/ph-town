// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TemplateHandler } from 'easy-template-x';
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
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
import { useGetContracts, useGetOverduedays, useSearchClientsFromContract } from 'src/api/contract';

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

import ContractTableRow from '../contract-table-row';
import UserTableToolbar from '../user-table-toolbar';
import ContractsExcelDialog from '../contracts-export-dialog';
import ContractOverduesFullscreen from '../contract-overdues-fullscreen';
import ContractPreivewFullscreenDialog from '../contract-preview-fullscreen-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'contract_number', label: 'Контракт' },
  { id: 'client_name', label: 'Клиент' },
  { id: 'contract_status', label: 'Состояние' },
  { id: 'contract_type', label: 'Тип' },
  { id: 'contract_payment_status', label: 'Оплата' },
  { id: 'comments', label: 'Комментарий' },
  { id: 'created_at', label: 'Создано' },
  { id: '', width: 88 },
];

const defaultFilters = {
  client: '',
  contractType: '', // '' | '0' наличка | '1' рассрочка
  contractStatus: '', // '' | '1' в процессе | '2' подписан
  contractPaymentStatus: '', // '' | '1' не оплачен | '2' частично | '3' полностью
  isBarter: '', // '' | '0' нет | '1' да
  isTerminated: '', // '' | '0' действующие | '1' расторгнутые
  contractCashType: '', // '' | '0' USD | '1' SUM
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
  // Split the full name into separate words
  const words = fullName?.split(' ');

  // Get the first letter of each word
  const abbreviated = words?.map((word) => `${word[0]?.toUpperCase()}.`);

  // Join the abbreviated letters and add a dot at the end
  return abbreviated?.join(' ');
}

export default function ContractListView() {
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

  const onOpenDeleteModal = (id, type = 'delete') => {
    setSelectedId(id);
    setDialogType(type);
    confirm.onTrue();
  };

  const convertNumberToUzText = (number) => {
    const ones = ['', 'бир', 'икки', 'уч', 'тўрт', 'беш', 'олти', 'етти', 'саккиз', 'тўққиз'];
    const tens = [
      '',
      'ўн',
      'йигирма',
      'ўттиз',
      'қирқ',
      'эллик',
      'олтмиш',
      'етмиш',
      'саксон',
      'тўқсон',
    ];
    const hundreds = [
      '',
      'бир юз',
      'икки юз',
      'уч юз',
      'тўрт юз',
      'беш юз',
      'олти юз',
      'етти юз',
      'саккиз юз',
      'тўққиз юз',
    ];

    if (number === 0) return 'нол';
    if (number < 0) return `манфий ${convertNumberToUzText(-number)}`;

    const parts = [];

    const scales = [
      { value: 1e9, name: 'миллиард' },
      { value: 1e6, name: 'миллион' },
      { value: 1e3, name: 'минг' },
      { value: 1, name: '' },
    ];

    scales.forEach((scale) => {
      const chunk = Math.floor(number / scale.value);
      number %= scale.value;

      if (chunk !== 0) {
        const h = Math.floor(chunk / 100);
        const remainder = chunk % 100;
        const d = Math.floor(remainder / 10);
        const o = remainder % 10;

        const chunkParts = [];

        // Yuzliklar
        if (h) chunkParts.push(hundreds[h]);

        // O'nliklar va birliklar
        if (remainder >= 10 && remainder <= 19) {
          // 10-19 oralig'i uchun maxsus holat
          const teenWords = [
            'ўн',
            'ўн бир',
            'ўн икки',
            'ўн уч',
            'ўн тўрт',
            'ўн беш',
            'ўн олти',
            'ўн етти',
            'ўн саккиз',
            'ўн тўққиз',
          ];
          chunkParts.push(teenWords[remainder - 10]);
        } else {
          // 20 va undan yuqori
          if (d >= 2) {
            chunkParts.push(tens[d]);
          }
          if (o) {
            chunkParts.push(ones[o]);
          }
        }

        // Scale name qo'shish
        if (scale.name) {
          // "минг" uchun maxsus holat - agar chunk 1 bo'lsa "бир"ni chiqarib tashlaymiz
          if (scale.name === 'минг' && chunk === 1) {
            parts.push('минг');
          } else {
            chunkParts.push(scale.name);
            parts.push(chunkParts.join(' '));
          }
        } else {
          // Bu oxirgi qism (birliklar)
          parts.push(chunkParts.join(' '));
        }
      }
    });

    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  const onCloseDeleteModal = () => {
    setSelectedId(null);
    setDialogType(null);
    confirm.onFalse();
  };

  const [tableData, setTableData] = useState(_userList);
  const [previewBlob, setPreviewBlob] = useState();
  const [contractNumber, setContractNumber] = useState();

  const [filters, setFilters] = useState(defaultFilters);

  const { user } = useAuthContext();

  const { contracts, count, contractsLoading, contractsEmpty, remove, terminate } = useGetContracts({
    page: page + 1,
    contractStatus: filters.contractStatus,
    contractType: filters.contractType,
    contractPaymentStatus: filters.contractPaymentStatus,
    isBarter: filters.isBarter,
    isTerminated: filters.isTerminated,
    contractCashType: filters.contractCashType,
  });

  const { overduedays } = useGetOverduedays();

  const debounceClient = useDebounce(filters.client, 3);
  const { searchResults, searchResultsLoading } = useSearchClientsFromContract(debounceClient);
  const [dialogType, setDialogType] = useState(null); // 'delete' | 'terminate' | null

  useEffect(() => {
    setTableData(contracts);
  }, [contracts]);

  useEffect(() => {
    if (pageNum) {
      setPage(+pageNum);
    }
  }, [pageNum]);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = contractsEmpty;

  const onDelete = () => {
    remove(selectedId, () => {
      enqueueSnackbar('Контракт удален успешно!');
      onCloseDeleteModal();
    });
  };
  const onTerminate = () => {
    terminate(selectedId, () => {
      enqueueSnackbar('Контракт расторгнут успешно!');
      onCloseDeleteModal();
    });
  };

  const handleFilters = useCallback(
    (name, value) => {
      // При смене любого фильтра сбрасываем страницу на 1 и синхронизируем URL.
      setPage(0);
      navigate(paths.dashboard.contracts.root);
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [navigate]
  );

  const handleResetFilters = useCallback(() => {
    setPage(0);
    navigate(paths.dashboard.contracts.root);
    setFilters(defaultFilters);
  }, [navigate]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.contracts.edit(id));
    },
    [router]
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
      // total_price_text: convertNumberToWordsRu(data?.total_price, {
      //   showNumberParts: {
      //     fractional: false,
      //   },
      //   showCurrency: {
      //     integer: false,
      //   },
      // }),
      total_price_text: convertNumberToUzText(data?.total_price),
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
          heading="Список контрактов"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Контракты' }]}
          action={
            <Stack direction="row" gap={1}>
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

              {/* <Button
                color="error"
                variant="contained"
                onClick={overduesFullscreen.onTrue}
                startIcon={<Iconify icon="tabler:calendar-time" />}
              >
                Список просроченных оплат
              </Button> */}
              {['1', '2', '3'].includes(user?.role) && (
                <Button
                  component={RouterLink}
                  href={paths.dashboard.contracts.new('')}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Новый контракт
                </Button>
              )}
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <UserTableToolbar filters={filters} onFilters={handleFilters} />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2.5, pb: 2.5 }}
          >
            <Box sx={{ typography: 'body2' }}>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Найдено:{' '}
              </Box>
              <strong>{filters.client?.length >= 3 ? searchResults?.length : count}</strong>
            </Box>

            {canReset && (
              <Button
                color="error"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Очистить
              </Button>
            )}
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={contracts?.length}
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
                  rowCount={filters.client?.length >= 3 ? searchResults?.length : contracts?.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {(filters.client?.length >= 3 ? searchResults : contracts).map((row) => (
                    <ContractTableRow
                      key={row.contract_id}
                      row={row}
                      onSelectRow={() => {}}
                      onPreviewDocument={() => onPreviewDocument(row.contract_id)}
                      onDeleteRow={(id) => onOpenDeleteModal(id, 'delete')}
                      onTerminateRow={(id) => onOpenDeleteModal(id, 'terminate')}
                      onEditRow={() => {}}
                    />
                  ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={Number(filters.client?.length >= 3 ? searchResults?.length : count)}
            page={page}
            rowsPerPage={30}
            rowsPerPageOptions={[]}
            onPageChange={(_, nextPage) => navigate(`/dashboard/contracts/${nextPage}`)}
            onRowsPerPageChange={(_, nextPage) => setPage(nextPage)}
            labelDisplayedRows={(paginationInfo) =>
              `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
            }
            //
            // onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
      {dialogType === 'delete' && (
        <ConfirmDialog
          open={confirm.value}
          onClose={onCloseDeleteModal}
          title="Удаление контракта"
          content="Вы уверены, что хотите удалить контракт?"
          action={
            <Button variant="contained" color="error" onClick={onDelete}>
              Удалить
            </Button>
          }
        />
      )}

      {dialogType === 'terminate' && (
        <ConfirmDialog
          open={confirm.value}
          onClose={onCloseDeleteModal}
          title="Расторжение контракта"
          content="Вы уверены, что хотите расторгнуть этот контракт?"
          action={
            <Button variant="contained" color="error" onClick={onTerminate}>
              Расторгнуть
            </Button>
          }
        />
      )}

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
