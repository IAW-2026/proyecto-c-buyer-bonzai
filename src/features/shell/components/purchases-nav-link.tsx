import Link from 'next/link';

export default function PurchasesNavLink() {
  return (
    <Link
      href="/purchases"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto sm:px-3 sm:font-label sm:text-[10px] sm:font-semibold sm:uppercase sm:tracking-[0.12em]"
      aria-label="My purchases"
    >
      <ReceiptIcon className="size-5 sm:hidden" />
      <span className="hidden sm:inline">My purchases</span>
    </Link>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
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
      <path d="M7 3.75h10v16.5l-2-1.25-2 1.25-2-1.25-2 1.25-2-1.25V3.75Z" />
      <path d="M9.75 8.25h4.5" />
      <path d="M9.75 12h4.5" />
      <path d="M9.75 15.75h2.5" />
    </svg>
  );
}
