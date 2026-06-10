import { useState, useCallback } from 'react';

export default function SearchBar({ onSearch, loading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !loading) {
        onSearch(trimmed);
      }
    },
    [value, loading, onSearch]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative group">
        {/* Search icon */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search flight (e.g., AA100, BA249, UAE202)"
          disabled={loading}
          className="w-full pl-10 pr-24 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />

        {/* Buttons */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="px-4 py-1.5 text-sm font-medium rounded-lg
                       bg-primary-600 text-white
                       hover:bg-primary-700 active:bg-primary-800
                       disabled:bg-gray-300 dark:disabled:bg-gray-700
                       disabled:text-gray-500 dark:disabled:text-gray-400
                       disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Search
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Hint text */}
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 pl-1">
        Enter airline code + flight number • Free data via OpenSky Network
      </p>
    </form>
  );
}
