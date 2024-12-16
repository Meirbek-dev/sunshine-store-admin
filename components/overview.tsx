'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { memo } from 'react';

interface DataPoint {
  name: string;
  total: number;
}

interface OverviewProperties {
  data: DataPoint[];
}

const formatCurrency = (value: number) => `${value.toLocaleString()} тг.`;

export const Overview = memo(({ data }: OverviewProperties) => (
  <ResponsiveContainer
    width="100%"
    height={350}
    debounce={50}
  >
    <BarChart
      data={data}
      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        opacity={0.1}
      />
      <XAxis
        dataKey="name"
        stroke="#888888"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        padding={{ left: 10, right: 10 }}
      />
      <YAxis
        stroke="#888888"
        fontSize={13}
        tickLine={false}
        axisLine={false}
        tickFormatter={formatCurrency}
        width={80}
      />
      <Bar
        dataKey="total"
        fill="#3498db"
        radius={[4, 4, 0, 0]}
        maxBarSize={50}
        animationDuration={500}
      />
    </BarChart>
  </ResponsiveContainer>
));

Overview.displayName = 'Overview';
