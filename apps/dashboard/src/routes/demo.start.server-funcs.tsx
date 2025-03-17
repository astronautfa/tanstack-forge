import { Button } from '@app/ui/components/button'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/demo/start/server-funcs')({
  component: Home,
})

function Home() {
  const state = Route.useLoaderData()

  return (
    <div className="p-4">
      <Button variant={'secondary'}>
        Add 1 to {state}?
      </Button>
    </div>
  )
}
