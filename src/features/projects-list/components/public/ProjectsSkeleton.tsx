export function ProjectsSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading projects" className="space-y-8">
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="mb-5 h-4 w-32 animate-pulse rounded-full bg-mist" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded-full bg-mist" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-mist" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-4 w-40 animate-pulse rounded-full bg-mist" />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-line bg-white"
          >
            <div className="aspect-[4/3] animate-pulse bg-mist" />
            <div className="space-y-3 p-6">
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-mist" />
              <div className="h-6 w-3/4 animate-pulse rounded-full bg-mist" />
              <div className="h-3 w-full animate-pulse rounded-full bg-mist" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-mist" />
              <div className="flex items-center justify-between pt-3">
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-mist" />
                <div className="size-4 animate-pulse rounded-full bg-mist" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-10 w-12 animate-pulse rounded-lg bg-mist" />
        ))}
      </div>

      <span className="sr-only">Loading projects...</span>
    </div>
  );
}