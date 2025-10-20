import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
  className?: string;
}

export function AuthFooter({
  text,
  linkText,
  linkHref,
  className,
}: AuthFooterProps) {
  return (
    <p className={cn("text-muted-foreground text-center text-sm", className)}>
      {text}{" "}
      <Link
        href={linkHref}
        className="text-primary font-medium hover:underline"
      >
        {linkText}
      </Link>
    </p>
  );
}
