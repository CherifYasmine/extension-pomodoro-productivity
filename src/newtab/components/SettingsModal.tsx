import React from 'react';

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
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#222',padding:'2em',borderRadius:16,minWidth:320,boxShadow:'0 4px 32px #000a',position:'relative'}} onClick={e=>e.stopPropagation()}>
        <h2 style={{marginTop:0,textAlign:'center'}}>Pomodoro Settings</h2>
        <form onSubmit={e=>{e.preventDefault();onClose();chrome.storage.local.set({pomodoroDurations:durations, userName: name});}} style={{display:'flex',flexDirection:'column',gap:'1em'}}>
          {setName && (
            <label>Name:
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{marginLeft:8}} />
            </label>
          )}
          <label>Focus (minutes):
            <input type="number" min={1} max={120} value={durations.focus} onChange={e=>setDurations({...durations,focus:Number(e.target.value)})} style={{marginLeft:8,width:60}} />
          </label>
          <label>Break (minutes):
            <input type="number" min={1} max={60} value={durations.break} onChange={e=>setDurations({...durations,break:Number(e.target.value)})} style={{marginLeft:8,width:60}} />
          </label>
          <label>Long Break (minutes):
            <input type="number" min={1} max={60} value={durations.long} onChange={e=>setDurations({...durations,long:Number(e.target.value)})} style={{marginLeft:8,width:60}} />
          </label>
          <button type="submit" style={{marginTop:'1em',padding:'0.5em 2em',borderRadius:8,border:'none',background:'#2563eb',color:'#fff',fontWeight:600,fontSize:'1.1em',cursor:'pointer'}}>Save</button>
        </form>
        <button onClick={onClose} style={{position:'absolute',top:8,right:12,background:'none',border:'none',color:'#fff',fontSize:'1.5em',cursor:'pointer'}} title="Close">×</button>
      </div>
    </div>
  );
};
