import { createContext, useContext } from "react";
import exerciseData from "../data/exercises.json";

export const MUSCLE_GROUPS = [
  "Chest",
  "Back (Lats)",
  "Back (Traps)",
  "Back (Lower Back)",
  "Shoulders (Front Delt)",
  "Shoulders (Side Delt)",
  "Shoulders (Rear Delt)",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Triceps",
  "Biceps",
  "Forearms",
  "Abs",
  "Calves",
];

const ExerciseLibraryContext = createContext(null);

export function ExerciseLibraryProvider({ children }) {
  const value = { exercises: exerciseData };

  return (
    <ExerciseLibraryContext.Provider value={value}>
      {children}
    </ExerciseLibraryContext.Provider>
  );
}

export function useExerciseLibrary() {
  const ctx = useContext(ExerciseLibraryContext);
  if (!ctx) {
    throw new Error(
      "useExerciseLibrary must be used within an ExerciseLibraryProvider"
    );
  }
  return ctx;
}
