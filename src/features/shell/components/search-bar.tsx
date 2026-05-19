type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className = '' }: SearchBarProps) {
  return (
    <form
      role="search"
      className={`min-w-0 flex-1 ${className}`}
      action="/"
    >
      <label htmlFor="site-search" className="sr-only">
        Search plants and accessories
      </label>
      <div className="flex h-10 items-center gap-3 rounded-lg bg-surface-container px-3 text-on-surface-variant transition-colors focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/15">
        <SearchIcon className="size-4 shrink-0 text-secondary" />
        <input
          id="site-search"
          name="q"
          type="search"
          placeholder="Search plants, vessels, care notes"
          className="w-full bg-transparent font-body text-sm text-primary outline-none placeholder:text-on-surface-variant/65"
        />
      </div>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="6.5" />
    </svg>
  );
}
