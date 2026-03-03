import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useWorkoutTemplates } from "../context/WorkoutContext";
import { useWorkoutLog } from "../context/WorkoutLogContext";
import Icon from "../components/Icon";
import StatCard from "../components/StatCard";
import Card from "../components/Card";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function Home() {
  const { currentUser } = useUser();
  const { templates, loading: templatesLoading } = useWorkoutTemplates();
  const { logs, loading: logsLoading } = useWorkoutLog();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const recentLogs = logs.slice(0, 3);
  const totalSets = logs.reduce(
    (sum, log) =>
      sum + log.exercises.reduce((s, ex) => s + ex.sets.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Hero / Welcome */}
      <div className="px-6 pt-6">
        <p className="text-neutral-soft text-sm mb-1">{today}</p>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome, {currentUser}<span className="text-primary">!</span>
        </h2>
      </div>

      {/* Stats */}
      {logsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="px-4 grid grid-cols-2 gap-4">
          <StatCard
            icon="fitness_center"
            label="Total Workouts"
            value={logs.length}
            footnote={
              logs.length > 0
                ? `Last: ${timeAgo(logs[0].date)}`
                : "No workouts yet"
            }
            footnoteColor={logs.length > 0 ? "text-primary" : "text-neutral-soft"}
          />
          <StatCard
            icon="check_circle"
            label="Total Sets Done"
            value={totalSets}
            footnote={
              logs.length > 0
                ? `Across ${logs.length} session${logs.length !== 1 ? "s" : ""}`
                : "Start your first workout"
            }
          />
        </div>
      )}

      {/* Today's Workout — pick a template */}
      <div className="px-4">
        <h3 className="text-neutral-strong font-bold mb-4 px-1">
          Today&apos;s Workout
        </h3>

        {templatesLoading ? (
          <LoadingSpinner />
        ) : templates.length === 0 ? (
          <div className="text-center py-8 bg-neutral-soft/5 rounded-xl border border-neutral-soft/10">
            <Icon
              name="calendar_today"
              className="text-4xl text-neutral-soft/30 mb-2"
            />
            <p className="text-sm text-neutral-soft">No workout templates yet</p>
            <Link
              to="/planner"
              className="inline-block mt-3 text-primary font-bold text-sm"
            >
              Create one in Planner
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <Card key={t.id}>
                <div className="flex items-center gap-3 p-4">
                  <span className="text-3xl">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{t.name}</h4>
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
                  <Link
                    to={`/workout/${t.id}`}
                    className="px-5 py-2.5 rounded-xl bg-primary text-bg-dark font-bold text-sm shadow-[0_0_12px_rgba(187,255,0,0.2)] hover:shadow-[0_0_20px_rgba(187,255,0,0.4)] transition-all active:scale-95"
                  >
                    Start
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Workouts */}
      {recentLogs.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-neutral-strong font-bold mb-4 px-1">
            Recent Workouts
          </h3>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-neutral-soft/5 p-3 rounded-lg border border-neutral-soft/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                    {log.templateIcon}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{log.templateName}</p>
                    <p className="text-[10px] text-neutral-soft">
                      {timeAgo(log.date)}
                      {log.durationMs
                        ? ` \u00B7 ${formatDuration(log.durationMs)}`
                        : ""}
                      {" \u00B7 "}
                      {log.exercises.reduce(
                        (sum, ex) => sum + ex.sets.length,
                        0
                      )}{" "}
                      sets
                    </p>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-neutral-soft" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
