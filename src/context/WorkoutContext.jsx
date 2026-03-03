import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";
import { supabase } from "../lib/supabase";

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const { profileId } = useUser();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch templates from Supabase when profileId is available
  useEffect(() => {
    if (!profileId) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("workout_templates")
          .select("*")
          .eq("profile_id", profileId)
          .order("created_at", { ascending: true });
        if (!cancelled && !error) {
          setTemplates(
            (data || []).map((row) => ({
              id: row.id,
              name: row.name,
              icon: row.icon,
              exercises: row.exercises || [],
            }))
          );
        }
      } catch {
        // network error — templates stay empty
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  const addTemplate = useCallback(
    async (template) => {
      const id = crypto.randomUUID();
      const newTemplate = { ...template, id, exercises: [] };
      // Optimistic local update
      setTemplates((prev) => [...prev, newTemplate]);
      // Persist to Supabase
      const { error } = await supabase.from("workout_templates").insert({
        id,
        profile_id: profileId,
        name: template.name,
        icon: template.icon,
        exercises: [],
      });
      if (error) {
        // Rollback on failure
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
      return id;
    },
    [profileId]
  );

  const updateTemplate = useCallback(
    async (id, updates) => {
      // Optimistic local update
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      // Persist to Supabase
      const patch = {};
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.icon !== undefined) patch.icon = updates.icon;
      if (updates.exercises !== undefined) patch.exercises = updates.exercises;
      if (Object.keys(patch).length > 0) {
        await supabase.from("workout_templates").update(patch).eq("id", id);
      }
    },
    [profileId]
  );

  const deleteTemplate = useCallback(
    async (id) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      await supabase.from("workout_templates").delete().eq("id", id);
    },
    [profileId]
  );

  const getTemplate = useCallback(
    (id) => templates.find((t) => t.id === id) || null,
    [templates]
  );

  const value = {
    templates,
    loading,
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
