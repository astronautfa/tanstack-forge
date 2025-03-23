import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from "@app/ui/components/sonner"

import globalsCss from "@app/ui/globals.css?url";
import { SessionProvider } from "@/lib/providers/session";
import { authClient } from "@app/auth/client";

export const Route = createRootRoute({
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
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: globalsCss,
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

	beforeLoad: async () => {
		const { data } = await authClient.getSession();
		return {
			user: data?.user || null
		};
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<SessionProvider>
					{children}
				</SessionProvider>
				<Scripts />
			</body>
		</html>
	);
}
