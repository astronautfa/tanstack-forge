import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@app/ui/components/button"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <Button>Click me</Button>
    </div>
  )
}
