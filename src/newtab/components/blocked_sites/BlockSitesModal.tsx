import React, { useState, useEffect } from 'react';
import styles from './BlockSitesModal.module.css';

interface BlockSitesModalProps {
  open: boolean;
  onClose: () => void;
}

export const BlockSitesModal: React.FC<BlockSitesModalProps> = ({ open, onClose }) => {
  const [sites, setSites] = useState<string[]>([]);
  const [input, setInput] = useState('');
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
      chrome.storage.local.get(['blockedSites'], res => {
        let current = Array.isArray(res.blockedSites) ? res.blockedSites : [];
        // If no sites set, use defaults
        if (!current.length) {
          current = DEFAULT_SITES;
          chrome.storage.local.set({ blockedSites: current });
        }
        setSites(current);
      });
    }
  }, [open]);

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

  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
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
