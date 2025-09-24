import React, { useEffect, useState } from 'react';
import { PomodoroPanel } from './PomodoroPanel';

interface Props {
  durations: { focus: number; break: number; long: number };
  time: Date;
  name: string;
  mainTask: string;
  editTask: boolean;
  setMainTask: (t: string) => void;
  setEditTask: (b: boolean) => void;
}

export const PomodoroPanelOrGreeting: React.FC<Props> = ({ durations, time, name, mainTask, editTask, setMainTask, setEditTask }) => {
  const [pomodoro, setPomodoro] = useState<any>(null);
  useEffect(() => {
    chrome.storage.local.get(['pomodoroState'], (res) => {
      if (res.pomodoroState) setPomodoro(res.pomodoroState);
    });
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.pomodoroState && changes.pomodoroState.newValue) {
        setPomodoro(changes.pomodoroState.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);
  if (pomodoro && (pomodoro.running || (!pomodoro.running && pomodoro.pausedAt != null && pomodoro.phase !== 'idle'))) {
    return <PomodoroPanel durations={durations} />;
  }
  return (
    <>
      <div className="newtab-time">{time.getHours().toString().padStart(2,'0')}:{time.getMinutes().toString().padStart(2,'0')}</div>
      <div className="newtab-greeting">{getGreeting(name||'')}</div>
      <div className="newtab-task-label">What is your main focus for today?</div>
      {editTask ? (
        <input className="newtab-task-input" value={mainTask} autoFocus onChange={e=>setMainTask(e.target.value)} onBlur={()=>{setEditTask(false);chrome.storage.local.set({mainTask:{text:mainTask,done:false}});}} onKeyDown={e=>{if(e.key==='Enter'){setEditTask(false);chrome.storage.local.set({mainTask:{text:mainTask,done:false}});}}} />
      ) : (
        <input className="newtab-task-input" value={mainTask} readOnly onClick={()=>setEditTask(true)} />
      )}
      <button className="newtab-focus-btn" onClick={() => {
        const endsAt = Date.now() + durations.focus*60*1000;
        const next = { phase: 'focus', running: true, endsAt, cycle: pomodoro && typeof pomodoro.cycle === 'number' ? pomodoro.cycle : 0 };
        chrome.storage.local.set({ pomodoroState: next });
      }}>
        Start Focus
      </button>
    </>
  );
};

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 18) return `Good afternoon, ${name}.`;
  return `Good evening, ${name}.`;
}
