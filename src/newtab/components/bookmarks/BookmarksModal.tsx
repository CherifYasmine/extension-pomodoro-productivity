import React, { useEffect, useState } from 'react';
import styles from './BookmarksModal.module.css';
import useFavicon from './useFavicon';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface BMItem {
  id: string;
  title: string;
  url?: string;
}

const BookmarkRow: React.FC<{ it: BMItem; pinned: string[]; togglePin: (url?: string) => void }> = ({ it, pinned, togglePin }) => {
  const favSrc = useFavicon(it.url);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 0;
    // consider < 24px as low-res for diagnostics
    // don't log low-res images in production
    if (w > 0 && w < 24) {
      // silent
    }
  };

  const handleImgError = () => {
    // silent on image error
  };

  return (
    <div className={styles.item}>
      <img src={favSrc} alt="favicon" className={styles.favSmall} onLoad={handleImgLoad} onError={handleImgError} />
      <div className={styles.info}>
        <div className={styles.title}>{it.title}</div>
        <div className={styles.url}>{it.url}</div>
      </div>
      <button className={styles.pinBtn} onClick={() => togglePin(it.url)}>{pinned.includes(it.url || '') ? 'Unpin' : 'Pin'}</button>
    </div>
  );
};

export const BookmarksModal: React.FC<Props> = ({ open, onClose }) => {
  const [items, setItems] = useState<BMItem[]>([]);
  const [query, setQuery] = useState('');
  const [pinned, setPinned] = useState<string[]>([]);
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto');
  const [systemDark, setSystemDark] = useState<boolean>(() => (
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  ));

  useEffect(() => {
    if (!open) return;
    // load pinned and theme
    chrome.storage.local.get(['pinnedBookmarks', 'theme'], res => {
      if (Array.isArray(res.pinnedBookmarks)) setPinned(res.pinnedBookmarks);
      if (res.theme === 'light' || res.theme === 'dark' || res.theme === 'auto') setTheme(res.theme);
      else setTheme('auto');
    });
    // read bookmarks tree
    try {
      chrome.bookmarks.getTree(nodes => {
        const flat: BMItem[] = [];
        const walk = (n: any) => {
          if (Array.isArray(n)) return n.forEach(walk);
          if (n.url) flat.push({ id: n.id, title: n.title || n.url, url: n.url });
          if (n.children) n.children.forEach(walk);
        };
        walk(nodes);
        setItems(flat);
      });
    } catch (e) {
      console.error('Bookmarks API not available or permission missing', e);
      setItems([]);
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

  const togglePin = (url?: string) => {
    if (!url) return;
    const next = pinned.includes(url) ? pinned.filter(u => u !== url) : [...pinned, url];
    setPinned(next);
    chrome.storage.local.set({ pinnedBookmarks: next });
  };

  const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'light' ? 'theme-light' : (systemDark ? 'theme-dark' : 'theme-light');
  if (!open) return null;
  const filtered = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || (i.url || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={`${themeClass} ${styles.modalOverlay}`} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.heading}>Bookmarks</h2>
        <input className={styles.search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search bookmarks..." />
        <div className={styles.list}>
          {filtered.map(it => (
            <BookmarkRow key={it.id} it={it} pinned={pinned} togglePin={togglePin} />
          ))}
        </div>
        <button onClick={onClose} className={styles.closeBtn} title="Close">×</button>
      </div>
    </div>
  );
};
