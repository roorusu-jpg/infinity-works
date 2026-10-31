import { format } from "./core/decimal.js";
import { canBuyAutoClicker, getProduction } from "./core/engine.js";
import { equipmentCost } from "./core/economy.js";

const $ = (id) => document.getElementById(id);

export function render(state) {
  $("aether").textContent = format(state.currencies.aether);
  $("per-second").textContent = `${format(getProduction(state))} AE/s`;
  $("click-value").textContent = "1";
  $("total-earned").textContent = format(state.totalEarned);
  $("click-count").textContent = state.clicks.toLocaleString("ja-JP");
  $("owned").textContent = state.equipment.autoClicker.owned.toLocaleString("ja-JP");
  $("equipment-cost").textContent = `${format(equipmentCost(state.equipment.autoClicker.owned))} AE`;
  $("buy-equipment").disabled = !canBuyAutoClicker(state);
  $("play-time").textContent = formatDuration(state.totalPlaySeconds);
}

export function setSaveStatus(message) {
  $("save-status").textContent = message;
}

export function setupTabs() {
  document.querySelectorAll(".tab:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${button.dataset.tab}`));
    });
  });
}

function formatDuration(seconds) {
  const total = Math.floor(seconds);
  if (total < 60) return `${total}秒`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}時間${minutes}分` : `${minutes}分`;
}
