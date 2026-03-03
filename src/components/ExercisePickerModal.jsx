import { useExerciseLibrary } from "../context/ExerciseLibraryContext";
import Icon from "./Icon";

export default function ExercisePickerModal({ open, onClose, onSelect }) {
  const { exercises } = useExerciseLibrary();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      {/* Bottom sheet */}
      <div
        className="w-full max-h-[70vh] bg-bg-dark border-t border-white/10 rounded-t-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-neutral-soft/30" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-lg">Add from Library</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <Icon name="close" className="text-neutral-soft" />
          </button>
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)] px-4 pb-6 space-y-2">
          {exercises.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                name="fitness_center"
                className="text-4xl text-neutral-soft/30 mb-2"
              />
              <p className="text-sm text-neutral-soft">Library is empty</p>
              <p className="text-xs text-neutral-soft/60 mt-1">
                Add exercises in the Library page first
              </p>
            </div>
          ) : (
            exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-dark border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <span className="text-2xl">{ex.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{ex.name}</p>
                  <p className="text-[10px] text-neutral-soft truncate">
                    {ex.primaryMuscles.join(", ")}
                  </p>
                </div>
                <Icon name="add_circle" className="text-primary/60" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
