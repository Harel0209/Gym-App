import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const UserContext = createContext(null);
const CURRENT_USER_KEY = "gym-app-current-user";
const PROFILE_ID_KEY = "gym-app-profile-id";

function readCurrentUser() {
  try {
    return localStorage.getItem(CURRENT_USER_KEY) || null;
  } catch {
    return null;
  }
}

function readProfileId() {
  try {
    return localStorage.getItem(PROFILE_ID_KEY) || null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(readCurrentUser);
  const [profileId, setProfileId] = useState(readProfileId);
  const [loading, setLoading] = useState(false);

  // On mount, if we have a cached username but no profileId, resolve it
  useEffect(() => {
    if (currentUser && !profileId) {
      (async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", currentUser)
            .single();
          if (data) {
            setProfileId(data.id);
            localStorage.setItem(PROFILE_ID_KEY, data.id);
          }
        } catch {
          // offline — will resolve on next fetch
        }
      })();
    }
  }, [currentUser, profileId]);

  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setProfiles(data);
      }
    } catch {
      // offline
    }
  }, []);

  const createProfile = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "empty";

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({ username: trimmed })
        .select("id, username")
        .single();

      if (error) {
        setLoading(false);
        if (error.code === "23505") return "duplicate";
        return "error";
      }

      setProfiles((prev) => [...prev, data]);
      setCurrentUser(data.username);
      setProfileId(data.id);
      localStorage.setItem(CURRENT_USER_KEY, data.username);
      localStorage.setItem(PROFILE_ID_KEY, data.id);
      setLoading(false);
      return "ok";
    } catch {
      setLoading(false);
      return "error";
    }
  }, []);

  const selectProfile = useCallback((profile) => {
    setCurrentUser(profile.username);
    setProfileId(profile.id);
    localStorage.setItem(CURRENT_USER_KEY, profile.username);
    localStorage.setItem(PROFILE_ID_KEY, profile.id);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setProfileId(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(PROFILE_ID_KEY);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        profileId,
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
