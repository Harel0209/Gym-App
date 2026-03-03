import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutTemplates } from "../context/WorkoutContext";
import Card from "../components/Card";
import Icon from "../components/Icon";
import EmojiPicker from "../components/EmojiPicker";
import ExercisePickerModal from "../components/ExercisePickerModal";

export default function WorkoutEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate } = useWorkoutTemplates();

  const source = getTemplate(id);
  const [template, setTemplate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);

  // ── Drag state ──
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const cardRefs = useRef([]);
  const dragRef = useRef({ active: false, startIndex: null });

  // Initialize local copy from context (handles async arrival after create)
  useEffect(() => {
    if (source && !template) {
      setTemplate(structuredClone(source));
    }
  }, [source]);

  // ── Drag handlers ──
  const handleDragStart = useCallback((e, index) => {
    e.preventDefault();
    dragRef.current = { active: true, startIndex: index };
    setDragIndex(index);
    setOverIndex(index);

    const onMove = (ev) => {
      if (!dragRef.current.active) return;
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
          setOverIndex(i);
          break;
        }
      }
    };

    const onEnd = () => {
      if (dragRef.current.active) {
        const from = dragRef.current.startIndex;
        dragRef.current = { active: false, startIndex: null };

        setOverIndex((to) => {
          if (from !== null && to !== null && from !== to) {
            setTemplate((prev) => {
              const next = [...prev.exercises];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return { ...prev, exercises: next };
            });
          }
          return null;
        });
        setDragIndex(null);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);
  }, []);

  // Not found
  if (!source && !template) {
    return (
      <div className="space-y-6 pt-4 px-4 max-w-md mx-auto text-center py-12">
        <Icon name="error" className="text-5xl text-neutral-soft/30 mb-3" />
        <p className="text-sm text-neutral-soft">Workout not found</p>
        <button
          onClick={() => navigate("/planner")}
          className="text-primary font-bold text-sm"
        >
          Back to Planner
        </button>
      </div>
    );
  }

  if (!template) return null;

  // ── Save ──
  const handleSave = () => {
    updateTemplate(id, {
      name: template.name,
      icon: template.icon,
      exercises: template.exercises,
    });
    navigate("/planner");
  };

  // ── Exercise operations ──
  const handleAddExercise = (libraryExercise) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: crypto.randomUUID(),
          libraryExerciseId: libraryExercise.id,
          name: libraryExercise.name,
          icon: libraryExercise.icon,
          sets: [{ id: crypto.randomUUID(), targetWeight: 0, targetReps: 10 }],
        },
      ],
    }));
  };

  const removeExercise = (exerciseId) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  };

  // ── Set operations ──
  const addSet = (exerciseId) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: crypto.randomUUID(),
              targetWeight: lastSet?.targetWeight ?? 0,
              targetReps: lastSet?.targetReps ?? 10,
            },
          ],
        };
      }),
    }));
  };

  const removeSet = (exerciseId, setId) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      }),
    }));
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, [field]: value } : s
          ),
        };
      }),
    }));
  };

  return (
    <div className="space-y-6 pt-4 px-4 max-w-md mx-auto pb-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/planner")}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <Icon name="arrow_back" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{template.icon}</span>
            <h2 className="text-xl font-bold tracking-tight truncate">
              {template.name}
            </h2>
          </div>
          <p className="text-primary text-xs font-medium uppercase tracking-widest">
            {template.exercises.length} exercise
            {template.exercises.length !== 1 ? "s" : ""}
            {" \u00B7 "}
            {template.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}{" "}
            sets
          </p>
        </div>
        <button
          onClick={() => setShowNameEdit(!showNameEdit)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-soft hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Icon name="edit" className="text-lg" />
        </button>
      </div>

      {/* ── Name / Icon editor (toggle) ── */}
      {showNameEdit && (
        <Card>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-neutral-soft mb-1 block tracking-wider">
                Workout Name
              </label>
              <input
                type="text"
                value={template.name}
                onChange={(e) =>
                  setTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full bg-white/10 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-strong placeholder:text-neutral-soft/50 border border-white/5 focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
            <EmojiPicker
              selected={template.icon}
              onSelect={(emoji) =>
                setTemplate((prev) => ({ ...prev, icon: emoji }))
              }
            />
            <button
              onClick={() => setShowNameEdit(false)}
              className="w-full py-2 rounded-lg text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              Done
            </button>
          </div>
        </Card>
      )}

      {/* ── Exercise cards with per-set rows ── */}
      <div className="space-y-4">
        {template.exercises.map((exercise, exIndex) => {
          const isDragging = dragIndex === exIndex;
          const isOver = overIndex === exIndex && dragIndex !== null && dragIndex !== exIndex;

          return (
            <div
              key={exercise.id}
              ref={(el) => (cardRefs.current[exIndex] = el)}
              className={`transition-all duration-150 ${
                isDragging ? "opacity-40 scale-[0.97]" : ""
              } ${isOver ? "translate-y-0" : ""}`}
            >
              {/* Drop indicator line */}
              {isOver && dragIndex !== null && dragIndex > exIndex && (
                <div className="h-1 bg-primary rounded-full mb-2 shadow-[0_0_8px_rgba(187,255,0,0.5)]" />
              )}

              <Card>
                {/* Exercise header */}
                <div className="p-4 flex items-center gap-2 border-b border-white/5">
                  {/* Drag handle */}
                  <div
                    onMouseDown={(e) => handleDragStart(e, exIndex)}
                    onTouchStart={(e) => handleDragStart(e, exIndex)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-soft/50 hover:text-neutral-soft hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors touch-none select-none shrink-0"
                  >
                    <Icon name="drag_indicator" className="text-lg" />
                  </div>

                  <span className="text-xl">{exercise.icon}</span>
                  <h3 className="text-lg font-bold flex-1 min-w-0 truncate">
                    {exercise.name}
                  </h3>

                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-soft hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <Icon name="delete" className="text-lg" />
                  </button>
                </div>

                {/* Sets table */}
                <div className="p-4 space-y-2">
                  {/* Column headers */}
                  <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-[10px] uppercase tracking-widest text-neutral-strong/40 font-bold px-1">
                    <div className="text-center">Set</div>
                    <div className="text-center">Weight (kg)</div>
                    <div className="text-center">Reps</div>
                    <div />
                  </div>

                  {/* Set rows */}
                  {exercise.sets.map((set, index) => (
                    <div
                      key={set.id}
                      className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center bg-white/5 rounded-lg p-2"
                    >
                      <div className="text-center font-bold text-neutral-soft text-sm">
                        {index + 1}
                      </div>

                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.targetWeight || ""}
                        onChange={(e) =>
                          updateSet(
                            exercise.id,
                            set.id,
                            "targetWeight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded text-center py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-neutral-strong"
                      />

                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.targetReps || ""}
                        onChange={(e) =>
                          updateSet(
                            exercise.id,
                            set.id,
                            "targetReps",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded text-center py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-neutral-strong"
                      />

                      <button
                        onClick={() => removeSet(exercise.id, set.id)}
                        disabled={exercise.sets.length <= 1}
                        className="w-8 h-8 rounded flex items-center justify-center text-neutral-soft hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </div>
                  ))}

                  {/* Add set */}
                  <button
                    onClick={() => addSet(exercise.id)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-neutral-strong/60 hover:text-primary transition-colors mt-1"
                  >
                    <Icon name="add" className="text-sm" />
                    Add Set
                  </button>
                </div>
              </Card>

              {/* Drop indicator line (below) */}
              {isOver && dragIndex !== null && dragIndex < exIndex && (
                <div className="h-1 bg-primary rounded-full mt-2 shadow-[0_0_8px_rgba(187,255,0,0.5)]" />
              )}
            </div>
          );
        })}

        {/* Add exercise */}
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-4 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 text-primary/60 hover:text-primary hover:border-primary/50 transition-all hover:bg-primary/5"
        >
          <Icon name="add_circle" />
          <span className="font-semibold">Add Exercise</span>
        </button>
      </div>

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        className="w-full bg-primary text-bg-dark font-black py-4 rounded-xl shadow-[0_0_20px_rgba(187,255,0,0.3)] hover:shadow-[0_0_30px_rgba(187,255,0,0.5)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Icon name="save" className="font-bold" />
        SAVE TEMPLATE
      </button>

      {/* ── Exercise picker modal ── */}
      <ExercisePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
}
