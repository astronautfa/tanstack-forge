import { Link, rootRouteId, useMatch, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@app/ui/components/button"
import { Illustration } from './not-found'

export function CatchBoundary({ error }: ErrorComponentProps) {
    const router = useRouter()
    const isRoot = useMatch({
        strict: false,
        select: (state) => state.id === rootRouteId,
    })

    return (
        <div className="relative flex flex-col w-full justify-center min-h-svh bg-background p-6 md:p-10">
            <div className="relative max-w-5xl mx-auto w-full">
                <Illustration className="absolute inset-0 w-full h-[50vh] opacity-[0.04] dark:opacity-[0.03] text-foreground" />
                <div className="relative text-center z-[1] pt-52">
                    <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-primary sm:text-7xl">
                        Something went wrong
                    </h1>
                    <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
                        {error?.message || "We encountered an unexpected error."}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-6">
                        <Button
                            variant="secondary"
                            className="group"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft
                                className="me-2 ms-0 opacity-60 transition-transform group-hover:-translate-x-0.5"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            Go back
                        </Button>
                        <Button
                            onClick={() => router.invalidate()}
                            className="flex items-center gap-2"
                        >
                            Try again
                        </Button>
                        {isRoot ? (
                            <Button variant="outline" asChild>
                                <Link to="/">
                                    <Home className="mr-2" size={16} />
                                    Home
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}