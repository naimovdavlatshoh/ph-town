/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { pdfjs } from 'react-pdf';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import PizZipUtils from 'pizzip/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useState, useCallback } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies

import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Stack, Table, Button, TableBody, TableContainer } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetContragentCategories } from 'src/api/contragents';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import CategoryNewForm from './category-new-form';
import ContragentCategoryTableRow from './category-table-row';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@/build/pdf.worker.js`;

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

const TABLE_HEAD = [
  { id: 'category_name', label: 'Контракт' },
  { id: 'create_at', label: 'Создана' },
  { id: 'options', label: 'Редактировать', width: 50, align: 'center' },
];

export default function ContragentCategoriesFullscreen({ open, handleClose }) {
  const [selectedRow, setSelectedRow] = useState();
  const router = useRouter();
  const [html, setHtml] = useState('');
  const [comments, setComments] = useState([]);

  const [page, setPage] = useState(0);

  const newCategory = useBoolean();
  const editCategory = useBoolean();

  const onOpenEditForm = useCallback(
    (row) => {
      setSelectedRow(row);
      editCategory.onTrue();
    },
    [editCategory]
  );

  const onCloseEditForm = useCallback(() => {
    setSelectedRow(null);
    editCategory.onFalse();
  }, [editCategory]);

  const { categoriesLoading, categories, categoriesEmpty, count, create, update } =
    useGetContragentCategories();

  const [visibleAppBar, setVisibleAppBar] = useState(true);
  const [marginTop, setMarginTop] = useState(50);

  const notFound = categoriesEmpty;

  const table = useTable();

  const onClose = () => {
    if (!categoriesLoading) {
      handleClose();
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
            Список категорий
          </Typography>

          <Stack direction="row" gap={1}>
            <Button type="submit" variant="contained" onClick={newCategory.onTrue}>
              Создать
            </Button>
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
              rowCount={categories?.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
            />

            <TableBody>
              {categories?.map((row) => (
                <ContragentCategoryTableRow
                  key={row.id}
                  row={row}
                  onSelectRow={() => {}}
                  onPreviewDocument={() => {}}
                  onDeleteRow={() => {}}
                  onEditRow={onOpenEditForm}
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
        rowsPerPage={10}
        rowsPerPageOptions={[]}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={(_, nextPage) => setPage(nextPage)}
        labelDisplayedRows={(paginationInfo) =>
          `${paginationInfo.from}-${paginationInfo.to} из ${paginationInfo.count}`
        }
        //
        // onChangeDense={table.onChangeDense}
      />
      <CategoryNewForm open={newCategory.value} onClose={newCategory.onFalse} onCreate={create} />
      {selectedRow && (
        <CategoryNewForm
          open={editCategory.value}
          onClose={onCloseEditForm}
          onUpdate={update}
          currentCategory={selectedRow}
        />
      )}
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

ContragentCategoriesFullscreen.propTypes = {
  open: PropTypes.bool.isRequired,

  handleClose: PropTypes.func.isRequired,
};
