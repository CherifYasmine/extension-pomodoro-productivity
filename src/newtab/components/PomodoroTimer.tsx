import React from 'react';

interface PomodoroTimerProps {
  percent: number;
  time: string;
  label: string;
}

export const PomodoroCircle: React.FC<PomodoroTimerProps> = ({ percent, time, label }) => (
  <div className="pomodoro-circle">
    <svg>
      <circle cx="50%" cy="50%" r="48%" stroke="#fff4" strokeWidth="6%" fill="none" />
      <circle
        cx="50%" cy="50%" r="48%"
        stroke="#fff"
        strokeWidth="6%"
        fill="none"
        strokeDasharray={Math.PI * 2 * 48}
        strokeDashoffset={Math.PI * 2 * 48 * (1 - percent)}
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
    </svg>
    <div className="pomodoro-circle-time">{time}<div style={{fontSize:'1vw',fontWeight:400,opacity:0.7}}>{label}</div></div>
  </div>
);
