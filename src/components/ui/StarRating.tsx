import { Icon } from "./Icon";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={15}
          className={i < rating ? "fill-accent-light text-accent-light" : "text-white/15"}
        />
      ))}
    </div>
  );
}
