import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";
import { supabase } from "../lib/supabase";

const WorkoutContext = createContext(null);

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

export function WorkoutProvider({ children }) {
  const { currentUser } = useUser();
  const storageKey = `gym-app-${currentUser}-workout-templates`;

  const [templates, setTemplates] = useState(() => readFromStorage(storageKey));

  // Sync local state to localStorage
  useEffect(() => {
    writeToStorage(storageKey, templates);
  }, [templates, storageKey]);

  // Fetch from Supabase on mount, merge with local
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("workout_templates")
          .select("*")
          .eq("username", currentUser)
          .order("created_at", { ascending: true });
        if (!error && data && data.length > 0) {
          const remote = data.map((row) => ({
            id: row.id,
            name: row.name,
            icon: row.icon,
            exercises: row.exercises || [],
          }));
          // Merge: use remote as source of truth, but keep any local-only entries
          const remoteIds = new Set(remote.map((t) => t.id));
          const localOnly = readFromStorage(storageKey).filter(
            (t) => !remoteIds.has(t.id)
          );
          const merged = [...remote, ...localOnly];
          setTemplates(merged);
          writeToStorage(storageKey, merged);
          // Push any local-only items to Supabase
          for (const t of localOnly) {
            supabase
              .from("workout_templates")
              .upsert({
                id: t.id,
                username: currentUser,
                name: t.name,
                icon: t.icon,
                exercises: t.exercises,
              })
              .then(() => {});
          }
        }
      } catch {
        // offline — use local data
      }
    })();
  }, [currentUser, storageKey]);

  const addTemplate = useCallback(
    (template) => {
      const id = crypto.randomUUID();
      const newTemplate = { ...template, id, exercises: [] };
      setTemplates((prev) => [...prev, newTemplate]);
      // Fire-and-forget Supabase insert
      supabase
        .from("workout_templates")
        .insert({
          id,
          username: currentUser,
          name: template.name,
          icon: template.icon,
          exercises: [],
        })
        .then(() => {});
      return id;
    },
    [currentUser]
  );

  const updateTemplate = useCallback(
    (id, updates) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      // Fire-and-forget Supabase update
      const patch = {};
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.icon !== undefined) patch.icon = updates.icon;
      if (updates.exercises !== undefined) patch.exercises = updates.exercises;
      if (Object.keys(patch).length > 0) {
        supabase
          .from("workout_templates")
          .update(patch)
          .eq("id", id)
          .then(() => {});
      }
    },
    [currentUser]
  );

  const deleteTemplate = useCallback(
    (id) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      // Fire-and-forget Supabase delete
      supabase.from("workout_templates").delete().eq("id", id).then(() => {});
    },
    [currentUser]
  );

  const getTemplate = useCallback(
    (id) => templates.find((t) => t.id === id) || null,
    [templates]
  );

  const value = {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export function useWorkoutTemplates() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error(
      "useWorkoutTemplates must be used within a WorkoutProvider"
    );
  }
  return ctx;
}
