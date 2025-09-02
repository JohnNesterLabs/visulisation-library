// components/BarChart.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface BarChartData {
  category: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  title?: string;
  titleStyle?: React.CSSProperties;
  titleClassName?: string; // Add this prop for custom CSS classes
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors?: {
    gradient?: {
      start: string;
      end: string;
    };
    solid?: string;
  };
  showGrid?: boolean;
  animate?: boolean;
  responsive?: boolean;
  formatValue?: (value: number) => string; // Make sure this is properly typed
  className?: string;
  style?: React.CSSProperties;
  onBarClick?: (data: BarChartData, index: number) => void;
  onBarHover?: (data: BarChartData, index: number) => void;
  showTooltip?: boolean;
  tooltipStyle?: React.CSSProperties; // Add tooltip style prop
  tooltipClassName?: string; // Add tooltip class prop
  tooltipContent?: (data: BarChartData) => React.ReactNode; // Custom tooltip content
  showLegend?: boolean; // Add legend visibility prop
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'; // Legend position
  legendStyle?: React.CSSProperties; // Custom legend styles
  legendClassName?: string; // Custom legend classes
  legendTitle?: string; // Custom legend title
  cornerRadius?: number;
  barPadding?: number;
  tickCount?: number;
  showYAxis?: boolean;
  showYAxisLine?: boolean;
  showYAxisTicks?: boolean;
  yAxisStyle?: React.CSSProperties;
  yAxisClassName?: string;
  yAxisLabelStyle?: React.CSSProperties;
  yAxisLabelClassName?: string;
}

const defaultProps: Partial<BarChartProps> = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 30, bottom: 60, left: 80 },
  colors: {
    gradient: {
      start: '#8B5CF6',
      end: '#6B46C1'
    }
  },
  showGrid: true,
  animate: true,
  responsive: true,
  showTooltip: true,
  cornerRadius: 5,
  barPadding: 0.6,
  tickCount: 5,
  formatValue: (value: number) => {
    if (value === 0) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  }
};

const BarChart: React.FC<BarChartProps> = (props) => {
  const mergedProps = { ...defaultProps, ...props };
  const {
    data,
    title,
    titleStyle,
    titleClassName,
    width,
    height,
    margin,
    colors,
    showGrid,
    animate,
    responsive,
    formatValue,
    className,
    style,
    onBarClick,
    onBarHover,
    showTooltip,
    tooltipStyle,
    tooltipClassName,
    tooltipContent,
    showLegend = true,
    legendPosition = 'bottom',
    legendStyle,
    legendClassName,
    legendTitle,
    showYAxis = true,
    showYAxisLine = false,
    showYAxisTicks = false,
    yAxisStyle,
    yAxisClassName,
    yAxisLabelStyle,
    yAxisLabelClassName,
    cornerRadius,
    barPadding,
    tickCount
  } = mergedProps;

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Always start with default dimensions to avoid hydration mismatch
  const [dimensions, setDimensions] = useState({ 
    width: width || 800, 
    height: height || 400 
  });
  
  // Track if component has mounted to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    // Mark as mounted to avoid hydration issues
    setIsMounted(true);
    
    if (!responsive) return;

    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        const newWidth = Math.max(300, containerWidth);
        const newHeight = Math.max(300, newWidth * 0.5);
        
        setDimensions({
          width: newWidth,
          height: newHeight
        });
      }
    };

    // Use ResizeObserver for more accurate container size detection
    let resizeObserver: ResizeObserver;
    
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize for fallback
    window.addEventListener('resize', handleResize);
    
    // Initial call after component is mounted
    const timer = setTimeout(handleResize, 0);
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [responsive]);

  // Only render chart after component has mounted to avoid hydration issues
  useEffect(() => {
    if (!isMounted || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const chartWidth = dimensions.width - (margin?.left || 0) - (margin?.right || 0);
    const chartHeight = dimensions.height - (margin?.top || 0) - (margin?.bottom || 0);

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin?.left || 0},${margin?.top || 0})`);

    // Define gradient if specified
    if (colors?.gradient) {
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'barGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.gradient.start);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.gradient.end);
    }

    // Set up scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.category))
      .range([0, chartWidth])
      .padding(barPadding || 0.6);

    const maxValue = d3.max(data, d => d.value) || 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding to top
      .range([chartHeight, 0]);

    // Add grid lines if enabled
    if (showGrid) {
      const yAxisGrid = d3
        .axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat(() => '')
        .ticks(tickCount || 5);

      g.append('g')
        .attr('class', 'grid')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3)
        .call(yAxisGrid);
    }

    // Add Y-axis
    if (showYAxis) {
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(tickCount || 5)
        .tickFormat((d: any) => {
          // Ensure we have a number and format it properly
          const value = typeof d === 'number' ? d : Number(d);
          if (formatValue) {
            return formatValue(value);
          }
          // Default formatting
          if (value === 0) return '0';
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
          return value.toString();
        });

      const yAxisGroup = g.append('g')
        .attr('class', 'y-axis')
        .style('color', '#7D7D7D')
        .style('font-size', '0.875rem')
        .call(yAxis);

      // Apply custom Y-axis styles
      if (yAxisStyle) {
        // Safely apply CSS properties to D3 elements
        const safeStyles = [
          'color', 'font-size', 'font-weight', 'font-family', 'opacity', 
          'visibility', 'display', 'text-anchor', 'dominant-baseline'
        ];
        
        safeStyles.forEach(prop => {
          const value = (yAxisStyle as any)[prop];
          if (value !== undefined) {
            yAxisGroup.style(prop, value.toString());
          }
        });
      }

      // Hide Y-axis line if specified
      if (!showYAxisLine) {
        yAxisGroup.selectAll('path').style('display', 'none');
      }

      // Hide Y-axis ticks if specified
      if (!showYAxisTicks) {
        yAxisGroup.selectAll('line').style('display', 'none');
      }

      // Customize Y-axis labels
      yAxisGroup.selectAll('text')
        .attr('class', `y-axis-label ${yAxisLabelClassName || ''}`)
        .style('font-weight', '500')
        .style('fill', '#7D7D7D')
        .style('font-size', '0.875rem')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('dominant-baseline', 'middle')
        .style('text-anchor', 'end')
        .attr('dx', '-8px'); // Position labels slightly to the left

      // Apply custom Y-axis label styles safely
      if (yAxisLabelStyle) {
        const safeLabelStyles = [
          'color', 'font-size', 'font-weight', 'font-family', 'opacity', 
          'visibility', 'display', 'text-anchor', 'dominant-baseline'
        ];
        
        safeLabelStyles.forEach(prop => {
          const value = (yAxisLabelStyle as any)[prop];
          if (value !== undefined) {
            yAxisGroup.selectAll('text').style(prop, value.toString());
          }
        });
      }
    }

    // Add X-axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .style('color', '#718096')
      .style('font-size', '0.875rem')
      .call(xAxis);

    xAxisGroup.selectAll('path').style('display', 'none');
    xAxisGroup.selectAll('line').style('display', 'none');

    // Rotate x-axis labels if needed (responsive behavior)
    if (chartWidth < 600) {
      xAxisGroup
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
    }

    // Create bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', chartHeight) // Start from bottom for animation
      .attr('height', 0) // Start with 0 height for animation
      .attr('rx', cornerRadius || 5)
      .attr('ry', cornerRadius || 5)
      .style('fill', (d) => {
        if (d.color) return d.color;
        if (colors?.gradient) return 'url(#barGradient)';
        if (colors?.solid) return colors.solid;
        return '#8B5CF6'; // Default color
      })
      .style('cursor', onBarClick ? 'pointer' : 'default');

    // Add animation
    if (animate) {
      bars
        .transition()
        .duration(800)
        .ease(d3.easeBackOut.overshoot(1.1))
        .attr('y', d => yScale(d.value))
        .attr('height', d => chartHeight - yScale(d.value));
    } else {
      bars
        .attr('y', d => yScale(d.value))
        .attr('height', d => chartHeight - yScale(d.value));
    }

    // Add event listeners
    if (onBarClick || onBarHover || showTooltip) {
      bars
        .on('click', (event, d) => {
          if (onBarClick) {
            const index = data.indexOf(d);
            onBarClick(d, index);
          }
        })
        .on('mouseover', (event, d) => {
          if (onBarHover) {
            const index = data.indexOf(d);
            onBarHover(d, index);
          }
          
          if (showTooltip && tooltipRef.current && containerRef.current) {
            const tooltip = d3.select(tooltipRef.current);
            const containerRect = containerRef.current.getBoundingClientRect();
            const barRect = (event.currentTarget as Element).getBoundingClientRect();
            
            // Calculate position relative to the container
            const left = barRect.left - containerRect.left + (barRect.width / 2);
            const top = barRect.top - containerRect.top - 15; // More space above bar
            
            tooltip
              .style('opacity', 1)
              .style('left', `${left}px`)
              .style('top', `${top}px`)
              .style('transform', 'translateX(-50%)') // Center the tooltip horizontally
              .html(`
                <div class="font-semibold text-white">${d.category}</div>
                <div class="text-sm text-gray-200 mt-1">${formatValue ? formatValue(d.value) : d.value.toString()}</div>
              `);
          }

          // Highlight effect
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .style('opacity', 0.8)
            .style('filter', 'brightness(1.1)');
        })
        .on('mouseout', (event) => {
          if (showTooltip && tooltipRef.current) {
            d3.select(tooltipRef.current).style('opacity', 0);
          }

          // Remove highlight effect
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('filter', 'brightness(1)');
        })
        .on('mousemove', (event, d) => {
          // Update tooltip position on mouse move for better tracking
          if (showTooltip && tooltipRef.current && containerRef.current) {
            const tooltip = d3.select(tooltipRef.current);
            const containerRect = containerRef.current.getBoundingClientRect();
            const mouseX = event.clientX - containerRect.left;
            const mouseY = event.clientY - containerRect.top;
            
            tooltip
              .style('left', `${mouseX}px`)
              .style('top', `${mouseY - 15}px`) // More space above cursor
              .style('transform', 'translateX(-50%)');
          }
        });
    }

  }, [isMounted, data, dimensions, margin, colors, showGrid, animate, formatValue, onBarClick, onBarHover, showTooltip, cornerRadius, barPadding, tickCount, showYAxis, showYAxisLine, showYAxisTicks, yAxisStyle, yAxisClassName, yAxisLabelStyle, yAxisLabelClassName]);

  // Render legend component
  const renderLegend = () => {
    if (!showLegend || !data || data.length === 0) return null;

    const legendItems = data.map((item, index) => (
      <div
        key={item.category}
        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onBarClick?.(item, index)}
        onMouseEnter={() => onBarHover?.(item, index)}
      >
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: item.color || (colors?.gradient ? 'url(#barGradient)' : colors?.solid || '#8B5CF6') }}
        />
        <span className="text-sm font-medium text-gray-700">{item.category}</span>
        <span className="text-xs text-gray-500">({formatValue ? formatValue(item.value) : item.value.toString()})</span>
      </div>
    ));

    const legendClasses = {
      top: 'flex flex-wrap justify-center gap-4 mb-4',
      bottom: 'flex flex-wrap justify-center gap-4 mt-4',
      left: 'flex flex-col space-y-2 mr-4',
      right: 'flex flex-col space-y-2 ml-4'
    };

    return (
      <div
        className={`${legendClasses[legendPosition]} ${legendClassName || ''}`}
        style={legendStyle}
      >
        {legendTitle && (
          <div className="w-full text-center mb-2">
            <span className="text-sm font-semibold text-gray-600">{legendTitle}</span>
          </div>
        )}
        {legendItems}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-white p-6 rounded-xl ${className || ''}`}
      style={style}
    >
      {title && (
        <h2 
          className={`text-xl font-semibold text-[#18044E] mb-6 ${titleClassName || ''}`}
          style={titleStyle}
        >
          {title}
        </h2>
      )}
      
      {/* Render legend at top if specified */}
      {showLegend && legendPosition === 'top' && renderLegend()}
      
      <div className="relative">
        <svg ref={svgRef} className="w-full h-auto" />
        
        {showTooltip && (
          <div
            ref={tooltipRef}
            className={`absolute pointer-events-none bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl px-4 py-3 shadow-2xl opacity-0 transition-all duration-300 z-50 whitespace-nowrap border border-gray-600 ${tooltipClassName || ''}`}
            style={{ 
              fontSize: '0.9rem',
              minWidth: '120px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              ...tooltipStyle
            }}
          >
            {tooltipContent ? (
              tooltipContent(data[0]) // Pass data for custom content
            ) : (
              <>
                <div className="font-semibold text-white">{data[0]?.category}</div>
                <div className="text-sm text-gray-200 mt-1">{formatValue ? formatValue(data[0]?.value || 0) : (data[0]?.value || 0).toString()}</div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Render legend at bottom if specified */}
      {showLegend && legendPosition === 'bottom' && renderLegend()}
    </div>
  );
};

export default BarChart;

// Sample data for charts with custom colors
export const categoryData = [
  { category: "Business", value: 100, color: "#8959A9" },
  { category: "IT", value: 22, color: "#896D9C" },
  { category: "Finance", value: 65, color: "#D8B4FE" },
  { category: "Shopping", value: 35, color: "#DDC8F2" },
  { category: "Government", value: 22, color: "#B19EBD" },
  { category: "Search", value: 15, color: "#E2DBE6" },
];

// Example usage component
export const BarChartExample: React.FC = () => {
  const sampleData: BarChartData[] = [
    { category: 'Business', value: 100000, color: '#581C87' },
    { category: 'IT', value: 20000, color: '#7E22CE' },
    { category: 'Finance', value: 80000, color: '#A855F7' },
    { category: 'Shopping', value: 35000, color: '#C084FC' },
    { category: 'Government', value: 20000, color: '#D8B4FE' },
    { category: 'Search', value: 12000, color: '#F3E8FF' }
  ];

  const handleBarClick = (data: BarChartData, index: number) => {
    console.log('Bar clicked:', data, index);
  };

  const handleBarHover = (data: BarChartData, index: number) => {
    console.log('Bar hovered:', data, index);
  };

  return (
    <div className="p-4">
      <BarChart
        data={sampleData}
        title="Top Site Categories"
        onBarClick={handleBarClick}
        onBarHover={handleBarHover}
        responsive={true}
        animate={true}
        showTooltip={true}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

