
import React from 'react';

interface AudioLevelIndicatorProps {
  audioLevel: number; // 0-100
  isActive: boolean;
}

const AudioLevelIndicator = ({ audioLevel, isActive }: AudioLevelIndicatorProps) => {
  // Create 12 bars for the indicator
  const bars = Array.from({ length: 12 }, (_, index) => {
    const barThreshold = (index + 1) * (100 / 12);
    const isBarActive = isActive && audioLevel >= barThreshold;
    
    return (
      <div
        key={index}
        className={`
          w-1 rounded-full transition-all duration-75
          ${isBarActive 
            ? 'bg-gradient-to-t from-green-400 to-green-600 shadow-md animate-pulse'
            : 'bg-gray-300'
          }
        `}
        style={{
          height: `${12 + index * 5}px`, // Bars are taller for more drama
          opacity: isActive ? (isBarActive ? 1 : 0.5) : 0.2,
          transition: 'height 0.14s, opacity 0.14s',
        }}
      />
    );
  });

  return (
    <div className="flex items-end justify-center gap-1 h-16 px-4">
      {bars}
    </div>
  );
};

export default AudioLevelIndicator;

