'use client'

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";

const DEFAULT_DATA = {
  nodes: [
    // Step 1: Source nodes (detection types)
    { name: "Malware\ndownload", group: "source" },
    { name: "Data Exfiltration", group: "source" },
    { name: "Risky Site Visits", group: "source" },
    { name: "Credential\ntheft", group: "source" },
    { name: "Sensitive Copy", group: "source" },
    { name: "Malicious Paste", group: "source" },
    { name: "Unauthorized\naddon", group: "source" },
    { name: "Identity Spoofing", group: "source" },
    { name: "Unverified device", group: "source" },
    { name: "Confidential print", group: "source" },
    { name: "Gen AI Visit", group: "source" },
    { name: "Leak Prevention", group: "source" },
    { name: "Copy\nsensitive data", group: "source" },
    { name: "Content tampering", group: "source" },
    { name: "Unapproved login", group: "source" },

    // Step 2: Middleware nodes (data checking/filtering)
    { name: "Data\nValidation", group: "middleware" },
    { name: "Threat\nAnalysis", group: "middleware" },
    { name: "Risk\nAssessment", group: "middleware" },
    { name: "Priority\nFiltering", group: "middleware" },

    // Step 3: Target nodes (priority levels)
    { name: "Critical", level: "critical", group: "target" },
    { name: "High", level: "high", group: "target" },
    { name: "Medium", level: "medium", group: "target" },
    { name: "Low", level: "low", group: "target" },
  ],
  links: [
    // Step 1 → Step 2: Source to Middleware
    // Malware download flows to different middleware processes
    { source: 0, target: 15, value: 15 }, // → Data Validation
    { source: 0, target: 16, value: 25 }, // → Threat Analysis
    { source: 0, target: 17, value: 20 }, // → Risk Assessment
    { source: 0, target: 18, value: 20 }, // → Priority Filtering

    // Data Exfiltration flows
    { source: 1, target: 15, value: 12 }, // → Data Validation
    { source: 1, target: 16, value: 20 }, // → Threat Analysis
    { source: 1, target: 17, value: 18 }, // → Risk Assessment
    { source: 1, target: 18, value: 16 }, // → Priority Filtering

    // Risky Site Visits flows
    { source: 2, target: 15, value: 10 }, // → Data Validation
    { source: 2, target: 16, value: 18 }, // → Threat Analysis
    { source: 2, target: 17, value: 20 }, // → Risk Assessment
    { source: 2, target: 18, value: 12 }, // → Priority Filtering

    // Credential theft flows
    { source: 3, target: 15, value: 16 }, // → Data Validation
    { source: 3, target: 16, value: 24 }, // → Threat Analysis
    { source: 3, target: 17, value: 20 }, // → Risk Assessment
    { source: 3, target: 18, value: 20 }, // → Priority Filtering

    // Sensitive Copy flows
    { source: 4, target: 15, value: 8 }, // → Data Validation
    { source: 4, target: 16, value: 16 }, // → Threat Analysis
    { source: 4, target: 17, value: 18 }, // → Risk Assessment
    { source: 4, target: 18, value: 8 }, // → Priority Filtering

    // Malicious Paste flows
    { source: 5, target: 15, value: 10 }, // → Data Validation
    { source: 5, target: 16, value: 18 }, // → Threat Analysis
    { source: 5, target: 17, value: 20 }, // → Risk Assessment
    { source: 5, target: 18, value: 12 }, // → Priority Filtering

    // Unauthorized addon flows
    { source: 6, target: 15, value: 8 }, // → Data Validation
    { source: 6, target: 16, value: 16 }, // → Threat Analysis
    { source: 6, target: 17, value: 18 }, // → Risk Assessment
    { source: 6, target: 18, value: 8 }, // → Priority Filtering

    // Identity Spoofing flows
    { source: 7, target: 15, value: 12 }, // → Data Validation
    { source: 7, target: 16, value: 20 }, // → Threat Analysis
    { source: 7, target: 17, value: 18 }, // → Risk Assessment
    { source: 7, target: 18, value: 12 }, // → Priority Filtering

    // Unverified device flows
    { source: 8, target: 15, value: 10 }, // → Data Validation
    { source: 8, target: 16, value: 16 }, // → Threat Analysis
    { source: 8, target: 17, value: 18 }, // → Risk Assessment
    { source: 8, target: 18, value: 10 }, // → Priority Filtering

    // Confidential print flows
    { source: 9, target: 15, value: 8 }, // → Data Validation
    { source: 9, target: 16, value: 14 }, // → Threat Analysis
    { source: 9, target: 17, value: 16 }, // → Risk Assessment
    { source: 9, target: 18, value: 8 }, // → Priority Filtering

    // Gen AI Visit flows
    { source: 10, target: 15, value: 12 }, // → Data Validation
    { source: 10, target: 16, value: 18 }, // → Threat Analysis
    { source: 10, target: 17, value: 16 }, // → Risk Assessment
    { source: 10, target: 18, value: 12 }, // → Priority Filtering

    // Leak Prevention flows
    { source: 11, target: 15, value: 10 }, // → Data Validation
    { source: 11, target: 16, value: 16 }, // → Threat Analysis
    { source: 11, target: 17, value: 18 }, // → Risk Assessment
    { source: 11, target: 18, value: 10 }, // → Priority Filtering

    // Copy sensitive data flows
    { source: 12, target: 15, value: 12 }, // → Data Validation
    { source: 12, target: 16, value: 20 }, // → Threat Analysis
    { source: 12, target: 17, value: 18 }, // → Risk Assessment
    { source: 12, target: 18, value: 12 }, // → Priority Filtering

    // Content tampering flows
    { source: 13, target: 15, value: 8 }, // → Data Validation
    { source: 13, target: 16, value: 16 }, // → Threat Analysis
    { source: 13, target: 17, value: 18 }, // → Risk Assessment
    { source: 13, target: 18, value: 8 }, // → Priority Filtering

    // Unapproved login flows
    { source: 14, target: 15, value: 10 }, // → Data Validation
    { source: 14, target: 16, value: 18 }, // → Threat Analysis
    { source: 14, target: 17, value: 18 }, // → Risk Assessment
    { source: 14, target: 18, value: 10 }, // → Priority Filtering

    // Step 2 → Step 3: Middleware to Target (Priority-based filtering)
    // Data Validation → Priority levels
    { source: 15, target: 19, value: 8 }, // → Critical
    { source: 15, target: 20, value: 25 }, // → High
    { source: 15, target: 21, value: 35 }, // → Medium
    { source: 15, target: 22, value: 32 }, // → Low

    // Threat Analysis → Priority levels
    { source: 16, target: 19, value: 20 }, // → Critical
    { source: 16, target: 20, value: 45 }, // → High
    { source: 16, target: 21, value: 55 }, // → Medium
    { source: 16, target: 22, value: 40 }, // → Low

    // Risk Assessment → Priority levels
    { source: 17, target: 19, value: 18 }, // → Critical
    { source: 17, target: 20, value: 40 }, // → High
    { source: 17, target: 21, value: 50 }, // → Medium
    { source: 17, target: 22, value: 32 }, // → Low

    // Priority Filtering → Priority levels
    { source: 18, target: 19, value: 14 }, // → Critical
    { source: 18, target: 20, value: 30 }, // → High
    { source: 18, target: 21, value: 40 }, // → Medium
    { source: 18, target: 22, value: 26 }, // → Low
  ],
};

const useResizeObserver = (ref) => {
  const [size, setSize] = useState({ width: 800, height: 520 });
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ width: cr.width, height: cr.height });
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return size;
};

export default function DetectionsSankey({ data = DEFAULT_DATA }) {
  const wrapperRef = useRef(null);
  const { width, height } = useResizeObserver(wrapperRef);
  const [activeId, setActiveId] = useState(null);
  const padding = 24;

  const { nodes, links } = useMemo(() => {
    const sankey = d3Sankey()
      .nodeAlign(sankeyLeft)
      .nodeWidth(8) // Increased node width for better visibility
      .nodePadding(16) // Increased padding between nodes
      .extent([
        [padding + 20, padding], // Added more left padding
        [Math.max(480, width - 280), Math.max(420, height - padding)],
      ]);

    const graph = sankey({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    return { nodes: graph.nodes, links: graph.links };
  }, [data, width, height]);

  // Enhanced totals calculation for 3-step flow
  const totals = useMemo(() => {
    // Get target nodes (priority levels)
    const targetNodes = nodes.filter(n => n.group === "target");
    
    // Calculate sums for each priority level
    const sums = {};
    targetNodes.forEach(node => {
      sums[node.name] = 0;
    });
    
    // Sum up all incoming links to target nodes
    links.forEach((link) => {
      const targetNode = nodes[link.target.index];
      if (targetNode && targetNode.group === "target") {
        const targetName = targetNode.name;
        if (sums[targetName] !== undefined) {
          sums[targetName] += link.value || 0;
        }
      }
    });
    
    // Calculate total mitigated threats
    const total = Object.values(sums).reduce((a, b) => a + b, 0);
    
    // Calculate unmitigated threats dynamically
    // Based on your data: 887 total - 510 mitigated = 377 unmitigated
    const totalDetections = 887; // This could also be made dynamic from your data
    const unmitigatedTotal = totalDetections - total;
    
    return { 
      sums, 
      total, 
      totalDetections,
      unmitigatedTotal 
    };
  }, [nodes, links]);

  return (
    <div className="w-full h-full bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-start gap-6">
        {/* Chart area */}
        <div className="flex-1">
          <div ref={wrapperRef} className="w-full h-[540px] rounded-xl bg-white relative">
            <svg width={width} height={height} className="overflow-visible">
              <defs>
                {/* Soft glow */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradient palette matching the Figma vibe */}
                <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#bcdcff" />
                  <stop offset="45%" stopColor="#a9c8ff" />
                  <stop offset="70%" stopColor="#9166ff" />
                  <stop offset="100%" stopColor="#5b2bd7" />
                </linearGradient>
              </defs>

              {/* Title */}
              <text x={8} y={12} className="fill-slate-900" fontSize={16} fontWeight={700}>
                Detections Timeline
              </text>

              {/* Step 1: Source labels (left side) - Fixed positioning */}
              {nodes
                .filter((n) => n.group === "source")
                .map((n, i) => (
                  <text
                    key={`label-source-${i}`}
                    x={Math.max(padding + 25, n.x0 - 12)} // Better positioning with padding
                    y={(n.y0 + n.y1) / 2}
                    dy="0.35em"
                    textAnchor="end"
                    className="fill-slate-600"
                    fontSize={11}
                  >
                    {n.name}
                  </text>
                ))}

              {/* Step 2: Middleware labels (center) - Fixed positioning */}
              {nodes
                .filter((n) => n.group === "middleware")
                .map((n, i) => (
                  <text
                    key={`label-middleware-${i}`}
                    x={(n.x0 + n.x1) / 2}
                    y={n.y0 - 12} // Moved up slightly
                    textAnchor="middle"
                    className="fill-slate-700"
                    fontSize={11}
                    fontWeight={600}
                  >
                    {n.name}
                  </text>
                ))}

              {/* Step 3: Target labels (right side) */}
              {nodes
                .filter((n) => n.group === "target")
                .map((n, i) => (
                  <text
                    key={`label-target-${i}`}
                    x={n.x1 + 12} // Increased spacing
                    y={(n.y0 + n.y1) / 2}
                    dy="0.35em"
                    className="fill-slate-700"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {n.name}
                  </text>
                ))}

              {/* Vertical divider lines - Adjusted positions */}
              {/* Left divider (Source → Middleware) */}
              <line
                x1={Math.max(padding + 40, (width - 280) / 3)}
                x2={Math.max(padding + 40, (width - 280) / 3)}
                y1={padding}
                y2={height - padding}
                stroke="#45b2a8"
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="3,3"
              />

              {/* Right divider (Middleware → Target) */}
              <line
                x1={Math.max(padding + 80, 2 * (width - 280) / 3)}
                x2={Math.max(padding + 80, 2 * (width - 280) / 3)}
                y1={padding}
                y2={height - padding}
                stroke="#45b2a8"
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="3,3"
              />

              {/* Links */}
              <g fill="none" strokeOpacity={0.65} filter="url(#glow)">
                {links.map((link, i) => (
                  <path
                    key={`link-${i}`}
                    d={sankeyLinkHorizontal()(link)}
                    stroke="url(#linkGradient)"
                    strokeWidth={Math.max(1, link.width)}
                    opacity={activeId === i ? 1 : 0.7}
                    onMouseEnter={() => setActiveId(i)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <title>
                      {`${nodes[link.source.index].name} → ${nodes[link.target.index].name}: ${link.value}`}
                    </title>
                  </path>
                ))}
              </g>

              {/* Nodes with better positioning */}
              <g>
                {nodes.map((n, i) => (
                  <g key={`node-${i}`}>
                    <rect
                      x={n.x0}
                      y={n.y0}
                      width={n.x1 - n.x0}
                      height={Math.max(1, n.y1 - n.y0)}
                      fill={
                        n.group === "source" ? "#dbeafe" : // Light blue for source
                        n.group === "middleware" ? "#a9c8ff" : // Medium blue for middleware
                        n.group === "target" ? "#6a4cff" : // Purple for target
                        "#dbeafe" // Default
                      }
                      opacity={n.group === "target" ? 0.9 : 0.8}
                      rx={3}
                    >
                      <title>
                        {`${n.name}: ${Math.round(n.value ?? 0)}`}
                      </title>
                    </rect>
                  </g>
                ))}
              </g>

              {/* Enhanced Legend - Adjusted positioning */}
              <g transform={`translate(8, ${height - 28})`}>
                {[
                  { label: "Source (Attacks)", color: "#dbeafe" },
                  { label: "Middleware (Processing)", color: "#a9c8ff" },
                  { label: "Critical Threats", color: "#5223dd" },
                  { label: "High Threats", color: "#7648ff" },
                  { label: "Medium Threats", color: "#a9c8ff" },
                  { label: "Low Threats", color: "#d7e6ff" },
                ].map((item, idx) => (
                  <g key={item.label} transform={`translate(${idx * 130},0)`}>
                    <circle r={5} cy={-4} fill={item.color} />
                    <text x={10} dy={0} className="fill-slate-600" fontSize={11}>
                      {item.label}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>

        {/* Side cards */}
        <aside className="w-[260px] shrink-0 space-y-4">
          <div className="rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="text-slate-500 text-sm font-medium">Total Detections</div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-3xl font-bold">{totals.totalDetections}</div>
              <div className="text-emerald-600 text-xs">▲ +10%</div>
            </div>
            <div className="text-slate-400 text-xs mt-1">In last 7 days</div>
          </div>

          <div className="rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="text-slate-600 text-sm font-semibold">Mitigated Threats <span className="font-normal text-slate-400">{totals.total}</span></div>
            <div className="mt-3 space-y-2 text-sm">
              {Object.entries(totals.sums).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-900 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="text-slate-600 text-sm font-semibold">Unmitigated Threats <span className="font-normal text-slate-400">{totals.unmitigatedTotal}</span></div>
            <div className="mt-3 text-sm text-slate-500 flex justify-between">
              <span>Informational</span>
              <span className="text-slate-900 font-medium">{totals.unmitigatedTotal}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
