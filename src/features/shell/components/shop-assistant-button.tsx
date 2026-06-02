export function ShopAssistantButton() {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_32px_40px_rgba(27,28,26,0.06)] transition hover:scale-105 hover:bg-primary-container focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary md:bottom-8 md:right-8"
      aria-label="Open shop assistance"
    >
      <ChatIcon className="size-6" />
    </button>
  );
}

function ChatIcon({ className }: { className?: string }) {
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
      <path d="M5 17.5V7.75A3.75 3.75 0 0 1 8.75 4h6.5A3.75 3.75 0 0 1 19 7.75v4.5A3.75 3.75 0 0 1 15.25 16H9l-4 3v-1.5Z" />
      <path d="M9 9h6" />
      <path d="M9 12h3.5" />
    </svg>
  );
}
