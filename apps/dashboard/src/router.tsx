import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';

import { routeTree } from './routeTree.gen';

const DefaultCatchBoundary = () => <div>DefaultCatchBoundary</div>;
const DefaultNotFound = () => <div>DefaultNotFound</div>;

export function createRouter() {
	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {},
	});

	return routerWithQueryClient(
		createTanStackRouter({
			routeTree,
			defaultPreload: 'intent',
			context: { queryClient },
			defaultErrorComponent: DefaultCatchBoundary,
			defaultNotFoundComponent: DefaultNotFound,
		} as any),
		queryClient,
	);
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
