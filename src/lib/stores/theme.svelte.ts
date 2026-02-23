type Theme = 'light' | 'dark';

let theme = $state<Theme>('light');

export function getTheme(): Theme {
	return theme;
}

export function setTheme(value: Theme): void {
	theme = value;
	if (typeof document !== 'undefined') {
		document.documentElement.classList.toggle('dark', value === 'dark');
		localStorage.setItem('theme', value);
	}
}

export function toggleTheme(): void {
	setTheme(theme === 'light' ? 'dark' : 'light');
}

export function initTheme(): void {
	if (typeof document === 'undefined') return;
	const stored = localStorage.getItem('theme') as Theme | null;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	setTheme(stored ?? (prefersDark ? 'dark' : 'light'));
}
