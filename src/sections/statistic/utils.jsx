import React from 'react';

// ----------------------------------------------------------------------
// Number formatting (ru-RU)

export const fmtFull = (num) =>
  Number(num ?? 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 });

export const fmtCompact = (num) =>
  new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(
    Number(num ?? 0)
  );

// ----------------------------------------------------------------------
// Authorized fetch

export async function getDataWithToken(url) {
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
    return await response.json();
  } catch (error) {
    console.error('Xatolik:', error);
    return null;
  }
}

// ----------------------------------------------------------------------
// A vertical bar gradient. Must be placed inside a raw recharts <defs>
// (a custom wrapper component is not rendered by recharts).

export const barGradient = (id, color) => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={0.95} />
    <stop offset="100%" stopColor={color} stopOpacity={0.35} />
  </linearGradient>
);
