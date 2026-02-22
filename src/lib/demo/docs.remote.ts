import { query } from '$app/server';

const docs: Record<string, string> = {
	'getting-started': 'Getting Started',
	'api-reference': 'API Reference',
	'migration-guide': 'Migration Guide'
};

export const getDocTitle = query('unchecked', async (slug: string): Promise<string> => {
	// Simulate database/CMS lookup
	await new Promise((resolve) => setTimeout(resolve, 50));

	return docs[slug] ?? slug;
});
