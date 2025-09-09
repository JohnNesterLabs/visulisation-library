import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

// ---------------- Responsive Config ----------------
const RESPONSIVE_CONFIG = {
  desktop: { width: 500, height: 400, outerRadius: "80%" },
  tablet: { width: 400, height: 320, outerRadius: "75%" },
  mobile: { width: 350, height: 250, outerRadius: "70%" },
};

const getResponsiveConfig = () => {
  const width = window.innerWidth;
  if (width < 640) return RESPONSIVE_CONFIG.mobile; // mobile
  if (width < 1024) return RESPONSIVE_CONFIG.tablet; // tablet
  return RESPONSIVE_CONFIG.desktop; // desktop
};

export default function ThreatRadar({ data, colors }) {
  const [config, setConfig] = useState(getResponsiveConfig());

  useEffect(() => {
    const handleResize = () => {
      setConfig(getResponsiveConfig());
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-[#F8F6FF] rounded-2xl p-6 flex justify-center">
      <RadarChart
        cx="50%"
        cy="50%"
        outerRadius={config.outerRadius}
        width={config.width}
        height={config.height}
        data={data}
      >
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: "#6B7280", fontSize: 12 }}
        />
        <PolarRadiusAxis axisLine={false} tick={false} />
        <Radar
          name="Critical"
          dataKey="Critical"
          stroke={colors.Critical}
          fill={colors.Critical}
          fillOpacity={0.7}
        />
        <Radar
          name="High"
          dataKey="High"
          stroke={colors.High}
          fill={colors.High}
          fillOpacity={0.5}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{ marginTop: "20px" }} // recharts requires inline
        />
      </RadarChart>
    </div>
  );
}
