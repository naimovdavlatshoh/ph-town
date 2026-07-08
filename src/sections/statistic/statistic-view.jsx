import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CUSTOM_BASE_URL } from 'src/utils/custom-base-url';

import Iconify from 'src/components/iconify';

import { StatCard } from './components';
import SalesChart from './charts/sales-chart';
import BlocksChart from './charts/blocks-chart';
import PaymentsChart from './charts/payments-chart';
import ContractsChart from './charts/contracts-chart';
import BlocksAreaChart from './charts/blocks-area-chart';
import InstallmentsChart from './charts/installments-chart';
import { fmtFull, fmtCompact, getDataWithToken } from './utils';

// ----------------------------------------------------------------------

export default function StatisticView() {
  const [contracts, setContracts] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [averagePrice, setAveragePrice] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));

  const years = useMemo(() => {
    const list = [];
    for (let y = currentYear; y >= 2022; y -= 1) list.push(String(y));
    return list;
  }, [currentYear]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/contracts?year=${year}`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/installmentstats?year=${year}`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/kassacontract?year=${year}`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/averageprice?year=${year}`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/byblock`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/byblockarea`),
    ]).then(([contractsRes, installmentsRes, kassaRes, avgRes, blockRes, areaRes]) => {
      if (!active) return;

      setContracts(
        (contractsRes || []).map((item) => ({
          ...item,
          signed_contracts: Number(item.signed_contracts),
          terminated_contracts: Number(item.terminated_contracts),
        }))
      );

      setInstallments(
        (installmentsRes || []).map((item) => ({
          ...item,
          total_paid: Number(item.total_paid),
          total_expected: Number(item.total_expected),
        }))
      );

      setPayments(
        (kassaRes || []).map((month) => {
          const map = {};
          month.payments.forEach((p) => {
            map[p.method_name] = Number(p.total_amount);
          });
          return {
            month_name: month.month_name,
            Наличка: map.Наличка || 0,
            Терминал: map.Терминал || 0,
            Клик: map.Клик || 0,
            Перечисление: map.Перечисление || 0,
          };
        })
      );

      setAveragePrice(
        (avgRes || []).map((item) => ({
          ...item,
          sales_count: Number(item.sales_count),
          average_price: Number(item.average_price),
        }))
      );

      setBlockData(
        (blockRes || []).map((item) => ({
          block_name: item.block_name,
          total_count: Number(item.total_count),
          sold_count: Number(item.sold_count),
          unsold_count: Number(item.unsold_count),
        }))
      );

      setAreaData(
        (areaRes || []).map((item) => ({
          block_name: item.block_name,
          total_area: Number(item.total_area),
          area_sold_count: Number(item.area_sold_count),
          area_unsold_count: Number(item.area_unsold_count),
        }))
      );

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [year]);

  // KPI totals
  const kpi = useMemo(() => {
    const signed = contracts.reduce((s, i) => s + (i.signed_contracts || 0), 0);
    const paid = installments.reduce((s, i) => s + (i.total_paid || 0), 0);
    const soldFlats = blockData.reduce((s, i) => s + (i.sold_count || 0), 0);
    const totalFlats = blockData.reduce((s, i) => s + (i.total_count || 0), 0);
    const soldArea = areaData.reduce((s, i) => s + (i.area_sold_count || 0), 0);
    return { signed, paid, soldFlats, totalFlats, soldArea };
  }, [contracts, installments, blockData, areaData]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4">Статистика</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Обзор продаж, платежей и контрактов
          </Typography>
        </Box>

        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          size="small"
          startAdornment={
            <Iconify
              icon="solar:calendar-bold-duotone"
              width={20}
              sx={{ mr: 1, color: 'text.disabled' }}
            />
          }
          sx={{ minWidth: 140, borderRadius: 1.5, bgcolor: 'background.paper' }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y} год
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {/* KPI row */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Подписано контрактов"
            value={loading ? '—' : fmtFull(kpi.signed)}
            subtitle={`за ${year} год`}
            icon="solar:document-text-bold-duotone"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Оплачено"
            value={loading ? '—' : `${fmtCompact(kpi.paid)} сум`}
            subtitle={`за ${year} год`}
            icon="solar:wallet-money-bold-duotone"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Продано квартир"
            value={loading ? '—' : fmtFull(kpi.soldFlats)}
            subtitle={`из ${fmtFull(kpi.totalFlats)} всего`}
            icon="solar:home-2-bold-duotone"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Продано площади"
            value={loading ? '—' : `${fmtCompact(kpi.soldArea)} м²`}
            subtitle="суммарно по блокам"
            icon="solar:ruler-cross-pen-bold-duotone"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={6}>
          <ContractsChart data={contracts} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <InstallmentsChart data={installments} loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <PaymentsChart data={payments} loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <SalesChart data={averagePrice} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BlocksChart data={blockData} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BlocksAreaChart data={areaData} loading={loading} />
        </Grid>
      </Grid>
    </Container>
  );
}
