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
import DebtorsWidget from './charts/debtors-widget';
import ContractsChart from './charts/contracts-chart';
import BlocksAreaChart from './charts/blocks-area-chart';
import InstallmentsChart from './charts/installments-chart';
import { fmtFull, fmtCompact, getDataWithToken } from './utils';
import CollectionRateChart from './charts/collection-rate-chart';
import RemainingValueChart from './charts/remaining-value-chart';

// ----------------------------------------------------------------------

export default function StatisticView() {
  const [contracts, setContracts] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [averagePrice, setAveragePrice] = useState([]);
  const [debtors, setDebtors] = useState(null);
  const [collection, setCollection] = useState(null);
  const [remainingValue, setRemainingValue] = useState([]);
  const [explanations, setExplanations] = useState({});
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
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/debtors`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/collectionrate?year=${year}`),
      getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/remainingvalue`),
    ]).then(([contractsRes, installmentsRes, kassaRes, avgRes, blockRes, areaRes, debtorsRes, collectionRes, remainingRes]) => {
      if (!active) return;

      setExplanations({
        contracts: contractsRes?.explanation,
        installments: installmentsRes?.explanation,
        payments: kassaRes?.explanation,
        averagePrice: avgRes?.explanation,
        blocks: blockRes?.explanation,
        area: areaRes?.explanation,
        debtors: debtorsRes?.explanation,
        collection: collectionRes?.explanation,
        remaining: remainingRes?.explanation,
      });

      setContracts(
        (contractsRes?.data || []).map((item) => ({
          ...item,
          signed_contracts: Number(item.signed_contracts),
          terminated_contracts: Number(item.terminated_contracts),
        }))
      );

      setInstallments(
        (installmentsRes?.data || []).map((item) => ({
          ...item,
          total_paid: Number(item.total_paid),
          total_expected: Number(item.total_expected),
        }))
      );

      setPayments(
        (kassaRes?.data || []).map((month) => {
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
        (avgRes?.data || []).map((item) => ({
          ...item,
          sales_count: Number(item.sales_count),
          average_price: Number(item.average_price),
        }))
      );

      setBlockData(
        (blockRes?.data || []).map((item) => ({
          block_name: item.block_name,
          total_count: Number(item.total_count),
          sold_count: Number(item.sold_count),
          unsold_count: Number(item.unsold_count),
        }))
      );

      setAreaData(
        (areaRes?.data || []).map((item) => ({
          block_name: item.block_name,
          total_area: Number(item.total_area),
          area_sold_count: Number(item.area_sold_count),
          area_unsold_count: Number(item.area_unsold_count),
        }))
      );

      setDebtors(
        debtorsRes?.data
          ? {
              total_overdue_amount: Number(debtorsRes.data.total_overdue_amount),
              overdue_installments_count: Number(debtorsRes.data.overdue_installments_count),
              debtors_count: Number(debtorsRes.data.debtors_count),
              buckets: (debtorsRes.data.buckets || []).map((b) => ({
                bucket: b.bucket,
                label: b.label,
                overdue_amount: Number(b.overdue_amount),
                overdue_installments_count: Number(b.overdue_installments_count),
                debtors_count: Number(b.debtors_count),
              })),
            }
          : null
      );

      setCollection(
        collectionRes?.data
          ? {
              year: collectionRes.data.year,
              total_expected: Number(collectionRes.data.total_expected),
              total_paid: Number(collectionRes.data.total_paid),
              collection_rate: Number(collectionRes.data.collection_rate),
              months: (collectionRes.data.months || []).map((m) => ({
                month_name: m.month_name,
                total_expected: Number(m.total_expected),
                total_paid: Number(m.total_paid),
                cumulative_rate: Number(m.cumulative_rate),
              })),
            }
          : null
      );

      setRemainingValue(
        (remainingRes?.data || []).map((item) => ({
          block_name: item.block_name,
          remaining_count: Number(item.remaining_count),
          remaining_area: Number(item.remaining_area),
          remaining_value: Number(item.remaining_value),
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
          <ContractsChart data={contracts} loading={loading} explanation={explanations.contracts} />
        </Grid>
        <Grid item xs={12} md={6}>
          <InstallmentsChart data={installments} loading={loading} explanation={explanations.installments} />
        </Grid>
        <Grid item xs={12}>
          <PaymentsChart data={payments} loading={loading} explanation={explanations.payments} />
        </Grid>
        <Grid item xs={12}>
          <SalesChart data={averagePrice} loading={loading} explanation={explanations.averagePrice} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BlocksChart data={blockData} loading={loading} explanation={explanations.blocks} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BlocksAreaChart data={areaData} loading={loading} explanation={explanations.area} />
        </Grid>
        <Grid item xs={12}>
          <CollectionRateChart data={collection} loading={loading} explanation={explanations.collection} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DebtorsWidget data={debtors} loading={loading} explanation={explanations.debtors} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RemainingValueChart data={remainingValue} loading={loading} explanation={explanations.remaining} />
        </Grid>
      </Grid>
    </Container>
  );
}
