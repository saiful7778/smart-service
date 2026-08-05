import { Skeleton } from "@workspace/ui/components/skeleton";

export function LeadNotesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <LeadNoteSkeleton key={item} />
      ))}
    </div>
  );
}

export function LeadNoteSkeleton() {
  return (
    <div className="p-3 space-y-2 bg-card border rounded-md">
      <div className="flex items-center justify-between gap-1">
        <div className="inline-flex items-center gap-1">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-7 rounded-sm" />
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
      <Skeleton className="h-3 w-20 rounded-md" />
    </div>
  );
}
