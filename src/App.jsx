import { HashRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { EquipmentProvider } from "./context/EquipmentContext";
import { ExerciseLibraryProvider } from "./context/ExerciseLibraryContext";
import { WorkoutProvider } from "./context/WorkoutContext";
import { WorkoutLogProvider } from "./context/WorkoutLogContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Equipment from "./pages/Equipment";
import Planner from "./pages/Planner";
import WorkoutEditor from "./pages/WorkoutEditor";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";

export default function App() {
  const { currentUser } = useUser();

  if (!currentUser) return <Login />;

  return (
    <EquipmentProvider key={currentUser}>
      <ExerciseLibraryProvider>
        <WorkoutProvider>
          <WorkoutLogProvider>
            <HashRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="equipment" element={<Equipment />} />
                  <Route path="planner" element={<Planner />} />
                  <Route path="planner/:id" element={<WorkoutEditor />} />
                  <Route path="workout/:templateId" element={<Workout />} />
                  <Route path="workout" element={<Workout />} />
                  <Route path="progress" element={<Progress />} />
                </Route>
              </Routes>
            </HashRouter>
          </WorkoutLogProvider>
        </WorkoutProvider>
      </ExerciseLibraryProvider>
    </EquipmentProvider>
  );
}
