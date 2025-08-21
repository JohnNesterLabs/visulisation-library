// Remove the chart-specific types and keep only what's needed for SankeyVisualization

export interface ChartOptions {
  width?: number;
  height?: number;
  title?: string;
  theme?: ChartTheme;
}

export interface ChartTheme {
  background?: string;
  text?: string;
  grid?: string;
  primary?: string;
  secondary?: string;
}

// Add Sankey-specific types if not already defined
export interface Node {
  id: string;
  name: string;
  value: number;
  type: "source" | "middle" | "target";
  color: string;
  x: number;
  y: number;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: Node[];
  links: Link[];
}

export interface Statistics {
  trendGoods: number;
  shoppingViews: number;
  storeDynamics: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
