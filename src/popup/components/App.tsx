import { useEffect, useState } from 'react';
import { Clock } from './Clock';
import { Greeting } from './Greeting';
import { MainTask } from './MainTask';
import { Pomodoro } from './Pomodoro';

export const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['userName'], (res: { userName?: string }) => {
      if (res && res.userName) setName(res.userName);
      setLoaded(true);
    });
  }, []);

  const handleSaveName = (newName: string) => {
    setName(newName);
  chrome.storage.local.set({ userName: newName });
  };

  if (!loaded) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <Clock />
      <Greeting name={name} onSave={handleSaveName} />
      <MainTask />
      <Pomodoro />
    </div>
  );
};
