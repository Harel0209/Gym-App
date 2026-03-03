import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkoutTemplates } from "../context/WorkoutContext";
import Card from "../components/Card";
import Icon from "../components/Icon";
import EmojiPicker from "../components/EmojiPicker";

export default function Planner() {
  const { templates, addTemplate, deleteTemplate } = useWorkoutTemplates();
  const navigate = useNavigate();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("\u{1F4AA}");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = addTemplate({ name: newName.trim(), icon: newIcon });
    setNewName("");
    setNewIcon("\u{1F4AA}");
    setShowCreateForm(false);
    navigate(`/planner/${id}`);
  };

  return (
    <div className="space-y-6 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          Workout Planner
        </h2>
        <p className="text-sm text-neutral-soft">
          {templates.length} template{templates.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {/* Create new workout form / button */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full py-4 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 text-primary/60 hover:text-primary hover:border-primary/50 transition-all hover:bg-primary/5"
        >
          <Icon name="add_circle" />
          <span className="font-semibold">Create New Workout</span>
        </button>
      ) : (
        <Card>
          <form onSubmit={handleCreate} className="p-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-neutral-soft mb-1 block tracking-wider">
                Workout Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Leg Day"
                className="w-full bg-white/10 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-strong placeholder:text-neutral-soft/50 border border-white/5 focus:border-primary/50 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <EmojiPicker selected={newIcon} onSelect={setNewIcon} />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-neutral-soft/10 text-neutral-soft hover:bg-neutral-soft/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-primary text-bg-dark disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(187,255,0,0.3)] transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Template list */}
      <div className="space-y-3 pb-6">
        {templates.map((t) => (
          <Card key={t.id}>
            <div className="flex items-center gap-3 p-4">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{t.name}</h3>
                <p className="text-[10px] text-neutral-soft">
                  {t.exercises.length} exercise
                  {t.exercises.length !== 1 ? "s" : ""}
                  {" \u00B7 "}
                  {t.exercises.reduce(
                    (sum, ex) => sum + ex.sets.length,
                    0
                  )}{" "}
                  sets
                </p>
              </div>
              <button
                onClick={() => navigate(`/planner/${t.id}`)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-soft hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Icon name="edit" className="text-lg" />
              </button>
              <button
                onClick={() => deleteTemplate(t.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-soft hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Icon name="delete" className="text-lg" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {templates.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <Icon
            name="calendar_today"
            className="text-5xl text-neutral-soft/30 mb-3"
          />
          <p className="text-sm text-neutral-soft">No workout templates yet</p>
          <p className="text-xs text-neutral-soft/60 mt-1">
            Tap &ldquo;Create New Workout&rdquo; to get started
          </p>
        </div>
      )}
    </div>
  );
}
