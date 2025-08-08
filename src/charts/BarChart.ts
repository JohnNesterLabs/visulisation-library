import * as d3 from 'd3';
import { ChartOptions, ChartTheme, AxisOptions } from '../types';
import { getTheme } from '../utils/themes';
import { getColors } from '../utils/colors';

export interface BarChartData {
  label: string;
  value: number;
  [key: string]: any;
}

export interface BarChartOptions extends ChartOptions {
  data: BarChartData[];
  xAxis?: AxisOptions;
  yAxis?: AxisOptions;
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
  barPadding?: number;
  groupPadding?: number;
  barWidth?: number;
}

export class BarChart {
  private container: string | HTMLElement;
  private options: BarChartOptions;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private theme: ChartTheme;

  constructor(container: string | HTMLElement, options: BarChartOptions) {
    this.container = container;
    this.options = {
      width: 600,
      height: 400,
      orientation: 'vertical',
      showValues: false,
      barPadding: 0.1,
      groupPadding: 0.1,
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

    const isVertical = this.options.orientation === 'vertical';

    // Get colors
    const colors = getColors(this.options.colors || 'default', this.options.data.length);

    // Create bars
    const bars = this.chartGroup.selectAll('.bar')
      .data(this.options.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .style('cursor', 'pointer')
      .on('click', (event: Event, d: BarChartData) => {
        if (this.options.onPointClick) {
          this.options.onPointClick(d);
        }
      });

    if (isVertical) {
      // Simple vertical bar chart
      const barWidth = width / this.options.data.length * 0.8;
      const maxValue = Math.max(...this.options.data.map(d => d.value));
      
      bars
        .attr('x', (d: BarChartData, i: number) => margin.left + (width / this.options.data.length) * i + (width / this.options.data.length) * 0.1)
        .attr('y', (d: BarChartData) => margin.top + height - (d.value / maxValue) * height)
        .attr('width', barWidth)
        .attr('height', (d: BarChartData) => (d.value / maxValue) * height)
        .attr('fill', (d: BarChartData, i: number) => colors[i % colors.length]);
    } else {
      // Simple horizontal bar chart
      const barHeight = height / this.options.data.length * 0.8;
      const maxValue = Math.max(...this.options.data.map(d => d.value));
      
      bars
        .attr('x', margin.left)
        .attr('y', (d: BarChartData, i: number) => margin.top + (height / this.options.data.length) * i + (height / this.options.data.length) * 0.1)
        .attr('width', (d: BarChartData) => (d.value / maxValue) * width)
        .attr('height', barHeight)
        .attr('fill', (d: BarChartData, i: number) => colors[i % colors.length]);
    }

    // Add value labels
    if (this.options.showValues) {
      const labels = this.chartGroup.selectAll('.value-label')
        .data(this.options.data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('text-anchor', 'middle')
        .attr('fill', this.theme.text)
        .style('font-size', '12px');

      if (isVertical) {
        const maxValue = Math.max(...this.options.data.map(d => d.value));
        labels
          .attr('x', (d: BarChartData, i: number) => margin.left + (width / this.options.data.length) * i + (width / this.options.data.length) * 0.5)
          .attr('y', (d: BarChartData) => margin.top + height - (d.value / maxValue) * height - 5)
          .text((d: BarChartData) => d.value.toString());
      } else {
        const maxValue = Math.max(...this.options.data.map(d => d.value));
        labels
          .attr('x', (d: BarChartData) => margin.left + (d.value / maxValue) * width + 5)
          .attr('y', (d: BarChartData, i: number) => margin.top + (height / this.options.data.length) * i + (height / this.options.data.length) * 0.5)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .text((d: BarChartData) => d.value.toString());
      }
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

  public updateData(data: BarChartData[]): void {
    this.options.data = data;
    this.render();
  }

  public updateOptions(options: Partial<BarChartOptions>): void {
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
      link.download = 'bar-chart.png';
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
    link.download = 'bar-chart.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
