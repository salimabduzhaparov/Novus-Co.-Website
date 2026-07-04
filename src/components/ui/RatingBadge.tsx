import { StarRating } from "./StarRating";

export function RatingBadge({ average, count }: { average: number; count: number }) {
  return (
    <div className="mx-auto flex w-fit items-center gap-4 rounded-full border border-accent-light/30 bg-white/[0.03] px-6 py-3 shadow-[0_0_30px_rgba(47,109,246,0.15)]">
      <span
        className="text-2xl font-black text-ink"
        style={{ textShadow: "0 0 20px rgba(47,109,246,0.4)" }}
      >
        {average.toFixed(1)}
      </span>
      <div className="text-left">
        <StarRating rating={Math.round(average)} />
        <div className="mt-0.5 text-xs text-silver-dim">Based on {count} client reviews</div>
      </div>
    </div>
  );
}
