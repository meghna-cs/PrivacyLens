"use client";

import Link from "next/link";

export default function SiteHeader({
  onNewSearch,
  showNewSearch
}: {
  onNewSearch?: () => void;
  showNewSearch: boolean;
}) {
  return (
    <header className="border-b hairline bg-paper-dim/40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-serif text-xl font-bold tracking-tight text-ink">
          PrivacyLens
        </Link>
        <nav className="flex items-center gap-4 font-sans text-sm text-ink/65">
          <Link href="/methodology" className="font-semibold hover:text-seal-dark hover:underline">
            Methodology
          </Link>
          {showNewSearch && (
            <button
              onClick={onNewSearch}
              className="rounded border hairline px-4 py-2 font-semibold text-ink/80 hover:border-seal hover:text-seal-dark"
            >
              + New search
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
