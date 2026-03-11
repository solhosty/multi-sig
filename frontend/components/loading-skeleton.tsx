type Props = {
  className?: string;
};

export const LoadingSkeleton = ({ className }: Props) => {
  return <div className={`animate-pulse rounded-xl bg-[hsl(var(--muted))] ${className ?? "h-6 w-full"}`} />;
};
