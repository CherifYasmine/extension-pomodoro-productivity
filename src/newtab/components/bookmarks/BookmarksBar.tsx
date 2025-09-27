import React, { useEffect, useRef, useState } from 'react';
import styles from './BookmarksBar.module.css';
import useFavicon from './useFavicon';

export const BookmarksBar: React.FC = () => {
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['pinnedBookmarks'], res => {
      if (Array.isArray(res.pinnedBookmarks)) setPinned(res.pinnedBookmarks);
    });
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.pinnedBookmarks && Array.isArray(changes.pinnedBookmarks.newValue)) {
        setPinned(changes.pinnedBookmarks.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const open = (url: string) => {
    try {
      chrome.tabs.create({ url });
    } catch (e) {
      // if tabs permission isn't available, fallback to location
      window.location.href = url;
    }
  };

  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch (_) {
      return url;
    }
  };

  if (!pinned || pinned.length === 0) return null;
  return (
    <div className={styles.bar}>
      <div className={styles.scrollContainer}>
        {pinned.map(url => (
          <BookmarkButton key={url} url={url} open={open} getDomain={getDomain} />
        ))}
      </div>
    </div>
  );
};

const BookmarkButton: React.FC<{ url: string; open: (url: string) => void; getDomain: (u: string) => string }> = ({ url, open, getDomain }) => {
  const fav = useFavicon(url);
  return (
    <button key={url} className={styles.item} onClick={() => open(url)} title={url}>
      <img src={fav} alt="favicon" className={styles.fav} />
      <div className={styles.domain}>{getDomain(url)}</div>
    </button>
  );
};
