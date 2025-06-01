
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
        className={`w-1 rounded-full transition-all duration-75 ${
          isBarActive 
            ? 'bg-gradient-to-t from-green-400 to-green-600 shadow-sm' 
            : 'bg-gray-200'
        }`}
        style={{
          height: `${8 + index * 3}px`, // Bars get progressively taller
          opacity: isBarActive ? 1 : 0.3,
        }}
      />
    );
  });

  return (
    <div className="flex items-end justify-center gap-1 h-12 px-4">
      {bars}
    </div>
  );
};

export default AudioLevelIndicator;
