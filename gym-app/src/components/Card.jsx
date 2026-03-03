/** Reusable card matching the mockup surface style */
export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-surface-dark rounded-xl border border-white/5 shadow-xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
