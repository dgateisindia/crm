import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { PieChart as PieChartIcon } from "lucide-react";

import { STATUS_THEME } from "../../utils/statusTheme";

export default function LeadStatusChart({ data }) {

  const chartData = data.map((item) => {

  const status = item.lead_status
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return {

    status,

    name: status
      .split("_")
      .map(word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
      )
      .join(" "),

    value: Number(item.total),

    color:
      STATUS_THEME[status]?.color || "#94A3B8",

  };

});

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 6px 18px rgba(0,0,0,.08)",
        height: "360px",
      }}
    >

      <h3
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 700,
          fontSize: "24px",
          marginBottom: "20px",
        }}
      >
        <PieChartIcon color="#2563eb" />
        Leads by Status
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "280px",
        }}
      >

        <div
          style={{
            width: "55%",
            height: "100%",
          }}
        >

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
              >

                {chartData.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={entry.color}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        <div
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >

          {chartData.map((item, index) => (

            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >

                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: item.color,
                    display: "inline-block",
                  }}
                />

                <span
                  style={{
                    textTransform: "capitalize",
                  }}
                >
                  {item.name}
                </span>

              </div>

              <span
                style={{
                  fontWeight: 700,
                  color: "#1F2937",
                }}
              >
                {item.value}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}