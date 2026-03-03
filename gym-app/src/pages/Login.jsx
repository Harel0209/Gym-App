import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Icon from "../components/Icon";

export default function Login() {
  const { profiles, createProfile, selectProfile, fetchProfiles, loading } =
    useUser();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("create");

  // Fetch profiles from Supabase on mount
  useEffect(() => {
    fetchProfiles().then(() => {});
  }, [fetchProfiles]);

  // Switch to select mode once profiles are loaded
  useEffect(() => {
    if (profiles.length > 0 && mode === "create" && !name) {
      setMode("select");
    }
  }, [profiles.length]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    const result = await createProfile(name);
    if (result === "duplicate") setError("Profile already exists");
    else if (result === "empty") setError("Enter a name");
    else if (result === "error") setError("Something went wrong. Try again.");
  }

  return (
    <div className="min-h-screen bg-bg-dark text-neutral-strong font-display flex flex-col items-center justify-center px-6">
      {/* Branding */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon name="fitness_center" className="text-primary text-3xl" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gym<span className="text-primary">App</span>
        </h1>
        <p className="text-sm text-neutral-soft mt-1">Track your gains</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-dark rounded-2xl border border-white/5 shadow-xl p-6">
        {/* Tab toggle */}
        {profiles.length > 0 && (
          <div className="flex bg-neutral-soft/10 p-1 rounded-lg mb-6">
            <button
              onClick={() => {
                setMode("select");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                mode === "select"
                  ? "bg-bg-dark text-primary shadow-sm"
                  : "text-neutral-soft"
              }`}
            >
              Select Profile
            </button>
            <button
              onClick={() => {
                setMode("create");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                mode === "create"
                  ? "bg-bg-dark text-primary shadow-sm"
                  : "text-neutral-soft"
              }`}
            >
              Create New
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate}>
            <label className="block text-xs text-neutral-soft font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              className="w-full bg-neutral-soft/5 border border-neutral-soft/20 rounded-lg px-4 py-3 text-sm text-neutral-strong placeholder:text-neutral-soft/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-primary text-bg-dark font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Profile"}
            </button>
          </form>
        )}

        {mode === "select" && (
          <div className="space-y-2">
            {profiles.map((p) => (
              <button
                key={p}
                onClick={() => selectProfile(p)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-soft/5 border border-neutral-soft/10 hover:border-primary/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {p[0].toUpperCase()}
                </div>
                <span className="font-bold text-sm">{p}</span>
                <Icon
                  name="chevron_right"
                  className="text-neutral-soft ml-auto"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
