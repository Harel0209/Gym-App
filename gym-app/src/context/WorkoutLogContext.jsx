import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";
import { supabase } from "../lib/supabase";

const WorkoutLogContext = createContext(null);

// Convert Supabase row (snake_case) → local log shape (camelCase)
function fromSupabaseRow(row) {
  return {
    id: row.id,
    date: row.date,
    templateId: row.template_id,
    templateName: row.template_name,
    templateIcon: row.template_icon,
    durationMs: row.duration_ms,
    exercises: row.exercises || [],
  };
}

// Convert local log shape → Supabase row
function toSupabaseRow(log, profileId) {
  return {
    id: log.id,
    profile_id: profileId,
    date: log.date,
    template_id: log.templateId,
    template_name: log.templateName,
    template_icon: log.templateIcon,
    duration_ms: log.durationMs,
    exercises: log.exercises,
  };
}

export function WorkoutLogProvider({ children }) {
  const { profileId } = useUser();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logs from Supabase when profileId is available
  useEffect(() => {
    if (!profileId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("workout_logs")
          .select("*")
          .eq("profile_id", profileId)
          .order("date", { ascending: false });
        if (!cancelled && !error) {
          setLogs((data || []).map(fromSupabaseRow));
        }
      } catch {
        // network error — logs stay empty
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  const addLog = useCallback(
    async (logData) => {
      const log = {
        ...logData,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
      };
      // Optimistic local update
      setLogs((prev) => [log, ...prev]);
      // Persist to Supabase
      const { error } = await supabase
        .from("workout_logs")
        .insert(toSupabaseRow(log, profileId));
      if (error) {
        // Rollback on failure
        setLogs((prev) => prev.filter((l) => l.id !== log.id));
      }
    },
    [profileId]
  );

  const value = { logs, loading, addLog };

  return (
    <WorkoutLogContext.Provider value={value}>
      {children}
    </WorkoutLogContext.Provider>
  );
}

export function useWorkoutLog() {
  const ctx = useContext(WorkoutLogContext);
  if (!ctx) {
    throw new Error("useWorkoutLog must be used within a WorkoutLogProvider");
  }
  return ctx;
}
