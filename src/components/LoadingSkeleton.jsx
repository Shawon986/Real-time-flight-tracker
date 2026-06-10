export default function LoadingSkeleton() {
  return (
    <div className="animate-fade-in space-y-5">
      {/* Flight info skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-3.5 w-24 bg-gray-150 dark:bg-gray-700/50 rounded-md animate-pulse" />
          </div>
          <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="h-3 w-14 bg-gray-150 dark:bg-gray-700/50 rounded mb-2 animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Map skeleton */}
      <div className="glass-card rounded-2xl h-[400px] sm:h-[500px] flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <svg className="w-14 h-14 text-primary-400/40 dark:text-primary-500/30 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {/* Radar rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border-2 border-primary-400/20 animate-ping absolute" />
            <div className="w-28 h-28 rounded-full border border-primary-400/10 animate-ping absolute" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium animate-pulse-slow">
          Searching for aircraft...
        </p>
      </div>
    </div>
  );
}
