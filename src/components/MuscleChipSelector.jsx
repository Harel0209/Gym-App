import { MUSCLE_GROUPS } from "../context/ExerciseLibraryContext";

export default function MuscleChipSelector({ selected = [], onChange, label }) {
  const toggle = (muscle) => {
    if (selected.includes(muscle)) {
      onChange(selected.filter((m) => m !== muscle));
    } else {
      onChange([...selected, muscle]);
    }
  };

  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-neutral-soft mb-2 block tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {MUSCLE_GROUPS.map((muscle) => {
          const isActive = selected.includes(muscle);
          return (
            <button
              key={muscle}
              type="button"
              onClick={() => toggle(muscle)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "bg-neutral-soft/10 text-neutral-soft border border-neutral-soft/20 hover:border-primary/30"
              }`}
            >
              {muscle}
            </button>
          );
        })}
      </div>
    </div>
  );
}
