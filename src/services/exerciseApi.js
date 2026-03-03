const BASE_URL = "https://exercisedb.p.rapidapi.com";

const headers = {
  "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
};

async function apiFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) {
    throw new Error(`ExerciseDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Returns string[] of equipment type names */
export async function fetchEquipmentList() {
  return apiFetch("/exercises/equipmentList");
}

/** Returns all exercises. Pass limit=0 to bypass default pagination. */
export async function fetchAllExercises() {
  return apiFetch("/exercises?limit=0");
}

/** Returns exercises for a specific equipment type */
export async function fetchExercisesByEquipment(equipmentType) {
  return apiFetch(
    `/exercises/equipment/${encodeURIComponent(equipmentType)}?limit=0`
  );
}
