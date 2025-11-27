import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, NodeData, LinkData } from '../types';

interface MindMapGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  isDarkMode?: boolean;
  showLabels?: boolean;
}

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group?: number;
  x?: number;
  y?: number;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: string | SimulationNode;
  target: string | SimulationNode;
}

const MindMapGraph: React.FC<MindMapGraphProps> = ({ 
  data, 
  width = 800, 
  height = 500,
  isDarkMode = false,
  showLabels = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [links, setLinks] = useState<SimulationLink[]>([]);

  useEffect(() => {
    if (!data || data.nodes.length === 0) return;

    // Deep copy data to avoid mutation issues in strict mode
    const initialNodes: SimulationNode[] = data.nodes.map(n => ({ ...n }));
    const initialLinks: SimulationLink[] = data.links.map(l => ({ ...l }));

    setNodes(initialNodes);
    setLinks(initialLinks);

    const simulation = d3.forceSimulation(initialNodes)
      .force("link", d3.forceLink(initialLinks).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(60)); // Prevent overlap

    simulation.on("tick", () => {
      // Trigger re-render on each tick by updating state shallowly
      setNodes([...initialNodes]);
      setLinks([...initialLinks]);
    });

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  // Color scale
  const getColor = (group: number = 2) => {
    if (group === 1) return isDarkMode ? "#818cf8" : "#6366f1"; // Root - Indigo
    if (group === 2) return isDarkMode ? "#f472b6" : "#ec4899"; // Branch - Pink
    return isDarkMode ? "#60a5fa" : "#3b82f6"; // Leaf - Blue
  };

  const getRadius = (group: number = 2) => {
    if (group === 1) return 50;
    if (group === 2) return 35;
    return 25;
  };

  const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
  const linkColor = isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)";

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
      <g>
        {links.map((link, i) => {
          const source = link.source as SimulationNode;
          const target = link.target as SimulationNode;
          if (typeof source === 'string' || typeof target === 'string') return null;
          
          if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) {
            return null;
          }
          
          return (
            <line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={linkColor}
              strokeWidth={2}
            />
          );
        })}
      </g>
      <g>
        {nodes.map((node, i) => (
          <g key={node.id} transform={`translate(${node.x || width/2}, ${node.y || height/2})`}>
             {/* Halo effect for Root */}
            {node.group === 1 && (
                 <circle r={getRadius(node.group) + 10} fill={getColor(node.group)} opacity={0.2} filter="url(#glow)">
                    <animate attributeName="r" values="60;70;60" dur="3s" repeatCount="indefinite" />
                 </circle>
            )}
            
            <circle
              r={getRadius(node.group)}
              fill={isDarkMode ? "rgba(30, 41, 59, 0.9)" : "rgba(255,255,255,0.9)"}
              stroke={getColor(node.group)}
              strokeWidth={3}
              className="cursor-pointer transition-all duration-300"
              style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" }}
            />
            
            {showLabels && (
                <foreignObject x={-getRadius(node.group)} y={-getRadius(node.group)} width={getRadius(node.group)*2} height={getRadius(node.group)*2}>
                    <div className="w-full h-full flex items-center justify-center p-1 pointer-events-none">
                        <p 
                            className="text-center text-xs font-semibold break-words leading-tight select-none"
                            style={{ color: textColor }}
                        >
                        {node.label}
                        </p>
                    </div>
                </foreignObject>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default MindMapGraph;