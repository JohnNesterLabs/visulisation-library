import * as d3 from 'd3';
import { ChartOptions, ChartTheme, AxisOptions } from '../types';
import { getTheme } from '../utils/themes';
import { getColors } from '../utils/colors';

export interface ScatterPlotData {
  x: number;
  y: number;
  [key: string]: any;
}

export interface ScatterPlotOptions extends ChartOptions {
  data: ScatterPlotData[];
  xAxis?: AxisOptions;
  yAxis?: AxisOptions;
  pointSize?: number;
  showTrendLine?: boolean;
  trendLineColor?: string;
}

export class ScatterPlot {
  private container: string | HTMLElement;
  private options: ScatterPlotOptions;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private theme: ChartTheme;

  constructor(container: string | HTMLElement, options: ScatterPlotOptions) {
    this.container = container;
    this.options = {
      width: 600,
      height: 400,
      pointSize: 6,
      showTrendLine: false,
      trendLineColor: '#ff6b6b',
      animate: true,
      responsive: true,
      ...options
    };
    
    this.theme = getTheme(this.options.theme || 'light');
    this.init();
  }

  private init(): void {
    const container = typeof this.container === 'string' 
      ? document.querySelector(this.container) 
      : this.container;

    if (!container) {
      throw new Error('Container element not found');
    }

    // Clear existing content
    d3.select(container).selectAll('*').remove();

    // Create SVG
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.options.width || 600)
      .attr('height', this.options.height || 400)
      .style('background', this.theme.background);

    // Create chart group
    this.chartGroup = this.svg.append('g')
      .attr('class', 'chart-group');

    this.render();
  }

  private render(): void {
    if (!this.options.data || this.options.data.length === 0) {
      return;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = (this.options.width || 600) - margin.left - margin.right;
    const height = (this.options.height || 400) - margin.top - margin.bottom;

    // Get data ranges
    const xValues = this.options.data.map(d => d.x);
    const yValues = this.options.data.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Create scales
    const xScale = (x: number) => margin.left + ((x - xMin) / (xMax - xMin)) * width;
    const yScale = (y: number) => margin.top + height - ((y - yMin) / (yMax - yMin)) * height;

    // Get colors
    const colors = getColors(this.options.colors || 'default', 1);

    // Create points
    const points = this.chartGroup.selectAll('.point')
      .data(this.options.data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d: ScatterPlotData) => xScale(d.x))
      .attr('cy', (d: ScatterPlotData) => yScale(d.y))
      .attr('r', this.options.pointSize || 6)
      .attr('fill', colors[0])
      .attr('stroke', this.theme.background)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event: Event, d: ScatterPlotData) => {
        if (this.options.onPointClick) {
          this.options.onPointClick(d);
        }
      });

    // Add trend line
    if (this.options.showTrendLine && this.options.data.length > 1) {
      // Simple linear regression
      const n = this.options.data.length;
      const sumX = this.options.data.reduce((sum, d) => sum + d.x, 0);
      const sumY = this.options.data.reduce((sum, d) => sum + d.y, 0);
      const sumXY = this.options.data.reduce((sum, d) => sum + d.x * d.y, 0);
      const sumX2 = this.options.data.reduce((sum, d) => sum + d.x * d.x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Create trend line points
      const trendLineData = [
        { x: xMin, y: slope * xMin + intercept },
        { x: xMax, y: slope * xMax + intercept }
      ];

      const trendLine = this.chartGroup.append('path')
        .attr('class', 'trend-line')
        .attr('fill', 'none')
        .attr('stroke', this.options.trendLineColor || '#ff6b6b')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', () => {
          const x1 = xScale(trendLineData[0].x);
          const y1 = yScale(trendLineData[0].y);
          const x2 = xScale(trendLineData[1].x);
          const y2 = yScale(trendLineData[1].y);
          return `M ${x1} ${y1} L ${x2} ${y2}`;
        });
    }

    // Add title
    if (this.options.title) {
      this.chartGroup.append('text')
        .attr('class', 'chart-title')
        .attr('x', margin.left + width / 2)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', this.theme.text)
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(this.options.title);
    }
  }

  public updateData(data: ScatterPlotData[]): void {
    this.options.data = data;
    this.render();
  }

  public updateOptions(options: Partial<ScatterPlotOptions>): void {
    this.options = { ...this.options, ...options };
    this.theme = getTheme(this.options.theme || 'light');
    this.render();
  }

  public destroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
  }

  public exportPNG(): void {
    const svgData = new XMLSerializer().serializeToString(this.svg.node()!);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    canvas.width = this.options.width || 600;
    canvas.height = this.options.height || 400;
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'scatter-plot.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }

  public exportSVG(): void {
    const svgData = new XMLSerializer().serializeToString(this.svg.node()!);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'scatter-plot.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
