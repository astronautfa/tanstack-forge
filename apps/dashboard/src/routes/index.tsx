import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@app/ui/components/button"
import { Badge } from "@app/ui/components/badge"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-4xl font-bold">Tanstack Forge</h1>
      <div className="flex items-center gap-2">
        This is an unprotected page:
        <Badge variant={'secondary'}>
          routes/index.tsx
        </Badge>
      </div>
      <div>
        <Button variant={'outline'} size={'lg'}>Click me</Button>
      </div>
    </div>
  )
}
