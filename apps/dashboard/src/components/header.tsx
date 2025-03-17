import { Button } from "@app/ui/components/button";
import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<header className="p-2 flex gap-2 bg-white text-black justify-between">
			<nav className="flex flex-row">
				<div className="px-2 font-bold">
					<Link to="/">Home</Link>
				</div>

				<Button variant={"outline"}>
					<Link to="/demo/start/server-funcs">Start - Server Functions</Link>
				</Button>

				<div className="px-2 font-bold">
					<Link to="/demo/start/api-request">Start - API Request</Link>
				</div>
			</nav>
		</header>
	);
}
