import { useEffect, useState } from 'react';

export const Clock: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return <div className="clock" aria-label="current time">{time}</div>;
};
