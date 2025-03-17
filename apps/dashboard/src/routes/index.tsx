import { createFileRoute, redirect } from "@tanstack/react-router";

async function getCurrentUser() {
	// In a real app, you'd fetch the user data from your API or local storage
	// For now, we'll just check if there's a user in localStorage
	const user = localStorage.getItem('user');
	return user ? JSON.parse(user) : null;
}

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		// Try to get the current user
		const user = await getCurrentUser();

		// If no user is found, redirect to sign in page
		if (!user) {
			throw redirect({
				to: '/auth/signin',
			});
		}

		return { user };
	},
	component: Dashboard,
});

function Dashboard() {
	const { user } = Route.useLoaderData();

	return (
		<div className="container mx-auto p-6">
			<div className="rounded-lg bg-white p-8 shadow-md">
				<h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
				<p>Welcome back, {user.name || 'User'}!</p>
				<p className="text-muted-foreground">You are now signed in.</p>
			</div>
		</div>
	);
}