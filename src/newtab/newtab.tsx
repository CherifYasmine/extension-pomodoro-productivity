
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import './newtab.css';
import { SettingsModal } from './components/settings/SettingsModal';
import { PomodoroPanelOrGreeting } from './components/main_view/PomodoroPanelOrGreeting';
import { TodoList } from './components/todo_list/TodoList';
import { BlockSitesModal } from './components/blocked_sites/BlockSitesModal';


const DEFAULTS = { focus: 25, break: 5, long: 15 };
type Phase = 'focus' | 'break' | 'long-break' | 'idle';
interface PomodoroState {
    phase: Phase;
    endsAt: number | null;
    running: boolean;
    pausedAt?: number | null;
    cycle: number; // completed focus sessions in current set
}


const NewTabApp: React.FC = () => {
    const [name, setName] = useState('');
    const [mainTask, setMainTask] = useState('');
    const [editTask, setEditTask] = useState(false);
    const [time, setTime] = useState(new Date());
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [todoOpen, setTodoOpen] = useState(false);
    const [blockSitesOpen, setBlockSitesOpen] = useState(false);
    const [durations, setDurations] = useState<{ focus: number, break: number, long: number }>(DEFAULTS);

    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        chrome.storage.local.get(['userName', 'mainTask', 'pomodoroDurations'], (res) => {
            if (res.userName) setName(res.userName);
            if (res.mainTask) setMainTask(res.mainTask.text || '');
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
            {/* Block Sites button above tasks and settings */}
            <button
                style={{ position: 'fixed', bottom: 124, left: 24, zIndex: 12, background: '#898787ff', border: 'none', borderRadius: 40, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.5em', color: '#fff', boxShadow: '0 2px 8px #0006' }}
                onClick={() => setBlockSitesOpen(true)}
                title="Block Sites"
            >
                <span role="img" aria-label="block">🚫</span>
            </button>
            {/* Tasks button above settings */}
            <button
                style={{ position: 'fixed', bottom: 74, left: 24, zIndex: 11, background: '#898787ff', border: 'none', borderRadius: 40, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.5em', color: '#fff', boxShadow: '0 2px 8px #0006' }}
                onClick={() => setTodoOpen(v => !v)}
                title="Tasks"
            >
                <span role="img" aria-label="tasks">📝</span>
            </button>
            {/* Settings button */}
            <button
                style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 10, background: '#898787ff', border: 'none', borderRadius: 40, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.5em', color: '#fff', boxShadow: '0 2px 8px #0006' }}
                onClick={() => setSettingsOpen(true)}
                title="Settings"
            >
                <span role="img" aria-label="settings">⚙️</span>
            </button>
            {/* BlockSites modal */}
            {blockSitesOpen && (
                <BlockSitesModal open={blockSitesOpen} onClose={() => setBlockSitesOpen(false)} />
            )}
            {/* TodoList dropdown */}
            <TodoList open={todoOpen} onClose={() => setTodoOpen(false)} />
            {/* Settings modal */}
            <SettingsModal open={settingsOpen} durations={durations} setDurations={setDurations} onClose={() => setSettingsOpen(false)} name={name} setName={setName} />
            {/* Show PomodoroPanel if running/paused, else greeting/task UI */}
            <PomodoroPanelOrGreeting durations={durations} time={time} name={name} mainTask={mainTask} editTask={editTask} setMainTask={setMainTask} setEditTask={setEditTask} />
        </div>
    );
};



createRoot(document.getElementById('root')!).render(<NewTabApp />);
