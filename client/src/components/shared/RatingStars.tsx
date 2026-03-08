import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  totalReviews?: number;
}

export function RatingStars({ rating, max = 5, size = 14, showValue = true, totalReviews }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
        />
      ))}
      {showValue && (
        <span className="text-xs text-slate-500 ml-1">
          {rating > 0 ? rating.toFixed(1) : '—'}
          {totalReviews !== undefined && ` (${totalReviews})`}
        </span>
      )}
    </div>
  );
}
