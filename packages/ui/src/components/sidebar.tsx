

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { Button } from "@app/ui/components/button";
import { Input } from "@app/ui/components/input";
import { Separator } from "@app/ui/components/separator";
import {
	Sheet,
	SheetContent,
	SheetTitle,
} from "@app/ui/components/sheet";
import { Skeleton } from "@app/ui/components/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@app/ui/components/tooltip";
import { useIsMobile } from "@app/ui/hooks/use-mobile";
import { cn } from "@app/ui/lib/utils";
import { useSidebarResize } from "../hooks/use-sidebar-resize.ts";
import { mergeButtonRefs } from "../lib/merge-button-refs.ts";


const SIDEBAR_STATE_STORAGE_KEY = "sidebar:state";
const SIDEBAR_WIDTH_STORAGE_KEY = "sidebar:width";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MIN_SIDEBAR_WIDTH = "14rem";
const MAX_SIDEBAR_WIDTH = "28rem";
const SIDEBAR_WIDTH_ICON_NUM = 48;
const DEFAULT_SIDEBAR_WIDTH = 256;

type SidebarContext = {
	state: "expanded" | "collapsed";
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
	//* new properties for sidebar resizing
	width: string;
	setWidth: (width: string) => void;
	//* new properties for tracking is dragging rail
	isDraggingRail: boolean;
	setIsDraggingRail: (isDraggingRail: boolean) => void;
	persistWidth: (width: string) => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.");
	}

	return context;
}

const SidebarProvider = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & {
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		//* new prop for default width
		defaultWidth?: string;
	}
>(
	(
		{
			defaultOpen = true,
			open: openProp,
			onOpenChange: setOpenProp,
			className,
			style,
			children,
			defaultWidth = SIDEBAR_WIDTH,
			...props
		},
		ref
	) => {
		const isMobile = useIsMobile();
		const [isReady, setIsReady] = React.useState(false);
		const [width, setWidth] = React.useState(() => {
			if (typeof window === 'undefined' || !window.localStorage) {
				return defaultWidth; // SSR/no localStorage safety check
			}
			try {
				const storedWidth = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
				// Basic validation: ensure it looks like a width value
				if (storedWidth && (storedWidth.includes('px') || storedWidth.includes('rem'))) {
					console.log(`[SidebarProvider] Loaded width from localStorage: ${storedWidth}`);
					return storedWidth;
				}
			} catch (error) {
				console.error("[SidebarProvider] Error reading width from localStorage:", error);
				// Fall through to default if error occurs
			}
			console.log(`[SidebarProvider] Using default width: ${defaultWidth}`);
			return defaultWidth;
		});
		const [openMobile, setOpenMobile] = React.useState(false);
		//* new state for tracking is dragging rail
		const [isDraggingRail, setIsDraggingRail] = React.useState(false);

		// This is the internal state of the sidebar.
		// We use openProp and setOpenProp for control from outside the component.
		const [_open, _setOpen] = React.useState(() => {
			if (typeof window === 'undefined' || !window.localStorage) {
				return defaultOpen; // SSR/no localStorage safety check
			}
			try {
				const storedState = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY);
				if (storedState === "true") {
					console.log("[SidebarProvider] Loaded state from localStorage: expanded");
					return true;
				}
				if (storedState === "false") {
					console.log("[SidebarProvider] Loaded state from localStorage: collapsed");
					return false;
				}
				// Ignore invalid values, fall through to default
			} catch (error) {
				console.error("[SidebarProvider] Error reading state from localStorage:", error);
				// Fall through to default if error occurs
			}
			console.log(`[SidebarProvider] Using default state: ${defaultOpen ? 'expanded' : 'collapsed'}`);
			return defaultOpen;
		});

		const open = openProp ?? _open;

		const setOpen = React.useCallback(
			(value: boolean | ((value: boolean) => boolean)) => {
				const openState = typeof value === "function" ? value(open) : value;
				if (setOpenProp) {
					setOpenProp(openState);
				} else {
					_setOpen(openState);
				}

				// Persist the state to localStorage
				if (typeof window !== 'undefined' && window.localStorage) {
					try {
						console.log(`[SidebarProvider] Persisting state to localStorage: ${openState}`);
						localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, String(openState)); // Store as 'true' or 'false' string
					} catch (error) {
						console.error("[SidebarProvider] Error saving state to localStorage:", error);
					}
				}
			},
			[setOpenProp, open] // _setOpen is stable
		);

		const persistWidth = React.useCallback((finalWidth: string) => {
			if (finalWidth && (finalWidth.includes('px') || finalWidth.includes('rem'))) {
				if (typeof window !== 'undefined' && window.localStorage) {
					try {
						console.log(`[SidebarProvider] Persisting width to localStorage: ${finalWidth}`);
						localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, finalWidth);
					} catch (error) {
						console.error("[SidebarProvider] Error saving width to localStorage:", error);
					}
				}
			} else {
				console.warn(`[SidebarProvider] Attempted to persist invalid width: ${finalWidth}`);
			}
		}, []);

		const toggleSidebar = React.useCallback(() => {
			return isMobile
				? setOpenMobile((open) => !open)
				: setOpen((open) => !open);
		}, [
			isMobile,
			setOpen,
		]);

		// Adds a keyboard shortcut to toggle the sidebar.
		React.useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (
					event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
					(event.metaKey || event.ctrlKey)
				) {
					event.preventDefault();
					toggleSidebar();
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [toggleSidebar]);

		React.useEffect(() => {
			// This runs after the first render, ensuring localStorage
			// has been read and the initial state/CSS var is set.
			setIsReady(true);
			console.log("[SidebarProvider] Ready, rendering children.");
		}, []);

		// We add a state so that we can do data-state="expanded" or "collapsed".
		// This makes it easier to style the sidebar with Tailwind classes.
		const state = open ? "expanded" : "collapsed";

		const contextValue = React.useMemo<SidebarContext>(
			() => ({
				state,
				open,
				setOpen,
				isMobile,
				openMobile,
				setOpenMobile,
				toggleSidebar,
				//* new context for sidebar resizing
				width,
				setWidth,
				//* new context for tracking is dragging rail
				isDraggingRail,
				setIsDraggingRail,
				persistWidth,
			}),
			[
				state,
				open,
				setOpen,
				isMobile,
				openMobile,
				//* remove setOpenMobile from dependencies because setOpenMobile are state setters created by useState
				// setOpenMobile,
				toggleSidebar,
				//* add width to dependencies
				width,
				//* add isDraggingRail to dependencies
				isDraggingRail,
				persistWidth,
			]
		);

		return (
			<SidebarContext.Provider value={contextValue}>
				<TooltipProvider delayDuration={0}>
					<div
						style={
							{
								// * update '--sidebar-width' to use the new width state
								"--sidebar-width": width,
								"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
								...style,
							} as React.CSSProperties
						}
						className={cn(
							"group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
							className
						)}
						ref={ref}
						{...props}
					>
						{isReady ? children : null}
					</div>
				</TooltipProvider>
			</SidebarContext.Provider>
		);
	}
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & {
		side?: "left" | "right";
		variant?: "sidebar" | "floating" | "inset";
		collapsible?: "offcanvas" | "icon" | "none";
	}
>(
	(
		{
			side = "left",
			variant = "sidebar",
			collapsible = "offcanvas",
			className,
			children,
			...props
		},
		ref
	) => {
		const {
			isMobile,
			state,
			openMobile,
			setOpenMobile,
			isDraggingRail,
		} = useSidebar();

		if (collapsible === "none") {
			return (
				<div
					className={cn(
						"flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
						className,
					)}
					ref={ref}
					{...props}
				>
					{children}
				</div>
			);
		}

		if (isMobile) {
			return (
				<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
					<SheetContent
						data-sidebar="sidebar"
						data-mobile="true"
						className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
						style={
							{
								"--sidebar-width": SIDEBAR_WIDTH_MOBILE,
							} as React.CSSProperties
						}
						side={side}
					>
						<SheetTitle className="hidden">Menu</SheetTitle>
						<div className="flex h-full w-full flex-col">{children}</div>
					</SheetContent>
				</Sheet>
			);
		}

		return (
			<div
				className="group peer hidden md:block text-sidebar-foreground"
				data-state={state}
				data-collapsible={state === "collapsed" ? collapsible : ""}
				data-variant={variant}
				data-side={side}
				ref={ref}
				data-dragging={isDraggingRail}
			>
				<div
					className={cn(
						"duration-200 relative h-svh w-(--sidebar-width) bg-transparent transition-[width] ease-linear",
						"group-data-[collapsible=offcanvas]:w-0",
						"group-data-[side=right]:rotate-180",
						variant === "floating" || variant === "inset"
							? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
							: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
						"group-data-[dragging=true]:!duration-0 group-data-[dragging=true]_*:!duration-0"
					)}
				/>
				<div
					className={cn(
						"duration-200 fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex",
						side === "left"
							? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
							: "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
						variant === "floating" || variant === "inset"
							? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
							: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
						"group-data-[dragging=true]:!duration-0 group-data-[dragging=true]_*:!duration-0",
						className,
					)}
					{...props}
				>
					<div
						data-sidebar="sidebar"
						className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-md group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
					>
						{children}
					</div>
				</div>
			</div>
		);
	})

interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {
}

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, SidebarTriggerProps>(
	({ className, onClick, ...props }, ref) => {
		const { state, toggleSidebar } = useSidebar();
		const isOpen = state === 'expanded';

		return (
			<Button
				ref={ref}
				size="icon"
				variant="ghost"
				className={cn('size-6', className)}
				onClick={(event) => {
					onClick?.(event);
					toggleSidebar();
				}}
				aria-expanded={isOpen}
				aria-label={`Toggle Sidebar`}
				data-sidebar="trigger"
				tooltip={`${isOpen ? 'Close' : 'Open'} Sidebar`}
				{...props}
			>
				<span aria-hidden="true">
					<svg
						className={cn(
							'text-muted-foreground transition-transform duration-200 ease-in-out',
							'rotate-180'
						)}
						fill="currentColor"
						focusable="false"
						height="16"
						role="img"
						viewBox="0 0 16 16"
						width="16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							clipRule="evenodd"
							d="M4.25 2C2.45508 2 1 3.45508 1 5.25V10.7499C1 12.5449 2.45508 13.9999 4.25 13.9999H11.75C13.5449 13.9999 15 12.5449 15 10.7499V5.25C15 3.45508 13.5449 2 11.75 2H4.25ZM2.5 10.4999C2.5 11.6045 3.39543 12.4999 4.5 12.4999H11.75C12.7165 12.4999 13.5 11.7164 13.5 10.7499V5.25C13.5 4.28351 12.7165 3.5 11.75 3.5H4.5C3.39543 3.5 2.5 4.39543 2.5 5.5V10.4999Z"
							fillRule="evenodd"
						/>
						<rect height="10" width="1.5" x="9" y="3" />
						<rect
							className="transition-all duration-200 ease-in-out"
							height="10"
							width={isOpen ? "4" : "0"}
							x={isOpen ? "10" : "14"}
							y="3"
						/>
					</svg>
				</span>
				<span className="sr-only">Toggle Sidebar</span>
			</Button>
		);
	}
);

const SidebarRail = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> & {
		enableDrag?: boolean;
	}
>(({ className, enableDrag = true, ...props }, ref) => {
	const {
		toggleSidebar,
		setWidth,
		persistWidth,
		state,
		width,
		setIsDraggingRail,
	} = useSidebar();

	// --- Side Detection Logic (keep as is or improve based on your structure) ---
	const sidebarRef = React.useRef<HTMLDivElement>(null);
	const [detectedSide, setDetectedSide] = React.useState<'left' | 'right'>('left');

	React.useEffect(() => {
		// Find the rail button itself to start the search
		const railButton = dragRef.current; // Use the dragRef from the hook
		if (railButton) {
			// Find the closest ancestor group which defines the side
			const sidebarElement = railButton.closest('[data-variant][data-side]');
			const sideAttr = sidebarElement?.getAttribute('data-side') as 'left' | 'right' | null;
			if (sideAttr) {
				setDetectedSide(sideAttr);
				// console.log("Detected side:", sideAttr); // For debugging
			} else {
				console.warn("Sidebar side could not be detected for rail resizing.");
			}
		}
	}, []); // Run once on mount (or maybe when dragRef is set)
	// --- End Side Detection ---


	const { dragRef, handleMouseDown } = useSidebarResize({
		enableDrag,
		onResize: setWidth,
		persistWidth: persistWidth,
		onToggle: toggleSidebar,
		currentWidth: width,
		isCollapsed: state === "collapsed",
		minResizeWidth: MIN_SIDEBAR_WIDTH,
		maxResizeWidth: MAX_SIDEBAR_WIDTH,
		setIsDraggingRail,
		side: detectedSide,
	});

	const combinedRef = React.useMemo(
		() => mergeButtonRefs([ref, dragRef]),
		[ref, dragRef]
	);

	return (
		<button
			ref={combinedRef}
			data-sidebar="rail"
			aria-label={"Resize Sidebar"}
			tabIndex={0}
			onMouseDown={handleMouseDown}
			title={"Resize Sidebar"}
			className={cn(
				"absolute inset-y-0 z-20 flex items-center justify-center w-4 cursor-pointer group", // Added flex utils for centering pseudo-elements if needed
				// Positioning: Place edge on boundary, then translate center to boundary
				"group-data-[side=left]:right-0 group-data-[side=left]:translate-x-1/2", // Place left edge at right boundary, move left by half-width
				"group-data-[side=right]:left-0 group-data-[side=right]:-translate-x-1/2", // Place right edge at left boundary, move right by half-width

				// Visual Guide Line (using ::after) - centered within the button
				"after:content-[''] after:absolute after:inset-y-0 after:left-1/2 after:-translate-x-1/2 after:w-[2px] after:bg-transparent",
				"after:transition-colors after:duration-150 hover:after:bg-sidebar-border", // Hover visible line
				"focus-visible:outline-none focus-visible:after:bg-primary", // Focus visible line

				// Cursor logic
				!enableDrag || state === 'collapsed'
					? "cursor-pointer"
					: (detectedSide === 'left' ? "cursor-ew-resize" : "cursor-ew-resize"), // Use standard resize cursor

				// Transition disabling (important for smooth drag)
				"group-data-[dragging=true]:transition-none group-data-[dragging=true]:after:transition-none", // Disable transitions while dragging

				// Original offcanvas logic (review if needed)
				// "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
				// "[[data-side=left][data-collapsible=offcanvas]_&]:right-0", // Adjust if needed for offcanvas
				// "[[data-side=right][data-collapsible=offcanvas]_&]:left-0", // Adjust if needed for offcanvas

				className
			)}
			{...props}
		/>
	);
});
SidebarRail.displayName = "SidebarRail";

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
	return (
		<main
			className={cn(
				'relative shadow-lg flex flex-1 flex-col overflow-hidden',
				'md:peer-data-[state=expanded]:border-1 md:peer-data-[state=expanded]:border-border md:peer-data-[state=expanded]:m-1 md:peer-data-[state=expanded]:ml-0 md:peer-data-[state=expanded]:rounded-xl',
				'peer-data-[variant=inset]:max-h-[calc(100svh-theme(spacing.3))] md:peer-data-[variant=inset]:my-1.5 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl',
				'md:peer-data-[state=collapsed]:mt-1',
				className
			)}
			{...props}
		/>
	);
}

function SidebarInput({
	className,
	...props
}: React.ComponentProps<typeof Input>) {
	return (
		<Input
			data-sidebar="input"
			className={cn(
				"bg-background bg-linear-to-br from-accent/60 to-accent",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="header"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	);
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="footer"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	);
}

function SidebarSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-sidebar="separator"
			className={cn("mx-2 w-auto bg-sidebar-border", className)}
			{...props}
		/>
	);
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="content"
			className={cn(
				"flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group"
			className={cn("relative flex w-full min-w-0 flex-col px-2", className)}
			{...props}
		/>
	);
}

function SidebarGroupLabel({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-sidebar="group-label"
			className={cn(
				"duration-200 flex h-8 shrink-0 items-center rounded-md px-1 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
				"group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupAction({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-sidebar="group-action"
			className={cn(
				"absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
				"after:absolute after:-inset-2 md:after:hidden",
				"group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group-content"
			className={cn("w-full text-sm", className)}
			{...props}
		/>
	);
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-sidebar="menu"
			className={cn("flex w-full min-w-0 flex-col gap-1", className)}
			{...props}
		/>
	);
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-sidebar="menu-item"
			className={cn("group/menu-item relative", className)}
			{...props}
		/>
	);
}

const sidebarMenuButtonVariants = cva(
	"peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				outline:
					"bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
			},
			size: {
				default: "h-8 text-sm",
				md: "h-8 text-xs",
				sm: "h-6 text-xs",
				lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function SidebarMenuButton({
	asChild = false,
	isActive = false,
	variant = "default",
	size = "default",
	tooltip,
	className,
	...props
}: React.ComponentProps<"button"> & {
	asChild?: boolean;
	isActive?: boolean;
	tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();

	const button = (
		<Comp
			data-sidebar="menu-button"
			data-size={size}
			data-active={isActive}
			className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
			{...props}
		/>
	);

	if (!tooltip) {
		return button;
	}

	if (typeof tooltip === "string") {
		tooltip = {
			children: tooltip,
		};
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent
				side="right"
				align="center"
				hidden={state !== "collapsed" || isMobile}
				{...tooltip}
			/>
		</Tooltip>
	);
}

function SidebarMenuAction({
	className,
	asChild = false,
	showOnHover = false,
	...props
}: React.ComponentProps<"button"> & {
	asChild?: boolean;
	showOnHover?: boolean;
}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-sidebar="menu-action"
			className={cn(
				"absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
				"after:absolute after:-inset-2 md:after:hidden",
				"peer-data-[size=sm]/menu-button:top-1",
				"peer-data-[size=default]/menu-button:top-1.5",
				"peer-data-[size=lg]/menu-button:top-2.5",
				"group-data-[collapsible=icon]:hidden",
				showOnHover &&
				"group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuBadge({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="menu-badge"
			className={cn(
				"absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
				"peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
				"peer-data-[size=sm]/menu-button:top-1",
				"peer-data-[size=default]/menu-button:top-1.5",
				"peer-data-[size=lg]/menu-button:top-2.5",
				"group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSkeleton({
	className,
	showIcon = false,
	...props
}: React.ComponentProps<"div"> & {
	showIcon?: boolean;
}) {
	const width = React.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);

	return (
		<div
			data-sidebar="menu-skeleton"
			className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
			{...props}
		>
			{showIcon && (
				<Skeleton
					className="size-4 rounded-md"
					data-sidebar="menu-skeleton-icon"
				/>
			)}
			<Skeleton
				className="h-4 flex-1 max-w-(--skeleton-width)"
				data-sidebar="menu-skeleton-text"
				style={
					{
						"--skeleton-width": width,
					} as React.CSSProperties
				}
			/>
		</div>
	);
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-sidebar="menu-sub"
			className={cn(
				"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
				"group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSubItem({ ...props }: React.ComponentProps<"li">) {
	return <li {...props} />;
}

function SidebarMenuSubButton({
	asChild = false,
	size = "md",
	isActive,
	className,
	...props
}: React.ComponentProps<"a"> & {
	asChild?: boolean;
	size?: "sm" | "md";
	isActive?: boolean;
}) {
	const Comp = asChild ? Slot : "a";

	return (
		<Comp
			data-sidebar="menu-sub-button"
			data-size={size}
			data-active={isActive}
			className={cn(
				"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
				"data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
				size === "sm" && "text-xs",
				size === "md" && "text-sm",
				"group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
};

