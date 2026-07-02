import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function LeadStatusChart({ data }) {

  const chartData = data.map((item) => ({
    name: item.lead_status.replace("_", " "),
    value: item.total,
  }));

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
        <PieChartIcon
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
          Leads by Status
        </h3>
      </div>
      <ResponsiveContainer
        width="100%"
        height="90%"
      >

        <PieChart>

          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            dataKey="value"
            label
          >

            {chartData.map((entry, index) => (

              <Cell
                key={index}
                fill={
                  COLORS[
                    index % COLORS.length
                  ]
                }
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>

  );

}