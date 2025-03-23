import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';

import { NotFound } from '@/components/not-found';
import { DefaultCatchBoundary } from '@/components/catch-boundary';

import { routeTree } from '@/routeTree.gen';

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
			defaultNotFoundComponent: NotFound,
		} as any),
		queryClient,
	);
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
