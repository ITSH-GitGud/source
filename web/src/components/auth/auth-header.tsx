import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function AuthHeader({ title, description, className }: AuthHeaderProps) {
  return (
    <div className={cn("space-y-2 text-center", className)}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}
