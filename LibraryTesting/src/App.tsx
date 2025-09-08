import React from 'react';
import './App.css';
import { SankeyVisualization, ShankyPro } from '@johnhoro/visualization-library';

function App() {
  // Sample data for the Sankey diagram
  const sankeyData = {
    nodes: [
      {
        id: "source1",
        name: "Revenue",
        value: 1000000,
        type: "source" as const,
        color: "#6366f1",
        x: 0,
        y: 0
      },
      {
        id: "middle1",
        name: "Marketing",
        value: 400000,
        type: "middle" as const,
        color: "#8b5cf6",
        x: 0,
        y: 0
      },
      {
        id: "middle2",
        name: "Operations",
        value: 300000,
        type: "middle" as const,
        color: "#a855f7",
        x: 0,
        y: 0
      },
      {
        id: "middle3",
        name: "Development",
        value: 300000,
        type: "middle" as const,
        color: "#ec4899",
        x: 0,
        y: 0
      },
      {
        id: "target1",
        name: "Sales",
        value: 250000,
        type: "target" as const,
        color: "#f59e0b",
        x: 0,
        y: 0
      },
      {
        id: "target2",
        name: "Support",
        value: 150000,
        type: "target" as const,
        color: "#10b981",
        x: 0,
        y: 0
      }
    ],
    links: [
      {
        source: "source1",
        target: "middle1",
        value: 400000
      },
      {
        source: "source1",
        target: "middle2",
        value: 300000
      },
      {
        source: "source1",
        target: "middle3",
        value: 300000
      },
      {
        source: "middle1",
        target: "target1",
        value: 250000
      },
      {
        source: "middle1",
        target: "target2",
        value: 150000
      },
      {
        source: "middle2",
        target: "target1",
        value: 200000
      },
      {
        source: "middle3",
        target: "target2",
        value: 100000
      }
    ]
  };
  const flowDefinitions = [
    // Source to middleware flows (main flows)
    {
      id: "flow1",
      type: "main",
      color: "#7E22CE", // Critical - Dark purple (from expected design)
      gradientColors: {
        start: "#EEEBFF",
        end: "#7E22CE"
      }
    },
    {
      id: "flow2",
      type: "main",
      color: "#7C3AED", // High - Medium purple (from expected design)
      gradientColors: {
        start: "#EEEBFF",
        end: "#7C3AED"
      }
    },
    {
      id: "flow3",
      type: "main",
      color: "#A78BFA", // Medium - Light purple (from expected design)
      gradientColors: {
        start: "#EEEBFF", // Light purple from expected design
        end: "#7E22CE"    // Dark purple from expected design
      }
    },
    {
      id: "flow4",
      type: "main",
      color: "#DDD6FE", // Low - Very light purple (from expected design)
      gradientColors: {
        start: "#EEEBFF",
        end: "#DDD6FE"
      }
    },
    {
      id: "flow5",
      type: "main",
      color: "#F3F4F6", // Informational - Lightest purple (from expected design)
      gradientColors: {
        start: "#EEEBFF",
        end: "#F3F4F6"
      }
    },
    // Source flows (left side flows)
    {
      id: "sourceFlow1",
      type: "source",
      sourceLabel: "Malware Download",
      sourceValue: 15000, // > 10000, width = 40/1 = 40
      color: "#8B5FBF",
      gradientColors: {
        start: "#EEEBFF", // Light purple from image
        end: "#7E22CE"    // Dark purple from image
      }
    },
    {
      id: "sourceFlow2",
      type: "source",
      sourceLabel: "Risky Site Visits",
      sourceValue: 8000, // > 5000, width = 40/2 = 20
      color: "#A78BFA",
      gradientColors: {
        start: "#EEEBFF",
        end: "#7E22CE"
      }
    },
    {
      id: "sourceFlow3",
      type: "source",
      sourceLabel: "Content Tampering",
      sourceValue: 500, // > 100, width = 40/3 = 13.33
      color: "#A78BFA",
    },
    {
      id: "sourceFlow4",
      type: "source",
      sourceLabel: "Sensitive Copy",
      sourceValue: 0, // = 0, width = 0 (invisible)
      color: "#A78BFA",
    },
    {
      id: "sourceFlow5",
      type: "source",
      sourceLabel: "Malicious Paste",
      sourceValue: 10000,
      color: "#A78BFA",
    },
    {
      id: "sourceFlow6",
      type: "source",
      sourceLabel: "Identity Spoofing",
      sourceValue: 10000,
      color: "#8B5FBF",
    },
    {
      id: "sourceFlow7",
      type: "source",
      sourceLabel: "Unverified Device",
      sourceValue: 10000,
      color: "#A78BFA",
    },
    {
      id: "sourceFlow8",
      type: "source",
      sourceLabel: "Confidential Print",
      sourceValue: 10000,
      color: "#A78BFA",
    },
    {
      id: "sourceFlow9",
      type: "source",
      sourceLabel: "Gen AI Visit",
      sourceValue: 10000,
      color: "#A78BFA",
    },
    {
      id: "sourceFlow10",
      type: "source",
      sourceLabel: "Sensitive Data Copy",
      sourceValue: 10000,
      color: "#A78BFA",
    },
    {
      id: "sourceFlow11",
      type: "source",
      sourceLabel: "Credential Theft",
      sourceValue: 10000,
      color: "#A78BFA",
    },
    {
      id: "sourceFlow12",
      type: "source",
      sourceLabel: "Unapproved Login",
      sourceValue: 10000,
      color: "#A78BFA",
    },
  ];

  return (
    <div className="App">
      <div style={{ width: '100vw', height: '100vh' }}>
        <ShankyPro flows={flowDefinitions} />
        {/* <SankeyVisualization 
          data={sankeyData}
          width={1200}
          height={800}
          showTimeFilter={false}
          // showStatistics={true}
          useCustomFlowWidth={false}
          onFilterChange={(filter) => console.log('Filter changed:', filter)}
        /> */}
      </div>
    </div>
  );
}

export default App;
