import React, { useEffect, useState } from 'react';
import { PomodoroCircle } from './PomodoroTimer';
import {
  PomodoroStateCanonical,
  readState,
  pauseState,
  resumeState,
  stopState,
  startFocus,
  startBreakPhase,
  autoTransition,
  computeDisplayCycle,
  persistState,
  normalizeDurations,
  CYCLES_BEFORE_LONG_BREAK
} from '../../shared/pomodoroLogic';

interface PomodoroPanelProps { durations: { focus: number; break: number; long: number }; }
const initialPomodoro: PomodoroStateCanonical = { phase: 'idle', endsAt: null, running: false, cycle: 0 };

export const PomodoroPanel: React.FC<PomodoroPanelProps> = ({ durations }) => {
  const [pomodoro, setPomodoro] = useState<PomodoroStateCanonical>(initialPomodoro);

  // Subscribe to storage changes
  useEffect(() => {
    readState((s) => setPomodoro(s));
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.pomodoroState && changes.pomodoroState.newValue) setPomodoro(changes.pomodoroState.newValue as PomodoroStateCanonical);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Tick / auto transition
  useEffect(() => {
    if (!pomodoro.running || !pomodoro.endsAt) return;
    const id = setInterval(() => {
      const maybe = autoTransition(pomodoro, normalizeDurations(durations));
      if (maybe) update(maybe); else setPomodoro(p => ({ ...p }));
    }, 1000);
    return () => clearInterval(id);
  }, [pomodoro, durations]);

  const update = (next: PomodoroStateCanonical) => { setPomodoro(next); persistState(next); };
  const doStartFocus = () => update(startFocus(pomodoro, normalizeDurations(durations)));
  const doStartBreak = () => update(startBreakPhase({ ...pomodoro, phase: 'focus' }, normalizeDurations(durations)));
  const doPause = () => update(pauseState(pomodoro));
  const doResume = () => update(resumeState(pomodoro));
  const doStop = () => update(stopState());

  const timerSeconds = pomodoro.running && pomodoro.endsAt
    ? Math.max(0, Math.floor((pomodoro.endsAt - Date.now())/1000))
    : pomodoro.pausedAt
      ? Math.floor(pomodoro.pausedAt/1000)
      : (pomodoro.phase==='focus'?durations.focus*60:pomodoro.phase==='break'?durations.break*60:durations.long*60);
  const percent = pomodoro.phase==='focus' ? timerSeconds/(durations.focus*60) : pomodoro.phase==='break' ? timerSeconds/(durations.break*60) : pomodoro.phase==='long-break' ? timerSeconds/(durations.long*60) : 0;
  const timeStr = `${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`;
  const cycleDisplay = computeDisplayCycle(pomodoro);

  return (
    <>
      <div className="pomodoro-tabs">
        <div className={"pomodoro-tab"+(pomodoro.phase==='focus'?' active':'')} onClick={()=>{if(pomodoro.phase!=='focus') doStartFocus();}}>FOCUS</div>
        <div className={"pomodoro-tab"+(pomodoro.phase==='break'?' active':'')} onClick={()=>{if(pomodoro.phase!=='break') doStartBreak();}}>BREAK</div>
      </div>
      <PomodoroCircle percent={percent} time={timeStr} label={pomodoro.phase==='focus'?'Focus':pomodoro.phase==='break'?'Break':'Long Break'} />
      <div style={{display:'flex',gap:'1em',justifyContent:'center'}}>
        <button className="newtab-focus-btn" style={{background:'#b91c1c',marginTop:'1em'}} onClick={doStop}>Stop</button>
        {pomodoro.running && <button className="newtab-focus-btn" style={{background:'#f59e42',marginTop:'1em'}} onClick={doPause}>Pause</button>}
        {!pomodoro.running && pomodoro.pausedAt && <button className="newtab-focus-btn" style={{background:'#2563eb',marginTop:'1em'}} onClick={doResume}>Resume</button>}
      </div>
      <div style={{marginTop:'1em',fontSize:'1.2vw',opacity:0.7}}>
        Cycle: {cycleDisplay}/{CYCLES_BEFORE_LONG_BREAK} {pomodoro.phase==='long-break' && '(Long Break)'}
      </div>
    </>
  );
};
