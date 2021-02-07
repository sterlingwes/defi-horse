import React from "react";
import { format } from "date-fns";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";

interface YieldGraphProps {
  chartData: ChartDataPoint[];
}

interface ChartDataPoint {
  timestamp: number;
  rate: number;
}

export const YieldGraph = ({ chartData }: YieldGraphProps) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={chartData}>
      <XAxis
        type="number"
        dataKey="timestamp"
        domain={["dataMin", "dataMax"]}
        tickFormatter={(time) =>
          isFinite(time) ? format(time * 1000, "MMM d") : time
        }
      />
      <Tooltip
        formatter={(rate: number, time: number) => [
          `${Math.round(rate * 100) / 100}%`,
          "Rate",
        ]}
        labelFormatter={(time: number) =>
          isFinite(time) ? format(time * 1000, "MMM d") : time
        }
      />
      <Line type="monotone" dataKey="rate" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);
