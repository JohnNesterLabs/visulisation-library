import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Type definitions
interface Node {
  id: string;
  name: string;
  value: number;
  type: "source" | "middle" | "target";
  color: string;
  x: number;
  y: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: Node[];
  links: Link[];
}

interface Statistics {
  trendGoods: number;
  shoppingViews: number;
  storeDynamics: number;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SankeyVisualizationProps {
  data: SankeyData;
  width?: number;
  height?: number;
  margin?: Margin;
  backgroundColor?: string;

  // Time filter props
  showTimeFilter?: boolean;
  timeFilters?: string[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  filterButtonColor?: string;
  filterButtonInactive?: string;

  // Flow width customization props
  useCustomFlowWidth?: boolean;
  customFlowWidth?: number;
  minFlowWidth?: number;
  maxFlowWidth?: number;
  flowWidthMultiplier?: number;

  // Statistics props
  showStatistics?: boolean;
  statistics?: Statistics;
}

const SankeyVisualization: React.FC<SankeyVisualizationProps> = ({
  data,
  width = 1200,
  height = 600,
  margin = { top: 80, right: 50, bottom: 50, left: 50 },
  backgroundColor = "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)",

  // Time filter props
  showTimeFilter = true,
  timeFilters = ["1W", "1M", "3M", "1Y", "ALL"],
  activeFilter = "3M",
  onFilterChange = () => { },
  filterButtonColor = "#6366f1",
  filterButtonInactive = "rgba(255, 255, 255, 0.1)",

  // Flow width customization props
  useCustomFlowWidth = false,
  customFlowWidth = 10,
  minFlowWidth = 4,
  maxFlowWidth = 20,
  flowWidthMultiplier = 1,

  // Statistics props
  showStatistics = true,
  statistics = {
    trendGoods: 204,
    shoppingViews: 65540,
    storeDynamics: 325,
  },
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, HTMLElement, any>>();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", backgroundColor);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("fill", "rgba(255,255,255,0.1)")
      .text("Data visualisation");

    const zoomGroup = svg.append("g").attr("class", "zoom-group");
    const g = zoomGroup
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Clean up existing tooltip if it exists
    if (tooltipRef.current) {
      tooltipRef.current.remove();
    }

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);
    tooltipRef.current = tooltip;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomGroup.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const nodeWidth = 180;
    const nodeHeight = 80;
    const nodeSpacing = 120;
    const nodeBorderRadius = 16;
    const dropShadow = "drop-shadow(0 8px 16px rgba(0,0,0,0.3))";
    const hoverShadow = "drop-shadow(0 12px 24px rgba(0,0,0,0.5))";
    const textColor = "white";

    const centerY = (height - margin.top - margin.bottom) / 2;
    const leftX = 80;
    const middleX = (width - margin.left - margin.right) / 2 - nodeWidth / 2;
    const rightX = width - margin.left - margin.right - nodeWidth - 80;

    // Position nodes by type
    const sourceNodes = data.nodes.filter((n: Node) => n.type === "source");
    const middleNodes = data.nodes.filter((n: Node) => n.type === "middle");
    const targetNodes = data.nodes.filter((n: Node) => n.type === "target");

    // Position source nodes
    sourceNodes.forEach((node: Node) => {
      node.x = leftX;
      node.y = centerY - nodeHeight / 2;
    });

    // Position middle nodes
    middleNodes.forEach((node: Node, i: number) => {
      const totalHeight = (middleNodes.length - 1) * nodeSpacing;
      const startY = centerY - totalHeight / 2;
      node.x = middleX;
      node.y = startY + i * nodeSpacing;
    });

    // Position target nodes
    targetNodes.forEach((node: Node, i: number) => {
      const totalHeight = (targetNodes.length - 1) * nodeSpacing;
      const startY = centerY - totalHeight / 2;
      node.x = rightX;
      node.y = startY + i * nodeSpacing;
    });

    const drag = d3
      .drag<SVGGElement, Node>()
      .on("start", (event: d3.D3DragEvent<SVGGElement, Node, Node>) => {
        event.sourceEvent.stopPropagation();
      })
      .on("drag", function (event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
        d.x = event.x;
        d.y = event.y;

        d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);

        g.selectAll("path.sankey-link").remove();
        drawLinks();
      });

    const defs = svg.append("defs");

    const maxLinkValue = Math.max(...data.links.map((l: Link) => l.value));

    const calculateFlowWidth = (linkValue: number): number => {
      if (useCustomFlowWidth) {
        return customFlowWidth;
      } else {
        const normalizedValue = linkValue / maxLinkValue;
        const dynamicWidth = normalizedValue * maxFlowWidth + minFlowWidth;
        return dynamicWidth * flowWidthMultiplier;
      }
    };

    const drawLinks = (): void => {
      defs.selectAll("linearGradient.link-gradient").remove();

      data.links.forEach((link: Link, i: number) => {
        const sourceNode = data.nodes.find((n: Node) => n.id === link.source);
        const targetNode = data.nodes.find((n: Node) => n.id === link.target);

        if (!sourceNode || !targetNode) {
          console.warn(`Link ${i}: Source or target node not found`);
          return;
        }

        const gradientId = `gradient-${i}`;
        const linearGradient = defs
          .append("linearGradient")
          .attr("id", gradientId)
          .attr("class", "link-gradient")
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", sourceNode.x + nodeWidth)
          .attr("y1", sourceNode.y + nodeHeight / 2)
          .attr("x2", targetNode.x)
          .attr("y2", targetNode.y + nodeHeight / 2);

        linearGradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", sourceNode.color)
          .attr("stop-opacity", 0.8);

        linearGradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", targetNode.color)
          .attr("stop-opacity", 0.8);

        const x1 = sourceNode.x + nodeWidth;
        const y1 = sourceNode.y + nodeHeight / 2;
        const x2 = targetNode.x;
        const y2 = targetNode.y + nodeHeight / 2;

        const thickness = calculateFlowWidth(link.value);

        g.append("path")
          .attr("class", "sankey-link")
          .attr(
            "d",
            `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2
            },${y2} ${x2},${y2}`
          )
          .attr("fill", "none")
          .attr("stroke", `url(#${gradientId})`)
          .attr("stroke-width", thickness)
          .attr("stroke-opacity", 0.7)
          .style("filter", dropShadow)
          .on("mouseover", (event: MouseEvent) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip
              .html(`Flow: ${link.value}<br/>Width: ${thickness.toFixed(1)}px`)
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
            d3.select(event.target as SVGPathElement).attr("stroke-opacity", 1);
          })
          .on("mouseout", (event: MouseEvent) => {
            tooltip.transition().duration(300).style("opacity", 0);
            d3.select(event.target as SVGPathElement).attr("stroke-opacity", 0.7);
          })
          .on("click", () => {
            console.log(
              `Link clicked: ${sourceNode.name} → ${targetNode.name}, Value: ${link.value
              }, Width: ${thickness.toFixed(1)}px`
            );
          });
      });
    };

    data.nodes.forEach((node: Node, i: number) => {
      const nodeGradientId = `node-gradient-${i}`;
      const nodeGradient = defs
        .append("linearGradient")
        .attr("id", nodeGradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      nodeGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", node.color);
      nodeGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.color(node.color)?.darker(0.5)?.toString() || node.color);

      const nodeGroup = g
        .append("g")
        .datum(node)
        .attr("transform", `translate(${node.x}, ${node.y})`)
        .style("cursor", "pointer")
        .call(drag)
        .on("click", (_event: MouseEvent, d: Node) => {
          console.log("Node clicked:", d.name, "Value:", d.value);
        });

      nodeGroup
        .append("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", nodeBorderRadius)
        .style("fill", `url(#${nodeGradientId})`)
        .style("stroke", d3.color(node.color)?.darker(0.5)?.toString() || node.color)
        .style("stroke-width", 2)
        .style("filter", dropShadow)
        .on("mouseover", function () {
          d3.select(this).style("filter", hoverShadow);
        })
        .on("mouseout", function () {
          d3.select(this).style("filter", dropShadow);
        })
        .on("click", (_event: MouseEvent, d: Node) => {
          console.log("Node clicked:", d.name, "Value:", d.value);
        });

      nodeGroup
        .append("text")
        .attr("x", 20)
        .attr("y", 30)
        .style("fill", textColor)
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text(node.name);

      nodeGroup
        .append("text")
        .attr("x", 20)
        .attr("y", 55)
        .style("fill", textColor)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(`$${node.value.toLocaleString()}`);
    });

    drawLinks();

    // Add fixed statistics panel (not affected by zoom)
    if (showStatistics) {
      const statsGroup = svg.append("g").attr("class", "stats-panel");

      // Background for stats panel
      const panelWidth = 800;
      const panelHeight = 120;
      const panelX = (width - panelWidth) / 2;
      const panelY = height - panelHeight - 20;

      // Main background - match canvas background
      statsGroup
        .append("rect")
        .attr("x", panelX)
        .attr("y", panelY)
        .attr("width", panelWidth)
        .attr("height", panelHeight)
        .attr("rx", 12)
        .attr("fill", "rgba(15, 15, 35, 1)")
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-width", 1);

      // Statistics items
      const stats = [
        {
          title: "TREND GOODS",
          value: statistics.trendGoods.toLocaleString(),
          icon: "▶",
          color: "#6366f1",
        },
        {
          title: "SHOPPING VIEWS",
          value: statistics.shoppingViews.toLocaleString(),
          icon: "👁",
          color: "#8b5cf6",
        },
        {
          title: "STORE DYNAMICS",
          value: statistics.storeDynamics.toLocaleString(),
          icon: "⏱",
          color: "#a855f7",
        },
      ];

      const itemWidth = panelWidth / 3;

      stats.forEach((stat, i: number) => {
        const itemX = panelX + i * itemWidth;
        const itemCenterX = itemX + itemWidth / 2;

        // Icon background
        statsGroup
          .append("rect")
          .attr("x", itemCenterX - 25)
          .attr("y", panelY + 15)
          .attr("width", 50)
          .attr("height", 50)
          .attr("rx", 8)
          .attr("fill", "rgba(255, 255, 255, 0.1)")
          .attr("stroke", "rgba(255, 255, 255, 0.2)")
          .attr("stroke-width", 1);

        // Icon
        statsGroup
          .append("text")
          .attr("x", itemCenterX)
          .attr("y", panelY + 45)
          .attr("text-anchor", "middle")
          .style("font-size", "24px")
          .style("fill", stat.color)
          .text(stat.icon);

        // Title
        statsGroup
          .append("text")
          .attr("x", itemCenterX)
          .attr("y", panelY + 85)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "600")
          .style("fill", "rgba(255, 255, 255, 0.7)")
          .style("letter-spacing", "1px")
          .text(stat.title);

        // Value
        statsGroup
          .append("text")
          .attr("x", itemCenterX)
          .attr("y", panelY + 105)
          .attr("text-anchor", "middle")
          .style("font-size", "28px")
          .style("font-weight", "bold")
          .style("fill", "white")
          .text(stat.value);
      });
    }

    // Cleanup function
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
    };
  }, [
    data,
    width,
    height,
    margin,
    backgroundColor,
    useCustomFlowWidth,
    customFlowWidth,
    minFlowWidth,
    maxFlowWidth,
    flowWidthMultiplier,
    showStatistics,
    statistics,
  ]);

  const handleZoomIn = (): void => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.2);
    }
  };

  const handleZoomOut = (): void => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = (): void => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      {/* Time Filter */}
      {showTimeFilter && (
        <div className="absolute top-6 right-6 flex space-x-2 z-10">
          {timeFilters.map((filter: string) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className="px-4 py-1.5 rounded-full text-white text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor:
                  activeFilter === filter
                    ? filterButtonColor
                    : filterButtonInactive,
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Buttons */}
      <div className="space-x-4 z-0">
        <button
          onClick={handleZoomIn}
          className="bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors"
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors"
        >
          Zoom Out
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors"
        >
          Reset Zoom
        </button>
      </div>

      {/* Chart */}
      <svg ref={svgRef} className="max-w-full max-h-full"></svg>
    </div>
  );
};

export default SankeyVisualization;
