import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { BarChart3 } from "lucide-react";

export default function EmployeePerformanceChart({ data = [] }) {

  const ROW_HEIGHT = 55;

  const chartHeight = Math.max(
    data.length * ROW_HEIGHT,
    ROW_HEIGHT
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <BarChart3
          size={22}
          color="#2563eb"
        />

        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            color: "#071739",
          }}
        >
          Employee Performance
        </h3>
      </div>

      <div
        
      >

        <ResponsiveContainer
          width="100%"
          height={chartHeight}
        >

          <BarChart
            layout="vertical"
            data={data}
            barCategoryGap={18}
            margin={{
              top: 0,
              right: 20,
              left: 20,
              bottom: 0,
            }}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              allowDecimals={false}
            />

            <YAxis
              type="category"
              dataKey="full_name"
              width={120}
              interval={0}
            />

            <Tooltip />

            <Bar
              dataKey="totalLeads"
              fill="#2563eb"
              barSize={20}
              radius={[0, 8, 8, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}