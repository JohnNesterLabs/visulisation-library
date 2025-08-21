# Visualization Library

A modern, lightweight visualization library for creating beautiful charts and graphs in JavaScript/TypeScript applications.

## Features

- 🎨 **Beautiful Charts**: Create stunning visualizations with minimal code
- 📊 **Multiple Chart Types**: Line charts, bar charts, pie charts, scatter plots, and more
- 🔧 **Customizable**: Extensive customization options for colors, themes, and styling
- 📱 **Responsive**: Automatically adapts to different screen sizes
- ⚡ **Lightweight**: Small bundle size with no heavy dependencies
- 🎯 **TypeScript Support**: Full TypeScript support with type definitions
- 🚀 **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript

## Installation

```bash
npm install @johnhoro/visualization-library
```

or

```bash
yarn add @johnhoro/visualization-library
```

## Quick Start

### Basic Usage

```javascript
import { LineChart, BarChart, PieChart } from '@johnhoro/visualization-library'

// Create a line chart
const lineChart = new LineChart('#chart-container', {
  data: [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 15 },
    { x: 4, y: 25 }
  ],
  width: 600,
  height: 400,
  title: 'Sales Data'
});

// Create a bar chart
const barChart = new BarChart('#bar-container', {
  data: [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 200 }
  ],
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
});

// Create a pie chart
const pieChart = new PieChart('#pie-container', {
  data: [
    { label: 'Red', value: 30 },
    { label: 'Blue', value: 25 },
    { label: 'Green', value: 45 }
  ]
});
```

### React Usage

```jsx
import React, { useEffect, useRef } from 'react';
import { LineChart } from '@johnhoro/visualization-library'

function App() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartData = [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 15 },
    { x: 4, y: 25 }
  ];

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = new LineChart(chartRef.current, {
        data: chartData,
        width: 600,
        height: 400,
        title: 'Sales Data',
        theme: 'dark'
      });
    }
  }, []);

  return (
    <div>
      <h1>My Visualization</h1>
      <div ref={chartRef} />
    </div>
  );
}
```

## Chart Types

### Line Chart

```javascript
const lineChart = new LineChart(container, {
  data: [...],
  width: 600,
  height: 400,
  title: 'Chart Title',
  xAxis: { label: 'Time' },
  yAxis: { label: 'Value' },
  theme: 'light' | 'dark',
  colors: ['#ff6b6b', '#4ecdc4'],
  showArea: true,
  showPoints: true,
  smooth: true
});
```

### Bar Chart

```javascript
const barChart = new BarChart(container, {
  data: [...],
  width: 600,
  height: 400,
  orientation: 'vertical' | 'horizontal',
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
  showValues: true,
  animate: true
});
```

### Pie Chart

```javascript
const pieChart = new PieChart(container, {
  data: [...],
  width: 400,
  height: 400,
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
  showLabels: true,
  showPercentages: true,
  donut: false
});
```

### Scatter Plot

```javascript
const scatterPlot = new ScatterPlot(container, {
  data: [...],
  width: 600,
  height: 400,
  pointSize: 5,
  colors: ['#ff6b6b'],
  showTrendLine: true
});
```

## Configuration Options

### Common Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 600 | Chart width in pixels |
| `height` | number | 400 | Chart height in pixels |
| `title` | string | '' | Chart title |
| `theme` | string | 'light' | Chart theme ('light' or 'dark') |
| `colors` | string[] | Default palette | Custom color palette |
| `animate` | boolean | true | Enable/disable animations |
| `responsive` | boolean | true | Make chart responsive |

### Data Format

```javascript
// For line charts, scatter plots
const data = [
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 15 }
];

// For bar charts
const data = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 150 },
  { label: 'Mar', value: 200 }
];

// For pie charts
const data = [
  { label: 'Red', value: 30 },
  { label: 'Blue', value: 25 },
  { label: 'Green', value: 45 }
];
```

## Themes

The library comes with built-in themes:

- **Light Theme**: Clean, minimal design with light backgrounds
- **Dark Theme**: Modern dark theme with high contrast

You can also create custom themes:

```javascript
const customTheme = {
  background: '#ffffff',
  text: '#333333',
  grid: '#e0e0e0',
  primary: '#ff6b6b',
  secondary: '#4ecdc4'
};

const chart = new LineChart(container, {
  data: data,
  theme: customTheme
});
```

## API Reference

### Chart Methods

```javascript
const chart = new LineChart(container, options);

// Update chart data
chart.updateData(newData);

// Update chart options
chart.updateOptions(newOptions);

// Destroy chart
chart.destroy();

// Export as PNG
chart.exportPNG();

// Export as SVG
chart.exportSVG();
```

### Events

```javascript
const chart = new LineChart(container, {
  data: data,
  onPointClick: (point) => {
    console.log('Clicked point:', point);
  },
  onChartClick: (event) => {
    console.log('Chart clicked:', event);
  }
});
```

## Examples

Check out the [examples directory](./examples) for more detailed usage examples.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.
