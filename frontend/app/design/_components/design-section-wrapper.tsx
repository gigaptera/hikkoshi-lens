import { cn } from "@/lib/utils";

interface DesignSectionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function DesignSectionWrapper({
  title,
  description,
  children,
  className,
  ...props
}: DesignSectionWrapperProps) {
  return (
    <section className={cn("space-y-6", className)} {...props}>
      <div>
        <h2 className="text-2xl font-bold border-b pb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
