import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './style.css';

function applyThemeClass() {
	chrome.storage.local.get(['theme'], res => {
		let theme = res.theme;
		if (!theme || theme === 'auto') {
			theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		document.body.classList.remove('theme-light', 'theme-dark');
		document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
	});
}
applyThemeClass();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyThemeClass);

createRoot(document.getElementById('root')!).render(<App />);
``