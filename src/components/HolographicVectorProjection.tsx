import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TelemetryData } from '../types';

interface HolographicVectorProjectionProps {
  telemetry: TelemetryData;
  hudColor: string;
  dragOffset: { x: number; y: number };
}

export const HolographicVectorProjection: React.FC<HolographicVectorProjectionProps> = ({
  telemetry,
  hudColor,
  dragOffset,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Keep track of a historical flight trace buffer for the trail segment
  const [history, setHistory] = useState<{ x: number; y: number }[]>([]);
  const keyboardSteerRef = useRef({ x: 0, y: 0 });

  // Keyboard steer tracer to complement touch joystick offsets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') keyboardSteerRef.current.x = -15;
      if (k === 'd' || k === 'arrowright') keyboardSteerRef.current.x = 15;
      if (k === 'w' || k === 'arrowup') keyboardSteerRef.current.y = -15;
      if (k === 's' || k === 'arrowdown') keyboardSteerRef.current.y = 15;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft' || k === 'd' || k === 'arrowright') {
        keyboardSteerRef.current.x = 0;
      }
      if (k === 'w' || k === 'arrowup' || k === 's' || k === 'arrowdown') {
        keyboardSteerRef.current.y = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update history buffers periodically, simulating coordinates trail sliding behind
  useEffect(() => {
    const interval = setInterval(() => {
      // Base drift centered on ship heading offsets
      const activeX = (dragOffset.x * 0.4) + (keyboardSteerRef.current.x * 0.4) + (Math.sin(Date.now() * 0.002) * 2.0);
      const activeY = -(dragOffset.y * 0.4) + (keyboardSteerRef.current.y * 0.4) + (Math.cos(Date.now() * 0.001) * 1.5);
      
      setHistory((prev) => {
        const next = [...prev, { x: activeX, y: activeY }];
        return next.slice(-18); // keep last 18 trail nodes
      });
    }, 120);

    return () => clearInterval(interval);
  }, [dragOffset]);

  // Main D3.js Vector Path Render Loop
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 210;
    const height = 125;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear for pristine frame drawing

    // 1. Create Scales for coordinate grids
    const xScale = d3.scaleLinear().domain([-50, 50]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-40, 40]).range([height, 0]);

    // Active lateral steering coefficient mapping
    const steerX = dragOffset.x + keyboardSteerRef.current.x;
    const steerY = -(dragOffset.y - keyboardSteerRef.current.y);

    // Determine warning levels based on asteroid proximity
    const dangerZone = telemetry.nearestAsteroidDist < 120;
    const warnColor = dangerZone ? '#ff3300' : '#f97316';

    // 2. Render holographic grid background with perspective shear based on steering
    const gridG = svg.append('g').attr('class', 'grids');

    // Horizontal grids representation (Space latitude planes)
    const yTicks = [-30, -15, 0, 15, 30];
    gridG.selectAll('.horiz-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('y1', (d) => yScale(d) + steerY * 0.1)
      .attr('x2', width)
      .attr('y2', (d) => yScale(d) - steerY * 0.1)
      .attr('stroke', `${hudColor}12`)
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '2, 3');

    // Vertical grids representation (Space longitude lines)
    const xTicks = [-40, -20, 0, 20, 40];
    gridG.selectAll('.vert-line')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d) + steerX * 0.12)
      .attr('y1', 0)
      .attr('x2', (d) => xScale(d) - steerX * 0.12)
      .attr('y2', height)
      .attr('stroke', `${hudColor}10`)
      .attr('stroke-width', 0.6);

    // 3. Render Vector spline showing both historical path & active predictive route
    // Map existing history lines to coordinates
    const historyPoints = history.map((pt, i) => ({
      x: pt.x - (18 - i) * (steerX * 0.05), // shear backwards matching backward relative velocity
      y: pt.y - (18 - i) * (steerY * 0.04),
    }));

    // Generate predictive future trajectory spline nodes (curves with active steering thrust!)
    const futureSegments = 16;
    const futurePoints = [];
    const baseVel = Math.max(1, telemetry.velocity / 300);
    
    for (let i = 0; i < futureSegments; i++) {
      // Spline bends proportionally to steering vector input plus high-velocity inertial drift
      const xBend = (steerX * 0.65) * Math.pow(i / futureSegments, 1.8);
      const yBend = (steerY * 0.55) * Math.pow(i / futureSegments, 1.8);
      
      // Add subtle noise wobble indicating simulated gravity pocket turbulence
      const noiseX = Math.sin(Date.now() * 0.005 + i * 0.5) * 0.8;
      const noiseY = Math.cos(Date.now() * 0.006 + i * 0.4) * 0.6;

      futurePoints.push({
        x: xBend + noiseX,
        y: yBend + noiseY - (i * 0.15), // curve forward down spatial channel
        index: i
      });
    }

    // Combine history trail (behind coordinate center) with prediction route (stretching forward)
    const splineLine = d3.line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveBasis);

    const completeSpline = [...historyPoints, { x: 0, y: 0 }, ...futurePoints];

    // Render beautiful glowing trail path
    svg.append('path')
      .datum(completeSpline)
      .attr('class', 'spline-path-underglow')
      .attr('fill', 'none')
      .attr('stroke', hudColor)
      .attr('stroke-width', 2.2)
      .attr('opacity', 0.22)
      .attr('filter', 'drop-shadow(0px 0px 3px rgba(34, 211, 238, 0.4))')
      .attr('d', splineLine);

    svg.append('path')
      .datum(completeSpline)
      .attr('class', 'spline-path-line')
      .attr('fill', 'none')
      .attr('stroke', hudColor)
      .attr('stroke-width', 0.95)
      .attr('opacity', 0.85)
      .attr('stroke-dasharray', '4, 2')
      .attr('d', splineLine);

    // 4. Draw node points on the predictive route
    const nodeG = svg.append('g').attr('class', 'flight-nodes');
    
    nodeG.selectAll('.prediction-dot')
      .data(futurePoints.filter((_, i) => i % 3 === 0))
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 1.8)
      .attr('fill', '#000000')
      .attr('stroke', hudColor)
      .attr('stroke-width', 0.8)
      .attr('opacity', (d, i) => 0.35 + (i * 0.15));

    // 5. Draw active warning node for closest Asteroid Interception Vector
    if (telemetry.nearestAsteroidDist < 400) {
      // Map asteroid position relative to trajectory intersection
      // Closes in on spline center as nearestAsteroidDist diminishes
      const rawDistRatio = Math.max(0, Math.min(1.0, telemetry.nearestAsteroidDist / 400));
      
      const asteroidPtIndex = Math.min(
        futurePoints.length - 1, 
        Math.floor((1.0 - rawDistRatio) * (futurePoints.length - 1))
      );
      
      const asterNode = futurePoints[asteroidPtIndex];
      const astX = xScale(asterNode.x + (dangerZone ? 0 : 16 * rawDistRatio));
      const astY = yScale(asterNode.y + (dangerZone ? -2 : 12 * rawDistRatio));

      // Warning glyph circle + radar sweep ring on D3 map
      const asterGroup = svg.append('g')
        .attr('class', 'asteroid-intercept')
        .attr('transform', `translate(${astX}, ${astY})`);

      asterGroup.append('circle')
        .attr('r', dangerZone ? 6 : 4)
        .attr('fill', 'none')
        .attr('stroke', warnColor)
        .attr('stroke-width', 0.8)
        .attr('opacity', 0.85)
        .attr('stroke-dasharray', dangerZone ? '1, 1' : 'none');

      // Warning Triangle
      asterGroup.append('polygon')
        .attr('points', '0,-3 -3.5,3 3.5,3')
        .attr('fill', dangerZone ? warnColor : 'none')
        .attr('stroke', warnColor)
        .attr('stroke-width', 0.6);

      // Label text
      asterGroup.append('text')
        .text(`${telemetry.nearestAsteroidName || 'COLLIDER'} [${Math.round(telemetry.nearestAsteroidDist)}m]`)
        .attr('x', 6)
        .attr('y', 2)
        .attr('fill', warnColor)
        .attr('font-size', '4.2px')
        .attr('font-family', '"JetBrains Mono", monospace')
        .attr('font-weight', 'bold');

      if (dangerZone) {
        asterGroup.append('text')
          .text('CRITICAL WARNING: INTERCEPT!')
          .attr('x', -24)
          .attr('y', 10)
          .attr('fill', '#ef4444')
          .attr('font-size', '4px')
          .attr('font-family', '"JetBrains Mono", monospace')
          .attr('font-weight', 'black')
          .style('animation', 'pulse 0.5s infinite');
      }
    }

    // 6. Draw current coordinate ship center (The Focal Crosshairs)
    const shipX = xScale(0);
    const shipY = yScale(0);

    const shipCrosshair = svg.append('g')
      .attr('transform', `translate(${shipX}, ${shipY})`)
      .attr('class', 'ship-indicator');

    // Central crosshair lines
    shipCrosshair.append('line')
      .attr('x1', -6)
      .attr('y1', 0)
      .attr('x2', 6)
      .attr('y2', 0)
      .attr('stroke', hudColor)
      .attr('stroke-width', 0.8);

    shipCrosshair.append('line')
      .attr('x1', 0)
      .attr('y1', -6)
      .attr('x2', 0)
      .attr('y2', 6)
      .attr('stroke', hudColor)
      .attr('stroke-width', 0.8);

    // Glowing core ring
    shipCrosshair.append('circle')
      .attr('r', 2.5)
      .attr('fill', '#020306')
      .attr('stroke', hudColor)
      .attr('stroke-width', 1.0);

    // Dynamic numeric feedback overlays on borders
    const dashboardText = svg.append('g')
      .attr('class', 'spec-readouts')
      .attr('font-family', '"JetBrains Mono", monospace')
      .attr('font-size', '4px')
      .attr('fill', `${hudColor}bb`);

    // Top Right Readout: Portal Goal Coordinates
    const targetNode = futurePoints[futurePoints.length - 1];
    dashboardText.append('text')
      .text(`X_PRJ: ${targetNode.x.toFixed(2)}m`)
      .attr('x', width - 42)
      .attr('y', 10);
      
    dashboardText.append('text')
      .text(`Y_PRJ: ${targetNode.y.toFixed(2)}m`)
      .attr('x', width - 42)
      .attr('y', 16);

    // Bottom Left Readout: Delta Vector
    dashboardText.append('text')
      .text(`CH_YAW: ${steerX.toFixed(1)}°`)
      .attr('x', 6)
      .attr('y', height - 12);

    dashboardText.append('text')
      .text(`CH_PIT: ${steerY.toFixed(1)}°`)
      .attr('x', 6)
      .attr('y', height - 6);

    // Terminal Portal End Indicator (Chronos Gateway Destination)
    const destX = xScale(targetNode.x);
    const destY = yScale(targetNode.y);

    const destGroup = svg.append('g')
      .attr('class', 'destination-gateway')
      .attr('transform', `translate(${destX}, ${destY})`);

    // Pulsing portal outer gate
    destGroup.append('circle')
      .attr('r', 7)
      .attr('fill', 'none')
      .attr('stroke', hudColor)
      .attr('stroke-width', 0.4)
      .attr('opacity', 0.4)
      .style('transform-origin', 'center')
      .style('animation', 'spin 15s linear infinite');

    // Central target
    destGroup.append('circle')
      .attr('r', 2)
      .attr('fill', hudColor)
      .attr('opacity', 0.8);

    destGroup.append('text')
      .text(`GATE ${telemetry.currentGate}_TRGT`)
      .attr('x', -24)
      .attr('y', -6)
      .attr('fill', hudColor)
      .attr('font-size', '4px')
      .attr('font-weight', 'black')
      .attr('font-family', '"JetBrains Mono", monospace');

  }, [telemetry, hudColor, dragOffset, history]);

  return (
    <div className="w-full bg-zinc-950/92 rounded-[8px] p-1 border border-zinc-900/60 flex flex-col gap-1 relative overflow-hidden">
      {/* Visual background scanning noise scanline */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/1 to-transparent pointer-events-none z-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,250,255,0.01) 0px, rgba(0,0,0,0) 2px)' }} />
      
      <div className="flex items-center justify-between border-b border-zinc-900 pb-0.5 px-0.5">
        <span className="text-[5.2px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping shrink-0" />
          HOLO-VECTOR PATH PROJECTION
        </span>
        <span className="text-[5px] font-mono font-medium text-zinc-650 tracking-tighter">D3_SYS_V2.58</span>
      </div>

      <div className="flex justify-center items-center bg-zinc-950 aspect-[21/12.5] relative rounded-[4px] border border-zinc-900/40 p-[1px] overflow-hidden">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          viewBox="0 0 210 125" 
          className="block z-0 select-none overflow-hidden" 
        />
      </div>
    </div>
  );
};
