// Main exports
export { LineChart } from './charts/LineChart.js';
export { BarChart } from './charts/BarChart.js';
export { PieChart } from './charts/PieChart.js';
export { ScatterPlot } from './charts/ScatterPlot.js';

// Types
export type { ChartOptions, ChartData, ChartTheme } from './types.js';
export type { LineChartOptions, LineChartData } from './charts/LineChart.js';
export type { BarChartOptions, BarChartData } from './charts/BarChart.js';
export type { PieChartOptions, PieChartData } from './charts/PieChart.js';
export type { ScatterPlotOptions, ScatterPlotData } from './charts/ScatterPlot.js';

// Utilities
export { createTheme, defaultThemes } from './utils/themes.js';
export { colorPalettes } from './utils/colors.js';
