import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function LeadTrendChart({ data }) {

  return (

    <div
      style={{
        background:"#fff",
        borderRadius:"12px",
        padding:"20px",
        boxShadow:"0 2px 8px rgba(0,0,0,.08)",
        height:"360px",
      }}
    >

      <h3
        style={{
          fontWeight:600,
          marginBottom:"20px",
        }}
      >
        Lead Trend
      </h3>

      <ResponsiveContainer
        width="100%"
        height="80%"
      >

        <LineChart
          data={data}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="date"
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="totalLeads"
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}