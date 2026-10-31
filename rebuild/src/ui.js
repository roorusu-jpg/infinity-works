import { format } from "./core/decimal.js";
import { getEquipmentCost, getProduction, getUpgradeCost } from "./core/engine.js";
import { compare } from "./core/decimal.js";
import { EQUIPMENT } from "./core/economy.js";

const $ = id => document.getElementById(id);
export function render(state) {
  $("aether").textContent = format(state.currencies.aether);
  $("per-second").textContent = `${format(getProduction(state))} AE/s`;
  $("click-value").textContent = "1";
  $("total-earned").textContent = format(state.totalEarned);
  $("click-count").textContent = state.clicks.toLocaleString("ja-JP");
  $("play-time").textContent = formatDuration(state.totalPlaySeconds);
  $("equipment-list").innerHTML = EQUIPMENT.filter(def => state.equipment[def.id].unlocked).map(def => {
    const item = state.equipment[def.id], cost = getEquipmentCost(state, def.id), upgrade = getUpgradeCost(state, def.id);
    const nextTier = Math.floor(item.upgradeLevel / 10) + 1;
    return `<article class="equipment-card">
      <div class="equipment-icon">${def.icon}</div><div class="equipment-info">
      <span class="eyebrow">EQUIPMENT ${String(EQUIPMENT.indexOf(def)+1).padStart(3,"0")}</span><h2>${def.name}</h2><p>${def.description}</p>
      <div class="equipment-stats"><span>所有数 <b>${item.owned.toLocaleString("ja-JP")}</b></span><span>生産 <b>${format(def.baseProduction)} AE/s</b></span><span>強化 <b>Lv.${item.upgradeLevel} / Tier ${nextTier}</b></span></div></div>
      <div class="equipment-buy"><strong>${format(cost)} AE</strong><div class="buy-quantities"><button data-buy="${def.id}" data-quantity="1" ${compare(state.currencies.aether,cost)<0?"disabled":""}>×1</button><button data-buy="${def.id}" data-quantity="10">×10</button><button data-buy="${def.id}" data-quantity="100">×100</button></div>
      <small>強化 ${format(upgrade)} AE</small><button data-upgrade="${def.id}" ${item.owned < 1 || compare(state.currencies.aether,upgrade)<0 ? "disabled" : ""}>強化する</button></div></article>`;
  }).join("");
  $("equipment-list").querySelectorAll("[data-upgrade]").forEach(button => button.disabled = state.equipment[button.dataset.upgrade].owned < 1);
}
export function setSaveStatus(message) { $("save-status").textContent = message; }
export function setupTabs() {
  document.querySelectorAll(".tab:not(:disabled)").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `view-${button.dataset.tab}`));
  }));
}
function formatDuration(seconds) {
  const total = Math.floor(seconds); if (total < 60) return `${total}秒`;
  const hours = Math.floor(total / 3600), minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}時間${minutes}分` : `${minutes}分`;
}
