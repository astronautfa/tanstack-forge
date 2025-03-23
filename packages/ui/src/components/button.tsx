import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@app/ui/components/tooltip";
import { cn } from "@app/ui/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary/75 border border-primary-foreground/25 text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
      active: {
        true: "bg-accent text-accent-foreground",
      },
      focused: {
        true: "ring-2 ring-ring ring-offset-2 ring-offset-background",
      },
      isMenu: {
        true: "justify-between",
      },
      truncate: {
        true: "truncate",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface TooltipProps {
  tooltip?: React.ReactNode;
  tooltipTriggerProps?: React.ComponentPropsWithoutRef<typeof TooltipTrigger>;
  tooltipContentProps?: React.ComponentPropsWithoutRef<typeof TooltipContent>;
  tooltipProps?: React.ComponentPropsWithoutRef<typeof Tooltip>;
}

export interface BaseButtonProps extends VariantProps<typeof buttonVariants> {
  active?: boolean;
  focused?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: 'left' | 'right';
  isMenu?: boolean;
  isPending?: boolean;
  label?: string;
  loading?: boolean;
  loadingClassName?: string;
  truncate?: boolean;
  onToggleClick?: () => void;
}

export interface ButtonProps
  extends BaseButtonProps,
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  TooltipProps {
  asChild?: boolean;
}

const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("animate-spin", className)} />
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      active,
      asChild = false,
      children,
      className,
      disabled,
      focused,
      icon,
      iconPlacement = 'left',
      isMenu,
      isPending,
      label,
      loading,
      loadingClassName,
      size,
      tooltip,
      tooltipContentProps,
      tooltipProps,
      tooltipTriggerProps,
      truncate,
      type,
      variant,
      onToggleClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const buttonClassName = cn(
      buttonVariants({
        active,
        className,
        focused,
        isMenu,
        size,
        truncate,
        variant,
      })
    );

    const buttonProps = {
      'aria-label': label || undefined,
      className: buttonClassName,
      disabled: disabled || loading || isPending,
      onClick: onToggleClick,
      ...(!asChild && type
        ? { type: type as 'button' | 'reset' | 'submit' }
        : { type: 'button' as const }),
      ...props,
    } as React.ButtonHTMLAttributes<HTMLButtonElement>;

    const content = (
      <>
        {loading && <Spinner className={loadingClassName ?? "mr-2"} />}
        {icon && iconPlacement === 'left' && <span className="shrink-0">{icon}</span>}
        {children}
        {icon && iconPlacement === 'right' && <span className="shrink-0">{icon}</span>}
      </>
    );

    const buttonElement = asChild ? (
      <Comp {...buttonProps} ref={ref} data-slot="button">
        {React.Children.only(children)}
      </Comp>
    ) : (
      <Comp {...buttonProps} ref={ref} data-slot="button">
        {content}
      </Comp>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip {...tooltipProps}>
            <TooltipTrigger asChild {...tooltipTriggerProps}>
              {buttonElement}
            </TooltipTrigger>
            <TooltipContent {...tooltipContentProps}>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonElement;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };