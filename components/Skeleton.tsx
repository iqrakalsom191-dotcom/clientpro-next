export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="skeleton h-8 w-8 rounded-lg mb-3" />
      <div className="skeleton h-8 w-24 rounded-lg mb-2" />
      <div className="skeleton h-4 w-20 rounded-lg" />
    </div>
  )
}

export function ClientCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-11 h-11 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-4 w-32 rounded-lg mb-2" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-3/4 rounded-lg" />
      <div className="skeleton h-8 w-full rounded-lg mt-2" />
    </div>
  )
}
