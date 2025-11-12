export function apiBase(): string {
	const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
	return base.replace(/\/+$/, '');
}


