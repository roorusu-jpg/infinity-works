import { advance, collect, freshGame, purchaseEquipment, purchaseResearch, purchaseUpgrade } from "./core/engine.js";
import { loadGame, saveGame } from "./core/storage.js";
import { render, setSaveStatus, setupTabs } from "./ui.js";

const loaded = loadGame(); let state = loaded.state || freshGame(); const now = Date.now();
if (loaded.state) state = advance(state, now, { offline: true });
let lastSavedAt = 0;
function persist() { try { saveGame(state); lastSavedAt = Date.now(); setSaveStatus("保存済み"); } catch { setSaveStatus("保存できません"); } }
function update() { state = advance(state, Date.now()); render(state); }
document.getElementById("collect-button").addEventListener("click", () => { state = collect(state); render(state); persist(); });
document.getElementById("equipment-list").addEventListener("click", event => {
  const buyButton = event.target.closest("[data-buy]"), upgradeButton = event.target.closest("[data-upgrade]"), researchButton = event.target.closest("[data-research]");
  if (buyButton) state = purchaseEquipment(state, buyButton.dataset.buy, Number(buyButton.dataset.quantity));
  if (upgradeButton) state = purchaseUpgrade(state, upgradeButton.dataset.upgrade);
  if (researchButton) state = purchaseResearch(state, researchButton.dataset.research);
  render(state); persist();
});
setupTabs(); render(state); persist();
if (loaded.recovered) setSaveStatus("バックアップから復旧");
if (loaded.state) setSaveStatus("セーブデータを読み込みました");
setInterval(update, 250);
setInterval(() => { if (Date.now() - lastSavedAt >= 5000) persist(); }, 5000);
window.addEventListener("pagehide", persist);
