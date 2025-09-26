import React, { useEffect, useState } from 'react';
import { PomodoroPanel } from './PomodoroPanel';
import { useRotatingQuoteIdx, InspirationalQuote } from '../../../shared/rotatingQuote';

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
  const [userName, setUserName] = useState<string>(name || '');
  const [editingName, setEditingName] = useState<boolean>(false);
  // Call hooks unconditionally (must be before any early returns)
  const quoteIdx = useRotatingQuoteIdx();
  useEffect(() => {
    chrome.storage.local.get(['pomodoroState'], (res) => {
      if (res.pomodoroState) setPomodoro(res.pomodoroState);
    });
    chrome.storage.local.get(['userName'], (res) => {
      if (typeof res.userName === 'string') setUserName(res.userName);
    });
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.pomodoroState && changes.pomodoroState.newValue) {
        setPomodoro(changes.pomodoroState.newValue);
      }
      if (changes.userName && typeof changes.userName.newValue === 'string') {
        setUserName(changes.userName.newValue || '');
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // If no name yet, automatically start editing mode
  useEffect(() => {
    if (!userName) setEditingName(true);
  }, [userName]);
  if (pomodoro && (pomodoro.running || (!pomodoro.running && pomodoro.pausedAt != null && pomodoro.phase !== 'idle'))) {
    return <PomodoroPanel durations={durations} />; // Early return AFTER all hooks have been called
  }
  const nameWidthCh = Math.min(Math.max((userName ? userName : 'your name').length, 4), 20); // reserve space for placeholder
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formattedDateTime = `${shortMonths[time.getMonth()]} ${time.getDate()}, ${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}`;
  return (
    <>
      <div className="newtab-time">{formattedDateTime}</div>
      <div className="newtab-greeting" style={{display:'flex',justifyContent:'center',gap:'0.4ch',flexWrap:'wrap'}}>
        <span>{getGreetingPrefix()},</span>
        {editingName ? (
          <input
            autoFocus
            value={userName}
            placeholder="your name"
            onChange={e => setUserName(e.target.value)}
            onBlur={() => { setEditingName(false); chrome.storage.local.set({ userName: userName.trim() }); }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditingName(false); chrome.storage.local.set({ userName: userName.trim() }); } }}
            style={{
              background:'transparent',
              border:'none',
              borderBottom:'2px solid rgba(255,255,255,0.25)',
              outline:'none',
              color:'inherit',
              font:'inherit',
              fontSize:'inherit',
              textAlign:'left',
              padding:'0 0.25ch',
              minWidth:'4ch',
              width: `${nameWidthCh}ch`
            }}
          />
        ) : (
          <span
            onDoubleClick={() => setEditingName(true)}
            style={{cursor:'pointer'}}
            title="Double click to edit your name"
          >{userName || '—'}</span>
        )}
        <span>.</span>
      </div>
      <div className="newtab-task-label">What is your primary goal for today?</div>
      {editTask ? (
        <input className="newtab-task-input" value={mainTask} autoFocus onChange={e=>setMainTask(e.target.value)} onBlur={()=>{setEditTask(false);chrome.storage.local.set({mainTask:{text:mainTask,done:false}});}} onKeyDown={e=>{if(e.key==='Enter'){setEditTask(false);chrome.storage.local.set({mainTask:{text:mainTask,done:false}});}}} />
      ) : (
        <input className="newtab-task-input" value={mainTask} readOnly onClick={()=>setEditTask(true)} />
      )}
      <button className="newtab-focus-btn" onClick={() => {
        const endsAt = Date.now() + durations.focus*60*1000;
        const next = { phase: 'focus', running: true, endsAt, cycle: pomodoro && typeof pomodoro.cycle === 'number' ? pomodoro.cycle : 0 };
        setPomodoro(next);
        chrome.storage.local.set({ pomodoroState: next });
      }}>
        Start Focus
      </button>
  <InspirationalQuote quoteIdx={quoteIdx} />
    </>
  );
};

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 18) return `Good afternoon, ${name}.`;
  return `Good evening, ${name}.`;
}

function getGreetingPrefix() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
