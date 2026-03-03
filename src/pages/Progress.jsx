import { useMemo } from "react";
import { useWorkoutLog } from "../context/WorkoutLogContext";
import { useExerciseLibrary, MUSCLE_GROUPS } from "../context/ExerciseLibraryContext";
import Card from "../components/Card";
import Icon from "../components/Icon";
import BodyHeatmap from "../components/BodyHeatmap";

export default function Progress() {
  const { logs, loading } = useWorkoutLog();
  const { exercises } = useExerciseLibrary();

  // 1. Map exercise names → primary/secondary muscles
  const exerciseMuscleMap = useMemo(() => {
    const map = {};
    for (const ex of exercises) {
      map[ex.name] = {
        primary: ex.primaryMuscles || [],
        secondary: ex.secondaryMuscles || [],
      };
    }
    return map;
  }, [exercises]);

  // 2. Filter logs to current week (Sunday-to-Sunday cycle)
  const weeklyLogs = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const cutoff = startOfWeek.getTime();
    return logs.filter((log) => new Date(log.date).getTime() >= cutoff);
  }, [logs]);

  // 3. HIT muscle points (1pt per set primary, 0.5pt per set secondary)
  const musclePoints = useMemo(() => {
    const pts = {};
    for (const log of weeklyLogs) {
      for (const ex of log.exercises || []) {
        const mapping = exerciseMuscleMap[ex.name];
        if (!mapping) continue;
        const setCount = (ex.sets || []).length;
        for (const m of mapping.primary) {
          pts[m] = (pts[m] || 0) + setCount;
        }
        for (const m of mapping.secondary) {
          pts[m] = (pts[m] || 0) + setCount * 0.5;
        }
      }
    }
    return pts;
  }, [weeklyLogs, exerciseMuscleMap]);

  // 4. Count working sets per muscle (primary only)
  const muscleSets = useMemo(() => {
    const counts = {};
    for (const log of weeklyLogs) {
      for (const ex of log.exercises || []) {
        const mapping = exerciseMuscleMap[ex.name];
        if (!mapping) continue;
        const setCount = (ex.sets || []).length;
        for (const m of mapping.primary) {
          counts[m] = (counts[m] || 0) + setCount;
        }
      }
    }
    return counts;
  }, [weeklyLogs, exerciseMuscleMap]);

  // 5. Strength increases (compare max weight: latest session vs previous)
  const strengthIncreases = useMemo(() => {
    const byExercise = {};
    for (const log of logs) {
      for (const ex of log.exercises || []) {
        if (!byExercise[ex.name]) byExercise[ex.name] = [];
        const maxW = Math.max(...(ex.sets || []).map((s) => s.actualWeight || 0), 0);
        byExercise[ex.name].push({ date: log.date, maxWeight: maxW });
      }
    }
    const results = [];
    for (const [name, sessions] of Object.entries(byExercise)) {
      if (sessions.length < 2) continue;
      // logs are stored most-recent-first, so sessions[0] is latest
      const latest = sessions[0].maxWeight;
      const previous = sessions[1].maxWeight;
      if (latest > previous && previous > 0) {
        const pct = (((latest - previous) / previous) * 100).toFixed(1);
        results.push({ name, oldWeight: previous, newWeight: latest, pct });
      }
    }
    return results;
  }, [logs]);

  // 6. Weak point analysis
  const weakPoints = useMemo(() => {
    const lastTrained = {};
    for (const log of logs) {
      for (const ex of log.exercises || []) {
        const mapping = exerciseMuscleMap[ex.name];
        if (!mapping) continue;
        for (const m of mapping.primary) {
          const d = new Date(log.date).getTime();
          if (!lastTrained[m] || d > lastTrained[m]) lastTrained[m] = d;
        }
      }
    }

    const maxPts = Math.max(...Object.values(musclePoints), 1);
    const threshold = maxPts * 0.15;
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
    const flags = [];

    for (const muscle of MUSCLE_GROUPS) {
      const last = lastTrained[muscle];
      const pts = musclePoints[muscle] || 0;

      if (!last) {
        if (logs.length > 0) flags.push({ muscle, reason: "Never trained" });
      } else if (last < tenDaysAgo) {
        const days = Math.round((Date.now() - last) / (24 * 60 * 60 * 1000));
        flags.push({ muscle, reason: `Not trained in ${days} days` });
      } else if (pts > 0 && pts < threshold) {
        flags.push({ muscle, reason: "Volume below 15% of strongest muscle" });
      }
    }
    return flags;
  }, [logs, exerciseMuscleMap, musclePoints]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pt-4 pb-6">
      {/* Section 1: Muscle Heatmap */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-neutral-strong mb-4">Muscle Heatmap</h2>
        <p className="text-xs text-neutral-soft mb-4">Weekly HIT sets per muscle</p>
        <BodyHeatmap musclePoints={musclePoints} />
      </Card>

      {/* Section 2: Weekly Working Sets */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-neutral-strong mb-4">Weekly Working Sets</h2>
        <div className="grid grid-cols-3 gap-2">
          {MUSCLE_GROUPS.map((muscle) => {
            const count = muscleSets[muscle] || 0;
            const short = muscle
              .replace("Shoulders (", "")
              .replace("Back (", "")
              .replace(")", "");
            return (
              <div
                key={muscle}
                className="bg-neutral-soft/5 border border-neutral-soft/10 rounded-lg p-2 text-center"
              >
                <p className="text-lg font-bold text-neutral-strong">{count}</p>
                <p className="text-[10px] text-neutral-soft truncate">{short}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 3: Strength Increases */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-neutral-strong mb-4">Strength Increases</h2>
        {strengthIncreases.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="trending_up" className="text-3xl text-neutral-soft/30 mb-2" />
            <p className="text-sm text-neutral-soft">
              No strength increases yet. Keep training!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {strengthIncreases.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between bg-neutral-soft/5 border border-neutral-soft/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="fitness_center" className="text-primary text-sm" />
                  </div>
                  <p className="text-sm font-bold text-neutral-strong">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-strong">
                    {item.oldWeight}
                    <span className="text-neutral-soft mx-1">&rarr;</span>
                    {item.newWeight}
                    <span className="text-neutral-soft text-xs ml-1">kg</span>
                  </p>
                  <p className="text-xs text-primary font-bold">+{item.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section 4: Weak Point Analysis */}
      <Card className="p-5">
        <h2 className="text-lg font-bold text-neutral-strong mb-4">Weak Point Analysis</h2>
        {weakPoints.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="check_circle" className="text-3xl text-primary/40 mb-2" />
            <p className="text-sm text-neutral-soft">
              {logs.length === 0
                ? "Complete a workout to see analysis"
                : "All muscle groups are well-trained!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {weakPoints.map((wp) => (
              <div
                key={wp.muscle}
                className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3"
              >
                <Icon name="warning" className="text-amber-400 text-lg shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-400">{wp.muscle}</p>
                  <p className="text-xs text-neutral-soft">{wp.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
