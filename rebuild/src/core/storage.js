import { normalizeState, SAVE_VERSION } from "./state.js";

const SAVE_KEY = "infinity-works-save";
const BACKUP_KEY = "infinity-works-backup";

export function loadGame(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (!raw) return { state: null, recovered: false };
    return { state: normalizeState(JSON.parse(raw), now), recovered: false };
  } catch {
    try {
      const backup = storage?.getItem(BACKUP_KEY);
      if (backup) return { state: normalizeState(JSON.parse(backup), now), recovered: true };
    } catch { /* both save slots are unusable */ }
    return { state: null, recovered: false };
  }
}

export function saveGame(state, storage = globalThis.localStorage) {
  if (!storage) throw new Error("Local storage is unavailable.");
  const serialized = JSON.stringify({ ...state, schemaVersion: SAVE_VERSION });
  const current = storage.getItem(SAVE_KEY);
  if (current) { try { normalizeState(JSON.parse(current)); storage.setItem(BACKUP_KEY, current); } catch { /* do not overwrite a valid backup with corrupt data */ } }
  storage.setItem(SAVE_KEY, serialized);
}

export function exportBackup(state) {
  return JSON.stringify({ app: "infinity-works", schemaVersion: SAVE_VERSION, savedAt: new Date().toISOString(), state }, null, 2);
}

export function importBackup(text, now = Date.now()) {
  const data = JSON.parse(text);
  if (data.app !== "infinity-works" || ![1, SAVE_VERSION].includes(data.schemaVersion)) throw new Error("This backup is not compatible with this version.");
  return normalizeState(data.state, now);
}
