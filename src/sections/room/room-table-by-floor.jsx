import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { IconButton } from 'yet-another-react-lightbox';
import { memo, useState, useEffect, useCallback } from 'react';

import { Table, Button, Tooltip, TableBody, TableContainer } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGetApartments } from 'src/api/apartment';
import { applyFilter } from 'src/layouts/common/searchbar/utils';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableSelectedAction,
} from 'src/components/table';

import RoomTableRow from './room-table-row';
import RoomNewEditForm from './room-new-edit-form';
import RoomTableHeadCustom from './room-table-head-custom';

const TABLE_HEAD = [
  { id: 'roomNum', label: 'Номер помещения', width: 100 },
  { id: 'roomQty', label: 'Комнат', width: 40 },
  { id: 'area', label: 'Цена за м2', width: 100 },
  {
    id: 'price',
    label: 'Полная цена ($)',
    width: 100,
  },
  {
    id: 'price_sum',
    label: 'Полная цена (сум)',
    width: 100,
  },
  { id: 'status', label: 'Статус', width: 40 },
  { id: 'options', label: 'Опции', width: 88 },
];

const TABLE_HEAD_OPERATOR = [
  { id: 'roomNum', label: 'Номер помещения', width: 100 },
  { id: 'roomQty', label: 'Комнат', width: 40 },

  {
    id: 'price_sum',
    label: 'Полная цена (сум)',
    width: 100,
  },
  { id: 'status', label: 'Статус', width: 40 },
  { id: 'options', label: 'Опции', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

function RoomTableByFloor({ floorId, projectId }) {
  const { user } = useAuthContext();
  const { apartments, update, remove } = useGetApartments(floorId);

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    setTableData(apartments);
  }, [apartments]);
  const { enqueueSnackbar } = useSnackbar();

  const [selectedRow, setSelectedRow] = useState();

  const confirm = useBoolean();
  const editRoom = useBoolean();
  const confirmDelete = useBoolean();

  const router = useRouter();

  const table = useTable();

  const dataFiltered = applyFilter({
    inputData: apartments,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleConfirmDeleteRow = useCallback(
    (row) => {
      setSelectedRow(row);
      confirmDelete.onTrue();
      // const deleteRow = tableData.filter((row) => row.id !== id);
    },
    [confirmDelete]
  );
  const handleEditRow = (row) => {
    setSelectedRow(row);
    editRoom.onTrue();
  };
  const onDelete = () => {
    remove(selectedRow?.apartment_id, () => {
      enqueueSnackbar('Помещение удалено успешно!');
      confirmDelete.onFalse();
    });
  };

  return (
    <>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={dataFiltered.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              dataFiltered.map((row) => row.id)
            )
          }
          action={
            <Tooltip title="Delete">
              <IconButton color="primary" onClick={confirm.onTrue}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
        />

        <Scrollbar>
          <Table size="small" sx={{ minWidth: 960 }}>
            <RoomTableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={['1', '2'].includes(user?.role) ? TABLE_HEAD : TABLE_HEAD_OPERATOR}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {apartments.map((apartment) => (
                <RoomTableRow
                  key={apartment.id}
                  row={apartment}
                  onEditRow={handleEditRow}
                  handleDeleteConfirm={handleConfirmDeleteRow}
                />
              ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />

              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {selectedRow && (
        <RoomNewEditForm
          projectId={projectId}
          currentRoom={selectedRow}
          floorId={floorId}
          open={editRoom.value}
          onClose={() => {
            editRoom.onFalse();
            setSelectedRow(null);
          }}
          onUpdate={update}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Удаление"
        content="Вы уверены, что хотите удалить помещение?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Удалить
          </Button>
        }
      />
    </>
  );
}

RoomTableByFloor.propTypes = {
  floorId: PropTypes.string,
  projectId: PropTypes.string,
};

export default memo(RoomTableByFloor);
