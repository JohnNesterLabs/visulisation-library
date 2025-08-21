# Sankey Visualization Library

A modern, lightweight Sankey diagram library for creating beautiful flow visualizations in JavaScript/TypeScript applications.

## Features

- 🎨 **Beautiful Sankey Diagrams**: Create stunning flow visualizations with minimal code
- 📊 **Interactive**: Zoom, pan, and hover interactions
- 🔧 **Customizable**: Extensive customization options for colors, themes, and styling
- 📱 **Responsive**: Automatically adapts to different screen sizes
- ⚡ **Lightweight**: Small bundle size with D3.js integration
- 🎯 **TypeScript Support**: Full TypeScript support with type definitions
- 🚀 **React Ready**: Built for React applications with optional peer dependencies

## Installation

```bash
npm install @johnhoro/visualization-library
```

or

```bash
yarn add @johnhoro/visualization-library
```

## Quick Start

### React Usage

```jsx
import React from 'react';
import { SankeyVisualization } from '@johnhoro/visualization-library';

const sankeyData = {
  nodes: [
    {
      id: "source1",
      name: "Revenue",
      value: 1000000,
      type: "source",
      color: "#6366f1",
      x: 0,
      y: 0
    },
    {
      id: "middle1",
      name: "Marketing",
      value: 400000,
      type: "middle",
      color: "#8b5cf6",
      x: 0,
      y: 0
    },
    {
      id: "target1",
      name: "Sales",
      value: 250000,
      type: "target",
      color: "#f59e0b",
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
      source: "middle1",
      target: "target1",
      value: 250000
    }
  ]
};

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <SankeyVisualization 
        data={sankeyData}
        width={1200}
        height={800}
        showTimeFilter={true}
        showStatistics={true}
        onFilterChange={(filter) => console.log('Filter changed:', filter)}
      />
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | SankeyData | required | The data for the Sankey diagram |
| `width` | number | 1200 | Chart width in pixels |
| `height` | number | 600 | Chart height in pixels |
| `showTimeFilter` | boolean | true | Show time filter buttons |
| `showStatistics` | boolean | true | Show statistics panel |
| `useCustomFlowWidth` | boolean | false | Use custom flow width |
| `onFilterChange` | function | () => {} | Callback for filter changes |

## Data Format

```typescript
interface SankeyData {
  nodes: Node[];
  links: Link[];
}

interface Node {
  id: string;
  name: string;
  value: number;
  type: "source" | "middle" | "target";
  color: string;
  x: number;
  y: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
