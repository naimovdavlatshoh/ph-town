import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { useGetBarterOne } from 'src/api/barterone';
import { useGetBarterTwo } from 'src/api/bartertwo';

import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import BarterOneTableRow from '../barterone-table-row';
import BarterTwoTableRow from '../bartertwo-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD_ONE = [
  { id: 'contract_number', label: 'Контракт' },
  { id: 'client', label: 'Клиент' },
  { id: 'barter_object_name', label: 'Тип бартера' },
  { id: 'barter_comments', label: 'Комментарий' },
  { id: 'appraised_value', label: 'Сумма оценки', align: 'right' },
  { id: 'resale_value', label: 'Сумма продажи', align: 'right' },
  { id: 'resale_date', label: 'Дата продажи' },
  { id: 'profit_amount', label: 'Разница', align: 'right' },
  { id: 'profit_status', label: 'Статус' },
  { id: 'created_at', label: 'Создано' },
  { id: 'actions', label: '', align: 'right' },
];

const TABLE_HEAD_TWO = [
  { id: 'contract_number', label: 'Контракт' },
  { id: 'client', label: 'Клиент' },
  { id: 'supplier_name', label: 'Поставщик' },
  { id: 'percent_apartment', label: '% Квартиры' },
  { id: 'percent_supplier', label: '% Поставщика' },
  { id: 'barter_comments', label: 'Комментарий' },
  { id: 'created_at', label: 'Создано' },
  { id: 'actions', label: '', align: 'right' },
];

// ----------------------------------------------------------------------

export default function BarterListView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [pageOne, setPageOne] = useState(0);
  const [pageTwo, setPageTwo] = useState(0);

  const { barterones, count: countOne, barteroneEmpty, addResale } = useGetBarterOne(pageOne + 1);
  const { bartertwos, count: countTwo, bartertwoEmpty } = useGetBarterTwo(pageTwo + 1);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lx'}>
      <CustomBreadcrumbs
        heading="Контракты - Бартер"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Контракты - Бартер' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            px: 2.5,
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 600,
              fontSize: 14,
            },
          }}
        >
          <Tab label="Бартер 1" />
          <Tab label="Бартер 2" />
        </Tabs>

        {/* ── Бартер 1 ── */}
        {activeTab === 0 && (
          <>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD_ONE} />
                  <TableBody>
                    {barterones.map((row) => (
                      <BarterOneTableRow
                        key={row.barter_id}
                        row={row}
                        onAddResale={addResale}
                      />
                    ))}
                    <TableNoData notFound={barteroneEmpty} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={Number(countOne)}
              page={pageOne}
              rowsPerPage={30}
              rowsPerPageOptions={[]}
              onPageChange={(_, next) => setPageOne(next)}
              labelDisplayedRows={(i) => `${i.from}-${i.to} из ${i.count}`}
            />
          </>
        )}

        {/* ── Бартер 2 ── */}
        {activeTab === 1 && (
          <>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size="small" sx={{ minWidth: 860 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD_TWO} />
                  <TableBody>
                    {bartertwos.map((row) => (
                      <BarterTwoTableRow key={row.barter_id} row={row} />
                    ))}
                    <TableNoData notFound={bartertwoEmpty} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={Number(countTwo)}
              page={pageTwo}
              rowsPerPage={30}
              rowsPerPageOptions={[]}
              onPageChange={(_, next) => setPageTwo(next)}
              labelDisplayedRows={(i) => `${i.from}-${i.to} из ${i.count}`}
            />
          </>
        )}
      </Card>
    </Container>
  );
}
