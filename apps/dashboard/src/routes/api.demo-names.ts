import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/demo-names")({
	GET: async () => {
		return new Response(JSON.stringify(["Alice", "Bob", "Charlie", "Zara"]), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	},
});
