import { cn } from "@/lib/utils";

type ClubShieldProps = {
  acronym: string;
  size?: "md" | "lg";
  className?: string;
};

export function ClubShield({ acronym, size = "md", className }: ClubShieldProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-foreground",
        size === "md" ? "size-9 text-[12px] font-medium" : "size-12 text-[14px] font-semibold",
        className,
      )}
    >
      {acronym}
    </span>
  );
}
