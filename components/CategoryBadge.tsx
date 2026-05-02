type CategoryBadgeProps = {
  category: string;
  deductible: boolean;
};

export function CategoryBadge({ category, deductible }: CategoryBadgeProps) {
  const tone = deductible
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
    : "border-rose-500/40 bg-rose-500/10 text-rose-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}>
      {category}
    </span>
  );
}
