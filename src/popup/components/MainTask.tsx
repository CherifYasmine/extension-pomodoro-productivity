import { useEffect, useState } from 'react';

interface TaskData {
  text: string;
  done: boolean;
}

export const MainTask: React.FC = () => {
  const [task, setTask] = useState<TaskData>({ text: '', done: false });
  const [edit, setEdit] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['mainTask'], (res: { mainTask?: TaskData }) => {
      if (res && res.mainTask) {
        setTask(res.mainTask);
        setEdit(false);
      }
    });
  }, []);

  const save = () => {
    if (task.text.trim()) {
      chrome.storage.local.set({ mainTask: task });
      setEdit(false);
    }
  };

  const toggleDone = () => {
    const updated = { ...task, done: !task.done };
    setTask(updated);
    chrome.storage.local.set({ mainTask: updated });
  };

  return (
    <div className="main-task">
      <h2>Main Task Today</h2>
      {edit ? (
        <div className="task-edit">
          <input
            placeholder="What is the one thing you'll do today?"
            value={task.text}
            onChange={(e) => setTask({ ...task, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
          <button onClick={save}>Save</button>
        </div>
      ) : (
        <div className="task-view" onDoubleClick={() => setEdit(true)}>
          <label className={task.done ? 'done' : ''}>
            <input type="checkbox" checked={task.done} onChange={toggleDone} /> {task.text}
          </label>
        </div>
      )}
    </div>
  );
};
