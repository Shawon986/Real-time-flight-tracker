import { useState, useCallback } from 'react';

export default function SearchBar({ onSearch, loading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !loading) onSearch(trimmed);
    },
    [value, loading, onSearch]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        {/* Focus glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066ff]/30 to-[#00e676]/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a8ba0] group-focus-within:text-[#00e676] transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter flight number (e.g., AA100, BA249, UAE202)"
          disabled={loading}
          className="relative w-full pl-11 pr-28 py-3.5 text-sm rounded-2xl
                     bg-[#0c1524] border border-white/[0.06]
                     text-white placeholder-[#7a8ba0]
                     focus:outline-none focus:border-[#0066ff]/30
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        {/* Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-[#7a8ba0] hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Clear"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="px-4 py-2 text-xs font-bold rounded-xl
                       bg-gradient-to-r from-[#0066ff] to-[#3399ff] text-white
                       hover:shadow-[0_0_24px_rgba(0,102,255,0.35)]
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none
                       transition-all active:scale-95"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                ...
              </span>
            ) : 'Track'}
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="mt-1.5 text-[10px] text-[#7a8ba0]/60 pl-1">
        Live ADS-B data via OpenSky Network · Updates every 15s
      </p>
    </form>
  );
}
