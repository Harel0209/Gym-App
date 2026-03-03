import { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const UserContext = createContext(null);
const CURRENT_USER_KEY = "gym-app-current-user";

function readCurrentUser() {
  try {
    return localStorage.getItem(CURRENT_USER_KEY) || null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(readCurrentUser);
  const [loading, setLoading] = useState(false);

  // Fetch profiles from Supabase (called on mount from Login)
  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setProfiles(data.map((row) => row.username));
      }
    } catch {
      // offline — profiles list stays empty until online
    }
  }, []);

  const createProfile = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "empty";

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .insert({ username: trimmed });

      if (error) {
        setLoading(false);
        if (error.code === "23505") return "duplicate";
        return "error";
      }

      setProfiles((prev) => [...prev, trimmed]);
      setCurrentUser(trimmed);
      localStorage.setItem(CURRENT_USER_KEY, trimmed);
      setLoading(false);
      return "ok";
    } catch {
      setLoading(false);
      return "error";
    }
  }, []);

  const selectProfile = useCallback((name) => {
    setCurrentUser(name);
    localStorage.setItem(CURRENT_USER_KEY, name);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        profiles,
        loading,
        createProfile,
        selectProfile,
        logout,
        fetchProfiles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
