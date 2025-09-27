import { useEffect, useState } from 'react';

function originFor(url?: string) {
    try { return new URL(url || '').origin; } catch { return '' }
}

export default function useFavicon(url?: string) {
    const [src, setSrc] = useState<string>('');

    useEffect(() => {
        if (!url) return;
        let cancelled = false;
        const origin = originFor(url);
        if (!origin) return;

        const hostname = (() => { try { return new URL(url).hostname } catch { return '' } })();
        const googleBase = `https://www.google.com/s2/favicons?domain=${hostname}`;
        const google64 = `${googleBase}&sz=64`;
        const google128 = `${googleBase}&sz=128`;

        const cacheDataUrl = (dataUrl: string) => {
            if (!dataUrl) return;
            try {
                chrome.storage.local.get(['favicons'], r2 => {
                    const m = r2.favicons || {};
                    m[origin] = dataUrl;
                    chrome.storage.local.set({ favicons: m });
                });
            } catch {}
        };

        const initialsSvg = (host: string) => {
            const name = (host || '').replace(/^www\./, '').split('.')[0] || '?';
            const ch = (name[0] || '?').toUpperCase();
            let hash = 0; for (let i = 0; i < host.length; i++) hash = ((hash << 5) - hash) + host.charCodeAt(i);
            const hue = Math.abs(hash) % 360;
            const bg = `hsl(${hue} 60% 40%)`;
            const fg = '#fff';
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='${bg}' rx='10' ry='10'/><text x='50%' y='54%' font-size='32' font-family='Arial,sans-serif' fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${ch}</text></svg>`;
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        };

        // probe origin + /favicon.ico and try to cache it when possible
        const tryIcoProbe = () => {
            const icoUrl = `${origin}/favicon.ico`;
            const icoImg = new Image();
            icoImg.crossOrigin = 'anonymous';
            let icoTimeout: any = null;
            const cleanupIco = () => { if (icoTimeout) clearTimeout(icoTimeout); };
            icoImg.onload = () => {
                cleanupIco();
                if (cancelled) return;
                const good = icoImg.naturalWidth > 16;
                if (good) {
                    setSrc(icoUrl);
                    // attempt to fetch and cache as dataURL (may fail on CORS)
                    fetch(icoUrl, { mode: 'cors' }).then(r => {
                        if (!r.ok) return;
                        return r.blob();
                    }).then(blob => {
                        if (!blob) return;
                        const reader = new FileReader();
                        reader.onloadend = () => { if (!cancelled) cacheDataUrl(reader.result as string); };
                        reader.readAsDataURL(blob);
                    }).catch(() => {});
                    return;
                }
                const letter = initialsSvg(hostname);
                setSrc(letter);
                cacheDataUrl(letter);
            };
            icoImg.onerror = (err) => {
                try { console.warn('[useFavicon] /favicon.ico probe failed', { origin, icoUrl, err }); } catch {}
                cleanupIco();
                const letter = initialsSvg(hostname);
                setSrc(letter);
                cacheDataUrl(letter);
            };
            icoTimeout = setTimeout(() => {
                try { icoImg.src = '' } catch {}
                const letter = initialsSvg(hostname);
                setSrc(letter);
                cacheDataUrl(letter);
            }, 2000);
            icoImg.src = icoUrl + '?_=' + Date.now();
        };

        // main chain: custom -> cached -> google -> ico probe -> initials
        chrome.storage.local.get(['customFavicons', 'favicons'], res => {
            const custom = (res.customFavicons || {}) as Record<string, string>;
            const favicons = (res.favicons || {}) as Record<string, string>;

            if (custom[origin]) {
                setSrc(custom[origin]);
                return;
            }

            if (favicons[origin]) {
                setSrc(favicons[origin]);
                return;
            }

            const gImg = new Image();
            gImg.crossOrigin = 'anonymous';
            gImg.onload = () => {
                if (cancelled) return;
                const isLikelyGeneric = gImg.naturalWidth <= 16;
                if (isLikelyGeneric) {
                    // If Google returned a tiny/generic icon, probe /favicon.ico first
                    tryIcoProbe();
                } else {
                    setSrc(google64);
                    // cache higher-res in background
                    fetch(google128).then(r => r.blob()).then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => { if (!cancelled) cacheDataUrl(reader.result as string); };
                        reader.readAsDataURL(blob);
                    }).catch(() => { });
                }
            };
            gImg.onerror = (e) => {
                // google failed; try /favicon.ico probe
                tryIcoProbe();
            };
            gImg.src = google64;
        });

        return () => { cancelled = true };
    }, [url]);

    return src;
}
