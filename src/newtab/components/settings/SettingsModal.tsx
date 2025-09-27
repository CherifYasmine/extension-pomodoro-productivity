
import React from 'react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  open: boolean;
  durations: { focus: number; break: number; long: number };
  setDurations: (d: { focus: number; break: number; long: number }) => void;
  onClose: () => void;
  name?: string;
  setName?: (n: string) => void;
}


export const SettingsModal: React.FC<SettingsModalProps> = ({ open, durations, setDurations, onClose, name = '', setName }) => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [theme, setTheme] = React.useState<'auto' | 'light' | 'dark'>('auto');
  const [systemDark, setSystemDark] = React.useState<boolean>(() => (
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  ));
  React.useEffect(() => {
    chrome.storage.local.get(['pomodoroNotifications', 'theme'], res => {
      if (typeof res.pomodoroNotifications === 'boolean') setNotificationsEnabled(res.pomodoroNotifications);
      else setNotificationsEnabled(true);
      if (res.theme === 'light' || res.theme === 'dark' || res.theme === 'auto') setTheme(res.theme);
      else setTheme('auto');
    });
  }, [open]);

  React.useEffect(() => {
    if (theme !== 'auto') return;
    if (!('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', listener);
    return () => {
      mq.removeEventListener('change', listener);
    };
  }, [theme]);

  const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'light' ? 'theme-light' : (systemDark ? 'theme-dark' : 'theme-light');
  if (!open) return null;
  return (
    <div className={`${themeClass} ${styles.modalOverlay}`} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.heading}>Pomodoro Settings</h2>
        <form
          className={styles.form}
          onSubmit={e => {
            e.preventDefault();
            onClose();
            chrome.storage.local.set({ pomodoroDurations: durations, userName: name, pomodoroNotifications: notificationsEnabled, theme });
          }}
        >
          {setName && (
            <label className={styles.label}>
              Name:
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
          )}
          <label className={styles.label}>
            Focus (minutes):
            <input
              className={styles.input}
              type="number"
              min={1}
              max={120}
              step={1}
              value={durations.focus}
              onChange={e => setDurations({ ...durations, focus: Number(e.target.value) })}
            />
          </label>
          <label className={styles.label}>
            Break (minutes):
            <input
              className={styles.input}
              type="number"
              min={1}
              max={60}
              step={1}
              value={durations.break}
              onChange={e => setDurations({ ...durations, break: Number(e.target.value) })}
            />
          </label>
          <label className={styles.label}>
            Long Break (minutes):
            <input
              className={styles.input}
              type="number"
              min={1}
              max={60}
              step={1}
              value={durations.long}
              onChange={e => setDurations({ ...durations, long: Number(e.target.value) })}
            />
          </label>
          <label className={styles.label} style={{display:'flex',alignItems:'center',gap:'0.5em',marginTop:'1em'}}>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={e => setNotificationsEnabled(e.target.checked)}
              style={{width:'1.2em',height:'1.2em'}}
            />
            Enable sound & notifications
          </label>
          <label className={styles.label} style={{marginTop:'1em'}}>
            Theme:
            <select
              className={styles.input}
              value={theme}
              onChange={e => setTheme(e.target.value as 'auto' | 'light' | 'dark')}
            >
              <option value="auto">Auto (System)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button type="submit" className={styles.saveBtn}>Save</button>
        </form>
        <button onClick={onClose} className={styles.closeBtn} title="Close">×</button>
      </div>
    </div>
  );
};
