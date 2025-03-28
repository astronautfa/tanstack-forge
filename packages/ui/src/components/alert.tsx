import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@app/ui/lib/utils";

const alertVariants = cva(
	"relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
	{
		variants: {
			variant: {
				default: "bg-card text-card-foreground dark:bg-card/90 dark:text-card-foreground",
				destructive:
					"text-destructive border-destructive/50 bg-destructive/10 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90 dark:bg-destructive/20 dark:border-destructive/30 dark:text-destructive-foreground dark:[&>svg]:text-destructive-foreground dark:*:data-[slot=alert-description]:text-destructive-foreground/90",
				success:
					"text-green-600 border-green-200 bg-green-50 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-600/90 dark:bg-green-950/50 dark:border-green-800 dark:text-green-400 dark:[&>svg]:text-green-400 dark:*:data-[slot=alert-description]:text-green-400/90",
				warning:
					"text-amber-600 border-amber-200 bg-amber-50 [&>svg]:text-amber-600 *:data-[slot=alert-description]:text-amber-600/90 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400 dark:[&>svg]:text-amber-400 dark:*:data-[slot=alert-description]:text-amber-400/90",
				info:
					"text-blue-600 border-blue-200 bg-blue-50 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-600/90 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400 dark:[&>svg]:text-blue-400 dark:*:data-[slot=alert-description]:text-blue-400/90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed dark:text-muted-foreground/90",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription };