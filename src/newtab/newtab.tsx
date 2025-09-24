
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import './newtab.css';
import { SettingsModal } from './components/SettingsModal';
import { PomodoroPanel } from './components/PomodoroPanel';
import { PomodoroPanelOrGreeting } from './components/PomodoroPanelOrGreeting';


function getGreeting(name: string) {
	const hour = new Date().getHours();
	if (hour < 12) return `Good morning, ${name}.`;
	if (hour < 18) return `Good afternoon, ${name}.`;
	return `Good evening, ${name}.`;
}


const DEFAULTS = { focus: 25, break: 5, long: 15 };
type Phase = 'focus' | 'break' | 'long-break' | 'idle';
interface PomodoroState {
	phase: Phase;
	endsAt: number | null;
	running: boolean;
	pausedAt?: number | null;
	cycle: number; // completed focus sessions in current set
}
const initialPomodoro: PomodoroState = { phase: 'idle', endsAt: null, running: false, cycle: 0 };



const NewTabApp: React.FC = () => {
	const [name, setName] = useState('');
	const [mainTask, setMainTask] = useState('');
	const [editTask, setEditTask] = useState(false);
	const [time, setTime] = useState(new Date());
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [durations, setDurations] = useState<{focus:number,break:number,long:number}>(DEFAULTS);

	useEffect(() => {
		const id = setInterval(() => setTime(new Date()), 1000);
		chrome.storage.local.get(['userName','mainTask','pomodoroDurations'], (res) => {
			if (res.userName) setName(res.userName);
			if (res.mainTask) setMainTask(res.mainTask.text||'');
			if (res.pomodoroDurations) setDurations({
				focus: Number(res.pomodoroDurations.focus) || DEFAULTS.focus,
				break: Number(res.pomodoroDurations.break) || DEFAULTS.break,
				long: Number(res.pomodoroDurations.long) || DEFAULTS.long
			});
		});
		const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
			if (changes.pomodoroDurations && changes.pomodoroDurations.newValue) {
				setDurations({
					focus: Number(changes.pomodoroDurations.newValue.focus) || DEFAULTS.focus,
					break: Number(changes.pomodoroDurations.newValue.break) || DEFAULTS.break,
					long: Number(changes.pomodoroDurations.newValue.long) || DEFAULTS.long
				});
			}
		};
		chrome.storage.onChanged.addListener(listener);
		return () => {
			clearInterval(id);
			chrome.storage.onChanged.removeListener(listener);
		};
	}, []);

	return (
		<div className="newtab-center">
			{/* Settings button */}
			<button
				style={{position:'absolute',top:24,left:24,zIndex:10,background:'#ccc',border:'none',borderRadius:40,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'1.5em',color:'#fff'}}
				onClick={()=>setSettingsOpen(true)}
				title="Settings"
			>
				<span role="img" aria-label="settings">⚙️</span>
			</button>
			{/* Settings modal */}
			<SettingsModal open={settingsOpen} durations={durations} setDurations={setDurations} onClose={()=>setSettingsOpen(false)} name={name} setName={setName} />
			{/* Show PomodoroPanel if running/paused, else greeting/task UI */}
			<PomodoroPanelOrGreeting durations={durations} time={time} name={name} mainTask={mainTask} editTask={editTask} setMainTask={setMainTask} setEditTask={setEditTask} />
		</div>
	);
};



createRoot(document.getElementById('root')!).render(<NewTabApp />);
