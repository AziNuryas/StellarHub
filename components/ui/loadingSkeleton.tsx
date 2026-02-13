export function PostSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-900/30 border border-gray-800/50 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-xl bg-gray-800"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-800 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-800 rounded"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-800 rounded w-4/6"></div>
      </div>
      <div className="h-48 bg-gray-800 rounded-xl mt-4"></div>
      <div className="flex gap-4 mt-4">
        <div className="h-8 w-16 bg-gray-800 rounded"></div>
        <div className="h-8 w-16 bg-gray-800 rounded"></div>
        <div className="h-8 w-16 bg-gray-800 rounded"></div>
      </div>
    </div>
  )
}

export function ImageSkeleton() {
  return (
    <div className="w-full h-64 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl animate-pulse">
      <div className="h-full w-full animate-shimmer"></div>
    </div>
  )
}