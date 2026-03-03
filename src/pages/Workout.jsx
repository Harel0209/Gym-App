import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useWorkoutTemplates } from "../context/WorkoutContext";
import { useWorkoutLog } from "../context/WorkoutLogContext";
import { useExerciseLibrary } from "../context/ExerciseLibraryContext";
import Icon from "../components/Icon";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";

function buildActiveExercises(template) {
  return template.exercises.map((ex) => ({
    id: ex.id,
    libraryExerciseId: ex.libraryExerciseId,
    name: ex.name,
    icon: ex.icon,
    sets: ex.sets.map((s) => ({
      id: s.id,
      targetWeight: s.targetWeight,
      targetReps: s.targetReps,
      actualWeight: s.targetWeight,
      actualReps: s.targetReps,
      done: false,
    })),
  }));
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function tone(time) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start(time);
      osc.stop(time + 0.12);
    }
    tone(ctx.currentTime);
    tone(ctx.currentTime + 0.2);
    tone(ctx.currentTime + 0.4);
  } catch {
    // Audio not available
  }
}

export default function Workout() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate } = useWorkoutTemplates();
  const { addLog } = useWorkoutLog();
  const { exercises: libraryExercises } = useExerciseLibrary();

  const template = getTemplate(templateId);
  const startTime = useRef(Date.now());

  const [exercises, setExercises] = useState(() =>
    template ? buildActiveExercises(template) : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Elapsed workout timer ──
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  // ── Rest timer state ──
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [restDone, setRestDone] = useState(false);
  const restRef = useRef(null);

  // Rest time lookup from exercise library
  const restTimeMap = useMemo(() => {
    const map = {};
    for (const ex of libraryExercises) {
      map[ex.id] = ex.restSeconds || 90;
    }
    return map;
  }, [libraryExercises]);

  // Clear rest timer when navigating between exercises
  useEffect(() => {
    setRestRemaining(0);
    setRestTotal(0);
    setRestDone(false);
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, []);

  const startRest = useCallback(
    (libraryExerciseId) => {
      const seconds = restTimeMap[libraryExerciseId] || 90;
      if (seconds <= 0) return;
      setRestRemaining(seconds);
      setRestTotal(seconds);
      setRestDone(false);
      if (restRef.current) clearInterval(restRef.current);
      restRef.current = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(restRef.current);
            restRef.current = null;
            playBeep();
            setRestDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [restTimeMap]
  );

  const dismissRest = useCallback(() => {
    setRestRemaining(0);
    setRestTotal(0);
    setRestDone(false);
    if (restRef.current) {
      clearInterval(restRef.current);
      restRef.current = null;
    }
  }, []);

  // ── No template or no templateId ──
  if (!templateId || !template) {
    return (
      <div className="space-y-6 pt-4 px-4 max-w-md mx-auto text-center py-12">
        <Icon
          name="fitness_center"
          className="text-5xl text-neutral-soft/30 mb-3"
        />
        <p className="text-sm text-neutral-soft">No workout selected</p>
        <p className="text-xs text-neutral-soft/60 mt-1">
          Pick a workout template from the Home page
        </p>
        <Link
          to="/"
          className="inline-block mt-4 text-primary font-bold text-sm"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="space-y-6 pt-4 px-4 max-w-md mx-auto text-center py-12">
        <Icon name="error" className="text-5xl text-neutral-soft/30 mb-3" />
        <p className="text-sm text-neutral-soft">
          This template has no exercises
        </p>
        <Link
          to={`/planner/${templateId}`}
          className="inline-block mt-4 text-primary font-bold text-sm"
        >
          Add exercises in Planner
        </Link>
      </div>
    );
  }

  const exercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;
  const hasAnyDone = exercise.sets.some((s) => s.done);
  const nextSetId = exercise.sets.find((s) => !s.done)?.id;

  // ── Set operations ──
  const adjustWeight = (setId, delta) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== currentIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId
              ? { ...s, actualWeight: Math.max(0, s.actualWeight + delta) }
              : s
          ),
        };
      })
    );
  };

  const adjustReps = (setId, delta) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== currentIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId
              ? { ...s, actualReps: Math.max(0, s.actualReps + delta) }
              : s
          ),
        };
      })
    );
  };

  const toggleDone = (setId) => {
    const currentSet = exercise.sets.find((s) => s.id === setId);
    const willBeDone = currentSet && !currentSet.done;

    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== currentIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, done: !s.done } : s
          ),
        };
      })
    );

    if (willBeDone) {
      startRest(exercise.libraryExerciseId);
    }
  };

  // ── Navigation ──
  const handleNext = () => {
    if (isLastExercise) {
      handleFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    dismissRest();

    const logExercises = exercises
      .map((ex) => ({
        name: ex.name,
        icon: ex.icon,
        sets: ex.sets
          .filter((s) => s.done)
          .map((s) => ({
            targetWeight: s.targetWeight,
            targetReps: s.targetReps,
            actualWeight: s.actualWeight,
            actualReps: s.actualReps,
          })),
      }))
      .filter((ex) => ex.sets.length > 0);

    addLog({
      templateId,
      templateName: template.name,
      templateIcon: template.icon,
      durationMs: Date.now() - startTime.current,
      exercises: logExercises,
    });

    // Auto-update template targets when actuals exceeded them
    const updatedExercises = template.exercises.map((tplEx, exIdx) => {
      const activeEx = exercises[exIdx];
      if (!activeEx) return tplEx;
      return {
        ...tplEx,
        sets: tplEx.sets.map((tplSet) => {
          const activeSet = activeEx.sets.find((s) => s.id === tplSet.id);
          if (!activeSet || !activeSet.done) return tplSet;
          return {
            ...tplSet,
            targetWeight:
              activeSet.actualWeight > tplSet.targetWeight
                ? activeSet.actualWeight
                : tplSet.targetWeight,
            targetReps:
              activeSet.actualReps > tplSet.targetReps
                ? activeSet.actualReps
                : tplSet.targetReps,
          };
        }),
      };
    });
    updateTemplate(templateId, { exercises: updatedExercises });

    navigate("/");
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Progress bar */}
      <ProgressBar
        value={currentIndex + 1}
        max={exercises.length}
        label="Workout progress"
        detail={`${currentIndex + 1}/${exercises.length} exercises`}
      />

      <div className="px-4 space-y-6 max-w-md mx-auto">
        {/* Workout title + elapsed timer */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">
              {template.name}
            </h2>
            <p className="text-xs text-neutral-soft">
              Exercise {currentIndex + 1} of {exercises.length}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-soft/10 px-3 py-1.5 rounded-lg">
            <Icon name="timer" className="text-neutral-soft text-sm" />
            <span className="text-sm font-bold text-neutral-soft tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* Rest countdown timer */}
        {restRemaining > 0 && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-[10px] uppercase tracking-widest text-neutral-soft font-bold mb-1">
              Rest Timer
            </p>
            <p className="text-4xl font-bold text-primary tabular-nums">
              {formatTime(restRemaining)}
            </p>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(restRemaining / restTotal) * 100}%` }}
              />
            </div>
            <button
              onClick={dismissRest}
              className="mt-3 text-xs text-neutral-soft hover:text-primary transition-colors"
            >
              Skip rest
            </button>
          </div>
        )}

        {/* Rest complete alert */}
        {restDone && restRemaining === 0 && (
          <button
            onClick={() => setRestDone(false)}
            className="w-full p-3 rounded-xl bg-primary/10 border border-primary/30 text-center animate-pulse"
          >
            <p className="text-sm font-bold text-primary">
              REST COMPLETE — Next set!
            </p>
          </button>
        )}

        {/* Current exercise card */}
        <Card>
          {/* Exercise header */}
          <div className="p-4 flex items-center gap-3 border-b border-white/5">
            <span className="text-xl">{exercise.icon}</span>
            <h3 className="text-lg font-bold">{exercise.name}</h3>
          </div>

          {/* Sets table */}
          <div className="p-4 space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-[40px_1fr_1fr_44px] gap-2 text-[10px] uppercase tracking-widest text-neutral-strong/40 font-bold px-1">
              <div className="text-center">Set</div>
              <div className="text-center">Weight (kg)</div>
              <div className="text-center">Reps</div>
              <div className="text-center">Done</div>
            </div>

            {/* Set rows */}
            {exercise.sets.map((set, index) => (
              <div
                key={set.id}
                className={`grid grid-cols-[40px_1fr_1fr_44px] gap-2 items-center rounded-lg p-2 transition-all ${
                  set.done
                    ? "bg-primary/10 border border-primary/20"
                    : set.id === nextSetId
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-white/5"
                }`}
              >
                {/* Set number */}
                <div
                  className={`text-center font-bold text-sm ${
                    set.done
                      ? "text-primary"
                      : set.id === nextSetId
                        ? "text-primary"
                        : "text-neutral-soft"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Weight with +/- */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustWeight(set.id, -2.5)}
                    disabled={set.done}
                    className="w-7 h-7 rounded flex items-center justify-center text-neutral-soft hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Icon name="remove" className="text-sm" />
                  </button>
                  <span
                    className={`flex-1 text-center font-bold text-sm ${
                      set.done
                        ? "text-neutral-strong/40 line-through"
                        : "text-neutral-strong"
                    }`}
                  >
                    {set.actualWeight}
                  </span>
                  <button
                    onClick={() => adjustWeight(set.id, 2.5)}
                    disabled={set.done}
                    className="w-7 h-7 rounded flex items-center justify-center text-neutral-soft hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Icon name="add" className="text-sm" />
                  </button>
                </div>

                {/* Reps with +/- */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustReps(set.id, -1)}
                    disabled={set.done}
                    className="w-7 h-7 rounded flex items-center justify-center text-neutral-soft hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Icon name="remove" className="text-sm" />
                  </button>
                  <span
                    className={`flex-1 text-center font-bold text-sm ${
                      set.done
                        ? "text-neutral-strong/40 line-through"
                        : "text-neutral-strong"
                    }`}
                  >
                    {set.actualReps}
                  </span>
                  <button
                    onClick={() => adjustReps(set.id, 1)}
                    disabled={set.done}
                    className="w-7 h-7 rounded flex items-center justify-center text-neutral-soft hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Icon name="add" className="text-sm" />
                  </button>
                </div>

                {/* Done checkmark */}
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleDone(set.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      set.done
                        ? "bg-primary text-bg-dark"
                        : "border-2 border-white/10 hover:border-primary/30"
                    }`}
                  >
                    {set.done && (
                      <Icon name="check" className="text-sm font-bold" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Target reference */}
            <p className="text-[10px] text-neutral-soft/50 text-center mt-2">
              Use +/- to adjust, then tap the checkmark when done
            </p>
          </div>
        </Card>

        {/* Navigation buttons */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            disabled={!hasAnyDone}
            className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              hasAnyDone
                ? "bg-primary text-bg-dark shadow-[0_0_20px_rgba(187,255,0,0.3)] hover:shadow-[0_0_30px_rgba(187,255,0,0.5)]"
                : "bg-neutral-soft/10 text-neutral-soft/40 cursor-not-allowed"
            }`}
          >
            <Icon
              name={isLastExercise ? "check_circle" : "arrow_forward"}
              className="font-bold"
            />
            {isLastExercise ? "FINISH WORKOUT" : "NEXT EXERCISE"}
          </button>

          {/* Skip / back navigation */}
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-neutral-soft/10 text-neutral-soft hover:bg-neutral-soft/20 transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="arrow_back" className="text-sm" />
                Previous
              </button>
            )}
            {!isLastExercise && (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-neutral-soft/10 text-neutral-soft hover:bg-neutral-soft/20 transition-colors flex items-center justify-center gap-2"
              >
                Skip
                <Icon name="skip_next" className="text-sm" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
