import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/demo/start/server-funcs')({
  component: Home,
})

function Home() {
  const state = Route.useLoaderData()

  return (
    <div className="p-4">
      <button
        type="button"

        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add 1 to {state}?
      </button>
    </div>
  )
}
