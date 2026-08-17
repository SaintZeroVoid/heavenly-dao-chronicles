/**
 * Heavenly Dao — Simulation Web Worker
 * Runs pure tick math off the main thread.
 * Main thread still applies results (UI, generateCharacter, news).
 */
const STARS = ["1-Star","2-Star","3-Star","4-Star","5-Star","6-Star","7-Star","8-Star","9-Star"];
const RANKS = ["Dou Zhe","Dou Shi","Da Dou Shi","Dou Ling","Dou Wang","Dou Huang","Dou Zong","Dou Zun","Half-Saint","Dou Saint","Dou Di"];

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function tickOnce(payload) {
  const {
    living,
    wealth,
    year,
    month,
    threat,
    speed,
    traits,
    successionId,
    ironman
  } = payload;

  let y = year;
  let m = month + 1;
  if (m > 12) { m = 1; y += 1; }

  const log = [];
  const deaths = [];
  const births = []; // parentId requests for main thread to spawn
  const events = [];
  let gold = wealth.gold || 0;
  let herbs = wealth.herbs || 0;
  let cores = wealth.cores || 0;
  let renown = wealth.renown || 1;
  let nextThreat = threat || 1;

  const nextLiving = living.map(char => ({ ...char }));

  nextLiving.forEach(char => {
    if (m === 1) char.age = (char.age || 16) + 1;

    let renownBoost = 1 + Math.min(0.5, renown * 0.03);
    if ((traits || []).includes("Genius Blood")) renownBoost *= 1.1;
    if ((traits || []).includes("Flame Affinity") && char.attribute === "Fire") renownBoost *= 1.08;
    let gain = Math.floor(randInt(20, 90) * (speed || 1) * renownBoost);
    if (successionId && successionId === char.id) gain = Math.floor(gain * 1.15);
    char.douQi = (char.douQi || 100) + gain;
    char.experience = Math.min(100, (char.experience || 20) + randInt(0, 2));
    if (Math.random() > 0.92) char.foundation = Math.min(100, (char.foundation || 40) + 1);

    // breakthrough
    if (Math.random() > 0.97) {
      const idx = RANKS.indexOf(char.realm);
      const starIdx = STARS.indexOf(char.star);
      if (Math.random() > 0.5 && starIdx >= 0 && starIdx < STARS.length - 1) {
        char.star = STARS[starIdx + 1];
        log.push(char.name + " advanced to " + char.star + " " + char.realm);
      } else if (idx >= 0 && idx < RANKS.length - 1 && (char.foundation || 0) > 35 && Math.random() > 0.6) {
        char.realm = RANKS[idx + 1];
        char.star = "1-Star";
        log.push(char.name + " broke through to " + char.realm + "!");
      }
    }

    // death
    let deathChance = 0.0012 + Math.max(0, (char.age || 20) - 90) * 0.008;
    deathChance += (nextThreat || 1) * 0.0008;
    if (char.injured) deathChance += char.injured * 0.01;
    if ((traits || []).includes("Short-Lived")) deathChance += 0.01;
    if ((traits || []).includes("Iron Constitution")) deathChance *= 0.7;
    if (Math.random() < deathChance) {
      const reasons = ["killed in a resource struggle", "failed tribulation", "ambushed while traveling", "old wounds claimed their life", "perished guarding the clan"];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      deaths.push({ id: char.id, name: char.name, reason, generation: char.generation || 1, year: y });
      gold += randInt(5, 25);
      log.push(char.name + " died: " + reason);
      char._dead = true;
    }

    // birth request
    if (!char._dead && (char.age || 0) >= 20 && (char.age || 0) <= 70) {
      let birthNeed = 0.978;
      if (char.spouse) birthNeed -= 0.025;
      if (char.marriageBonus) birthNeed -= char.marriageBonus;
      if (renown > 5) birthNeed -= 0.01;
      if (Math.random() > birthNeed) {
        births.push({ parentId: char.id, parentName: char.name, parentTalent: char.talent, parentBloodline: char.bloodline, parentGeneration: char.generation || 1, boundFlame: char.boundFlame });
      }
    }

    if (char.injured && Math.random() > 0.7) char.injured = Math.max(0, char.injured - 1);
  });

  const survivors = nextLiving.filter(c => !c._dead).map(c => {
    const { _dead, ...rest } = c;
    return rest;
  });

  // yearly trade
  if (m === 1) {
    const gainG = randInt(1, 8) + Math.floor(survivors.length * 1.5) + Math.floor(renown / 2);
    gold += gainG;
    if (Math.random() > 0.7) herbs += randInt(0, 2);
    if (Math.random() > 0.85) cores += 1;
    log.push("Clan vault yearly trade. Gold now " + gold);
  }

  // quarterly events
  let pauseEvent = null;
  if (m % 3 === 0) {
    if (Math.random() > 0.6) nextThreat = Math.max(1, Math.min(10, nextThreat + (Math.random() > 0.5 ? 1 : -1)));
    const worldEvents = [
      "A flame rumor stirred the markets.",
      "Beast tide pressure rose at the borders.",
      "An auction of contested treasures turned bloody.",
      "Ancient Clan envoys passed through the region.",
      "A quiet span — only small vendettas matured.",
      "A secret realm flickered open for seven days."
    ];
    const ev = worldEvents[Math.floor(Math.random() * worldEvents.length)];
    events.push(ev);
    log.push(ev);
    if (ev.includes("auction") || ev.includes("markets")) gold += randInt(-10, 30);
    if (ev.includes("Beast tide")) gold = Math.max(0, gold - randInt(0, 15));
    if (ev.includes("secret realm") && Math.random() > 0.6) cores += 1;
    if (gold < 0) gold = 0;
    // candidate pause events
    if (/secret realm|auction|Beast tide|Ancient Clan/i.test(ev)) pauseEvent = ev;
  }

  return {
    living: survivors,
    deaths,
    births,
    wealth: { gold, herbs, cores, renown, ores: wealth.ores || 0 },
    year: y,
    month: m,
    threat: nextThreat,
    log,
    events,
    pauseEvent,
    extinct: survivors.length === 0
  };
}

self.onmessage = function (e) {
  const msg = e.data || {};
  if (msg.type === "tick") {
    try {
      const n = msg.ticks || 1;
      let payload = msg.payload;
      let last = null;
      const aggregated = { deaths: [], births: [], log: [], events: [] };
      for (let i = 0; i < n; i++) {
        last = tickOnce(payload);
        aggregated.deaths.push(...last.deaths);
        aggregated.births.push(...last.births);
        aggregated.log.push(...last.log);
        aggregated.events.push(...last.events);
        payload = {
          ...payload,
          living: last.living,
          wealth: last.wealth,
          year: last.year,
          month: last.month,
          threat: last.threat
        };
        if (last.extinct || last.pauseEvent) break;
      }
      self.postMessage({
        type: "tickResult",
        ok: true,
        result: {
          ...last,
          deaths: aggregated.deaths,
          births: aggregated.births,
          log: aggregated.log,
          events: aggregated.events
        },
        requestId: msg.requestId
      });
    } catch (err) {
      self.postMessage({ type: "tickResult", ok: false, error: String(err), requestId: msg.requestId });
    }
  } else if (msg.type === "ping") {
    self.postMessage({ type: "pong" });
  }
};
