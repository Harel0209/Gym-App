/**
 * Pill-style toggle tabs (e.g. Volume / Strength)
 * tabs: [{ id, label }]
 */
export default function ToggleTabs({ tabs, activeId, onSelect }) {
  return (
    <div className="flex bg-neutral-soft/10 p-1 rounded-lg">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? "bg-bg-dark text-primary font-bold shadow-sm"
                : "font-medium text-neutral-soft hover:text-neutral-med"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
