import {
	HeadContent,
	Outlet,
	ScriptOnce,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from "@app/ui/components/sonner"

import { auth } from "@app/auth";
import { getWebRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";
import type { QueryClient } from "@tanstack/react-query";

import globalsCss from "@app/ui/globals.css?url";
import layoutCss from '@app/layout/style.css?url'

const getUser = createServerFn({ method: "GET" }).handler(async () => {
	const { headers } = getWebRequest()!;
	const session = await auth.api.getSession({ headers });

	return session?.user || null;
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	user: Awaited<ReturnType<typeof getUser>>;
}>()({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.fetchQuery({
			queryKey: ["user"],
			queryFn: ({ signal }) => getUser({ signal }),
		});
		return { user };
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Forge",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: globalsCss,
			},
			{
				rel: "stylesheet",
				href: layoutCss,
			},
		],
	}),
	component: () => (
		<RootDocument>
			<Outlet />
			<TanStackRouterDevtools />
			<ReactQueryDevtools initialIsOpen={false} position="right" />
			<Toaster />
		</RootDocument>
	),
});

function RootDocument({ children }: { children: React.ReactNode }) {

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ScriptOnce>
					{`document.documentElement.classList.toggle(
					'dark',
					localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
					)`}
				</ScriptOnce>
				<div className="min-h-screen font-sans antialiased">
					{children}
				</div>
				<Scripts />
			</body>
		</html>
	);
}
