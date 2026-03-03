import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchEquipmentList, fetchAllExercises } from "../services/exerciseApi";
import { useUser } from "./UserContext";

const EquipmentContext = createContext(null);

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

export function EquipmentProvider({ children }) {
  const { currentUser } = useUser();
  const storageKey = `gym-app-${currentUser}-selected-equipment`;

  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEquipment, setSelectedEquipment] = useState(() => readFromStorage(storageKey));

  // Persist to localStorage on every change
  useEffect(() => {
    writeToStorage(storageKey, selectedEquipment);
  }, [selectedEquipment, storageKey]);

  // Fetch equipment types + all exercises on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [types, exercises] = await Promise.all([
          fetchEquipmentList(),
          fetchAllExercises(),
        ]);
        if (!cancelled) {
          setEquipmentTypes(types);
          setAllExercises(exercises);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleEquipment = useCallback((type) => {
    setSelectedEquipment((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedEquipment([...equipmentTypes]);
  }, [equipmentTypes]);

  const deselectAll = useCallback(() => {
    setSelectedEquipment([]);
  }, []);

  // Derived: exercises filtered by user's selected equipment
  const filteredExercises = allExercises.filter((ex) =>
    selectedEquipment.includes(ex.equipment)
  );

  const value = {
    equipmentTypes,
    allExercises,
    loading,
    error,
    selectedEquipment,
    toggleEquipment,
    selectAll,
    deselectAll,
    filteredExercises,
  };

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const ctx = useContext(EquipmentContext);
  if (!ctx) {
    throw new Error("useEquipment must be used within an EquipmentProvider");
  }
  return ctx;
}
