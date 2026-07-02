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

export default function EmployeePerformanceChart({ data }) {

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        height: "360px",
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
            fontWeight: 600,
            fontSize: "18px",
            color: "#071739",
            margin: 0,
          }}
        >
          Employee Performance
        </h3>

      </div>

      <ResponsiveContainer
        width="100%"
        height="90%"
      >

        <BarChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="full_name"
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="totalLeads"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}