import Icon from "./Icon";

export default function StatCard({ icon, label, value, unit, footnote, footnoteColor = "text-neutral-soft" }) {
  return (
    <div className="bg-neutral-soft/5 border border-neutral-soft/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} className="text-primary text-xl" />
        <p className="text-neutral-soft text-xs font-medium">{label}</p>
      </div>
      <h3 className="text-xl font-bold tracking-tight text-neutral-strong">
        {value}{" "}
        {unit && <span className="text-sm font-normal text-neutral-soft">{unit}</span>}
      </h3>
      {footnote && (
        <p className={`text-[10px] mt-1 ${footnoteColor}`}>{footnote}</p>
      )}
    </div>
  );
}
