import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RotateCcw } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  label?: string;
}

interface ConceptMapDiagramProps {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string; label?: string }[];
}

export const ConceptMapDiagram: React.FC<ConceptMapDiagramProps> = ({ nodes, edges }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth || 800;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'background-color: transparent;');

    // Define Arrow Marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22) // Place arrowhead right before the node circle
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 8 5 L 0 8.5 z')
      .attr('fill', '#475569'); // slate-600

    const zoomGroup = svg.append('g').attr('class', 'zoom-group');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100));
      });

    svg.call(zoom);

    // Deep clone data for D3 usage
    const d3Nodes: Node[] = nodes.map(n => ({ ...n }));
    const d3Edges: Edge[] = edges.map(e => ({
      source: e.from,
      target: e.to,
      label: e.label,
    }));

    // Simulation Setup
    const simulation = d3.forceSimulation<Node>(d3Nodes)
      .force('link', d3.forceLink<Node, Edge>(d3Edges)
        .id(d => d.id)
        .distance(160)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70));

    // Draw Links
    const linkGroup = zoomGroup.append('g').attr('class', 'links');
    
    const link = linkGroup.selectAll('.link-group')
      .data(d3Edges)
      .enter()
      .append('g')
      .attr('class', 'link-group');

    // Link Lines
    const linkLine = link.append('line')
      .attr('stroke', 'rgba(100, 116, 139, 0.25)')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Link Labels
    const linkLabel = link.append('g')
      .attr('class', 'link-label')
      .style('opacity', 0.85);

    linkLabel.append('rect')
      .attr('fill', '#0B0F19')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('stroke', 'rgba(100, 116, 139, 0.15)')
      .attr('stroke-width', 1);

    linkLabel.append('text')
      .attr('fill', '#94A3B8') // slate-400
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text(d => d.label || '');

    // Size link labels to fit text
    linkLabel.each(function(this: any) {
      const g = d3.select(this);
      const text = g.select('text').node() as SVGTextContentElement;
      if (text) {
        const bbox = text.getBBox();
        const paddingX = 8;
        const paddingY = 4;
        g.select('rect')
          .attr('x', bbox.x - paddingX / 2)
          .attr('y', bbox.y - paddingY / 2)
          .attr('width', bbox.width + paddingX)
          .attr('height', bbox.height + paddingY);
      }
    });

    // Draw Nodes
    const nodeGroup = zoomGroup.append('g').attr('class', 'nodes');

    const node = nodeGroup.selectAll('.node')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'grab')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      );

    // Node glass background circle
    node.append('circle')
      .attr('r', 55)
      .attr('fill', 'rgba(15, 23, 42, 0.65)')
      .attr('stroke', 'rgba(6, 182, 212, 0.35)') // cyan-500/35
      .attr('stroke-width', 1.5)
      .style('backdrop-filter', 'blur(8px)')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))');

    // Central accent ring (subtle pulse effect)
    node.append('circle')
      .attr('r', 58)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(6, 182, 212, 0.05)')
      .attr('stroke-width', 2);

    // Node Text (wrapped to 2 lines if needed)
    node.each(function(d) {
      const g = d3.select(this);
      const words = d.label.split(/\s+/);
      const lines: string[] = [];
      let currentLine = '';

      // Simple wrapping logic
      words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length > 12) {
          lines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine += ' ' + word;
        }
      });
      lines.push(currentLine.trim());

      const text = g.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#E2E8F0') // slate-200
        .attr('font-size', '11px')
        .attr('font-family', 'Outfit, sans-serif')
        .attr('font-weight', '500')
        .attr('y', lines.length === 1 ? 3 : -((lines.length - 1) * 6));

      lines.forEach((line, idx) => {
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', idx === 0 ? 0 : 13)
          .text(line);
      });
    });

    // Hover Interactivity
    node.on('mouseover', function(this: any, _event: any, d: any) {
      // Highlight hovered node
      d3.select(this).select('circle')
        .transition().duration(200)
        .attr('stroke', '#22D3EE') // cyan-400
        .attr('stroke-width', 2.5)
        .attr('fill', 'rgba(15, 23, 42, 0.85)');

      // Highlight active lines, dim others
      linkLine.transition().duration(200)
        .attr('stroke', (l: any) => {
          const isConnected = l.source.id === d.id || l.target.id === d.id;
          return isConnected ? 'rgba(34, 211, 238, 0.8)' : 'rgba(100, 116, 139, 0.08)';
        })
        .attr('stroke-width', (l: any) => {
          const isConnected = l.source.id === d.id || l.target.id === d.id;
          return isConnected ? 3 : 1;
        });

      // Dim other nodes
      node.filter((n: any) => n.id !== d.id)
        .style('opacity', 0.45);
    })
    .on('mouseout', function(this: any) {
      // Restore node
      d3.select(this).select('circle')
        .transition().duration(200)
        .attr('stroke', 'rgba(6, 182, 212, 0.35)')
        .attr('stroke-width', 1.5)
        .attr('fill', 'rgba(15, 23, 42, 0.65)');

      // Restore links
      linkLine.transition().duration(200)
        .attr('stroke', 'rgba(100, 116, 139, 0.25)')
        .attr('stroke-width', 2);

      // Restore other nodes
      node.style('opacity', 1);
    });

    // Update Simulation ticks
    simulation.on('tick', () => {
      // Bound coordinates inside view
      d3Nodes.forEach(node => {
        const radius = 55;
        node.x = Math.max(radius, Math.min(width - radius, node.x || 0));
        node.y = Math.max(radius, Math.min(height - radius, node.y || 0));
      });

      linkLine
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      linkLabel.attr('transform', d => {
        const x = ((d.source as any).x + (d.target as any).x) / 2;
        const y = ((d.source as any).y + (d.target as any).y) / 2;
        return `translate(${x}, ${y})`;
      });

      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Drag Actions
    function dragStarted(this: any, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(this).style('cursor', 'grabbing');
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(this: any, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(this).style('cursor', 'grab');
    }

    // Save reset function for button
    const handleReset = () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    };
    (svgRef.current as any).resetZoom = handleReset;

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  const handleResetZoom = () => {
    if (svgRef.current && (svgRef.current as any).resetZoom) {
      (svgRef.current as any).resetZoom();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[500px] rounded-2xl glass-panel border border-slate-800 overflow-hidden bg-slate-950/20">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <h4 className="text-sm font-semibold text-slate-200 font-display">Concept Connection Map</h4>
        <p className="text-xs text-slate-400">Drag concepts to rearrange, hover to highlight pathways</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className="text-xs text-slate-500 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
          {zoomLevel}%
        </span>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 text-xs"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset View
        </button>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-move" />

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 text-[10px] text-slate-500 font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-cyan-500/50 bg-slate-900/60" />
          <span>Core Concept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-slate-600/40 relative">
            <span className="absolute right-0 top-1/2 -translate-y-1/2 border-y-[3px] border-y-transparent border-l-[4px] border-l-slate-600" />
          </span>
          <span>Relationship</span>
        </div>
      </div>
    </div>
  );
};
