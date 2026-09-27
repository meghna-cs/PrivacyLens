"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Dossier from "@/components/Dossier";
import SiteHeader from "@/components/SiteHeader";
import BackToTop from "@/components/BackToTop";
import type { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: { url?: string; policyText?: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        window.scrollTo({ top: 0 });
      }
    } catch {
      setError("Something went wrong reaching the analysis service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen">
      <SiteHeader showNewSearch={!!result} onNewSearch={reset} />

      {!result ? (
        <Hero onSubmit={handleSubmit} loading={loading} error={error} />
      ) : (
        <Dossier result={result} onReset={reset} />
      )}

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4">
        <p className="border-t hairline pt-4 font-sans text-xs text-ink/40">
          PrivacyLens analyzes what the provided policy states. It doesn't
          independently verify a company's actual data practices, and it
          isn't legal advice. Findings can be incomplete or wrong; when it
          matters, check the original policy and consult a professional.
        </p>
      </footer>

      <BackToTop />
    </main>
  );
}
