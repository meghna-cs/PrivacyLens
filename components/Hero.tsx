"use client";

import { useState } from "react";

export default function Hero({
  onSubmit,
  loading,
  error
}: {
  onSubmit: (input: { url?: string; policyText?: string }) => void;
  loading: boolean;
  error: string | null;
}) {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "url" && url.trim()) onSubmit({ url: url.trim() });
    if (mode === "paste" && text.trim()) onSubmit({ policyText: text.trim() });
  }

  return (
    <section className="mx-auto max-w-2xl px-6 pt-14 pb-10 text-center">
      <p className="mb-4 font-sans text-sm tracking-wide text-seal-dark">
        A privacy rights dossier, built from the fine print
      </p>
      <h1 className="font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
        Know what they know.
        <br />
        Know your options.
      </h1>
      <p className="mx-auto mt-5 max-w-lg font-sans text-base text-ink/70">
        Paste a privacy policy or point PrivacyLens at one. It turns the fine
        print into a personal dossier: what data is collected, why it's
        used, who receives it, how long it may be kept, what's left
        unclear — and what options you may have.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 text-left">
        <div className="mb-3 flex gap-1 font-sans text-sm">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`rounded-t border border-b-0 px-4 py-2 hairline ${
              mode === "url" ? "bg-paper-dim font-medium" : "bg-transparent text-ink/50"
            }`}
          >
            Website URL
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`rounded-t border border-b-0 px-4 py-2 hairline ${
              mode === "paste" ? "bg-paper-dim font-medium" : "bg-transparent text-ink/50"
            }`}
          >
            Paste policy text
          </button>
        </div>

        <div className="border hairline bg-paper-dim/60 p-1">
          {mode === "url" ? (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com/privacy-policy"
              className="w-full bg-transparent px-4 py-3 font-sans text-ink placeholder:text-ink/40"
            />
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full privacy policy text here…"
              rows={8}
              className="w-full resize-y bg-transparent px-4 py-3 font-sans text-ink placeholder:text-ink/40"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded bg-seal py-3 font-sans font-medium text-paper transition-colors hover:bg-seal-dark disabled:opacity-50"
        >
          {loading ? "Reading the fine print…" : "Open the dossier"}
        </button>

        {error && (
          <p className="mt-3 border-l-2 border-rose bg-rose/5 px-3 py-2 font-sans text-sm text-rose">
            {error}
          </p>
        )}

        <p className="mt-4 font-sans text-xs text-ink/45">
          Some sites block automated fetching or require JavaScript to load
          their policy — if the URL doesn't work, paste the text instead.
        </p>
      </form>
    </section>
  );
}
