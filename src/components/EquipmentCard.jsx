import Icon from "./Icon";

const EQUIPMENT_ICON_MAP = {
  barbell: "fitness_center",
  dumbbell: "exercise",
  cable: "settings_input_composite",
  "body weight": "accessibility_new",
  "smith machine": "precision_manufacturing",
  kettlebell: "whatshot",
  band: "lasso",
  "medicine ball": "sports_basketball",
  "stability ball": "circle",
  roller: "straighten",
  "ez barbell": "fitness_center",
  "trap bar": "fitness_center",
  rope: "lasso",
  "olympic barbell": "fitness_center",
  "leverage machine": "precision_manufacturing",
  assisted: "support",
  weighted: "monitor_weight",
  bosu_ball: "circle",
  "resistance band": "lasso",
  hammer: "hardware",
  "upper body ergometer": "cardio_load",
  "elliptical machine": "directions_run",
  "stationary bike": "pedal_bike",
  skierg_machine: "downhill_skiing",
  stepmill_machine: "stairs",
  tire: "circle",
  wheel_roller: "straighten",
  sled_machine: "fitness_center",
};

const DEFAULT_ICON = "sports_martial_arts";

function getEquipmentIcon(type) {
  return EQUIPMENT_ICON_MAP[type.toLowerCase()] || DEFAULT_ICON;
}

export default function EquipmentCard({ type, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(type)}
      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
        selected
          ? "bg-primary/15 border-2 border-primary shadow-lg shadow-primary/10"
          : "bg-neutral-soft/5 border border-neutral-soft/10 hover:border-primary/30"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
          selected ? "bg-primary/20" : "bg-primary/10"
        }`}
      >
        <Icon
          name={getEquipmentIcon(type)}
          className={`text-2xl ${selected ? "text-primary" : "text-primary/70"}`}
        />
      </div>

      <span
        className={`text-sm font-bold capitalize ${
          selected ? "text-primary" : "text-neutral-strong"
        }`}
      >
        {type}
      </span>

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Icon name="check" className="text-bg-dark text-xs font-bold" />
        </div>
      )}
    </button>
  );
}
