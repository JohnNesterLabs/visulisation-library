import React from 'react';
import { SankeyVisualization } from '@johnhoro/visualization-library';

const SankeyTest: React.FC = () => {
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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <SankeyVisualization 
        data={sankeyData}
        width={1200}
        height={800}
        showTimeFilter={true}
        showStatistics={true}
        useCustomFlowWidth={false}
        onFilterChange={(filter) => console.log('Filter changed:', filter)}
      />
    </div>
  );
};

export default SankeyTest;
