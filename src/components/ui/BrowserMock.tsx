export function BrowserMock({ tone }: { tone: "empty" | "outdated" | "clean" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-black/30">
      <div className="flex items-center gap-1.5 border-b border-hairline px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
      </div>

      {tone === "empty" && (
        <div className="flex h-28 flex-col items-center justify-center gap-2 opacity-40">
          <div className="h-px w-16 bg-white/20" />
          <span className="text-[10px] uppercase tracking-wide text-silver-dim">
            No site found
          </span>
        </div>
      )}

      {tone === "outdated" && (
        <div className="space-y-2 p-4 opacity-70">
          <div className="h-3 w-2/3 rounded bg-white/20" />
          <div className="h-2 w-full rounded bg-white/10" />
          <div className="h-2 w-5/6 rounded bg-white/10" />
          <div className="mt-3 h-8 w-20 rounded bg-white/10" />
        </div>
      )}

      {tone === "clean" && (
        <div className="space-y-2.5 p-4">
          <div className="h-3 w-2/3 rounded bg-gradient-to-r from-accent-light to-accent-glow animate-[badge-breathe_3s_ease-in-out_infinite]" />
          <div className="h-2 w-full rounded bg-white/15" />
          <div className="h-2 w-4/6 rounded bg-white/15" />
          <div className="mt-3 h-8 w-24 rounded-full bg-accent shadow-[0_0_16px_rgba(47,109,246,0.5)] animate-[badge-breathe_2.4s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );
}
