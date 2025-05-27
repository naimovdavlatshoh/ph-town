import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Dummy paths va CustomBreadcrumbs
const paths = {
  dashboard: {
    root: '/',
  },
};

function CustomBreadcrumbs({ heading }) {
  return (
    <div>
      <h2>{heading}</h2>
    </div>
  );
}

CustomBreadcrumbs.propTypes = {
  heading: PropTypes.string.isRequired,
};

function useSettingsContext() {
  return {
    themeStretch: false,
  };
}

export default function StatisticView() {
  const navigate = useNavigate();
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]); // 🔵 YANGI STATE
  const [blockData, setBlockData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [year, setYear] = useState('2024');

  const handleChange = (event) => {
    setYear(event.target.value);
  };

  const settings = useSettingsContext();

  async function getDataWithToken(url) {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Token topilmadi');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Xatolik: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Xatolik:', error);
      return null;
    }
  }

  useEffect(() => {
    getDataWithToken(`https://testapi.ph.town/api/v1/dashboard/contracts?year=${year}`).then(
      (data) => {
        if (!data) return;
        const formattedData = data.map((item) => ({
          ...item,
          signed_contracts: Number(item.signed_contracts),
          terminated_contracts: Number(item.terminated_contracts),
        }));
        setData1(formattedData);
      }
    );

    getDataWithToken(`https://testapi.ph.town/api/v1/dashboard/kassarasxod?year=${year}`).then(
      (data) => {
        if (!data) return;
        setData2(data);
      }
    );

    getDataWithToken('https://testapi.ph.town/api/v1/dashboard/byblock').then((data) => {
      if (!data) return;
      const formattedBlocks = data.map((item) => ({
        block_name: item.block_name,
        total_count: Number(item.total_count),
        sold_count: Number(item.sold_count),
        unsold_count: Number(item.unsold_count),
      }));
      setBlockData(formattedBlocks);
    });

    getDataWithToken('https://testapi.ph.town/api/v1/dashboard/byblockarea').then((data) => {
      if (!data) return;
      const formattedAreaData = data.map((item) => ({
        block_name: item.block_name,
        total_area: Number(item.total_area),
        area_sold_count: Number(item.area_sold_count),
        area_unsold_count: Number(item.area_unsold_count),
      }));
      setAreaData(formattedAreaData);
    });

    // 🔵 YANGI API CHAQIRUV VA FORMATLASH
    getDataWithToken(`https://testapi.ph.town/api/v1/dashboard/kassacontract?year=${year}`).then(
      (data) => {
        if (!data) return;
        const formatted = data.map((month) => {
          const paymentMap = {};
          month.payments.forEach((p) => {
            paymentMap[p.method_name] = p.total_amount;
          });

          return {
            month_name: month.month_name,
            Наличка: paymentMap['Наличка'] || 0,
            Терминал: paymentMap['Терминал'] || 0,
            Клик: paymentMap['Клик'] || 0,
            Перечисление: paymentMap['Перечисление'] || 0,
          };
        });
        setData3(formatted);
      }
    );
  }, [year]);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lx'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <CustomBreadcrumbs heading="Статистика" />
        <Select
          displayEmpty
          value={year}
          onChange={handleChange}
          size="small"
          sx={{ minWidth: 120 }}
          renderValue={(selected) => {
            if (selected === '') {
              return <em>Выберите год</em>;
            }
            return selected;
          }}
        >
          <MenuItem value="" disabled>
            Выберите год
          </MenuItem>
          <MenuItem value={2022}>2022</MenuItem>
          <MenuItem value={2023}>2023</MenuItem>
          <MenuItem value={2024}>2024</MenuItem>
          <MenuItem value={2025}>2025</MenuItem>
        </Select>
      </Container>

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          padding: '10px 24px',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        {/* Diagramma 1 */}
        <div style={chartBoxStyle}>
          <h4>Сколько проданных и удаленных контрактов по месяцам</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data1} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="signed_contracts" fill="#82ca9d" name="Проданных" />
              <Bar dataKey="terminated_contracts" fill="#ff7f7f" name="Удаленных" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagramma 2 */}
        <div style={chartBoxStyle}>
          <h4>Сумма приходов и платежей по месяцам</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data2} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_arrival_amount" stackId="a" fill="#4caf50" name="Приход" />
              <Bar dataKey="total_payment_amount" stackId="a" fill="#f44336" name="Платеж" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagramma 3 */}
        <div style={fullChartBoxStyle}>
          <h4>Проданные и непроданные квартиры по блокам</h4>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={blockData} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="block_name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sold_count" fill="#0088FE" name="Продано" />
              <Bar dataKey="unsold_count" fill="#FFBB28" name="Не продано" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagramma 4 */}
        <div style={fullChartBoxStyle}>
          <h4>Общая площадь, проданная и непроданная по блокам</h4>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={areaData} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="block_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_area" fill="#8884d8" name="Общая площадь" />
              <Bar dataKey="area_sold_count" fill="#82ca9d" name="Проданная площадь" />
              <Bar dataKey="area_unsold_count" fill="#ff7f7f" name="Непроданная площадь" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Diagramma 5 - To'lov turlari bo'yicha */}
        <div style={fullChartBoxStyle}>
          <h4>Сумма оплат по методам за каждый месяц</h4>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={data3} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Наличка" stackId="a" fill="#4caf50" />
              <Bar dataKey="Терминал" stackId="a" fill="#2196f3" />
              <Bar dataKey="Клик" stackId="a" fill="#ff9800" />
              <Bar dataKey="Перечисление" stackId="a" fill="#9c27b0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

const chartBoxStyle = {
  width: '49%',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  padding: '10px',
  borderRadius: '10px',
};

const fullChartBoxStyle = {
  width: '100%',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  padding: '10px',
  borderRadius: '10px',
  marginTop: '20px',
};
