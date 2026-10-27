import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PlantProfile } from '../types';
import { TrendingUp, Activity, ShieldCheck, Calendar, Info } from 'lucide-react';

interface D3HealthTrendChartProps {
  plant: PlantProfile;
  className?: string;
}

interface DataPoint {
  date: Date;
  score: number;
  event?: string;
}

export const D3HealthTrendChart: React.FC<D3HealthTrendChartProps> = ({ plant, className = '' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // Generate deterministic 30-day health trend data anchored on current plant health
  const data: DataPoint[] = useMemo(() => {
    const points: DataPoint[] = [];
    const now = new Date();
    const currentScore = plant.healthScore;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(12, 0, 0, 0);

      // Organic variation simulating natural growth and care cycles
      const dayOffset = 29 - i;
      const cycleWave = Math.sin(dayOffset * 0.45) * 5;
      const noise = ((dayOffset * 17) % 7) - 3;
      
      let score = Math.round(currentScore - (i * 0.35) + cycleWave + noise);
      
      // Events on specific days
      let event: string | undefined;
      if (i === 0) {
        score = currentScore;
        event = 'Current Realtime Telemetry';
      } else if (i === 2) {
        score = Math.min(100, score + 4);
        event = 'Deep Hydration (250ml)';
      } else if (i === 10) {
        score = Math.min(100, score + 6);
        event = 'Nutrient Feed Applied';
      } else if (i === 18) {
        score = Math.min(100, score + 3);
        event = 'Pot Rotated 90° for Sunlight';
      } else if (i === 24) {
        score = Math.max(40, score - 5);
        event = 'Dry Substrate Notice';
      }

      score = Math.max(30, Math.min(100, score));
      points.push({ date: d, score, event });
    }

    return points;
  }, [plant.healthScore, plant.id]);

  // Statistics
  const avgScore = useMemo(() => {
    const sum = data.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / data.length);
  }, [data]);

  const peakScore = useMemo(() => {
    return Math.max(...data.map((d) => d.score));
  }, [data]);

  const minScore = useMemo(() => {
    return Math.min(...data.map((d) => d.score));
  }, [data]);

  const trendDelta = useMemo(() => {
    if (data.length < 2) return 0;
    return data[data.length - 1].score - data[0].score;
  }, [data]);

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    // Dimensions
    const width = container.clientWidth || 580;
    const height = 240;
    const margin = { top: 20, right: 30, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous render
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Gradients and Neon Glow Filters
    const defs = svg.append('defs');

    // Area fill gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'health-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.45);

    areaGradient
      .append('stop')
      .attr('offset', '80%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.08);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0f172a')
      .attr('stop-opacity', 0);

    // Line stroke gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'health-line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'neon-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([Math.min(30, minScore - 5), 100])
      .range([innerHeight, 0])
      .nice();

    // Subtle horizontal gridlines
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '3,3');

    g.select('.grid .domain').remove();

    // Critical and Optimal Reference Threshold Lines
    // 80% line (Optimal)
    const y80 = yScale(80);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', y80)
      .attr('y2', y80)
      .attr('stroke', 'rgba(16, 185, 129, 0.3)')
      .attr('stroke-dasharray', '4,4');

    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', y80 - 4)
      .attr('fill', '#10b981')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('text-anchor', 'end')
      .text('OPTIMAL (80%)');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', 'rgba(93, 255, 176, 0.25)');
    xAxisGroup
      .selectAll('text')
      .attr('fill', '#8fb8a8')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px');
    xAxisGroup.selectAll('.tick line').attr('stroke', 'rgba(93, 255, 176, 0.2)');

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('text')
      .attr('fill', '#8fb8a8')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px');
    yAxisGroup.selectAll('.tick line').remove();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 1600;

    // Clip path for synchronized area reveal
    const clipId = `chart-clip-${Math.random().toString(36).substring(2, 9)}`;
    const clipRect = defs
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', prefersReducedMotion ? innerWidth : 0)
      .attr('height', innerHeight);

    if (!prefersReducedMotion) {
      clipRect
        .transition()
        .duration(duration)
        .ease(d3.easeCubicOut)
        .attr('width', innerWidth);
    }

    // D3 Area Generator
    const areaGenerator = d3
      .area<DataPoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.score))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#health-area-gradient)')
      .attr('clip-path', `url(#${clipId})`)
      .attr('d', areaGenerator);

    // D3 Line Generator
    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Render Neon Glow Line with smooth self-drawing transition
    const linePath = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#health-line-gradient)')
      .attr('stroke-width', 2.8)
      .attr('filter', 'url(#neon-glow)')
      .attr('d', lineGenerator);

    const pathNode = linePath.node() as SVGPathElement | null;
    if (pathNode) {
      const totalLength = pathNode.getTotalLength();
      if (!prefersReducedMotion) {
        linePath
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(duration)
          .ease(d3.easeCubicOut)
          .attr('stroke-dashoffset', 0);
      }
    }

    // Event Marker Circles: animate radius and opacity as the line draws across
    const eventPoints = data.filter((d) => d.event);
    const dots = g
      .selectAll('.event-dot')
      .data(eventPoints)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.score))
      .attr('r', 0)
      .attr('fill', '#38bdf8')
      .attr('stroke', '#030a09')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    if (prefersReducedMotion) {
      dots.attr('r', 4.5).style('opacity', 1);
    } else {
      dots
        .transition()
        .delay((d) => {
          const ratio = Math.max(0, Math.min(1, xScale(d.date) / innerWidth));
          return ratio * (duration * 0.9);
        })
        .duration(400)
        .ease(d3.easeBackOut)
        .attr('r', 4.5)
        .style('opacity', 1);
    }

    // Interactive Hover Elements
    const focusLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(77, 225, 255, 0.5)')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const focusCircle = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#5dffb0')
      .attr('stroke', '#030a09')
      .attr('stroke-width', 2.5)
      .style('opacity', 0);

    const bisectDate = d3.bisector<DataPoint, Date>((d) => d.date).left;

    // Transparent overlay capturing mouse moves
    svg
      .append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const xDate = xScale.invert(mx);
        const index = bisectDate(data, xDate, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1) {
          d = xDate.getTime() - d0.date.getTime() > d1.date.getTime() - xDate.getTime() ? d1 : d0;
        }

        if (d) {
          const cxPos = xScale(d.date);
          const cyPos = yScale(d.score);

          focusLine
            .attr('x1', cxPos)
            .attr('x2', cxPos)
            .style('opacity', 1);

          focusCircle
            .attr('cx', cxPos)
            .attr('cy', cyPos)
            .style('opacity', 1);

          setHoveredPoint(d);
        }
      })
      .on('mouseleave', () => {
        focusLine.style('opacity', 0);
        focusCircle.style('opacity', 0);
        setHoveredPoint(null);
      });

  }, [data, minScore]);

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Chart Header with Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              30-Day Physiological Vigor Curve (D3.js)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              TELEMETRY LOG
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Historical vitality coefficients recorded for {plant.name} ({plant.species})
          </p>
        </div>

        {/* Micro statistics */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">AVG:</span>
            <span className="text-emerald-400 font-bold">{avgScore}%</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">PEAK:</span>
            <span className="text-cyan-400 font-bold">{peakScore}%</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
            <span className="text-slate-400">30D TREND:</span>
            <span
              className={`font-bold flex items-center gap-0.5 ${
                trendDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trendDelta >= 0 ? `+${trendDelta}%` : `${trendDelta}%`}
            </span>
          </div>
        </div>
      </div>

      {/* D3 Render Target */}
      <div className="w-full relative">
        <svg ref={svgRef} className="w-full h-auto block select-none" />

        {/* Floating Tooltip Indicator */}
        {hoveredPoint && (
          <div className="absolute top-2 left-14 pointer-events-none bg-slate-950/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono animate-fade-in flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hoveredPoint.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}:</span>
            </div>
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <span>{hoveredPoint.score}% Vigor</span>
            </div>
            {hoveredPoint.event && (
              <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
                {hoveredPoint.event}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart Footer Notice */}
      <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Interactive timeline: Hover over nodes to inspect daily hydration and care events.</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">D3 VECTOR RENDERER</span>
      </div>
    </div>
  );
};
