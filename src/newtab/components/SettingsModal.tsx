
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

  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.heading}>Pomodoro Settings</h2>
        <form
          className={styles.form}
          onSubmit={e => {
            e.preventDefault();
            onClose();
            chrome.storage.local.set({ pomodoroDurations: durations, userName: name });
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
              value={durations.long}
              onChange={e => setDurations({ ...durations, long: Number(e.target.value) })}
            />
          </label>
          <button type="submit" className={styles.saveBtn}>Save</button>
        </form>
        <button onClick={onClose} className={styles.closeBtn} title="Close">×</button>
      </div>
    </div>
  );
};
