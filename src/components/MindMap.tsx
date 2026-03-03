import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network } from 'lucide-react';
import { Source, Theme } from '../types';

interface MindMapProps {
  sources: Source[];
  theme: Theme;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'source' | 'keyword' | 'root';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export default function MindMap({ sources, theme }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || sources.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const nodes: Node[] = [{ id: 'root', name: 'Research', type: 'root' }];
    const links: Link[] = [];

    sources.forEach(source => {
      nodes.push({ id: source.id, name: source.name, type: 'source' });
      links.push({ source: 'root', target: source.id });

      if (source.keywords) {
        source.keywords.forEach(keyword => {
          const keywordId = `kw-${keyword}`;
          if (!nodes.find(n => n.id === keywordId)) {
            nodes.push({ id: keywordId, name: keyword, type: 'keyword' });
          }
          links.push({ source: source.id, target: keywordId });
        });
      }
    });

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .append("g");

    // Add zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform);
      });

    d3.select(svgRef.current).call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = svg.append("g")
      .attr("stroke", theme.text)
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", d => d.type === 'root' ? 12 : d.type === 'source' ? 8 : 4)
      .attr("fill", d => d.type === 'root' ? theme.accent : d.type === 'source' ? theme.card : theme.text)
      .attr("stroke", theme.bg)
      .attr("stroke-width", 1.5);

    node.append("text")
      .attr("x", 12)
      .attr("y", 4)
      .text(d => d.name)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", d => d.type === 'root' ? "14px" : "11px")
      .attr("font-weight", "bold")
      .attr("fill", theme.text)
      .style("pointer-events", "none")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [sources, theme]);

  if (sources.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
        <Network className="w-12 h-12" style={{ color: theme.textMuted }} />
        <div className="space-y-1">
          <h3 className="font-bold text-xl" style={{ color: theme.text }}>Mind Map</h3>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Add sources to visualize connections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="absolute top-6 left-6 z-10 space-y-1">
        <h2 className="text-xl font-black tracking-tighter" style={{ color: theme.text }}>Interactive Mind Map</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textMuted }}>Drag to explore // Scroll to zoom</p>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-move" />
    </div>
  );
}
