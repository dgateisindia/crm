import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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

      <h3
        style={{
          fontWeight: 600,
          marginBottom: "20px",
        }}
      >
        Employee Performance
      </h3>

      <ResponsiveContainer
        width="100%"
        height="90%"
      >

        <BarChart
          data={data}
        >

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
            radius={[6,6,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}