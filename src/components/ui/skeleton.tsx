import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md",
        "bg-gradient-to-r from-slate-200/60 via-slate-100/60 to-slate-200/60",
        "dark:from-slate-800/60 dark:via-slate-700/60 dark:to-slate-800/60",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
