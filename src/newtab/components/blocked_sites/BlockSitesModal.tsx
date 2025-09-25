import React, { useState, useEffect } from 'react';
import styles from './BlockSitesModal.module.css';

interface BlockSitesModalProps {
  open: boolean;
  onClose: () => void;
}


export const BlockSitesModal: React.FC<BlockSitesModalProps> = ({ open, onClose }) => {
  const [sites, setSites] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto');
  const [systemDark, setSystemDark] = useState<boolean>(() => (
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  ));
  const DEFAULT_SITES = [
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'tiktok.com',
    'reddit.com',
    'youtube.com',
    'linkedin.com',
    'pinterest.com',
    'snapchat.com',
    'discord.com',
    'whatsapp.com',
  ];

  useEffect(() => {
    if (open) {
      chrome.storage.local.get(['blockedSites', 'theme'], res => {
        let current = Array.isArray(res.blockedSites) ? res.blockedSites : [];
        // If no sites set, use defaults
        if (!current.length) {
          current = DEFAULT_SITES;
          chrome.storage.local.set({ blockedSites: current });
        }
        setSites(current);
        if (res.theme === 'light' || res.theme === 'dark' || res.theme === 'auto') setTheme(res.theme);
        else setTheme('auto');
      });
    }
  }, [open]);

  // Listen to system theme changes when in Auto
  useEffect(() => {
    if (theme !== 'auto') return;
    if (!('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', listener);
    return () => {
      mq.removeEventListener('change', listener);
    };
  }, [theme]);

  const addSite = () => {
    const site = input.trim();
    if (site && !sites.includes(site)) {
      const updated = [...sites, site];
      setSites(updated);
      chrome.storage.local.set({ blockedSites: updated });
      setInput('');
    }
  };

  const removeSite = (site: string) => {
    const updated = sites.filter(s => s !== site);
    setSites(updated);
    chrome.storage.local.set({ blockedSites: updated });
  };

  const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'light' ? 'theme-light' : (systemDark ? 'theme-dark' : 'theme-light');
  if (!open) return null;
  return (
    <div className={`${themeClass} ${styles.modalOverlay}`} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.heading}>Block Sites while working</h2>
        <div className={styles.form}>
          <label className={styles.label}>
            Add site (domain only):
            <input
              className={styles.input}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. facebook.com"
              onKeyDown={e => { if (e.key === 'Enter') addSite(); }}
            />
            <button className={styles.saveBtn} type="button" onClick={addSite}>Add</button>
          </label>
          <ul className={styles.siteList}>
            {sites.map(site => (
              <li key={site} className={styles.siteItem}>
                {site}
                <button className={styles.removeBtn} onClick={() => removeSite(site)} title="Remove">×</button>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onClose} className={styles.closeBtn} title="Close">×</button>
      </div>
    </div>
  );
};
