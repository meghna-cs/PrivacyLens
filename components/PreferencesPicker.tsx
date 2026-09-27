"use client";

import { INTEREST_OPTIONS, InterestId } from "@/lib/types";

export default function PreferencesPicker({
  selected,
  onChange,
  onJump
}: {
  selected: InterestId[];
  onChange: (next: InterestId[]) => void;
  onJump: (sectionId: string) => void;
}) {
  function handleClick(id: InterestId, section: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    onJump(section);
  }

  return (
    <div className="border-b hairline pb-4">
      <p className="mb-2.5 font-sans text-sm font-medium text-ink/75">
        What matters most to you? Click one to jump there and bring it to the top.
      </p>
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleClick(opt.id, opt.section)}
              className={`rounded-full border px-3 py-1 font-sans text-xs transition-colors ${
                active
                  ? "border-seal bg-seal text-paper"
                  : "hairline text-ink/60 hover:border-ink/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
