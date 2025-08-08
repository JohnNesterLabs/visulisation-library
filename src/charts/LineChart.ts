import * as d3 from 'd3';
import { ChartOptions, ChartTheme, AxisOptions } from '../types';
import { getTheme } from '../utils/themes';
import { getColors } from '../utils/colors';

export interface LineChartData {
  x: number;
  y: number;
  [key: string]: any;
}

export interface LineChartOptions extends ChartOptions {
  data: LineChartData[];
  xAxis?: AxisOptions;
  yAxis?: AxisOptions;
  showArea?: boolean;
  showPoints?: boolean;
  pointSize?: number;
  lineWidth?: number;
  smooth?: boolean;
}

export class LineChart {
  private container: string | HTMLElement;
  private options: LineChartOptions;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private theme: ChartTheme;

  constructor(container: string | HTMLElement, options: LineChartOptions) {
    this.container = container;
    this.options = {
      width: 600,
      height: 400,
      showArea: false,
      showPoints: true,
      pointSize: 4,
      lineWidth: 2,
      smooth: true,
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

    // Create line path
    const lineData = this.options.data.map(d => ({ x: xScale(d.x), y: yScale(d.y) }));
    
    if (this.options.showArea) {
      // Create area
      const areaPath = this.chartGroup.append('path')
        .attr('class', 'area')
        .attr('fill', colors[0])
        .attr('opacity', 0.3)
        .attr('d', () => {
          const area = `M ${lineData[0].x} ${margin.top + height} `;
          const line = lineData.map(d => `L ${d.x} ${d.y}`).join(' ');
          const close = ` L ${lineData[lineData.length - 1].x} ${margin.top + height} Z`;
          return area + line + close;
        });
    }

    // Create line
    const linePath = this.chartGroup.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', colors[0])
      .attr('stroke-width', this.options.lineWidth || 2)
      .attr('d', () => {
        return `M ${lineData.map(d => `${d.x} ${d.y}`).join(' L ')}`;
      });

    // Create points
    if (this.options.showPoints) {
      const points = this.chartGroup.selectAll('.point')
        .data(this.options.data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', (d: LineChartData) => xScale(d.x))
        .attr('cy', (d: LineChartData) => yScale(d.y))
        .attr('r', this.options.pointSize || 4)
        .attr('fill', colors[0])
        .attr('stroke', this.theme.background)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event: Event, d: LineChartData) => {
          if (this.options.onPointClick) {
            this.options.onPointClick(d);
          }
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

  public updateData(data: LineChartData[]): void {
    this.options.data = data;
    this.render();
  }

  public updateOptions(options: Partial<LineChartOptions>): void {
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
      link.download = 'line-chart.png';
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
    link.download = 'line-chart.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
