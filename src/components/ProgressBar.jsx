export default function ProgressBar({ value = 0, max = 100, label, detail }) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-end mb-2">
        {label && <span className="text-sm font-medium text-neutral-strong/60">{label}</span>}
        {detail && <span className="text-sm font-bold text-primary">{detail}</span>}
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
