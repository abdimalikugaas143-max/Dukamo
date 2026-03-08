const COLORS: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-700',
  construction: 'bg-amber-100 text-amber-700',
  healthcare: 'bg-rose-100 text-rose-700',
  agriculture: 'bg-green-100 text-green-700',
  education: 'bg-purple-100 text-purple-700',
  finance: 'bg-emerald-100 text-emerald-700',
  logistics: 'bg-orange-100 text-orange-700',
  hospitality: 'bg-pink-100 text-pink-700',
  manufacturing: 'bg-slate-100 text-slate-700',
  retail: 'bg-cyan-100 text-cyan-700',
  cleaning: 'bg-teal-100 text-teal-700',
  delivery: 'bg-indigo-100 text-indigo-700',
  design: 'bg-violet-100 text-violet-700',
  writing: 'bg-sky-100 text-sky-700',
  other: 'bg-gray-100 text-gray-600',
};

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const color = COLORS[category.toLowerCase()] || COLORS.other;
  const cls = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-block font-medium rounded-full capitalize ${color} ${cls}`}>
      {category}
    </span>
  );
}
