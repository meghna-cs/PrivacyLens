"use client";

export default function InfoModal({
  title,
  text,
  onClose
}: {
  title: string;
  text: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-w-md rounded border hairline bg-paper p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink/50 hover:text-ink">
            ✕
          </button>
        </div>
        <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-ink/80">
          {text}
        </p>
      </div>
    </div>
  );
}
