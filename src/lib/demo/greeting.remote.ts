import { command, query } from '$app/server';

let currentNickname = 'Visitor';

export const getNickname = query(async (): Promise<string> => {
	// Simulate server-side lookup (e.g. user profile, session, database)
	await new Promise((resolve) => setTimeout(resolve, 50));

	return currentNickname;
});

export const setNickname = command('unchecked', async (name: string) => {
	// Simulate server-side write
	await new Promise((resolve) => setTimeout(resolve, 50));

	currentNickname = name.trim() || 'Visitor';
});
