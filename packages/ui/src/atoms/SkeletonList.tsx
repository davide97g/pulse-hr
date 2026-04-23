import { Skeleton } from "@pulse-hr/ui/primitives/skeleton";
import { Card } from "@pulse-hr/ui/primitives/card";

export function SkeletonRows({ rows = 6, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          {avatar && <Skeleton className="h-9 w-9 rounded-full" />}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-[40%]" />
            <Skeleton className="h-2.5 w-[60%]" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="p-5 space-y-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-3 w-[60%]" />
          <Skeleton className="h-7 w-[40%]" />
          <Skeleton className="h-2.5 w-[70%]" />
        </Card>
      ))}
    </div>
  );
}
