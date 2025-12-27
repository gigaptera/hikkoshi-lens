"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MarketPriceChartProps {
  prices: Record<string, number>;
}

export function MarketPriceChart({ prices }: MarketPriceChartProps) {
  // Convert object to array and sort by standard layout criteria
  const layoutOrder = ["1R", "1K", "1DK", "1LDK", "2K", "2DK", "2LDK"];

  const data = Object.entries(prices)
    .map(([name, price]) => ({ name, price }))
    .sort((a, b) => {
      const indexA = layoutOrder.indexOf(a.name);
      const indexB = layoutOrder.indexOf(b.name);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--muted))"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            unit="万"
            width={30}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--foreground))",
            }}
            formatter={(
              value: number | string | Array<number | string> | undefined
            ) => [`${value}万円`, "家賃相場"]}
          />
          <Bar dataKey="price" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
