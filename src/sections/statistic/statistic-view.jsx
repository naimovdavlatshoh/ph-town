import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';

import { CUSTOM_BASE_URL } from 'src/utils/custom-base-url';

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
  const [averagePriceData, setAveragePriceData] = useState([]); // 🔵 YANGI STATE - Average Price
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

  // Number formatting function
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 0;
    return Number(num).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  useEffect(() => {
    // console.log('Fetching data for year:', year);

    getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/contracts?year=${year}`).then((data) => {
      if (!data) {
        console.log('No data received for contracts');
        return;
      }

      const formattedData = data.map((item) => ({
        ...item,
        signed_contracts: Number(item.signed_contracts),
        terminated_contracts: Number(item.terminated_contracts),
      }));
      setData1(formattedData);
    });

    getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/installmentstats?year=${year}`).then(
      (data) => {
        if (!data) {
          console.log('No data received for installment stats');
          return;
        }
        const formattedData = data.map((item) => ({
          ...item,
          total_paid: Number(item.total_paid),
          total_expected: Number(item.total_expected),
        }));
        setData2(formattedData);
      }
    );

    getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/byblock`).then((data) => {
      if (!data) return;
      const formattedBlocks = data.map((item) => ({
        block_name: item.block_name,
        total_count: Number(item.total_count),
        sold_count: Number(item.sold_count),
        unsold_count: Number(item.unsold_count),
      }));
      setBlockData(formattedBlocks);
    });

    getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/byblockarea`).then((data) => {
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
    getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/kassacontract?year=${year}`).then(
      (data) => {
        if (!data) {
          console.log('No data received for kassa contract');
          return;
        }
        console.log('Kassa contract data for year', year, ':', data);
        const formatted = data.map((month) => {
          const paymentMap = {};
          month.payments.forEach((p) => {
            paymentMap[p.method_name] = Number(p.total_amount);
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

    // 🔵 YANGI API CHAQIRUV - Average Price
    getDataWithToken(`${CUSTOM_BASE_URL}/api/v1/dashboard/averageprice?year=${year}`).then(
      (data) => {
        if (!data) {
          console.log('No data received for average price');
          return;
        }
        console.log('Average price data for year', year, ':', data);
        const formattedData = data.map((item) => ({
          ...item,
          sales_count: Number(item.sales_count),
          total_sales_amount: Number(item.total_sales_amount),
          total_sold_area: Number(item.total_sold_area),
          average_price: Number(item.average_price),
        }));
        setAveragePriceData(formattedData);
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
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Месяц ${label}`}
              />
              <Legend />
              <Bar dataKey="signed_contracts" fill="#82ca9d" name="Проданных" />
              <Bar dataKey="terminated_contracts" fill="#ff7f7f" name="Удаленных" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagramma 2 */}
        <div style={chartBoxStyle}>
          <h4>Сводка плана платежей и оплат по месяцам.</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data2} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Месяц : ${label}`}
              />
              <Legend />
              <Bar dataKey="total_paid" stackId="a" fill="#4caf50" name="Всего оплачено" />
              <Bar dataKey="total_expected" stackId="a" fill="#f44336" name=" Всего ожидается" />
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
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Блок ${label}`}
              />
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
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Блок ${label}`}
              />
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
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Месяц ${label}`}
              />
              <Legend />
              <Bar dataKey="Наличка" stackId="a" fill="#4caf50" />
              <Bar dataKey="Терминал" stackId="a" fill="#2196f3" />
              <Bar dataKey="Клик" stackId="a" fill="#ff9800" />
              <Bar dataKey="Перечисление" stackId="a" fill="#9c27b0" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Diagramma 6 - Sales Statistics */}
        <div style={fullChartBoxStyle}>
          <h4>Статистика продаж по месяцам</h4>
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={averagePriceData} margin={{ top: 20, right: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value) => formatNumber(value)}
                labelFormatter={(label) => `Месяц ${label}`}
                contentStyle={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="sales_count" fill="#e91e63" name="Количество продаж" />
              <Bar yAxisId="right" dataKey="total_sales_amount" fill="#00bcd4" name="Общая сумма" />
              <Bar
                yAxisId="left"
                dataKey="total_sold_area"
                fill="#ffc107"
                name="Общая квадратура"
              />
              <Bar yAxisId="right" dataKey="average_price" fill="#9c27b0" name="Средняя цена" />
            </ComposedChart>
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
