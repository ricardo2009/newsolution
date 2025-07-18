'use client';

import React, { useState, useEffect } from 'react';

interface TimerProps {
  isRunning: boolean;
  startTime: Date;
  onTimeUpdate?: (timeElapsed: number) => void;
}

const Timer: React.FC<TimerProps> = ({ isRunning, startTime, onTimeUpdate }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - new Date(startTime).getTime();
        setTimeElapsed(elapsed);
        
        if (onTimeUpdate) {
          onTimeUpdate(elapsed);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime, onTimeUpdate]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 30) return 'text-green-600';
    if (minutes < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-sm text-gray-600">
          {isRunning ? 'Tempo:' : 'Pausado:'}
        </span>
      </div>
      <div className={`font-mono text-lg font-bold ${getTimeColor(timeElapsed)}`}>
        {formatTime(timeElapsed)}
      </div>
    </div>
  );
};

export default Timer;
