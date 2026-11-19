const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
	if (!path.startsWith('/')) {
		return path;
	}
	if (path === '/') {
		return `${BASE}/`;
	}
	return `${BASE}${path}`;
}
