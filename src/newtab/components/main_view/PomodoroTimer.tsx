import React from 'react';

interface PomodoroTimerProps {
  percent: number;
  time: string;
  label: string;
}

export const PomodoroCircle: React.FC<PomodoroTimerProps> = ({ percent, time, label }) => (
  <div className="pomodoro-circle">
    <svg>
      {/* use fixed viewBox for predictable rendering and sharp edges */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
        <circle cx="50" cy="50" r="45" stroke="#fff4" strokeWidth="6" fill="none" />
        {/*
          circumference = 2 * Math.PI * r
          when percent === 1 => dashoffset = 0 (full white)
          when percent === 0 => dashoffset = circumference (empty)
        */}
        {
          (() => {
            const r = 45;
            const c = Math.PI * 2 * r;
            const dasharray = c;
            const dashoffset = c * (1 - Math.max(0, Math.min(1, percent)));
            return (
              <circle
                cx="50"
                cy="50"
                r={r}
                stroke="#fff"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.2s' }}
              />
            );
          })()
        }
      </svg>
    </svg>
    <div className="pomodoro-circle-time">{time}<div style={{fontSize:'1vw',fontWeight:400,opacity:0.7}}>{label}</div></div>
  </div>
);
