const products: Record<string, string> = {
	'42': 'Wireless Headphones',
	'99': 'Mechanical Keyboard'
};

export async function load({ params }) {
	// Simulate database lookup
	await new Promise((resolve) => setTimeout(resolve, 50));

	const name = products[params.productId] ?? `Unknown Product #${params.productId}`;

	return { product: { id: params.productId, name } };
}
