import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";
import { supabase } from "../lib/supabase";

const WorkoutLogContext = createContext(null);

function readFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

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
function toSupabaseRow(log, username) {
  return {
    id: log.id,
    username,
    date: log.date,
    template_id: log.templateId,
    template_name: log.templateName,
    template_icon: log.templateIcon,
    duration_ms: log.durationMs,
    exercises: log.exercises,
  };
}

export function WorkoutLogProvider({ children }) {
  const { currentUser } = useUser();
  const storageKey = `gym-app-${currentUser}-workout-log`;

  const [logs, setLogs] = useState(() => readFromStorage(storageKey));

  // Sync to localStorage
  useEffect(() => {
    writeToStorage(storageKey, logs);
  }, [logs, storageKey]);

  // Fetch from Supabase on mount, merge
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("workout_logs")
          .select("*")
          .eq("username", currentUser)
          .order("date", { ascending: false });
        if (!error && data && data.length > 0) {
          const remote = data.map(fromSupabaseRow);
          const remoteIds = new Set(remote.map((l) => l.id));
          const localOnly = readFromStorage(storageKey).filter(
            (l) => !remoteIds.has(l.id)
          );
          const merged = [...localOnly, ...remote].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setLogs(merged);
          writeToStorage(storageKey, merged);
          // Push local-only logs to Supabase
          for (const l of localOnly) {
            supabase
              .from("workout_logs")
              .upsert(toSupabaseRow(l, currentUser))
              .then(() => {});
          }
        }
      } catch {
        // offline — use local
      }
    })();
  }, [currentUser, storageKey]);

  const addLog = useCallback(
    (logData) => {
      const log = {
        ...logData,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
      };
      setLogs((prev) => [log, ...prev]);
      // Fire-and-forget Supabase insert
      supabase
        .from("workout_logs")
        .insert(toSupabaseRow(log, currentUser))
        .then(() => {});
    },
    [currentUser]
  );

  const value = { logs, addLog };

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
