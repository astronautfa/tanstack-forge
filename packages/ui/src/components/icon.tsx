import React from 'react';

import type { LucideProps } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from "@app/ui/lib/utils";

export type IconProps = {
  /**
   * All icons must be associated with an label, either next to the icon (using
   * sr-only) or on an interactive parent element (using aria-label). The latter
   * case is preferred (e.g. inside a button). If the icon does not add any new
   * information, it can be safely hidden.
   */
  label?: string;
} & LucideProps &
  VariantProps<typeof iconVariants>;

export const iconVariants = cva('', {
  defaultVariants: {
    size: 'sm',
    variant: 'default',
  },
  variants: {
    size: {
      10: 'size-10',
      lg: 'size-6',
      md: 'size-5',
      sm: 'size-4',
      xl: 'size-8',
      xs: 'size-3',
    },
    spin: {
      true: 'inline-block animate-spin',
    },
    variant: {
      default: 'text-subtle-foreground',
      menuItem: 'mr-2 size-5',
      muted: 'text-muted-foreground/70',
      placeholder: 'text-muted-foreground/50',
      primary: '',
      toolbar: 'size-5',
    },
  },
});

export type IconFC = React.FC<IconProps>;

export const createIcon = (
  Icon: React.FC<LucideProps>,
  { spin: defaultSpin, ...defaultProps }: Partial<IconProps> = {}
) =>
  React.forwardRef<SVGSVGElement, IconProps>(
    ({ className, label, size, spin = defaultSpin, variant, ...props }, ref) => {
      return (
        <>
          {!!label && <span className="sr-only">{label}</span>}

          <Icon
            ref={ref}
            className={cn(
              iconVariants({ size, spin, variant }),
              defaultProps?.className,
              className
            )}
            aria-hidden
            {...defaultProps}
            {...props}
          />
        </>
      );
    }
  );
