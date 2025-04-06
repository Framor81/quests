'use client'

import ClientNavigation from '@/components/ClientNavigation';
import { useEffect, useRef, useState } from 'react';
import { createNoise2D } from 'simplex-noise';

function generateComplexPath(userId: string, level: number) {
  // Create a deterministic seed based on user ID
  const seed = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const noise2D = createNoise2D(() => {
    // Create a deterministic random number generator based on the seed
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  });
  
  // Map dimensions and characteristics
  const startX = 100; // Starting point further right
  const baseWidth = 900; // Base width for low levels
  const widthPerLevel = 120; // Additional width per level
  const totalWidth = baseWidth + (level * widthPerLevel);
  
  const points = [];
  const segmentsPerLevel = 15; // Higher density of points for smoother curves
  const totalSegments = level * segmentsPerLevel;
  
  // Main parameters for path generation
  const baseY = 250;
  const verticalAmplitude = 100; // Reduced amplitude for less vertical movement
  const maxCurveDepth = Math.min(30 + (level * 2), 80); // Reduced curve depth

  // Track overall progress to ensure general rightward movement
  let overallProgress = 0;
  let lastX = startX;
  let lastY = baseY;
  
  // Add starting point
  points.push({ x: startX, y: baseY });
  
  // Generate path points
  for (let i = 1; i <= totalSegments; i++) {
    // Progress factor (0 to 1)
    const progress = i / totalSegments;
    
    // Ensure overall rightward movement
    const targetProgress = progress * totalWidth;
    // Pull factor increases as we get further behind the ideal progress
    const pullFactor = Math.max(0, Math.min(1, (targetProgress - overallProgress) / 300));
    
    // Generate noise values for x and y movements
    const noiseX = noise2D(i * 0.05, seed * 0.1) * (1 - pullFactor);
    const noiseY = noise2D(i * 0.08, (seed + 100) * 0.1);
    
    // Calculate potential movements
    const xMove = 10 + (pullFactor * 20); // Base forward movement
    const yMove = noiseY * verticalAmplitude;
    
    // Add curve chance and loops
    let curveX = lastX + xMove;
    let curveY = lastY + yMove;
    
    // Ensure y stays within screen bounds (100px from top and bottom)
    curveY = Math.max(100, Math.min(window.innerHeight - 100, curveY));
    
    // Occasionally add loops or curves (more frequent at higher levels)
    const curveChance = Math.min(0.15 + (level * 0.01), 0.35);
    if (noise2D(i * 0.2, seed * 0.3) > (1 - curveChance)) {
      // Create a curve by adding intermediate points
      const curveIntensity = (noise2D(i * 0.4, seed * 0.5) + 1) * maxCurveDepth;
      const curveMidpointX = lastX + xMove * 0.3 + (noiseX * curveIntensity);
      const curveMidpointY = lastY + (noiseY + noise2D(i * 0.3, seed * 0.2)) * curveIntensity;
      
      // Ensure midpoint stays within screen bounds
      const boundedMidpointY = Math.max(100, Math.min(window.innerHeight - 100, curveMidpointY));
      
      // Add midpoint to create curve
      points.push({ x: curveMidpointX, y: boundedMidpointY });
    }
    
    // Add main point
    points.push({ x: curveX, y: curveY });
    
    // Update last position and overall progress
    lastX = curveX;
    lastY = curveY;
    overallProgress = curveX - startX;
  }
  
  // Ensure final point is proportional to level and within bounds
  const finalY = Math.max(100, Math.min(window.innerHeight - 100, baseY + (noise2D(1, seed) * 40)));
  points.push({ x: startX + totalWidth, y: finalY });
  
  return points;
}

export default function MapPage({ userId, level }: { userId: string; level: number }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const points = generateComplexPath(userId, Math.max(1, level));
  const mapWidth = points.reduce((max, p) => Math.max(max, p.x), 0) + 100;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate current position based on level progress
  useEffect(() => {
    if (scrollRef.current) {
      // Automatically scroll to show user's current position
      const currentPointIndex = Math.min(points.length - 1, level * 15);
      const currentX = points[currentPointIndex]?.x || 0;
      
      // Center the current position if possible
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          left: Math.max(0, currentX - window.innerWidth / 2),
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [level, points, windowSize]);

  // Determine milestones (one every 5 levels)
  const milestones = [];
  for (let i = 0; i <= Math.min(level + 5, points.length - 1); i += 5) {
    if (i > 0) { // Skip level 0
      const pointIndex = Math.min(i * 15, points.length - 1);
      milestones.push({
        level: i,
        point: points[pointIndex],
        unlocked: level >= i
      });
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Background Container */}
      <div className="fixed inset-0 w-screen h-screen bg-[url('/parchment-tile.png')] bg-repeat bg-center bg-[#F5E6D3] z-0" />

      {/* Navigation Banner */}
      <div className="fixed top-0 left-0 w-full z-20 text-black">
        <ClientNavigation />
      </div>
      
      {/* Map Container */}
      <div 
        ref={scrollRef}
        className="relative w-screen h-[calc(100vh-4rem)] overflow-x-auto overflow-y-hidden mt-16"
      >
        <div 
          className="absolute inset-0 bg-[#F5E6D3]/20 backdrop-blur-sm"
          style={{ width: `${mapWidth}px`, minWidth: '100vw' }}
        />
        
        <div 
          className="relative h-full" 
          style={{ width: `${mapWidth}px`, minWidth: '100vw' }}
        >
          <svg width={mapWidth} height="100%">
            {/* Path background for glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Main Path */}
            <path
              d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#e11d48" // Red color
              strokeWidth={4}
              strokeDasharray="8,4"
              filter="url(#glow)"
            />
            
            {/* Draw journey points every few segments */}
            {points.filter((_, idx) => idx % 15 === 0 || idx === points.length - 1).map((point, idx) => {
              const pointLevel = Math.floor(idx * level / (points.length / 15));
              const isCompleted = pointLevel <= level;
              const isCurrent = pointLevel === level;
              return (
                <g key={idx}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isCurrent ? "12" : "8"}
                    fill={isCurrent ? '#16A34A' : isCompleted ? '#FBBF24' : '#94a3b8'}
                    stroke="#742a2a"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                </g>
              );
            })}
            
            {/* Milestone markers */}
            {milestones.map((milestone) => (
              <g key={`milestone-${milestone.level}`}>
                <circle
                  cx={milestone.point.x}
                  cy={milestone.point.y}
                  r="18"
                  fill={milestone.unlocked ? '#f97316' : '#94a3b8'}
                  stroke="#742a2a"
                  strokeWidth="3"
                  className="drop-shadow-xl"
                />
                <text
                  x={milestone.point.x}
                  y={milestone.point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontWeight="bold"
                  fontSize="12"
                >
                  {milestone.level}
                </text>
                {milestone.unlocked && (
                  <path
                    d={`M ${milestone.point.x - 5},${milestone.point.y} L ${milestone.point.x + 1},${milestone.point.y + 5} L ${milestone.point.x + 7},${milestone.point.y - 5}`}
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                )}
              </g>
            ))}
          </svg>
          
          {/* Map Title */}
          <div className="absolute top-4 left-4 text-3xl font-bold text-[#742a2a] drop-shadow-lg font-serif">
            🗺️ Your Treasure Trail
          </div>
          
          {/* User Info Badge */}
          <div className="fixed top-20 right-4 bg-amber-100/80 border-2 border-amber-700 rounded-lg p-3 shadow-lg">
            <div className="text-amber-900 font-bold">Explorer Level: {level}</div>
            <div className="text-amber-800 text-sm">Points to next level: {(level + 1) * (level + 1) * 5 - (level * level * 5)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}