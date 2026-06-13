import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';

export const CupolaFrame: React.FC = () => {
  const { pilotConfig } = useAppState();
  const hudColor = pilotConfig.hudColor;

  // Track cursor position to simulate dynamic real-time glass reflection shifts
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate offsets to range [-0.5, 0.5]
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setTargetMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth out coordinate tracking using linear interpolation (LERP) for rich cinematic delay
  useEffect(() => {
    let animationFrameId: number;
    const updateInterpolation = () => {
      setMousePos((prev) => {
        const dx = targetMousePos.x - prev.x;
        const dy = targetMousePos.y - prev.y;
        // 0.08 interpolation factor for realistic dampening momentum
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08
        };
      });
      animationFrameId = requestAnimationFrame(updateInterpolation);
    };

    animationFrameId = requestAnimationFrame(updateInterpolation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetMousePos]);

  return null;
};
