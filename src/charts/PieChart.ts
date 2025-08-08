import * as d3 from 'd3';
import { ChartOptions, ChartTheme } from '../types';
import { getTheme } from '../utils/themes';
import { getColors } from '../utils/colors';

export interface PieChartData {
  label: string;
  value: number;
  [key: string]: any;
}

export interface PieChartOptions extends ChartOptions {
  data: PieChartData[];
  showLabels?: boolean;
  showPercentages?: boolean;
  donut?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export class PieChart {
  private container: string | HTMLElement;
  private options: PieChartOptions;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private chartGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private theme: ChartTheme;

  constructor(container: string | HTMLElement, options: PieChartOptions) {
    this.container = container;
    this.options = {
      width: 600,
      height: 400,
      showLabels: true,
      showPercentages: false,
      donut: false,
      innerRadius: 0,
      outerRadius: 150,
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

    const width = this.options.width || 600;
    const height = this.options.height || 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = this.options.outerRadius || 150;
    const innerRadius = this.options.donut ? (this.options.innerRadius || outerRadius * 0.5) : 0;

    // Calculate total
    const total = this.options.data.reduce((sum, d) => sum + d.value, 0);

    // Get colors
    const colors = getColors(this.options.colors || 'default', this.options.data.length);

    // Create pie segments
    let currentAngle = 0;
    this.options.data.forEach((d: PieChartData, i: number) => {
      const angle = (d.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // Create arc path
      const x1 = centerX + Math.cos(startAngle) * outerRadius;
      const y1 = centerY + Math.sin(startAngle) * outerRadius;
      const x2 = centerX + Math.cos(endAngle) * outerRadius;
      const y2 = centerY + Math.sin(endAngle) * outerRadius;

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      // Outer arc
      const outerArc = `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
      
      // Inner arc (for donut)
      const innerArc = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + Math.cos(startAngle) * innerRadius} ${centerY + Math.sin(startAngle) * innerRadius}`;

      const pathData = `M ${x1} ${y1} ${outerArc} L ${centerX + Math.cos(endAngle) * innerRadius} ${centerY + Math.sin(endAngle) * innerRadius} ${innerArc} Z`;

      // Create path element
      const path = this.chartGroup.append('path')
        .attr('class', 'pie-segment')
        .attr('d', pathData)
        .attr('fill', colors[i % colors.length])
        .style('cursor', 'pointer')
        .on('click', (event: Event) => {
          if (this.options.onPointClick) {
            this.options.onPointClick(d);
          }
        });

      // Add labels
      if (this.options.showLabels) {
        const labelAngle = startAngle + angle / 2;
        const labelRadius = outerRadius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        this.chartGroup.append('text')
          .attr('class', 'pie-label')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', this.theme.text)
          .style('font-size', '12px')
          .text(d.label);
      }

      // Add percentages
      if (this.options.showPercentages) {
        const percentAngle = startAngle + angle / 2;
        const percentRadius = outerRadius * 0.5;
        const percentX = centerX + Math.cos(percentAngle) * percentRadius;
        const percentY = centerY + Math.sin(percentAngle) * percentRadius;

        this.chartGroup.append('text')
          .attr('class', 'pie-percentage')
          .attr('x', percentX)
          .attr('y', percentY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', this.theme.text)
          .style('font-size', '10px')
          .text(`${((d.value / total) * 100).toFixed(1)}%`);
      }

      currentAngle += angle;
    });

    // Add title
    if (this.options.title) {
      this.chartGroup.append('text')
        .attr('class', 'chart-title')
        .attr('x', centerX)
        .attr('y', centerY - outerRadius - 20)
        .attr('text-anchor', 'middle')
        .attr('fill', this.theme.text)
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(this.options.title);
    }
  }

  public updateData(data: PieChartData[]): void {
    this.options.data = data;
    this.render();
  }

  public updateOptions(options: Partial<PieChartOptions>): void {
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
      link.download = 'pie-chart.png';
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
    link.download = 'pie-chart.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
