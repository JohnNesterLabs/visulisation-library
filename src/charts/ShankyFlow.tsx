"use client"

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

export interface Flow {
  source: string;
  sourceValue: number;
  target: string;
  targetValue: number;
  thickness: number;
}

// Add new interface for responsive configuration
export interface ResponsiveBreakpoint {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  fontSize: { title: number; subtitle: number; label: number; value: number };
  nodeHeight: number;
  flowScaleFactor: number;
}

export interface ResponsiveConfig {
  desktop: ResponsiveBreakpoint;
  tablet: ResponsiveBreakpoint;
  mobile: ResponsiveBreakpoint;
}

interface ShankyFlowProps {
  flows: Flow[];
  hoverColor?: string;
  title?: string;
  subtitle?: string;
  showHeaders?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showDebug?: boolean;
  sourceHeader?: string;
  targetHeader?: string;
  labelColor?: string;
  valueColor?: string;
  headerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  headerUnderlineColor?: string;
  flowOpacity?: number;
  hoverOpacity?: number;
  curvature?: number;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  tooltipRenderer?: (flow: Flow) => string;
  gradientStops?: Array<{ offset: number | string; color: string; opacity?: number }>;
  responsive?: boolean;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  nodeHeight?: number;
  flowScaleFactor?: number;
  fontSize?: { title: number; subtitle: number; label: number; value: number };
  // Add new props for responsive configuration
  responsiveConfig?: ResponsiveConfig;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Default responsive configuration (can be overridden via props)
const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  desktop: {
    width: 900,
    height: 650,
    margin: { top: 120, right: 180, bottom: 60, left: 180 },
    fontSize: { title: 26, subtitle: 14, label: 14, value: 16 },
    nodeHeight: 45,
    flowScaleFactor: 0.35
  },
  tablet: {
    width: 700,
    height: 550,
    margin: { top: 100, right: 140, bottom: 50, left: 140 },
    fontSize: { title: 22, subtitle: 14, label: 14, value: 18 },
    nodeHeight: 40,
    flowScaleFactor: 0.3
  },
  mobile: {
    width: 350,
    height: 400,
    margin: { top: 80, right: 80, bottom: 40, left: 80 },
    fontSize: { title: 16, subtitle: 12, label: 11, value: 14 },
    nodeHeight: 30,
    flowScaleFactor: 0.2
  }
};

// Default breakpoints (can be overridden via props)
const DEFAULT_BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1024
};

export const ShankyFlow: React.FC<ShankyFlowProps> = ({ 
  flows = [], 
  hoverColor = "#FF6B6B",
  title = "Clipboard Copy Source to Paste Diagram",
  subtitle = "Explore the user's Sensitive Data Copy Paste behavior, detection history, and risk exposure.",
  showHeaders = true,
  showTitle = true,
  showSubtitle = true,
  showDebug = false,
  sourceHeader = "Copying Sources",
  targetHeader = "Pasting Targets",
  labelColor = "#374151",
  valueColor = "#111827",
  headerColor = "#454545",
  titleColor = "#111827",
  subtitleColor = "#6B7280",
  headerUnderlineColor = "#D4C4FF",
  flowOpacity = 0.7,
  hoverOpacity = 0.9,
  curvature = 0.4,
  valueFormatter,
  labelFormatter,
  tooltipRenderer,
  gradientStops,
  responsive = true,
  width: widthOverride,
  height: heightOverride,
  margin: marginOverride,
  nodeHeight: nodeHeightOverride,
  flowScaleFactor: flowScaleFactorOverride,
  fontSize: fontSizeOverride,
  // Add new props with defaults
  responsiveConfig = DEFAULT_RESPONSIVE_CONFIG,
  breakpoints = DEFAULT_BREAKPOINTS
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [config, setConfig] = useState(responsiveConfig.desktop);
  const [isInitialized, setIsInitialized] = useState(false);

  // Responsive breakpoint detection with configurable breakpoints
  const getResponsiveConfig = useCallback(() => {
    if (typeof window === 'undefined') return responsiveConfig.desktop;
    
    const width = window.innerWidth;
    if (width < breakpoints.mobile) return responsiveConfig.mobile;
    if (width < breakpoints.tablet) return responsiveConfig.tablet;
    if (width >= breakpoints.desktop) return responsiveConfig.desktop;
    return responsiveConfig.desktop;
  }, [responsiveConfig, breakpoints]);

  // Update dimensions and config on resize
  useEffect(() => {
    const updateDimensions = () => {
      const baseConfig = getResponsiveConfig();
      const mergedConfig = {
        ...baseConfig,
        margin: marginOverride ?? baseConfig.margin,
        nodeHeight: nodeHeightOverride ?? baseConfig.nodeHeight,
        flowScaleFactor: flowScaleFactorOverride ?? baseConfig.flowScaleFactor,
        fontSize: fontSizeOverride ?? baseConfig.fontSize,
        width: widthOverride ?? baseConfig.width,
        height: heightOverride ?? baseConfig.height
      };
      setConfig(mergedConfig as ResponsiveBreakpoint);
      
      // Use viewport width instead of container width for more reliable sizing
      const viewportWidth = window.innerWidth;
      const availableWidth = viewportWidth - 128; // Account for container padding and margins
      
      let finalWidth = mergedConfig.width;
      
      if (responsive) {
        // For desktop, use full config width if viewport is large enough
        if (baseConfig === responsiveConfig.desktop) {
          if (availableWidth >= mergedConfig.width) {
            finalWidth = mergedConfig.width;
          } else {
            finalWidth = Math.max(availableWidth, 600); // Minimum width for desktop
          }
        } else {
          // For mobile/tablet, use available width but respect minimums
          finalWidth = Math.max(availableWidth, mergedConfig.width);
        }
      }
      
      setDimensions({
        width: finalWidth,
        height: mergedConfig.height
      });
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [getResponsiveConfig, isInitialized, responsive, widthOverride, heightOverride, marginOverride, nodeHeightOverride, flowScaleFactorOverride, fontSizeOverride, responsiveConfig]);

  useEffect(() => {
    if (!flows.length || !dimensions.width || !dimensions.height || !isInitialized) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const { margin, fontSize, nodeHeight, flowScaleFactor } = config;

    // Calculate node positions more precisely like the Figma design
    const sourceNodes = new Map();
    const targetNodes = new Map();
    const sourceFlows = new Map();
    const targetFlows = new Map();

    // Group flows by source and target
    flows.forEach((flow: Flow) => {
      if (!sourceFlows.has(flow.source)) {
        sourceFlows.set(flow.source, []);
      }
      sourceFlows.get(flow.source).push(flow);

      if (!targetFlows.has(flow.target)) {
        targetFlows.set(flow.target, []);
      }
      targetFlows.get(flow.target).push(flow);

      sourceNodes.set(flow.source, flow.sourceValue);
      targetNodes.set(flow.target, flow.targetValue);
    });

    // Use consistent spacing instead of proportional spacing
    const sources = Array.from(sourceNodes.entries());
    const targets = Array.from(targetNodes.entries());
    
    const availableHeight = height - margin.top - margin.bottom;
    const sourceSpacing = availableHeight / (sources.length + 1);
    const targetSpacing = availableHeight / (targets.length + 1);

    // Calculate positions with consistent spacing
    const sourcePositions = sources.map(([name, value], index) => ({
      name,
      value,
      y: margin.top + sourceSpacing * (index + 1),
      height: nodeHeight
    }));

    const targetPositions = targets.map(([name, value], index) => ({
      name,
      value,
      y: margin.top + targetSpacing * (index + 1),
      height: nodeHeight
    }));

    const sourceX = margin.left;
    const targetX = width - margin.right;

    svg.attr("width", width).attr("height", height);

    // Create gradient definitions with more vibrant colors matching Figma
    const defs = svg.append("defs");

    flows.forEach((flow: Flow, i) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", sourceX + 80)
        .attr("x2", targetX - 80);
      const stops = gradientStops && gradientStops.length > 0 ? gradientStops : [
        { offset: "0%", color: "#8B5CF6", opacity: 0.8 },
        { offset: "50%", color: "#3B82F6", opacity: 0.7 },
        { offset: "100%", color: "#06B6D4", opacity: 0.8 }
      ];
      stops.forEach(s => {
        gradient
          .append("stop")
          .attr("offset", typeof s.offset === 'number' ? `${s.offset}%` : s.offset)
          .attr("stop-color", s.color)
          .attr("stop-opacity", s.opacity ?? 0.8);
      });
    });

    // Create tooltip
    let tooltip = d3.select("body").select(".sankey-tooltip") as unknown as d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    if ((tooltip as any).empty()) {
      tooltip = d3.select("body")
        .append("div")
        .attr("class", "sankey-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "12px 16px")
        .style("border-radius", "8px")
        .style("font-size", "13px")
        .style("font-family", "system-ui, sans-serif")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
        .style("max-width", "250px") as unknown as d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    }

    // Calculate flow positions for each source node with reduced width
    // Flow height should be based on target value for consistency
    const sourceFlowPositions = new Map();
    sourcePositions.forEach(source => {
      const flows = sourceFlows.get(source.name) || [];
      let currentY = source.y - source.height / 2;
      sourceFlowPositions.set(source.name, new Map());
      
      flows.forEach((flow: Flow) => {
        // Find the target node to get its value for consistent flow height
        const targetNode = targetPositions.find(t => t.name === flow.target);
        if (!targetNode) return; // Skip if target node not found
        
        const targetValue = targetNode.value;
        
        // Use target value for flow height calculation with consistent base height
        // This ensures flows are proportional to their target values
        const baseHeight = nodeHeight; // Use consistent base height
        const flowHeight = (flow.thickness / targetValue) * baseHeight * flowScaleFactor;
        if (showDebug) {
          // eslint-disable-next-line no-console
          console.log(flowHeight, baseHeight, flow.thickness, targetValue, "sankey-debug");
        }
        sourceFlowPositions.get(source.name).set(flow.target, {
          startY: currentY,
          endY: currentY + flowHeight,
          centerY: currentY + flowHeight / 2
        });
        currentY += flowHeight;
      });
    });

    // Calculate flow positions for each target node with reduced width
    const targetFlowPositions = new Map();
    targetPositions.forEach(target => {
      const flows = targetFlows.get(target.name) || [];
      let currentY = target.y - target.height / 2;
      targetFlowPositions.set(target.name, new Map());
      
      flows.forEach((flow: Flow) => {
        // Use consistent base height for target flow calculations too
        const baseHeight = nodeHeight;
        const flowHeight = (flow.thickness / target.value) * baseHeight * flowScaleFactor;
        targetFlowPositions.get(target.name).set(flow.source, {
          startY: currentY,
          endY: currentY + flowHeight,
          centerY: currentY + flowHeight / 2
        });
        currentY += flowHeight;
      });
    });

    // Draw flow paths with proper Sankey curves
    flows.forEach((flow: Flow, i) => {
      const sourceNode = sourcePositions.find(s => s.name === flow.source);
      const targetNode = targetPositions.find(t => t.name === flow.target);
      
      if (sourceNode && targetNode) {
        const sourcePos = sourceFlowPositions.get(flow.source).get(flow.target);
        const targetPos = targetFlowPositions.get(flow.target).get(flow.source);
        
        const sourceStartY = sourcePos.startY;
        const sourceEndY = sourcePos.endY;
        const targetStartY = targetPos.startY;
        const targetEndY = targetPos.endY;
        
        const curve = curvature;
        const xi = d3.interpolateNumber(sourceX, targetX);
        const x2 = xi(curve);
        const x3 = xi(1 - curve);
        
        // Create the path for the flow band
        const path = `M${sourceX},${sourceStartY}
                      C${x2},${sourceStartY} ${x3},${targetStartY} ${targetX},${targetStartY}
                      L${targetX},${targetEndY}
                      C${x3},${targetEndY} ${x2},${sourceEndY} ${sourceX},${sourceEndY}
                      Z`;

        svg
          .append("path")
          .attr("d", path)
          .attr("fill", `url(#gradient-${i})`)
          .attr("opacity", flowOpacity)
          .style("cursor", "pointer")
          .on("mouseover", function(event) {
            d3.select(this)
              .attr("fill", hoverColor)
              .attr("opacity", hoverOpacity);

            if (typeof tooltipRenderer === 'function') {
              (tooltip as any)
                .style("opacity", 1)
                .html(tooltipRenderer(flow));
            } else {
              (tooltip as any)
                .style("opacity", 1)
                .html(`
                <div style=\"font-weight: 600; margin-bottom: 8px;\">Flow Details</div>
                <div><strong>From:</strong> ${flow.source}</div>
                <div><strong>To:</strong> ${flow.target}</div>
                <div><strong>Value:</strong> ${flow.thickness}</div>
                <div><strong>Source Total:</strong> ${flow.sourceValue}</div>
                <div><strong>Target Total:</strong> ${flow.targetValue}</div>
              `);
            }
          })
          .on("mousemove", function(event) {
            (tooltip as any)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("fill", `url(#gradient-${i})`)
              .attr("opacity", flowOpacity);

            (tooltip as any).style("opacity", 0);
          });
      }
    });

    // Add column headers - aligned with node labels with dynamic underlines
    if (showHeaders) {
      const sourceHeaderText = svg
        .append("text")
        .attr("x", sourceX - 15)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "end")
        .attr("fill", headerColor)
        .attr("font-size", `${fontSize.label}px`)
        .attr("font-weight", "600")
        .attr("font-family", "system-ui, sans-serif")
        .text(sourceHeader);

      // Get the bounding box of the source header text for dynamic underline
      const sourceHeaderNode = sourceHeaderText.node();
      if (sourceHeaderNode) {
        const sourceBBox = sourceHeaderNode.getBBox();
        svg
          .append("line")
          .attr("x1", sourceBBox.x)
          .attr("y1", margin.top)
          .attr("x2", sourceBBox.x + sourceBBox.width)
          .attr("y2", margin.top)
          .attr("stroke", headerUnderlineColor)
          .attr("stroke-width", "1")
          .attr("opacity", "1");
      }

      const targetHeaderText = svg
        .append("text")
        .attr("x", targetX + 15)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "start")
        .attr("fill", headerColor)
        .attr("font-size", `${fontSize.label}px`)
        .attr("font-weight", "600")
        .attr("font-family", "system-ui, sans-serif")
        .text(targetHeader);

      // Get the bounding box of the target header text for dynamic underline
      const targetHeaderNode = targetHeaderText.node();
      if (targetHeaderNode) {
        const targetBBox = targetHeaderNode.getBBox();
        svg
          .append("line")
          .attr("x1", targetBBox.x)
          .attr("y1", margin.top)
          .attr("x2", targetBBox.x + targetBBox.width)
          .attr("y2", margin.top)
          .attr("stroke", headerUnderlineColor)
          .attr("stroke-width", "1")
          .attr("opacity", "1");
      }
    }

    // Draw source nodes
    sourcePositions.forEach((source) => {
      // Website name
      svg
        .append("text")
        .attr("x", sourceX - 15)
        .attr("y", source.y - 8)
        .attr("text-anchor", "end")
        .attr("fill", labelColor)
        .attr("font-size", `${fontSize.label}px`)
        .attr("font-weight", "500")
        .attr("font-family", "system-ui, sans-serif")
        .text(labelFormatter ? labelFormatter(source.name) : source.name);

      // Value number
      svg
        .append("text")
        .attr("x", sourceX - 15)
        .attr("y", source.y + 12)
        .attr("text-anchor", "end")
        .attr("fill", valueColor)
        .attr("font-size", `${fontSize.value}px`)
        .attr("font-weight", "700")
        .attr("font-family", "system-ui, sans-serif")
        .text(valueFormatter ? valueFormatter(source.value) : source.value);
    });

    // Draw target nodes
    targetPositions.forEach((target) => {
      // Website name
      svg
        .append("text")
        .attr("x", targetX + 15)
        .attr("y", target.y - 8)
        .attr("text-anchor", "start")
        .attr("fill", labelColor)
        .attr("font-size", `${fontSize.label}px`)
        .attr("font-weight", "500")
        .attr("font-family", "system-ui, sans-serif")
        .text(labelFormatter ? labelFormatter(target.name) : target.name);

      // Value number
      svg
        .append("text")
        .attr("x", targetX + 15)
        .attr("y", target.y + 12)
        .attr("text-anchor", "start")
        .attr("fill", valueColor)
        .attr("font-size", `${fontSize.value}px`)
        .attr("font-weight", "700")
        .attr("font-family", "system-ui, sans-serif")
        .text(valueFormatter ? valueFormatter(target.value) : target.value);
    });

    // Add title and subtitle
    if (showTitle) {
      svg
        .append("text")
        .attr("x", 40)
        .attr("y", 35)
        .attr("text-anchor", "start")
        .attr("fill", titleColor)
        .attr("font-size", `${fontSize.title}px`)
        .attr("font-weight", "600")
        .attr("font-family", "system-ui, sans-serif")
        .text(title);
    }

    if (showSubtitle) {
      svg
        .append("text")
        .attr("x", 40)
        .attr("y", 60)
        .attr("text-anchor", "start")
        .attr("fill", subtitleColor)
        .attr("font-size", `${fontSize.subtitle}px`)
        .attr("font-weight", "400")
        .attr("font-family", "system-ui, sans-serif")
        .text(subtitle);
    }

    return () => {
      d3.select("body").selectAll(".sankey-tooltip").remove();
    };

  }, [flows, hoverColor, title, subtitle, dimensions, config, gradientStops, labelColor, valueColor, headerColor, titleColor, subtitleColor, headerUnderlineColor, flowOpacity, hoverOpacity, curvature, valueFormatter, labelFormatter, tooltipRenderer, showHeaders, showTitle, showSubtitle, showDebug]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
        {showDebug && (
          <div className="text-xs text-gray-500 mb-2">
            Screen: {typeof window !== 'undefined' ? window.innerWidth : 'SSR'}px | 
            Config: {config === responsiveConfig.desktop ? 'Desktop' : config === responsiveConfig.tablet ? 'Tablet' : 'Mobile'} | 
            Chart: {dimensions.width}x{dimensions.height} | 
            Available: {typeof window !== 'undefined' ? window.innerWidth - 128 : 'SSR'}px |
            Initialized: {isInitialized ? 'Yes' : 'No'}
            <button 
              onClick={() => {
                const newConfig = getResponsiveConfig();
                setConfig(newConfig);
                const viewportWidth = window.innerWidth;
                const availableWidth = viewportWidth - 128;
                let finalWidth = newConfig.width;
                if (newConfig === responsiveConfig.desktop) {
                  if (availableWidth >= newConfig.width) {
                    finalWidth = newConfig.width;
                  } else {
                    finalWidth = Math.max(availableWidth, 600);
                  }
                } else {
                  finalWidth = Math.max(availableWidth, newConfig.width);
                }
                setDimensions({
                  width: finalWidth,
                  height: newConfig.height
                });
              }}
              className="ml-4 px-2 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Refresh
            </button>
          </div>
        )}
        <div ref={containerRef} className="w-full overflow-x-auto">
          <div className="flex justify-center min-w-max">
            <svg 
              ref={svgRef} 
              style={{ 
                width: dimensions.width || config.width, 
                height: dimensions.height || config.height,
                minWidth: config.width,
                minHeight: config.height
              }}
            ></svg>
          </div>
        </div>
      </div>
    </div>
  );
};
