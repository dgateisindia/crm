import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import { TrendingUp } from "lucide-react";

export default function LeadTrendChart({ data = [] }) {

  const formattedData = data.map((item) => ({

    ...item,

    displayDate: new Date(item.date).toLocaleDateString(

      "en-IN",

      {

        day: "numeric",

        month: "short"

      }

    )

  }));

  return (

    <div

      style={{

        background:"#fff",

        borderRadius:"12px",

        padding:"20px",

        boxShadow:"0 2px 8px rgba(0,0,0,.08)",

        height:"360px"

      }}

    >

      <div

        style={{

          display:"flex",

          alignItems:"center",

          gap:"8px",

          marginBottom:"20px"

        }}

      >

        <TrendingUp

          size={22}

          color="#2563eb"

        />

        <h3

          style={{

            margin:0,

            fontWeight:600,

            fontSize:"18px",

            color:"#071739"

          }}

        >

          Daily Lead Trend

        </h3>

      </div>

      <ResponsiveContainer

        width="100%"

        height="80%"

      >

        <LineChart

          data={formattedData}

          margin={{

            top:10,

            right:20,

            left:10,

            bottom:10

          }}

        >

          <CartesianGrid

            strokeDasharray="3 3"

          />

          <XAxis

            dataKey="displayDate"

            interval={0}

            tick={{

              fontSize:12

            }}

          />

          <YAxis

            allowDecimals={false}

          />

          <Tooltip

            labelFormatter={(label,payload)=>{

              if(payload?.length){

                return new Date(

                  payload[0].payload.date

                ).toLocaleDateString(

                  "en-IN",

                  {

                    weekday:"short",

                    day:"numeric",

                    month:"short",

                    year:"numeric"

                  }

                );

              }

              return label;

            }}

          />

          <Line

            type="monotone"

            dataKey="total"

            stroke="#2563eb"

            strokeWidth={3}

            dot={{r:5}}

            activeDot={{r:7}}

          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}