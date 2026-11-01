undefined
import { purchaseSkill, getSkillPoints, getClickGain } from "../src/core/engine.js";
test("skill points are earned from lifetime ether and skill effects apply", () => {
  let s=freshGame(0); s={...s,totalEarned:from(3000)};
  assert.equal(getSkillPoints(s),3);
  s=purchaseSkill(s,"keenHands"); assert.ok(s.skills.includes("keenHands")); assert.equal(compare(getClickGain(s),2),0);
  s=purchaseSkill(s,"steadyFlow"); assert.ok(s.skills.includes("steadyFlow")); assert.equal(getSkillPoints(s),1);
});
test("skill prerequisites and point balance are enforced", () => {
  let s=freshGame(0); s={...s,totalEarned:from(1000)};
  assert.equal(purchaseSkill(s,"steadyFlow"),s);
  s=purchaseSkill(s,"keenHands"); assert.equal(getSkillPoints(s),0);
  assert.equal(purchaseSkill(s,"steadyFlow"),s);
});
