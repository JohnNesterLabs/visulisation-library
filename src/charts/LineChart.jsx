import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ORDER = ["Critical", "High", "Medium", "Low", "Informational"];

const CustomLegend = ({ payload }) => {
  const sorted = ORDER.map((key) => payload.find((p) => p.value === key));

  return (
    <ul className="flex flex-wrap justify-center list-none p-0 mt-2">
      {sorted.map(
        (entry) =>
          entry && (
            <li
              key={entry.value}
              className="flex items-center text-[12px] m-[2px_5px] sm:m-[5px_10px]"
              style={{ color: entry.color }}
            >
              <span
                className="inline-block w-[10px] h-[10px] rounded-full mr-1.5"
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.value}
            </li>
          )
      )}
    </ul>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sorted = ORDER.map((key) => payload.find((p) => p.dataKey === key));
    return (
      <div className="bg-white p-2 border border-gray-300 text-[12px]">
        <p className="m-0 font-semibold text-[12px]">{label}</p>
        {sorted.map(
          (entry) =>
            entry && (
              <p
                key={entry.dataKey}
                className="m-0 text-[12px]"
                style={{ color: entry.color }}
              >
                {entry.name} : {entry.value}
              </p>
            )
        )}
      </div>
    );
  }
  return null;
};

export default function ThreatLineChart({ data, colors }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fontSize = windowWidth < 640 ? 10 : 12;

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 10, left: 5, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="date"
            tick={{ fontSize }}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis tick={{ fontSize }} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend payload={data} />} />
          {ORDER.map((key) => (
            <Line
              key={key}
              type="linear"
              dataKey={key}
              stroke={colors[key]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
