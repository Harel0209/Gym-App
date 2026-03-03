import Icon from "./Icon";

/**
 * Horizontally scrollable chip selector (muscle groups, categories, etc.)
 * items: [{ id, icon, label }]
 */
export default function ChipSelector({ items, activeId, onSelect }) {
  return (
    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-4">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-xl transition-all ${
              isActive
                ? "bg-primary text-bg-dark shadow-lg shadow-primary/20"
                : "bg-neutral-soft/10 border border-neutral-soft/20 text-neutral-med hover:border-primary/50"
            }`}
          >
            <Icon name={item.icon} className="text-3xl mb-1" />
            <span className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
