import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center rounded-sm bg-clip-padding text-sm font-bold whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Shadow: darker amber to stay in the yellow family
        default:
          "bg-primary text-foreground shadow-[4px_4px_0px_0px_#b37e00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#b37e00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        // Shadow: same navy at lower opacity for a subtle lift
        secondary:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_0px_0px_rgba(2,48,71,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(2,48,71,0.5)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "bg-transparent hover:bg-secondary/5 active:scale-[0.98] aria-expanded:bg-secondary/5",
        // Shadow: darker red in the red family
        destructive:
          "bg-destructive text-white shadow-[4px_4px_0px_0px_#991b1b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#991b1b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.98]",
        // Shadow: darker teal in the cyan family
        accent:
          "bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_#155e75] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#155e75] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none aria-expanded:bg-accent aria-expanded:text-accent-foreground",
      },
      size: {
        default:
          "h-8 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-3 text-xs in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3.5 text-[0.8rem] in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-5 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xl: "h-11 gap-2 px-7 text-lg has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-5",

        icon: "size-8",
        "icon-xs":
          "size-6 in-data-[slot=button-group]:rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 in-data-[slot=button-group]:rounded-xl",
        "icon-lg": "size-9",
        "icon-xl": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
