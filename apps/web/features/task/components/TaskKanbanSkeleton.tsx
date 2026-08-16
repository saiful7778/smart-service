import { TaskStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export function TaskKanbanSkeleton() {
  return (
    <div className="grid size-full auto-cols-[minmax(200px,1fr)] overflow-x-auto grid-flow-col gap-2">
      {Array.from({ length: TaskStatusEnumSchema.options.length }).map(
        (_, idx) => (
          <TaskKanbanColumnSkeleton key={`column-${idx}`} />
        )
      )}
    </div>
  );
}

function TaskKanbanColumnSkeleton() {
  return (
    <div className="flex h-full min-w-50 flex-col border rounded-xl bg-muted/30">
      <div className="flex items-center justify-between p-2 border-b">
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <TaskKanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TaskKanbanCardSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-2 shadow-sm", className)}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            <Skeleton className="h-6 w-6 rounded-full border-2 border-background" />
            <Skeleton className="h-6 w-6 rounded-full border-2 border-background" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
