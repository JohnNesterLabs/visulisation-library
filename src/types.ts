export interface ChartOptions {
  width?: number;
  height?: number;
  title?: string;
  theme?: ChartTheme | string;
  colors?: string[];
  animate?: boolean;
  responsive?: boolean;
  onPointClick?: (point: any) => void;
  onChartClick?: (event: any) => void;
}

export interface ChartData {
  [key: string]: any;
}

export interface ChartTheme {
  background: string;
  text: string;
  grid: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  shadow: string;
}

export interface AxisOptions {
  label?: string;
  showGrid?: boolean;
  showTicks?: boolean;
  tickFormat?: (value: any) => string;
}

export interface LegendOptions {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
}

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}
