import React, { useEffect, useRef, useState } from 'react';
import styles from './BookmarksBar.module.css';
import useFavicon from './useFavicon';

export const BookmarksBar: React.FC = () => {
  const [pinned, setPinned] = useState<string[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});

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

  // when pinned changes, try to resolve bookmark titles for each URL
  useEffect(() => {
    if (!pinned || pinned.length === 0) {
      setTitles({});
      return;
    }
    const map: Record<string, string> = {};
    let pending = pinned.length;
    pinned.forEach(url => {
      try {
        // search for a bookmark that matches this URL
        chrome.bookmarks.search({ url }, (results) => {
          if (Array.isArray(results) && results.length > 0 && results[0].title) {
            map[url] = results[0].title;
          } else {
            map[url] = '';
          }
          pending -= 1;
          if (pending === 0) setTitles(map);
        });
      } catch (e) {
        // bookmarks permission might not be available; leave title empty
        map[url] = '';
        pending -= 1;
        if (pending === 0) setTitles(map);
      }
    });
  }, [pinned]);

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
          <BookmarkButton key={url} url={url} open={open} getDomain={getDomain} title={titles[url] || ''} />
        ))}
      </div>
    </div>
  );
};

const BookmarkButton: React.FC<{ url: string; open: (url: string) => void; getDomain: (u: string) => string; title?: string }> = ({ url, open, getDomain, title }) => {
  const fav = useFavicon(url);
  return (
    <button key={url} className={styles.item} onClick={() => open(url)} title={url}>
      <img src={fav} alt="favicon" className={styles.fav} />
      <div className={styles.domain}>{title && title.length > 0 ? title : getDomain(url)}</div>
    </button>
  );
};
