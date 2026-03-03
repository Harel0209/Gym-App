import { useState } from "react";
import { useExerciseLibrary, MUSCLE_GROUPS } from "../context/ExerciseLibraryContext";
import Card from "../components/Card";
import Icon from "../components/Icon";

export default function Library() {
  const { exercises } = useExerciseLibrary();
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? exercises.filter(
        (ex) =>
          ex.primaryMuscles.includes(filter) ||
          ex.secondaryMuscles.includes(filter)
      )
    : exercises;

  return (
    <div className="space-y-6 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          Exercise Library
        </h2>
        <p className="text-sm text-neutral-soft">
          {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Muscle filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("")}
          className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
            !filter
              ? "bg-primary text-bg-dark"
              : "bg-neutral-soft/10 text-neutral-soft hover:text-neutral-med"
          }`}
        >
          All
        </button>
        {MUSCLE_GROUPS.map((m) => {
          const short = m
            .replace("Shoulders (", "")
            .replace("Back (", "")
            .replace(")", "");
          return (
            <button
              key={m}
              onClick={() => setFilter(filter === m ? "" : m)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                filter === m
                  ? "bg-primary text-bg-dark"
                  : "bg-neutral-soft/10 text-neutral-soft hover:text-neutral-med"
              }`}
            >
              {short}
            </button>
          );
        })}
      </div>

      {/* Exercise list */}
      <div className="space-y-3 pb-6">
        {filtered.map((ex) => (
          <Card key={ex.id}>
            <div className="flex items-center gap-3 p-4">
              <span className="text-2xl">{ex.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{ex.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ex.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded"
                    >
                      {m}
                    </span>
                  ))}
                  {ex.secondaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-bold bg-neutral-soft/10 text-neutral-soft px-1.5 py-0.5 rounded"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                {(ex.restSeconds ?? 0) > 0 && (
                  <p className="text-[10px] text-neutral-soft mt-1">
                    Rest: {Math.floor(ex.restSeconds / 60)}:
                    {String(ex.restSeconds % 60).padStart(2, "0")}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty filter state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="fitness_center"
            className="text-5xl text-neutral-soft/30 mb-3"
          />
          <p className="text-sm text-neutral-soft">No exercises match this filter</p>
        </div>
      )}
    </div>
  );
}
