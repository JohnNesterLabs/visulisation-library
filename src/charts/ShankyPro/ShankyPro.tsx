// SankeyChart.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./SankeyChart.module.css";

// Dynamic positioning configuration
const POSITION_CONFIG = {
  // Main flows configuration
  main: {
    source: {
      x: 430,
      y: 320,
      width: 300
    },
    target: {
      x: 833,
      baseY: 236,
      width: 10,
      spacing: 28 // Space between target nodes
    }
  },
  // Source flows configuration
  source: {
    source: {
      x: 75,
      baseY: 50,
      width: 40,
      spacing: 50 // Space between source nodes
    },
    target: {
      x: 430,
      baseY: 185,
      width: 28,
      spacing: 31 // Space between target nodes (calculated from current positions)
    }
  }
};

// Special configuration for specific flows that need custom positioning
const SPECIAL_FLOW_CONFIG = {
  flow5: {
    target: {
      x: 833,
      y: 384, // Original position for flow5
      width: 5
    }
  }
};

// Type definitions
interface FlowPosition {
  x: number;
  y: number;
  width: number;
}

interface FlowConfig {
  source: FlowPosition;
  target: FlowPosition & { spacing?: number; baseY?: number };
}

interface FlowData {
  id: string;
  type: string;
  sourceLabel?: string;
  sourceValue?: number;
  color?: string;
  gradientColors?: {
    start: string;
    end: string;
  };
}

// Function to calculate dynamic width based on sourceValue
const calculateDynamicWidth = (sourceValue: number, baseWidth: number = 40): number => {
  if (sourceValue === 0) {
    return 0; // No width for zero sourceValue
  } else if (sourceValue >= 10000) {
    return baseWidth / 1; // Divide by 1 (no change)
  } else if (sourceValue > 5000) {
    return baseWidth / 2; // Divide by 2
  } else if (sourceValue < 5000) {
    return baseWidth / 3; // Divide by 3
  } else {
    return baseWidth; // Default width
  }
};

// Function to calculate dynamic positions for flows
const calculateFlowPositions = (
  flowType: string, 
  index: number, 
  totalFlows: number, 
  flowId: string, 
  flowData: FlowData
): { source: FlowPosition; target: FlowPosition } => {
  // This function is now handled by the responsive positioning in the component
  // Return default values for TypeScript compatibility
  return {
    source: { x: 0, y: 0, width: 0 },
    target: { x: 0, y: 0, width: 0 }
  };
};

// Flow definitions without hardcoded positions
const flowDefinitions = [
  // Source to middleware flows (main flows)
  {
    id: "flow1",
    type: "main",
    color: "#7E22CE", // Critical - Dark purple (from expected design)
    gradientColors: {
      start: "#EEEBFF",
      end: "#7E22CE"
    }
  },
  {
    id: "flow2",
    type: "main",
    color: "#7C3AED", // High - Medium purple (from expected design)
    gradientColors: {
      start: "#EEEBFF",
      end: "#7C3AED"
    }
  },
  {
    id: "flow3",
    type: "main",
    color: "#A78BFA", // Medium - Light purple (from expected design)
    gradientColors: {
      start: "#EEEBFF", // Light purple from expected design
      end: "#7E22CE"    // Dark purple from expected design
    }
  },
  {
    id: "flow4",
    type: "main",
    color: "#DDD6FE", // Low - Very light purple (from expected design)
    gradientColors: {
      start: "#EEEBFF",
      end: "#DDD6FE"
    }
  },
  {
    id: "flow5",
    type: "main",
    color: "#F3F4F6", // Informational - Lightest purple (from expected design)
    gradientColors: {
      start: "#EEEBFF",
      end: "#F3F4F6"
    }
  },
  // Source flows (left side flows)
  {
    id: "sourceFlow1",
    type: "source",
    sourceLabel: "Malware Download",
    sourceValue: 15000, // > 10000, width = 40/1 = 40
    color: "#8B5FBF",
    gradientColors: {
      start: "#EEEBFF", // Light purple from image
      end: "#7E22CE"    // Dark purple from image
    }
  },
  {
    id: "sourceFlow2",
    type: "source",
    sourceLabel: "Risky Site Visits",
    sourceValue: 8000, // > 5000, width = 40/2 = 20
    color: "#A78BFA",
    gradientColors: {
      start: "#EEEBFF",
      end: "#7E22CE"
    }
  },
  {
    id: "sourceFlow3",
    type: "source",
    sourceLabel: "Content Tampering",
    sourceValue: 500, // > 100, width = 40/3 = 13.33
    color: "#A78BFA",
  },
  {
    id: "sourceFlow4",
    type: "source",
    sourceLabel: "Sensitive Copy",
    sourceValue: 0, // = 0, width = 0 (invisible)
    color: "#A78BFA",
  },
  {
    id: "sourceFlow5",
    type: "source",
    sourceLabel: "Malicious Paste",
    sourceValue: 10000,
    color: "#A78BFA",
  },
  {
    id: "sourceFlow6",
    type: "source",
    sourceLabel: "Identity Spoofing",
    sourceValue: 10000,
    color: "#8B5FBF",
  },
  {
    id: "sourceFlow7",
    type: "source",
    sourceLabel: "Unverified Device",
    sourceValue: 10000,
    color: "#A78BFA",
  },
  {
    id: "sourceFlow8",
    type: "source",
    sourceLabel: "Confidential Print",
    sourceValue: 10000,
    color: "#A78BFA",
  },
  {
    id: "sourceFlow9",
    type: "source",
    sourceLabel: "Gen AI Visit",
    sourceValue: 10000,
    color: "#A78BFA",
  },
  {
    id: "sourceFlow10",
    type: "source",
    sourceLabel: "Sensitive Data Copy",
    sourceValue: 10000,
    color: "#A78BFA",
  },
  {
    id: "sourceFlow11",
    type: "source",
    sourceLabel: "Credential Theft",
    sourceValue: 10000,
    color: "#A78BFA",
  },
  {
    id: "sourceFlow12",
    type: "source",
    sourceLabel: "Unapproved Login",
    sourceValue: 10000,
    color: "#A78BFA",
  },
];

// Function to generate flows with dynamic positions
const generateFlowsWithPositions = () => {
  const mainFlows = flowDefinitions.filter(flow => flow.type === 'main');
  const sourceFlows = flowDefinitions.filter(flow => flow.type === 'source');
  
  const flowsWithPositions: any[] = [];
  
  // Generate main flows with positions
  mainFlows.forEach((flow, index) => {
    const positions = calculateFlowPositions('main', index, mainFlows.length, flow.id, flow);
    if (positions) {
      flowsWithPositions.push({
        ...flow,
        source: positions.source,
        target: positions.target
      });
    }
  });
  
  // Generate source flows with positions
  sourceFlows.forEach((flow, index) => {
    const positions = calculateFlowPositions('source', index, sourceFlows.length, flow.id, flow);
    if (positions) {
      flowsWithPositions.push({
        ...flow,
        source: positions.source,
        target: positions.target
      });
    }
  });
  
  return flowsWithPositions;
};

// Generate the flows array with dynamic positions
const allFlows = generateFlowsWithPositions();

interface CustomSankeyProps {
  flows: FlowData[];
  curvature?: number;
  windowSize?: { width: number; height: number };
}

export const CustomSankey = ({ flows, curvature = 0.5, windowSize = { width: 0, height: 0 } }: CustomSankeyProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined' || !flows || !Array.isArray(flows) || flows.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Responsive dimensions - only calculate on client side
    const getResponsiveDimensions = () => {
      // Default to desktop dimensions if window is not available (SSR)
      if (typeof window === 'undefined') {
        return {
          width: 1100,
          height: 650,
          viewBox: "-30 0 1100 700",
          scale: 1,
          fontSize: 14,
          cardWidth: 259,
          cardHeight: 100
        };
      }

      const screenWidth = window.innerWidth;
      
      if (screenWidth <= 768) {
        // Mobile
        return {
          width: Math.min(screenWidth - 40, 400),
          height: 500,
          viewBox: "-20 0 400 500",
          scale: 0.4,
          fontSize: 10,
          cardWidth: 200,
          cardHeight: 80
        };
      } else if (screenWidth <= 1024) {
        // Tablet
        return {
          width: Math.min(screenWidth - 60, 800),
          height: 600,
          viewBox: "-25 0 800 600",
          scale: 0.7,
          fontSize: 12,
          cardWidth: 220,
          cardHeight: 90
        };
      } else {
        // Desktop
        return {
          width: 1100,
          height: 650,
          viewBox: "-30 0 1100 700",
          scale: 1,
          fontSize: 14,
          cardWidth: 259,
          cardHeight: 115
        };
      }
    };

    const dimensions = getResponsiveDimensions();
    const { width, height, viewBox, scale, fontSize, cardWidth, cardHeight } = dimensions;
    const nodeWidth = 5 * scale;

    svg.attr("width", width).attr("height", height).attr("viewBox", viewBox);

    // Responsive positioning configuration - only calculate on client side
    const getResponsivePositionConfig = () => {
      // Default to desktop positioning if window is not available (SSR)
      if (typeof window === 'undefined') {
        return {
          main: {
            source: { x: 430, y: 320, width: 300 },
            target: { x: 833, y: 236, width: 10, spacing: 28 }
          },
          source: {
            source: { x: 75, y: 50, width: 40, spacing: 50 },
            target: { x: 430, y: 185, width: 28, spacing: 31 }
          }
        };
      }

      const screenWidth = window.innerWidth;
      
      if (screenWidth <= 768) {
        // Mobile positioning
        return {
          main: {
            source: { x: 120, y: 160, width: 150 },
            target: { x: 300, y: 118, width: 5, spacing: 14 }
          },
          source: {
            source: { x: 30, y: 25, width: 20, spacing: 25 },
            target: { x: 120, y: 92, width: 14, spacing: 15 }
          }
        };
      } else if (screenWidth <= 1024) {
        // Tablet positioning
        return {
          main: {
            source: { x: 215, y: 224, width: 210 },
            target: { x: 583, y: 165, width: 7, spacing: 20 }
          },
          source: {
            source: { x: 52, y: 35, width: 28, spacing: 35 },
            target: { x: 215, y: 129, width: 20, spacing: 22 }
          }
        };
      } else {
        // Desktop positioning (original)
        return {
          main: {
            source: { x: 430, y: 320, width: 300 },
            target: { x: 833, y: 236, width: 10, spacing: 28 }
          },
          source: {
            source: { x: 75, y: 50, width: 40, spacing: 50 },
            target: { x: 430, y: 185, width: 28, spacing: 31 }
          }
        };
      }
    };

    const responsiveConfig = getResponsivePositionConfig();

    // Responsive special flow configuration - similar to getResponsivePositionConfig
    const getResponsiveSpecialFlowConfig = () => {
      // Default to desktop positioning if window is not available (SSR)
      if (typeof window === 'undefined') {
        return {
          flow5: {
            target: {
              x: 833,
              y: 384,
              width: 5
            }
          }
        };
      }

      const screenWidth = window.innerWidth;
      
      if (screenWidth <= 768) {
        // Mobile positioning for special flows
        return {
          flow5: {
            target: {
              x: 280,
              y: 200,
              width: 3
            }
          }
        };
      } else if (screenWidth <= 1024) {
        // Tablet positioning for special flows
        return {
          flow5: {
            target: {
              x: 600,
              y: 280,
              width: 4
            }
          }
        };
      } else {
        // Desktop positioning for special flows (original)
        return {
          flow5: {
            target: {
              x: 833,
              y: 384,
              width: 5
            }
          }
        };
      }
    };

    const responsiveSpecialConfig = getResponsiveSpecialFlowConfig();

    // Add shadow filter definition
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "cardShadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 4)
      .attr("stdDeviation", 20)
      .attr("flood-color", "#7090B0")
      .attr("flood-opacity", 0.12);

    // Create tooltip div - check if it already exists to avoid duplicates
    let tooltip: any = d3.select("body").select(`.${styles.tooltip}`);
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("class", styles.tooltip)
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
    }

    // Filter flows by type and apply responsive positioning
    const mainFlows = flows.filter(flow => flow.type === "main").map((flow, index) => {
      // Check if this flow has special configuration first (like flow5) - now responsive
      const specialConfig = (responsiveSpecialConfig as any)[flow.id];
      
      if (specialConfig) {
        // Use special configuration for this flow (e.g., flow5) - now responsive
        return {
          ...flow,
          source: {
            x: responsiveConfig.main.source.x,
            y: responsiveConfig.main.source.y,
            width: responsiveConfig.main.source.width
          },
          target: specialConfig.target
        };
      } else {
        // Use responsive positioning for other flows
        const config = responsiveConfig.main;
        return {
          ...flow,
          source: {
            x: config.source.x,
            y: config.source.y,
            width: config.source.width
          },
          target: {
            x: config.target.x,
            y: config.target.y + (index * config.target.spacing),
            width: config.target.width
          }
        };
      }
    });

    const sourceFlows = flows.filter(flow => flow.type === "source").map((flow, index) => {
      const config = responsiveConfig.source;
      
      // Get target positions based on screen width, default to desktop if window not available
      const getTargetYPositions = () => {
        if (typeof window === 'undefined') {
          return [185, 216, 280, 248, 310, 340, 370, 400, 216, 430, 280, 460];
        }
        
        const screenWidth = window.innerWidth;
        if (screenWidth <= 768) {
          return [92, 107, 122, 137, 152, 167, 182, 197, 107, 212, 122, 227];
        } else if (screenWidth <= 1024) {
          return [129, 151, 173, 195, 217, 239, 261, 283, 151, 305, 173, 327];
        } else {
          return [185, 216, 280, 248, 310, 340, 370, 400, 216, 430, 280, 460];
        }
      };
      
      const targetYPositions = getTargetYPositions();
      const dynamicSourceWidth = calculateDynamicWidth(flow.sourceValue || 0, config.source.width);
      const dynamicTargetWidth = calculateDynamicWidth(flow.sourceValue || 0, config.target.width);
      
      return {
        ...flow,
        source: {
          x: config.source.x,
          y: config.source.y + (index * config.source.spacing),
          width: dynamicSourceWidth
        },
        target: {
          x: config.target.x,
          y: targetYPositions[index] || (config.target.y + (index * config.target.spacing)),
          width: dynamicTargetWidth
        }
      };
    });

    // Create gradient definitions for main flows - using custom gradient colors
    mainFlows.forEach((flow) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${flow.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      // Use custom gradient colors if available, otherwise fallback to single color
      const startColor = flow.gradientColors?.start || flow.color || "#b6abff";
      const endColor = flow.gradientColors?.end || flow.color || "#b6abff";

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#b6abff")
        .attr("stop-opacity", 1.0); // Full opacity for better visibility

      gradient
        .append("stop")
        .attr("offset", "40%")
        .attr("stop-color", "#b6abff") // Blue continues to 80%
        .attr("stop-opacity", 1.8);

      gradient
        .append("stop")
        .attr("offset", "45%")
        .attr("stop-color", "#b6abff") // Blue continues to 80%
        .attr("stop-opacity", 1.0);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor)
        .attr("stop-opacity", 1.0); // Slightly reduced opacity for gradient effect
    });

    // Create gradient definitions for source flows - using blue to red gradient
    sourceFlows.forEach((flow) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `source-gradient-${flow.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      // Blue to red gradient: 80% blue, 20% skyblue
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#EEEBFF") // Blue
        .attr("stop-opacity", 1.0);

      gradient
        .append("stop")
        .attr("offset", "80%")
        .attr("stop-color", "#EEEBFF") // Blue continues to 60%
        .attr("stop-opacity", 1.0);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#BEE4FF") // skyblue from 80% to 100%
        .attr("stop-opacity", 1.0);
    });

    // Create the path for the top and bottom edges
    const createFlowPath = (flow: any) => {
      if (!flow || !flow.source || !flow.target) {
        return '';
      }
      
      const { source, target } = flow;
      const curveFactor = curvature;
      const dx = target.x - source.x;
      const controlX1 = source.x + dx * curveFactor;
      const controlX2 = target.x - dx * curveFactor;

      const topPath = `
        M ${source.x} ${source.y - source.width / 2}
        C ${controlX1} ${source.y - source.width / 2}, 
          ${controlX2} ${target.y - target.width / 2}, 
          ${target.x} ${target.y - target.width / 2}
      `;

      const bottomPath = `
        L ${target.x} ${target.y + target.width / 2}
        C ${controlX2} ${target.y + target.width / 2}, 
          ${controlX1} ${source.y + source.width / 2}, 
          ${source.x} ${source.y + source.width / 2}
        Z
      `;
      return topPath + bottomPath;
    };

    // Draw main flows with hover effects (reverse order so flow1 appears on top)
    mainFlows.slice().reverse().forEach((flow) => {
      if (!flow || !flow.source || !flow.target) return;
      
      svg
        .append("path")
        .attr("d", createFlowPath(flow))
        .attr("fill", `url(#gradient-${flow.id})`)
        .attr("stroke", "rgba(255, 255, 255, 0.1)") // Subtle white stroke for definition
        .attr("stroke-width", "0.5")
        .attr("class", styles["flow-path"])
        .attr("data-flow-id", flow.id)
        .style("opacity", 0.8) // Default opacity
        .on("mouseover", function (event, d) {
          const flowData = mainFlows.find((f) => f.id === flow.id);
          if (flowData) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip
              .html(
                `
              <strong>Flow ${flow.id}</strong><br/>
              Source: (${flowData.source.x}, ${flowData.source.y})<br/>
              Source Width: ${flowData.source.width}px<br/>
              Target: (${flowData.target.x}, ${flowData.target.y})<br/>
              Target Width: ${flowData.target.width}px<br/>
              Color: ${flowData.color}
            `
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px");

            // Lower opacity of all other flows
            svg.selectAll(`path[data-flow-id]`).style("opacity", 0.3);
            
            // Highlight the hovered flow and bring it to front
            d3.select(this)
              .style("opacity", 1.0)
              .style("stroke", "rgba(139, 95, 191, 1.0)") // Strong purple stroke
              .style("stroke-width", "2px")
              .raise(); // Bring to front
          }
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);

          // Restore all flows to normal opacity
          svg.selectAll(`path[data-flow-id]`).style("opacity", 0.8);
          
          // Remove highlight from this flow
          d3.select(this)
            .style("stroke", "rgba(255, 255, 255, 0.1)")
            .style("stroke-width", "0.5");
        });
    });

    // Draw source flows with hover effects (new design on the left)
    sourceFlows.forEach((flow) => {
      if (!flow || !flow.source || !flow.target) return;
      
      svg
        .append("path")
        .attr("d", createFlowPath(flow))
        .attr("fill", `url(#source-gradient-${flow.id})`)
        .attr("stroke", "rgba(255, 255, 255, 0.1)") // Subtle white stroke for definition
        .attr("stroke-width", "0.5")
        .attr("class", styles["flow-path"])
        .attr("data-flow-id", flow.id)
        .style("opacity", 0.6) // Reduced opacity for better intersection blending
        .style("mix-blend-mode", "multiply") // Add blending mode for intersection effects
        .on("mouseover", function (event, d) {
          const flowData = sourceFlows.find((f) => f.id === flow.id);

          if (flowData) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip
              .html(
                `
              <strong>${flowData.sourceLabel}</strong><br/>
              Value: ${flowData.sourceValue}<br/>
              Source: (${flowData.source.x}, ${flowData.source.y})<br/>
              Source Width: ${flowData.source.width}px<br/>
              Target: (${flowData.target.x}, ${flowData.target.y})<br/>
              Target Width: ${flowData.target.width}px
            `
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px");

            // Lower opacity of all other flows
            svg.selectAll(`path[data-flow-id]`).style("opacity", 0.3);
            
            // Highlight the hovered flow and bring it to front
            d3.select(this)
              .style("opacity", 1.0)
              .style("stroke", "rgba(139, 95, 191, 1.0)") // Strong purple stroke
              .style("stroke-width", "2px")
              .raise(); // Bring to front
          }
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);

          // Restore all flows to normal opacity
          svg.selectAll(`path[data-flow-id]`).style("opacity", 0.8);
          
          // Remove highlight from this flow
          d3.select(this)
            .style("stroke", "rgba(255, 255, 255, 0.1)")
            .style("stroke-width", "0.5");
        });
    });

    // Draw nodes and labels for main flows (reverse order to match flow drawing)
    mainFlows.slice().reverse().forEach((flow, i) => {
      if (!flow || !flow.source || !flow.target) return;
      
      // Source node and label
      // svg
      //   .append("rect")
      //   .attr("x", flow.source.x - nodeWidth / 2)
      //   .attr("y", flow.source.y - flow.source.width / 2)
      //   .attr("width", nodeWidth-5)
      //   .attr("height", flow.source.width)
      //   .attr("class", styles["node-rect"]);

      // Target node and label
      svg
        .append("rect")
        .attr("x", flow.target.x - nodeWidth / 2)
        .attr("y", flow.target.y - flow.target.width / 2)
        .attr("width", nodeWidth)
        .attr("height", flow.target.width)
        .attr("class", styles["node-rect"]);
    });

    // Target nodes and labels for source flows
    sourceFlows.forEach((flow, i) => {
      if (!flow || !flow.source || !flow.target) return;
      
      // Source label (left side) - responsive positioning
      const getLabelX = () => {
        if (typeof window === 'undefined') return 65; // Default to desktop
        const screenWidth = window.innerWidth;
        return screenWidth <= 768 ? 25 : screenWidth <= 1024 ? 45 : 65;
      };
      const labelX = getLabelX();
      svg
        .append("text")
        .attr("x", labelX)
        .attr("y", flow.source.y - 10)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", styles["source-label"])
        .style("font-size", `${fontSize}px`)
        .text(flow.sourceLabel || '');

      // Source value (left side, below the label) - responsive positioning
      svg
        .append("text")
        .attr("x", labelX)
        .attr("y", flow.source.y + 8)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", styles["source-value"])
        .style("font-size", `${fontSize - 2}px`)
        .text(flow.sourceValue !== undefined ? flow.sourceValue : '');

      // Target node
      svg
        .append("rect")
        .attr("x", flow.target.x - nodeWidth / 2)
        .attr("y", flow.target.y - flow.target.width / 2)
        .attr("width", nodeWidth-3)
        .attr("height", flow.target.width)
        .attr("class", styles["node-rect"]);
    });

    // Create cards on the right side - responsive design
    const getResponsiveCardConfig = () => {
      // Default to desktop card config if window is not available (SSR)
      if (typeof window === 'undefined') {
        return {
          cardX: 830,
          cardY1: 30,
          cardY2: 160,
          padding: { top: 24, right: 20, bottom: 24, left: 20 },
          gap: 16,
          fontSize: { title: 16, value: 24, subtitle: 14 }
        };
      }

      const screenWidth = window.innerWidth;
      
      if (screenWidth <= 768) {
        // Mobile cards
        return {
          cardX: 250,
          cardY1: 20,
          cardY2: 120,
          padding: { top: 12, right: 10, bottom: 12, left: 10 },
          gap: 8,
          fontSize: { title: 12, value: 16, subtitle: 10 }
        };
      } else if (screenWidth <= 1024) {
        // Tablet cards
        return {
          cardX: 600,
          cardY1: 25,
          cardY2: 140,
          padding: { top: 18, right: 15, bottom: 18, left: 15 },
          gap: 12,
          fontSize: { title: 14, value: 20, subtitle: 12 }
        };
      } else {
        // Desktop cards (original)
        return {
          cardX: 830,
          cardY1: 30,
          cardY2: 160,
          padding: { top: 24, right: 20, bottom: 24, left: 20 },
          gap: 16,
          fontSize: { title: 16, value: 24, subtitle: 14 }
        };
      }
    };

    const cardConfig = getResponsiveCardConfig();
    const { cardX, cardY1, cardY2, padding, gap, fontSize: cardFontSize } = cardConfig;

    // Total Detections Card - responsive dimensions
    svg
      .append("rect")
      .attr("x", cardX)
      .attr("y", cardY1)
      .attr("width", cardWidth)
      .attr("height", cardHeight)
      .attr("rx", 12 * scale) // Responsive radius
      .attr("ry", 12 * scale)
      .attr("fill", "white")
      .attr("filter", "url(#cardShadow)")
      .attr("class", styles["info-card"]);

    // Total Detections Card Content - responsive text
    // Title with icon
    svg
      .append("text")
      .attr("x", cardX + padding.left)
      .attr("y", cardY1 + padding.top + 8)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-title"])
      .style("font-size", `${cardFontSize.title}px`)
      .style("font-weight", "500") 
      .text("Total Detections");

    // Arrow icon next to title
    svg
      .append("text")
      .attr("x", cardX + 259 - padding.right - 16)
      .attr("y", cardY1 + padding.top + 8) // Same Y as title
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-icon"])
      .style("font-size", "14px")
      .style("fill", "#8B5FBF")
      .text("↗");

    // Main value - positioned for 100px card with proper padding
    svg
      .append("text")
      .attr("x", cardX + padding.left)
      .attr("y", cardY1 + padding.top + 8 + gap + 16) // Adjusted for 24px top padding
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-value"])
      .style("font-size", "24px")
      .style("font-weight", "700")
      .style("fill", "#131313")
      .text("9100");

    // Trend indicator - positioned for 100px card with proper padding
    svg
      .append("text")
      .attr("x", cardX + padding.left + 70)
      .attr("y", cardY1 + padding.top + 8 + gap + 16) // Same Y as main value
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-trend"])
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#059669")
      .text("▲ +10%");

    // Subtitle - positioned for 100px card with proper padding
    svg
      .append("text")
      .attr("x", cardX + padding.left)
      .attr("y", cardY1 + padding.top + 8 + gap + 16 + gap + 12) // Adjusted for 24px top padding
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-subtitle"])
      .style("font-size", "14px")
      .style("font-weight", "400")
      .style("fill", "#6B7280")
      .text("In last 7 days");

    // Mitigated Threats Card (exact dimensions from design: 259x307)
    svg
      .append("rect")
      .attr("x", cardX)
      .attr("y", cardY2)
      .attr("width", 259) // Updated back to 259px to match design
      .attr("height", 307) // Updated back to 307px to match design
      .attr("rx", 12) // From design: 12px radius
      .attr("ry", 12)
      .attr("fill", "white")
      .attr("filter", "url(#cardShadow)")
      .attr("class", styles["info-card"]);

    // Mitigated Threats Card Content - using design padding and gap
    // Title
    svg
      .append("text")
      .attr("x", cardX + padding.left)
      .attr("y", cardY2 + padding.top + 16) // Using 24px top padding
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-title"])
      .text("Mitigated Threats");
    
    // Value (right-aligned)
    svg
      .append("text")
      .attr("x", cardX + 259 - padding.right) // Using 20px right padding
      .attr("y", cardY2 + padding.top + 16) // Same y as title
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-value"])
      .text("9000");

    // Threat breakdown with proper spacing using design gap
    const threats = [
      { label: "Critical", value: 60, color: "#4C1D95" },
      { label: "High", value: 300, color: "#7C3AED" },
      { label: "Medium", value: 860, color: "#A78BFA" },
      { label: "Low", value: 100, color: "#DDD6FE" }
    ];

    threats.forEach((threat, i) => {
      const yPos = cardY2 + padding.top + 16 + gap + 20 + (i * (12 + 16)); // Using 24px top padding and 16px gap
      
      // Label
      svg
        .append("text")
        .attr("x", cardX + padding.left) // Using 20px left padding
        .attr("y", yPos)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("class", styles["threat-label"])
        .text(threat.label);
      
      // Value
      svg
        .append("text")
        .attr("x", cardX + 259 - padding.right) // Using 20px right padding
        .attr("y", yPos) // Same Y position as label - they stay on the same line
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", styles["threat-value"])
        .text(threat.value);
    });

    // Add Unmitigated Threats section to the Mitigated Threats card
    const unmitigatedTitleY = cardY2 + padding.top + 16 + gap + 20 + (4 * (12 + 16)) + gap + 20; // Using design padding
    
    // Title
    svg
      .append("text")
      .attr("x", cardX + padding.left) // Using 20px left padding
      .attr("y", unmitigatedTitleY)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-title"])
      .text("Unmitigated Threats");
    
    // Value (right-aligned)
    svg
      .append("text")
      .attr("x", cardX + 259 - padding.right) // Using 20px right padding
      .attr("y", unmitigatedTitleY)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("class", styles["card-value"])
      .text("100");

    // Unmitigated threat breakdown
    const unmitigatedThreats = [
      { label: "Informational", value: 100, color: "#F3F4F6" }
    ];

    unmitigatedThreats.forEach((threat, i) => {
      const yPos = unmitigatedTitleY + gap + 16 + (i * (12 + 16)); // Using design gap
      
      // Label
      svg
        .append("text")
        .attr("x", cardX + padding.left) // Using 20px left padding
        .attr("y", yPos)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("class", styles["threat-label"])
        .text(threat.label);
      
      // Value
      svg
        .append("text")
        .attr("x", cardX + 259 - padding.right) // Using 20px right padding
        .attr("y", yPos) // Same Y position as label - they stay on the same line
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", styles["threat-value"])
        .text(threat.value);
    });

    // Cleanup function to remove tooltip when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        d3.select("body").selectAll(`.${styles.tooltip}`).remove();
      }
    };
  }, [flows, curvature, svgRef]); // Rerun effect when flows, curvature, or window size change

  return <svg id="sankey-chart" ref={svgRef}></svg>;
};

