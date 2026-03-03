import { useEquipment } from "../context/EquipmentContext";
import EquipmentCard from "../components/EquipmentCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import Icon from "../components/Icon";

export default function Equipment() {
  const {
    equipmentTypes,
    selectedEquipment,
    toggleEquipment,
    selectAll,
    deselectAll,
    filteredExercises,
    loading,
    error,
  } = useEquipment();

  if (loading) {
    return <LoadingSpinner message="Loading equipment..." />;
  }

  if (error) {
    return (
      <div className="pt-10">
        <ErrorBanner
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const selectedCount = selectedEquipment.length;
  const totalCount = equipmentTypes.length;

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="px-6">
        <h2 className="text-2xl font-bold tracking-tight mb-1">Equipment</h2>
        <p className="text-sm text-neutral-soft">
          Select the equipment you have access to
        </p>
      </div>

      {/* Selection summary + bulk actions */}
      <div className="px-4 flex items-center justify-between">
        <span className="text-xs font-bold text-primary">
          {selectedCount} of {totalCount} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs font-medium text-neutral-soft hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="text-xs font-medium text-neutral-soft hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Equipment grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {equipmentTypes.map((type) => (
          <EquipmentCard
            key={type}
            type={type}
            selected={selectedEquipment.includes(type)}
            onToggle={toggleEquipment}
          />
        ))}
      </div>

      {/* Exercises count footer */}
      {selectedCount > 0 && (
        <div className="px-4 pb-6">
          <div className="bg-neutral-soft/5 border border-neutral-soft/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="format_list_numbered" className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-strong">
                {filteredExercises.length} exercises available
              </p>
              <p className="text-[10px] text-neutral-soft">
                Based on your {selectedCount} selected equipment type
                {selectedCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
