/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { pdfjs } from 'react-pdf';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PizZipUtils from 'pizzip/utils';
// eslint-disable-next-line import/no-extraneous-dependencies

import { saveAs } from 'file-saver';
import { enqueueSnackbar } from 'notistack';

import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, Stack, Table, TableBody, ButtonBase, TableContainer } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import axios from 'src/utils/axios';

import { useGetOverduedays } from 'src/api/contract';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useAuthContext } from 'src/auth/hooks';
import OverdueTableRow from './overdue-table-row';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@/build/pdf.worker.js`;

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

const TABLE_HEAD = [
  { id: 'contract_number', label: 'Контракт' },
  { id: 'client_name', label: 'Клиент' },
  { id: 'contract_payment_date', label: 'Дата платежа' },
  { id: 'given_amount', label: 'Оплачено' },
  { id: 'monthly_fee', label: 'Ежемесячная плата' },
  { id: 'overdue_days', label: 'Просроченные дни' },
];

export default function ContractOverduesFullscreen({ open, handleClose }) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [loadingExcelFile, setLoadingExcelFile] = useState(false);
  const [html, setHtml] = useState('');
  const [comments, setComments] = useState([]);

  const [page, setPage] = useState(1);

  const { overduedaysLoading, overduedays, overduedaysEmpty, count } = useGetOverduedays(page);
  const [visibleAppBar, setVisibleAppBar] = useState(true);
  const [marginTop, setMarginTop] = useState(50);

  const notFound = overduedaysEmpty;

  const table = useTable();

  const onClose = () => {
    if (!overduedaysLoading) {
      handleClose();
    }
  };

  const onExportFile = async () => {
    setLoadingExcelFile(true);
    try {
      const url = '/api/v1/overduedays/excel';

      const result = await axios.get(url);

      if (!result?.data?.download_link) {
        enqueueSnackbar('Ссылка для скачивания не найдена', {
          variant: 'error',
        });
        return;
      }

      saveAs(result?.data?.download_link, `Экспорт-файл.xlsx`);
      enqueueSnackbar('Файл успешно загружен!', {
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingExcelFile(false);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar
        sx={{
          background: '#fff',
          boxShadow: '0px 4px 10px 0px rgba(34, 60, 80, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <Iconify icon="material-symbols:close" />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="overline" component="div">
            Список просроченных оплат
          </Typography>
          <Stack direction="row" gap={1}>
            {['1', '2'].includes(user?.role) && (
              <Stack
                onClick={onExportFile}
                component={ButtonBase}
                loading={loadingExcelFile}
                alignItems="center"
                width={100}
                height={40}
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

            <LoadingButton autoFocus color="inherit" onClick={handleClose}>
              Закрыть
            </LoadingButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <TableContainer sx={{ position: 'relative', overflow: 'hidden' }}>
        <Scrollbar>
          <Table size="small" sx={{ minWidth: 360, mt: 10 }} stickyHeader aria-label="sticky table">
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={overduedays?.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
            />

            <TableBody>
              {overduedays?.map((row) => (
                <OverdueTableRow
                  key={row.id}
                  row={row}
                  onSelectRow={() => {}}
                  onPreviewDocument={() => {}}
                  onDeleteRow={() => {}}
                  onEditRow={() => {}}
                />
              ))}

              <TableNoData notFound={notFound} />
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
    </Dialog>
  );
}

function saveFile(filename, blob) {
  // see: https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link

  // get downloadable url from the blob

  // Предполагается, что у вас есть объект blob, содержащий данные ZIP-архива

  const blobUrl = URL.createObjectURL(blob);

  // create temp link element
  let link = document.createElement('a');
  link.download = filename;
  link.href = blobUrl;

  // use the link to invoke a download
  document.body.appendChild(link);
  link.click();

  // remove the link
  setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    link = null;
  }, 0);
}

ContractOverduesFullscreen.propTypes = {
  open: PropTypes.bool.isRequired,

  handleClose: PropTypes.func.isRequired,
};
