import { useState } from 'react';

interface Props {
  name: string;
  onSave: (name: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const Greeting: React.FC<Props> = ({ name, onSave }: Props) => {
  const [edit, setEdit] = useState(!name);
  const [temp, setTemp] = useState(name || '');

  const save = () => {
    if (temp.trim()) {
      onSave(temp.trim());
      setEdit(false);
    }
  };

  return (
    <div className="greeting">
      {edit ? (
        <div className="name-form">
          <input
            placeholder="Your name"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
          <button onClick={save}>Save</button>
        </div>
      ) : (
        <h1 onDoubleClick={() => setEdit(true)}>{getGreeting()} {name}</h1>
      )}
    </div>
  );
};
