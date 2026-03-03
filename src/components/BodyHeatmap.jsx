import { MUSCLE_GROUPS } from "../context/ExerciseLibraryContext";

const NEUTRAL = "#333";

const DISPLAY_TO_GROUP = {
  "Chest": "Chest",
  "Front Delt": "Shoulders (Front Delt)",
  "Side Delt": "Shoulders (Side Delt)",
  "Rear Delt": "Shoulders (Rear Delt)",
  "Biceps": "Biceps",
  "Forearms": "Forearms",
  "Abs": "Abs",
  "Quads": "Quads",
  "Calves": "Calves",
  "Traps": "Back (Traps)",
  "Lats": "Back (Lats)",
  "Lower Back": "Back (Lower Back)",
  "Triceps": "Triceps",
  "Glutes": "Glutes",
  "Hamstrings": "Hamstrings",
};

const GROUP_TO_DISPLAY = Object.fromEntries(
  Object.entries(DISPLAY_TO_GROUP).map(([k, v]) => [v, k]),
);

const TIERS = [
  { min: 6.01, color: "#3b82f6", label: "6+" },
  { min: 4, color: "#22c55e", label: "4-6" },
  { min: 2, color: "#facc15", label: "2-3.5" },
  { min: 0, color: "#d1d5db", label: "0-1.5" },
];

function tierColor(pts) {
  if (pts > 6) return "#3b82f6";
  if (pts >= 4) return "#22c55e";
  if (pts >= 2) return "#facc15";
  return "#d1d5db";
}

function fmtPts(v) {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

export default function BodyHeatmap({ musclePoints = {} }) {
  function c(displayName) {
    const group = DISPLAY_TO_GROUP[displayName];
    return tierColor(musclePoints[group] || 0);
  }

  function tip(displayName) {
    const group = DISPLAY_TO_GROUP[displayName];
    const pts = musclePoints[group] || 0;
    return `${displayName}: ${fmtPts(pts)} Sets`;
  }

  return (
    <div>
      <div className="flex justify-center gap-6">
        {/* Front View */}
        <div className="text-center">
          <p className="text-xs text-neutral-soft mb-2 font-medium tracking-wider">FRONT</p>
          <svg viewBox="0 0 160 300" className="w-28">
            {/* Head & Neck */}
            <circle cx={80} cy={22} r={18} fill={NEUTRAL}><title>Head</title></circle>
            <rect x={73} y={40} width={14} height={14} rx={4} fill={NEUTRAL}><title>Neck</title></rect>

            {/* Front Delts */}
            <ellipse cx={50} cy={68} rx={12} ry={10} fill={c("Front Delt")}><title>{tip("Front Delt")}</title></ellipse>
            <ellipse cx={110} cy={68} rx={12} ry={10} fill={c("Front Delt")}><title>{tip("Front Delt")}</title></ellipse>

            {/* Side Delts */}
            <ellipse cx={37} cy={70} rx={7} ry={9} fill={c("Side Delt")}><title>{tip("Side Delt")}</title></ellipse>
            <ellipse cx={123} cy={70} rx={7} ry={9} fill={c("Side Delt")}><title>{tip("Side Delt")}</title></ellipse>

            {/* Chest */}
            <rect x={56} y={64} width={22} height={28} rx={4} fill={c("Chest")}><title>{tip("Chest")}</title></rect>
            <rect x={82} y={64} width={22} height={28} rx={4} fill={c("Chest")}><title>{tip("Chest")}</title></rect>

            {/* Biceps */}
            <rect x={30} y={82} width={14} height={38} rx={6} fill={c("Biceps")}><title>{tip("Biceps")}</title></rect>
            <rect x={116} y={82} width={14} height={38} rx={6} fill={c("Biceps")}><title>{tip("Biceps")}</title></rect>

            {/* Abs */}
            <rect x={62} y={96} width={36} height={50} rx={5} fill={c("Abs")}><title>{tip("Abs")}</title></rect>

            {/* Forearms */}
            <rect x={24} y={124} width={13} height={44} rx={5} fill={c("Forearms")}><title>{tip("Forearms")}</title></rect>
            <rect x={123} y={124} width={13} height={44} rx={5} fill={c("Forearms")}><title>{tip("Forearms")}</title></rect>

            {/* Hands */}
            <ellipse cx={29} cy={174} rx={6} ry={8} fill={NEUTRAL}><title>Hands</title></ellipse>
            <ellipse cx={131} cy={174} rx={6} ry={8} fill={NEUTRAL}><title>Hands</title></ellipse>

            {/* Quads */}
            <rect x={57} y={155} width={21} height={68} rx={8} fill={c("Quads")}><title>{tip("Quads")}</title></rect>
            <rect x={82} y={155} width={21} height={68} rx={8} fill={c("Quads")}><title>{tip("Quads")}</title></rect>

            {/* Calves */}
            <rect x={59} y={234} width={17} height={44} rx={7} fill={c("Calves")}><title>{tip("Calves")}</title></rect>
            <rect x={84} y={234} width={17} height={44} rx={7} fill={c("Calves")}><title>{tip("Calves")}</title></rect>

            {/* Feet */}
            <ellipse cx={67} cy={284} rx={10} ry={6} fill={NEUTRAL}><title>Feet</title></ellipse>
            <ellipse cx={93} cy={284} rx={10} ry={6} fill={NEUTRAL}><title>Feet</title></ellipse>
          </svg>
        </div>

        {/* Back View */}
        <div className="text-center">
          <p className="text-xs text-neutral-soft mb-2 font-medium tracking-wider">BACK</p>
          <svg viewBox="0 0 160 300" className="w-28">
            {/* Head & Neck */}
            <circle cx={80} cy={22} r={18} fill={NEUTRAL}><title>Head</title></circle>
            <rect x={73} y={40} width={14} height={14} rx={4} fill={NEUTRAL}><title>Neck</title></rect>

            {/* Traps */}
            <rect x={56} y={54} width={48} height={20} rx={6} fill={c("Traps")}><title>{tip("Traps")}</title></rect>

            {/* Rear Delts */}
            <ellipse cx={50} cy={68} rx={12} ry={10} fill={c("Rear Delt")}><title>{tip("Rear Delt")}</title></ellipse>
            <ellipse cx={110} cy={68} rx={12} ry={10} fill={c("Rear Delt")}><title>{tip("Rear Delt")}</title></ellipse>

            {/* Lats */}
            <rect x={52} y={76} width={20} height={38} rx={6} fill={c("Lats")}><title>{tip("Lats")}</title></rect>
            <rect x={88} y={76} width={20} height={38} rx={6} fill={c("Lats")}><title>{tip("Lats")}</title></rect>

            {/* Triceps */}
            <rect x={30} y={82} width={14} height={38} rx={6} fill={c("Triceps")}><title>{tip("Triceps")}</title></rect>
            <rect x={116} y={82} width={14} height={38} rx={6} fill={c("Triceps")}><title>{tip("Triceps")}</title></rect>

            {/* Lower Back */}
            <rect x={64} y={116} width={32} height={30} rx={5} fill={c("Lower Back")}><title>{tip("Lower Back")}</title></rect>

            {/* Forearms (neutral on back) */}
            <rect x={24} y={124} width={13} height={44} rx={5} fill={NEUTRAL}><title>Forearms</title></rect>
            <rect x={123} y={124} width={13} height={44} rx={5} fill={NEUTRAL}><title>Forearms</title></rect>

            {/* Hands */}
            <ellipse cx={29} cy={174} rx={6} ry={8} fill={NEUTRAL}><title>Hands</title></ellipse>
            <ellipse cx={131} cy={174} rx={6} ry={8} fill={NEUTRAL}><title>Hands</title></ellipse>

            {/* Glutes */}
            <rect x={57} y={148} width={21} height={26} rx={8} fill={c("Glutes")}><title>{tip("Glutes")}</title></rect>
            <rect x={82} y={148} width={21} height={26} rx={8} fill={c("Glutes")}><title>{tip("Glutes")}</title></rect>

            {/* Hamstrings */}
            <rect x={57} y={178} width={21} height={48} rx={8} fill={c("Hamstrings")}><title>{tip("Hamstrings")}</title></rect>
            <rect x={82} y={178} width={21} height={48} rx={8} fill={c("Hamstrings")}><title>{tip("Hamstrings")}</title></rect>

            {/* Calves */}
            <rect x={59} y={234} width={17} height={44} rx={7} fill={c("Calves")}><title>{tip("Calves")}</title></rect>
            <rect x={84} y={234} width={17} height={44} rx={7} fill={c("Calves")}><title>{tip("Calves")}</title></rect>

            {/* Feet */}
            <ellipse cx={67} cy={284} rx={10} ry={6} fill={NEUTRAL}><title>Feet</title></ellipse>
            <ellipse cx={93} cy={284} rx={10} ry={6} fill={NEUTRAL}><title>Feet</title></ellipse>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
        {[...TIERS].reverse().map((t) => (
          <div key={t.label} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ background: t.color }}
            />
            <span className="text-[10px] text-neutral-soft">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Muscle Points List */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
        {MUSCLE_GROUPS.map((group) => {
          const pts = musclePoints[group] || 0;
          const display = GROUP_TO_DISPLAY[group] || group;
          const color = tierColor(pts);
          return (
            <div key={group} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-neutral-med truncate">{display}</span>
              </div>
              <span className="font-bold text-neutral-strong ml-1">{fmtPts(pts)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
