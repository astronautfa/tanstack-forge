import React from "react";

interface UseSidebarResizeProps {
  enableDrag?: boolean;
  onResize: (width: string) => void;
  // Add persistWidth to the hook interface if you want the hook to handle persistence directly
  persistWidth: (width: string) => void;
  currentWidth: string;
  isCollapsed: boolean;
  minResizeWidth?: string;
  maxResizeWidth?: string;
  setIsDraggingRail: (isDraggingRail: boolean) => void;
  side?: "left" | "right"; // Need the side to calculate delta correctly
}

function parseWidth(width: string): { value: number; unit: "rem" | "px" } {
  // Handle potential undefined or null width string gracefully
  if (!width) {
    console.warn("[parseWidth] Received invalid width:", width, "Using default 0px.");
    return { value: 0, unit: "px" };
  }

  // Extract the numeric part and unit
  const match = width.match(/^([\d.]+)(rem|px)$/);
  if (!match) {
    console.warn("[parseWidth] Failed to parse width format:", width, "Using default 0px.");
    return { value: 0, unit: "px" };
  }

  const value = Number.parseFloat(match[1]!);
  const unit = match[2] as "rem" | "px";

  // Check if parsing resulted in NaN
  if (Number.isNaN(value)) {
    console.warn("[parseWidth] Failed to parse width value:", width, "Using default 0px.");
    return { value: 0, unit: "px" };
  }

  return { value, unit };
}

function toPx(width: string | undefined): number {
  // Provide a default value if width is undefined
  const validWidth = width ?? "0px";
  const { value, unit } = parseWidth(validWidth);
  // Default to 16px per rem if running in an environment without window/document
  const rootFontSize = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 16;
  return unit === "rem" ? value * rootFontSize : value;
}

function formatWidth(value: number, unit: "rem" | "px"): string {
  // Default to 16px per rem if running in an environment without window/document
  const rootFontSize = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 16;
  return `${unit === "rem" ? (value / rootFontSize).toFixed(2) : Math.round(value)}${unit}`;
}

export function useSidebarResize({
  enableDrag = true,
  onResize,
  persistWidth, // Get persistWidth from props
  currentWidth,
  isCollapsed,
  minResizeWidth = "14rem", // e.g., 224px
  maxResizeWidth = "22rem", // e.g., 352px
  setIsDraggingRail,
  side = "left", // Default to left
}: UseSidebarResizeProps) {
  const dragRef = React.useRef<HTMLButtonElement>(null);
  const isDragging = React.useRef(false);
  const didMove = React.useRef(false); // Track if mouse actually moved after mousedown
  const startX = React.useRef(0);
  const startWidthPx = React.useRef(0);
  const finalWidthPx = React.useRef(0); // Store the calculated width during move

  const minWidthPx = React.useMemo(() => toPx(minResizeWidth), [minResizeWidth]);
  const maxWidthPx = React.useMemo(() => toPx(maxResizeWidth), [maxResizeWidth]);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      // Prevent drag initiation if the sidebar is collapsed or drag is disabled
      if (!enableDrag || isCollapsed) {
        // If it's just a click on the rail when collapsed, still allow toggle
        if (isCollapsed) {
          isDragging.current = false; // Ensure not marked as dragging
          didMove.current = false;
        }
        return; // Don't start drag logic if collapsed or disabled
      }

      isDragging.current = true; // Assume drag might start
      didMove.current = false; // Reset move status
      startWidthPx.current = toPx(currentWidth);
      startX.current = e.clientX;
      finalWidthPx.current = startWidthPx.current; // Initialize final width

      // Prevent text selection during drag
      e.preventDefault();
      document.body.style.cursor = side === 'left' ? 'col-resize' : 'col-resize'; // Indicate resizing possibility
      document.body.style.userSelect = 'none';

    },
    [enableDrag, isCollapsed, currentWidth, side]
  );

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only process if dragging was initiated on the rail
      if (!isDragging.current) return;

      // Check if the mouse actually moved significantly to differentiate click vs drag start
      if (!didMove.current && Math.abs(e.clientX - startX.current) > 3) {
        didMove.current = true;
        setIsDraggingRail(true); // Set dragging state only when movement confirms drag
      }

      if (didMove.current) {
        const currentX = e.clientX;
        const deltaX = side === 'left' ? currentX - startX.current : startX.current - currentX;
        let newWidthPx = startWidthPx.current + deltaX;

        // Clamp the width between min and max
        newWidthPx = Math.max(minWidthPx, Math.min(maxWidthPx, newWidthPx));

        // Store the potential final width - DO NOT call onResize here yet
        finalWidthPx.current = newWidthPx;

        // --- Optional: Live Visual Feedback (Method 1 - Update CSS Variable) ---
        // This provides instant visual feedback without triggering React re-renders constantly
        // Requires the Sidebar component to use this variable
        if (dragRef.current?.closest('.group\\/sidebar-wrapper')) { // Find the provider root
          const sidebarWrapper = dragRef.current.closest<HTMLElement>('.group\\/sidebar-wrapper');
          if (sidebarWrapper) {
            const { unit } = parseWidth(currentWidth || `${startWidthPx.current}px`);
            sidebarWrapper.style.setProperty('--sidebar-width', formatWidth(newWidthPx, unit));
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Clean up cursor and selection styles regardless of drag status
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Reset dragging state *before* potential state updates
      const wasDragging = didMove.current; // Capture if actual drag happened
      isDragging.current = false;
      didMove.current = false;
      setIsDraggingRail(false);

      const sidebarWrapper = dragRef.current?.closest<HTMLElement>('.group\\/sidebar-wrapper');

      // If the mouse moved (it was a drag, not just a click)
      if (wasDragging) {
        // Only apply resize if the width actually changed significantly
        if (Math.abs(finalWidthPx.current - startWidthPx.current) > 1) { // Use a small threshold
          // Get unit from original prop or fallback if needed
          const { unit } = parseWidth(currentWidth || `${startWidthPx.current}px`);
          const finalFormattedWidth = formatWidth(finalWidthPx.current, unit);

          console.log(`[useSidebarResize] Drag end. Applying width: ${finalFormattedWidth}`);
          // --- THIS IS WHERE THE REACT STATE IS UPDATED ---
          onResize(finalFormattedWidth); // Apply final size to React state
          persistWidth(finalFormattedWidth); // Persist final size

          // Optional: Explicitly remove the style override here.
          // The subsequent React re-render triggered by onResize will set the
          // correct --sidebar-width style anyway, but removing it ensures
          // there's no brief moment where the CSS var might conflict if the
          // render is slow. Usually not necessary.
          if (sidebarWrapper) {
            sidebarWrapper.style.removeProperty('--sidebar-width');
          }

        } else {
          // If drag was very short, treat it as a click/toggle
          console.log("[useSidebarResize] Drag distance minimal, toggling instead.");

          // Reset the CSS variable if we toggled instead of resizing
          if (sidebarWrapper) {
            // Reset to the width *before* the drag started
            const { unit } = parseWidth(currentWidth || `${startWidthPx.current}px`);
            sidebarWrapper.style.setProperty('--sidebar-width', formatWidth(startWidthPx.current, unit));
            // We set it back here because onToggle won't necessarily trigger
            // the SidebarProvider re-render immediately with the *old* width.
          }
        }
      } else {
        // If mouse didn't move after mousedown, treat as a simple click
        console.log("[useSidebarResize] Click detected (no move), toggling.");
        // No need to reset CSS var here, as it wasn't changed in mouseMove
      }

      // Clean up the temporary CSS variable if Method 1 was used
      // This happens regardless of resize vs toggle on mouseup
      if (dragRef.current?.closest('.group\\/sidebar-wrapper')) {
        const sidebarWrapper = dragRef.current.closest<HTMLElement>('.group\\/sidebar-wrapper');
        // Ensure the CSS variable matches the *final* React state after potential onResize/onToggle
        // This might require a slight delay or using the value from the state update.
        // For simplicity, we let the next React render based on `width` state handle the final `--sidebar-width`.
        // sidebarWrapper?.style.removeProperty('--sidebar-width'); // Or reset it based on final state
      }
    };

    // Add listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    // Optional: Add listener for mouse leaving the window during drag
    document.addEventListener("mouseleave", handleMouseUp);


    return () => {
      // Cleanup listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);


      // Ensure styles are reset if component unmounts during drag
      if (isDragging.current) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      // Clean up CSS variable on unmount if Method 1 was used
      if (dragRef.current?.closest('.group\\/sidebar-wrapper')) {
        // sidebarWrapper?.style.removeProperty('--sidebar-width'); // Or reset based on final state
      }
    };
  }, [
    // Dependencies
    onResize,
    persistWidth,
    isCollapsed, // Re-run effect if collapsed state changes
    currentWidth, // Needed to parse unit and get initial width
    minWidthPx,
    maxWidthPx,
    setIsDraggingRail,
    enableDrag,
    side,
    // startX, startWidthPx, finalWidthPx, isDragging, didMove are refs, not needed here
  ]);

  return {
    dragRef,
    // isDragging: isDragging.current, // Not typically needed externally now
    handleMouseDown,
  };
}