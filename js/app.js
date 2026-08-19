// MODULAR ARCHITECTURE: data.js | modules/ui.js | modules/combat.js | modules/graph.js | modules/lineage.js | factions-extra.js | app.js
// ======================
// HEAVENLY DAO CHRONICLES
// Ultimate Application Logic — Expanded Edition
// ======================

var SAVE_VERSION = 3;

// Safe empty shell if data.js failed to load
var _FALLBACK_STATE = {
  world: null, characters: [], techniques: [], flames: [], beasts: [],
  sects: [], clans: [], empires: [], academies: [], auctions: [], pillTowers: [],
  events: [], pills: [], storyChapters: [], currentCharacterId: null, currentRegion: 'Outerland'
};

function safeDefaultState() {
  try {
    if (typeof DEFAULT_STATE !== 'undefined' && DEFAULT_STATE) return { ...DEFAULT_STATE };
  } catch (e) {}
  return { ..._FALLBACK_STATE };
}

let state;
try {
  const raw = localStorage.getItem('heavenlyDaoState');
  state = raw ? JSON.parse(raw) : null;
} catch (e) {
  console.warn('Corrupt save cleared', e);
  try { localStorage.removeItem('heavenlyDaoState'); } catch (e2) {}
  state = null;
}
// Do NOT call migrateSave here (can TDZ / throw). Simple merge only.
state = state && typeof state === 'object' ? state : safeDefaultState();
['sects','clans','empires','academies','auctions','pillTowers','events','pills','techniques','flames','beasts','characters','storyChapters'].forEach(k => {
  if (!Array.isArray(state[k])) state[k] = [];
});
if (!state.currentRegion) state.currentRegion = 'Outerland';

function revealApp() {
  try {
    const ls = document.getElementById('loading-screen');
    const appEl = document.getElementById('app');
    if (ls) {
      ls.classList.add('fade-out');
      ls.classList.add('hidden');
      ls.style.display = 'none';
      ls.style.opacity = '0';
      ls.style.visibility = 'hidden';
      ls.style.pointerEvents = 'none';
      ls.style.zIndex = '-1';
    }
    if (appEl) {
      appEl.classList.remove('hidden');
      appEl.style.display = 'flex';
      appEl.style.visibility = 'visible';
      appEl.style.opacity = '1';
    }
  } catch (e) {}
}


function saveState() {
  try { pushUndo(); } catch(e) {}
  state.version = typeof SAVE_VERSION !== 'undefined' ? SAVE_VERSION : 3;
  localStorage.setItem('heavenlyDaoState', JSON.stringify(state));
  showToast('World state saved to Heavenly Dao Memory');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) { try { console.log(msg); } catch(e) {} return; }
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function getActiveChar() {
  if (!state.characters || !state.characters.length) return null;
  return state.characters.find(c => c.id === state.currentCharacterId) || state.characters[0] || null;
}

// ========== VIEW RENDERERS ==========

function renderDashboard() {
  const char = getActiveChar();
  const world = state.world;

  return `
    <div class="grid-2" style="margin-bottom: 24px;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Cultivator Profile</h3>
          ${char ? `<span class="badge badge-gold">${char.star} ${char.realm}</span>` : ''}
        </div>
        ${char ? `
          <div style="display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap;">
            <div style="width:90px;height:90px;background:linear-gradient(145deg,#2a2a3a,#12121a);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2.4rem;border:1px solid var(--gold-dim);box-shadow:var(--glow-gold);">
              ${char.gender === 'Male' ? '⚔' : '🌸'}
            </div>
            <div style="flex:1;min-width:200px;">
              <h2 style="font-family:var(--font-display);color:var(--gold);margin-bottom:4px;font-size:1.5rem;">${char.name}</h2>
              <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:14px;">${char.age} years · ${char.gender} · ${char.race} · ${char.reputation}</p>
              <div class="detail-grid">
                <div class="detail-item"><div class="dl">Attribute</div><div class="dv">${char.attribute}</div></div>
                <div class="detail-item"><div class="dl">Physique</div><div class="dv">${char.physique}</div></div>
                <div class="detail-item"><div class="dl">Bloodline</div><div class="dv">${char.bloodline}</div></div>
                <div class="detail-item"><div class="dl">Talent</div><div class="dv">${char.talent}</div></div>
                <div class="detail-item"><div class="dl">Weapon</div><div class="dv">${char.weapon}</div></div>
                <div class="detail-item"><div class="dl">Kills</div><div class="dv">${char.kills || 0}</div></div>
              </div>
            </div>
          </div>
          <div class="section-divider"></div>
          <div class="grid-3">
            <div class="stat-box">
              <div class="label">Dou Qi</div>
              <div class="value">${char.douQi?.toLocaleString() || '—'}</div>
            </div>
            <div class="stat-box">
              <div class="label">Purity</div>
              <div class="value">${char.purity || 0}%</div>
              <div class="progress-bar"><div class="progress-fill" style="width:${char.purity || 0}%"></div></div>
            </div>
            <div class="stat-box">
              <div class="label">Control</div>
              <div class="value">${char.control || 0}%</div>
              <div class="progress-bar"><div class="progress-fill" style="width:${char.control || 0}%"></div></div>
            </div>
          </div>
          <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn-ghost" onclick="switchView('character')">View All Characters</button>
            <button class="btn-ghost" onclick="switchView('cultivation')">Enter Cultivation</button>
            <button class="btn-ghost" onclick="showGeniusRanking()">🏆 Genius Ranking</button>
            <button class="btn-ghost" onclick="dailyOpportunity()">☯ Daily Opportunity</button>
            <button class="btn-ghost" onclick="exploreSecretRealm()">🏛️ Secret Realm</button>
            <button class="btn-ghost" onclick="regionEncounter()">🌫️ Region Encounter</button>
            <button class="btn-ghost" onclick="factionShop()">🏪 Faction Shop</button>
            <button class="btn-ghost" onclick="storyChoice('fight')">⚔ Choice: Fight</button>
            <button class="btn-ghost" onclick="storyChoice('scheme')">🕶 Choice: Scheme</button>
            <button class="btn-ghost" onclick="storyChoice('wait')">🛡 Choice: Endure</button>
            <button class="btn-ghost" onclick="runTutorial()">📘 Tutorial Step</button>
            <button class="btn-ghost" onclick="guidedCampaignStep()">🎯 Guided Campaign</button>
            <button class="btn-ghost" onclick="generateChapter()">📖 Quick Chapter</button>
            <button class="btn-ghost" onclick="storyDebtPayoff()">📜 Debt Payoff Chapter</button>
            <button class="btn-ghost" onclick="breakthroughPreview()">🔮 Breakthrough Preview</button>
            <button class="btn-ghost" onclick="runShowcaseDemo()">🎬 Demo</button>
            <button class="btn-primary" onclick="startOnboarding()">📘 New Player Path</button>
            <button class="btn-ghost" onclick="startOnboarding()">📘 Onboarding</button>
            ${(state.branch && state.branch.flags && Object.keys(state.branch.flags).length) ? '<button class="btn-ghost" onclick="storyDebtPayoff()">📜 Debt Payoff Due</button>' : ''}
            <button class="btn-ghost" onclick="switchView('simulation')">♾️ Lineage Sim</button>
            <button class="btn-ghost" onclick="collectionSync()">📦 Sync Collections</button>
            <button class="btn-ghost" onclick="advanceSeason()">🌙 Advance Season</button>
            <button class="btn-ghost" onclick="advanceCalendar()">📅 Advance Month</button>
            <button class="btn-ghost" onclick="travelAmbush()">🗡 Travel Ambush Check</button>
            <button class="btn-ghost" onclick="replayLastBattles()">📼 Battle Replays</button>
            <button class="btn-ghost" onclick="summonBeastAssist()">🐉 Beast Assist</button>
            <button class="btn-ghost" onclick="teamSpar()">👥 Team Spar</button>
            <button class="btn-ghost" onclick="escapeBattle()">🏃 Escape Battle</button>
            <button class="btn-ghost" onclick="assignTechniqueToChar()">📜 Learn Technique</button>
          </div>
        ` : `
          <div class="empty-state">
            <div class="icon">👤</div>
            <p>No cultivator selected. Create one to begin your legend.</p>
            <button class="btn-primary" style="margin-top:16px;" onclick="switchView('character')">Create Character</button>
          </div>
        `}
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">World Status</h3>
          ${world ? `<span class="badge badge-purple">${world.name}</span>` : ''}
        </div>
        ${world ? `
          <p style="color:var(--text-muted);margin-bottom:16px;line-height:1.65;">${world.currentEra}</p>
          <div style="margin-bottom:14px;">
            <span style="color:var(--text-dim);font-size:0.75rem;">CURRENT REGION</span>
            <p><strong>${state.currentRegion || "Outerland"}</strong> — Travel via Continent Map</p>
          </div>
          <div style="margin-bottom:14px;">
            <span style="color:var(--text-dim);font-size:0.75rem;">THREAT LEVEL</span>
            <p><span class="badge badge-red">High</span> — Ancient Clan movements detected</p>
          </div>
          <div>
            <span style="color:var(--text-dim);font-size:0.75rem;">MAJOR EVENTS</span>
            <ul style="margin-top:8px;padding-left:18px;color:var(--text-muted);font-size:0.9rem;line-height:1.7;">
              ${(world.currentEvents || []).map(e => `<li>${e}</li>`).join('') || '<li>The world is quiet... for now.</li>'}
            </ul>
          </div>
          <div style="margin-top:16px;">
            <button class="btn-ghost" onclick="triggerWorldEvent()">☯ Trigger Heavenly Dao Event</button>
          </div>
        ` : `
          <div class="empty-state">
            <div class="icon">🌍</div>
            <p>No world created yet.</p>
            <button class="btn-primary" style="margin-top:16px;" onclick="switchView('world')">Create World</button>
          </div>
        `}
      </div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Lineage Pulse</h3>
        <button class="btn-ghost" onclick="switchView('simulation')">Open Sim</button>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;">
        ${state.lineage && state.lineage.founderId ? `Blood <strong style="color:var(--gold);">${state.lineage.bloodName||"?"}</strong> · Gen ${state.lineage.generations||1} · Year ${(state.sim&&state.sim.year)||1} · Living ${typeof getLineageCharacters==='function'?getLineageCharacters().length:'?'} · Gold ${(state.clanWealth&&state.clanWealth.gold)||0} · ${state.sim&&state.sim.running?'<span class="badge badge-green">RUNNING</span>':'<span class="badge badge-purple">PAUSED</span>'}${state.sim&&state.sim.lineageAlive===false?' · <span class="badge badge-red">EXTINCT</span>':''}` : 'No lineage founder yet. Open Lineage Sim after creating a character.'}
      </p>
    </div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Story Progress</h3>
        <button class="btn-ghost" onclick="switchView('story')">Open Story Generator</button>
      </div>
      ${state.storyChapters.length > 0 ? `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${state.storyChapters.slice(-3).reverse().map(ch => `
            <div style="padding:14px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <strong style="color:var(--gold);">${ch.title}</strong>
              <p style="color:var(--text-muted);font-size:0.9rem;margin-top:6px;line-height:1.5;">${ch.content.substring(0, 180)}...</p>
            </div>
          `).join('')}
        </div>
      ` : `<p style="color:var(--text-muted);">No chapters generated yet. Begin your legend in the Story Generator.</p>`}
    </div>
  `;
}

function renderWorld() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">AI World Creation Engine</h3>
        <div style="display:flex;gap:10px;">
          <button class="btn-primary" onclick="createWorld()">✦ Generate New World</button>
          ${state.world ? `<button class="btn-ghost" onclick="triggerWorldEvent()">Trigger Event</button>` : ''}
        </div>
      </div>
      <p style="color:var(--text-muted);margin-bottom:0;">Create a complete ancient cultivation continent following the laws of the Heavenly Dao.</p>
    </div>

    ${state.world ? `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${state.world.name}</h3>
          <span class="badge badge-gold">Active World</span>
        </div>
        <div class="grid-2">
          <div>
            <h4 style="color:var(--gold);margin-bottom:8px;font-family:var(--font-display);">Origin Story</h4>
            <p style="color:var(--text-muted);line-height:1.75;">${state.world.origin}</p>
            <h4 style="color:var(--gold);margin:20px 0 8px;font-family:var(--font-display);">Creation Myth</h4>
            <p style="color:var(--text-muted);line-height:1.75;">${state.world.creationMyth}</p>
          </div>
          <div>
            <h4 style="color:var(--gold);margin-bottom:8px;font-family:var(--font-display);">Ancient Era</h4>
            <p style="color:var(--text-muted);line-height:1.75;">${state.world.ancientEra}</p>
            <h4 style="color:var(--gold);margin:20px 0 8px;font-family:var(--font-display);">Current Era</h4>
            <p style="color:var(--text-muted);line-height:1.75;">${state.world.currentEra}</p>
          </div>
        </div>
        <div class="section-divider"></div>
        <h4 style="color:var(--gold);margin-bottom:16px;font-family:var(--font-display);">World Map Regions</h4>
        <div class="grid-4">
          <div class="stat-box"><div class="label">Outerland</div><div class="sub" style="margin-top:8px;">${state.world.regions.outerland}</div></div>
          <div class="stat-box"><div class="label">Innerland</div><div class="sub" style="margin-top:8px;">${state.world.regions.innerland}</div></div>
          <div class="stat-box"><div class="label">Mainland</div><div class="sub" style="margin-top:8px;">${state.world.regions.mainland}</div></div>
          <div class="stat-box"><div class="label">Central Land</div><div class="sub" style="margin-top:8px;">${state.world.regions.central}</div></div>
        </div>
        <div class="section-divider"></div>
        <h4 style="color:var(--gold);margin-bottom:8px;font-family:var(--font-display);">Heavenly Laws</h4>
        <p style="color:var(--text-muted);line-height:1.7;">${state.world.heavenlyLaws}</p>
        <h4 style="color:var(--gold);margin:16px 0 8px;font-family:var(--font-display);">Cultivation Rules</h4>
        <p style="color:var(--text-muted);line-height:1.7;">${state.world.cultivationRules}</p>
        ${state.events && state.events.length ? `
          <div class="section-divider"></div>
          <h4 style="color:var(--gold);margin-bottom:12px;font-family:var(--font-display);">Recorded Events</h4>
          ${state.events.slice(-5).reverse().map(e => `
            <div style="padding:12px;background:var(--bg-deep);border-radius:8px;border:1px solid var(--border);margin-bottom:8px;">
              <strong style="color:var(--red-glow);">${e.title}</strong>
              <p style="color:var(--text-muted);font-size:0.9rem;margin-top:4px;">${e.desc}</p>
            </div>
          `).join('')}
        ` : ''}
      </div>
    ` : `
      <div class="card">
        <div class="empty-state">
          <div class="icon">🌍</div>
          <p>The void awaits. Generate a world to begin your legend.</p>
        </div>
      </div>
    `}
  `;
}

function renderCharacter() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Character Creation System</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-primary" onclick="createCharacter()">✦ Generate Character</button>
          <button class="btn-ghost" onclick="createCharacter('Dou Zhe')">Start as Dou Zhe</button>
          <button class="btn-ghost" onclick="findTreasure()">💎 Find Treasure</button>
          <button class="btn-ghost" onclick="renameCharacter()">✏️ Rename</button>
          <button class="btn-danger" onclick="deleteCharacter()">🗑️ Delete</button>
        </div>
      </div>
      <p style="color:var(--text-muted);">Create detailed cultivators with full backgrounds, talents, bloodlines, and destinies. Click a card to make them active.</p>
    </div>

    ${state.characters.length > 0 ? `
      <div class="grid-3">
        ${state.characters.map(c => `
          <div class="char-card" onclick="selectCharacter('${c.id}')">
            <div class="name">${c.name}</div>
            <div class="realm">${c.star} ${c.realm}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
              <span class="badge badge-gold">${c.attribute}</span>
              <span class="badge badge-purple">${c.talent}</span>
              <span class="badge badge-blue">${c.reputation || 'Unknown'}</span>
            </div>
            <p style="font-size:0.85rem;color:var(--text-muted);">${c.personality} · ${c.physique}</p>
            <p style="font-size:0.8rem;color:var(--text-dim);margin-top:8px;">Dream: ${c.dreams}</p>
            <p style="font-size:0.8rem;color:var(--text-dim);">Secret: ${c.secrets.substring(0, 50)}...</p>
            ${c.technique ? `<p style="font-size:0.8rem;color:var(--gold);margin-top:4px;">Technique: ${c.technique}</p>` : ""}
            ${state.currentCharacterId === c.id ? '<div style="margin-top:10px;"><span class="badge badge-green">● Active</span></div>' : ''}
          </div>
        `).join('')}
      </div>
      ${getActiveChar() ? `
        <div class="card" style="margin-top:24px;">
          <div class="card-header">
            <h3 class="card-title">Active: ${getActiveChar().name}</h3>
            <span class="badge badge-gold">${getActiveChar().star} ${getActiveChar().realm}</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item"><div class="dl">Age</div><div class="dv">${getActiveChar().age}</div></div>
            <div class="detail-item"><div class="dl">Gender</div><div class="dv">${getActiveChar().gender}</div></div>
            <div class="detail-item"><div class="dl">Race</div><div class="dv">${getActiveChar().race}</div></div>
            <div class="detail-item"><div class="dl">Appearance</div><div class="dv">${getActiveChar().appearance}</div></div>
            <div class="detail-item"><div class="dl">Family</div><div class="dv">${getActiveChar().family}</div></div>
            <div class="detail-item"><div class="dl">Master</div><div class="dv">${getActiveChar().master}</div></div>
            <div class="detail-item"><div class="dl">Fears</div><div class="dv">${getActiveChar().fears}</div></div>
            <div class="detail-item"><div class="dl">Weapon</div><div class="dv">${getActiveChar().weapon}</div></div>
          </div>
          <p style="margin-top:16px;color:var(--text-muted);"><strong style="color:var(--gold);">Secret:</strong> ${getActiveChar().secrets}</p>
          ${getActiveChar().alive === false ? `<p style="color:var(--red-glow);margin-top:8px;">Deceased — ${getActiveChar().deathReason || "fallen"} (Y${getActiveChar().deathYear || "?"})</p>` : ""}
          ${getActiveChar().spouse ? `<p style="color:var(--text-muted);margin-top:6px;"><strong style="color:var(--gold);">Spouse:</strong> ${getActiveChar().spouse}</p>` : ""}
          ${getActiveChar().generation ? `<p style="color:var(--text-muted);margin-top:6px;"><strong style="color:var(--gold);">Generation:</strong> ${getActiveChar().generation}</p>` : ""}
          ${(getActiveChar().affiliations && getActiveChar().affiliations.length) ? `
            <p style="margin-top:10px;color:var(--text-muted);"><strong style="color:var(--gold);">Affiliations:</strong> ${getActiveChar().affiliations.map(a => a.name + " (" + a.type + ")").join(", ")}
            ${getActiveChar().factionRank ? ` · Rank: <span class="badge badge-purple">${getActiveChar().factionRank}</span>` : ""}</p>
          ` : ""}
          ${(getActiveChar().inventory && getActiveChar().inventory.length) ? `
            <div class="section-divider"></div>
            <h4 style="color:var(--gold);margin-bottom:10px;font-family:var(--font-display);">Inventory (${getActiveChar().inventory.length} items)</h4>
            <div class="detail-grid">
              ${getActiveChar().inventory.map(i => `
                <div class="detail-item"><div class="dl">${i.type} · ${i.rank}</div><div class="dv">${i.name}</div></div>
              `).join('')}
            </div>
          ` : '<p style="margin-top:12px;color:var(--text-dim);font-size:0.85rem;">Inventory empty — use Find Treasure</p>'}
        </div>
      ` : ''}
    ` : `
      <div class="card">
        <div class="empty-state">
          <div class="icon">👤</div>
          <p>No characters yet. Generate your first cultivator.</p>
        </div>
      </div>
    `}
  `;
}

function renderCultivation() {
  const char = getActiveChar();
  if (!char) {
    return `<div class="card"><div class="empty-state"><div class="icon">⚡</div><p>Select or create a character first.</p><button class="btn-primary" style="margin-top:12px;" onclick="switchView('character')">Create Character</button></div></div>`;
  }

  const rankInfo = DOU_QI_RANKS.find(r => r.name === char.realm);

  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Cultivation Simulator — ${char.name}</h3>
        <span class="badge badge-gold">${char.star} ${char.realm}</span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:20px;font-size:0.9rem;">${rankInfo ? rankInfo.desc : ''}</p>
      <div class="grid-3" style="margin-bottom:24px;">
        <div class="stat-box">
          <div class="label">Dou Qi Amount</div>
          <div class="value">${char.douQi?.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="label">Foundation</div>
          <div class="value">${char.foundation}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${char.foundation}%"></div></div>
        </div>
        <div class="stat-box">
          <div class="label">Comprehension</div>
          <div class="value">${char.comprehension}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${char.comprehension}%"></div></div>
        </div>
      </div>
      <div class="grid-2" style="margin-bottom:12px;">
        <div class="stat-box">
          <div class="label">Purity</div>
          <div class="value">${char.purity}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${char.purity}%"></div></div>
        </div>
        <div class="stat-box">
          <div class="label">Control</div>
          <div class="value">${char.control}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${char.control}%"></div></div>
        </div>
      </div>
      <div class="grid-2" style="margin-top:20px;">
        <button class="btn-primary" style="width:100%;padding:16px;font-size:1rem;" onclick="trainCharacter()">☯ Meditate & Train Dou Qi</button>
        <button class="btn-ghost" style="width:100%;padding:16px;font-size:1rem;" onclick="attemptBreakthrough()">⚡ Attempt Breakthrough</button>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn-ghost" onclick="trainCharacter(true)">Deep Meditation</button>
        <button class="btn-ghost" onclick="awakenBloodline()">🩸 Awaken Bloodline</button>
        <button class="btn-ghost" onclick="evolvePhysique()">🧬 Evolve Physique</button>
        <button class="btn-ghost" onclick="masterTechnique()">📜 Master Technique</button>
        <button class="btn-ghost" onclick="recoverInjury()">💚 Recover Injury</button>
        <button class="btn-ghost" onclick="bindFlameToBody()">🔥 Bind Flame</button>
        <button class="btn-ghost" onclick="enterSeclusion()">🧘 Seclusion</button>
        <button class="btn-ghost" onclick="gatherResources()">🌿 Gather Resources</button>
        <button class="btn-ghost" onclick="fuseFlameRisk()">🔥 Flame Fusion</button>
        <button class="btn-ghost" onclick="tribulationAttempt()">⛈️ Tribulation</button>
        <button class="btn-ghost" onclick="ageSeclusion()">⏳ Long Seclusion</button>
        <button class="btn-ghost" onclick="setLoadout('active')">⚔ Active Loadout</button>
        <button class="btn-ghost" onclick="setLoadout('passive')">🛡 Passive Loadout</button>
        <button class="btn-ghost" onclick="refineArtifact()">🔨 Refine Artifact</button>
        <button class="btn-ghost" onclick="trainTrack('body')">💪 Body Track</button>
        <button class="btn-ghost" onclick="trainTrack('qiTrack')">🌀 Qi Track</button>
        <button class="btn-ghost" onclick="trainTrack('soul')">👻 Soul Track</button>
        <button class="btn-ghost" onclick="cityHub()">🏙️ City Hub</button>
        <button class="btn-ghost" onclick="worldBossPing()">👹 World Boss</button>
      </div>
      <p style="margin-top:10px;color:var(--text-dim);font-size:0.85rem;">Bottleneck: ${bottleneckStatus(char)} ${char.boundFlame ? "· Bound Flame: "+char.boundFlame : ""} ${char.injured ? "· Injury: "+char.injured : ""}</p>
    </div>

    <div class="card">
      <h3 class="card-title" style="margin-bottom:16px;">Dou Qi Ranking System</h3>
      <div class="grid-4">
        ${DOU_QI_RANKS.map(r => `
          <div class="stat-box" style="${r.name === char.realm ? 'border-color:var(--gold);box-shadow:var(--glow-gold);' : ''}">
            <div class="label">${r.category}</div>
            <div class="value" style="font-size:1.05rem;">${r.name}</div>
          </div>
        `).join('')}
      </div>
      <p style="color:var(--text-muted);margin-top:20px;font-size:0.9rem;line-height:1.6;">
        Each realm is divided into 1–9 Stars + Peak. Breaking through requires talent, resources, experience, techniques, and opportunity. The Heavenly Dao does not favor the weak.
      </p>
    </div>
  `;
}

function renderTechniques() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Technique Creation System</h3>
        <button class="btn-primary" onclick="createTechnique()">✦ Generate Technique</button>
      </div>
      <p style="color:var(--text-muted);">Huang → Xuan → Di → Tian → Saint → Emperor Rank techniques.</p>
    </div>
    ${state.techniques.length ? `
      <div class="grid-2">
        ${state.techniques.map(t => `
          <div class="card">
            <div class="card-header">
              <h4 style="color:var(--gold);font-family:var(--font-display);">${t.name}</h4>
              <span class="badge badge-gold">${t.rank}</span>
            </div>
            <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:10px;">${t.description || ''}</p>
            <p style="font-size:0.85rem;"><span style="color:var(--text-dim);">Attribute:</span> <strong>${t.attribute}</strong></p>
            <p style="font-size:0.85rem;"><span style="color:var(--text-dim);">Creator:</span> ${t.creator}</p>
            <p style="font-size:0.85rem;"><span style="color:var(--text-dim);">Origin:</span> ${t.origin}</p>
            <p style="font-size:0.85rem;margin-top:8px;"><span style="color:var(--text-dim);">Power:</span> ${t.power}/100</p>
            <p style="font-size:0.85rem;"><span style="color:var(--text-dim);">Weakness:</span> ${t.weakness}</p>
            <p style="font-size:0.85rem;"><span style="color:var(--text-dim);">Evolution:</span> ${t.evolution}</p>
          </div>
        `).join('')}
      </div>
    ` : `<div class="card"><div class="empty-state"><div class="icon">📜</div><p>No techniques created yet.</p></div></div>`}
  `;
}

function renderFlames() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Heavenly Flame System</h3>
        <button class="btn-primary" onclick="createFlame()">🔥 Discover Flame</button>
      </div>
      <p style="color:var(--text-muted);">The ranked Heavenly Flames are the most mysterious and powerful existences in alchemy and combat. Lower rank number = stronger flame.</p>
    </div>
    ${state.flames.length ? `
      <div class="grid-2">
        ${state.flames.map(f => `
          <div class="card flame-item">
            <div class="card-header">
              <h4 style="color:var(--red-glow);font-family:var(--font-display);">${f.name}</h4>
              <span class="badge badge-red">Rank ${f.rank}</span>
            </div>
            <p style="color:var(--text-muted);margin-bottom:10px;">${f.appearance}</p>
            <p style="font-size:0.9rem;"><strong>Ability:</strong> ${f.ability}</p>
            <p style="font-size:0.85rem;margin-top:8px;"><span style="color:var(--text-dim);">Intelligence:</span> ${f.intelligence} · <span style="color:var(--text-dim);">Personality:</span> ${f.personality}</p>
            <p style="font-size:0.85rem;margin-top:6px;color:var(--text-muted);">${f.history}</p>
            <p style="font-size:0.8rem;margin-top:8px;color:var(--text-dim);">Previous owners: ${(f.previousOwners || []).join(', ')}</p>
          </div>
        `).join('')}
      </div>
    ` : `<div class="card"><div class="empty-state"><div class="icon">🔥</div><p>No Heavenly Flames discovered yet.</p></div></div>`}
  `;
}

function renderAlchemy() {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Alchemy Laboratory</h3>
        <button class="btn-primary" onclick="refinePill()">⚗️ Refine Pill</button>
      </div>
      <p style="color:var(--text-muted);margin-bottom:24px;">Alchemy ranks from 1st Grade to Divine Alchemist. Pills can change destinies — and fail catastrophically.</p>
      
      <div class="grid-3" style="margin-bottom:24px;">
        ${['1st–3rd Grade', '4th–6th Grade', '7th–9th Grade', 'Saint Alchemist', 'Divine Alchemist'].map((r, i) => `
          <div class="stat-box">
            <div class="label">Tier ${i + 1}</div>
            <div class="value" style="font-size:1rem;">${r}</div>
          </div>
        `).join('')}
      </div>

      <div id="alchemy-result"></div>

      ${state.pills && state.pills.length ? `
        <div class="section-divider"></div>
        <h4 style="color:var(--gold);margin-bottom:12px;font-family:var(--font-display);">Refined Pills</h4>
        <div class="grid-2">
          ${state.pills.slice(-6).reverse().map(p => `
            <div style="padding:12px;background:var(--bg-deep);border-radius:8px;border:1px solid var(--border);">
              <strong style="color:var(--gold);">${p.name}</strong>
              <span class="badge badge-purple" style="margin-left:8px;">${p.grade}</span>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:6px;">${p.effect}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderBeasts() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Magical Beast System</h3>
        <button class="btn-primary" onclick="createBeast()">🐉 Generate Beast</button>
      </div>
      <p style="color:var(--text-muted);">From 1st Rank to 9th Rank — and the legendary Supreme Beast Clans.</p>
    </div>
    ${state.beasts.length ? `
      <div class="grid-3">
        ${state.beasts.map(b => `
          <div class="card">
            <h4 style="color:var(--gold);font-family:var(--font-display);margin-bottom:6px;">${b.species}</h4>
            <span class="badge badge-blue">${b.rank}</span>
            <span class="badge badge-purple" style="margin-left:6px;">${b.bloodline}</span>
            <p style="font-size:0.85rem;margin-top:12px;color:var(--text-muted);">${b.history}</p>
            <p style="font-size:0.8rem;margin-top:8px;"><span style="color:var(--text-dim);">Territory:</span> ${b.territory}</p>
            <p style="font-size:0.8rem;"><span style="color:var(--text-dim);">Weakness:</span> ${b.weakness}</p>
            <p style="font-size:0.8rem;"><span style="color:var(--text-dim);">Evolution:</span> ${b.evolution}</p>
          </div>
        `).join('')}
      </div>
    ` : `<div class="card"><div class="empty-state"><div class="icon">🐉</div><p>No magical beasts recorded.</p></div></div>`}
  `;
}

function renderFactions() {
  if (!state.sects) state.sects = [];
  if (!state.empires) state.empires = [];
  if (!state.academies) state.academies = [];
  if (!state.auctions) state.auctions = [];
  if (!state.pillTowers) state.pillTowers = [];
  if (!state.clans) state.clans = [];

  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Faction Creation Center</h3>
      </div>
      <p style="color:var(--text-muted);margin-bottom:16px;">Create and manage Sects, Clans, Empires, Academies, Auction Houses, and Pill Towers.</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;">
        <button class="btn-primary" onclick="createDetailedSect()">🏯 Create Sect</button>
        <button class="btn-primary" onclick="createDetailedClan()">👪 Create Clan</button>
        <button class="btn-ghost" onclick="createEmpire()">👑 Create Empire</button>
        <button class="btn-ghost" onclick="createAcademy()">📚 Create Academy</button>
        <button class="btn-ghost" onclick="createAuction()">💰 Create Auction House</button>
        <button class="btn-ghost" onclick="runAuction()">🔨 Attend Auction</button>
        <button class="btn-ghost" onclick="academyExam()">📝 Academy Exam</button>
        <button class="btn-ghost" onclick="pillCommission()">⚗️ Pill Commission</button>
        <button class="btn-ghost" onclick="allianceContract()">🤝 Alliance Contract</button>
        <button class="btn-ghost" onclick="wantedByAncients()">⚠️ Draw Ancient Attention</button>
        <button class="btn-ghost" onclick="influenceMeter()">📈 Influence Meter</button>
        <button class="btn-ghost" onclick="betrayalMission()">🗡️ Betrayal Mission</button>
        <button class="btn-ghost" onclick="elderTrial()">👑 Elder Trial</button>
        <button class="btn-ghost" onclick="breakTreaty()">💔 Break Treaty</button>
        <button class="btn-ghost" onclick="shiftRegionControl()">🗺️ Shift Region Control</button>
        <button class="btn-ghost" onclick="createPillTower()">⚗️ Create Pill Tower</button>
        <button class="btn-ghost" onclick="triggerFactionConflict()">⚔️ Trigger Faction War</button>
        <button class="btn-ghost" onclick="joinFaction('sect')">Join Random Sect</button>
        <button class="btn-ghost" onclick="joinFaction('academy')">Join Academy</button>
        <button class="btn-ghost" onclick="doFactionMission()">🎯 Faction Mission</button>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:24px;">
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">Eight Ancient Clans</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${ANCIENT_CLANS.map(c => `
            <div style="padding:14px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <strong style="color:var(--gold);">${c.name}</strong>
                <span class="badge badge-gold">${c.treasure}</span>
              </div>
              <div style="font-size:0.82rem;color:var(--text-muted);margin-top:6px;">Bloodline: ${c.bloodline} · Specialty: ${c.specialty}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">Five Supreme Beast Clans</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${BEAST_CLANS.map(c => `
            <div style="padding:14px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <strong style="color:var(--red-glow);">${c.name}</strong>
              <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">${c.trait}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    ${state.sects.length ? `
      <div class="card" style="margin-bottom:24px;">
        <h3 class="card-title" style="margin-bottom:16px;">Your Sects (${state.sects.length})</h3>
        <div class="grid-2">
          ${state.sects.map(s => `
            <div style="padding:16px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong style="color:var(--gold);font-size:1.1rem;">${s.name}</strong>
                <span class="badge badge-purple">${s.rank}</span>
              </div>
              <p style="font-size:0.85rem;color:var(--text-muted);">Master: ${s.sectMaster}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Disciples: ${s.disciples} · Elders: ${s.elders}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Territory: ${s.territory} · ${s.reputation}</p>
              <p style="font-size:0.8rem;margin-top:6px;">Technique: ${s.technique}</p>
              <p style="font-size:0.8rem;">Mission: ${s.missions}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${state.clans.length ? `
      <div class="card" style="margin-bottom:24px;">
        <h3 class="card-title" style="margin-bottom:16px;">Your Clans (${state.clans.length})</h3>
        <div class="grid-2">
          ${state.clans.map(c => `
            <div style="padding:16px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong style="color:var(--gold);font-size:1.1rem;">${c.name}</strong>
                <span class="badge badge-blue">${c.rank}</span>
              </div>
              <p style="font-size:0.85rem;color:var(--text-muted);">Patriarch: ${c.patriarch}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Members: ${c.members} · Status: ${c.status}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Bloodline: ${c.bloodline}</p>
              <p style="font-size:0.8rem;margin-top:6px;">Young Generation: ${(c.youngGeneration||[]).join(', ')}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${state.empires.length ? `
      <div class="card" style="margin-bottom:24px;">
        <h3 class="card-title" style="margin-bottom:16px;">Empires (${state.empires.length})</h3>
        <div class="grid-2">
          ${state.empires.map(e => `
            <div style="padding:16px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <strong style="color:var(--gold);font-size:1.1rem;">${e.name}</strong>
              <span class="badge badge-red" style="margin-left:8px;">${e.strength}</span>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">Ruler: ${e.ruler}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Territory: ${e.territory} · Armies: ${e.armies}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Specialty: ${e.specialty}</p>
              <p style="font-size:0.8rem;margin-top:6px;">Crisis: ${e.currentCrisis}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${state.academies.length ? `
      <div class="card" style="margin-bottom:24px;">
        <h3 class="card-title" style="margin-bottom:16px;">Academies (${state.academies.length})</h3>
        <div class="grid-2">
          ${state.academies.map(a => `
            <div style="padding:16px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <strong style="color:var(--gold);font-size:1.1rem;">${a.name}</strong>
              <span class="badge badge-purple" style="margin-left:8px;">${a.ranking}</span>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">Dean: ${a.dean}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Students: ${a.students} · Specialty: ${a.specialty}</p>
              <p style="font-size:0.8rem;margin-top:6px;">Famous Alumni: ${(a.famousAlumni||[]).join(', ')}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${state.auctions.length ? `
      <div class="card" style="margin-bottom:24px;">
        <h3 class="card-title" style="margin-bottom:16px;">Auction Houses (${state.auctions.length})</h3>
        <div class="grid-2">
          ${state.auctions.map(a => `
            <div style="padding:16px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <strong style="color:var(--gold);font-size:1.1rem;">${a.name}</strong>
              <span class="badge badge-blue" style="margin-left:8px;">${a.rank}</span>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">Location: ${a.location}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Specialty: ${a.specialty}</p>
              <p style="font-size:0.8rem;margin-top:6px;color:var(--red-glow);">Next: ${a.nextAuction}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${state.pillTowers.length ? `
      <div class="card" style="margin-bottom:24px;">
        <h3 class="card-title" style="margin-bottom:16px;">Pill Towers (${state.pillTowers.length})</h3>
        <div class="grid-2">
          ${state.pillTowers.map(p => `
            <div style="padding:16px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
              <strong style="color:var(--gold);font-size:1.1rem;">${p.name}</strong>
              <span class="badge badge-green" style="margin-left:8px;">${p.rank}</span>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">Master: ${p.towerMaster}</p>
              <p style="font-size:0.85rem;color:var(--text-muted);">Alchemists: ${p.alchemists} · Specialty: ${p.specialty}</p>
              <p style="font-size:0.8rem;margin-top:6px;">Current: ${p.currentTask}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function renderBattle() {
  const chars = state.characters;
  const f1 = chars[0];
  const f2 = chars[1];
  const loadoutHtml = (window.DaoCombat && f1) ? window.DaoCombat.renderLoadoutPanel(state, f1, f2 || null) : "";
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Battle Simulation AI</h3>
      </div>
      <p style="color:var(--text-muted);margin-bottom:16px;">Turn-based combat with stances, element advantage, skills, crits, burn/seal status, and loadout bonuses.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <button class="btn-ghost" onclick="setCombatStance('aggressive')">⚔ Aggressive</button>
        <button class="btn-ghost" onclick="setCombatStance('balanced')">☯ Balanced</button>
        <button class="btn-ghost" onclick="setCombatStance('defensive')">🛡 Defensive</button>
        <button class="btn-ghost" onclick="setCombatStance('scheme')">🗡 Scheme</button>
        <button class="btn-primary" onclick="runCombatDemo()">▶ Run Detailed Combat</button>
      </div>
      <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:12px;">Stance: <strong style="color:var(--gold);">${(state.combat&&state.combat.stance)||'balanced'}</strong> · Active power estimate: <strong style="color:var(--gold);">${getActiveChar()?rankPower(getActiveChar()):'—'}</strong></p>
      ${state.combat && state.combat.lastLog && state.combat.lastLog.length ? `
        <div class="ai-output" style="margin-bottom:16px;max-height:280px;overflow:auto;">
          <strong style="color:var(--gold);">Last Combat Log</strong>
          ${state.combat.lastLog.map(l => `<div style="padding:3px 0;border-bottom:1px solid var(--border);font-size:0.85rem;">${l}</div>`).join("")}
        </div>
      ` : ""}
      ${loadoutHtml}
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
        <button class="btn-ghost" onclick="setLoadout('active')">Set Active Tech</button>
        <button class="btn-ghost" onclick="setLoadout('passive')">Set Passive Tech</button>
        <button class="btn-ghost" onclick="summonBeastAssist()">Set Beast Assist</button>
      </div>
      
      ${chars.length < 2 ? `
        <div class="empty-state">
          <div class="icon">⚔️</div>
          <p>You need at least two characters to simulate a battle.</p>
          <button class="btn-primary" style="margin-top:12px;" onclick="switchView('character')">Create Characters</button>
        </div>
      ` : `
        <div class="grid-2" style="margin-bottom:20px;">
          <div class="form-group">
            <label>Fighter 1</label>
            <select id="fighter1">
              ${chars.map(c => `<option value="${c.id}">${c.name} (${c.star} ${c.realm})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Fighter 2</label>
            <select id="fighter2">
              ${chars.map((c, i) => `<option value="${c.id}" ${i === 1 ? 'selected' : ''}>${c.name} (${c.star} ${c.realm})</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn-primary" onclick="simulateBattle()">⚔️ Begin Battle</button>
        <div id="battle-result" style="margin-top:24px;"></div>
      `}
    </div>
  `;
}

function renderStory() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">AI Novel & Chapter Generator</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-primary" onclick="generateChapter()">📖 Generate Next Chapter</button>
          <button class="btn-ghost" onclick="exportNovel()">📤 Export Novel</button>
          <button class="btn-danger" onclick="clearAllStories()">🗑️ Clear Chapters</button>
          <button class="btn-ghost" onclick="bookmarkChapter()">🔖 Bookmark</button>
          <button class="btn-ghost" onclick="rewriteChapter()">♻️ Rewrite</button>
          <button class="btn-ghost" onclick="canonLock()">📌 Canon Lock</button>
        </div>
      </div>
      <p style="color:var(--text-muted);">The Heavenly Dao remembers everything. Stories evolve with your world, region, factions, and characters.</p>
    </div>
    <div id="story-output">
      ${state.storyChapters.length ? state.storyChapters.slice().reverse().map(ch => `
        <div class="card" style="margin-bottom:16px;">
          <h4 style="color:var(--gold);font-family:var(--font-display);margin-bottom:12px;">${ch.title}</h4>
          <div class="ai-output" style="margin:0;border-left-color:var(--purple);">${ch.content}</div>
        </div>
      `).join('') : `
        <div class="card"><div class="empty-state"><div class="icon">📖</div><p>No chapters yet. Generate your first legend.</p></div></div>
      `}
    </div>
  `;
}

function renderCommunity() {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Community Creation Platform</h3>
      </div>
      <p style="color:var(--text-muted);margin-bottom:24px;">Share worlds, characters, and stories with other cultivators. (Demo mode — local only)</p>
      <div class="grid-3">
        <div class="stat-box"><div class="label">Public Worlds</div><div class="value">128</div></div>
        <div class="stat-box"><div class="label">Shared Characters</div><div class="value">1,847</div></div>
        <div class="stat-box"><div class="label">Active Creators</div><div class="value">392</div></div>
      </div>
      <div class="section-divider"></div>
      <p style="color:var(--text-dim);font-size:0.9rem;">In the full version: ratings, comments, followers, public world browser, and collaborative storytelling.</p>
      <div class="section-divider"></div>
      <button class="btn-danger" onclick="resetWorld()">⚠️ Reset Entire World</button>
      <button class="btn-ghost" onclick="resetLineageKeepWorld()">♻️ Reset Lineage Keep World</button>
      <button class="btn-ghost" onclick="try { localStorage.removeItem('heavenlyDaoState'); location.reload(); } catch(e) {}">🩹 Corrupt Save Recovery</button>
      <div class="section-divider"></div>
      <h4 style="color:var(--gold);margin-bottom:10px;">Save Slots</h4>
      <p style="color:var(--text-dim);font-size:0.82rem;margin-bottom:8px;">
        ${[1,2,3].map(n => { const p = state.saveSlots&&state.saveSlots[n]&&state.saveSlots[n]._preview; return "Slot "+n+": "+(p? (p.blood+" Y"+p.year+" living "+p.living+(p.extinct?" EXTINCT":"")) : "empty"); }).join(" · ")}
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <button class="btn-ghost" onclick="saveToSlot(1)">Save Slot 1</button>
        <button class="btn-ghost" onclick="loadFromSlot(1)">Load Slot 1</button>
        <button class="btn-ghost" onclick="saveToSlot(2)">Save Slot 2</button>
        <button class="btn-ghost" onclick="loadFromSlot(2)">Load Slot 2</button>
        <button class="btn-ghost" onclick="saveToSlot(3)">Save Slot 3</button>
        <button class="btn-ghost" onclick="loadFromSlot(3)">Load Slot 3</button>
      </div>
      <h4 style="color:var(--gold);margin-bottom:10px;">Story Tone</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <button class="btn-ghost" onclick="setStoryTone('heroic')">Heroic</button>
        <button class="btn-ghost" onclick="setStoryTone('dark')">Dark</button>
        <button class="btn-ghost" onclick="setStoryTone('scheming')">Scheming</button>
      </div>
    </div>
  `;
}

function renderPricing() {
  ensurePath();
  const tiers = [
    { name: "Mortal", price: "Free", period: "Forever", features: ["1 World","3 Characters","Basic Generation","Local Save"], key: "Mortal" },
    { name: "Disciple", price: "$9", period: "per month", features: ["5 Worlds","20 Characters","Advanced AI (local)","Image Credits (n/a)","Export TXT"], key: "Disciple" },
    { name: "Dou King", price: "$19", period: "per month", features: ["Unlimited Worlds","100 Characters","Full Simulation","More Images (n/a)","PDF/DOCX Export (local)"], key: "Dou King", recommended: true },
    { name: "Dou Saint", price: "$39", period: "per month", features: ["Priority AI (local)","Custom Flames","Clan Tools","Battle Depth","Community Boost"], key: "Dou Saint" },
    { name: "Dou Di", price: "$79", period: "per month", features: ["Everything","Dedicated Memory (localStorage)","Early Features","API Access (n/a)","Legend Status"], key: "Dou Di" }
  ];
  return `
    <div class="card" style="margin-bottom:16px;">
      <h3 class="card-title">Cultivation Paths</h3>
      <p style="color:var(--text-muted);margin-top:8px;">This site is a <strong style="color:var(--gold);">local single-player app</strong>. There is <strong>no real payment system</strong>. Prices are cosmetic. Use <strong>Admin Unlock</strong> to access every path.</p>
      <p style="color:var(--text-dim);font-size:0.85rem;margin-top:6px;">Current path: <strong style="color:var(--gold);">${state.path.tier}</strong> · Admin: <strong style="color:var(--gold);">${state.path.admin ? "ON" : "OFF"}</strong></p>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-primary" onclick="enableAdminPath()">🔓 Admin Unlock All Paths</button>
        <button class="btn-ghost" onclick="setPathTier('Mortal')">Set Mortal</button>
      </div>
    </div>
    <div class="grid-3">
      ${tiers.map(t => `
        <div class="card" style="position:relative;${t.recommended?'border-color:var(--gold);':''}">
          ${t.recommended?'<div class="badge badge-gold" style="position:absolute;top:12px;right:12px;">RECOMMENDED</div>':''}
          <h3 class="card-title" style="color:var(--gold);">${t.name}</h3>
          <div style="font-size:2rem;font-weight:700;margin:8px 0;">${t.price}</div>
          <div style="color:var(--text-dim);font-size:0.85rem;margin-bottom:12px;">${t.period}</div>
          <ul style="color:var(--text-muted);padding-left:18px;margin-bottom:16px;">
            ${t.features.map(f=>`<li>${f}</li>`).join("")}
          </ul>
          <button class="${state.path.tier===t.key?'btn-primary':'btn-ghost'}" style="width:100%;" onclick="setPathTier('${t.key}')">
            ${state.path.tier===t.key?'Current Path':'Use This Path (Free Local)'}
          </button>
        </div>
      `).join("")}
    </div>
    <div class="card" style="margin-top:16px;">
      <p style="color:var(--text-dim);font-size:0.85rem;">Note: Features like lineage sim, combat, hierarchy, and story are already available in this build without paying. Ascend buttons do not charge money.</p>
    </div>
  `;
}

// ========== ACTIONS ==========

function createWorld() {
  state.world = generateWorld();
  state.events = state.events || [];
  try { if (typeof pushNews === 'function') pushNews('World Born', state.world.name + ' enters the chronicle.'); } catch(e) {}
  saveState();
  switchView('world');
  showToast(`World "${state.world.name}" has been born under the Heavenly Dao`);
}

function createCharacter(forcedRealm = null) {
  const char = generateCharacter(forcedRealm);
  state.characters.push(char);
  if (!state.currentCharacterId) state.currentCharacterId = char.id;
  try { if (typeof pushNews === 'function') pushNews('New Cultivator', char.name + ' appears as ' + char.star + ' ' + char.realm); } catch(e) {}
  saveState();
  switchView('character');
  showToast(`${char.name} has entered the world as ${char.star} ${char.realm}`);
}

function selectCharacter(id) {
  state.currentCharacterId = id;
  saveState();
  switchView('character');
  showToast('Cultivator selected as active');
}

function createTechnique() {
  state.techniques.push(generateTechnique());
  saveState();
  switchView('techniques');
  showToast('New technique inscribed into the Dao');
}

function createFlame() {
  const flame = generateFlame();
  state.flames.push(flame);
  state.events = state.events || [];
  state.events.push({ title: "Heavenly Flame Appearance", desc: flame.name + " (Rank " + flame.rank + ") has appeared. Forces across the continent are stirring." });
  if (state.world && state.world.currentEvents) {
    state.world.currentEvents.unshift(flame.name + " has been sensed in the world.");
    state.world.currentEvents = state.world.currentEvents.slice(0, 6);
  }
  saveState();
  switchView('flames');
  showToast('A Heavenly Flame has been discovered! The world reacts...');
}

function createBeast() {
  state.beasts.push(generateBeast());
  saveState();
  switchView('beasts');
  showToast('Magical beast recorded');
}

function createSect() {
  const name = rand(["Burning Heaven Sect", "Void Spirit Gate", "Nine Dragons Pavilion", "Azure Cloud Sect", "Demon Flame Hall", "Heavenly Sword Sect", "Myriad Poison Valley"]);
  const result = document.getElementById('sect-result');
  if (result) {
    result.innerHTML = `
      <div class="ai-output">
        <h4>${name}</h4>
        <p><strong>Rank:</strong> Small Sect → potential to grow into Ancient Sect</p>
        <p><strong>Territory:</strong> Innerland border</p>
        <p><strong>Founder:</strong> ${generateName()}</p>
        <p><strong>Inherited Technique:</strong> ${generateTechnique().name}</p>
        <p><strong>Current Disciples:</strong> ${randInt(20, 120)}</p>
        <p style="margin-top:10px;color:var(--text-muted);">The sect has been established. Its future depends on your actions and the will of the Heavenly Dao.</p>
      </div>
    `;
  }
  showToast(`${name} founded`);
}

function trainCharacter(deep = false) {
  const char = getActiveChar();
  if (!char) return;
  let mult = deep ? 2.5 : 1;
  // Faction rank bonus
  const rankBonus = { "Outer Disciple": 1.05, "Inner Disciple": 1.12, "Core Disciple": 1.2, "Elder Candidate": 1.28, "Elder": 1.35 };
  if (char.factionRank && rankBonus[char.factionRank]) mult *= rankBonus[char.factionRank];
  // Region mild bonus
  const region = state.currentRegion || "Outerland";
  if (region === "Innerland") mult *= 1.08;
  if (region === "Mainland") mult *= 1.15;
  if (region === "Central Land") mult *= 1.22;
  const risk = deep && Math.random() < 0.15;
  const gain = Math.floor(randInt(80, 420) * mult);
  char.douQi = (char.douQi || 100) + gain;
  char.purity = Math.min(100, (char.purity || 40) + randInt(1, 5));
  char.control = Math.min(100, (char.control || 30) + randInt(1, 4));
  char.experience = Math.min(100, (char.experience || 20) + randInt(2, 8));
  char.comprehension = Math.min(100, (char.comprehension || 20) + randInt(0, 3));
  if (risk) {
    char.foundation = Math.max(10, (char.foundation || 50) - randInt(5, 12));
    showToast(`Deep meditation backfired! Foundation damaged. Dou Qi +${gain}`);
  } else {
    showToast(`${char.name} trained in ${region}. Dou Qi +${gain}`);
  }
  saveState();
  switchView('cultivation');
}

function attemptBreakthrough() {
  const char = getActiveChar();
  if (!char) return;
  const rankIndex = DOU_QI_RANKS.findIndex(r => r.name === char.realm);
  const starIndex = STARS.indexOf(char.star);

  // Higher ranks are harder
  let successChance = 0.35 - (rankIndex * 0.025);
  if (char.talent === 'Against the Heavens') successChance += 0.35;
  else if (char.talent === 'Monster') successChance += 0.25;
  else if (char.talent === 'Genius') successChance += 0.15;
  else if (char.talent === 'Excellent') successChance += 0.08;
  successChance += (char.foundation / 200) + (char.comprehension / 250) + ((char.purity || 50) / 400);
  successChance = Math.max(0.08, Math.min(0.92, successChance));

  // Need minimum foundation for high ranks
  if (rankIndex >= 6 && char.foundation < 40) {
    showToast("Foundation too weak for this level. Train more before attempting.");
    return;
  }

  const success = Math.random() < successChance;

  if (success) {
    if (starIndex < STARS.length - 1) {
      char.star = STARS[starIndex + 1];
    } else if (rankIndex < DOU_QI_RANKS.length - 1) {
      char.realm = DOU_QI_RANKS[rankIndex + 1].name;
      char.star = '1-Star';
      char.reputation = char.reputation === "Unknown" ? "Rising star" : char.reputation;
    } else {
      showToast(`Already at the peak of ${char.realm}. The Dou Di realm remains sealed by the Heavenly Dao.`);
      return;
    }
    char.foundation = Math.max(20, char.foundation - randInt(6, 15));
    char.douQi = Math.floor((char.douQi || 100) * 1.18);
    char.experience = Math.min(100, (char.experience || 30) + randInt(3, 8));
    try { pushNews('Breakthrough', char.name + ' reached ' + char.star + ' ' + char.realm); } catch(e) {}
    showToast(`Breakthrough successful! ${char.name} is now ${char.star} ${char.realm}!`);
  } else {
    char.foundation = Math.max(5, char.foundation - randInt(5, 12));
    char.douQi = Math.max(50, Math.floor((char.douQi || 100) * 0.97));
    showToast(`Breakthrough failed. Foundation damaged and Dou Qi slightly lost. The Heavenly Dao is unmoved.`);
  }
  saveState();
  switchView('cultivation');
}

function refinePill() {
  const result = document.getElementById('alchemy-result');
  const pill = rand(PILL_LIST);
  const success = Math.random() > 0.2;
  if (!state.pills) state.pills = [];
  if (result) {
    if (success) {
      state.pills.push(pill);
      result.innerHTML = `
        <div class="ai-output">
          <h4>Refinement Success: ${pill.name}</h4>
          <p><strong>Grade:</strong> ${pill.grade}</p>
          <p><strong>Effect:</strong> ${pill.effect}</p>
          <p style="margin-top:10px;color:var(--text-muted);">The pill tribulation was ${rand(['mild', 'fierce', 'almost catastrophic'])}. The alchemist succeeded through skill and luck.</p>
        </div>
      `;
      showToast(`${pill.name} successfully refined`);
    } else {
      result.innerHTML = `
        <div class="ai-output" style="border-left-color:var(--danger);">
          <h4 style="color:var(--danger);">Refinement Failed</h4>
          <p>The cauldron exploded. Materials were lost. The Heavenly Dao does not reward the unprepared.</p>
        </div>
      `;
      showToast('Pill refinement failed!');
    }
  }
  saveState();
}

function simulateBattle() {
  const id1 = document.getElementById('fighter1')?.value;
  const id2 = document.getElementById('fighter2')?.value;
  const f1 = state.characters.find(c => c.id == id1);
  const f2 = state.characters.find(c => c.id == id2);
  if (!f1 || !f2 || f1.id === f2.id) {
    showToast('Select two different fighters');
    return;
  }
  const result = generateBattleResult(f1, f2);

  // Generate round-by-round log
  const rounds = [];
  const maxRounds = result.intensity === "Overwhelming" ? randInt(2, 4) : randInt(5, 9);
  for (let i = 1; i <= maxRounds; i++) {
    const attacker = Math.random() > 0.5 ? f1.name : f2.name;
    const defender = attacker === f1.name ? f2.name : f1.name;
    const actions = [
      `${attacker} unleashed a fierce Dou Qi blast, forcing ${defender} back.`,
      `${attacker} closed the distance with a movement technique and struck with their weapon.`,
      `${defender} blocked just in time, sparks flying as Dou Qi collided.`,
      `A critical opening appeared! ${attacker} seized it and landed a heavy blow.`,
      `${attacker}'s technique filled the sky with destructive energy.`,
      `${defender} countered with a desperate secret art, turning the momentum briefly.`,
      `The ground cracked under the pressure of their colliding auras.`
    ];
    rounds.push(`<div class="round"><strong>Round ${i}:</strong> ${actions[Math.floor(Math.random()*actions.length)]}</div>`);
  }
  rounds.push(`<div class="win">Final Blow: ${result.winner} overwhelmed ${result.loser} and claimed victory.</div>`);

  const winner = state.characters.find(c => c.name === result.winner);
  const loser = state.characters.find(c => c.name === result.loser);
  if (winner) {
    winner.experience = Math.min(100, (winner.experience || 50) + randInt(4, 14));
    winner.kills = (winner.kills || 0) + (Math.random() > 0.6 ? 1 : 0);
    winner.douQi = (winner.douQi || 0) + randInt(80, 280);
    winner.comprehension = Math.min(100, (winner.comprehension || 20) + randInt(0, 2));
  }
  if (loser && Math.random() > 0.55) {
    loser.foundation = Math.max(5, (loser.foundation || 40) - randInt(2, 7));
    loser.douQi = Math.max(30, Math.floor((loser.douQi || 100) * 0.92));
  }
  const el = document.getElementById('battle-result');
  if (el) {
    el.innerHTML = `
      <div class="ai-output">
        <h4>Battle Result — ${result.intensity}</h4>
        <p>${result.description}</p>
        <div class="battle-log">${rounds.join('')}</div>
        <p style="margin-top:14px;"><strong>Winner:</strong> <span style="color:var(--gold);">${result.winner}</span> (${result.winnerRealm})</p>
        <p><strong>Loser:</strong> ${result.loser} (${result.loserRealm})</p>
        <p style="margin-top:12px;">${result.reason}</p>
        <p style="margin-top:12px;color:var(--text-muted);"><em>Impact:</em> ${result.impact}</p>
        <p style="margin-top:8px;color:var(--text-dim);font-size:0.85rem;">Attribute context: ${f1.attribute} vs ${f2.attribute} (advantage factor applied in spirit of the Heavenly Dao).</p>
      </div>
    `;
  }
  // Attribute advantage subtle effect on winner rewards
  try {
    const adv = getAttrAdvantage(f1.attribute, f2.attribute);
    const w = state.characters.find(x => x.name === result.winner);
    if (w && adv > 1) w.experience = Math.min(100, (w.experience||50)+2);
  } catch(e) {}
  saveState();
  showToast('Battle concluded under the Heavenly Dao');
}

function generateChapter() {
  if (!state.world) { showToast('Create a world first'); return; }
  let char = getActiveChar();
  if (!char) {
    char = generateCharacter();
    state.characters.push(char);
    state.currentCharacterId = char.id;
  }
  if (!char.storyMemory) {
    char.storyMemory = { rival: null, debts: [], victories: [], motifs: [], objective: null, heat: 0 };
  }
  const mem = char.storyMemory;
  if (!mem.rival) mem.rival = { name: generateName(), attitude: "competitive" };
  if (!mem.objective) {
    const objectives = [
      "secure cultivation resources without exposing the full hand",
      "collect information on a ranked flame fluctuation",
      "settle a face debt before it grows into clan war",
      "convert alchemy skill into money and allies",
      "survive a higher-region trial and return stronger",
      "strengthen the clan vault and protect the next generation",
      "raise an heir capable of carrying the blood name"
    ];
    mem.objective = objectives[Math.floor(Math.random() * objectives.length)];
  }

  const region = state.currentRegion || "Outerland";
  const world = state.world;
  const n = state.storyChapters.length + 1;
  const aff = (char.affiliations && char.affiliations[0]) ? char.affiliations[0].name : null;
  const recent = (state.events && state.events.length) ? state.events[state.events.length - 1] : null;
  const prev = state.storyChapters.length ? state.storyChapters[state.storyChapters.length - 1] : null;
  const tone = (state.meta && state.meta.tone) || "heroic";
  const mode = state.chapterMode || "standard";
  const weather = (state.calendar && state.calendar.weather) || "Clear";

  // BTTH beat machine: pressure -> method -> stage -> clash -> payoff -> seed
  const pressures = [
    "Clan and street gossip cut sharper than blades; without a visible result, dignity would keep bleeding.",
    "A rival force raised prices and barriers, turning ordinary supplies into strategic weapons.",
    "A public slight forced a choice: endure and plan, or explode early and die uselessly.",
    "Time itself became an enemy. Bottlenecks do not wait for perfect preparation."
  ];
  const methods = [
    "Using careful alchemy and misdirection, " + char.name + " created room to breathe.",
    "A fragment of higher technique was tempered in secret, not displayed.",
    "Information was bought, stolen, or traded — because blind courage is just another corpse style.",
    "Under pressure, " + char.name + " refined control of " + char.attribute + " Dou Qi rather than gambling on a reckless breakthrough."
  ];
  const stages = [
    "An auction hall became a battlefield of smiles.",
    "A roadside confrontation drew spectators who wanted drama more than truth.",
    "A sect courtyard turned into a stage where status was currency.",
    "A ruin entrance gathered geniuses like crows around a possible inheritance."
  ];
  const clashes = [
    "Words failed. Dou Qi answered.",
    mem.rival.name + " appeared at the worst perfect moment, turning pressure into spectacle.",
    "A stronger expert tested the waters with a single suppressing palm.",
    "Hidden identities strained; one mistake would collapse the entire act."
  ];
  const payoffs = [
    "The immediate goal was met — not cleanly, but clean enough to change the next negotiation.",
    "Resources changed hands. Reputation shifted by a measurable degree.",
    "A small victory arrived with a large shadow attached.",
    "The crowd learned a new name, whether " + char.name + " wanted that or not."
  ];
  const seeds = [
    "A greater force marked the event for later collection.",
    "A favor and a hatred were both born in the same hour.",
    "Coordinates, names, and debts pointed toward the next region.",
    "The Heavenly Dao remained silent; people did not."
  ];

  let content = "";
  content += "In " + world.name + " — " + region + " — " + char.name + " pursued a concrete aim: " + mem.objective + ".\n\n";
  content += pressures[Math.floor(Math.random()*pressures.length)] + "\n\n";
  if (prev) content += "After «" + prev.title.replace(/^Chapter \d+:\s*/, "") + "», the board had already changed.\n\n";
  content += methods[Math.floor(Math.random()*methods.length)] + "\n\n";
  content += stages[Math.floor(Math.random()*stages.length)] + " " + clashes[Math.floor(Math.random()*clashes.length)] + "\n\n";
  if (aff) content += "Acting under " + aff + (char.factionRank ? " as " + char.factionRank : "") + " made every move semi-public.\n\n";
  if (recent && Math.random() > 0.4) content += "Outside talk still carried recent fire: " + recent.desc + "\n\n";
  content += "At " + char.star + " " + char.realm + ", talent rated " + char.talent + ", " + char.name + " could not afford empty pride.\n\n";
  content += payoffs[Math.floor(Math.random()*payoffs.length)] + "\n\n";
  content += seeds[Math.floor(Math.random()*seeds.length)];
  if (mode === "epic") content += "\n\nIn the wider chronicle, this was only a hinge chapter: the kind later disciples would summarize in one sentence while missing the blood it cost.";
  if (tone === "dark") content += "\n\nNo hymn followed. Only calculation.";
  if (tone === "scheming") content += "\n\nThe smile that ended the day was not a kind one.";

  const titles = ["Face and Fire", "Auction Under Knives", "A Measured Counter", "Debt on the Road", "Stage of Geniuses", "Pay the Price Later", "Name in the Crowd", "Hidden Hand"];
  const title = "Chapter " + n + ": " + titles[Math.floor(Math.random()*titles.length)];

  char.experience = Math.min(100, (char.experience||20) + randInt(2,6));
  char.comprehension = Math.min(100, (char.comprehension||20) + randInt(1,3));
  mem.heat = Math.min(10, (mem.heat||0) + 1);
  if (mem.heat >= 5 && Math.random() > 0.5) {
    mem.objective = "convert recent fame into real foundation before stronger hunters arrive";
    mem.heat = 0;
  }

  state.storyChapters.push({ title, content, tags: [region, "btth-structure", tone] });
  try { bumpStat("chapters", 1); } catch(e) {}
  saveState();
  switchView("story");
  showToast(title);
}

function triggerWorldEvent() {
  if (!state.world) {
    showToast('Create a world first');
    return;
  }
  const event = generateWorldEvent(state.world);
  state.events = state.events || [];
  state.events.push(event);
  if (state.world.currentEvents) {
    state.world.currentEvents.unshift(event.desc);
    state.world.currentEvents = state.world.currentEvents.slice(0, 5);
  }
  saveState();
  switchView('world');
  showToast(`Heavenly Dao Event: ${event.title}`);
}


function exportNovel() {
  if (!state.storyChapters.length) {
    showToast("No chapters to export");
    return;
  }
  let text = "HEAVENLY DAO CHRONICLES\n";
  text += (state.world ? state.world.name : "Unknown World") + "\n";
  text += "=".repeat(60) + "\n\n";
  if (state.world) {
    text += "WORLD SUMMARY\n";
    text += "Era: " + state.world.currentEra + "\n";
    text += "Laws: " + state.world.heavenlyLaws + "\n\n";
  }
  if (state.characters.length) {
    text += "MAIN CHARACTERS\n";
    state.characters.forEach(c => {
      text += "- " + c.name + " | " + c.star + " " + c.realm + " | Talent: " + c.talent + "\n";
    });
    text += "\n";
  }
  text += "=".repeat(60) + "\n\n";
  state.storyChapters.forEach(ch => {
    text += ch.title + "\n\n" + ch.content + "\n\n" + "-".repeat(40) + "\n\n";
  });
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "heavenly-dao-novel-" + Date.now() + ".txt";
  a.click();
  showToast("Novel exported with world & character summary");
}

function findTreasure() {
  const char = getActiveChar();
  if (!char) {
    showToast("Select a character first");
    return;
  }
  if (!char.inventory) char.inventory = [];
  const item = generateItem();
  char.inventory.push(item);
  saveState();
  switchView("character");
  showToast("Found: " + item.name + " (" + item.rank + " " + item.type + ")");
}



function createDetailedSect() {
  if (!state.sects) state.sects = [];
  state.sects.push(generateDetailedSect());
  saveState();
  switchView('factions');
  showToast('New Sect founded');
}
function createDetailedClan() {
  if (!state.clans) state.clans = [];
  state.clans.push(generateDetailedClan());
  saveState();
  switchView('factions');
  showToast('New Clan established');
}
function createEmpire() {
  if (!state.empires) state.empires = [];
  state.empires.push(generateEmpire());
  saveState();
  switchView('factions');
  showToast('Empire risen');
}
function createAcademy() {
  if (!state.academies) state.academies = [];
  state.academies.push(generateAcademy());
  saveState();
  switchView('factions');
  showToast('Academy established');
}
function createAuction() {
  if (!state.auctions) state.auctions = [];
  state.auctions.push(generateAuctionHouse());
  saveState();
  switchView('factions');
  showToast('Auction House opened');
}
function createPillTower() {
  if (!state.pillTowers) state.pillTowers = [];
  state.pillTowers.push(generatePillTower());
  saveState();
  switchView('factions');
  showToast('Pill Tower raised');
}



function joinFaction(type) {
  const char = getActiveChar();
  if (!char) { showToast("Select a character first"); return; }
  let list = [];
  if (type === "sect") list = state.sects || [];
  if (type === "academy") list = state.academies || [];
  if (type === "clan") list = state.clans || [];
  if (!list.length) {
    showToast("Create a " + type + " first");
    return;
  }
  const target = list[Math.floor(Math.random() * list.length)];
  if (!char.affiliations) char.affiliations = [];
  char.affiliations.push({ type, name: target.name });
  saveState();
  showToast(char.name + " has joined " + target.name);
  switchView("character");
}

function triggerFactionConflict() {
  const all = [];
  (state.sects || []).forEach(s => all.push({name: s.name, type: "Sect"}));
  (state.clans || []).forEach(c => all.push({name: c.name, type: "Clan"}));
  (state.empires || []).forEach(e => all.push({name: e.name, type: "Empire"}));
  if (all.length < 2) {
    showToast("Need at least two factions to trigger conflict");
    return;
  }
  const a = all[Math.floor(Math.random() * all.length)];
  let b = all[Math.floor(Math.random() * all.length)];
  while (b.name === a.name) b = all[Math.floor(Math.random() * all.length)];
  const outcomes = [
    a.name + " achieved a crushing victory over " + b.name + ". Territory changed hands.",
    "The war between " + a.name + " and " + b.name + " ended in a bloody stalemate.",
    b.name + " used a secret technique and forced " + a.name + " to retreat.",
    "An ancient expert intervened and stopped the conflict between " + a.name + " and " + b.name + ".",
    "Both sides suffered heavy losses. The Heavenly Dao remains silent."
  ];
  const result = outcomes[Math.floor(Math.random() * outcomes.length)];
  state.events = state.events || [];
  state.events.push({ title: "Faction War", desc: result });
  if (state.world && state.world.currentEvents) {
    state.world.currentEvents.unshift(result);
    state.world.currentEvents = state.world.currentEvents.slice(0, 6);
  }
  saveState();
  switchView("world");
  showToast("Faction conflict erupted!");
}



function generateGeniusRanking() {
  const list = [];
  // Include player characters
  state.characters.forEach(c => {
    list.push({ name: c.name, realm: c.star + " " + c.realm, talent: c.talent, source: "Your Character" });
  });
  // Generate some NPC geniuses
  for (let i = 0; i < 8; i++) {
    const r = DOU_QI_RANKS[Math.floor(Math.random() * 6) + 2]; // Dou Ling to Dou Zong range mostly
    list.push({
      name: generateName(),
      realm: STARS[Math.floor(Math.random()*8)] + " " + r.name,
      talent: ["Genius", "Monster", "Against the Heavens", "Excellent"][Math.floor(Math.random()*4)],
      source: ["Ancient Clan", "Major Sect", "Academy", "Empire", "Independent"][Math.floor(Math.random()*5)]
    });
  }
  // Sort roughly by talent then random
  const talentScore = { "Against the Heavens": 5, "Monster": 4, "Genius": 3, "Excellent": 2, "Good": 1, "Ordinary": 0 };
  list.sort((a, b) => (talentScore[b.talent] || 0) - (talentScore[a.talent] || 0) || Math.random() - 0.5);
  return list.slice(0, 12);
}

function showGeniusRanking() {
  const ranking = generateGeniusRanking();
  const html = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Young Genius Ranking</h3>
        <button class="btn-ghost" onclick="switchView('dashboard')">Back</button>
      </div>
      <p style="color:var(--text-muted);margin-bottom:16px;">The most outstanding young cultivators currently active on the continent.</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${ranking.map((g, i) => `
          <div style="display:flex;align-items:center;gap:14px;padding:12px 14px;background:var(--bg-deep);border-radius:10px;border:1px solid var(--border);">
            <div style="font-family:var(--font-display);color:var(--gold);font-size:1.2rem;width:32px;">#${i+1}</div>
            <div style="flex:1;">
              <strong style="color:var(--text);">${g.name}</strong>
              <div style="font-size:0.82rem;color:var(--text-muted);">${g.realm} · ${g.source}</div>
            </div>
            <span class="badge badge-purple">${g.talent}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
  document.getElementById('breadcrumb').textContent = 'Genius Ranking';
}

function dailyOpportunity() {
  const char = getActiveChar();
  if (!char) { showToast("Create a character first"); return; }
  const region = state.currentRegion || "Outerland";
  const mult = region === "Central Land" ? 1.6 : region === "Mainland" ? 1.35 : region === "Innerland" ? 1.15 : 1;
  const opportunities = [
    { title: "Ancient Remnant", desc: "You discovered a broken jade slip containing part of a high-rank technique.", effect: () => { state.techniques.push(generateTechnique()); } },
    { title: "Beast Core", desc: "After a hard fight you obtained a high-quality beast core.", effect: () => { char.douQi += Math.floor(randInt(200, 800)*mult); char.experience = Math.min(100, (char.experience||20) + Math.floor(5*mult)); } },
    { title: "Pill Reward", desc: "An elder rewarded you with a rare pill for your recent performance.", effect: () => { if (!state.pills) state.pills = []; state.pills.push(PILL_LIST[Math.floor(Math.random()*PILL_LIST.length)]); } },
    { title: "Sudden Enlightenment", desc: "While meditating, a flash of insight improved your comprehension.", effect: () => { char.comprehension = Math.min(100, (char.comprehension||20) + randInt(3, 9)); } },
    { title: "Faction Invitation", desc: "A major force has taken notice of your talent.", effect: () => { if (!char.affiliations) char.affiliations = []; char.affiliations.push({ type: "Invitation", name: "Mysterious Faction" }); } },
    { title: "Hidden Cache", desc: "You found a small storage ring left by a fallen cultivator.", effect: () => { if (!char.inventory) char.inventory = []; char.inventory.push(generateItem()); char.inventory.push(generateItem()); } },
    { title: "Sparring Match", desc: "A traveling expert sparred with you. Both sides benefited.", effect: () => { char.experience = Math.min(100, (char.experience||20) + randInt(4, 10)); char.control = Math.min(100, (char.control||30) + randInt(1, 4)); } },
    { title: "Quiet Day", desc: "The day passed quietly. Sometimes the Heavenly Dao gives no gifts.", effect: () => {} }
  ];
  const op = opportunities[Math.floor(Math.random() * opportunities.length)];
  op.effect();
  saveState();
  showToast("[" + region + "] " + op.title + ": " + op.desc);
  switchView('dashboard');
}

function assignTechniqueToChar() {
  const char = getActiveChar();
  if (!char) { showToast("Select a character first"); return; }
  if (!state.techniques.length) { showToast("Generate a technique first"); return; }
  const tech = state.techniques[Math.floor(Math.random() * state.techniques.length)];
  char.technique = tech.name;
  saveState();
  showToast(char.name + " has learned: " + tech.name);
  switchView('character');
}



function renderMap() {
  if (!state.world) {
    return `<div class="card"><div class="empty-state"><div class="icon">🗺️</div><p>Create a world first to view the map.</p><button class="btn-primary" style="margin-top:12px;" onclick="switchView('world')">Create World</button></div></div>`;
  }
  if (!state.currentRegion) state.currentRegion = "Outerland";
  const regions = [
    { key: "Outerland", name: "Outerland", desc: state.world.regions.outerland, danger: "Low" },
    { key: "Innerland", name: "Innerland", desc: state.world.regions.innerland, danger: "Medium" },
    { key: "Mainland", name: "Mainland", desc: state.world.regions.mainland, danger: "High" },
    { key: "Central Land", name: "Central Land", desc: state.world.regions.central, danger: "Extreme" }
  ];
  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Continent Map — ${state.world.name}</h3>
        <span class="badge badge-gold">Current: ${state.currentRegion}</span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:8px;">Travel between regions. Higher regions have greater danger and greater opportunity.</p>
      <div class="region-map">
        ${regions.map(r => `
          <div class="region-card ${state.currentRegion === r.key ? 'active-region' : ''}" onclick="travelTo('${r.key}')">
            <div class="region-name">${r.name}</div>
            <div class="region-desc">${r.desc}</div>
            <div style="margin-top:10px;"><span class="badge ${r.danger==='Low'?'badge-green':r.danger==='Medium'?'badge-blue':r.danger==='High'?'badge-purple':'badge-red'}">${r.danger} Danger</span></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card">
      <h3 class="card-title" style="margin-bottom:12px;">Region Control & Threat</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;">Global Threat: <strong style="color:var(--gold);">${(state.globalThreat||1)}</strong></p>
      <div style="margin-top:10px;">
        ${Object.keys(state.regionControl||{}).map(r => `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.88rem;"><strong style="color:var(--gold);">${r}</strong> — ${(state.regionControl||{})[r]}</div>`).join("") || `<p style="color:var(--text-dim)">Control data initializing...</p>`}
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-ghost" onclick="shiftRegionControl()">Shift Control</button>
        <button class="btn-ghost" onclick="travelAmbush()">Ambush Check</button>
      </div>
    </div>
  `;
}

function travelTo(region) {
  if (!state.world) return;
  const old = state.currentRegion || "Outerland";
  if (old === region) {
    showToast("Already in " + region);
    return;
  }
  state.currentRegion = region;
  // Small chance of event on travel
  if (Math.random() > 0.4) {
    const events = [
      "On the road you encountered roaming magical beasts and tempered your combat sense.",
      "A mysterious cultivator exchanged a few words with you before vanishing into the void.",
      "You found a rare herb that slightly improves Dou Qi recovery.",
      "Rumors of a nearby secret realm reached your ears.",
      "Bandits blocked the path. After a short fight, you continued onward.",
      "An ancient stele by the roadside revealed a fragment of cultivation insight.",
      "The journey was quiet. The Heavenly Dao remained silent."
    ];
    const ev = events[Math.floor(Math.random()*events.length)];
    state.events = state.events || [];
    state.events.push({ title: "Travel Event", desc: ev });
    const char = getActiveChar();
    if (char && ev.includes("insight")) {
      char.comprehension = Math.min(100, (char.comprehension||20) + randInt(1, 3));
    }
    if (char && ev.includes("combat")) {
      char.experience = Math.min(100, (char.experience||20) + randInt(1, 4));
    }
    showToast("Traveled to " + region + " — " + ev);
  } else {
    showToast("Traveled to " + region);
  }
  saveState();
  switchView('map');
}



function doFactionMission() {
  const char = getActiveChar();
  if (!char) { showToast("Select a character first"); return; }
  if (!char.affiliations || !char.affiliations.length) {
    showToast("Join a sect or academy first");
    return;
  }
  const aff = char.affiliations[0];
  const results = [
    { text: "Mission completed perfectly. Reputation within the faction increased.", exp: 6, qi: 150 },
    { text: "Mission completed with some difficulty. You gained experience.", exp: 4, qi: 80 },
    { text: "Mission nearly failed, but you survived and learned something.", exp: 2, qi: 30 },
    { text: "Outstanding performance! An elder took notice of your potential.", exp: 8, qi: 220 }
  ];
  const r = results[Math.floor(Math.random() * results.length)];
  char.experience = Math.min(100, (char.experience || 20) + r.exp);
  char.douQi = (char.douQi || 100) + r.qi;
  gainContribution(randInt(8, 20));
  // Chance to raise internal rank
  if (!char.factionRank) char.factionRank = "Outer Disciple";
  if (Math.random() > 0.7) {
    const ranks = ["Outer Disciple", "Inner Disciple", "Core Disciple", "Elder Candidate", "Elder"];
    const idx = ranks.indexOf(char.factionRank);
    if (idx < ranks.length - 1) {
      char.factionRank = ranks[idx + 1];
      showToast(r.text + " Promoted to " + char.factionRank + "!");
    } else {
      showToast(r.text);
    }
  } else {
    showToast(r.text);
  }
  saveState();
  switchView('character');
}



function deleteCharacter() {
  const char = getActiveChar();
  if (!char) { showToast("No active character"); return; }
  if (!confirm("Delete " + char.name + "? This cannot be undone.")) return;
  state.characters = state.characters.filter(c => c.id !== char.id);
  state.currentCharacterId = state.characters.length ? state.characters[0].id : null;
  saveState();
  switchView('character');
  showToast(char.name + " has been removed from the records");
}

function renameCharacter() {
  const char = getActiveChar();
  if (!char) { showToast("No active character"); return; }
  const newName = prompt("New name for " + char.name + ":", char.name);
  if (newName && newName.trim()) {
    char.name = newName.trim();
    saveState();
    switchView('character');
    showToast("Name changed to " + char.name);
  }
}

function clearAllStories() {
  if (!state.storyChapters.length) { showToast("No chapters"); return; }
  if (!confirm("Delete all " + state.storyChapters.length + " chapters?")) return;
  state.storyChapters = [];
  saveState();
  switchView('story');
  showToast("All chapters cleared");
}



function exploreSecretRealm() {
  if (!state.world) { showToast("Create a world first"); return; }
  const char = getActiveChar();
  const realms = [
    { name: "Fallen Saint Tomb", danger: "Extreme", reward: "high" },
    { name: "Ancient Battle Ruins", danger: "High", reward: "medium" },
    { name: "Hidden Flame Cave", danger: "High", reward: "flame" },
    { name: "Beast King Territory", danger: "Medium", reward: "beast" },
    { name: "Lost Academy Grounds", danger: "Medium", reward: "technique" },
    { name: "Abandoned Pill Valley", danger: "Low", reward: "pill" }
  ];
  const realm = realms[Math.floor(Math.random() * realms.length)];
  let resultText = "You entered " + realm.name + " (" + realm.danger + " danger).\\n\\n";
  const success = Math.random() > (realm.danger === "Extreme" ? 0.55 : realm.danger === "High" ? 0.35 : 0.2);

  if (success) {
    resultText += "After overcoming the trials, you obtained a reward.\\n";
    if (realm.reward === "flame" && Math.random() > 0.5) {
      const f = generateFlame();
      state.flames.push(f);
      resultText += "Discovered: " + f.name + "!";
    } else if (realm.reward === "technique") {
      const t = generateTechnique();
      state.techniques.push(t);
      resultText += "Obtained technique: " + t.name;
    } else if (realm.reward === "pill") {
      if (!state.pills) state.pills = [];
      const p = PILL_LIST[Math.floor(Math.random()*PILL_LIST.length)];
      state.pills.push(p);
      resultText += "Found pill: " + p.name;
    } else if (realm.reward === "beast") {
      state.beasts.push(generateBeast());
      resultText += "Subdued or recorded a magical beast.";
    } else {
      if (char) {
        char.douQi = (char.douQi || 100) + randInt(300, 1200);
        char.experience = Math.min(100, (char.experience||20) + randInt(5, 12));
        resultText += "Gained substantial Dou Qi and combat experience.";
      } else {
        resultText += "Found ancient resources.";
      }
    }
    showToast("Secret Realm success: " + realm.name);
  } else {
    resultText += "The dangers were too great. You barely escaped with your life.";
    if (char) {
      char.foundation = Math.max(5, (char.foundation||50) - randInt(3, 8));
      resultText += " Foundation was slightly damaged.";
    }
    showToast("Barely escaped " + realm.name);
  }

  state.events = state.events || [];
  state.events.push({ title: "Secret Realm: " + realm.name, desc: resultText.replace(/\\n/g, " ") });
  saveState();

  // Show result in a simple way via toast + switch to world
  alert(resultText.replace(/\\n/g, "\\n"));
  switchView('world');
}



function runAuction() {
  if (!state.auctions || !state.auctions.length) {
    // auto create one
    if (!state.auctions) state.auctions = [];
    state.auctions.push(generateAuctionHouse());
  }
  const items = [
    generateItem(), generateItem(), generateTechnique(), 
    { name: "Mysterious Jade Slip", type: "Scroll", rank: "Precious", description: "Contains a fragment of an ancient art." },
    { name: "Beast Core (High)", type: "Material", rank: "Rare", description: "Can boost cultivation when refined." }
  ];
  const item = items[Math.floor(Math.random() * items.length)];
  const price = randInt(50, 500) * 10;
  const won = Math.random() > 0.4;
  let msg = "Auction item: " + (item.name || "Unknown") + "\\nEstimated value: " + price + " gold\\n\\n";
  if (won) {
    msg += "You won the bid!";
    const char = getActiveChar();
    if (char) {
      if (!char.inventory) char.inventory = [];
      if (item.name) char.inventory.push(item);
      else char.inventory.push({ name: item.name || "Auction Item", type: item.type || "Treasure", rank: item.rank || "Rare", description: item.description || "" });
    }
    if (item.rank && state.techniques && item.name && item.name.includes === undefined && item.power) {
      state.techniques.push(item);
    }
    showToast("Won auction: " + (item.name || "item"));
  } else {
    msg += "You were outbid by a mysterious expert.";
    showToast("Lost the auction");
  }
  saveState();
  alert(msg);
  switchView('factions');
}


function resetWorld() {
  if (!confirm("Reset ALL world data? Characters, stories, factions will be wiped.")) return;
  state = { ...DEFAULT_STATE, sects:[], clans:[], empires:[], academies:[], auctions:[], pillTowers:[], events:[], pills:[], techniques:[], flames:[], beasts:[], characters:[], storyChapters:[], currentRegion:'Outerland' };
  localStorage.removeItem('heavenlyDaoState');
  saveState();
  switchView('dashboard');
  showToast("The Heavenly Dao has been reset");
}


// ===== ALL-30 SUPPORT SYSTEMS =====

function getAttrAdvantage(a, b) {
  const beat = { Fire:"Wood", Wood:"Earth", Earth:"Water", Water:"Fire", Lightning:"Water", Ice:"Fire", Wind:"Earth", Metal:"Wood", Dark:"Light", Light:"Dark", Poison:"Wood", Soul:"Dark", Blood:"Water", Void:"Soul" };
  if (beat[a] === b) return 1.15;
  if (beat[b] === a) return 0.87;
  return 1;
}

function applyInjury(char, severity) {
  if (!char) return;
  char.injured = Math.min(5, (char.injured || 0) + severity);
  char.foundation = Math.max(5, (char.foundation || 40) - severity * 2);
  showToast(char.name + " is injured (level " + char.injured + ")");
}

function recoverInjury() {
  const char = getActiveChar();
  if (!char || !char.injured) { showToast("No injury to recover"); return; }
  if (state.pills && state.pills.length) {
    state.pills.pop();
    char.injured = Math.max(0, char.injured - 2);
    showToast("Used a pill. Injury now " + char.injured);
  } else {
    char.injured = Math.max(0, char.injured - 1);
    char.douQi = Math.max(50, Math.floor((char.douQi||100)*0.95));
    showToast("Natural recovery. Injury now " + char.injured + " (Dou Qi spent)");
  }
  saveState();
  switchView('cultivation');
}

function gainContribution(amount) {
  const char = getActiveChar();
  if (!char) return;
  char.contribution = (char.contribution || 0) + amount;
}

function factionShop() {
  const char = getActiveChar();
  if (!char) { showToast("Select a character"); return; }
  if (!char.affiliations || !char.affiliations.length) { showToast("Join a faction first"); return; }
  const cost = 30;
  if ((char.contribution || 0) < cost) {
    showToast("Need " + cost + " contribution (have " + (char.contribution||0) + "). Do faction missions.");
    return;
  }
  char.contribution -= cost;
  const rewards = ["pill", "item", "qi", "insight"];
  const r = rewards[Math.floor(Math.random()*rewards.length)];
  if (r === "pill") {
    if (!state.pills) state.pills = [];
    state.pills.push(PILL_LIST[Math.floor(Math.random()*PILL_LIST.length)]);
    showToast("Shop: obtained a pill");
  } else if (r === "item") {
    if (!char.inventory) char.inventory = [];
    char.inventory.push(generateItem());
    showToast("Shop: obtained an item");
  } else if (r === "qi") {
    char.douQi = (char.douQi||100) + randInt(200, 600);
    showToast("Shop: Dou Qi boost");
  } else {
    char.comprehension = Math.min(100, (char.comprehension||20)+randInt(2,5));
    showToast("Shop: comprehension insight");
  }
  saveState();
  switchView('character');
}

function awakenBloodline() {
  const char = getActiveChar();
  if (!char) return;
  if (char.bloodlineAwakened) { showToast("Bloodline already awakened"); return; }
  if ((char.foundation||0) < 55 || (char.comprehension||0) < 40) {
    showToast("Need stronger foundation & comprehension to awaken bloodline");
    return;
  }
  if (Math.random() > 0.45) {
    char.bloodlineAwakened = true;
    char.douQi = Math.floor((char.douQi||100)*1.2);
    char.talent = char.talent === "Ordinary" ? "Excellent" : (char.talent === "Excellent" ? "Genius" : char.talent);
    showToast("Bloodline awakened! Power surges.");
  } else {
    applyInjury(char, 1);
    showToast("Awakening failed. Injury sustained.");
  }
  saveState();
  switchView('cultivation');
}

function evolvePhysique() {
  const char = getActiveChar();
  if (!char) return;
  const path = ["Ordinary Physique","Tough Physique","Fire Spirit Physique","Heavenly Flame Physique","Ancient Desolate Physique"];
  const idx = path.indexOf(char.physique);
  if (idx >= path.length-1 || idx < 0) {
    // try generic upgrade mark
    if (char.physique.includes("Heavenly") || char.physique.includes("Ancient") || char.physique.includes("Immortal")) {
      showToast("Physique already near peak");
      return;
    }
  }
  if ((char.foundation||0) < 50) { showToast("Foundation too weak to evolve physique"); return; }
  if (idx >= 0 && idx < path.length-1) {
    char.physique = path[idx+1];
  } else {
    char.physique = "Spirit-Tempered " + char.physique;
  }
  char.foundation = Math.max(20, char.foundation - 8);
  showToast("Physique evolved to: " + char.physique);
  saveState();
  switchView('cultivation');
}

function masterTechnique() {
  const char = getActiveChar();
  if (!char || !char.technique) { showToast("Learn a technique first"); return; }
  const levels = ["Learned","Proficient","Perfect"];
  char.techMastery = char.techMastery || "Learned";
  const i = levels.indexOf(char.techMastery);
  if (i >= levels.length-1) { showToast("Technique already Perfect"); return; }
  if ((char.experience||0) < 30 + i*20) { showToast("Not enough combat experience to advance mastery"); return; }
  char.techMastery = levels[i+1];
  char.experience = Math.max(0, char.experience - 15);
  showToast(char.technique + " → " + char.techMastery);
  saveState();
  switchView('character');
}

function renderCodex() {
  const counts = {
    characters: (state.characters||[]).length,
    techniques: (state.techniques||[]).length,
    flames: (state.flames||[]).length,
    beasts: (state.beasts||[]).length,
    sects: (state.sects||[]).length,
    clans: (state.clans||[]).length,
    empires: (state.empires||[]).length,
    academies: (state.academies||[]).length,
    auctions: (state.auctions||[]).length,
    pillTowers: (state.pillTowers||[]).length,
    chapters: (state.storyChapters||[]).length,
    events: (state.events||[]).length
  };
  return `
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header"><h3 class="card-title">World Codex</h3></div>
      <p style="color:var(--text-muted);margin-bottom:16px;">Auto-encyclopedia of everything recorded by the Heavenly Dao.</p>
      <p style="color:var(--text-muted);font-size:0.9rem;">Calendar: Year ${(state.calendar&&state.calendar.year)||1} Month ${(state.calendar&&state.calendar.month)||1} · Weather ${(state.calendar&&state.calendar.weather)||"Clear"} · Threat ${(state.globalThreat||1)}</p>
      <div class="grid-4">
        ${Object.keys(counts).map(k => `
          <div class="stat-box"><div class="label">${k}</div><div class="value">${counts[k]}</div></div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="margin-bottom:20px;">
      <h3 class="card-title" style="margin-bottom:12px;">Characters</h3>
      ${(state.characters||[]).map(ch => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:0.9rem;"><strong style="color:var(--gold);">${ch.name}</strong> — ${ch.star} ${ch.realm} · ${ch.talent} · ${ch.attribute}</div>`).join('') || '<p style="color:var(--text-dim)">None</p>'}
    </div>
    <div class="card" style="margin-bottom:20px;">
      <h3 class="card-title" style="margin-bottom:12px;">Heavenly Flames</h3>
      ${(state.flames||[]).map(f => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:0.9rem;"><strong style="color:var(--red-glow);">${f.name}</strong> — Rank ${f.rank}</div>`).join('') || '<p style="color:var(--text-dim)">None</p>'}
    </div>
    <div class="card">
      <h3 class="card-title" style="margin-bottom:12px;">Legend Timeline</h3>
      ${(state.storyChapters||[]).slice(-15).map(ch => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:0.88rem;color:var(--text-muted);">${ch.title}</div>`).join('') || '<p style="color:var(--text-dim)">No chapters yet</p>'}
    </div>
  `;
}

function regionEncounter() {
  const char = getActiveChar();
  const region = state.currentRegion || "Outerland";
  const danger = { "Outerland": 0.2, "Innerland": 0.35, "Mainland": 0.5, "Central Land": 0.65 }[region] || 0.3;
  const roll = Math.random();
  let msg = "[" + region + "] ";
  if (roll < danger) {
    msg += "Ambush! A hostile cultivator attacked.";
    if (char) {
      if (Math.random() > 0.5) {
        char.experience = Math.min(100, (char.experience||20)+randInt(3,8));
        char.douQi = (char.douQi||100)+randInt(50,200);
        msg += " You won and gained spoils.";
      } else {
        applyInjury(char, 1);
        msg += " You escaped injured.";
      }
    }
  } else if (roll < danger + 0.25) {
    msg += "You found a hidden resource cache.";
    if (char) {
      if (!char.inventory) char.inventory = [];
      char.inventory.push(generateItem());
      char.douQi = (char.douQi||100)+randInt(100,400);
    }
  } else {
    msg += "The area is calm. You observe and cultivate quietly.";
    if (char) char.comprehension = Math.min(100, (char.comprehension||20)+1);
  }
  state.events = state.events || [];
  state.events.push({ title: "Region Encounter", desc: msg });
  saveState();
  showToast(msg);
  switchView('map');
}

function storyChoice(choice) {
  const char = getActiveChar();
  if (!char) return;
  if (choice === 'fight') {
    char.experience = Math.min(100, (char.experience||20)+randInt(4,9));
    if (Math.random()>0.6) applyInjury(char,1);
    showToast("You chose to fight. Strength rises, danger follows.");
  } else if (choice === 'scheme') {
    char.comprehension = Math.min(100, (char.comprehension||20)+randInt(2,5));
    gainContribution(5);
    showToast("You chose to scheme. Insight and contribution gained.");
  } else {
    char.foundation = Math.min(100, (char.foundation||40)+randInt(1,4));
    showToast("You chose patience. Foundation solidifies.");
  }
  // generate a chapter after choice
  generateChapter();
}



// ===== SECOND ALL-30 SYSTEMS =====

function ensureMeta() {
  if (!state.meta) state.meta = { tone: "heroic", season: "Calm Season", danger: 1, tutorialStep: 0 };
  if (!state.saveSlots) state.saveSlots = { 1: null, 2: null, 3: null };
  if (!state.resources) state.resources = { herbs: 0, cores: 0, ores: 0 };
  if (!state.duelLog) state.duelLog = [];
}

function setStoryTone(tone) {
  ensureMeta();
  state.meta.tone = tone;
  saveState();
  showToast("Story tone: " + tone);
}

function advanceSeason() {
  ensureMeta();
  const seasons = ["Calm Season", "Tournament Season", "Beast Tide Season", "Flame Season", "Ruin Season"];
  let i = seasons.indexOf(state.meta.season);
  state.meta.season = seasons[(i + 1) % seasons.length];
  state.meta.danger = state.meta.season.includes("Calm") ? 1 : state.meta.season.includes("Tournament") ? 2 : 3;
  state.events = state.events || [];
  state.events.push({ title: "Season Change", desc: "The world enters " + state.meta.season + "." });
  saveState();
  showToast("Season: " + state.meta.season);
  switchView('world');
}

function gatherResources() {
  const region = state.currentRegion || "Outerland";
  const mult = { Outerland: 1, Innerland: 1.3, Mainland: 1.7, "Central Land": 2.2 }[region] || 1;
  ensureMeta();
  state.resources.herbs += Math.floor(randInt(1, 4) * mult);
  state.resources.cores += Math.floor(randInt(0, 2) * mult);
  state.resources.ores += Math.floor(randInt(0, 3) * mult);
  saveState();
  showToast(`Gathered resources in ${region}: H${state.resources.herbs} C${state.resources.cores} O${state.resources.ores}`);
}

function bindFlameToBody() {
  const char = getActiveChar();
  if (!char) return;
  if (!state.flames || !state.flames.length) { showToast("Discover a Heavenly Flame first"); return; }
  if (char.boundFlame) { showToast("Already bound: " + char.boundFlame); return; }
  if ((char.foundation || 0) < 60) { showToast("Foundation too weak to bind a flame"); return; }
  const flame = state.flames[state.flames.length - 1];
  if (Math.random() > 0.4) {
    char.boundFlame = flame.name;
    char.attribute = "Fire";
    char.douQi = Math.floor((char.douQi || 100) * 1.25);
    char.purity = Math.min(100, (char.purity || 50) + 8);
    showToast("Bound " + flame.name + " into the body!");
  } else {
    applyInjury(char, 2);
    showToast("Flame rejected the body. Severe injury!");
  }
  saveState();
  switchView('cultivation');
}

function enterSeclusion() {
  const char = getActiveChar();
  if (!char) return;
  if (char.injured && char.injured > 2) { showToast("Too injured for seclusion"); return; }
  const days = randInt(3, 10);
  const gain = days * randInt(40, 120);
  char.douQi = (char.douQi || 100) + gain;
  char.foundation = Math.min(100, (char.foundation || 40) + randInt(1, 4));
  char.comprehension = Math.min(100, (char.comprehension || 20) + randInt(1, 3));
  // miss a world event sometimes
  if (Math.random() > 0.5) {
    state.events = state.events || [];
    state.events.push({ title: "Missed Event", desc: char.name + " was in seclusion and missed a major disturbance in the " + (state.currentRegion || "lands") + "." });
  }
  saveState();
  showToast(`Seclusion for ${days} days. Dou Qi +${gain}`);
  switchView('cultivation');
}

function bottleneckStatus(char) {
  if (!char) return "—";
  const need = 35 + (DOU_QI_RANKS.findIndex(r => r.name === char.realm) * 5);
  const have = char.foundation || 0;
  return Math.min(100, Math.floor((have / Math.max(need, 1)) * 100)) + "% to safe breakthrough";
}

function escapeBattle() {
  const char = getActiveChar();
  if (!char) return;
  char.reputation = "Known for caution";
  if (Math.random() > 0.5) {
    showToast("Escaped cleanly.");
  } else {
    applyInjury(char, 1);
    showToast("Escaped with injuries. Reputation altered.");
  }
  saveState();
}

function recordDuel(winner, loser, note) {
  ensureMeta();
  state.duelLog = state.duelLog || [];
  state.duelLog.push({ winner, loser, note, t: Date.now() });
  if (state.duelLog.length > 30) state.duelLog.shift();
}

function teamSpar() {
  if ((state.characters || []).length < 2) { showToast("Need 2+ characters"); return; }
  const a = state.characters[0];
  const b = state.characters[1];
  const result = generateBattleResult(a, b);
  recordDuel(result.winner, result.loser, "Team spar / internal duel");
  showToast(result.winner + " prevailed in spar against " + result.loser);
  saveState();
  switchView('battle');
}

function runTutorial() {
  ensureMeta();
  const steps = [
    "Create a world (World Creator).",
    "Generate a Dou Zhe character.",
    "Train Dou Qi on Cultivation tab.",
    "Generate a technique and learn it.",
    "Join a sect and run a faction mission.",
    "Travel on the Continent Map.",
    "Generate 3 story chapters.",
    "Attempt a breakthrough."
  ];
  const i = state.meta.tutorialStep || 0;
  if (i >= steps.length) {
    showToast("Tutorial complete. The Heavenly Dao acknowledges you.");
    return;
  }
  showToast("Tutorial " + (i + 1) + "/" + steps.length + ": " + steps[i]);
  state.meta.tutorialStep = i + 1;
  saveState();
}

function saveToSlot(n) {
  ensureMeta();
  const preview = {
    blood: (state.lineage && state.lineage.bloodName) || "—",
    year: (state.sim && state.sim.year) || 1,
    living: (typeof getLineageCharacters === "function" ? getLineageCharacters().length : (state.characters||[]).length),
    extinct: !!(state.sim && state.sim.lineageAlive === false),
    chapters: (state.storyChapters||[]).length
  };
  state.saveSlots[n] = JSON.parse(JSON.stringify(state));
  if (state.saveSlots[n].saveSlots) state.saveSlots[n].saveSlots = { 1: null, 2: null, 3: null };
  state.saveSlots[n]._preview = preview;
  saveState();
  showToast("Saved slot " + n + " (" + preview.blood + " Y" + preview.year + ")");
}

function loadFromSlot(n) {
  ensureMeta();
  const slot = state.saveSlots[n];
  if (!slot) { showToast("Slot " + n + " is empty"); return; }
  const slotsBackup = state.saveSlots;
  state = slot;
  state.saveSlots = slotsBackup;
  saveState();
  switchView('dashboard');
  showToast("Loaded slot " + n);
}

function ensureCast(char) {
  if (!char.cast) {
    char.cast = {
      master: generateName() + " (Hidden Expert)",
      sibling: generateName() + " (Sworn Sibling)",
      betrayer: generateName() + " (Smiling Blade)"
    };
  }
  if (!char.rivalStage) char.rivalStage = "strangers";
}

function advanceRivalStage(char) {
  const stages = ["strangers", "rivals", "nemesis", "reluctant ally"];
  const i = stages.indexOf(char.rivalStage || "strangers");
  if (i < stages.length - 1) char.rivalStage = stages[i + 1];
}

function wantedByAncients() {
  const char = getActiveChar();
  if (!char) return;
  char.wanted = Math.min(5, (char.wanted || 0) + 1);
  state.events = state.events || [];
  state.events.push({ title: "Ancient Clan Notice", desc: char.name + " has drawn unwanted attention. Wanted level: " + char.wanted });
  showToast("Wanted level: " + char.wanted);
  saveState();
}

function allianceContract() {
  if (!(state.clans || []).length || (state.clans.length < 1)) {
    showToast("Create a clan first");
    return;
  }
  const c = state.clans[0];
  state.events = state.events || [];
  state.events.push({ title: "Alliance Contract", desc: c.name + " formed a temporary alliance pact. Politics shift." });
  showToast("Alliance contract signed for " + c.name);
  saveState();
}

function academyExam() {
  const char = getActiveChar();
  if (!char) return;
  if (!(state.academies || []).length) { showToast("Create an academy first"); return; }
  const score = randInt(40, 100) + ((char.comprehension || 20) / 5);
  if (score > 80) {
    char.experience = Math.min(100, (char.experience || 20) + 8);
    char.comprehension = Math.min(100, (char.comprehension || 20) + 3);
    showToast("Exam outstanding. Rewards gained.");
  } else if (score > 60) {
    char.experience = Math.min(100, (char.experience || 20) + 4);
    showToast("Exam passed.");
  } else {
    showToast("Exam failed. Train more.");
  }
  saveState();
}

function pillCommission() {
  ensureMeta();
  if ((state.resources.herbs || 0) < 3) { showToast("Need at least 3 herbs (gather resources)"); return; }
  state.resources.herbs -= 3;
  if (!state.pills) state.pills = [];
  state.pills.push(PILL_LIST[Math.floor(Math.random() * PILL_LIST.length)]);
  showToast("Pill Tower commission complete");
  saveState();
}



// ===== TRUE BRANCHING STORY GRAPH =====

const STORY_GRAPH = {
  start: {
    id: "start",
    title: "The First Divergence",
    text: "A dying messenger collapses before you, pressing a blood-stained jade slip into your hand. Behind him, pursuit draws near. The slip pulses with incomplete spatial coordinates.",
    choices: [
      { id: "protect", label: "Protect the messenger and fight", next: "fight_chase", effects: { exp: 4, injuryChance: 0.3, flag: "saved_messenger" } },
      { id: "take_slip", label: "Take the slip and vanish", next: "vanish_with_slip", effects: { exp: 2, flag: "stole_slip", wanted: 1 } },
      { id: "destroy", label: "Destroy the slip to avoid calamity", next: "destroy_slip", effects: { foundation: 2, flag: "rejected_fate" } }
    ]
  },
  fight_chase: {
    id: "fight_chase",
    title: "Blood on the Road",
    text: "You stand your ground. Blades and Dou Qi clash under a dim sky. The messenger survives — barely — and whispers a name connected to an Ancient Clan remnant.",
    choices: [
      { id: "ask_name", label: "Demand the full truth", next: "truth_revealed", effects: { flag: "knows_truth", comprehension: 2 } },
      { id: "escort", label: "Escort him to the nearest sect", next: "sect_shelter", effects: { contribution: 10, flag: "allied_messenger" } },
      { id: "leave_wounded", label: "Leave him hidden and investigate alone", next: "solo_investigate", effects: { exp: 3, flag: "lone_path" } }
    ]
  },
  vanish_with_slip: {
    id: "vanish_with_slip",
    title: "Stolen Destiny",
    text: "You disappear into the wilds with the jade slip. The pursuers howl behind you. The slip shows a ruin that should not exist on any public map.",
    choices: [
      { id: "open_ruin", label: "Head straight to the ruin", next: "ruin_gate", effects: { flag: "early_ruin", exp: 3 } },
      { id: "decode_first", label: "Decode the slip carefully first", next: "decode_slip", effects: { comprehension: 4, flag: "careful_decoder" } },
      { id: "sell_info", label: "Sell the information to a faction", next: "sell_clue", effects: { contribution: 15, flag: "sold_destiny", wanted: 1 } }
    ]
  },
  destroy_slip: {
    id: "destroy_slip",
    title: "Rejected Heaven",
    text: "The slip turns to powder under your Dou Qi. For a moment the world seems quieter. Then a different kind of trouble finds you: people who wanted that slip now want the one who destroyed it.",
    choices: [
      { id: "confess", label: "Publicly admit you destroyed it", next: "public_stance", effects: { flag: "open_enemy", foundation: 3 } },
      { id: "frame", label: "Frame another faction", next: "frame_faction", effects: { flag: "schemer", wanted: 1 } },
      { id: "hide", label: "Go into hiding and cultivate", next: "hidden_seclusion", effects: { qi: 300, flag: "shadow_path" } }
    ]
  },
  truth_revealed: {
    id: "truth_revealed",
    title: "Name of the Remnant",
    text: "The truth is heavier than expected: the coordinates lead to a sealed Dou Saint remnant, and three major forces already know fragments of it.",
    choices: [
      { id: "race", label: "Race to the remnant alone", next: "ending_solo_glory", effects: { exp: 8, flag: "ending_solo" } },
      { id: "alliance", label: "Build a temporary alliance", next: "ending_alliance", effects: { contribution: 20, flag: "ending_alliance" } },
      { id: "betray_info", label: "Sell everyone out and profit", next: "ending_scheme", effects: { wanted: 2, flag: "ending_scheme" } }
    ]
  },
  sect_shelter: {
    id: "sect_shelter",
    title: "Under Sect Eaves",
    text: "A sect takes the messenger in. You gain favor — and surveillance. Elders smile while weighing your usefulness.",
    choices: [
      { id: "join_deeper", label: "Accept deeper sect involvement", next: "ending_sect", effects: { contribution: 25, flag: "ending_sect" } },
      { id: "use_sect", label: "Use their resources then leave", next: "ending_solo_glory", effects: { qi: 400, flag: "ending_used_sect" } }
    ]
  },
  solo_investigate: {
    id: "solo_investigate",
    title: "Alone With the Clue",
    text: "Without allies, every step is cleaner and more dangerous. You find a secondary mark on the messenger's map — a trap route and a true route.",
    choices: [
      { id: "true_route", label: "Take the true route", next: "ruin_gate", effects: { flag: "true_path", exp: 5 } },
      { id: "trap_route", label: "Trigger the trap to bait enemies", next: "ending_scheme", effects: { flag: "baited_enemies", exp: 5 } }
    ]
  },
  ruin_gate: {
    id: "ruin_gate",
    title: "Gate of the Dead Saint",
    text: "The ruin gate breathes cold willpower. Guardians stir. Inside may be inheritance — or annihilation.",
    choices: [
      { id: "force_open", label: "Force the gate with raw power", next: "ending_solo_glory", effects: { injuryChance: 0.4, exp: 10, flag: "forced_gate" } },
      { id: "solve_seal", label: "Solve the seal with comprehension", next: "ending_alliance", effects: { comprehension: 5, flag: "solved_seal" } }
    ]
  },
  decode_slip: {
    id: "decode_slip",
    title: "Lines Under the Lines",
    text: "Careful decoding reveals a second message: the remnant is a test, not a gift. Those who enter with greed are culled.",
    choices: [
      { id: "prepare", label: "Prepare meticulously then enter", next: "ruin_gate", effects: { foundation: 3, flag: "prepared" } },
      { id: "abandon", label: "Abandon the remnant as cursed", next: "ending_reject", effects: { foundation: 5, flag: "ending_reject" } }
    ]
  },
  sell_clue: {
    id: "sell_clue",
    title: "Price of a Secret",
    text: "A faction pays well. Too well. You realize you may have sold your own future seat at the inheritance table.",
    choices: [
      { id: "double", label: "Double-sell to their enemies", next: "ending_scheme", effects: { wanted: 2, flag: "double_sell" } },
      { id: "lie_low", label: "Take the wealth and disappear", next: "hidden_seclusion", effects: { qi: 500, flag: "bought_time" } }
    ]
  },
  public_stance: {
    id: "public_stance",
    title: "Open Blade",
    text: "Your admission makes enemies openly. It also makes a few desperate people trust you.",
    choices: [
      { id: "lead", label: "Lead those people toward a new path", next: "ending_alliance", effects: { flag: "ending_leader" } },
      { id: "war", label: "Declare conflict against the hunters", next: "ending_solo_glory", effects: { exp: 8, flag: "open_war" } }
    ]
  },
  frame_faction: {
    id: "frame_faction",
    title: "Borrowed Crime",
    text: "The frame job works — briefly. Politics boil. You gain time and lose innocence.",
    choices: [
      { id: "escalate", label: "Escalate the political fire", next: "ending_scheme", effects: { wanted: 1, flag: "chaos_maker" } },
      { id: "exit", label: "Exit the board entirely", next: "ending_reject", effects: { foundation: 4, flag: "exited_board" } }
    ]
  },
  hidden_seclusion: {
    id: "hidden_seclusion",
    title: "Closed Door",
    text: "You vanish into seclusion. The world moves without you. When you return, the remnant affair has already changed owners.",
    choices: [
      { id: "return_stronger", label: "Return stronger and reclaim a share", next: "ending_solo_glory", effects: { qi: 600, exp: 6, flag: "late_return" } },
      { id: "never_return", label: "Let that destiny go forever", next: "ending_reject", effects: { foundation: 6, flag: "true_renunciation" } }
    ]
  },


  // BTTH-style Three-Year Covenant starter
  covenant_start: {
    id: "covenant_start",
    title: "Covenant Arc: Public Slight",
    text: "In front of the clan and guests, a betrothal is treated as disposable. Laughter cuts deeper than blades. A three-year covenant is spoken — not as romance, but as a timer nailed into destiny.",
    choices: [
      { id: "accept_timer", label: "Accept the three-year timer and train in silence", next: "covenant_train", effects: { foundation: 3, flag: "covenant_accepted" } },
      { id: "retort", label: "Retort publicly and raise the stakes", next: "covenant_train", effects: { exp: 3, flag: "covenant_public", wanted: 0 } },
      { id: "leave_clan", label: "Leave the clan grounds to seek a hidden master", next: "covenant_master", effects: { flag: "covenant_leave", comprehension: 2 } }
    ]
  },
  covenant_train: {
    id: "covenant_train",
    title: "Covenant Arc: Closed Training",
    text: "Days collapse into circulation cycles. Alchemy funds the path. Each small breakthrough is banked toward a public reversal.",
    choices: [
      { id: "alchemy_fund", label: "Sell pills to fund techniques", next: "covenant_duel", effects: { qi: 300, flag: "covenant_alchemy" } },
      { id: "risk_ruin", label: "Risk a ruin for a decisive technique", next: "covenant_duel", effects: { exp: 6, injuryChance: 0.25, flag: "covenant_ruin" } }
    ]
  },
  covenant_master: {
    id: "covenant_master",
    title: "Covenant Arc: Hidden Guidance",
    text: "A hidden expert tests patience more than talent. Method arrives — expensive, incomplete, and enough.",
    choices: [
      { id: "swear_disciple", label: "Swear discipleship and endure the method", next: "covenant_duel", effects: { comprehension: 4, flag: "covenant_disciple" } },
      { id: "steal_method", label: "Take the method and vanish", next: "covenant_duel", effects: { exp: 5, flag: "covenant_stolen_method", wanted: 1 } }
    ]
  },
  covenant_duel: {
    id: "covenant_duel",
    title: "Covenant Arc: Due Date",
    text: "Three years compress into one arena. Spectators come for humiliation; history comes for a name.",
    choices: [
      { id: "win_clean", label: "Win cleanly and walk away", next: "ending_solo_glory", effects: { exp: 12, flag: "covenant_won" } },
      { id: "win_cost", label: "Win at a brutal cost", next: "ending_solo_glory", effects: { exp: 10, injuryChance: 0.4, flag: "covenant_pyrrhic" } },
      { id: "refuse_kill", label: "Win but refuse to destroy them fully", next: "ending_alliance", effects: { foundation: 4, flag: "covenant_mercy" } }
    ]
  },

  // === ARC: Flame War ===
  flame_start: {
    id: "flame_start",
    title: "Flame War: Embers",
    text: "Two factions claim the same Heavenly Flame fluctuation. Markets freeze. Experts move. You are close enough to choose a side — or a third path.",
    choices: [
      { id: "side_a", label: "Side with the first faction", next: "flame_side", effects: { flag: "flame_side_a", contribution: 8 } },
      { id: "side_b", label: "Side with the second faction", next: "flame_side", effects: { flag: "flame_side_b", contribution: 8 } },
      { id: "third", label: "Hunt the flame alone", next: "flame_solo", effects: { flag: "flame_solo_hunt", exp: 4 } }
    ]
  },
  flame_side: {
    id: "flame_side",
    title: "Flame War: Banner",
    text: "Under a banner, you gain scouts and enemies. The flame's true landing site is narrowed to three valleys.",
    choices: [
      { id: "valley_fight", label: "Contest the central valley", next: "flame_clash", effects: { exp: 5, injuryChance: 0.25 } },
      { id: "valley_scheme", label: "Leak false coordinates", next: "flame_scheme", effects: { flag: "flame_false_map", comprehension: 2 } }
    ]
  },
  flame_solo: {
    id: "flame_solo",
    title: "Flame War: Lone Spark",
    text: "Alone, you arrive earlier — and more exposed. The flame's pressure alone can crush greedy minds.",
    choices: [
      { id: "bind_attempt", label: "Attempt to approach and claim", next: "ending_solo_glory", effects: { flag: "claimed_flame_attempt", injuryChance: 0.35, exp: 10 } },
      { id: "observe", label: "Observe and steal the aftermath", next: "flame_scheme", effects: { flag: "flame_opportunist", exp: 4 } }
    ]
  },
  flame_clash: {
    id: "flame_clash",
    title: "Flame War: Collision",
    text: "Dou Qi turns the valley into a furnace. Whoever still stands when the flame stabilizes will write the next regional order.",
    choices: [
      { id: "push", label: "Push through for the core claim", next: "ending_solo_glory", effects: { exp: 12, injuryChance: 0.4, flag: "flame_war_victor" } },
      { id: "withdraw", label: "Withdraw with intelligence intact", next: "ending_alliance", effects: { comprehension: 4, flag: "flame_war_survivor" } }
    ]
  },
  flame_scheme: {
    id: "flame_scheme",
    title: "Flame War: After-Smoke",
    text: "While giants collide, you take what the chaos loosens: maps, cores, and debts.",
    choices: [
      { id: "cash_out", label: "Convert chaos into profit", next: "ending_scheme", effects: { qi: 700, flag: "flame_profiteer" } },
      { id: "trade_favor", label: "Trade findings for protection", next: "ending_sect", effects: { contribution: 30, flag: "flame_protected" } }
    ]
  },

  // === ARC: Academy ===
  academy_start: {
    id: "academy_start",
    title: "Academy Arc: Entrance",
    text: "An academy opens special recommendation slots. Exams, politics, and genius rivalries intertwine. A single ranking can alter a decade.",
    choices: [
      { id: "exam", label: "Enter through formal exam", next: "academy_exam", effects: { flag: "academy_exam_path", comprehension: 2 } },
      { id: "recommend", label: "Use faction recommendation", next: "academy_rec", effects: { flag: "academy_rec_path", contribution: -5 } },
      { id: "infiltrate", label: "Infiltrate as an attendant", next: "academy_shadow", effects: { flag: "academy_shadow", exp: 2 } }
    ]
  },
  academy_exam: {
    id: "academy_exam",
    title: "Academy Arc: Trial",
    text: "The exam is fair only on the surface. Hidden scoring favors bloodlines and sponsors.",
    choices: [
      { id: "pure_skill", label: "Win by pure skill", next: "academy_inner", effects: { exp: 6, comprehension: 3, flag: "academy_merit" } },
      { id: "expose", label: "Expose scoring corruption", next: "academy_conflict", effects: { flag: "academy_whistle", wanted: 1 } }
    ]
  },
  academy_rec: {
    id: "academy_rec",
    title: "Academy Arc: Sponsored",
    text: "You enter easily — and are treated as someone's tool. Resources appear. Freedom shrinks.",
    choices: [
      { id: "obey", label: "Obey and climb", next: "academy_inner", effects: { contribution: 12, flag: "academy_tool" } },
      { id: "break", label: "Break the sponsor's leash", next: "academy_conflict", effects: { flag: "academy_unbound", exp: 5 } }
    ]
  },
  academy_shadow: {
    id: "academy_shadow",
    title: "Academy Arc: Shadow Seat",
    text: "As an attendant, you hear truths disciples miss. Knowledge becomes your real cultivation resource.",
    choices: [
      { id: "steal_art", label: "Steal a restricted technique fragment", next: "ending_scheme", effects: { flag: "academy_theft", exp: 5 } },
      { id: "earn_place", label: "Earn a real disciple place quietly", next: "academy_inner", effects: { flag: "academy_earned", comprehension: 4 } }
    ]
  },
  academy_inner: {
    id: "academy_inner",
    title: "Academy Arc: Inner Court",
    text: "Inner court life is polished war. Friendships are temporary treaties.",
    choices: [
      { id: "top_rank", label: "Aim for top rank at all costs", next: "ending_solo_glory", effects: { exp: 10, flag: "academy_top" } },
      { id: "build_circle", label: "Build a durable circle of allies", next: "ending_alliance", effects: { contribution: 20, flag: "academy_circle" } }
    ]
  },
  academy_conflict: {
    id: "academy_conflict",
    title: "Academy Arc: Open Rift",
    text: "Conflict spills beyond rules. Elders intervene only when their interests burn.",
    choices: [
      { id: "stand", label: "Stand on principle", next: "ending_reject", effects: { foundation: 5, flag: "academy_principled" } },
      { id: "weaponize", label: "Weaponize the scandal", next: "ending_scheme", effects: { wanted: 1, flag: "academy_scandal" } }
    ]
  },

  // === ARC: Ancient Clan Hunt ===
  hunt_start: {
    id: "hunt_start",
    title: "Ancient Hunt: Marked",
    text: "An Ancient Clan mark appears in the market blacklists. Your name is close to it — whether by mistake or design.",
    choices: [
      { id: "clear_name", label: "Try to clear your name", next: "hunt_clear", effects: { flag: "hunt_clear_path" } },
      { id: "run", label: "Run before the net closes", next: "hunt_run", effects: { flag: "hunt_fugitive", exp: 2 } },
      { id: "counter", label: "Counter-investigate the clan branch", next: "hunt_counter", effects: { flag: "hunt_counter", wanted: 1 } }
    ]
  },
  hunt_clear: {
    id: "hunt_clear",
    title: "Ancient Hunt: Evidence",
    text: "Clearing a name under Ancient Clan pressure requires evidence and sacrifices.",
    choices: [
      { id: "trade_secret", label: "Trade a secret for temporary pardon", next: "ending_sect", effects: { flag: "hunt_pardoned", contribution: 15 } },
      { id: "public_proof", label: "Present proof publicly", next: "ending_alliance", effects: { flag: "hunt_public", exp: 6 } }
    ]
  },
  hunt_run: {
    id: "hunt_run",
    title: "Ancient Hunt: Exile Road",
    text: "Roads close behind you. In exile, strength grows fast — and so does paranoia.",
    choices: [
      { id: "border_force", label: "Join a border force under a false name", next: "ending_sect", effects: { flag: "hunt_false_name", exp: 5 } },
      { id: "revenge_train", label: "Train only for return and revenge", next: "ending_solo_glory", effects: { exp: 10, flag: "hunt_revenge" } }
    ]
  },
  hunt_counter: {
    id: "hunt_counter",
    title: "Ancient Hunt: Into the Shadow",
    text: "You dig into a branch elder's crime. The deeper you dig, the more the clan notices.",
    choices: [
      { id: "expose_elder", label: "Expose the elder", next: "ending_scheme", effects: { wanted: 2, flag: "hunt_exposed_elder" } },
      { id: "blackmail", label: "Blackmail for protection and resources", next: "ending_scheme", effects: { qi: 900, flag: "hunt_blackmail" } }
    ]
  },


  // Endings
  ending_solo_glory: {
    id: "ending_solo_glory",
    title: "Ending: Lone Apex Path",
    text: "You carve a path with your own hands. Gains are real, protection is scarce, and your name begins to spread as a dangerous independent.\n\n[Branch Complete: Solo Glory]",
    choices: [],
    ending: true,
    reward: { exp: 12, qi: 800 }
  },
  ending_alliance: {
    id: "ending_alliance",
    title: "Ending: Shared Banner",
    text: "You bind your fate to others. Power comes with obligations, but also with shields you could not forge alone.\n\n[Branch Complete: Alliance]",
    choices: [],
    ending: true,
    reward: { contribution: 40, exp: 8 }
  },
  ending_scheme: {
    id: "ending_scheme",
    title: "Ending: Web of Knives",
    text: "You profit from conflict itself. Wealth and information pile up — so do hunters. The Heavenly Dao records your methods coldly.\n\n[Branch Complete: Schemer]",
    choices: [],
    ending: true,
    reward: { wanted: 1, qi: 1000, exp: 8 }
  },
  ending_sect: {
    id: "ending_sect",
    title: "Ending: Sect Shadow Rise",
    text: "Within the faction structure, you rise. Resources flow. Freedom shrinks. A future elder seat glimmers in the distance.\n\n[Branch Complete: Sect Path]",
    choices: [],
    ending: true,
    reward: { contribution: 50, exp: 10 }
  },
  ending_reject: {
    id: "ending_reject",
    title: "Ending: Beyond the Bait",
    text: "You refuse the obvious destiny trap. Your foundation deepens in quiet places while others die for incomplete inheritances.\n\n[Branch Complete: Rejection]",
    choices: [],
    ending: true,
    reward: { foundation: 8, comprehension: 5 }
  }
};

function ensureBranchState() {
  if (!state.branch) {
    state.branch = {
      current: "start",
      history: [],
      flags: {},
      completedEndings: []
    };
  }
}

function applyBranchEffects(effects) {
  const char = getActiveChar();
  if (!effects) return;
  if (!char) return;
  if (effects.exp) char.experience = Math.min(100, (char.experience || 20) + effects.exp);
  if (effects.comprehension) char.comprehension = Math.min(100, (char.comprehension || 20) + effects.comprehension);
  if (effects.foundation) char.foundation = Math.min(100, (char.foundation || 40) + effects.foundation);
  if (effects.qi) char.douQi = (char.douQi || 100) + effects.qi;
  if (effects.contribution) gainContribution(effects.contribution);
  if (effects.wanted) char.wanted = Math.min(5, (char.wanted || 0) + effects.wanted);
  if (effects.injuryChance && Math.random() < effects.injuryChance) applyInjury(char, 1);
  if (effects.flag) state.branch.flags[effects.flag] = true;
}

function renderBranchStory() {
  ensureBranchState();
  const node = STORY_GRAPH[state.branch.current] || STORY_GRAPH.start;
  const flags = Object.keys(state.branch.flags || {}).filter(k => state.branch.flags[k]);
  const endings = state.branch.completedEndings || [];
  const visited = new Set(["start", ...(state.branch.history || []).map(h => {
    // history stores choice ids; also track node ids visited via current path reconstruction loosely
    return h;
  }), state.branch.current]);
  // Build visited nodes list from path by walking known transitions roughly via history length
  const visitedNodes = state.branch.visitedNodes || ["start"];

  let choicesHtml = "";
  if (node.choices && node.choices.length) {
    choicesHtml = node.choices.map(ch => `
      <button class="btn-primary" style="width:100%;margin-bottom:10px;text-align:left;padding:14px 16px;" onclick="pickBranchChoice('${ch.id}')">
        ${ch.label}
      </button>
    `).join("");
  } else {
    choicesHtml = `
      <button class="btn-primary" onclick="resetBranchGraph()">Begin a New Branching Arc</button>
      <button class="btn-ghost" onclick="generateChapter()" style="margin-left:8px;">Write Free Chapter</button>
    `;
  }

  return `
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header">
        <h3 class="card-title">Branching Story Graph</h3>
        <span class="badge badge-purple">Interactive</span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:12px;">True choices with persistent flags, consequences, and multiple endings.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
        <span class="badge badge-gold">Node: ${node.id}</span>
        <span class="badge badge-blue">Endings found: ${endings.length}</span>
        <span class="badge badge-green">Flags: ${flags.length}</span>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <h3 class="card-title" style="margin-bottom:12px;">${node.title}</h3>
      <div class="ai-output story-enhanced" style="margin-top:0;">${node.text}</div>
      <div style="margin-top:18px;">${choicesHtml}</div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <h3 class="card-title" style="margin-bottom:10px;">Start Another Arc</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <button class="btn-ghost" onclick="startArc('start')">Messenger Arc</button>
        <button class="btn-ghost" onclick="startArc('flame_start')">Flame War Arc</button>
        <button class="btn-ghost" onclick="startArc('academy_start')">Academy Arc</button>
        <button class="btn-ghost" onclick="startArc('hunt_start')">Ancient Hunt Arc</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <h3 class="card-title" style="margin-bottom:10px;">Visual Branch Graph</h3>
      ${window.DaoGraph ? window.DaoGraph.render(state.branch.visitedNodes || ["start"], state.branch.current, state.branch.history || []) : ""}
      <p style="color:var(--text-dim);font-size:0.82rem;margin-top:8px;">Gold node = current. Path flows left to right.</p>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <h3 class="card-title" style="margin-bottom:10px;">Flag-Unlocked Special Chapters</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:10px;">Certain flags unlock special free-story chapters.</p>
      <button class="btn-primary" onclick="writeSpecialFlagChapter()">✍️ Write Special Chapter From Flags</button>
    </div>

    <div class="card">
      <h3 class="card-title" style="margin-bottom:10px;">Branch Memory</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;"><strong>Path:</strong> ${(state.branch.history || []).join(" → ") || "start"}</p>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-top:8px;"><strong>Flags:</strong> ${flags.join(", ") || "none yet"}</p>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-top:8px;"><strong>Completed endings:</strong> ${endings.join(", ") || "none yet"}</p>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-ghost" onclick="resetBranchGraph()">Reset Branch Graph</button>
        <button class="btn-ghost" onclick="switchView('story')">Free Story Generator</button>
      </div>
    </div>
  `;
}

function pickBranchChoice(choiceId) {
  ensureBranchState();
  const node = STORY_GRAPH[state.branch.current];
  if (!node || !node.choices) return;
  const choice = node.choices.find(c => c.id === choiceId);
  if (!choice) return;

  applyBranchEffects(choice.effects || {});
  state.branch.history.push(choice.id);
  state.branch.current = choice.next;
  if (!state.branch.visitedNodes) state.branch.visitedNodes = ["start"];
  if (!state.branch.visitedNodes.includes(choice.next)) state.branch.visitedNodes.push(choice.next);

  const next = STORY_GRAPH[choice.next];
  if (next && next.ending) {
    applyBranchEffects(next.reward || {});
    if (!state.branch.completedEndings.includes(next.id)) state.branch.completedEndings.push(next.id);
    // also write a normal chapter log of the ending
    state.storyChapters.push({
      title: next.title,
      content: next.text + "\\n\\n[Flags: " + Object.keys(state.branch.flags).filter(k => state.branch.flags[k]).join(", ") + "]"
    });
    showToast("Ending reached: " + next.title);
  } else {
    showToast("Path chosen: " + choice.label);
  }
  saveState();
  switchView("branch");
}

function resetBranchGraph() {
  state.branch = { current: "start", history: [], flags: {}, completedEndings: (state.branch && state.branch.completedEndings) || [] };
  saveState();
  switchView("branch");
  showToast("New branching arc started (endings memory kept)");
}



function startArc(nodeId) {
  ensureBranchState();
  if (!STORY_GRAPH[nodeId]) { showToast("Arc not found"); return; }
  state.branch.current = nodeId;
  state.branch.history = [];
  if (!state.branch.visitedNodes) state.branch.visitedNodes = [];
  if (!state.branch.visitedNodes.includes(nodeId)) state.branch.visitedNodes.push(nodeId);
  saveState();
  switchView("branch");
  showToast("Started arc at " + nodeId);
}

function writeSpecialFlagChapter() {
  ensureBranchState();
  const flags = state.branch.flags || {};
  const char = getActiveChar() || { name: "Unknown Cultivator", star: "?", realm: "?", talent: "?" };
  const specials = [];
  if (flags.saved_messenger) specials.push("Because you once saved a dying messenger, a hidden contact now risks exposure to repay that debt.");
  if (flags.stole_slip) specials.push("The stolen jade slip still stains your fate; hunters read old traces in new cities.");
  if (flags.knows_truth) specials.push("Knowing the remnant's truth isolates you — ignorance would have been safer.");
  if (flags.flame_war_victor || flags.claimed_flame_attempt) specials.push("Your name is spoken near Heavenly Flame affairs with caution and greed.");
  if (flags.academy_top || flags.academy_merit) specials.push("Academy circles still debate your rise, polishing and poisoning your reputation at once.");
  if (flags.hunt_revenge || flags.hunt_fugitive) specials.push("Ancient Clan pressure taught you exile's curriculum: silence, speed, and long memory.");
  if (flags.ending_scheme || flags.double_sell) specials.push("Those who profit from chaos eventually meet accountants with swords.");
  if (flags.ending_reject || flags.true_renunciation) specials.push("Having rejected baited destinies, you walk slower paths with denser foundations.");
  if (!specials.length) {
    showToast("No special flags yet — play branching arcs first");
    return;
  }
  const text = specials.join("\\n\\n") + "\\n\\n" + char.name + ", still walking the continent as " + (char.star||"") + " " + (char.realm||"") + ", feels these old choices tighten into new events.";
  state.storyChapters.push({
    title: "Special: Echoes of Chosen Paths",
    content: text
  });
  saveState();
  switchView("story");
  showToast("Special flag chapter written");
}



// ===== THIRD WAVE ALL-30 =====

function ensureWave3() {
  if (!state.calendar) state.calendar = { month: 1, year: 1, weather: "Clear" };
  if (!state.regionControl) state.regionControl = {
    "Outerland": "Scattered Clans",
    "Innerland": "Major Sects",
    "Mainland": "Empire Coalition",
    "Central Land": "Ancient Clans"
  };
  if (!state.globalThreat) state.globalThreat = 1;
  if (!state.techLoadout) state.techLoadout = { active: null, passive: null };
  if (!state.battleReplays) state.battleReplays = [];
  if (!state.artifacts) state.artifacts = [];
}

function advanceCalendar() {
  ensureWave3();
  state.calendar.month += 1;
  if (state.calendar.month > 12) {
    state.calendar.month = 1;
    state.calendar.year += 1;
  }
  const weathers = ["Clear", "Flame Winds", "Soul Mist", "Thunder Monsoon", "Drought"];
  state.calendar.weather = weathers[Math.floor(Math.random() * weathers.length)];
  // monthly event
  const monthly = [
    "A regional tournament registration opens.",
    "Beast activity rises along trade roads.",
    "Alchemy ingredient prices spike.",
    "An empire tax decree angers independent cultivators.",
    "Rumors of a Dou Saint remnant intensify."
  ];
  const ev = monthly[Math.floor(Math.random() * monthly.length)];
  state.events = state.events || [];
  state.events.push({ title: `Month ${state.calendar.month}, Year ${state.calendar.year}`, desc: ev + " Weather: " + state.calendar.weather });
  if (state.calendar.month % 3 === 0) state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
  saveState();
  showToast(`Calendar: Y${state.calendar.year} M${state.calendar.month} · ${state.calendar.weather} · Threat ${state.globalThreat}`);
  switchView("world");
}

function setLoadout(type) {
  const char = getActiveChar();
  if (!char || !char.technique) { showToast("Learn a technique first"); return; }
  ensureWave3();
  if (type === "active") state.techLoadout.active = char.technique;
  else state.techLoadout.passive = char.technique;
  saveState();
  showToast(type + " loadout: " + char.technique);
}

function fuseFlameRisk() {
  if (!state.flames || state.flames.length < 2) { showToast("Need 2+ flames discovered"); return; }
  const char = getActiveChar();
  if (!char) return;
  if (Math.random() > 0.55) {
    const f = state.flames[state.flames.length - 1];
    char.boundFlame = (char.boundFlame ? char.boundFlame + " + " : "") + f.name;
    char.douQi = Math.floor((char.douQi || 100) * 1.15);
    showToast("Flame fusion succeeded");
  } else {
    applyInjury(char, 2);
    showToast("Fusion failed. Severe backlash!");
  }
  saveState();
  switchView("flames");
}

function tribulationAttempt() {
  const char = getActiveChar();
  if (!char) return;
  const rankIndex = DOU_QI_RANKS.findIndex(r => r.name === char.realm);
  if (rankIndex < 6) { showToast("Tribulation events matter most from Dou Zong upward. Attempt normal breakthrough for now."); return; }
  ensureWave3();
  const need = { herbs: 5, cores: 2, ores: 3 };
  state.resources = state.resources || { herbs: 0, cores: 0, ores: 0 };
  if (state.resources.herbs < need.herbs || state.resources.cores < need.cores) {
    showToast("Tribulation preparation requires herbs>=5 and cores>=2 (Gather Resources)");
    return;
  }
  state.resources.herbs -= 5;
  state.resources.cores -= 2;
  const success = Math.random() < (0.35 + (char.foundation || 0) / 200);
  let text = "Heavenly tribulation clouds gather above " + char.name + ". ";
  if (success) {
    text += "Lightning tempers the body. The realm solidifies.";
    char.foundation = Math.min(100, (char.foundation || 40) + 5);
    char.douQi = Math.floor((char.douQi || 100) * 1.2);
    char.experience = Math.min(100, (char.experience || 20) + 10);
  } else {
    text += "The tribulation wounds the meridians. Survival is victory enough.";
    applyInjury(char, 3);
  }
  state.storyChapters.push({ title: "Tribulation: " + char.name, content: text });
  saveState();
  showToast(success ? "Tribulation survived" : "Tribulation nearly fatal");
  switchView("story");
}

function ageSeclusion() {
  const char = getActiveChar();
  if (!char) return;
  const years = randInt(1, 5);
  char.age = (char.age || 20) + years;
  char.douQi = (char.douQi || 100) + years * randInt(100, 250);
  char.foundation = Math.min(100, (char.foundation || 40) + years);
  ensureWave3();
  state.calendar.year += years;
  saveState();
  showToast(`Seclusion for ${years} years. Age now ${char.age}`);
  switchView("cultivation");
}

function travelAmbush() {
  const char = getActiveChar();
  const region = state.currentRegion || "Outerland";
  const danger = { Outerland: 0.2, Innerland: 0.35, Mainland: 0.5, "Central Land": 0.7 }[region] || 0.3;
  ensureWave3();
  if (Math.random() > danger) {
    showToast("Travel is tense but safe.");
    return;
  }
  const won = Math.random() > 0.45;
  const note = won ? "Ambush defeated on the road." : "Ambush forced a bloody retreat.";
  if (char) {
    if (won) {
      char.experience = Math.min(100, (char.experience || 20) + randInt(3, 8));
      if (!char.inventory) char.inventory = [];
      char.inventory.push(generateItem());
    } else applyInjury(char, 1);
  }
  state.battleReplays.push({ note, region, t: Date.now() });
  state.events.push({ title: "Travel Ambush", desc: note + " (" + region + ")" });
  saveState();
  showToast(note);
}

function refineArtifact() {
  const char = getActiveChar();
  if (!char) return;
  ensureWave3();
  state.resources = state.resources || { herbs: 0, cores: 0, ores: 0 };
  if ((state.resources.ores || 0) < 4) { showToast("Need 4 ores to refine an artifact"); return; }
  state.resources.ores -= 4;
  const art = { name: generateName().split(" ")[0] + " Artifact", rank: ["Rare", "Precious", "Legendary"][Math.floor(Math.random()*3)], durability: randInt(40, 100) };
  state.artifacts.push(art);
  if (!char.inventory) char.inventory = [];
  char.inventory.push({ name: art.name, type: "Treasure", rank: art.rank, description: "Durability " + art.durability });
  saveState();
  showToast("Refined " + art.name);
}

function summonBeastAssist() {
  if (!state.beasts || !state.beasts.length) { showToast("Generate a magical beast first"); return; }
  const char = getActiveChar();
  if (!char) return;
  char.beastAssist = state.beasts[state.beasts.length - 1].species;
  char.experience = Math.min(100, (char.experience || 20) + 2);
  saveState();
  showToast("Beast assist set: " + char.beastAssist);
}

function influenceMeter() {
  const sects = state.sects || [];
  if (!sects.length) { showToast("Create a sect first"); return; }
  sects.forEach(s => {
    s.influence = Math.min(100, (s.influence || randInt(10, 40)) + randInt(-5, 12));
  });
  saveState();
  showToast("Faction influence recalculated");
  switchView("factions");
}

function betrayalMission() {
  const char = getActiveChar();
  if (!char || !char.affiliations || !char.affiliations.length) { showToast("Join a faction first"); return; }
  gainContribution(25);
  char.wanted = Math.min(5, (char.wanted || 0) + 1);
  char.experience = Math.min(100, (char.experience || 20) + 6);
  state.events = state.events || [];
  state.events.push({ title: "Betrayal Mission", desc: char.name + " completed a double-sided mission. Rewards high, trust low." });
  saveState();
  showToast("Betrayal mission complete (+contribution, +wanted)");
}

function elderTrial() {
  const char = getActiveChar();
  if (!char) return;
  if ((char.factionRank || "") !== "Elder Candidate" && (char.factionRank || "") !== "Core Disciple") {
    showToast("Need Core Disciple or Elder Candidate rank");
    return;
  }
  if (Math.random() > 0.5) {
    char.factionRank = "Elder";
    gainContribution(30);
    showToast("Elder trial passed!");
  } else {
    applyInjury(char, 1);
    showToast("Elder trial failed");
  }
  saveState();
  switchView("character");
}

function breakTreaty() {
  state.events = state.events || [];
  state.events.push({ title: "Broken Treaty", desc: "A cross-faction treaty was broken. Border skirmishes intensify." });
  state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
  ensureWave3();
  saveState();
  showToast("Treaty broken. Global threat rises.");
}

function shiftRegionControl() {
  ensureWave3();
  const regions = Object.keys(state.regionControl);
  const r = regions[Math.floor(Math.random() * regions.length)];
  const owners = ["Scattered Clans", "Major Sects", "Empire Coalition", "Ancient Clans", "Independent Alliance", "Beast Lords"];
  state.regionControl[r] = owners[Math.floor(Math.random() * owners.length)];
  state.events = state.events || [];
  state.events.push({ title: "Region Control Shift", desc: r + " is now influenced by " + state.regionControl[r] });
  saveState();
  showToast(r + " → " + state.regionControl[r]);
  switchView("map");
}

function guidedCampaignStep() {
  ensureWave3();
  if (!state.campaign) state.campaign = { step: 0 };
  const steps = [
    { msg: "Campaign 1/8: Create a world", view: "world" },
    { msg: "Campaign 2/8: Create a Dou Zhe", view: "character" },
    { msg: "Campaign 3/8: Train once", view: "cultivation" },
    { msg: "Campaign 4/8: Learn a technique", view: "techniques" },
    { msg: "Campaign 5/8: Travel on the map", view: "map" },
    { msg: "Campaign 6/8: Generate 2 chapters", view: "story" },
    { msg: "Campaign 7/8: Try branching story", view: "branch" },
    { msg: "Campaign 8/8: Attempt breakthrough", view: "cultivation" }
  ];
  const i = state.campaign.step;
  if (i >= steps.length) { showToast("Guided campaign complete. You are ready."); return; }
  showToast(steps[i].msg);
  state.campaign.step = i + 1;
  saveState();
  switchView(steps[i].view);
}

function elementalPreview(a, b) {
  try {
    const adv = getAttrAdvantage(a, b);
    if (adv > 1) return a + " advantages over " + b;
    if (adv < 1) return a + " is disadvantaged vs " + b;
    return a + " vs " + b + " is neutral";
  } catch (e) {
    return "Elemental matrix ready";
  }
}

function replayLastBattles() {
  ensureWave3();
  if (!state.battleReplays.length && !state.duelLog) {
    showToast("No battle replays yet");
    return;
  }
  const lines = (state.battleReplays || []).slice(-5).map(x => x.note + " @ " + (x.region || "?"));
  const duels = (state.duelLog || []).slice(-5).map(d => d.winner + " beat " + d.loser);
  alert("Battle Replays:\\n" + (lines.join("\\n") || "none") + "\\n\\nDuels:\\n" + (duels.join("\\n") || "none"));
}



// ===== WAVE 100: META SYSTEMS COVERING 100 IMPROVEMENTS =====

function ensure100() {
  if (!state.achievements) state.achievements = {};
  if (!state.difficulty) state.difficulty = "Heavenly";
  if (!state.worldSeed) state.worldSeed = Math.random().toString(36).slice(2, 10).toUpperCase();
  if (!state.news) state.news = [];
  if (!state.collections) state.collections = { flames: 0, beasts: 0, techniques: 0, endings: 0 };
  if (!state.sectLaws) state.sectLaws = ["No betrayal of sect allies", "Contribute monthly", "Protect outer disciples"];
  if (!state.chapterMode) state.chapterMode = "standard";
  if (!state.prestige) state.prestige = 0;
  if (!state.bookmarks) state.bookmarks = [];
  const char = getActiveChar && getActiveChar();
  if (char) {
    if (char.body == null) char.body = randInt ? randInt(30, 70) : 50;
    if (char.soul == null) char.soul = randInt ? randInt(30, 70) : 50;
    if (char.qiTrack == null) char.qiTrack = randInt ? randInt(30, 70) : 50;
  }
}

function unlockAch(id, name) {
  ensure100();
  if (state.achievements[id]) return;
  state.achievements[id] = { name, t: Date.now() };
  showToast("Achievement: " + name);
}

function pushNews(title, desc) {
  ensure100();
  state.news.unshift({ title, desc, t: Date.now() });
  if (state.news.length > 40) state.news.pop();
}

function setDifficulty(d) {
  ensure100();
  state.difficulty = d;
  saveState();
  showToast("Difficulty: " + d);
}

function setChapterMode(m) {
  ensure100();
  state.chapterMode = m;
  saveState();
  showToast("Chapter mode: " + m);
}

function trainTrack(track) {
  const char = getActiveChar();
  if (!char) return;
  ensure100();
  if (char.body == null) char.body = 50;
  if (char.soul == null) char.soul = 50;
  if (char.qiTrack == null) char.qiTrack = 50;
  const gain = state.difficulty === "Hell" ? randInt(1, 3) : state.difficulty === "Mortal" ? randInt(3, 7) : randInt(2, 5);
  char[track] = Math.min(100, (char[track] || 50) + gain);
  char.douQi = (char.douQi || 100) + gain * 10;
  unlockAch("train_" + track, "Tempered " + track);
  saveState();
  switchView("cultivation");
  showToast(track + " +" + gain);
}

function addSectLaw() {
  ensure100();
  const laws = ["Silence on inner affairs", "Hunt traitors", "Tribute to elders", "No private Heavenly Flames", "Mandatory arena spars"];
  const law = laws[Math.floor(Math.random() * laws.length)];
  if (!state.sectLaws.includes(law)) state.sectLaws.push(law);
  pushNews("Sect Law", "A new law was declared: " + law);
  saveState();
  showToast("Law added: " + law);
}

function breakSectLaw() {
  ensure100();
  const char = getActiveChar();
  if (!state.sectLaws.length) return showToast("No laws");
  const law = state.sectLaws[Math.floor(Math.random() * state.sectLaws.length)];
  if (char) char.wanted = Math.min(5, (char.wanted || 0) + 1);
  pushNews("Law Broken", (char ? char.name : "Someone") + " violated: " + law);
  saveState();
  showToast("Broke law: " + law);
}

function bookmarkChapter() {
  if (!state.storyChapters.length) return showToast("No chapters");
  ensure100();
  const ch = state.storyChapters[state.storyChapters.length - 1];
  state.bookmarks.push(ch.title);
  saveState();
  showToast("Bookmarked: " + ch.title);
}

function rewriteChapter() {
  if (!state.storyChapters.length) return showToast("No chapters");
  generateChapter();
  unlockAch("rewrite", "Story Rewrite");
}

function canonLock() {
  if (!state.storyChapters.length) return showToast("No chapters");
  const ch = state.storyChapters[state.storyChapters.length - 1];
  ch.canon = true;
  saveState();
  showToast("Canon locked: " + ch.title);
}

function showEndingGallery() {
  ensureBranchState && ensureBranchState();
  const ends = (state.branch && state.branch.completedEndings) || [];
  const all = ["ending_solo_glory","ending_alliance","ending_scheme","ending_sect","ending_reject"];
  const lines = all.map(e => (ends.includes(e) ? "✓ " : "□ ") + e);
  alert("Ending Gallery (" + ends.length + "/" + all.length + ")\\n\\n" + lines.join("\\n"));
  unlockAch("gallery", "Viewed Ending Gallery");
}

function exportBranchPath() {
  ensureBranchState && ensureBranchState();
  const path = ((state.branch && state.branch.history) || []).join(" -> ") || "start";
  const visited = ((state.branch && state.branch.visitedNodes) || ["start"]).join(", ");
  const text = "BRANCH PATH\\n" + path + "\\n\\nVISITED\\n" + visited;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "branch-path.txt";
  a.click();
  showToast("Branch path exported");
}

function shareSeed() {
  ensure100();
  alert("World Seed: " + state.worldSeed + "\\n\\nShare this seed code with others as a world tag.");
}

function prestigeReset() {
  const char = getActiveChar();
  if (!char) return;
  if (!confirm("Prestige reset this character? Keep name/talent title bonuses, reset realm to Dou Zhe.")) return;
  ensure100();
  state.prestige += 1;
  char.realm = "Dou Zhe";
  char.star = "1-Star";
  char.douQi = 100;
  char.foundation = 40;
  char.prestigeTitle = "Legacy " + state.prestige;
  unlockAch("prestige", "Prestige Reset");
  saveState();
  switchView("character");
  showToast("Prestige " + state.prestige);
}

function collectionSync() {
  ensure100();
  state.collections.flames = (state.flames || []).length;
  state.collections.beasts = (state.beasts || []).length;
  state.collections.techniques = (state.techniques || []).length;
  state.collections.endings = ((state.branch && state.branch.completedEndings) || []).length;
  if (state.collections.flames >= 3) unlockAch("flames3", "Flame Collector");
  if (state.collections.techniques >= 5) unlockAch("tech5", "Technique Hoarder");
  if ((state.storyChapters || []).length >= 10) unlockAch("ch10", "Ten Chapters");
  saveState();
  showToast("Collections synced");
}

function dailyChallenge() {
  const challenges = [
    "Win one battle",
    "Write 2 chapters",
    "Travel to another region",
    "Complete a faction mission",
    "Gather resources once",
    "Finish one branching ending"
  ];
  const c0 = challenges[Math.floor(Math.random() * challenges.length)];
  ensure100();
  state.dailyChallenge = c0;
  pushNews("Daily Challenge", c0);
  saveState();
  showToast("Daily: " + c0);
}

function worldBossPing() {
  ensure100();
  state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
  pushNews("World Boss", "A roaming catastrophic aura appeared. Threat now " + state.globalThreat);
  const char = getActiveChar();
  if (char && Math.random() > 0.5) {
    char.experience = Math.min(100, (char.experience || 20) + 5);
    showToast("You observed the boss aura and gained insight");
  } else showToast("World boss pressure intensifies");
  saveState();
}

function cityHub() {
  ensure100();
  const services = ["Shop", "Clinic", "Arena Desk", "Mission Board", "Tea House Intel"];
  const pick = services[Math.floor(Math.random() * services.length)];
  const char = getActiveChar();
  if (pick === "Clinic" && char) {
    char.injured = Math.max(0, (char.injured || 0) - 1);
    showToast("City Clinic: recovered slightly");
  } else if (pick === "Shop" && char) {
    if (!char.inventory) char.inventory = [];
    char.inventory.push(generateItem());
    showToast("City Shop: bought an item");
  } else if (pick === "Arena Desk") {
    showToast("Arena Desk: season board updated");
  } else if (pick === "Mission Board") {
    gainContribution(5);
    showToast("Mission Board: minor contribution");
  } else {
    showToast("Tea House: rumors heard");
    pushNews("Tea House", "A rumor about Ancient Clan movement spreads.");
  }
  saveState();
}

function showcaseExport() {
  ensure100();
  collectionSync();
  const char = getActiveChar();
  let t = "HEAVENLY DAO SHOWCASE\\nSeed: " + state.worldSeed + "\\nDifficulty: " + state.difficulty + "\\n";
  t += "Chapters: " + ((state.storyChapters || []).length) + "\\n";
  t += "Achievements: " + Object.keys(state.achievements || {}).length + "\\n";
  if (char) t += "Hero: " + char.name + " | " + char.star + " " + char.realm + "\\n";
  t += "Collections: " + JSON.stringify(state.collections) + "\\n";
  t += "Threat: " + (state.globalThreat || 1) + "\\n";
  const blob = new Blob([t], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dao-showcase.txt";
  a.click();
  unlockAch("showcase", "Showcase Exported");
}

function renderAchievements() {
  ensure100();
  const list = Object.values(state.achievements || {});
  return `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><h3 class="card-title">Achievements & Meta</h3></div>
      <p style="color:var(--text-muted);">Seed <strong>${state.worldSeed}</strong> · Difficulty <strong>${state.difficulty}</strong> · Prestige <strong>${state.prestige||0}</strong></p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
        <button class="btn-ghost" onclick="setDifficulty('Mortal')">Mortal</button>
        <button class="btn-ghost" onclick="setDifficulty('Heavenly')">Heavenly</button>
        <button class="btn-ghost" onclick="setDifficulty('Hell')">Hell</button>
        <button class="btn-ghost" onclick="setChapterMode('short')">Short Chapters</button>
        <button class="btn-ghost" onclick="setChapterMode('standard')">Standard</button>
        <button class="btn-ghost" onclick="setChapterMode('epic')">Epic</button>
        <button class="btn-ghost" onclick="shareSeed()">Share Seed</button>
        <button class="btn-ghost" onclick="showEndingGallery()">Ending Gallery</button>
        <button class="btn-ghost" onclick="exportBranchPath()">Export Branch Path</button>
        <button class="btn-ghost" onclick="collectionSync()">Sync Collections</button>
        <button class="btn-ghost" onclick="dailyChallenge()">Daily Challenge</button>
        <button class="btn-ghost" onclick="showcaseExport()">Showcase Export</button>
        <button class="btn-ghost" onclick="prestigeReset()">Prestige Reset</button>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <h3 class="card-title" style="margin-bottom:10px;">Achievements (${list.length})</h3>
      ${list.length ? list.map(a => `<div style="padding:8px 0;border-bottom:1px solid var(--border);">${a.name}</div>`).join("") : `<p style="color:var(--text-dim)">None yet</p>`}
    </div>
    <div class="card" style="margin-bottom:16px;">
      <h3 class="card-title" style="margin-bottom:10px;">Continent News</h3>
      ${(state.news||[]).slice(0,12).map(n => `<div style="padding:8px 0;border-bottom:1px solid var(--border);"><strong style="color:var(--gold);">${n.title}</strong><div style="color:var(--text-muted);font-size:0.88rem;">${n.desc}</div></div>`).join("") || `<p style="color:var(--text-dim)">No news</p>`}
    </div>
    <div class="card">
      <h3 class="card-title" style="margin-bottom:10px;">Sect Laws</h3>
      <ul style="color:var(--text-muted);padding-left:18px;">${(state.sectLaws||[]).map(l=>`<li>${l}</li>`).join("")}</ul>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-ghost" onclick="addSectLaw()">Add Law</button>
        <button class="btn-ghost" onclick="breakSectLaw()">Break a Law</button>
      </div>
    </div>
  `;
}



// ===== QUALITY WAVE (100 improvements layer) =====

// SAVE_VERSION already declared at top
let undoStack = [];
let searchQuery = "";

function migrateSave(raw) {
  if (!raw || typeof raw !== "object") raw = {};
  raw.version = (typeof SAVE_VERSION !== 'undefined' ? SAVE_VERSION : 3);
  const arrays = ["characters","techniques","flames","beasts","sects","clans","empires","academies","auctions","pillTowers","events","pills","storyChapters","news","bookmarks","battleReplays","artifacts","sectLaws"];
  arrays.forEach(k => { if (!Array.isArray(raw[k])) raw[k] = []; });
  if (!raw.meta) raw.meta = { tone: "heroic", season: "Calm Season", danger: 1, tutorialStep: 0 };
  if (!raw.resources) raw.resources = { herbs: 0, cores: 0, ores: 0 };
  if (!raw.achievements) raw.achievements = {};
  if (!raw.branch) raw.branch = { current: "start", history: [], flags: {}, completedEndings: [], visitedNodes: ["start"] };
  if (!raw.currentRegion) raw.currentRegion = "Outerland";
  if (!raw.difficulty) raw.difficulty = "Heavenly";
  if (!raw.worldSeed) raw.worldSeed = Math.random().toString(36).slice(2, 10).toUpperCase();
  if (!raw.stats) raw.stats = { battles: 0, chapters: 0, chapters: 0, travels: 0, breakthroughs: 0 };
  if (!raw.featureFlags) raw.featureFlags = { hardModePreview: true, experimentalSearch: true };
  return raw;
}

function pushUndo() {
  try {
    undoStack.push(JSON.stringify(state));
    if (undoStack.length > 15) undoStack.shift();
  } catch (e) {}
}

function undoLast() {
  if (state.lineage && state.lineage.ironman) return showToast("Ironman lineage forbids undo");
  if (!undoStack.length) return showToast("Nothing to undo");
  try {
    state = migrateSave(JSON.parse(undoStack.pop()));
    localStorage.setItem("heavenlyDaoState", JSON.stringify(state));
    switchView("dashboard");
    showToast("Undid last major state snapshot");
  } catch (e) {
    showToast("Undo failed");
  }
}

function safeSaveState() {
  pushUndo();
  state.version = SAVE_VERSION;
  localStorage.setItem("heavenlyDaoState", JSON.stringify(state));
}

// wrap saveState usage: redefine saveState if exists later - patch after
function exportFullSave() {
  const data = JSON.stringify(migrateSave(state), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "heavenly-dao-save.json";
  a.click();
  showToast("Full save exported");
}

function importFullSave() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.onchange = async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      state = migrateSave(raw);
      localStorage.setItem("heavenlyDaoState", JSON.stringify(state));
      switchView("dashboard");
      showToast("Save imported");
    } catch (e) {
      showToast("Import failed");
    }
  };
  input.click();
}

function globalSearch(q) {
  searchQuery = (q || "").toLowerCase().trim();
  if (!searchQuery) return showToast("Enter a search term");
  const hits = [];
  (state.characters || []).forEach(c => { if ((c.name||"").toLowerCase().includes(searchQuery)) hits.push("Character: " + c.name); });
  (state.techniques || []).forEach(t => { if ((t.name||"").toLowerCase().includes(searchQuery)) hits.push("Technique: " + t.name); });
  (state.flames || []).forEach(f => { if ((f.name||"").toLowerCase().includes(searchQuery)) hits.push("Flame: " + f.name); });
  (state.storyChapters || []).forEach(ch => { if ((ch.title||"").toLowerCase().includes(searchQuery) || (ch.content||"").toLowerCase().includes(searchQuery)) hits.push("Chapter: " + ch.title); });
  (state.sects || []).forEach(s => { if ((s.name||"").toLowerCase().includes(searchQuery)) hits.push("Sect: " + s.name); });
  alert((hits.slice(0, 30).join("\\n") || "No hits") + (hits.length > 30 ? "\\n..." : ""));
}

function renderStats() {
  const s = state.stats || { battles: 0, chapters: 0, chapters: 0, travels: 0, breakthroughs: 0 };
  const ach = Object.keys(state.achievements || {}).length;
  return `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><h3 class="card-title">Statistics</h3></div>
      <div class="grid-4">
        <div class="stat-box"><div class="label">Battles</div><div class="value">${s.battles||0}</div></div>
        <div class="stat-box"><div class="label">Chapters</div><div class="value">${(state.storyChapters||[]).length}</div></div>
        <div class="stat-box"><div class="label">Endings</div><div class="value">${((state.branch&&state.branch.completedEndings)||[]).length}</div></div>
        <div class="stat-box"><div class="label">Achievements</div><div class="value">${ach}</div></div>
        <div class="stat-box"><div class="label">Travels</div><div class="value">${s.travels||0}</div></div>
        <div class="stat-box"><div class="label">Breakthroughs</div><div class="value">${s.breakthroughs||0}</div></div>
        <div class="stat-box"><div class="label">Wins</div><div class="value">${s.wins||0}</div></div>
        <div class="stat-box"><div class="label">Seed</div><div class="value" style="font-size:0.9rem;">${state.worldSeed||"—"}</div></div>
      </div>
    </div>
    <div class="card">
      <h3 class="card-title" style="margin-bottom:10px;">Quality Tools</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <button class="btn-ghost" onclick="undoLast()">↩️ Undo</button>
        <button class="btn-ghost" onclick="exportFullSave()">📤 Export Save</button>
        <button class="btn-ghost" onclick="importFullSave()">📥 Import Save</button>
        <button class="btn-ghost" onclick="runGlobalSearchPrompt()">🔎 Global Search</button>
        <button class="btn-ghost" onclick="showRelationshipGraph()">💞 Relationship Graph</button>
        <button class="btn-ghost" onclick="simulateChoicePreview()">🔮 Choice Preview</button>
        <button class="btn-ghost" onclick="toggleHardIronman()">☠️ Toggle Ironman</button>
        <button class="btn-ghost" onclick="contentBrowser()">📚 Content Browser</button>
      </div>
      <p style="color:var(--text-dim);font-size:0.85rem;margin-top:12px;">Save version: ${state.version||SAVE_VERSION} · Ironman: ${(state.featureFlags&&state.featureFlags.ironman)?"ON":"OFF"}</p>
    </div>
  `;
}

function runGlobalSearchPrompt() {
  const q = prompt("Search characters, techniques, flames, chapters, sects:");
  if (q != null) globalSearch(q);
}

function showRelationshipGraph() {
  const char = getActiveChar();
  if (!char) return showToast("Select a character");
  ensureCast && ensureCast(char);
  const rival = (char.storyMemory && char.storyMemory.rival && char.storyMemory.rival.name) || "None";
  const stage = char.rivalStage || "strangers";
  const aff = (char.affiliations||[]).map(a=>a.name).join(", ") || "None";
  const cast = char.cast || {};
  alert("RELATIONSHIP GRAPH\\n\\nSelf: "+char.name+"\\nRival: "+rival+" ("+stage+")\\nMaster: "+(cast.master||"—")+"\\nSibling: "+(cast.sibling||"—")+"\\nBetrayer: "+(cast.betrayer||"—")+"\\nAffiliations: "+aff);
}

function simulateChoicePreview() {
  alert("Choice Preview (example odds)\\n\\nFight: +EXP, 30% injury\\nScheme: +comprehension, +wanted risk\\nEndure: +foundation, slower plot\\n\\nIn Branching Story, read effects on each button path carefully.");
}

function toggleHardIronman() {
  if (!state.featureFlags) state.featureFlags = {};
  state.featureFlags.ironman = !state.featureFlags.ironman;
  saveState();
  showToast("Ironman " + (state.featureFlags.ironman ? "ON (no undo recommended)" : "OFF"));
}

function contentBrowser() {
  const lines = [];
  lines.push("Characters: " + (state.characters||[]).map(c=>c.name).join(", "));
  lines.push("Flames: " + (state.flames||[]).map(f=>f.name).join(", "));
  lines.push("Techniques: " + (state.techniques||[]).slice(0,12).map(t=>t.name).join(", "));
  lines.push("Sects: " + (state.sects||[]).map(s=>s.name).join(", "));
  alert(lines.join("\\n\\n") || "Empty world");
}

function bumpStat(key, n) {
  if (!state.stats) state.stats = { battles: 0, wins: 0, chapters: 0, travels: 0, breakthroughs: 0 };
  state.stats[key] = (state.stats[key] || 0) + (n || 1);
}



// ===== CONTINUOUS LINEAGE SIMULATION =====

function ensureSim() {
  if (!state.sim) {
    state.sim = {
      running: false,
      speed: 1,
      tick: 0,
      year: 1,
      month: 1,
      log: [],
      lineageAlive: true,
      extinctReason: null,
      autoStory: true
    };
  }
  if (!state.lineage) {
    state.lineage = {
      founderId: null,
      generations: 1,
      heirs: [],
      dead: [],
      bloodName: null
    };
  }
}

function simLog(msg) {
  ensureSim();
  state.sim.log.unshift({ t: state.sim.tick, year: state.sim.year, month: state.sim.month, msg });
  if (state.sim.log.length > 80) state.sim.log.pop();
}

function getLineageCharacters() {
  ensureSim();
  const founderId = state.lineage.founderId;
  return (state.characters || []).filter(c => {
    if (c.alive === false) return false;
    if (!founderId) return !!c.isFounder || !!c.isHeir;
    if (c.id === founderId || c.lineageId === founderId || c.isHeir || c.isFounder) return true;
    // recruits / spouses tagged to clan
    if (c.clanId && state.lineage && c.clanId === state.lineage.founderId) return true;
    if (c.bloodName && state.lineage.bloodName && c.bloodName === state.lineage.bloodName) return true;
    // any living member with generation set after dynasty start counts as clan
    if (c.generation && c.generation >= 1 && (c.lineageId || c.isHeir || c.adopted)) return true;
    return false;
  });
}

function markFounder() {
  ensureSim();
  ensureWealth();
  let char = getActiveChar();
  if (!char && state.characters && state.characters.length) {
    char = state.characters[0];
    state.currentCharacterId = char.id;
  }
  if (!char) return showToast("Create/select a character to become lineage founder");
  state.lineage.founderId = char.id;
  state.lineage.bloodName = char.name.split(" ").slice(-1)[0] || char.name;
  char.isFounder = true;
  char.alive = true;
  char.generation = 1;
  try {
    ensureHierarchy();
    ensureProgression();
    if (state.progression && state.progression.mode === "bottom_up") {
      state.hierarchy.roles[char.id] = "outer";
      state.progression.merit[char.id] = 60;
    } else {
      state.hierarchy.roles[char.id] = "patriarch";
    }
  } catch(e) {}
  state.sim.lineageAlive = true;
  state.sim.extinctReason = null;
  state.sim.year = state.sim.year || 1;
  state.sim.month = state.sim.month || 1;
  // founding grant
  state.clanWealth.gold = (state.clanWealth.gold || 0) + 50;
  state.clanWealth.renown = Math.max(state.clanWealth.renown || 1, 2);
  simLog(char.name + " founded the lineage (" + state.lineage.bloodName + " blood). Vault seeded.");
  try { pushNews("Founding", char.name + " established the " + state.lineage.bloodName + " lineage."); } catch(e) {}
  saveState();
  showToast("Lineage founder set: " + char.name);
  switchView("simulation");
}

function birthHeir(parent) {
  try { if (typeof LIVING_CAP !== "undefined" && getLineageCharacters().length >= LIVING_CAP) { simLog("Birth blocked — living cap " + LIVING_CAP); return null; } } catch(e) {}
  // NOTE: do not auto-organize here unless state.simExtra.autoOrgOnBirth === true (default false)
  try {
    ensureProgression();
    // child starts at bottom
  } catch(e) {}
  try { markHierarchyDirty("birth"); } catch(e) {}
  try {
    ensureOrgPolicyFlags();
    if (state.simExtra && state.simExtra.autoOrgOnBirth && !(state.orgControl && state.orgControl.freezeRanks)) {
      // rare: only if user enabled
      autoOrganizeByCultivation();
      enforceJuniorOuterAll();
      clearHierarchyDirty();
    }
  } catch(e) {}

  ensureSim();
  if (!parent || parent.alive === false) return null;
  const child = generateCharacter("Dou Zhe");
  child.name = (child.name.split(" ")[0]) + " " + (state.lineage.bloodName || parent.name.split(" ").slice(-1)[0] || "Xiao");
  child.age = randInt(14, 18);
  child.alive = true;
  child.isHeir = true;
  child.lineageId = state.lineage.founderId || parent.id;
  child.generation = (parent.generation || 1) + 1;
  child.parentName = parent.name;
  child.bloodline = parent.bloodline;
  const talentPool = ["Ordinary","Good","Excellent","Genius","Monster"];
  let tIdx = talentPool.indexOf(parent.talent);
  if (tIdx < 0) tIdx = 1;
  tIdx = Math.max(0, Math.min(4, tIdx + randInt(-1, 1)));
  child.talent = talentPool[tIdx];
  if (parent.boundFlame && Math.random() > 0.85) child.secrets = "Inherited a faint flame resonance from " + parent.name;
  state.characters.push(child);
  state.lineage.heirs.push(child.id);
  state.lineage.generations = Math.max(state.lineage.generations || 1, child.generation);
  simLog("Heir born: " + child.name + " (Gen " + child.generation + ") from " + parent.name);
  try { pushNews("Heir", child.name + " of generation " + child.generation + " enters the clan."); } catch(e) {}
  return child;
}

function killCharacter(char, reason) {
  if (!char || char.alive === false) return;
  char.alive = false;
  char.deathReason = reason || "fell on the cultivation road";
  char.deathYear = state.sim.year;
  try { autoSuccessorOnDeath(char); } catch(e) {}
  try { autoOrganizeOnPatriarchDeath(char); } catch(e) {}
  try { leadershipPipelineOnPatriarchDeath(char); } catch(e) {}
  try {
    if (typeof isPatriarch === 'function' && isPatriarch(char)) {
      state.storyChapters.push({ title: 'The Patriarch Falls Y' + (state.sim&&state.sim.year), content: char.name + ' has fallen. The hierarchy trembles. A succession storm gathers over the ' + (state.lineage.bloodName||'clan') + ' bloodline.' });
      simLog('Patriarch death chapter written.');
    }
  } catch(e) {}
  state.lineage.dead = state.lineage.dead || [];
  state.lineage.dead.push({ name: char.name, reason: char.deathReason, year: state.sim.year, generation: char.generation || 1 });
  simLog(char.name + " died: " + char.deathReason);
  if (state.currentCharacterId === char.id) {
    const living = getLineageCharacters();
    state.currentCharacterId = living.length ? living[0].id : null;
  }
}

function checkExtinction() {
  // epitaph enrichment below when extinct

  ensureSim();
  const living = getLineageCharacters();
  if (!state.lineage.founderId) return false;
  if (living.length === 0) {
    state.sim.lineageAlive = false;
    try {
      const score = typeof dynastyAgeScore === "function" ? "see score" : "";
      state.storyChapters.push({ title: "Epitaph Y"+(state.sim.year||1), content: "The " + (state.lineage.bloodName||"clan") + " bloodline ends.\nPrestige: " + ((state.hierarchy&&state.hierarchy.prestigeTier)||"?") + "\nDead recorded: " + ((state.lineage.dead||[]).length) + "\nHall: " + ((state.simExtra&&state.simExtra.patriarchHall)||[]).map(h=>h.name).slice(0,5).join(", ") });
    } catch(e) {}
    state.sim.running = false;
    state.sim.extinctReason = "No living heirs remain. The lineage ends in year " + state.sim.year + ".";
    simLog("LINEAGE EXTINCT — " + state.sim.extinctReason);
    try { pushNews("Extinction", state.sim.extinctReason); } catch(e) {}
    try {
      const deadN = (state.lineage.dead || []).length;
      const gen = state.lineage.generations || 1;
      state.storyChapters.push({
        title: "Epitaph: End of the " + (state.lineage.bloodName || "Blood") + " Line",
        content: "In year " + state.sim.year + ", the last living carrier of the " + (state.lineage.bloodName || "lineage") + " name fell.\n\nGenerations endured: " + gen + ". Recorded deaths: " + deadN + ". Clan gold at extinction: " + ((state.clanWealth && state.clanWealth.gold) || 0) + ".\n\nThe Heavenly Dao did not eulogize them. Only the chronicle remains."
      });
    } catch(e) {}
    showToast("Lineage extinct — epitaph written");
    return true;
  }
  return false;
}

function simTick(force) {
  ensureSim();
  // force=true: single month/year step even when continuous run is OFF
  if (!force) {
    if (!state.sim.running || !state.sim.lineageAlive) return;
  } else {
    if (state.sim.lineageAlive === false) return;
  }
  if (!state.world) { if (!force) state.sim.running = false; showToast("Create a world first"); return; }
  if (!state.lineage.founderId) { if (!force) state.sim.running = false; showToast("Set a lineage founder first"); return; }

  state.sim.tick += 1;
  state.sim.month += 1;
  if (state.sim.month > 12) {
    state.sim.month = 1;
    state.sim.year += 1;
  }
  if (state.calendar) {
    state.calendar.month = state.sim.month;
    state.calendar.year = state.sim.year;
  }

  const living = getLineageCharacters();
  living.forEach(char => {
    // age
    if (state.sim.month === 1) char.age = (char.age || 16) + 1;

    // passive cultivation
    let renownBoost = 1 + Math.min(0.5, ((state.clanWealth && state.clanWealth.renown) || 1) * 0.03);
    if ((state.lineageTraits||[]).includes("Genius Blood")) renownBoost *= 1.1;
    if ((state.lineageTraits||[]).includes("Flame Affinity") && char.attribute === "Fire") renownBoost *= 1.08;
    let gain = Math.floor(randInt(20, 90) * (state.sim.speed || 1) * renownBoost);
    try { ensureDynasty(); if (state.dynasty.buildings.trainingGround) gain = Math.floor(gain * (1 + 0.05 * state.dynasty.buildings.trainingGround)); if (state.dynasty.focusId === char.id) gain = Math.floor(gain * 1.12); } catch(e) {}
    try { applyAgendaToChar(char); } catch(e) {}
    if (state.succession && state.succession.designatedId === char.id) gain = Math.floor(gain * 1.15);
    if ((state.lineageTraits||[]).includes("Short-Lived") && Math.random() > 0.995) { /* extra mortality handled below via age */ }
    char.douQi = (char.douQi || 100) + gain;
    char.experience = Math.min(100, (char.experience || 20) + randInt(0, 2));
    if (Math.random() > 0.92) {
      char.foundation = Math.min(100, (char.foundation || 40) + 1);
    }

    // random breakthrough attempt for active-ish members
    if (Math.random() > (0.97 + (1 - (typeof breakthroughChanceMult==="function"?breakthroughChanceMult(char):1)) * 0.02)) {
      const ranks = DOU_QI_RANKS.map(r => r.name);
      const idx = ranks.indexOf(char.realm);
      const starIdx = STARS.indexOf(char.star);
      if (Math.random() > 0.5 && starIdx < STARS.length - 1) {
        char.star = STARS[Math.min(starIdx + 1, STARS.length - 1)];
        simLog(char.name + " advanced to " + char.star + " " + char.realm);
      } else if (idx >= 0 && idx < ranks.length - 1 && (char.foundation || 0) > 35 && Math.random() > 0.6) {
        char.realm = ranks[idx + 1];
        char.star = "1-Star";
        simLog(char.name + " broke through to " + char.realm + "!");
        try { bumpStat("breakthroughs", 1); } catch(e) {}
      }
    }

    // death risks scale with age and threat
    const threat = state.globalThreat || 1;
    let deathChance = 0.0012 + Math.max(0, (char.age || 20) - 90) * 0.008;
    deathChance += threat * 0.0008;
    if (char.injured) deathChance += char.injured * 0.01;
    if ((state.lineageTraits||[]).includes("Short-Lived")) deathChance += 0.01;
    if ((state.lineageTraits||[]).includes("Iron Constitution")) deathChance *= 0.7;
    try { ensureDynasty(); if (state.dynasty.stabilizeMonths > 0) deathChance *= 0.55; if (state.dynasty.buildings.guardPost) deathChance *= Math.max(0.7, 1 - 0.04 * state.dynasty.buildings.guardPost); } catch(e) {}
    try { deathChance *= (typeof deathMult==='function'?deathMult():1); } catch(e) {}
    if (Math.random() < deathChance) {
      const reasons = ["killed in a resource struggle", "failed tribulation", "ambushed while traveling", "old wounds claimed their life", "perished guarding the clan", "fallen in a flame contention", "betrayed during a secret deal"];
      killCharacter(char, reasons[Math.floor(Math.random() * reasons.length)]);
      try {
        ensureWealth();
        // inheritance: small vault gift from the dead
        state.clanWealth.gold = (state.clanWealth.gold || 0) + randInt(5, 25);
        state.clanWealth.renown = Math.max(1, (state.clanWealth.renown || 1));
        simLog("Estate residues flowed into the clan vault.");
      } catch(e) {}
    }

    // birth chance for adults (marriage increases odds)
    if (char.alive !== false && (char.age || 0) >= 20 && (char.age || 0) <= 70) {
      let birthNeed = 0.978;
      if (char.spouse) birthNeed -= 0.025;
      if (char.marriageBonus) birthNeed -= char.marriageBonus;
      if ((state.clanWealth && state.clanWealth.renown || 0) > 5) birthNeed -= 0.01;
      if (Math.random() > birthNeed) birthHeir(char);
    }

    // injury recovery
    if (char.injured && Math.random() > 0.7) char.injured = Math.max(0, char.injured - 1);
  });

  // clan wealth yearly pulse
  if (state.sim.month === 1) {
    try { recordYearlySnapshot(); } catch(e) {}
    try { rivalTick(); } catch(e) {}
    try { outerRebellionCheck(); prestigeTierFromRenown(); } catch(e) {}
    try {
      dutyBonusesTick(); autoStipendYearly(); elderSeatLoyaltyCheck();
      ancestorBlessingTickGated();
      idleDividendTick(); recordPatriarchHall(); rivalPowerRace(); checkWinConditions();
      largeClanUnrestTick(); goalProgressTick(); elderTermTick(); pillRoomMeritTick();
      if (state.sim.month===1) { yearlyPromotionBoard(); resetMeritYearCaps(); seatStagnationTick(); }
      bottomUpLegendWin(); successionCrisisCheck(); geConflictEvent(); resourceClaimEvent();
      checkClimbAchievement(); showEndingIfAny();
    } catch(e) {}
    try { ensureSimDepth(); refreshYearlyAP(); tickOrders(); if (state.sim.month===3) tradeCaravan(); checkBankruptcy(); balancePassSoft(); } catch(e) {}
    try { ensureHierarchy(); const elders = getLineageCharacters().filter(x => hierarchyPower(x) >= 3); if (elders.length && Math.random()>0.5) state.clanWealth.renown = (state.clanWealth.renown||1)+1; } catch(e) {}
    try { if (state.sim.year % 10 === 0 && state.sim.month === 1) { simLog('Decade mark Y'+state.sim.year); try { decadeSummary(); } catch(e2) {} } } catch(e) {}
    try {
      ensureDynasty();
      if (state.dynasty.debtTimer > 0) {
        state.dynasty.debtTimer -= 12;
        if (state.dynasty.debtTimer <= 0 && state.dynasty.debt > 0) {
          state.clanWealth.renown = Math.max(1, (state.clanWealth.renown||1)-2);
          simLog('Debt default! Renown damaged.');
        }
      }
      if (state.dynasty.stabilizeMonths > 0) state.dynasty.stabilizeMonths = Math.max(0, state.dynasty.stabilizeMonths - 12);
      // building upkeep
      const up = (state.dynasty.buildings.pillRoom||0) + (state.dynasty.buildings.trainingGround||0) + (state.dynasty.buildings.guardPost||0);
      if (up) state.clanWealth.gold = Math.max(0, (state.clanWealth.gold||0) - up * 2);
    } catch(e) {}
    try { clanTradeYearly(); simLog("Clan vault yearly trade. Gold now " + (state.clanWealth && state.clanWealth.gold)); } catch(e) {}
    try {
      const gen = state.lineage.generations || 1;
      if ([3,5,10].includes(gen) && !state.lineage["milestone"+gen]) {
        state.lineage["milestone"+gen] = true;
        state.clanWealth.gold = (state.clanWealth.gold||0) + gen * 20;
        state.clanWealth.renown = (state.clanWealth.renown||1) + 1;
        simLog("Generation milestone " + gen + " reached! Clan rewards granted.");
      }
    } catch(e) {}
  }

  // world drift
  if (state.sim.month % 3 === 0) {
    try { if (typeof advanceSeason === "function" && Math.random() > 0.7) { /* occasional season */ } } catch(e) {}
    if (Math.random() > 0.6) {
      state.globalThreat = Math.max(1, Math.min(10, (state.globalThreat || 1) + (Math.random() > 0.5 ? 1 : -1)));
    }
    const worldEvents = [
      "A flame rumor stirred the markets.",
      "Beast tide pressure rose at the borders.",
      "An auction of contested treasures turned bloody.",
      "Ancient Clan envoys passed through the region.",
      "A quiet span — only small vendettas matured.",
      "A traveling alchemist sold dubious rank pills.",
      "Border cities raised mercenary bounties.",
      "A secret realm flickered open for seven days.",
      "Clanless geniuses formed a temporary alliance.",
      "Tax collectors of an empire overreached and died for it."
    ];
    const ev = worldEvents[Math.floor(Math.random() * worldEvents.length)];
    state.events = state.events || [];
    state.events.push({ title: "Sim Y" + state.sim.year + " M" + state.sim.month, desc: ev });
    simLog(ev);
    try { if (offerSimChoice(ev)) { saveState(); switchView("simulation"); return; } } catch(e) {}
    try { if (Math.random() > 0.65 && triggerSimPlusEvent()) { saveState(); switchView("simulation"); return; } } catch(e) {}
    // wealth shock
    try {
      ensureWealth();
      if (ev.includes("auction") || ev.includes("markets")) state.clanWealth.gold += randInt(-10, 30);
      if (ev.includes("Beast tide")) state.clanWealth.gold = Math.max(0, (state.clanWealth.gold||0) - randInt(0, 15));
      if (ev.includes("secret realm") && Math.random() > 0.6) state.clanWealth.cores = (state.clanWealth.cores||0) + 1;
      if (state.clanWealth.gold < 0) state.clanWealth.gold = 0;
    } catch(e) {}
  }

  // auto story occasionally for active char
  if (state.sim.autoStory && state.sim.month % 6 === 0 && Math.random() > 0.5) {
    const active = getActiveChar();
    if (active && active.alive !== false) {
      try {
        // lightweight chronicle entry without full view switch
        const line = active.name + " continued the long road in year " + state.sim.year + ", holding " + active.star + " " + active.realm + " under rising continental pressure.";
        state.storyChapters.push({ title: "Chronicle Y" + state.sim.year + "M" + state.sim.month, content: line });
      } catch(e) {}
    }
  }

  try { softCapLiving(); } catch(e) {}
  try { enforceLivingCap(); } catch(e) {}
  try { softLandingNearExtinction(); capWarnings(); } catch(e) {}
  // --- CONNECTED SIM PIPELINE ---
  try { snapMonthStart(); } catch(e) {}
  try { if (state.sim && state.sim.month) progressionTick(); } catch(e) {}
  try { managementMonthTick(); } catch(e) {}
  try { managementUpgradeTick(); } catch(e) {}
  try { autoManageMonthAssist(); } catch(e) {}
  try { unifyRankCaps(); } catch(e) {}
  try { geAuraTick(); } catch(e) {}
  try { geOfficeTick(); } catch(e) {}
  try { uniqueMonthlyOrders(); } catch(e) {}
  try { patriarchRepairTick(); } catch(e) {}
  try { regentTermTick(); } catch(e) {}
  try { successionCrisisTick(); } catch(e) {}
  try { popSoftCapTick(); } catch(e) {}
  try { incomeScaleTick(); } catch(e) {}
  try { seasonalFestivalAuto(); } catch(e) {}
  try { rivalWarCheck(); } catch(e) {}
  try { worldSimMonthTick(); } catch(e) {}
  try { worldDepthMonthTick(); } catch(e) {}
  try { sanitizeResources(); } catch(e) {}
  try { computeMonthDeltas(); } catch(e) {}
  try { refreshPatriarchAP(); } catch(e) {}
  try { fullSimSeasonEvent(); fullSimPhaseUpdate(); } catch(e) {}
  try { nearExtinctionWarn(); } catch(e) {}
  try { if (state.sim.month === 12) yearReportModal(); } catch(e) {}
  try { recordPauseReasonClear(); } catch(e) {}
  if (checkExtinction()) {
    try { recordPauseReason("extinction"); } catch(e) {}
    state.sim.running = false;
    saveState();
    switchView("simulation");
    return;
  }

  if (state.sim.tick % 5 === 0) saveState();
}

let _simTimer = null;
function startSimulation() {
  ensureSim();
  ensureWealth();
  if (!state.lineage.founderId) return showToast("Set lineage founder first");
  if (!state.world) return showToast("Create a world first");
  if (!getLineageCharacters().length) return showToast("No living lineage members");
  state.sim.running = true;
  state.sim.lineageAlive = true;
  try { ensureFullSim(); state.fullSim.phase = "reign"; } catch(e) {}
  try { ensureManagement(); ensureMgmtDepth && ensureMgmtDepth(); } catch(e) {}
  try { repairPatriarch({ reason: "sim start" }); } catch(e) {}
  try { if (state.mgmt && state.mgmt.autoManage) autoManageMonthAssist(); } catch(e) {}
  simLog("Simulation started" + (state.lineage.ironman ? " [IRONMAN]" : ""));
  try { pushNews("Simulation", "Lineage chronicle begins continuous timeflow."); } catch(e) {}
  saveState();
  if (_simTimer) { clearInterval(_simTimer); _simTimer = null; }
  const ms = Math.max(200, 900 / Math.max(1, (state.sim.speed || state.sim30 && state.sim30.simSpeed || 1)));
  // Main-thread ticks only — worker path skipped management/merit/food
  _simTimer = setInterval(() => {
    if (!state.sim || !state.sim.running) { clearInterval(_simTimer); _simTimer = null; return; }
    if (state.sim.pendingChoice) return;
    try {
      simTick(true);
      const bc = document.getElementById("breadcrumb");
      const onSim = bc && /Lineage/i.test(bc.textContent || "");
      if (onSim) {
        if ((state.sim.tick || 0) % 3 === 0 || state.sim.pendingChoice) switchView("simulation");
      }
    } catch (err) {
      console && console.error && console.error(err);
    }
  }, ms);
  switchView("simulation");
  showToast("Simulation running (full management)");
}

function stopSimulation() {
  try { stopScoreboard(); } catch(e) {}

  ensureSim();
  state.sim.running = false;
  if (_simTimer) { clearInterval(_simTimer); _simTimer = null; }
  saveState();
  showToast("Simulation paused");
  switchView("simulation");
}



function forceHeir() {
  ensureWealth();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select a living parent");
  const cost = char.spouse ? 15 : 35;
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " clan gold (married parents cheaper)");
  state.clanWealth.gold -= cost;
  const child = birthHeir(char);
  if (child) {
    simLog("Clan sponsored heir ceremony for " + child.name + " (-" + cost + " gold)");
    saveState();
    showToast("Heir created: " + child.name);
    switchView("simulation");
  }
}

function renderSimulation() {
  ensureSim();
  const living = getLineageCharacters();
  const dead = state.lineage.dead || [];
  const founder = (state.characters || []).find(c => c.id === state.lineage.founderId);
  return `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header">
        <h3 class="card-title">Lineage Simulation</h3>
        <span class="badge ${state.sim.running ? "badge-green" : "badge-purple"}">${state.sim.running ? "RUNNING" : "PAUSED"}</span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:12px;">A continuous world tick. Characters age, cultivate, birth heirs, and die. The simulation ends when no lineage members remain.</p>
      <div class="grid-4" style="margin-bottom:12px;">
        <div class="stat-box"><div class="label">Year</div><div class="value" id="sim-year">${state.sim.year}</div></div>
        <div class="stat-box"><div class="label">Month</div><div class="value" id="sim-month">${state.sim.month}</div></div>
        <div class="stat-box"><div class="label">Generation</div><div class="value">${state.lineage.generations||1}</div></div>
        <div class="stat-box"><div class="label">Living</div><div class="value" id="sim-living">${living.length}</div></div>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;">Founder: <strong style="color:var(--gold);">${founder ? founder.name : "Not set"}</strong> · Blood: ${state.lineage.bloodName || "—"} · Threat: ${state.globalThreat||1} · Tick: ${state.sim.tick||0}</p>
      <p style="color:var(--text-dim);font-size:0.82rem;margin-top:6px;">Tip: Marry spouses before forcing heirs. Renown boosts passive cultivation. Ironman blocks undo.</p>
      ${typeof renderSimSections==='function' ? renderSimSections() : ''}
      ${state.sim.pendingChoice ? `
        <div class="pause-card" style="position:relative;margin-top:14px;width:auto;">
          <h3>Paused Event</h3>
          <p style="color:var(--text-muted);margin-bottom:12px;">${state.sim.pendingChoice.event}</p>
          ${state.sim.pendingChoice.options.map(o => `<button class="btn-primary" style="width:100%;margin-bottom:8px;" onclick="resolveSimChoice('${o.effect}')">${o.label}<br><span style="font-size:0.75rem;opacity:.85">${typeof chanceLabel==='function'?chanceLabel(o.effect):''}</span></button>`).join("")}
        </div>
      ` : ""}
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;">
        <button class="btn-ghost" onclick="togglePauseOnEvents()">Pause-on-Event: ${state.sim.pauseOnEvents===false?"OFF":"ON"}</button>
        <button class="btn-ghost" onclick="switchView('familytree')">🌳 Family Tree Page</button>
        <button class="btn-ghost" onclick="enableWatchOnly()">👀 Watch-Only</button>
        <button class="btn-ghost" onclick="initSimWorker(); showToast(_simWorkerFail ? 'Worker unavailable — main thread' : (_simWorkerReady ? 'Worker ready' : 'Worker starting…'))">⚙️ Sim Worker Status</button>
        <button class="btn-ghost" onclick="startOnboarding()">📘 Onboarding 2-min</button>
        <button class="btn-ghost" onclick="simulateYears(10)">⏩ Simulate 10 Years</button>
        <button class="btn-ghost" onclick="balanceReadout()">📊 Balance Readout</button>

        <button class="btn-ghost" onclick="setFocusCharacter()">🎯 Set Focus Character</button>
        <button class="btn-ghost" onclick="politicalMarriage()">💍 Political Marriage</button>
        <button class="btn-ghost" onclick="startCrisisChain()">🔥 Seasonal Crisis Chain</button>
        <button class="btn-ghost" onclick="upgradeBuilding('pillRoom')">🏠 Pill Room</button>
        <button class="btn-ghost" onclick="upgradeBuilding('trainingGround')">🏋️ Training Ground</button>
        <button class="btn-ghost" onclick="upgradeBuilding('guardPost')">🏯 Guard Post</button>
        <button class="btn-ghost" onclick="takeMerchantLoan()">💸 Take Loan</button>
        <button class="btn-ghost" onclick="payDebt()">💳 Pay Debt</button>
        <button class="btn-ghost" onclick="stabilizeClan()">🛡 Stabilize Clan</button>
        <button class="btn-ghost" onclick="treasureMapUse()">🗺 Treasure Map</button>
        <button class="btn-ghost" onclick="decadeSummary()">📘 Decade Summary</button>
        <button class="btn-ghost" onclick="disownHeir()">🚫 Disown Heir</button>
        <button class="btn-ghost" onclick="pinLastLog()">📌 Pin Last Log</button>
        <button class="btn-ghost" onclick="simSpeedUntilEvent()">⏭ Speed Until Event</button>

      </div>
      <div class="card" style="margin-top:12px;padding:12px;">
        <h4 style="color:var(--gold);margin-bottom:8px;">Vault Ledger</h4>
        ${typeof renderVaultLedger==='function' ? renderVaultLedger() : ''}
        <h4 style="color:var(--gold);margin:12px 0 8px;">Pause Choice History</h4>
        ${(state.pauseHistory||[]).slice(0,8).map(p => `<div style="font-size:0.8rem;color:var(--text-muted);padding:3px 0;">Y${p.y}M${p.m}: ${p.event} → ${p.effect}</div>`).join("") || '<p style="color:var(--text-dim);font-size:0.82rem;">No pause choices yet</p>'}
      </div>
      ${!state.sim.lineageAlive ? `<p style="color:var(--red-glow);margin-top:10px;"><strong>EXTINCT:</strong> ${state.sim.extinctReason||""}</p>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;">
        <button class="btn-primary" onclick="markFounder()">👑 Set Active as Founder</button>
        <button class="btn-primary" onclick="startSimulation()">▶️ Start Forever Sim</button>
        <button class="btn-ghost" onclick="stopSimulation()">⏸ Pause</button>
        <button class="btn-ghost" onclick="setSimSpeed(1)">x1</button>
        <button class="btn-ghost" onclick="setSimSpeed(2)">x2</button>
        <button class="btn-ghost" onclick="setSimSpeed(5)">x5</button>
        <button class="btn-ghost" onclick="forceHeir()">👶 Force Heir</button>
        <button class="btn-ghost" onclick="marrySpouse()">💍 Marry Spouse</button>
        <button class="btn-ghost" onclick="clanDepositFromChar()">💰 Contribute to Clan</button>
        <button class="btn-ghost" onclick="clanInvestCultivation()">📿 Clan Funds Cultivation</button>
        <button class="btn-ghost" onclick="toggleLineageIronman()">☠️ Ironman Lineage</button>
        <button class="btn-ghost" onclick="designateSuccessor()">👑 Designate Successor</button>
        <button class="btn-ghost" onclick="addLineageTrait()">🧬 Lineage Trait</button>
        <button class="btn-ghost" onclick="buildTomb()">🪦 Build Tomb</button>
        <button class="btn-ghost" onclick="successionCrisis()">⚔️ Succession Crisis</button>
        <button class="btn-ghost" onclick="adoptGenius()">🧒 Adopt Genius</button>
        <button class="btn-ghost" onclick="exportFamilyTree()">🌳 Export Family Tree</button>
        <button class="btn-ghost" onclick="runShowcaseDemo()">🎬 Showcase Demo</button>
        <button class="btn-ghost" onclick="resetLineageKeepWorld()">♻️ Reset Lineage Keep World</button>
        <button class="btn-ghost" onclick="simTick(true); switchView('simulation')">⏭ Single Tick</button>
      </div>
      <div class="grid-4" style="margin-top:14px;">
        <div class="stat-box"><div class="label">Clan Gold</div><div class="value" id="sim-gold">${(state.clanWealth&&state.clanWealth.gold)||0}</div></div>
        <div class="stat-box"><div class="label">Herbs</div><div class="value">${(state.clanWealth&&state.clanWealth.herbs)||0}</div></div>
        <div class="stat-box"><div class="label">Cores</div><div class="value">${(state.clanWealth&&state.clanWealth.cores)||0}</div></div>
        <div class="stat-box"><div class="label">Renown</div><div class="value">${(state.clanWealth&&state.clanWealth.renown)||1}</div></div>
      </div>
      <p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">Ironman: <strong style="color:${state.lineage.ironman? 'var(--red-glow)' : 'var(--gold)'};">${state.lineage.ironman ? "ON (permanent deaths)" : "OFF"}</strong></p>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-top:6px;">Focus: ${(state.dynasty&&state.dynasty.focusId)?((state.characters.find(x=>x.id===state.dynasty.focusId)||{}).name||'?') : '—'} · Buildings P${(state.dynasty&&state.dynasty.buildings&&state.dynasty.buildings.pillRoom)||0}/T${(state.dynasty&&state.dynasty.buildings&&state.dynasty.buildings.trainingGround)||0}/G${(state.dynasty&&state.dynasty.buildings&&state.dynasty.buildings.guardPost)||0} · Debt ${(state.dynasty&&state.dynasty.debt)||0} · Stabilize ${(state.dynasty&&state.dynasty.stabilizeMonths)||0}m · Rival: ${(state.dynasty&&state.dynasty.rival&&state.dynasty.rival.name)||'—'}</p>
      <p style="color:var(--text-dim);font-size:0.82rem;margin-top:6px;">Traits: ${(state.lineageTraits||[]).join(", ") || "none"} · Tombs: ${(state.tombs||[]).length} · Successor: ${state.succession && state.succession.designatedId ? (state.characters.find(x=>x.id===state.succession.designatedId)||{}).name || state.succession.designatedId : "none"}</p>
    </div>

    ${typeof renderHierarchyBoard==='function' ? renderHierarchyBoard() : ''}
    ${typeof paginatedLivingList==='function' ? paginatedLivingList() : ''}
    <div class="card" style="margin-bottom:16px;${(getLineageCharacters().length>40)?'display:none;':''}">
      <h3 class="card-title" style="margin-bottom:10px;">Living Lineage</h3>
      <div style="margin-bottom:8px;">${typeof paginatedLivingList==='function' ? '' : ''}</div>
      ${living.length ? living.map(c => `
        <div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div>
            <strong style="color:var(--gold);">${c.name}</strong>
            <div style="font-size:0.82rem;color:var(--text-muted);">Gen ${c.generation||1} · Age ${c.age||"?"} · ${c.star} ${c.realm} · ${c.talent} · <span style="color:var(--gold);">${typeof hierarchyLabel==='function'?hierarchyLabel(c):''}</span> · Loy ${typeof loyaltyOf==='function'?loyaltyOf(c):'?'} · Merit ${typeof getMerit==='function'?getMerit(c):'?'}${c.cadetBranch?' · Cadet':''}${c.education?' · Edu '+c.education:''}${c.spouse ? " · Spouse: "+c.spouse : ""}${c.parentName ? " · Child of "+c.parentName : ""}</div>
          </div>
          <button class="btn-ghost" onclick="state.currentCharacterId='${c.id}'; saveState(); switchView('character')">Select</button>
        </div>
      `).join("") : `<p style="color:var(--text-dim);">No living lineage members. Set a founder.</p>`}
    </div>

    <div class="card" style="margin-bottom:16px;">
      <h3 class="card-title" style="margin-bottom:10px;">Simulation Log</h3>
      <div style="max-height:260px;overflow:auto;">
        ${(state.sim.log||[]).slice(0,15).map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem;color:${typeof colorizeSimLogLine==='function'?colorizeSimLogLine(l.msg):'var(--text-muted)'}"><span style="color:var(--gold);">Y${l.year}M${l.month}</span> — ${l.msg}</div>`).join("") || `<p style="color:var(--text-dim)">No ticks yet</p>`}
      </div>
    </div>

    <div class="card">
      <h3 class="card-title" style="margin-bottom:10px;">Ancestral Record (Dead)</h3>
      ${dead.length ? dead.slice().reverse().map(d => `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem;color:var(--text-muted);">${d.name} · Gen ${d.generation||"?"} · Y${d.year} — ${d.reason}</div>`).join("") : `<p style="color:var(--text-dim)">No deaths recorded</p>`}
    </div>
  `;
}



// ===== Marriage, Clan Wealth, Ironman Lineage =====

function ensureWealth() {
  ensureSim();
  if (!state.clanWealth) {
    state.clanWealth = { gold: 100, herbs: 5, cores: 1, ores: 2, renown: 1 };
  }
  if (!state.lineage) ensureSim();
  if (state.lineage.ironman == null) state.lineage.ironman = false;
}

function marrySpouse() {
  ensureWealth();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select a living character");
  if (char.spouse) return showToast("Already married to " + char.spouse);
  if ((char.age || 0) < 18) return showToast("Too young to marry");
  const cost = 40;
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need 40 clan gold for marriage rites");
  state.clanWealth.gold -= cost;
  const spouse = generateName();
  char.spouse = spouse;
  char.marriedYear = state.sim.year;
  // marriage slightly improves birth odds marker
  char.marriageBonus = 0.02;
  state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
  simLog(char.name + " married " + spouse + ". Clan gold -" + cost);
  try { pushNews("Marriage", char.name + " married " + spouse + "."); } catch(e) {}
  saveState();
  showToast("Married: " + spouse);
  switchView("simulation");
}

function clanDepositFromChar() {
  ensureWealth();
  const char = getActiveChar();
  if (!char) return;
  const amt = Math.min(200, Math.floor((char.douQi || 100) / 20));
  state.clanWealth.gold = (state.clanWealth.gold || 0) + Math.max(10, amt);
  simLog(char.name + " contributed resources to clan vault (+" + Math.max(10, amt) + " gold)");
  saveState();
  showToast("Clan gold: " + state.clanWealth.gold);
  switchView("simulation");
}

function clanInvestCultivation() {
  ensureWealth();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select living character");
  const cost = 30;
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need 30 clan gold");
  state.clanWealth.gold -= cost;
  char.douQi = (char.douQi || 100) + randInt(150, 400);
  char.foundation = Math.min(100, (char.foundation || 40) + randInt(1, 3));
  if ((state.clanWealth.herbs || 0) > 0 && Math.random() > 0.5) {
    state.clanWealth.herbs -= 1;
    char.comprehension = Math.min(100, (char.comprehension || 20) + 1);
  }
  simLog("Clan invested in " + char.name + "'s cultivation (-" + cost + " gold)");
  saveState();
  showToast("Cultivation funded by clan vault");
  switchView("simulation");
}

function clanTradeYearly() {
  ensureWealth();
  // passive wealth tick called from sim
  const renown = state.clanWealth.renown || 1;
  const living = getLineageCharacters().length;
  const gain = randInt(1, 8) + Math.floor(living * 1.5) + Math.floor(renown / 2);
  state.clanWealth.gold = (state.clanWealth.gold || 0) + gain;
  try { ledgerAdd('Yearly trade +'+gain, gain); } catch(e) {}
  if (Math.random() > 0.7) state.clanWealth.herbs = (state.clanWealth.herbs || 0) + randInt(0, 2);
  if (Math.random() > 0.85) state.clanWealth.cores = (state.clanWealth.cores || 0) + 1;
}

function toggleLineageIronman() {
  ensureWealth();
  if (state.lineage.ironman && state.sim && state.sim.tick > 0) {
    return showToast("Ironman already sealed for this lineage run");
  }
  state.lineage.ironman = !state.lineage.ironman;
  if (state.lineage.ironman) {
    // hardcore rules
    state.featureFlags = state.featureFlags || {};
    state.featureFlags.ironman = true;
    simLog("IRONMAN LINEAGE SEALED — no revive, deaths permanent, undo discouraged");
    showToast("Ironman lineage ON");
  } else {
    showToast("Ironman lineage OFF");
  }
  saveState();
  switchView("simulation");
}

function ironmanBlockRevive() {
  ensureWealth();
  return !!(state.lineage && state.lineage.ironman);
}



// ===== WAVE 100B: lineage drama, story tools, product meta =====

function ensure100b() {
  ensureSim && ensureSim();
  ensureWealth && ensureWealth();
  if (!state.lineageTraits) state.lineageTraits = [];
  if (!state.succession) state.succession = { designatedId: null };
  if (!state.tombs) state.tombs = [];
  if (!state.demo) state.demo = { running: false };
  if (!state.lineageWarnings) state.lineageWarnings = [];
}

function designateSuccessor() {
  ensure100b();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select a living heir/member");
  state.succession.designatedId = char.id;
  simLog(char.name + " designated as successor");
  saveState();
  showToast("Successor: " + char.name);
  switchView("simulation");
}

function addLineageTrait() {
  ensure100b();
  const traits = ["Flame Affinity", "Short-Lived", "Genius Blood", "Iron Constitution", "Cursed Fate", "Merchant Mind"];
  const t = traits[Math.floor(Math.random() * traits.length)];
  if (!state.lineageTraits.includes(t)) state.lineageTraits.push(t);
  simLog("Lineage trait emerged: " + t);
  saveState();
  showToast("Trait: " + t);
}

function buildTomb() {
  ensure100b();
  const dead = (state.lineage.dead || [])[state.lineage.dead.length - 1];
  if (!dead) return showToast("No dead ancestors yet");
  if ((state.clanWealth.gold || 0) < 20) return showToast("Need 20 gold for tomb");
  state.clanWealth.gold -= 20;
  state.tombs.push({ name: dead.name, year: dead.year, buff: "foundation" });
  // small buff to living
  getLineageCharacters().forEach(c => {
    c.foundation = Math.min(100, (c.foundation || 40) + 1);
  });
  simLog("Tomb raised for " + dead.name);
  saveState();
  showToast("Ancestral tomb built");
}

function exportFamilyTree() {
  ensure100b();
  const living = typeof getLineageCharacters === "function" ? getLineageCharacters() : [];
  const dead = state.lineage.dead || [];
  let t = "FAMILY TREE — " + (state.lineage.bloodName || "?") + "\\n";
  t += "Generations: " + (state.lineage.generations || 1) + "\\n\\nLIVING\\n";
  living.forEach(c => {
    t += "- Gen " + (c.generation || 1) + " " + c.name + " | " + c.star + " " + c.realm + (c.spouse ? " | spouse " + c.spouse : "") + (c.parentName ? " | child of " + c.parentName : "") + "\\n";
  });
  t += "\\nDEAD\\n";
  dead.forEach(d => { t += "- Gen " + (d.generation || "?") + " " + d.name + " Y" + d.year + " — " + d.reason + "\\n"; });
  t += "\\nTraits: " + (state.lineageTraits || []).join(", ") + "\\n";
  t += "Successor: " + (state.succession.designatedId || "none") + "\\n";
  const blob = new Blob([t], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "family-tree.txt";
  a.click();
  showToast("Family tree exported");
}

function successionCrisis() {
  ensure100b();
  const living = getLineageCharacters();
  if (living.length < 2) return showToast("Need 2+ living members");
  const a = living[0], b = living[1];
  simLog("Succession crisis between " + a.name + " and " + b.name);
  if (Math.random() > 0.5) {
    state.succession.designatedId = a.id;
    applyInjury(b, 1);
    simLog(a.name + " seized succession; " + b.name + " injured");
  } else {
    state.succession.designatedId = b.id;
    applyInjury(a, 1);
    simLog(b.name + " seized succession; " + a.name + " injured");
  }
  state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - randInt(5, 20));
  saveState();
  switchView("simulation");
  showToast("Succession crisis resolved");
}

function nearExtinctionWarn() {
  ensure100b();
  const living = getLineageCharacters();
  if (living.length === 1 && state.lineage.founderId) {
    const msg = "LAST HEIR WARNING: only " + living[0].name + " remains";
    if (!state.lineageWarnings.includes(msg)) {
      state.lineageWarnings.push(msg);
      simLog(msg);
      showToast(msg);
    }
  }
}

function adoptGenius() {
  ensure100b();
  if ((state.clanWealth.gold || 0) < 60) return showToast("Need 60 gold to adopt outside genius");
  state.clanWealth.gold -= 60;
  const child = generateCharacter("Dou Zhe");
  child.name = child.name.split(" ")[0] + " " + (state.lineage.bloodName || "Adopted");
  child.alive = true;
  child.isHeir = true;
  child.adopted = true;
  child.lineageId = state.lineage.founderId;
  child.generation = (state.lineage.generations || 1);
  child.talent = ["Genius", "Monster", "Excellent"][Math.floor(Math.random() * 3)];
  state.characters.push(child);
  state.lineage.heirs.push(child.id);
  state.clanWealth.renown = Math.max(1, (state.clanWealth.renown || 1) - 0); // adoption may dilute prestige slightly narrative-only
  simLog("Adopted genius " + child.name + " into the lineage");
  saveState();
  showToast("Adopted: " + child.name);
  switchView("simulation");
}

function runShowcaseDemo() {
  ensure100b();
  if (!state.world) createWorld();
  if (!state.characters.length) createCharacter("Dou Zhe");
  const char = state.characters[0];
  state.currentCharacterId = char.id;
  markFounder();
  try { marrySpouse(); } catch(e) {}
  try { forceHeir(); } catch(e) {}
  state.sim.speed = 5;
  startSimulation();
  showToast("Showcase demo running");
}

function storyDebtPayoff() {
  const char = getActiveChar();
  if (!char || !char.storyMemory || !(char.storyMemory.debts || []).length) {
    // create a debt payoff style chapter anyway if branch flags
    if (state.branch && state.branch.flags && Object.keys(state.branch.flags).length) {
      writeSpecialFlagChapter();
      return;
    }
    return showToast("No stored debts/flags yet — play stories/branches first");
  }
  const debt = char.storyMemory.debts.pop();
  state.storyChapters.push({
    title: "Payoff: Old Debt",
    content: char.name + " finally faced an old debt: " + debt + ".\\n\\nWhether paid in gold, blood, or humiliation, the ledger closed — and a new enmity opened elsewhere."
  });
  char.experience = Math.min(100, (char.experience || 20) + 5);
  saveState();
  switchView("story");
  showToast("Debt payoff chapter written");
}

function breakthroughPreview() {
  const char = getActiveChar();
  if (!char) return showToast("Select character");
  const rankIndex = DOU_QI_RANKS.findIndex(r => r.name === char.realm);
  let chance = 0.35 - (rankIndex * 0.025);
  if (char.talent === "Against the Heavens") chance += 0.35;
  else if (char.talent === "Monster") chance += 0.25;
  else if (char.talent === "Genius") chance += 0.15;
  chance += (char.foundation || 0) / 200;
  chance = Math.max(0.05, Math.min(0.95, chance));
  alert("Breakthrough preview for " + char.name + "\\nRealm: " + char.star + " " + char.realm + "\\nEstimated success chance: " + Math.round(chance * 100) + "%\\nFoundation: " + (char.foundation || 0));
}

function resetLineageKeepWorld() {
  if (!confirm("Reset lineage data but keep world/content?")) return;
  stopSimulation && stopSimulation();
  state.lineage = { founderId: null, generations: 1, heirs: [], dead: [], bloodName: null, ironman: false };
  state.sim = { running: false, speed: 1, tick: 0, year: 1, month: 1, log: [], lineageAlive: true, extinctReason: null, autoStory: true };
  state.clanWealth = { gold: 100, herbs: 5, cores: 1, ores: 2, renown: 1 };
  state.succession = { designatedId: null };
  state.tombs = [];
  state.lineageTraits = [];
  // revive flags on characters lightly
  (state.characters || []).forEach(c => { c.alive = true; c.isFounder = false; c.isHeir = false; });
  saveState();
  showToast("Lineage reset; world kept");
  switchView("simulation");
}



function ensurePause() {
  if (!state.sim) return;
  if (state.sim.pauseOnEvents == null) state.sim.pauseOnEvents = true;
  if (!state.sim.pendingChoice) state.sim.pendingChoice = null;
}

function offerSimChoice(eventName) {
  try {
    ensureSimFinal();
    if (state.simFinal && state.simFinal.pauseFilter === "important") {
      const n = (eventName||"").toLowerCase();
      const important = n.includes("death") || n.includes("succession") || n.includes("war") || n.includes("crisis") || n.includes("extinct") || n.includes("promotion") || n.includes("council");
      if (!important) return false;
    }
  } catch(e) {}

  ensurePause();
  if (!state.sim.pauseOnEvents || state.sim.watchOnly || !state.sim.running) return false;
  // only pause sometimes on notable events
  const choices = {
    "secret realm": [
      { label: "Send heir to the realm", effect: "realm" },
      { label: "Sell the coordinates", effect: "gold" },
      { label: "Ignore the rumor", effect: "safe" }
    ],
    "auction": [
      { label: "Bid aggressively", effect: "bid" },
      { label: "Rob the winner later", effect: "scheme" },
      { label: "Stay out", effect: "safe" }
    ],
    "Beast tide": [
      { label: "Defend the clan", effect: "defend" },
      { label: "Evacuate wealth", effect: "evacuate" },
      { label: "Hide and wait", effect: "safe" }
    ],
    "Ancient Clan": [
      { label: "Offer tribute", effect: "tribute" },
      { label: "Refuse and risk", effect: "refuse" },
      { label: "Seek patron elsewhere", effect: "patron" }
    ]
  };
  let key = null;
  for (const k of Object.keys(choices)) {
    if (eventName.includes(k) || eventName.toLowerCase().includes(k.toLowerCase())) { key = k; break; }
  }
  if (!key) return false;
  state.sim.pendingChoice = { event: eventName, options: choices[key] };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  try { recordPauseReason(eventName); } catch(e) {}
  showToast("Simulation paused for decision");
  return true;
}

function resolveSimChoice(effect) {
  if (String(effect).indexOf('crisis_') === 0) {
    if (effect.indexOf('crisis_open')===0 || effect.indexOf('crisis_regent')===0 || effect.indexOf('crisis_emergency')===0)
      return resolveCrisisCouncilEffects(effect);
    return resolveCrisisEffect(effect);
  }
  if (String(effect).indexOf('res_') === 0) return resolveResourceEffect(effect);
  if (String(effect).indexOf('corr_') === 0) return resolveCorruptEffect(effect);
  if (String(effect).indexOf('peace_') === 0) return resolvePeaceEffect(effect);
  if (String(effect).indexOf('cab_') === 0) return resolveCabinetEffect(effect);
  if (String(effect).indexOf('decree_') === 0) return resolveDecreeEffect(effect);
  if (String(effect).indexOf('famine_') === 0) return resolveFamineEffect(effect);
  if (String(effect).indexOf('marry_') === 0) return resolveMarryEffect(effect);
  if (String(effect).indexOf('ge_split_') === 0) return resolveGeSplit(effect);
  if (String(effect).indexOf('auction_') === 0) return resolveAuctionEffect(effect);
  if (String(effect).indexOf('ext_') === 0) return resolveExtinctionChoice(effect);
  const plus = ['pill','rob','conscript','bribe','hide','flame_hunt','sell_intel','enforce_succ','split_gold','spar','tech_buy','tech_haggle'];
  if (plus.includes(effect)) return resolveSimPlusChoice(effect);
  ensureWealth();
  const living = getLineageCharacters();
  const char = living[0] || getActiveChar();
  let msg = "Decision resolved: " + effect;
  if (effect === "realm" && char) {
    char.experience = Math.min(100, (char.experience||20)+6);
    if (Math.random()>0.5) applyInjury(char,1);
    msg = char.name + " entered a secret realm opportunity.";
  } else if (effect === "gold" || effect === "bid") {
    state.clanWealth.gold = (state.clanWealth.gold||0) + randInt(10, 50);
    msg = "Clan vault changed through market action.";
  } else if (effect === "scheme") {
    state.clanWealth.gold = (state.clanWealth.gold||0) + randInt(20, 70);
    if (char) char.wanted = Math.min(5,(char.wanted||0)+1);
    msg = "Scheme succeeded with heat.";
  } else if (effect === "defend") {
    if (char && Math.random()>0.4) applyInjury(char,1);
    state.clanWealth.renown = (state.clanWealth.renown||1)+1;
    msg = "Clan defended its borders.";
  } else if (effect === "evacuate") {
    state.clanWealth.gold = (state.clanWealth.gold||0) + randInt(5, 20);
    msg = "Wealth evacuated before the tide.";
  } else if (effect === "tribute") {
    state.clanWealth.gold = Math.max(0,(state.clanWealth.gold||0)-25);
    state.clanWealth.renown = (state.clanWealth.renown||1)+1;
    msg = "Tribute paid; pressure eases.";
  } else if (effect === "refuse") {
    state.globalThreat = Math.min(10,(state.globalThreat||1)+1);
    msg = "Refusal raised continental pressure.";
  } else if (effect === "patron") {
    state.clanWealth.renown = (state.clanWealth.renown||1)+1;
    msg = "A new patron relationship begins.";
  } else {
    msg = "The clan chose caution.";
  }
  simLog(msg);
  try { recordPauseChoice((state.sim.pendingChoice&&state.sim.pendingChoice.event)||'event', effect, msg); } catch(e) {}
  state.sim.pendingChoice = null;
  saveState();
  showToast(msg);
  switchView("simulation");
}

function togglePauseOnEvents() {
  ensurePause();
  if (state.sim.watchOnly) { state.sim.watchOnly = false; }
  state.sim.pauseOnEvents = !state.sim.pauseOnEvents;
  saveState();
  showToast("Pause on events: " + (state.sim.pauseOnEvents ? "ON" : "OFF"));
  switchView("simulation");
}

function renderFamilyTreePage() {
  ensureSim();
  return `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header">
        <h3 class="card-title">Family Tree</h3>
        <button class="btn-ghost" onclick="exportFamilyTree()">Export Text</button>
      </div>
      <p style="color:var(--text-muted);margin-bottom:12px;">Visual lineage by generation. Living and fallen ancestors.</p>
      ${window.DaoLineage ? window.DaoLineage.renderTree(state) : "<p>Tree module missing</p>"}
    </div>
    <div class="card">
      <button class="btn-ghost" onclick="switchView('simulation')">← Back to Lineage Sim</button>
    </div>
  `;
}



function startOnboarding() {
  const steps = [
    () => { if (!state.world) createWorld(); showToast("1/5 World ready"); },
    () => { if (!state.characters.length) createCharacter("Dou Zhe"); showToast("2/5 Character ready"); },
    () => { state.currentCharacterId = state.characters[0].id; markFounder(); showToast("3/5 Founder set"); },
    () => { try { marrySpouse(); } catch(e) {} showToast("4/5 Marriage attempted"); },
    () => { switchView("simulation"); showToast("5/5 Open Sim — press Start Forever Sim"); }
  ];
  if (!state.meta) state.meta = {};
  const i = state.meta.onboardStep || 0;
  if (i >= steps.length) { showToast("Onboarding complete"); return; }
  steps[i]();
  state.meta.onboardStep = i + 1;
  saveState();
}


function enableWatchOnly() {
  ensurePause();
  state.sim.watchOnly = true;
  state.sim.pauseOnEvents = false;
  saveState();
  showToast("Watch-only mode: no pause prompts");
  switchView("simulation");
}


function ledgerAdd(msg, goldDelta) {
  ensureWealth();
  if (!state.vaultLedger) state.vaultLedger = [];
  state.vaultLedger.unshift({ y: (state.sim&&state.sim.year)||1, m: (state.sim&&state.sim.month)||1, msg, goldDelta: goldDelta||0 });
  if (state.vaultLedger.length > 40) state.vaultLedger.pop();
}


// ===== WEB WORKER SIM BRIDGE =====
let _simWorker = null;
let _simWorkerReady = false;
let _simWorkerFail = false;
let _simReqId = 0;

function initSimWorker() {
  if (_simWorker || _simWorkerFail) return;
  try {
    _simWorker = new Worker("js/sim.worker.js");
    _simWorker.onmessage = onSimWorkerMessage;
    _simWorker.onerror = function () {
      _simWorkerFail = true;
      _simWorker = null;
      showToast("Sim worker failed — using main thread");
    };
    _simWorker.postMessage({ type: "ping" });
  } catch (e) {
    _simWorkerFail = true;
    _simWorker = null;
  }
}

function onSimWorkerMessage(e) {
  const msg = e.data || {};
  if (msg.type === "pong") {
    _simWorkerReady = true;
    return;
  }
  if (msg.type !== "tickResult") return;
  if (!msg.ok) {
    // fallback single main-thread tick
    try { simTick(); } catch (err) {}
    return;
  }
  applyWorkerTickResult(msg.result);
}

function snapshotForWorker() {
  const living = getLineageCharacters().map(c => ({
    id: c.id,
    name: c.name,
    age: c.age || 16,
    star: c.star,
    realm: c.realm,
    talent: c.talent,
    attribute: c.attribute,
    douQi: c.douQi || 100,
    experience: c.experience || 20,
    foundation: c.foundation || 40,
    injured: c.injured || 0,
    spouse: c.spouse || null,
    marriageBonus: c.marriageBonus || 0,
    generation: c.generation || 1,
    boundFlame: c.boundFlame || null,
    bloodline: c.bloodline || null
  }));
  ensureWealth();
  return {
    living,
    wealth: { ...state.clanWealth },
    year: state.sim.year || 1,
    month: state.sim.month || 1,
    threat: state.globalThreat || 1,
    speed: state.sim.speed || 1,
    traits: state.lineageTraits || [],
    successionId: (state.succession && state.succession.designatedId) || null,
    ironman: !!(state.lineage && state.lineage.ironman)
  };
}

function applyWorkerTickResult(result) {
  if (!result) return;
  ensureSim();
  ensureWealth();
  state.sim.tick = (state.sim.tick || 0) + 1;
  state.sim.year = result.year;
  state.sim.month = result.month;
  if (state.calendar) {
    state.calendar.year = result.year;
    state.calendar.month = result.month;
  }
  state.globalThreat = result.threat;
  state.clanWealth = result.wealth;

  // apply living stats back onto characters
  const byId = {};
  (result.living || []).forEach(l => { byId[l.id] = l; });
  (state.characters || []).forEach(c => {
    if (byId[c.id]) {
      const u = byId[c.id];
      c.age = u.age; c.star = u.star; c.realm = u.realm;
      c.douQi = u.douQi; c.experience = u.experience; c.foundation = u.foundation;
      c.injured = u.injured; c.alive = true;
    }
  });

  // deaths
  (result.deaths || []).forEach(d => {
    const char = (state.characters || []).find(c => c.id === d.id);
    if (char && char.alive !== false) {
      killCharacter(char, d.reason);
    }
  });

  // births via main-thread generator
  (result.births || []).forEach(b => {
    const parent = (state.characters || []).find(c => c.id === b.parentId);
    if (parent) birthHeir(parent);
  });

  (result.log || []).forEach(msg => simLog(msg));
  (result.events || []).forEach(ev => {
    state.events = state.events || [];
    state.events.push({ title: "Sim Y" + result.year + " M" + result.month, desc: ev });
  });

  if (result.extinct || checkExtinction()) {
    state.sim.running = false;
    saveState();
    switchView("simulation");
    return;
  }

  if (result.pauseEvent && state.sim.pauseOnEvents && !state.sim.watchOnly) {
    try {
      if (offerSimChoice(result.pauseEvent)) {
        saveState();
        switchView("simulation");
        return;
      }
    } catch (e) {}
  }

  if (state.sim.tick % 5 === 0) saveState();

  // soft UI update
  const bc = document.getElementById("breadcrumb");
  if (bc && bc.textContent === "Lineage Simulation") {
    try {
      const y = document.querySelector("#sim-year");
      if (y && state.sim.tick % 4 !== 0 && !state.sim.pendingChoice) {
        y.textContent = state.sim.year;
        const m = document.querySelector("#sim-month"); if (m) m.textContent = state.sim.month;
        const g = document.querySelector("#sim-gold"); if (g && state.clanWealth) g.textContent = state.clanWealth.gold || 0;
        const lv = document.querySelector("#sim-living"); if (lv) lv.textContent = getLineageCharacters().length;
      } else {
        switchView("simulation");
      }
    } catch (e) {}
  }
}

function workerSimPulse() {
  if (!_simWorker || _simWorkerFail) {
    simTick();
    return;
  }
  initSimWorker();
  const payload = snapshotForWorker();
  // batch more ticks at higher speed to reduce bridge overhead
  const ticks = Math.min(3, Math.max(1, state.sim.speed || 1));
  _simWorker.postMessage({ type: "tick", payload, ticks, requestId: ++_simReqId });
}



function simulateYears(n) {
  n = n || 10;
  ensureSim();
  ensureWealth();
  if (!state.lineage.founderId) return showToast("Set founder first");
  if (!state.sim.lineageAlive) return showToast("Lineage already extinct");
  const wasRunning = state.sim.running;
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  // prefer worker batch if available
  if (typeof initSimWorker === "function") initSimWorker();
  if (typeof _simWorker !== "undefined" && _simWorker && !_simWorkerFail) {
    const months = n * 12;
    const payload = snapshotForWorker();
    // process in chunks on worker via multiple messages is complex; do main-thread fast batch for reliability
  }
  let guard = 0;
  const targetMonth = (state.sim.year * 12 + state.sim.month) + n * 12;
  while ((state.sim.year * 12 + state.sim.month) < targetMonth && state.sim.lineageAlive && guard < n * 12 + 5) {
    const prevPause = state.sim.pauseOnEvents;
    state.sim.pauseOnEvents = false; // don't stop for choices during batch
    try { simTick(); } catch (e) { console.error(e); break; }
    state.sim.pauseOnEvents = prevPause;
    guard++;
  }
  saveState();
  showToast("Simulated ~" + n + " years → Y" + state.sim.year + " M" + state.sim.month + " · living " + getLineageCharacters().length);
  switchView("simulation");
}

function autoSuccessorOnDeath(deadChar) {
  if (!state.succession) state.succession = { designatedId: null };
  if (state.succession.designatedId && state.succession.designatedId !== deadChar.id) return;
  const living = getLineageCharacters().filter(c => c.id !== deadChar.id);
  if (!living.length) return;
  // prefer highest generation then highest realm index
  living.sort((a, b) => (b.generation || 1) - (a.generation || 1));
  state.succession.designatedId = living[0].id;
  try { simLog(living[0].name + " auto-designated successor after death of " + deadChar.name); } catch(e) {}
}

function softCapLiving() {
  const living = getLineageCharacters();
  const CAP = 200; // soft pressure before hard 1000
  if (living.length <= CAP) return;
  // mark oldest non-successor as "retired from active sim pressure" by raising age risk only — or split excess as dead of natural causes rarely
  const succ = state.succession && state.succession.designatedId;
  const extras = living.filter(c => c.id !== succ).sort((a,b) => (b.age||0) - (a.age||0));
  const overflow = living.length - CAP;
  for (let i = 0; i < overflow && i < extras.length; i++) {
    if (Math.random() > 0.7) {
      killCharacter(extras[i], "natural decline under clan soft-cap pressure");
    }
  }
}

function recordPauseChoice(eventName, effect, msg) {
  if (!state.pauseHistory) state.pauseHistory = [];
  state.pauseHistory.unshift({ y: state.sim.year, m: state.sim.month, event: eventName, effect, msg });
  if (state.pauseHistory.length > 30) state.pauseHistory.pop();
}

function renderVaultLedger() {
  const rows = (state.vaultLedger || []).slice(0, 15);
  if (!rows.length) return '<p style="color:var(--text-dim);font-size:0.85rem;">No vault ledger entries yet.</p>';
  return rows.map(r => `<div style="padding:4px 0;border-bottom:1px solid var(--border);font-size:0.82rem;color:var(--text-muted);">Y${r.y}M${r.m} · ${r.msg} (${r.goldDelta>=0?"+":""}${r.goldDelta})</div>`).join("");
}

function balanceReadout() {
  const dead = state.lineage.dead || [];
  const years = Math.max(1, (state.sim && state.sim.year) || 1);
  const living = getLineageCharacters().length;
  const heirs = (state.lineage.heirs || []).length;
  const avgDeadAge = dead.length ? Math.round(dead.length * 10 / years) / 10 : 0;
  alert("Balance readout\\nYears: " + years + "\\nLiving: " + living + "\\nHeirs recorded: " + heirs + "\\nDeaths: " + dead.length + "\\nDeaths/year: " + (Math.round(dead.length / years * 100) / 100) + "\\nGold: " + ((state.clanWealth&&state.clanWealth.gold)||0));
}



// ===== SIM UPGRADE PACK =====
function ensureSimPlus() {
  ensureSim();
  ensureWealth();
  if (!state.sim.history) state.sim.history = []; // yearly snapshots
  if (state.sim.eventChance == null) state.sim.eventChance = 0.55;
  if (!state.sim.legacies) state.sim.legacies = [];
}

function recordYearlySnapshot() {
  ensureSimPlus();
  if (state.sim.month !== 1) return;
  const living = getLineageCharacters();
  const snap = {
    year: state.sim.year,
    living: living.length,
    gold: (state.clanWealth && state.clanWealth.gold) || 0,
    renown: (state.clanWealth && state.clanWealth.renown) || 1,
    gen: state.lineage.generations || 1,
    threat: state.globalThreat || 1
  };
  state.sim.history.push(snap);
  if (state.sim.history.length > 60) state.sim.history.shift();
}

function simRandomEvent() {
  ensureSimPlus();
  const living = getLineageCharacters();
  if (!living.length) return null;
  const char = living[Math.floor(Math.random() * living.length)];
  const events = [
    {
      title: "Wandering Alchemist",
      desc: "A wandering alchemist offers aid to " + char.name + ".",
      choices: [
        { label: "Buy a foundation pill (-25 gold)", effect: "pill" },
        { label: "Refuse politely", effect: "safe" },
        { label: "Rob the alchemist", effect: "rob" }
      ]
    },
    {
      title: "Border Conscription",
      desc: "Empire officers demand a cultivator for border duty.",
      choices: [
        { label: "Send " + char.name + " (gain renown, risk injury)", effect: "conscript" },
        { label: "Pay exemption (-40 gold)", effect: "bribe" },
        { label: "Hide the clan geniuses", effect: "hide" }
      ]
    },
    {
      title: "Flame Rumor",
      desc: "A ranked flame fluctuation is whispered in " + (state.currentRegion || "the region") + ".",
      choices: [
        { label: "Investigate personally", effect: "flame_hunt" },
        { label: "Sell the intel (+gold)", effect: "sell_intel" },
        { label: "Ignore", effect: "safe" }
      ]
    },
    {
      title: "Heir Dispute",
      desc: "Younger members argue over succession and resources.",
      choices: [
        { label: "Enforce designated successor", effect: "enforce_succ" },
        { label: "Split vault gifts", effect: "split_gold" },
        { label: "Let them spar it out", effect: "spar" }
      ]
    },
    {
      title: "Relic Merchant",
      desc: "A merchant offers a damaged technique jade.",
      choices: [
        { label: "Buy it (-35 gold)", effect: "tech_buy" },
        { label: "Haggle (-20 gold)", effect: "tech_haggle" },
        { label: "Decline", effect: "safe" }
      ]
    }
  ];
  return events[Math.floor(Math.random() * events.length)];
}

function resolveSimPlusChoice(effect) {
  ensureSimPlus();
  const living = getLineageCharacters();
  const char = living[0] || getActiveChar();
  let msg = "Resolved: " + effect;
  if (effect === "pill" && char) {
    if ((state.clanWealth.gold || 0) < 25) msg = "Not enough gold for the pill.";
    else {
      state.clanWealth.gold -= 25;
      char.foundation = Math.min(100, (char.foundation || 40) + randInt(3, 8));
      char.douQi = (char.douQi || 100) + randInt(100, 250);
      msg = char.name + " refined a foundation pill.";
      try { ledgerAdd("Foundation pill -25", -25); } catch(e) {}
    }
  } else if (effect === "rob") {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + randInt(10, 40);
    if (char) char.wanted = Math.min(5, (char.wanted || 0) + 1);
    msg = "The clan seized goods — and heat.";
  } else if (effect === "conscript" && char) {
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
    if (Math.random() > 0.45) applyInjury(char, 1);
    char.experience = Math.min(100, (char.experience || 20) + 5);
    msg = char.name + " served on the border.";
  } else if (effect === "bribe") {
    if ((state.clanWealth.gold || 0) >= 40) {
      state.clanWealth.gold -= 40;
      msg = "Exemption purchased.";
      try { ledgerAdd("Conscription bribe -40", -40); } catch(e) {}
    } else msg = "Could not afford exemption.";
  } else if (effect === "hide") {
    msg = "The clan kept its geniuses out of sight this season.";
  } else if (effect === "flame_hunt" && char) {
    char.experience = Math.min(100, (char.experience || 20) + 6);
    if (Math.random() > 0.6) {
      state.flames = state.flames || [];
      state.flames.push(generateFlame());
      msg = char.name + " returned with flame resonance fortune.";
    } else {
      if (Math.random() > 0.5) applyInjury(char, 1);
      msg = char.name + " found only danger and rumor-ash.";
    }
  } else if (effect === "sell_intel") {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + randInt(20, 55);
    msg = "Intel sold to rival seekers.";
    try { ledgerAdd("Sold flame intel", 30); } catch(e) {}
  } else if (effect === "enforce_succ") {
    if (state.succession && state.succession.designatedId) msg = "Successor authority enforced.";
    else if (char) {
      state.succession = state.succession || {};
      state.succession.designatedId = char.id;
      msg = char.name + " confirmed as successor.";
    }
  } else if (effect === "split_gold") {
    const gift = Math.min(30, Math.floor(((state.clanWealth && state.clanWealth.gold) || 0) * 0.1));
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - gift);
    msg = "Vault gifts calmed the dispute (-" + gift + " gold).";
  } else if (effect === "spar" && living.length >= 2) {
    applyInjury(living[0], 1);
    living[1].experience = Math.min(100, (living[1].experience || 20) + 3);
    msg = "A clan spar spilled blood and insight.";
  } else if (effect === "tech_buy" || effect === "tech_haggle") {
    const cost = effect === "tech_buy" ? 35 : 20;
    if ((state.clanWealth.gold || 0) >= cost) {
      state.clanWealth.gold -= cost;
      state.techniques = state.techniques || [];
      state.techniques.push(generateTechnique());
      msg = "A technique jade entered the clan archive (-" + cost + ").";
    } else msg = "Not enough gold for the jade.";
  } else {
    msg = "The clan chose caution.";
  }
  simLog(msg);
  try { recordPauseChoice((state.sim.pendingChoice && state.sim.pendingChoice.event) || "event", effect, msg); } catch(e) {}
  state.sim.pendingChoice = null;
  saveState();
  showToast(msg);
  switchView("simulation");
}

function triggerSimPlusEvent() {
  const ev = simRandomEvent();
  if (!ev) return false;
  ensurePause();
  if (state.sim.watchOnly || state.sim.pauseOnEvents === false) {
    // auto-resolve safe path
    simLog(ev.title + ": " + ev.desc + " (auto-passed)");
    return false;
  }
  state.sim.pendingChoice = {
    event: ev.title + " — " + ev.desc,
    options: ev.choices.map(c => ({ label: c.label, effect: c.effect }))
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  try { recordPauseReason(ev.title); } catch(e) {}
  showToast("Simulation paused: " + ev.title);
  return true;
}

function renderSimHistorySpark() {
  const h = (state.sim && state.sim.history) || [];
  if (h.length < 2) return '<p style="color:var(--text-dim);font-size:0.82rem;">Yearly history will appear as decades pass.</p>';
  const maxG = Math.max(...h.map(x => x.gold), 1);
  const bars = h.slice(-20).map(x => {
    const ht = Math.max(4, Math.round((x.gold / maxG) * 40));
    return `<div title="Y${x.year} gold ${x.gold} living ${x.living}" style="width:10px;height:${ht}px;background:linear-gradient(180deg,var(--ds-gold),#8a7010);border-radius:2px 2px 0 0;"></div>`;
  }).join("");
  return `<div style="display:flex;align-items:flex-end;gap:3px;height:48px;margin-top:8px;">${bars}</div>
    <p style="color:var(--text-dim);font-size:0.78rem;margin-top:4px;">Vault gold by year (last ${Math.min(20,h.length)} snapshots)</p>`;
}



// ===== COMBAT MECHANICS ENGINE =====
const COMBAT_STANCES = {
  aggressive: { label: "Aggressive", atk: 1.15, def: 0.9, crit: 0.08 },
  balanced: { label: "Balanced", atk: 1.0, def: 1.0, crit: 0.05 },
  defensive: { label: "Defensive", atk: 0.9, def: 1.2, crit: 0.03 },
  scheme: { label: "Scheme", atk: 0.95, def: 0.95, crit: 0.12 }
};

const ELEMENT_MATRIX = {
  Fire: { strong: ["Wind", "Ice"], weak: ["Water", "Earth"] },
  Water: { strong: ["Fire", "Earth"], weak: ["Thunder", "Wind"] },
  Earth: { strong: ["Thunder", "Water"], weak: ["Wind", "Fire"] },
  Wind: { strong: ["Earth", "Water"], weak: ["Fire", "Thunder"] },
  Thunder: { strong: ["Water", "Wind"], weak: ["Earth", "Ice"] },
  Ice: { strong: ["Fire", "Wind"], weak: ["Thunder", "Earth"] },
  Darkness: { strong: ["Light"], weak: ["Light"] },
  Light: { strong: ["Darkness"], weak: ["Darkness"] }
};

function ensureCombatState() {
  if (!state.combat) {
    state.combat = {
      stance: "balanced",
      lastLog: [],
      lastResult: null,
      combo: 0
    };
  }
}

function setCombatStance(s) {
  ensureCombatState();
  if (!COMBAT_STANCES[s]) return showToast("Unknown stance");
  state.combat.stance = s;
  saveState();
  showToast("Stance: " + COMBAT_STANCES[s].label);
  switchView("battle");
}

function rankPower(char) {
  if (!char) return 10;
  const ranks = (typeof DOU_QI_RANKS !== "undefined" ? DOU_QI_RANKS : []).map(r => r.name);
  const ri = Math.max(0, ranks.indexOf(char.realm));
  const stars = (typeof STARS !== "undefined" ? STARS : []);
  const si = Math.max(0, stars.indexOf(char.star));
  let p = 20 + ri * 18 + si * 3;
  p += (char.experience || 0) * 0.35;
  p += (char.foundation || 0) * 0.25;
  p += (char.control || 30) * 0.15;
  if (char.talent === "Against the Heavens") p *= 1.25;
  else if (char.talent === "Monster") p *= 1.15;
  else if (char.talent === "Genius") p *= 1.08;
  if (char.injured) p *= Math.max(0.55, 1 - char.injured * 0.12);
  if (char.boundFlame) p *= 1.08;
  if (char.beastAssist) p *= 1.05;
  if (state.techLoadout && state.techLoadout.active) p *= 1.06;
  if (state.techLoadout && state.techLoadout.passive) p *= 1.03;
  return Math.round(p);
}

function elementMod(att, def) {
  if (!att || !def) return 1;
  const m = ELEMENT_MATRIX[att];
  if (!m) return 1;
  if ((m.strong || []).includes(def)) return 1.2;
  if ((m.weak || []).includes(def)) return 0.85;
  return 1;
}

function rollSkill(name, power) {
  const skills = [
    { name: "Dou Qi Burst", mult: 1.1 },
    { name: "Heavenly Flame Flicker", mult: 1.25, needFlame: true },
    { name: "Beast Companion Strike", mult: 1.15, needBeast: true },
    { name: "Technique Execution", mult: 1.2, needTech: true },
    { name: "Soul Pressure", mult: 1.08 },
    { name: "Guarding Circulation", mult: 0.5, defensive: true }
  ];
  return skills;
}

function simulateDetailedBattle(a, b, options) {
  ensureCombatState();
  options = options || {};
  const stance = COMBAT_STANCES[state.combat.stance || "balanced"];
  const log = [];
  let hpA = 100 + Math.floor(rankPower(a) * 0.4);
  let hpB = 100 + Math.floor(rankPower(b) * 0.4);
  const maxA = hpA, maxB = hpB;
  let atkA = rankPower(a) * stance.atk * elementMod(a.attribute, b.attribute);
  let atkB = rankPower(b) * 1.0 * elementMod(b.attribute, a.attribute);
  let defA = rankPower(a) * 0.35 * stance.def;
  let defB = rankPower(b) * 0.35;
  const statusA = [];
  const statusB = [];
  let combo = 0;

  log.push("Battle start: " + a.name + " (" + (a.star||"?") + " " + (a.realm||"?") + ", " + stance.label + ") vs " + b.name + " (" + (b.star||"?") + " " + (b.realm||"?") + ")");
  log.push("Element: " + (a.attribute||"?") + " vs " + (b.attribute||"?") + " | Loadout active: " + ((state.techLoadout && state.techLoadout.active) || a.technique || "none"));

  const turns = 8 + Math.floor(Math.random() * 5);
  for (let t = 1; t <= turns; t++) {
    if (hpA <= 0 || hpB <= 0) break;

    // status ticks
    if (statusB.includes("burn")) {
      const burn = randInt(3, 8);
      hpB -= burn;
      log.push("Turn " + t + ": Burn sears " + b.name + " (-" + burn + ")");
    }
    if (statusA.includes("seal")) {
      log.push("Turn " + t + ": " + a.name + " struggles under seal.");
    }

    // A acts
    if (!statusA.includes("seal") || Math.random() > 0.5) {
      let skill = "Basic Strike";
      let mult = 1;
      const r = Math.random();
      if (r > 0.82 && a.boundFlame) { skill = "Heavenly Flame Flicker"; mult = 1.3; if (!statusB.includes("burn")) statusB.push("burn"); }
      else if (r > 0.7 && a.beastAssist) { skill = "Beast Assist"; mult = 1.18; }
      else if (r > 0.55 && (state.techLoadout && state.techLoadout.active || a.technique)) { skill = "Technique Execution"; mult = 1.22; }
      else if (r > 0.4) { skill = "Dou Qi Burst"; mult = 1.1; }

      let raw = atkA * mult * (0.85 + Math.random() * 0.3);
      const crit = Math.random() < stance.crit + (combo * 0.02);
      if (crit) { raw *= 1.45; combo += 1; }
      else combo = Math.max(0, combo - 1);
      const dmg = Math.max(4, Math.round(raw - defB * (0.6 + Math.random() * 0.3)));
      hpB -= dmg;
      log.push("Turn " + t + ": " + a.name + " uses " + skill + (crit ? " [CRIT]" : "") + " → " + dmg + " dmg. " + b.name + " HP " + Math.max(0, hpB) + "/" + maxB);
    }

    if (hpB <= 0) break;

    // B acts
    let rawB = atkB * (0.85 + Math.random() * 0.3);
    if (Math.random() > 0.85) { rawB *= 1.25; log.push("Turn " + t + ": " + b.name + " unleashes a finishing intent!"); }
    const dmgB = Math.max(3, Math.round(rawB - defA * (0.6 + Math.random() * 0.3)));
    hpA -= dmgB;
    log.push("Turn " + t + ": " + b.name + " counters → " + dmgB + " dmg. " + a.name + " HP " + Math.max(0, hpA) + "/" + maxA);

    if (Math.random() > 0.9) {
      statusA.push("seal");
      log.push("Turn " + t + ": A sealing technique briefly locks " + a.name + "'s meridians.");
    }
  }

  const win = hpA > hpB && hpA > 0;
  const draw = hpA <= 0 && hpB <= 0;
  let summary;
  if (draw) summary = "Both collapse. A pyrrhic draw.";
  else if (win) summary = a.name + " prevails.";
  else summary = b.name + " prevails.";

  log.push("---");
  log.push(summary + " Final HP " + a.name + " " + Math.max(0,hpA) + " | " + b.name + " " + Math.max(0,hpB));

  // apply consequences
  if (!win && !draw && Math.random() > 0.4) applyInjury(a, 1);
  if (win) {
    a.experience = Math.min(100, (a.experience || 20) + randInt(3, 8));
    try { addMerit(a, 8, "battle win"); } catch(e) {}
    try { bumpStat("battles", 1); bumpStat("wins", 1); } catch(e) {}
  } else {
    try { bumpStat("battles", 1); } catch(e) {}
  }

  const result = {
    winner: draw ? null : (win ? a.name : b.name),
    win,
    draw,
    log,
    hpA: Math.max(0, hpA),
    hpB: Math.max(0, hpB),
    stance: stance.label
  };
  state.combat.lastLog = log;
  state.combat.lastResult = result;
  state.battleReplays = state.battleReplays || [];
  state.battleReplays.unshift({ t: Date.now(), summary: summary, log: log.slice() });
  if (state.battleReplays.length > 15) state.battleReplays.pop();
  return result;
}

function runCombatDemo() {
  const chars = state.characters || [];
  if (chars.length < 1) return showToast("Create a character first");
  let a = getActiveChar() || chars[0];
  let b = chars.find(c => c.id !== a.id);
  if (!b) {
    b = generateCharacter(a.realm || "Dou Zhe");
    b.name = (b.name || "Rival") + " (Sparring Shadow)";
  }
  const res = simulateDetailedBattle(a, b);
  saveState();
  switchView("battle");
  showToast(res.summary || (res.win ? "Victory" : "Defeat"));
}



// ===== FULL SIM SUGGESTION PACK (1-25) =====
function ensureDynasty() {
  ensureSimPlus && ensureSimPlus();
  ensureSim();
  ensureWealth();
  if (!state.dynasty) {
    state.dynasty = {
      focusId: null,
      buildings: { pillRoom: 0, trainingGround: 0, guardPost: 0 },
      debt: 0,
      debtTimer: 0,
      stabilizeMonths: 0,
      rival: null,
      pinnedLog: [],
      crisis: null,
      crisisStep: 0
    };
  }
  if (!state.dynasty.rival) {
    state.dynasty.rival = { name: generateName() + " Clan", renown: 2, living: 3, hostility: 1 };
  }
}

function setFocusCharacter() {
  ensureDynasty();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select a living character");
  state.dynasty.focusId = char.id;
  simLog(char.name + " set as clan focus (training/vault/adventure priority)");
  saveState();
  showToast("Focus: " + char.name);
  switchView("simulation");
}

function getFocusChar() {
  ensureDynasty();
  if (!state.dynasty.focusId) return getLineageCharacters()[0] || getActiveChar();
  return (state.characters || []).find(c => c.id === state.dynasty.focusId && c.alive !== false) || getLineageCharacters()[0];
}

function upgradeBuilding(type) {
  ensureDynasty();
  const costs = { pillRoom: 50, trainingGround: 45, guardPost: 40 };
  const cost = costs[type];
  if (cost == null) return;
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " gold");
  state.clanWealth.gold -= cost;
  state.dynasty.buildings[type] = (state.dynasty.buildings[type] || 0) + 1;
  try { ledgerAdd("Built/upgraded " + type + " -" + cost, -cost); } catch(e) {}
  simLog("Clan structure improved: " + type + " rank " + state.dynasty.buildings[type]);
  saveState();
  showToast(type + " → rank " + state.dynasty.buildings[type]);
  switchView("simulation");
}

function takeMerchantLoan() {
  try { ensureHierDepth(); } catch(e) {}
  if (typeof requirePatriarch === 'function' && !requirePatriarch('take loans')) return;
  ensureDynasty();
  state.clanWealth.gold = (state.clanWealth.gold || 0) + 80;
  state.dynasty.debt += 100;
  state.dynasty.debtTimer = 24; // months
  simLog("Merchant loan taken +80 gold (owe 100 within 24 months)");
  try { ledgerAdd("Loan +80", 80); } catch(e) {}
  saveState();
  showToast("Loan taken — debt 100");
  switchView("simulation");
}

function payDebt() {
  ensureDynasty();
  const d = state.dynasty.debt || 0;
  if (!d) return showToast("No debt");
  if ((state.clanWealth.gold || 0) < d) return showToast("Need " + d + " gold");
  state.clanWealth.gold -= d;
  state.dynasty.debt = 0;
  state.dynasty.debtTimer = 0;
  simLog("Clan debt cleared (-" + d + " gold)");
  saveState();
  showToast("Debt paid");
  switchView("simulation");
}

function stabilizeClan() {
  ensureDynasty();
  if ((state.clanWealth.gold || 0) < 60) return showToast("Need 60 gold");
  state.clanWealth.gold -= 60;
  state.dynasty.stabilizeMonths = 12;
  simLog("Stabilize measures funded — death risk reduced for 12 months");
  saveState();
  showToast("Clan stabilized 12 months");
  switchView("simulation");
}

function pinLastLog() {
  ensureDynasty();
  const last = (state.sim.log || [])[0];
  if (!last) return showToast("No log lines");
  state.dynasty.pinnedLog.unshift(last);
  if (state.dynasty.pinnedLog.length > 12) state.dynasty.pinnedLog.pop();
  saveState();
  showToast("Pinned log line");
}

function startCrisisChain() {
  try { ensureHierDepth(); } catch(e) {}
  if (typeof requirePatriarch === 'function' && !requirePatriarch('declare crisis war path')) return;
  ensureDynasty();
  state.dynasty.crisis = "famine";
  state.dynasty.crisisStep = 1;
  state.sim.pendingChoice = {
    event: "Seasonal Crisis I — Famine: Crops fail near the clan holdings.",
    options: [
      { label: "Open the vault to feed people (-50 gold)", effect: "crisis_feed" },
      { label: "Ignore the weak (renown loss)", effect: "crisis_ignore" },
      { label: "Migrate a branch family", effect: "crisis_migrate" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  showToast("Crisis: Famine");
  switchView("simulation");
}

function resolveCrisisEffect(effect) {
  ensureDynasty();
  let msg = effect;
  if (effect === "crisis_feed") {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 50);
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
    state.dynasty.crisis = "migration";
    msg = "Vault opened. People endure. Migration pressures rise next.";
  } else if (effect === "crisis_ignore") {
    state.clanWealth.renown = Math.max(1, (state.clanWealth.renown || 1) - 1);
    state.dynasty.crisis = "war";
    msg = "Suffering breeds bandits. War looms.";
  } else if (effect === "crisis_migrate") {
    state.dynasty.crisis = "migration";
    msg = "A branch moves. The main bloodline holds.";
  } else if (effect === "crisis_war_fight") {
    const focus = getFocusChar();
    if (focus) {
      const foe = generateCharacter(focus.realm || "Dou Zhe");
      foe.name = state.dynasty.rival.name + " Champion";
      if (typeof simulateDetailedBattle === "function") {
        const res = simulateDetailedBattle(focus, foe);
        msg = res.win ? "Clan war won." : "Clan war lost — reparations.";
        if (!res.win) state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 40);
        else state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
      } else msg = "War resolved in blood.";
    }
    state.dynasty.crisis = null;
  } else if (effect === "crisis_war_pay") {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 70);
    state.dynasty.crisis = null;
    msg = "Tribute bought a temporary peace.";
  } else if (effect === "crisis_settle") {
    state.currentRegion = state.currentRegion || "Outerland";
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
    state.dynasty.crisis = "war";
    msg = "Migration complete — rivals contest the new land.";
  }
  simLog(msg);
  state.sim.pendingChoice = null;
  // chain next crisis pause
  if (state.dynasty.crisis === "migration") {
    state.sim.pendingChoice = {
      event: "Seasonal Crisis II — Migration: Displaced clans crowd the roads.",
      options: [
        { label: "Settle them under your banner", effect: "crisis_settle" },
        { label: "Drive them off", effect: "crisis_ignore" }
      ]
    };
  } else if (state.dynasty.crisis === "war") {
    state.sim.pendingChoice = {
      event: "Seasonal Crisis III — War: " + state.dynasty.rival.name + " moves against you.",
      options: [
        { label: "Fight (detailed combat)", effect: "crisis_war_fight" },
        { label: "Pay tribute (-70 gold)", effect: "crisis_war_pay" }
      ]
    };
  }
  saveState();
  showToast(msg);
  switchView("simulation");
}

function politicalMarriage() {
  ensureDynasty();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select living character");
  if (char.spouse) return showToast("Already married");
  if ((state.clanWealth.gold || 0) < 30) return showToast("Need 30 gold");
  state.clanWealth.gold -= 30;
  char.spouse = generateName() + " (Political)";
  char.marriageBonus = 0.03;
  state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
  simLog(char.name + " entered a political marriage. Renown up, strings attached.");
  saveState();
  showToast("Political marriage arranged");
  switchView("simulation");
}

function disownHeir() {
  try { ensureHierDepth(); } catch(e) {}
  if (typeof requirePatriarch === 'function' && !requirePatriarch('disown heirs')) return;
  const char = getActiveChar();
  if (!char || !char.isHeir) return showToast("Select an heir");
  char.alive = false;
  char.deathReason = "disowned and exiled from the blood register";
  char.deathYear = state.sim.year;
  state.lineage.dead = state.lineage.dead || [];
  state.lineage.dead.push({ name: char.name, reason: char.deathReason, year: state.sim.year, generation: char.generation || 1 });
  simLog(char.name + " was disowned.");
  try { autoSuccessorOnDeath(char); } catch(e) {}
  try { autoOrganizeOnPatriarchDeath(char); } catch(e) {}
  try { leadershipPipelineOnPatriarchDeath(char); } catch(e) {}
  try {
    if (typeof isPatriarch === 'function' && isPatriarch(char)) {
      state.storyChapters.push({ title: 'The Patriarch Falls Y' + (state.sim&&state.sim.year), content: char.name + ' has fallen. The hierarchy trembles. A succession storm gathers over the ' + (state.lineage.bloodName||'clan') + ' bloodline.' });
      simLog('Patriarch death chapter written.');
    }
  } catch(e) {}
  saveState();
  showToast("Heir disowned");
  switchView("simulation");
}

function decadeSummary() {
  ensureDynasty();
  const living = getLineageCharacters();
  const dead = (state.lineage.dead || []).filter(d => d.year >= (state.sim.year - 10));
  const peak = living.slice().sort((a,b) => rankPower(b) - rankPower(a))[0];
  const text = "Decade Report (Y" + Math.max(1, state.sim.year - 10) + "–Y" + state.sim.year + ")\\n\\nLiving: " + living.length +
    "\\nRecent deaths: " + dead.length +
    "\\nPeak member: " + (peak ? peak.name + " " + peak.star + " " + peak.realm : "—") +
    "\\nGold: " + ((state.clanWealth && state.clanWealth.gold) || 0) +
    "\\nRenown: " + ((state.clanWealth && state.clanWealth.renown) || 1) +
    "\\nRival: " + state.dynasty.rival.name + " (renown " + state.dynasty.rival.renown + ")";
  state.storyChapters.push({ title: "Decade Chronicle Y" + state.sim.year, content: text.replace(/\\n/g, "\n") });
  simLog("Decade summary written into story log");
  saveState();
  showToast("Decade summary written");
  switchView("story");
}

function rivalTick() {
  ensureDynasty();
  const r = state.dynasty.rival;
  r.renown = Math.max(1, (r.renown || 1) + (Math.random() > 0.5 ? 1 : 0));
  r.living = Math.max(1, (r.living || 2) + (Math.random() > 0.7 ? 1 : (Math.random() > 0.85 ? -1 : 0)));
  if ((state.clanWealth.renown || 1) + 3 < r.renown && Math.random() > 0.85) {
    simLog(r.name + " overtakes you in continental whispers.");
  }
}

function treasureMapUse() {
  ensureDynasty();
  if ((state.clanWealth.gold || 0) < 15) return showToast("Need 15 gold to fund expedition");
  state.clanWealth.gold -= 15;
  const focus = getFocusChar();
  if (Math.random() > 0.4) {
    state.clanWealth.gold += randInt(20, 70);
    if (focus) focus.experience = Math.min(100, (focus.experience || 20) + 4);
    simLog("Treasure map expedition returned with gains.");
    showToast("Expedition success");
  } else {
    if (focus && Math.random() > 0.5) applyInjury(focus, 1);
    simLog("Treasure map led to an empty tomb and ambush.");
    showToast("Expedition failed");
  }
  saveState();
  switchView("simulation");
}

function simSpeedUntilEvent() {
  ensureDynasty();
  if (!state.lineage.founderId) return showToast("Set founder first");
  state.sim.pauseOnEvents = true;
  state.sim.watchOnly = false;
  state.sim.running = true;
  let guard = 0;
  while (state.sim.running && !state.sim.pendingChoice && guard < 120) {
    try { simTick(); } catch(e) { break; }
    guard++;
  }
  saveState();
  showToast(state.sim.pendingChoice ? "Paused on event" : "Ran " + guard + " months");
  switchView("simulation");
}



// ===== CLAN HIERARCHY SYSTEM =====
const HIERARCHY_RANKS = [
  { id: "ancestor", label: "Ancestor", power: 6 },
  { id: "patriarch", label: "Patriarch / Matriarch", power: 5 },
  { id: "grand_elder", label: "Grand Elder", power: 4 },
  { id: "elder", label: "Elder", power: 3 },
  { id: "core", label: "Core Disciple", power: 2 },
  { id: "inner", label: "Inner Member", power: 1 },
  { id: "outer", label: "Outer Member", power: 0 }
];

function ensureHierarchy() {
  ensureDynasty && ensureDynasty();
  ensureSim();
  if (!state.hierarchy) {
    state.hierarchy = {
      roles: {}, // charId -> rank id
      laws: ["Obey the Patriarch", "Protect the blood name", "Contribute yearly"],
      favor: {} // charId -> number
    };
  }
}

function hierarchyLabel(char) {
  ensureHierarchy();
  if (!char) return "—";
  try {
    if (state.simExtra && state.simExtra.customTitles && state.simExtra.customTitles[char.id])
      return state.simExtra.customTitles[char.id];
  } catch(e) {}
  const rid = state.hierarchy.roles[char.id];
  const r = HIERARCHY_RANKS.find(x => x.id === rid);
  if (r) return r.label;
  if (char.isFounder) return "Patriarch / Matriarch";
  if (char.isHeir) return "Core Disciple";
  return "Inner Member";
}

function hierarchyPower(char) {
  ensureHierarchy();
  if (!char) return 0;
  const rid = state.hierarchy.roles[char.id];
  const r = HIERARCHY_RANKS.find(x => x.id === rid);
  if (r) return r.power;
  if (state.hierarchy.roles[char.id] === "ancestor") return 6;
  if (char.isFounder) return 5;
  if (state.succession && state.succession.designatedId === char.id) return 4;
  if (char.isHeir) return 2;
  return 1;
}

function assignHierarchyRank(rankId) {
  ensureHierarchy();
  try {
    ensureOrgControl();
    if (state.orgControl.freezeRanks) return showToast("Ranks frozen — unlock Freeze Ranks first");
  } catch(e) {}
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select a living member");
  if (!HIERARCHY_RANKS.find(r => r.id === rankId)) return showToast("Invalid rank");
  // only one patriarch
  if (rankId === "patriarch" || rankId === "ancestor") {
    Object.keys(state.hierarchy.roles).forEach(id => {
      if (state.hierarchy.roles[id] === rankId) state.hierarchy.roles[id] = "grand_elder";
    });
  }
  state.hierarchy.roles[char.id] = rankId;
  if (rankId === "patriarch") {
    state.lineage.founderId = state.lineage.founderId || char.id;
    char.isFounder = true;
  }
  simLog(char.name + " appointed as " + hierarchyLabel(char));
  if (rankId === "ancestor") {
    state.storyChapters.push({ title: "Ancestor Appointed Y"+(state.sim&&state.sim.year), content: char.name + " is elevated as Ancestor of the " + (state.lineage.bloodName||"clan") + ". The bloodline kneels to seniority and power." });
  }
  saveState();
  showToast(char.name + " → " + hierarchyLabel(char));
  switchView("simulation");
}

function autoOrganizeHierarchy() {
  ensureHierarchy();
  ensureSimDepth && ensureSimDepth();
  ensureHierDepth && ensureHierDepth();
  const living = getLineageCharacters().slice();
  if (!living.length) return showToast("No living members");

  const power = (c) => {
    let p = typeof rankPower === "function" ? rankPower(c) : 10;
    p += (6 - Math.min(5, c.generation || 1)) * 4; // older gens slight authority
    if (c.isFounder) p += 30;
    if (state.succession && state.succession.designatedId === c.id) p += 18;
    if (c.isHeir) p += 8;
    if (c.education === "Politics") p += 6;
    if (c.education === "Combat") p += 4;
    if (typeof loyaltyOf === "function") p += (loyaltyOf(c) - 50) * 0.08;
    if (c.injured) p -= 10 * c.injured;
    if (c.cadetBranch) p -= 12;
    return p;
  };

  living.sort((a, b) => power(b) - power(a));

  // Clear ranks first
  living.forEach(c => { state.hierarchy.roles[c.id] = "outer"; });

  // Patriarch: existing founder if alive, else strongest
  let patriarch = living.find(c => c.isFounder && c.alive !== false) || living[0];
  living.forEach(c => { c.isFounder = (c.id === patriarch.id); });
  state.hierarchy.roles[patriarch.id] = "patriarch";
  state.lineage.founderId = patriarch.id;

  // Successor / designated -> grand elder preferred
  const designated = living.find(c => state.succession && state.succession.designatedId === c.id && c.id !== patriarch.id);
  const remaining = living.filter(c => c.id !== patriarch.id);

  const caps = (state.simDepth && state.simDepth.rankCaps) || { grand_elder: 5, elder: 3 };
  let ge = 0, el = 0, core = 0, inner = 0;

  // Score-ordered assignment with seats
  remaining.forEach((c, idx) => {
    if (designated && c.id === designated.id && ge < (caps.grand_elder || 5)) {
      state.hierarchy.roles[c.id] = "grand_elder";
      ge++;
      return;
    }
    const score = power(c);
    if (ge < (caps.grand_elder || 5) && (score > power(patriarch) * 0.72 || idx < 1)) {
      state.hierarchy.roles[c.id] = "grand_elder";
      ge++;
    } else if (el < (caps.elder || 3) && score > power(patriarch) * 0.55) {
      state.hierarchy.roles[c.id] = "elder";
      el++;
    } else if (core < Math.max(3, Math.floor(living.length * 0.25)) && (c.isHeir || score > power(patriarch) * 0.4)) {
      state.hierarchy.roles[c.id] = "core";
      core++;
    } else if (inner < Math.max(4, Math.floor(living.length * 0.35))) {
      state.hierarchy.roles[c.id] = "inner";
      inner++;
    } else {
      state.hierarchy.roles[c.id] = "outer";
    }
  });

  // Cadets forced outer/inner only
  living.forEach(c => {
    if (c.cadetBranch && state.hierarchy.roles[c.id] !== "patriarch") {
      if (["grand_elder","elder"].includes(state.hierarchy.roles[c.id])) {
        state.hierarchy.roles[c.id] = "core";
      }
    }
  });

  // Auto-fill empty duties from best fits
  state.hierarchy.duties = state.hierarchy.duties || {};
  const nonPat = living.filter(c => c.id !== patriarch.id);
  if (!state.hierarchy.duties.vaultkeeper) {
    const vk = nonPat.slice().sort((a,b) => ((a.education==="Politics"?10:0)+loyaltyOf(a)) - ((b.education==="Politics"?10:0)+loyaltyOf(b))).reverse()[0];
    if (vk) state.hierarchy.duties.vaultkeeper = vk.id;
  }
  if (!state.hierarchy.duties.warleader) {
    const wl = nonPat.slice().sort((a,b) => power(b) - power(a))[0];
    if (wl) state.hierarchy.duties.warleader = wl.id;
  }
  if (!state.hierarchy.duties.diplomat) {
    const dip = nonPat.find(c => c.education === "Politics") || nonPat[0];
    if (dip) state.hierarchy.duties.diplomat = dip.id;
  }

  // Loyalty nudge: organized structure
  living.forEach(c => { try { addLoyalty(c, 2); } catch(e) {} });

  const summary = "Patriarch " + patriarch.name +
    " · GE " + living.filter(c=>state.hierarchy.roles[c.id]==="grand_elder").length +
    " · Elders " + living.filter(c=>state.hierarchy.roles[c.id]==="elder").length +
    " · Core " + living.filter(c=>state.hierarchy.roles[c.id]==="core").length;
  simLog("Hierarchy auto-organized: " + summary);
  saveState();
  showToast("Organized: " + summary);
  switchView("simulation");
}

function autoOrganizeByBlood() {
  // alternate: strict generation ladder
  ensureHierarchy();
  const living = getLineageCharacters();
  if (!living.length) return showToast("No living members");
  const byGen = {};
  living.forEach(c => {
    const g = c.generation || 1;
    if (!byGen[g]) byGen[g] = [];
    byGen[g].push(c);
  });
  const gens = Object.keys(byGen).map(Number).sort((a,b)=>a-b);
  living.forEach(c => state.hierarchy.roles[c.id] = "outer");
  const g1 = byGen[gens[0]] || [];
  g1.sort((a,b) => (typeof rankPower==='function'?rankPower(b)-rankPower(a):0));
  if (g1[0]) {
    state.hierarchy.roles[g1[0].id] = "patriarch";
    g1[0].isFounder = true;
    state.lineage.founderId = g1[0].id;
  }
  (g1.slice(1)).forEach((c,i) => {
    state.hierarchy.roles[c.id] = i === 0 ? "grand_elder" : (i < 3 ? "elder" : "core");
  });
  gens.slice(1).forEach((g, gi) => {
    (byGen[g]||[]).forEach((c,i) => {
      if (gi === 0) state.hierarchy.roles[c.id] = i < 2 ? "core" : "inner";
      else state.hierarchy.roles[c.id] = i < 1 ? "inner" : "outer";
    });
  });
  simLog("Hierarchy organized by blood generation ladder");
  saveState();
  showToast("Organized by bloodline generation");
  switchView("simulation");
}

function promoteByMerit() {
  ensureHierarchy();
  const living = getLineageCharacters();
  if (living.length < 2) return showToast("Need more members");
  const sorted = living.slice().sort((a, b) => (typeof rankPower === "function" ? rankPower(b) - rankPower(a) : 0));
  const top = sorted[0];
  const cur = state.hierarchy.roles[top.id];
  const order = ["outer","inner","core","elder","grand_elder","patriarch"];
  const idx = Math.max(0, order.indexOf(cur || "inner"));
  if (idx >= order.length - 1) return showToast(top.name + " already at peak rank");
  const next = order[idx + 1];
  if (next === "patriarch") {
    assignHierarchyRank("patriarch");
    state.currentCharacterId = top.id;
  } else {
    state.hierarchy.roles[top.id] = next;
    simLog(top.name + " promoted by merit to " + hierarchyLabel(top));
  }
  saveState();
  showToast("Promoted: " + top.name);
  switchView("simulation");
}

function hierarchyTribute() {
  ensureHierarchy();
  const living = getLineageCharacters();
  let gain = 0;
  living.forEach(c => {
    const p = hierarchyPower(c);
    const pay = Math.max(1, 5 - p); // outer pays more relative duty
    gain += pay;
  });
  gain = Math.floor(gain * (1 + ((state.clanWealth.renown || 1) * 0.05)));
  state.clanWealth.gold = (state.clanWealth.gold || 0) + gain;
  simLog("Hierarchy tribute collected: +" + gain + " gold");
  try { ledgerAdd("Hierarchy tribute +" + gain, gain); } catch(e) {}
  saveState();
  showToast("Tribute +" + gain);
  switchView("simulation");
}

function renderHierarchyBoard() {
  ensureHierarchy();
  const living = getLineageCharacters();
  const groups = {};
  HIERARCHY_RANKS.forEach(r => groups[r.id] = []);
  living.forEach(c => {
    if (state.hierarchy.filter === 'outer' && state.hierarchy.roles[c.id] !== 'outer') return;
    if (state.hierarchy.filter === 'elder' && hierarchyPower(c) < 3) return;
    let rid = state.hierarchy.roles[c.id];
    if (!rid) {
      if (c.isFounder) rid = "patriarch";
      else if (state.succession && state.succession.designatedId === c.id) rid = "grand_elder";
      else if (c.isHeir) rid = "core";
      else rid = "inner";
    }
    if (!groups[rid]) groups[rid] = [];
    groups[rid].push(c);
  });
  let html = '<div class="card" style="margin-bottom:16px;"><h3 class="card-title" style="margin-bottom:10px;">Clan Hierarchy</h3>';
  HIERARCHY_RANKS.forEach(r => {
    const list = groups[r.id] || [];
    html += `<div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border);">
      <strong style="color:var(--gold);">${r.label}</strong>
      <span style="color:var(--text-dim);font-size:0.8rem;"> (${list.length})</span>
      <div style="margin-top:6px;">${list.length ? list.map(c =>
        `<span class="badge badge-blue" style="margin:2px;cursor:pointer;" onclick="state.currentCharacterId='${c.id}';saveState();switchView('character')">${c.name}</span>`
      ).join("") : '<span style="color:var(--text-dim);font-size:0.82rem;">Vacant</span>'}</div>
    </div>`;
  });
  html += `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
    <button class="btn-ghost" onclick="assignHierarchyRank('patriarch')">Make Patriarch</button>
    <button class="btn-ghost" onclick="assignHierarchyRankSafe('grand_elder')">Make Grand Elder</button>
    <button class="btn-ghost" onclick="assignHierarchyRankSafe('elder')">Make Elder</button>
    <button class="btn-ghost" onclick="assignHierarchyRank('core')">Make Core</button>
    <button class="btn-ghost" onclick="assignHierarchyRank('inner')">Make Inner</button>
    <button class="btn-ghost" onclick="assignHierarchyRank('outer')">Make Outer</button>
    <button class="btn-primary" onclick="safeManualOrganize('cultivation')">Organize by Cultivation</button>
    <button class="btn-ghost" onclick="safeManualOrganize('merit')">Auto-Organize (Merit)</button>
    <button class="btn-ghost" onclick="safeManualOrganize('blood')">Organize by Blood</button>
    <button class="btn-ghost" onclick="previewOrganize()">Preview Organize</button>
    <button class="btn-ghost" onclick="setClanPolicy('cultivation')">Policy: Cultivation</button>
    <button class="btn-ghost" onclick="setClanPolicy('merit')">Policy: Merit</button>
    <button class="btn-ghost" onclick="setClanPolicy('blood')">Policy: Blood</button>
    <button class="btn-ghost" onclick="runPolicyOrganize()">Run Policy Organize</button>
    <button class="btn-ghost" onclick="exportHierarchyChart()">Export Hierarchy Chart</button>
    <button class="btn-ghost" onclick="assignHierarchyRank('ancestor')">Make Ancestor</button>
    <button class="btn-ghost" onclick="promoteByMerit()">Promote by Merit</button>
    <button class="btn-ghost" onclick="hierarchyTribute()">Collect Tribute</button>
    <button class="btn-ghost" onclick="assignDuty('vaultkeeper')">Duty: Vaultkeeper</button>
    <button class="btn-ghost" onclick="assignDuty('warleader')">Duty: War Leader</button>
    <button class="btn-ghost" onclick="assignDuty('diplomat')">Duty: Diplomat</button>
    <button class="btn-ghost" onclick="rankChallengeDuel()">Rank Challenge Duel</button>
    <button class="btn-ghost" onclick="successionRitual()">Succession Ritual</button>
    <button class="btn-ghost" onclick="corruptionScandal()">Corruption Scandal</button>
    <button class="btn-ghost" onclick="honorBanquet()">Honor Banquet</button>
    <button class="btn-ghost" onclick="outerProdigyEvent()">Outer Prodigy</button>
    <button class="btn-ghost" onclick="raiseAllOuter()">Raise All Outer→Inner</button>
    <button class="btn-ghost" onclick="payRankStipends()">Pay Rank Stipends</button>
    <button class="btn-ghost" onclick="educateHeir('Combat')">Educate: Combat</button>
    <button class="btn-ghost" onclick="educateHeir('Alchemy')">Educate: Alchemy</button>
    <button class="btn-ghost" onclick="educateHeir('Politics')">Educate: Politics</button>
    <button class="btn-ghost" onclick="exileMember()">Exile Member</button>
    <button class="btn-ghost" onclick="returnExile()">Return Exile</button>
    <button class="btn-ghost" onclick="simUntilSuccession()">Sim Until Succession</button>
    <button class="btn-ghost" onclick="setHierarchyFilter('all')">Filter All</button>
    <button class="btn-ghost" onclick="setHierarchyFilter('elder')">Filter Elders+</button>
    <button class="btn-ghost" onclick="setHierarchyFilter('outer')">Filter Outer</button>
  </div>
  <p style="color:var(--text-muted);font-size:0.82rem;margin-top:8px;">Prestige tier: <strong style="color:var(--gold);">${typeof prestigeTierFromRenown==='function'?prestigeTierFromRenown():'—'}</strong> · Duties: VK ${(state.hierarchy.duties&&state.hierarchy.duties.vaultkeeper)||'—'} / War ${(state.hierarchy.duties&&state.hierarchy.duties.warleader)||'—'} / Dip ${(state.hierarchy.duties&&state.hierarchy.duties.diplomat)||'—'}</p>
  </div>`;
  return html;
}



// ===== HIERARCHY DEPTH PACK (suggestions 1-22) =====
function ensureHierDepth() {
  ensureHierarchy();
  ensureDynasty && ensureDynasty();
  if (!state.hierarchy.loyalty) state.hierarchy.loyalty = {};
  if (!state.hierarchy.cooldown) state.hierarchy.cooldown = {}; // id -> month stamp
  if (!state.hierarchy.duties) state.hierarchy.duties = {}; // vaultkeeper, warleader, diplomat -> charId
  if (!state.hierarchy.prestigeTier) state.hierarchy.prestigeTier = "Unknown";
  if (!state.hierarchy.filter) state.hierarchy.filter = "all";
  if (state.hierarchy.promotionMonth == null) state.hierarchy.promotionMonth = 0;
}

function prestigeTierFromRenown() {
  ensureHierDepth();
  const r = (state.clanWealth && state.clanWealth.renown) || 1;
  let tier = "Unknown";
  if (r >= 20) tier = "Continental";
  else if (r >= 12) tier = "Regional";
  else if (r >= 5) tier = "Local";
  else tier = "Unknown";
  state.hierarchy.prestigeTier = tier;
  return tier;
}

function isPatriarch(char) {
  if (!char) return false;
  ensureHierarchy();
  return state.hierarchy.roles[char.id] === "patriarch" || char.isFounder;
}

function requirePatriarch(actionLabel) {
  const char = getActiveChar();
  if (!isPatriarch(char)) {
    showToast("Only the Patriarch/Matriarch may " + (actionLabel || "do that"));
    return false;
  }
  return true;
}

function loyaltyOf(char) {
  ensureHierDepth();
  if (!char) return 50;
  if (state.hierarchy.loyalty[char.id] == null) state.hierarchy.loyalty[char.id] = 60;
  return state.hierarchy.loyalty[char.id];
}

function addLoyalty(char, n) {
  if (!char) return;
  ensureHierDepth();
  state.hierarchy.loyalty[char.id] = Math.max(0, Math.min(100, loyaltyOf(char) + n));
}

function assignDuty(duty) {
  ensureHierDepth();
  const char = getActiveChar();
  if (!char || char.alive === false) return showToast("Select living member");
  state.hierarchy.duties[duty] = char.id;
  simLog(char.name + " assigned as " + duty);
  saveState();
  showToast(duty + ": " + char.name);
  switchView("simulation");
}

function setHierarchyFilter(f) {
  ensureHierDepth();
  state.hierarchy.filter = f;
  switchView("simulation");
}

function rankChallengeDuel() {
  ensureHierDepth();
  const living = getLineageCharacters();
  const challenger = getActiveChar();
  if (!challenger) return showToast("Select challenger");
  const target = living.find(c => hierarchyPower(c) > hierarchyPower(challenger) && c.id !== challenger.id);
  if (!target) return showToast("No higher-rank target");
  if (typeof simulateDetailedBattle === "function") {
    const res = simulateDetailedBattle(challenger, target);
    if (res.win) {
      state.hierarchy.roles[challenger.id] = state.hierarchy.roles[target.id] || "elder";
      state.hierarchy.roles[target.id] = "core";
      addLoyalty(challenger, 10);
      addLoyalty(target, -15);
      simLog(challenger.name + " won a rank challenge against " + target.name);
      showToast("Challenge won — rank seized");
    } else {
      addLoyalty(challenger, -10);
      applyInjury(challenger, 1);
      simLog(challenger.name + " failed a rank challenge");
      showToast("Challenge failed");
    }
  }
  saveState();
  switchView("simulation");
}

function corruptionScandal() {
  ensureHierDepth();
  const elders = getLineageCharacters().filter(c => hierarchyPower(c) >= 3 && !isPatriarch(c));
  if (!elders.length) return showToast("No elders to scandalize");
  const e = elders[Math.floor(Math.random() * elders.length)];
  const stolen = Math.min(40, Math.floor(((state.clanWealth && state.clanWealth.gold) || 0) * 0.15) + 10);
  state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - stolen);
  addLoyalty(e, -20);
  simLog("Corruption scandal: " + e.name + " drained " + stolen + " gold");
  showToast("Scandal: -" + stolen + " gold");
  saveState();
  switchView("simulation");
}

function honorBanquet() {
  ensureHierDepth();
  if ((state.clanWealth.gold || 0) < 45) return showToast("Need 45 gold");
  state.clanWealth.gold -= 45;
  state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
  getLineageCharacters().forEach(c => addLoyalty(c, 5));
  prestigeTierFromRenown();
  simLog("Honor banquet held. Renown and loyalty rise.");
  saveState();
  showToast("Banquet complete");
  switchView("simulation");
}

function outerProdigyEvent() {
  ensureHierDepth();
  const child = typeof birthHeir === "function" ? birthHeir(getFocusChar() || getLineageCharacters()[0] || getActiveChar()) : null;
  if (!child) return showToast("Could not create prodigy");
  child.talent = "Monster";
  state.hierarchy.roles[child.id] = "outer";
  state.hierarchy.loyalty[child.id] = 80;
  simLog("Outer prodigy appears: " + child.name + " (Monster talent)");
  saveState();
  showToast("Prodigy: " + child.name);
  switchView("simulation");
}

function raiseAllOuter() {
  ensureHierDepth();
  let n = 0;
  getLineageCharacters().forEach(c => {
    if (state.hierarchy.roles[c.id] === "outer") {
      state.hierarchy.roles[c.id] = "inner";
      n++;
    }
  });
  simLog("Raised " + n + " outer members to inner after victory rites");
  saveState();
  showToast("Raised " + n + " outer → inner");
  switchView("simulation");
}

function payRankStipends() {
  ensureHierDepth();
  let cost = 0;
  getLineageCharacters().forEach(c => {
    const p = hierarchyPower(c);
    cost += [2, 3, 5, 8, 10, 12][p] || 2;
  });
  if ((state.clanWealth.gold || 0) < cost) {
    // loyalty hit
    getLineageCharacters().forEach(c => addLoyalty(c, -5));
    simLog("Stipends unpaid (-loyalty). Needed " + cost);
    showToast("Unpaid stipends");
  } else {
    state.clanWealth.gold -= cost;
    getLineageCharacters().forEach(c => addLoyalty(c, 2));
    simLog("Rank stipends paid: -" + cost + " gold");
    showToast("Stipends -" + cost);
  }
  saveState();
  switchView("simulation");
}

function successionRitual() {
  ensureHierDepth();
  const living = getLineageCharacters();
  if (living.length < 2) return showToast("Need contenders");
  const contenders = living.slice().sort((a, b) => hierarchyPower(b) - hierarchyPower(a) || (typeof rankPower==='function'?rankPower(b)-rankPower(a):0)).slice(0, 2);
  const a = contenders[0], b = contenders[1];
  if (typeof simulateDetailedBattle === "function") {
    const res = simulateDetailedBattle(a, b);
    const winner = res.win ? a : b;
    Object.keys(state.hierarchy.roles).forEach(id => {
      if (state.hierarchy.roles[id] === "patriarch") { const _ch=(state.characters||[]).find(x=>x.id===id); if(_ch) demotePatriarchToGE(_ch); else state.hierarchy.roles[id]="grand_elder"; }
    });
    state.hierarchy.roles[winner.id] = "patriarch";
    winner.isFounder = true;
    state.succession = state.succession || {};
    state.succession.designatedId = winner.id;
    simLog("Succession ritual complete. New Patriarch: " + winner.name);
    showToast("Patriarch: " + winner.name);
  }
  saveState();
  switchView("simulation");
}

function exileMember() {
  ensureHierDepth();
  const char = getActiveChar();
  if (!char) return showToast("Select member");
  if (!requirePatriarch("exile members")) return;
  char.exiled = true;
  char.alive = false;
  char.deathReason = "exiled (may return in legend)";
  char.deathYear = state.sim.year;
  state.lineage.dead = state.lineage.dead || [];
  state.lineage.dead.push({ name: char.name, reason: char.deathReason, year: state.sim.year, generation: char.generation || 1, exiled: true });
  simLog(char.name + " was exiled by patriarchal decree");
  saveState();
  showToast("Exiled: " + char.name);
  switchView("simulation");
}

function returnExile() {
  const dead = (state.lineage.dead || []).filter(d => d.exiled);
  if (!dead.length) return showToast("No exiles recorded");
  const d = dead[dead.length - 1];
  const char = generateCharacter("Dou Zhe");
  char.name = d.name;
  char.alive = true;
  char.isHeir = true;
  char.lineageId = state.lineage.founderId;
  char.generation = d.generation || 1;
  state.characters.push(char);
  state.hierarchy.roles[char.id] = "outer";
  state.hierarchy.loyalty[char.id] = 30;
  simLog(char.name + " returned from exile as Outer Member");
  saveState();
  showToast("Returned: " + char.name);
  switchView("simulation");
}

function simUntilSuccession() {
  ensureHierDepth();
  if (!state.lineage.founderId) return showToast("Set founder first");
  state.sim.pauseOnEvents = false;
  let guard = 0;
  const startPat = getLineageCharacters().find(c => isPatriarch(c));
  while (guard < 180) {
    simTick();
    guard++;
    const pat = getLineageCharacters().find(c => isPatriarch(c));
    if (startPat && (!pat || pat.id !== startPat.id)) break;
    if (!getLineageCharacters().length) break;
  }
  showToast("Simulated until succession pressure (" + guard + " months)");
  saveState();
  switchView("simulation");
}

function educateHeir(track) {
  ensureHierDepth();
  const char = getActiveChar();
  if (!char) return showToast("Select heir/member");
  if ((state.clanWealth.gold || 0) < 20) return showToast("Need 20 gold");
  state.clanWealth.gold -= 20;
  char.education = track;
  if (track === "Combat") { char.experience = Math.min(100, (char.experience||20)+8); }
  if (track === "Alchemy") { char.comprehension = Math.min(100, (char.comprehension||20)+8); state.clanWealth.herbs = (state.clanWealth.herbs||0)+1; }
  if (track === "Politics") { addLoyalty(char, 10); state.clanWealth.renown = (state.clanWealth.renown||1)+1; }
  simLog(char.name + " educated in " + track);
  saveState();
  showToast(track + " education");
  switchView("simulation");
}

function outerRebellionCheck() {
  ensureHierDepth();
  const outers = getLineageCharacters().filter(c => (state.hierarchy.roles[c.id] || "") === "outer");
  if (outers.length < 3) return;
  const avg = outers.reduce((s,c) => s + loyaltyOf(c), 0) / outers.length;
  if (avg < 35 && Math.random() > 0.7) {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold||0) - 25);
    simLog("Outer members rebelled against heavy duty — vault damaged.");
    outers.forEach(c => addLoyalty(c, 5));
  }
}



// ===== FINAL POLISH PACK (suggestions 1-20) =====
function dutyBonusesTick() {
  ensureHierDepth();
  const d = state.hierarchy.duties || {};
  const chars = state.characters || [];
  const byId = id => chars.find(x => x.id === id && x.alive !== false);
  const vk = byId(d.vaultkeeper);
  const wl = byId(d.warleader);
  const dip = byId(d.diplomat);
  if (vk) {
    const g = randInt(3, 10);
    state.clanWealth.gold = (state.clanWealth.gold || 0) + g;
    try { ledgerAdd("Vaultkeeper duty +" + g, g); } catch(e) {}
  }
  if (dip) {
    state.clanWealth.renown = (state.clanWealth.renown || 1) + (Math.random() > 0.5 ? 1 : 0);
  }
  if (wl) {
    wl.experience = Math.min(100, (wl.experience || 20) + 1);
  }
}

function autoStipendYearly() {
  ensureHierDepth();
  let cost = 0;
  getLineageCharacters().forEach(c => {
    const p = hierarchyPower(c);
    cost += [2, 3, 5, 8, 10, 12][p] || 2;
  });
  if (!cost) return;
  if ((state.clanWealth.gold || 0) < cost) {
    getLineageCharacters().forEach(c => addLoyalty(c, -4));
    simLog("Auto-stipends failed. Loyalty falls. Needed " + cost + " gold.");
  } else {
    state.clanWealth.gold -= cost;
    getLineageCharacters().forEach(c => addLoyalty(c, 1));
    simLog("Auto-stipends paid: -" + cost);
  }
}

function warLeaderSkirmish() {
  ensureHierDepth();
  const d = state.hierarchy.duties || {};
  let fighter = (state.characters || []).find(c => c.id === d.warleader && c.alive !== false);
  if (!fighter) fighter = getFocusChar() || getActiveChar();
  if (!fighter) return showToast("No War Leader or active fighter");
  const foe = generateCharacter(fighter.realm || "Dou Zhe");
  foe.name = ((state.dynasty && state.dynasty.rival && state.dynasty.rival.name) || "Rival") + " Skirmisher";
  if (typeof simulateDetailedBattle === "function") {
    // temporary war leader buff via experience nudge
    fighter.experience = Math.min(100, (fighter.experience || 20) + 2);
    const res = simulateDetailedBattle(fighter, foe);
    showToast(res.win ? "Skirmish won" : "Skirmish lost");
  }
  saveState();
  switchView("battle");
}

function createCadetBranch() {
  ensureHierDepth();
  const living = getLineageCharacters();
  if (living.length < 3) return showToast("Need at least 3 living members");
  const a = living[living.length - 1];
  const b = living[living.length - 2];
  a.cadetBranch = true;
  b.cadetBranch = true;
  const branchName = (state.lineage.bloodName || "Clan") + " Cadet";
  a.branchName = branchName;
  b.branchName = branchName;
  state.hierarchy.roles[a.id] = "outer";
  state.hierarchy.roles[b.id] = "outer";
  simLog("Cadet branch formed: " + branchName + " (" + a.name + ", " + b.name + ")");
  saveState();
  showToast("Cadet branch created");
  switchView("simulation");
}

function exportDynastyReport() {
  ensureHierDepth();
  prestigeTierFromRenown();
  const living = getLineageCharacters();
  let t = "DYNASTY REPORT\\nBlood: " + (state.lineage.bloodName || "?") + "\\nYear: " + (state.sim.year||1) + "\\nPrestige: " + (state.hierarchy.prestigeTier||"?") + "\\nGold: " + ((state.clanWealth&&state.clanWealth.gold)||0) + "\\nRenown: " + ((state.clanWealth&&state.clanWealth.renown)||1) + "\\nRival: " + ((state.dynasty&&state.dynasty.rival&&state.dynasty.rival.name)||"—") + "\\n\\nMEMBERS\\n";
  living.forEach(c => {
    t += "- " + c.name + " | " + hierarchyLabel(c) + " | Loy " + loyaltyOf(c) + " | " + c.star + " " + c.realm + (c.cadetBranch ? " | CADET" : "") + "\\n";
  });
  t += "\\nDUTIES\\n" + JSON.stringify(state.hierarchy.duties || {}, null, 2);
  const blob = new Blob([t], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dynasty-report-y" + (state.sim.year||1) + ".txt";
  a.click();
  showToast("Dynasty report exported");
}

function confirmDanger(msg, fn) {
  if (!confirm(msg)) return;
  fn();
}

function manualCombatTurn(action) {
  ensureCombatState();
  state.combat.pendingPlayerAction = action;
  showToast("Next strike stance intent: " + action + " (used in next detailed fight as opener bias)");
  // bias stance lightly
  if (action === "Defend") setCombatStance("defensive");
  else if (action === "Flame") setCombatStance("aggressive");
  else if (action === "Skill") setCombatStance("scheme");
  else setCombatStance("balanced");
}

function groupClash3v3() {
  const living = getLineageCharacters();
  if (living.length < 3) return showToast("Need 3 living members");
  const team = living.slice(0, 3);
  let wins = 0;
  team.forEach((c, i) => {
    const foe = generateCharacter(c.realm || "Dou Zhe");
    foe.name = "Enemy Slot " + (i + 1);
    if (typeof simulateDetailedBattle === "function") {
      const res = simulateDetailedBattle(c, foe);
      if (res.win) wins++;
    }
  });
  simLog("Group clash 3v3 result: " + wins + "/3 wins");
  showToast("Group clash: " + wins + "/3");
  saveState();
  switchView("battle");
}

function renderSimSections() {
  ensureSimDepth();
  ensureSimQuality && ensureSimQuality();
  ensureSimFinal && ensureSimFinal();
  ensureProgression && ensureProgression();
  const advanced = (state.game && state.game.advancedUI) || (state.simQoL && state.simQoL.advanced);
  let html = typeof renderCleanSimUI === "function" ? renderCleanSimUI() : "";
  // close advanced wrapper opened in clean UI
  if (!advanced) {
    html += "</div>"; // close hidden advanced from clean if any
  }
  // Core hierarchy board only if advanced
  if (advanced) {
    html += typeof renderHierarchyBoard === "function" ? renderHierarchyBoard() : "";
    html += `<div class="card" style="margin-bottom:12px;padding:12px;">
      <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Legacy / Extra Tools ${(state.game&&state.game.advancedUI)?'':' (Advanced OFF)'}</div>
      <div style="display:${(state.game&&state.game.advancedUI)?'flex':'none'};flex-wrap:wrap;gap:8px;">
        <button class="btn-ghost" onclick="startCrisisChain()">Crisis Chain</button>
        <button class="btn-ghost" onclick="tradeCaravan()">Trade Caravan</button>
        <button class="btn-ghost" onclick="hierarchyTribute()">Tribute</button>
        <button class="btn-ghost" onclick="stabilizeClan()">Stabilize</button>
        <button class="btn-ghost" onclick="buildMonument()">Monument</button>
        <button class="btn-ghost" onclick="decadeSummary()">Decade Summary</button>
        <button class="btn-ghost" onclick="cultivationLadderBoard()">Cultivation Ladder</button>
        <button class="btn-ghost" onclick="exportDynastyReport()">Export Report</button>
        <button class="btn-ghost" onclick="warDraft()">War Draft</button>
        <button class="btn-ghost" onclick="simPlaybook()">Playbook</button>
      </div>
      <p style="color:var(--text-dim);font-size:0.78rem;margin-top:8px;"></p>
    </div>`;
    html += "</div>"; // close advanced
  }
  html += typeof paginatedLivingList === "function" ? paginatedLivingList() : "";
  // pending choice + log stay in main renderSimulation
  return html;
}

function ensureSimDepth() {
  ensureSim();
  ensureDynasty && ensureDynasty();
  ensureHierDepth && ensureHierDepth();
  if (!state.simDepth) {
    state.simDepth = {
      agenda: "Train", // Train | Manage | Adventure
      actionPoints: 3,
      maxAP: 3,
      difficulty: "Standard", // Peaceful | Standard | Brutal
      orders: [], // {type, monthsLeft}
      pauseReasons: [],
      bookmarks: [],
      rankCaps: { ancestor: 1, patriarch: 1, grand_elder: 5, elder: 13 },
      lastReport: null
    };
  }
}

function setSimDifficulty(d) {
  ensureSimDepth();
  if (!["Peaceful","Standard","Brutal"].includes(d)) return;
  state.simDepth.difficulty = d;
  saveState();
  showToast("Sim difficulty: " + d);
  switchView("simulation");
}

function setMonthlyAgenda(a) {
  ensureSimDepth();
  state.simDepth.agenda = a;
  saveState();
  showToast("Monthly agenda: " + a);
  switchView("simulation");
}

function deathMult() {
  ensureSimDepth();
  const d = state.simDepth.difficulty;
  if (d === "Peaceful") return 0.6;
  if (d === "Brutal") return 1.5;
  return 1;
}

function spendAP(n, label) {
  ensureSimDepth();
  n = n || 1;
  if (state.simDepth.actionPoints < n) {
    showToast("Not enough Patriarch AP (" + state.simDepth.actionPoints + "/" + state.simDepth.maxAP + ")");
    return false;
  }
  state.simDepth.actionPoints -= n;
  if (label) simLog("AP used: " + label + " (" + state.simDepth.actionPoints + " left)");
  return true;
}

function refreshYearlyAP() {
  ensureSimDepth();
  state.simDepth.actionPoints = state.simDepth.maxAP;
}

function issueOrder(type) {
  ensureSimDepth();
  if (!requirePatriarch("issue clan orders")) return;
  if (!spendAP(1, "Order " + type)) return;
  state.simDepth.orders.push({ type: type, monthsLeft: 3 });
  simLog("Order issued: " + type + " (3 months)");
  // loyalty check insubordination
  const cores = getLineageCharacters().filter(c => hierarchyPower(c) === 2);
  cores.forEach(c => {
    if (loyaltyOf(c) < 40 && Math.random() > 0.6) {
      simLog(c.name + " shows insubordination toward order: " + type);
      addLoyalty(c, -3);
    }
  });
  saveState();
  showToast("Order: " + type);
  switchView("simulation");
}

function tickOrders() {
  ensureSimDepth();
  const next = [];
  (state.simDepth.orders || []).forEach(o => {
    o.monthsLeft -= 1;
    if (o.monthsLeft <= 0) {
      if (o.type === "Train") {
        getLineageCharacters().forEach(c => { c.experience = Math.min(100, (c.experience||20)+2); });
        simLog("Order complete: Train — clan experience rises.");
      } else if (o.type === "Tribute") {
        hierarchyTribute();
      } else if (o.type === "War Prep") {
        getLineageCharacters().forEach(c => { c.foundation = Math.min(100, (c.foundation||40)+1); });
        simLog("Order complete: War Prep.");
      }
    } else next.push(o);
  });
  state.simDepth.orders = next;
}

function applyAgendaToChar(char) {
  ensureSimDepth();
  const a = state.simDepth.agenda;
  if (a === "Train") {
    char.douQi = (char.douQi||100) + randInt(10, 40);
    char.experience = Math.min(100, (char.experience||20)+1);
  } else if (a === "Manage") {
    if (Math.random() > 0.7) state.clanWealth.gold = (state.clanWealth.gold||0) + randInt(1, 5);
  } else if (a === "Adventure") {
    if (Math.random() > 0.85) {
      char.experience = Math.min(100, (char.experience||20)+3);
      if (Math.random() > 0.7) applyInjury(char, 1);
    }
  }
}

function rankSeatFull(rankId) {
  ensureSimDepth();
  const cap = (state.simDepth.rankCaps || {})[rankId];
  if (cap == null) return false;
  const count = getLineageCharacters().filter(c => state.hierarchy.roles[c.id] === rankId).length;
  return count >= cap;
}

function assignHierarchyRankSafe(rankId) {
  ensureSimDepth();
  if (rankSeatFull(rankId) && rankId !== "patriarch") {
    return showToast("No free seat for " + rankId + " (cap reached)");
  }
  assignHierarchyRank(rankId);
}

function actingPatriarch() {
  ensureSimDepth();
  const living = getLineageCharacters();
  const pat = living.find(c => isPatriarch(c));
  if (pat && !pat.injured) return pat;
  const acting = living.slice().sort((a,b) => hierarchyPower(b)-hierarchyPower(a))[0];
  if (acting && pat && pat.injured) {
    simLog(acting.name + " acts as Patriarch while " + pat.name + " recovers.");
  }
  return acting || pat;
}

function twinHeirsEvent() {
  const parent = getFocusChar() || getActiveChar();
  if (!parent) return showToast("No parent");
  if (typeof birthHeir === "function") {
    birthHeir(parent);
    birthHeir(parent);
    simLog("Twin heirs event! Succession rivalry may follow.");
    showToast("Twins born");
  }
  saveState();
  switchView("simulation");
}

function secondarySpouse() {
  const char = getActiveChar();
  if (!char) return showToast("Select character");
  if ((state.clanWealth.gold||0) < 25) return showToast("Need 25 gold");
  state.clanWealth.gold -= 25;
  char.secondarySpouse = generateName() + " (Secondary)";
  char.marriageBonus = (char.marriageBonus || 0) + 0.015;
  simLog(char.name + " took a secondary spouse.");
  saveState();
  showToast("Secondary spouse");
  switchView("simulation");
}

function memorialHall() {
  const dead = (state.lineage.dead||[]).filter(d => (d.reason||"").toLowerCase().indexOf("patriarch") >= 0 || true);
  if (!(state.lineage.dead||[]).length) return showToast("No ancestors");
  if ((state.clanWealth.gold||0) < 40) return showToast("Need 40 gold");
  state.clanWealth.gold -= 40;
  getLineageCharacters().forEach(c => { c.foundation = Math.min(100, (c.foundation||40)+2); });
  simLog("Memorial hall expanded. Ancestral buff applied.");
  saveState();
  showToast("Memorial hall upgraded");
  switchView("simulation");
}

function seasonalIncomeTable() {
  ensureSimDepth();
  const b = (state.dynasty && state.dynasty.buildings) || {};
  const base = 5 + ((b.pillRoom||0)*3) + ((b.trainingGround||0)*2) + ((b.guardPost||0)*2);
  const prestige = { Unknown: 0, Local: 2, Regional: 5, Continental: 10 }[state.hierarchy.prestigeTier||"Unknown"] || 0;
  const region = 2;
  return base + prestige + region + Math.floor(((state.clanWealth.renown||1))/2);
}

function tradeCaravan() {
  const gain = seasonalIncomeTable() + randInt(5, 25);
  state.clanWealth.gold = (state.clanWealth.gold||0) + gain;
  simLog("Spring trade caravan returned: +" + gain + " gold");
  try { ledgerAdd("Caravan +" + gain, gain); } catch(e) {}
  saveState();
  showToast("Caravan +" + gain);
  switchView("simulation");
}

function checkBankruptcy() {
  if ((state.clanWealth.gold||0) >= 0) return;
  state.clanWealth.gold = 0;
  // demote outers already outer; strip elder seats
  getLineageCharacters().forEach(c => {
    if (hierarchyPower(c) >= 3 && !isPatriarch(c)) state.hierarchy.roles[c.id] = "core";
    addLoyalty(c, -8);
  });
  simLog("Bankruptcy! Assets seized and ranks demoted.");
}

function recordPauseReason(reason) {
  ensureSimDepth();
  state.simDepth.pauseReasons.unshift({ y: state.sim.year, m: state.sim.month, reason: reason });
  if (state.simDepth.pauseReasons.length > 20) state.simDepth.pauseReasons.pop();
}

function bookmarkYear() {
  ensureSimDepth();
  state.simDepth.bookmarks.unshift(state.sim.year);
  if (state.simDepth.bookmarks.length > 15) state.simDepth.bookmarks.pop();
  showToast("Bookmarked Y" + state.sim.year);
  saveState();
}

function afterActionReport() {
  ensureSimDepth();
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const text = "After-Action Report\\nYear " + state.sim.year + " M" + state.sim.month + "\\nLiving: " + living + "\\nGold: " + gold + "\\nPrestige: " + (state.hierarchy.prestigeTier||"?") + "\\nAP: " + state.simDepth.actionPoints + "/" + state.simDepth.maxAP + "\\nOrders: " + (state.simDepth.orders||[]).map(o=>o.type+"("+o.monthsLeft+"m)").join(", ");
  state.simDepth.lastReport = text;
  alert(text.replace(/\\n/g, "\n"));
}

function chanceLabel(effect) {
  const map = {
    crisis_feed: "Safe · -50 gold · +renown",
    crisis_ignore: "Risk · -renown · war likely",
    crisis_migrate: "Medium · branch moves",
    crisis_war_fight: "High injury risk · combat",
    crisis_war_pay: "Safe · -70 gold",
    pill: "Safe · -25 gold · +foundation",
    rob: "Heat risk · +gold",
    conscript: "~55% injury · +renown",
    flame_hunt: "~40% fortune · injury possible"
  };
  return map[effect] || "Unknown odds";
}



// ===== PATH / ADMIN UNLOCK (client-side, no real payments) =====
function ensurePath() {
  if (!state.path) {
    state.path = { tier: "Mortal", admin: true, unlocked: ["Mortal","Disciple","Dou King","Dou Saint","Dou Di"] };
  }
  // This build is fully local — all tiers available; no Stripe/backend
  if (state.path.admin == null) state.path.admin = true;
  if (!state.path.unlocked || !state.path.unlocked.length) {
    state.path.unlocked = ["Mortal","Disciple","Dou King","Dou Saint","Dou Di"];
  }
}

function isTierUnlocked(tier) {
  ensurePath();
  if (state.path.admin) return true;
  return (state.path.unlocked || []).includes(tier);
}

function setPathTier(tier) {
  ensurePath();
  if (!isTierUnlocked(tier)) {
    showToast("Tier locked in this build");
    return;
  }
  state.path.tier = tier;
  saveState();
  showToast("Path set to " + tier + " (local unlock — no payment)");
  switchView("pricing");
}

function enableAdminPath() {
  ensurePath();
  state.path.admin = true;
  state.path.unlocked = ["Mortal","Disciple","Dou King","Dou Saint","Dou Di"];
  state.path.tier = "Dou Di";
  saveState();
  showToast("Admin path ON — all features unlocked locally");
  switchView("pricing");
}



// ===== SIM QUALITY PASS =====
function ensureSimQuality() {
  ensureSimDepth && ensureSimDepth();
  ensureSim();
  if (!state.simQuality) {
    state.simQuality = {
      lastDelta: null, // { yearFrom, livingDelta, goldDelta, deaths, births }
      yearStart: null,
      autoPauseOnDeath: true,
      autoPauseOnBirth: false,
      compactUI: true
    };
  }
}

function beginYearSnapshot() {
  ensureSimQuality();
  if (state.sim.month !== 1) return;
  state.simQuality.yearStart = {
    year: state.sim.year,
    living: getLineageCharacters().length,
    gold: (state.clanWealth && state.clanWealth.gold) || 0,
    dead: (state.lineage.dead || []).length
  };
}

function endYearSnapshot() {
  ensureSimQuality();
  const s = state.simQuality.yearStart;
  if (!s || s.year === state.sim.year) return;
  // called when year increments - compare previous start
}

function captureYearDelta() {
  ensureSimQuality();
  const s = state.simQuality.yearStart;
  if (!s) return;
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const dead = (state.lineage.dead || []).length;
  state.simQuality.lastDelta = {
    year: s.year,
    livingDelta: living - s.living,
    goldDelta: gold - s.gold,
    deaths: dead - s.dead
  };
}

function toggleSimFlag(key) {
  ensureSimQuality();
  state.simQuality[key] = !state.simQuality[key];
  saveState();
  showToast(key + ": " + (state.simQuality[key] ? "ON" : "OFF"));
  switchView("simulation");
}

function smartSimTick() {
  // one month with quality hooks
  const livingBefore = getLineageCharacters().length;
  const deadBefore = (state.lineage.dead || []).length;
  if (state.sim.month === 1) beginYearSnapshot();
  const yearBefore = state.sim.year;
  simTick();
  if (state.sim.year !== yearBefore) {
    captureYearDelta();
    beginYearSnapshot();
  }
  ensureSimQuality();
  const deaths = (state.lineage.dead || []).length - deadBefore;
  const births = getLineageCharacters().length - livingBefore + deaths; // rough
  if (state.simQuality.autoPauseOnDeath && deaths > 0 && state.sim.running) {
    state.sim.running = false;
    if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
    try { recordPauseReason("Death in clan"); } catch(e) {}
    showToast("Paused: clan death");
  }
}

function renderYearDeltaCard() {
  ensureSimQuality();
  const d = state.simQuality.lastDelta;
  if (!d) return '<p style="color:var(--text-dim);font-size:0.82rem;">Year delta appears after a full year passes.</p>';
  const sign = n => (n > 0 ? "+" + n : "" + n);
  return `<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.85rem;">
    <span>Last year Y${d.year}:</span>
    <span style="color:${d.livingDelta>=0?'var(--ds-gold)':'var(--red-glow)'}">Living ${sign(d.livingDelta)}</span>
    <span style="color:${d.goldDelta>=0?'var(--ds-gold)':'var(--red-glow)'}">Gold ${sign(d.goldDelta)}</span>
    <span style="color:var(--text-muted)">Deaths ${d.deaths||0}</span>
  </div>`;
}

function balancePassSoft() {
  // gently help small clans survive; pressure large ones
  const n = getLineageCharacters().length;
  if (n <= 2) {
    getLineageCharacters().forEach(c => {
      c.foundation = Math.min(100, (c.foundation || 40) + 0.5);
    });
  }
  if (n >= 18) {
    state.globalThreat = Math.min(10, (state.globalThreat || 1) + (Math.random() > 0.8 ? 1 : 0));
  }
}

function quickSetupDynasty() {
  if (!state.world) createWorld();
  if (!state.characters.length) createCharacter("Dou Zhe");
  state.currentCharacterId = state.characters[0].id;
  markFounder();
  try { marrySpouse(); } catch(e) {}
  try { ensureHierarchy(); autoOrganizeHierarchy(); } catch(e) {}
  try { ensureSimDepth(); setSimDifficulty("Standard"); setMonthlyAgenda("Train"); } catch(e) {}
  try { safeDefaultsNewDynasty(); } catch(e) {}
  try { ensureWorldSim(); ensureWorldContent(); } catch(e) {}
  showToast("Dynasty quick-setup complete — start the sim");
  switchView("simulation");
}

function renderSimPulse() {
  const living = getLineageCharacters();
  const pat = living.find(c => typeof isPatriarch === "function" && isPatriarch(c));
  return `<div class="card" style="margin-bottom:12px;padding:14px;">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;">
      <div>
        <div style="color:var(--gold);font-family:var(--ds-font-display);font-size:1.1rem;">${state.lineage.bloodName || "Unnamed Blood"}</div>
        <div style="color:var(--text-muted);font-size:0.85rem;">Y${state.sim.year} M${state.sim.month} · ${living.length} living · Patriarch: ${pat?pat.name:"—"}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-primary" onclick="startSimulation()">▶ Run</button>
        <button class="btn-ghost" onclick="stopSimulation && stopSimulation(); afterActionReport && afterActionReport();">⏹ Stop + Report</button>
        <button class="btn-ghost" onclick="smartSimTick(); switchView('simulation')">⏭ Month</button>
        <button class="btn-ghost" onclick="simulateYears(1)">⏩ Year</button>
        <button class="btn-ghost" onclick="quickSetupDynasty()">⚡ Quick Setup</button>
      </div>
    </div>
    <div style="margin-top:10px;">${renderYearDeltaCard()}</div>
    <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;">
      <button class="btn-ghost" onclick="toggleSimFlag('autoPauseOnDeath')">Auto-pause on death: ${state.simQuality&&state.simQuality.autoPauseOnDeath!==false?"ON":"OFF"}</button>
      <button class="btn-ghost" onclick="toggleSimFlag('autoPauseOnBirth')">Auto-pause on birth: ${state.simQuality&&state.simQuality.autoPauseOnBirth?"ON":"OFF"}</button>
    </div>
  </div>`;
}



const LIVING_CAP = 1000;

function enforceLivingCap() {
  let living = getLineageCharacters();
  if (living.length <= LIVING_CAP) return;
  // Retire weakest (lowest cultivation) outer/inner first
  living = living.slice().sort((a, b) => {
    const pa = typeof rankPower === "function" ? rankPower(a) : 0;
    const pb = typeof rankPower === "function" ? rankPower(b) : 0;
    return pa - pb;
  });
  const overflow = living.length - LIVING_CAP;
  for (let i = 0; i < overflow; i++) {
    const c = living[i];
    if (typeof isPatriarch === "function" && isPatriarch(c)) continue;
    if (state.hierarchy && state.hierarchy.roles[c.id] === "ancestor") continue;
    if (state.simExtra && state.simExtra.lockAncestor && state.simExtra.lockedAncestorId === c.id) continue;
    killCharacter(c, "retired under clan population ceiling (" + LIVING_CAP + ")");
  }
  if (overflow > 0) simLog("Living cap " + LIVING_CAP + ": " + overflow + " weakest members retired.");
}



function cultivationScore(c) {
  if (!c) return 0;
  let p = typeof rankPower === "function" ? rankPower(c) : 10;
  const ranks = (typeof DOU_QI_RANKS !== "undefined" ? DOU_QI_RANKS : []).map(r => r.name);
  const ri = Math.max(0, ranks.indexOf(c.realm));
  const stars = (typeof STARS !== "undefined" ? STARS : []);
  const si = Math.max(0, stars.indexOf(c.star));
  p += ri * 25 + si * 5;
  p += (c.douQi || 0) * 0.01;
  p += (c.foundation || 0) * 0.3;
  p += (c.experience || 0) * 0.2;
  if (c.talent === "Against the Heavens") p += 40;
  else if (c.talent === "Monster") p += 25;
  else if (c.talent === "Genius") p += 12;
  return p;
}

function autoOrganizeByCultivation() {
  ensureHierarchy();
  ensureSimDepth && ensureSimDepth();
  const living = getLineageCharacters().slice().sort((a, b) => cultivationScore(b) - cultivationScore(a));
  if (!living.length) return showToast("No living members");

  const caps = Object.assign({ ancestor: 1, patriarch: 1, grand_elder: 5, elder: 13 }, (state.simDepth && state.simDepth.rankCaps) || {});
  state.simDepth.rankCaps = caps;

  living.forEach(c => { state.hierarchy.roles[c.id] = "outer"; });
  try {
    ensureSimExtra();
    if (state.simExtra.lockAncestor && state.simExtra.lockedAncestorId) {
      const locked = living.find(c => c.id === state.simExtra.lockedAncestorId);
      if (locked) { state.hierarchy.roles[locked.id] = "ancestor"; }
    }
  } catch(e) {}

  // Strongest overall = Ancestor (ceremonial peak) if enough members
  let idx = 0;
  if (living.length >= 8 && caps.ancestor) {
    const anc = living[idx++];
    state.hierarchy.roles[anc.id] = "ancestor";
    // Ancestor is above day-to-day rule; next is Patriarch
  }

  // Patriarch = next strongest (or strongest if no ancestor)
  const patriarch = living[idx] || living[0];
  idx++;
  living.forEach(c => { c.isFounder = (c.id === patriarch.id); });
  state.hierarchy.roles[patriarch.id] = "patriarch";
  state.lineage.founderId = patriarch.id;
  if (state.succession) state.succession.designatedId = state.succession.designatedId || patriarch.id;

  let ge = 0, el = 0, core = 0, inner = 0;
  for (; idx < living.length; idx++) {
    const c = living[idx];
    if (ge < (caps.grand_elder || 5)) {
      state.hierarchy.roles[c.id] = "grand_elder";
      ge++;
    } else if (el < (caps.elder || 13)) {
      state.hierarchy.roles[c.id] = "elder";
      el++;
    } else if (core < Math.max(10, Math.floor(living.length * 0.2))) {
      state.hierarchy.roles[c.id] = "core";
      core++;
    } else if (inner < Math.max(15, Math.floor(living.length * 0.3))) {
      state.hierarchy.roles[c.id] = "inner";
      inner++;
    } else {
      state.hierarchy.roles[c.id] = "outer";
    }
  }

  // Duties from remaining strong members
  state.hierarchy.duties = state.hierarchy.duties || {};
  const nonTop = living.filter(c => !["ancestor","patriarch"].includes(state.hierarchy.roles[c.id]));
  if (nonTop[0]) state.hierarchy.duties.warleader = nonTop[0].id;
  if (nonTop[1]) state.hierarchy.duties.vaultkeeper = nonTop[1].id;
  if (nonTop[2]) state.hierarchy.duties.diplomat = nonTop[2].id;

  const summary = "Ancestor/GE/Elder by cultivation · GE " + ge + "/" + (caps.grand_elder||5) + " · Elders " + el + "/" + (caps.elder||13);
  try { enforceJuniorOuterAll(); } catch(e) {}
  simLog("Cultivation hierarchy: " + summary + " · Patriarch " + patriarch.name);
  try { clearHierarchyDirty(); } catch(e) {}
  saveState();
  showToast(summary);
  switchView("simulation");
}

function autoOrganizeOnPatriarchDeath(deadChar) {
  try {
    ensureOrgPolicyFlags();
    if (!state.simExtra.autoOrgOnDeath) return;
    if (typeof isPatriarch === "function" && deadChar && (state.hierarchy.roles[deadChar.id] === "patriarch" || deadChar.isFounder)) {
      autoOrganizeByCultivation();
      simLog("Auto-reorganized after Patriarch death.");
    }
  } catch(e) {}
}

function previewOrganize() {
  const living = getLineageCharacters().slice().sort((a, b) => cultivationScore(b) - cultivationScore(a));
  if (!living.length) return showToast("No members");
  const caps = { ancestor: 1, patriarch: 1, grand_elder: 5, elder: 13 };
  let lines = ["PREVIEW (not applied) — by strongest cultivation", "Cap living " + (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000)];
  let i = 0;
  if (living.length >= 8) { lines.push("Ancestor: " + living[i++].name + " (" + living[i-1].star + " " + living[i-1].realm + ")"); }
  if (living[i]) lines.push("Patriarch: " + living[i].name + " (" + living[i].star + " " + living[i].realm + ")");
  i++;
  const ges = living.slice(i, i + 5); i += ges.length;
  lines.push("Grand Elders (" + ges.length + "/5): " + ges.map(c => c.name).join(", "));
  const els = living.slice(i, i + 13);
  lines.push("Elders (" + els.length + "/13): " + els.map(c => c.name).join(", "));
  alert(lines.join("\n"));
}

function setClanPolicy(mode) {
  ensureSimDepth();
  state.simDepth.orgPolicy = mode; // merit | blood | cultivation
  saveState();
  showToast("Clan policy: " + mode);
}

function runPolicyOrganize() {
  ensureSimDepth();
  const m = (state.simDepth && state.simDepth.orgPolicy) || "cultivation";
  if (m === "blood") autoOrganizeByBlood();
  else if (m === "merit") autoOrganizeHierarchy();
  else autoOrganizeByCultivation();
}

function exportHierarchyChart() {
  ensureHierarchy();
  let t = "HIERARCHY CHART — " + (state.lineage.bloodName||"?") + " Y" + (state.sim.year||1) + "\n";
  HIERARCHY_RANKS.forEach(r => {
    const members = getLineageCharacters().filter(c => state.hierarchy.roles[c.id] === r.id || (!state.hierarchy.roles[c.id] && r.id==="inner"));
    const list = getLineageCharacters().filter(c => (state.hierarchy.roles[c.id] || "") === r.id);
    t += "\n" + r.label + " (" + list.length + ")\n";
    list.sort((a,b)=>cultivationScore(b)-cultivationScore(a)).forEach(c => {
      t += "  - " + c.name + " | " + c.star + " " + c.realm + " | score " + Math.round(cultivationScore(c)) + " | loy " + (typeof loyaltyOf==='function'?loyaltyOf(c):"?") + "\n";
    });
  });
  const blob = new Blob([t], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "hierarchy-chart.txt";
  a.click();
  showToast("Hierarchy chart exported");
}

function elderSeatLoyaltyCheck() {
  getLineageCharacters().forEach(c => {
    const role = state.hierarchy.roles[c.id];
    if ((role === "elder" || role === "grand_elder") && typeof loyaltyOf === "function" && loyaltyOf(c) < 25) {
      state.hierarchy.roles[c.id] = "core";
      simLog(c.name + " lost elder seat (loyalty too low).");
    }
  });
}



// ===== SIM SUGGESTIONS PACK 20 =====
function ensureSimExtra() {
  ensureSim();
  ensureHierarchy && ensureHierarchy();
  ensureSimDepth && ensureSimDepth();
  if (!state.simExtra) {
    state.simExtra = {
      lockAncestor: false,
      lockedAncestorId: null,
      compact: false,
      customTitles: {},
      patriarchHall: [],
      capWarned: {}
    };
  }
}

function cultivationLadderBoard() {
  const living = getLineageCharacters().slice().sort((a,b) => (typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0));
  const top = living.slice(0, 20);
  let t = "CULTIVATION LADDER (Top 20)\\n";
  top.forEach((c,i) => {
    t += (i+1) + ". " + c.name + " — " + (c.star||"?") + " " + (c.realm||"?") + " | " + (typeof hierarchyLabel==='function'?hierarchyLabel(c):"") + " | score " + Math.round(typeof cultivationScore==='function'?cultivationScore(c):0) + "\\n";
  });
  alert(t.replace(/\\n/g,"\n"));
}

function ancestorBlessingTick() {
  ensureSimExtra();
  const anc = getLineageCharacters().find(c => state.hierarchy && state.hierarchy.roles[c.id] === "ancestor");
  if (!anc) return;
  getLineageCharacters().forEach(c => {
    const p = typeof hierarchyPower==='function' ? hierarchyPower(c) : 0;
    if (p >= 2) {
      c.douQi = (c.douQi||100) + randInt(5, 15);
      if (Math.random() > 0.85) c.foundation = Math.min(100, (c.foundation||40)+1);
    }
  });
}

function seatVacancyReport() {
  ensureSimDepth();
  const caps = (state.simDepth && state.simDepth.rankCaps) || { grand_elder: 5, elder: 13, ancestor: 1, patriarch: 1 };
  const count = id => getLineageCharacters().filter(c => state.hierarchy.roles[c.id] === id).length;
  const lines = [];
  [["ancestor",1],["patriarch",1],["grand_elder", caps.grand_elder||5],["elder", caps.elder||13]].forEach(([id,cap]) => {
    const n = count(id);
    if (n < cap) lines.push(id + ": " + n + "/" + cap + " (" + (cap-n) + " vacant)");
  });
  showToast(lines.length ? lines.join(" · ") : "No seat vacancies");
  simLog("Seat vacancies: " + (lines.join("; ") || "none"));
}

function massRecruit(n) {
  n = n || 5;
  ensureSim();
  const living = getLineageCharacters().length;
  const room = Math.max(0, (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000) - living);
  n = Math.min(n, room, 20);
  if (!n) return showToast("Living cap reached");
  const cost = n * 8;
  if ((state.clanWealth.gold||0) < cost) return showToast("Need " + cost + " gold");
  state.clanWealth.gold -= cost;
  for (let i=0;i<n;i++) {
    const c = generateCharacter("Dou Zhe");
    c.alive = true;
    c.isHeir = true;
    c.lineageId = state.lineage.founderId;
    c.generation = (state.lineage.generations||1);
    c.name = (c.name||"Outer") + " Recruit";
    state.characters.push(c);
    state.hierarchy.roles = state.hierarchy.roles || {};
    state.hierarchy.roles[c.id] = "outer";
    if (state.lineage.heirs) state.lineage.heirs.push(c.id);
  }
  simLog("Mass recruited " + n + " outer members (-" + cost + " gold)"); try { markHierarchyDirty("recruit"); } catch(e) {}
  saveState();
  showToast("Recruited " + n);
  switchView("simulation");
}

function generationWaveSpawn() {
  const parent = (typeof getFocusChar==='function' && getFocusChar()) || getActiveChar();
  if (!parent) return showToast("Need focus/parent");
  if ((state.clanWealth.gold||0) < 40) return showToast("Need 40 gold");
  state.clanWealth.gold -= 40;
  let born = 0;
  for (let i=0;i<3;i++) {
    if (typeof LIVING_CAP!=="undefined" && getLineageCharacters().length >= LIVING_CAP) break;
    if (typeof birthHeir === "function") { birthHeir(parent); born++; }
  }
  simLog("Generation wave: " + born + " juniors attempted"); try { markHierarchyDirty("birth wave"); } catch(e) {}
  saveState();
  showToast("Wave births: " + born);
  switchView("simulation");
}

function warDraft() {
  const living = getLineageCharacters().slice().sort((a,b)=> (typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0));
  const team = living.slice(0, Math.min(5, living.length));
  if (!team.length) return showToast("No fighters");
  let wins = 0;
  team.forEach((c,i) => {
    const foe = generateCharacter(c.realm||"Dou Zhe");
    foe.name = "Draft Enemy " + (i+1);
    if (typeof simulateDetailedBattle === "function") {
      const res = simulateDetailedBattle(c, foe);
      if (res.win) wins++;
    }
  });
  state.clanWealth.renown = (state.clanWealth.renown||1) + (wins >= 3 ? 2 : 0);
  simLog("War draft " + wins + "/" + team.length + " wins");
  state.storyChapters.push({ title: "War Draft Y"+(state.sim&&state.sim.year), content: "The clan drafted its strongest. Result: " + wins + "/" + team.length + " victories." });
  showToast("Draft: " + wins + "/" + team.length);
  saveState();
  switchView("battle");
}

function idleDividendTick() {
  const tier = (state.hierarchy && state.hierarchy.prestigeTier) || "Unknown";
  const map = { Unknown: 0, Local: 1, Regional: 3, Continental: 6 };
  const g = map[tier] || 0;
  if (g) state.clanWealth.gold = (state.clanWealth.gold||0) + g;
}

function demoteWeakestElder() {
  const elders = getLineageCharacters().filter(c => ["elder","grand_elder"].includes(state.hierarchy.roles[c.id]));
  if (!elders.length) return showToast("No elders");
  elders.sort((a,b)=> (typeof cultivationScore==='function'?cultivationScore(a)-cultivationScore(b):0));
  const weak = elders[0];
  state.hierarchy.roles[weak.id] = "core";
  const cores = getLineageCharacters().filter(c => state.hierarchy.roles[c.id]==="core");
  cores.sort((a,b)=> (typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0));
  if (cores[0] && cores[0].id !== weak.id) {
    state.hierarchy.roles[cores[0].id] = "elder";
    simLog(weak.name + " demoted; " + cores[0].name + " raised to Elder");
    showToast("Rotated elder seat");
  } else {
    simLog(weak.name + " demoted to Core");
    showToast("Demoted " + weak.name);
  }
  saveState();
  switchView("simulation");
}

function toggleLockAncestor() {
  ensureSimExtra();
  state.simExtra.lockAncestor = !state.simExtra.lockAncestor;
  if (state.simExtra.lockAncestor) {
    const anc = getLineageCharacters().find(c => state.hierarchy.roles[c.id]==="ancestor");
    state.simExtra.lockedAncestorId = anc ? anc.id : null;
  }
  saveState();
  showToast("Lock Ancestor: " + (state.simExtra.lockAncestor?"ON":"OFF"));
  switchView("simulation");
}

function setCustomTitle() {
  const char = getActiveChar();
  if (!char) return showToast("Select member");
  const title = prompt("Custom seat title for " + char.name, state.simExtra && state.simExtra.customTitles[char.id] || "");
  if (title == null) return;
  ensureSimExtra();
  state.simExtra.customTitles[char.id] = title;
  saveState();
  showToast("Title set");
  switchView("simulation");
}

function softLandingNearExtinction() {
  const living = getLineageCharacters();
  if (living.length === 0 || living.length > 3) return;
  if (state.sim.pendingChoice) return;
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  state.sim.pendingChoice = {
    event: "Near Extinction — only " + living.length + " remain. Emergency measures?",
    options: [
      { label: "Spend 50 gold on emergency recruits", effect: "ext_recruit" },
      { label: "Stabilize bloodline (free, temporary)", effect: "ext_stable" },
      { label: "Accept fate", effect: "ext_accept" },
      { label: "Call Ancestor Last Defense", effect: "ext_ancestor" }
    ]
  };
  try { recordPauseReason("Near extinction"); } catch(e) {}
  showToast("Emergency: near extinction");
}

function resolveExtinctionChoice(effect) {
  if (effect === "ext_recruit") {
    if ((state.clanWealth.gold||0) >= 50) {
      state.clanWealth.gold -= 50;
      massRecruit(5);
    } else showToast("Not enough gold");
  } else if (effect === "ext_stable") {
    try { stabilizeClan(); } catch(e) {
      getLineageCharacters().forEach(c => { c.foundation = Math.min(100,(c.foundation||40)+5); });
    }
    simLog("Emergency stabilization.");
  } else if (effect === "ext_ancestor") {
    try { ancestorLastDefense(); } catch(e) {}
  } else {
    simLog("Clan accepts the thin bloodline fate.");
  }
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function capWarnings() {
  const n = getLineageCharacters().length;
  ensureSimExtra();
  [900,950,990].forEach(th => {
    if (n >= th && !state.simExtra.capWarned[th]) {
      state.simExtra.capWarned[th] = true;
      simLog("Living members reached " + n + " (warning threshold " + th + "/" + (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000) + ")");
      showToast("Population warning: " + n);
    }
  });
}

function dynastyAgeScore() {
  const years = (state.sim && state.sim.year) || 1;
  const prestige = { Unknown:1, Local:2, Regional:3, Continental:5 }[(state.hierarchy&&state.hierarchy.prestigeTier)||"Unknown"] || 1;
  const peak = Math.max(0, ...getLineageCharacters().map(c => typeof cultivationScore==='function'?cultivationScore(c):0));
  const score = Math.round(years * prestige * (1 + peak/100));
  alert("Dynasty Age Score: " + score + "\\nYears " + years + " × Prestige " + prestige + " × Peak factor");
  return score;
}

function hallOfPatriarchs() {
  ensureSimExtra();
  const hall = state.simExtra.patriarchHall || [];
  if (!hall.length) return showToast("No recorded patriarchs yet");
  alert("Hall of Patriarchs:\\n" + hall.map(h => "Y"+h.year + " — " + h.name + (h.death?" (fallen)":"")).join("\\n"));
}

function recordPatriarchHall() {
  ensureSimExtra();
  const pat = getLineageCharacters().find(c => state.hierarchy && state.hierarchy.roles[c.id]==="patriarch");
  if (!pat) return;
  const last = (state.simExtra.patriarchHall||[])[0];
  if (last && last.id === pat.id) return;
  state.simExtra.patriarchHall.unshift({ id: pat.id, name: pat.name, year: state.sim.year, death: false });
  if (state.simExtra.patriarchHall.length > 30) state.simExtra.patriarchHall.pop();
}

function rivalPowerRace() {
  ensureDynasty && ensureDynasty();
  const mine = Math.max(0, ...getLineageCharacters().map(c => typeof cultivationScore==='function'?cultivationScore(c):0));
  const rival = (state.dynasty && state.dynasty.rival) || { name: "Rival", power: 50 };
  rival.power = (rival.power || 50) + randInt(-5, 12);
  state.dynasty.rival = rival;
  const msg = "Power race: You " + Math.round(mine) + " vs " + rival.name + " " + Math.round(rival.power);
  simLog(msg);
  showToast(msg);
  saveState();
}

function checkWinConditions() {
  const living = getLineageCharacters().length;
  const tier = (state.hierarchy && state.hierarchy.prestigeTier) || "";
  if (living >= (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000)) {
    state.storyChapters.push({ title: "Empire Cap Reached Y"+(state.sim.year||1), content: "The bloodline touched the living ceiling of " + living + ". An empire of bodies and names." });
    showToast("Win path: population empire");
  }
  if (tier === "Continental" && living >= 50) {
    state.storyChapters.push({ title: "Continental Prestige Y"+(state.sim.year||1), content: "The clan's name is spoken across the continent." });
  }
}

function simPlaybook() {
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth&&state.clanWealth.gold)||0;
  const tips = [];
  if (!state.lineage.founderId) tips.push("Quick Setup dynasty");
  if (living < 5) tips.push("Mass Recruit or Generation Wave");
  if (gold < 30) tips.push("Trade Caravan / Tribute");
  if (living > 10) tips.push("Organize by Cultivation");
  if (living <= 3 && living > 0) tips.push("Emergency near-extinction options");
  if (!(state.hierarchy && Object.keys(state.hierarchy.roles||{}).length)) tips.push("Auto-organize hierarchy");
  tips.push("Run sim with Pause-on-Event ON");
  alert("Recommended next:\\n- " + tips.slice(0,3).join("\\n- "));
}

function toggleCompactSim() {
  ensureSimExtra();
  state.simExtra.compact = !state.simExtra.compact;
  saveState();
  showToast("Compact UI: " + (state.simExtra.compact?"ON":"OFF"));
  switchView("simulation");
}

function searchLivingMembers() {
  const q = prompt("Search living by name or rank");
  if (!q) return;
  const qq = q.toLowerCase();
  const hits = getLineageCharacters().filter(c =>
    (c.name||"").toLowerCase().includes(qq) ||
    (typeof hierarchyLabel==='function' && hierarchyLabel(c).toLowerCase().includes(qq)) ||
    (state.hierarchy.roles[c.id]||"").includes(qq)
  );
  alert(hits.length ? hits.map(c => c.name + " — " + (c.star||"") + " " + (c.realm||"") + " — " + (typeof hierarchyLabel==='function'?hierarchyLabel(c):"")).join("\\n") : "No matches");
}



// ===== SIM QOL PACK 20 =====
function ensureSimQoL() {
  ensureSimExtra && ensureSimExtra();
  ensureSim();
  if (!state.simQoL) {
    state.simQoL = {
      advanced: false,
      memberPage: 0,
      pageSize: 40,
      goal: "Survival", // Survival | Empire | Continental
      bestScore: 0
    };
  }
}

function clanStatusCard() {
  ensureSimQoL();
  const living = getLineageCharacters();
  const cap = typeof LIVING_CAP !== "undefined" ? LIVING_CAP : 1000;
  const seats = (id) => living.filter(c => state.hierarchy && state.hierarchy.roles[c.id] === id).length;
  const caps = (state.simDepth && state.simDepth.rankCaps) || { grand_elder: 5, elder: 13 };
  const pct = Math.min(100, Math.round(living.length / cap * 100));
  const goal = (state.simQoL && state.simQoL.goal) || "Survival";
  let goalPct = 50;
  if (goal === "Empire") goalPct = Math.min(100, Math.round(living.length / cap * 100));
  else if (goal === "Continental") goalPct = ({ Unknown:10, Local:35, Regional:65, Continental:100 })[(state.hierarchy&&state.hierarchy.prestigeTier)||"Unknown"] || 10;
  else goalPct = Math.min(100, living.length * 10);
  return `<div class="card" style="margin-bottom:12px;padding:14px;border-color:var(--gold);">
    <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Clan Status · Goal: ${goal}</div>
    <div style="height:8px;background:#222;border-radius:4px;overflow:hidden;margin-bottom:10px;"><div style="height:100%;width:${goalPct}%;background:linear-gradient(90deg,var(--gold),#6bcf8e);"></div></div>
    <div class="grid-3">
      <div class="stat-box"><div class="label">Living</div><div class="value">${living.length}<span style="font-size:0.75rem;color:var(--text-dim)">/${cap}</span></div></div>
      <div class="stat-box"><div class="label">Cap</div><div class="value">${pct}%</div></div>
      <div class="stat-box"><div class="label">Gold</div><div class="value">${(state.clanWealth&&state.clanWealth.gold)||0}</div></div>
      <div class="stat-box"><div class="label">Threat</div><div class="value">${state.globalThreat||1}</div></div>
      <div class="stat-box"><div class="label">Prestige</div><div class="value" style="font-size:0.95rem;">${(state.hierarchy&&state.hierarchy.prestigeTier)||'—'}</div></div>
      <div class="stat-box"><div class="label">Seats</div><div class="value" style="font-size:0.8rem;">A${seats('ancestor')}/1 P${seats('patriarch')}/1 GE${seats('grand_elder')}/${caps.grand_elder||5} E${seats('elder')}/${caps.elder||13}</div></div>
    </div>
  </div>`;
}

function toggleAdvancedTools() {
  ensureSimQoL();
  state.simQoL.advanced = !state.simQoL.advanced;
  saveState();
  switchView("simulation");
}

function setDynastyGoal(g) {
  ensureSimQoL();
  state.simQoL.goal = g;
  saveState();
  showToast("Goal: " + g);
  switchView("simulation");
}

function renderSeatMap() {
  const living = getLineageCharacters();
  const by = id => living.filter(c => state.hierarchy && state.hierarchy.roles[c.id] === id);
  const box = (title, list, max) => {
    const cells = [];
    for (let i = 0; i < max; i++) {
      const c = list[i];
      cells.push(c
        ? `<div class="badge badge-gold" style="margin:2px;cursor:pointer;" onclick="state.currentCharacterId='${c.id}';saveState();switchView('character')">${c.name.split(' ')[0]}</div>`
        : `<div class="badge" style="margin:2px;opacity:0.35;">empty</div>`);
    }
    return `<div style="margin-bottom:8px;"><div style="color:var(--gold);font-size:0.85rem;margin-bottom:4px;">${title} (${list.length}/${max})</div><div style="display:flex;flex-wrap:wrap;">${cells.join("")}</div></div>`;
  };
  const regent = getLineageCharacters().find(c => c.isRegent);
  const seclusion = state.simFinal && state.simFinal.ancestorSeclusionUntil > (state.sim.year||0);
  return `<div class="card" style="margin-bottom:12px;padding:12px;">
    <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Seat Map ${regent ? "· Regent: "+regent.name : ""} ${seclusion ? "· Ancestor in seclusion" : ""}</div>
    ${box("Ancestor", by("ancestor"), 1)}
    ${box("Patriarch", by("patriarch"), 1)}
    ${box("Grand Elders", by("grand_elder"), 5)}
    ${box("Elders", by("elder"), 13)}
  </div>`;
}

function promoteStrongestCoreToElder() {
  const cores = getLineageCharacters().filter(c => state.hierarchy.roles[c.id] === "core")
    .sort((a,b) => (typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0));
  if (!cores.length) return showToast("No Core members");
  const elders = getLineageCharacters().filter(c => state.hierarchy.roles[c.id] === "elder");
  const cap = ((state.simDepth && state.simDepth.rankCaps) || {}).elder || 13;
  if (elders.length >= cap) return showToast("No empty Elder seat — demote first");
  state.hierarchy.roles[cores[0].id] = "elder";
  simLog(cores[0].name + " promoted to Elder from Core");
  saveState();
  showToast("Promoted " + cores[0].name);
  switchView("simulation");
}

function successionShortlist() {
  const living = getLineageCharacters().filter(c => !(state.hierarchy && state.hierarchy.roles[c.id] === "patriarch"));
  living.sort((a,b) => (typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0));
  const top = living.slice(0, 3);
  alert("Succession shortlist:\n" + (top.map((c,i)=> (i+1)+". "+c.name+" — "+c.star+" "+c.realm+" — "+(typeof hierarchyLabel==='function'?hierarchyLabel(c):"")).join("\n") || "None"));
}

function massRecruitQuality(tier) {
  // tier: weak | talented
  const n = 5;
  const living = getLineageCharacters().length;
  const room = Math.max(0, (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000) - living);
  const count = Math.min(n, room);
  if (!count) return showToast("At living cap");
  const costEach = tier === "talented" ? 20 : 6;
  const cost = count * costEach;
  if ((state.clanWealth.gold||0) < cost) return showToast("Need " + cost + " gold");
  state.clanWealth.gold -= cost;
  for (let i=0;i<count;i++) {
    const c = generateCharacter(tier === "talented" ? "Dou Shi" : "Dou Zhe");
    c.alive = true; c.isHeir = true; c.lineageId = state.lineage.founderId;
    c.generation = state.lineage.generations || 1;
    if (tier === "talented") c.talent = ["Genius","Monster","Excellent"][Math.floor(Math.random()*3)];
    else c.talent = "Ordinary";
    c.name = (c.name||"Outer") + (tier==="talented"?" Talent":" Labor");
    state.characters.push(c);
    state.hierarchy.roles[c.id] = "outer";
    if (state.lineage.heirs) state.lineage.heirs.push(c.id);
  }
  simLog("Recruited " + count + " " + tier + " outers (-" + cost + ")");
  saveState();
  showToast("Recruited " + count + " " + tier);
  switchView("simulation");
}

function largeClanUnrestTick() {
  const n = getLineageCharacters().length;
  let risk = 0;
  if (n > 600) risk = 0.12;
  else if (n > 300) risk = 0.07;
  else if (n > 100) risk = 0.03;
  if (risk && Math.random() < risk) {
    const loss = randInt(5, 25);
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold||0) - loss);
    simLog("Large-clan unrest drains " + loss + " gold (population " + n + ")");
  }
}

function buildMonument() {
  if ((state.clanWealth.gold||0) < 100) return showToast("Need 100 gold");
  state.clanWealth.gold -= 100;
  state.clanWealth.renown = (state.clanWealth.renown||1) + 5;
  try { prestigeTierFromRenown(); } catch(e) {}
  simLog("Monument raised: gold sinks into renown.");
  saveState();
  showToast("Monument +5 renown");
  switchView("simulation");
}

function protectAncestorFromSoftCap() {
  // used inside enforceLivingCap - skip ancestor
}

function paginatedLivingList() {
  ensureSimQoL();
  let living = getLineageCharacters();
  const total = living.length;
  const size = state.simQoL.pageSize || 40;
  const pages = Math.max(1, Math.ceil(total / size));
  if (state.simQoL.memberPage >= pages) state.simQoL.memberPage = pages - 1;
  if (state.simQoL.memberPage < 0) state.simQoL.memberPage = 0;
  const start = state.simQoL.memberPage * size;
  const slice = living.slice(start, start + size);
  const rows = slice.map(c => {
    const role = typeof hierarchyLabel==='function'?hierarchyLabel(c):'';
    return `<div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="state.currentCharacterId='${c.id}';saveState();switchView('character')">
      <strong style="color:var(--gold);">${c.name}</strong>
      <div style="font-size:0.82rem;color:var(--text-muted);">${c.star||''} ${c.realm||''} · ${role} · Loy ${typeof loyaltyOf==='function'?loyaltyOf(c):'?'} · Merit ${typeof getMerit==='function'?getMerit(c):'?'}</div>
    </div>`;
  }).join("") || '<p style="color:var(--text-dim);">No living members</p>';
  return `<div class="card" style="margin-bottom:16px;">
    <div class="card-header"><h3 class="card-title">Living Members</h3>
      <span style="color:var(--text-dim);font-size:0.8rem;">Page ${state.simQoL.memberPage+1}/${pages} · ${total} total</span>
    </div>
    ${rows}
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button class="btn-ghost" onclick="ensureSimQoL();state.simQoL.memberPage--;switchView('simulation')">← Prev</button>
      <button class="btn-ghost" onclick="ensureSimQoL();state.simQoL.memberPage++;switchView('simulation')">Next →</button>
    </div>
  </div>`;
}

function colorizeSimLogLine(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("died") || m.includes("death") || m.includes("killed") || m.includes("extinct")) return "var(--red-glow)";
  if (m.includes("birth") || m.includes("born") || m.includes("recruit") || m.includes("heir")) return "#6bcf8e";
  if (m.includes("war") || m.includes("battle") || m.includes("duel") || m.includes("draft")) return "var(--gold)";
  return "var(--text-muted)";
}

function decadeScoreAttack() {
  const score = typeof dynastyAgeScore === "function" ? dynastyAgeScore() : 0;
  // dynastyAgeScore already alerts; also track best
  ensureSimQoL();
  if (typeof score === "number" && score > (state.simQoL.bestScore||0)) {
    state.simQoL.bestScore = score;
    simLog("New personal best dynasty score: " + score);
    saveState();
  }
}

function saveNamedDynastySlot() {
  const blood = (state.lineage && state.lineage.bloodName) || "clan";
  const year = (state.sim && state.sim.year) || 1;
  const key = "heavenlyDaoDynasty_" + blood.replace(/\s+/g,"_") + "_Y" + year;
  try {
    localStorage.setItem(key, JSON.stringify(state));
    showToast("Saved slot " + key);
  } catch(e) {
    showToast("Save failed");
  }
}

function goalProgressTick() {
  ensureSimQoL();
  const living = getLineageCharacters().length;
  const tier = (state.hierarchy && state.hierarchy.prestigeTier) || "";
  if (state.simQoL.goal === "Empire" && living >= (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000)) {
    showToast("Goal complete: Empire");
  }
  if (state.simQoL.goal === "Continental" && tier === "Continental") {
    showToast("Goal complete: Continental Prestige");
  }
}



// ===== AUTO-ORG FIX: manual only unless toggles allow =====
function ensureOrgPolicyFlags() {
  ensureSimExtra && ensureSimExtra();
  if (!state.simExtra) state.simExtra = {};
  if (state.simExtra.autoOrgOnBirth == null) state.simExtra.autoOrgOnBirth = false; // DEFAULT OFF
  if (state.simExtra.autoOrgOnDeath == null) state.simExtra.autoOrgOnDeath = true;
}

function toggleAutoOrgOnBirth() {
  ensureOrgPolicyFlags();
  state.simExtra.autoOrgOnBirth = !state.simExtra.autoOrgOnBirth;
  saveState();
  showToast("Auto-org on birth: " + (state.simExtra.autoOrgOnBirth ? "ON" : "OFF"));
  switchView("simulation");
}

function toggleAutoOrgOnDeath() {
  ensureOrgPolicyFlags();
  state.simExtra.autoOrgOnDeath = !state.simExtra.autoOrgOnDeath;
  saveState();
  showToast("Auto-org on Patriarch death: " + (state.simExtra.autoOrgOnDeath ? "ON" : "OFF"));
  switchView("simulation");
}





// ===== ORG CONTROL PACK (from bottom: junior rule → freeze) =====
function ensureOrgControl() {
  ensureOrgPolicyFlags && ensureOrgPolicyFlags();
  ensureSimExtra && ensureSimExtra();
  if (!state.orgControl) {
    state.orgControl = {
      freezeRanks: false,
      dirty: false,
      juniorOuterYears: 5,
      pendingPreview: null
    };
  }
}

function markHierarchyDirty(reason) {
  ensureOrgControl();
  state.orgControl.dirty = true;
  state.orgControl.dirtyReason = reason || "hierarchy changed";
}

function clearHierarchyDirty() {
  ensureOrgControl();
  state.orgControl.dirty = false;
  state.orgControl.dirtyReason = "";
}

function toggleFreezeRanks() {
  ensureOrgControl();
  state.orgControl.freezeRanks = !state.orgControl.freezeRanks;
  saveState();
  showToast("Freeze ranks: " + (state.orgControl.freezeRanks ? "ON (Organize locked until you unlock)" : "OFF"));
  switchView("simulation");
}

function isJuniorOuter(char) {
  ensureOrgControl();
  if (!char) return false;
  const years = state.orgControl.juniorOuterYears || 5;
  // generation relative: highest generation numbers are juniors; also age proxy
  const maxGen = Math.max(1, ...getLineageCharacters().map(c => c.generation || 1));
  if ((char.generation || 1) >= maxGen && (char.age || 0) < 20 + years) return true;
  if ((char.age || 16) < 16 + years && !char.isFounder) return true;
  return false;
}

function applyJuniorOuterRule(char) {
  ensureOrgControl();
  if (!char || !state.hierarchy) return;
  if (isJuniorOuter(char)) {
    const role = state.hierarchy.roles[char.id];
    if (!role || role === "outer" || role === "inner") {
      state.hierarchy.roles[char.id] = "outer";
    }
    // if something tried to put junior in elder seats, push down
    if (["elder","grand_elder","patriarch","ancestor"].includes(role)) {
      state.hierarchy.roles[char.id] = "outer";
    }
  }
}

function enforceJuniorOuterAll() {
  getLineageCharacters().forEach(applyJuniorOuterRule);
}

function pauseSimForOrganize() {
  if (state.sim && state.sim.running) {
    state.sim.running = false;
    if (typeof _simTimer !== "undefined" && _simTimer) {
      clearInterval(_simTimer);
      _simTimer = null;
    }
    try { recordPauseReason("Organize hierarchy"); } catch(e) {}
    showToast("Sim paused for organize");
  }
}

function buildOrganizePreview(mode) {
  const living = getLineageCharacters().slice();
  if (!living.length) return { lines: ["No living members"], mode: mode };
  // sort like cultivation by default for preview
  const score = typeof cultivationScore === "function" ? cultivationScore : (c => 0);
  living.sort((a,b) => score(b) - score(a));
  const lines = ["PREVIEW (" + mode + ") — not applied yet", ""];
  let i = 0;
  if (living.length >= 8) {
    lines.push("Ancestor: " + living[i].name + " — " + living[i].star + " " + living[i].realm);
    i++;
  }
  if (living[i]) {
    lines.push("Patriarch: " + living[i].name + " — " + living[i].star + " " + living[i].realm);
    i++;
  }
  const ge = living.slice(i, i+5); i += ge.length;
  lines.push("Grand Elders (" + ge.length + "/5): " + ge.map(x => x.name).join(", "));
  const el = living.slice(i, i+13);
  lines.push("Elders (" + el.length + "/13): " + el.map(x => x.name).join(", "));
  lines.push("");
  lines.push("Juniors forced Outer for ~" + ((state.orgControl&&state.orgControl.juniorOuterYears)||5) + " years");
  lines.push("Confirm to apply.");
  return { lines, mode, livingIds: living.map(x => x.id) };
}

function organizeWithPreview(mode) {
  ensureOrgControl();
  try {
    ensureProgression();
    if (state.progression.mode === "bottom_up") {
      if (!confirm("Bottom-up mode is ON. Snapshot organize will OVERRIDE career ranks. Continue?")) return;
    }
  } catch(e) {}
  if (state.orgControl.freezeRanks) {
    return showToast("Ranks frozen — turn OFF Freeze Ranks first");
  }
  pauseSimForOrganize();
  const preview = buildOrganizePreview(mode || "cultivation");
  state.orgControl.pendingPreview = preview;
  const ok = confirm(preview.lines.join("\n"));
  if (!ok) {
    showToast("Organize cancelled");
    state.orgControl.pendingPreview = null;
    return;
  }
  // apply
  if (mode === "blood") autoOrganizeByBlood();
  else if (mode === "merit") autoOrganizeHierarchy();
  else autoOrganizeByCultivation();
  enforceJuniorOuterAll();
  clearHierarchyDirty();
  state.orgControl.pendingPreview = null;
  saveState();
  showToast("Hierarchy applied");
  switchView("simulation");
}

// Override safeManualOrganize to use preview + freeze
function safeManualOrganize(mode) {
  organizeWithPreview(mode || "cultivation");
}

function renderDirtyBadge() {
  ensureOrgControl();
  if (!state.orgControl.dirty) return "";
  return `<div class="badge badge-gold" style="margin:6px 0;display:inline-block;">Hierarchy dirty — ${state.orgControl.dirtyReason||"new members / changes"} — click Organize to reshuffle</div>`;
}



// ===== BOTTOM-UP RANK PROGRESSION =====
// All members start Outer; promote only when cultivation + merit thresholds met.
const RANK_LADDER = ["outer", "inner", "core", "elder", "grand_elder", "patriarch", "ancestor"];

const RANK_REQUIREMENTS = {
  outer: { score: 0, merit: 0 },
  inner: { score: 25, merit: 5 },
  core: { score: 55, merit: 15 },
  elder: { score: 100, merit: 35 },
  grand_elder: { score: 160, merit: 60 },
  patriarch: { score: 220, merit: 90 },
  ancestor: { score: 300, merit: 120 }
};

function ensureProgression() {
  ensureHierarchy();
  if (!state.progression) {
    state.progression = {
      merit: {},
      mode: "bottom_up",
      autoPromote: true
    };
  }
  if (!state.progression.merit) state.progression.merit = {};
  if (!state.progression.mode) state.progression.mode = "bottom_up";
  if (state.progression.autoPromote == null) state.progression.autoPromote = true;
}

function getMerit(char) {
  ensureProgression();
  if (!char) return 0;
  if (state.progression.merit[char.id] == null) state.progression.merit[char.id] = 0;
  return state.progression.merit[char.id];
}

function addMerit(char, n, reason) {
  ensureProgression();
  if (!char) return;
  state.progression.merit[char.id] = getMerit(char) + (n || 0);
  if (reason && n) {
    try { simLog(char.name + " merit " + (n > 0 ? "+" : "") + n + " (" + reason + ") → " + state.progression.merit[char.id]); } catch(e) {}
  }
}

function currentRankId(char) {
  ensureHierarchy();
  if (!char) return "outer";
  return state.hierarchy.roles[char.id] || "outer";
}

function meetsRequirement(char, rankId) {
  const req = RANK_REQUIREMENTS[rankId] || RANK_REQUIREMENTS.outer;
  const score = typeof cultivationScore === "function" ? cultivationScore(char) : 0;
  const merit = getMerit(char);
  // juniors blocked from elder+ 
  if (["elder","grand_elder","patriarch","ancestor"].includes(rankId) && typeof isJuniorOuter === "function" && isJuniorOuter(char)) {
    return false;
  }
  return score >= req.score && merit >= req.merit;
}

function nextRankId(rankId) {
  const i = RANK_LADDER.indexOf(rankId);
  if (i < 0) return "inner";
  if (i >= RANK_LADDER.length - 1) return rankId;
  return RANK_LADDER[i + 1];
}

function seatAvailable(rankId) {
  ensureSimDepth && ensureSimDepth();
  const caps = Object.assign(
    { outer: 9999, inner: 9999, core: 9999, elder: 13, grand_elder: 5, patriarch: 1, ancestor: 1 },
    (state.simDepth && state.simDepth.rankCaps) || {}
  );
  const cap = caps[rankId];
  if (cap == null) return true;
  const held = getLineageCharacters().filter(c => currentRankId(c) === rankId).length;
  return held < cap;
}

function tryPromoteMember(char, silent) {
  ensureProgression();
  if (!char || char.alive === false) return false;
  if (state.orgControl && state.orgControl.freezeRanks) return false;
  let rank = currentRankId(char);
  let promoted = false;
  // climb as far as requirements + seats allow (one step per call usually)
  const next = nextRankId(rank);
  if (next === rank) return false;
  if (!meetsRequirement(char, next)) return false;
  try { if (enforceLawsOnPromote(char, next) === false) return false; } catch(e) {}
  if (!seatAvailable(next)) {
    if (!silent) showToast("No free seat for " + next);
    return false;
  }
  // unique seats: demote old holder to previous rung
  if (next === "patriarch" || next === "ancestor") {
    getLineageCharacters().forEach(c => {
      if (c.id !== char.id && currentRankId(c) === next) {
        state.hierarchy.roles[c.id] = next === "ancestor" ? "grand_elder" : "grand_elder";
      }
    });
  }
  state.hierarchy.roles[char.id] = next;
  if (next === "patriarch") {
    char.isFounder = true;
    state.lineage.founderId = char.id;
  }
  promoted = true;
  if (!silent) {
    simLog(char.name + " promoted to " + (typeof hierarchyLabel === "function" ? hierarchyLabel(char) : next) +
      " (cult " + Math.round(typeof cultivationScore==='function'?cultivationScore(char):0) + ", merit " + getMerit(char) + ")");
    showToast(char.name + " → " + next);
  }
  try { if (["elder","grand_elder","patriarch","ancestor"].includes(next)) promotionCeremony(char, next); } catch(e) {}
  try { if (next === "elder" || next === "grand_elder") state.council && state.council.elderTermStart && (state.council.elderTermStart[char.id] = state.sim.year); } catch(e) {}
  try { markHierarchyDirty("promotion"); } catch(e) {}
  return promoted;
}

function progressionTick() {
  ensureProgression();
  if (!state.progression.mode) state.progression.mode = "bottom_up";
  const bottomUp = state.progression.mode === "bottom_up";
  const living = getLineageCharacters();
  let totalGained = 0;
  living.forEach(char => {
    const score = typeof cultivationScore === "function" ? cultivationScore(char) : 0;
    // EVERY clan member gains merit monthly (not only Focus)
    let m = 4;
    if (state.simDepth && state.simDepth.agenda === "Train") m += 2;
    if (char.education === "Combat" || char.education === "Politics" || char.education === "Alchemy") m += 2;
    if (typeof hierarchyPower === "function" && hierarchyPower(char) >= 2) m += 1;
    // department heads work
    try {
      if (state.mgmt && state.mgmt.deptHeads) {
        const isHead = Object.values(state.mgmt.deptHeads).includes(char.id);
        if (isHead) m += 4;
      }
    } catch(e) {}
    // focus bonus on top (not exclusive)
    const isFocus = state.dynasty && state.dynasty.focusId === char.id;
    const isActive = state.currentCharacterId === char.id;
    if (isFocus) m += 4;
    else if (isActive) m += 1;
    try {
      const mult = typeof moraleMeritMult === "function" ? moraleMeritMult() : 1;
      m = Math.max(2, Math.round(m * mult));
      const before = getMerit(char);
      try { meritCapAdd(char, m, "monthly"); } catch(e) { addMerit(char, m, "monthly"); }
      totalGained += Math.max(0, getMerit(char) - before);
    } catch(e) { try { addMerit(char, m, "monthly"); totalGained += m; } catch(e2) {} }
    if (score > 40) { try { meritCapAdd(char, 2, "cult"); } catch(e) { addMerit(char, 2); } }
    if (bottomUp) {
      try { applyJuniorOuterRule && applyJuniorOuterRule(char); } catch(e) {}
      if (state.progression.autoPromote !== false) tryPromoteMember(char, true);
    }
  });
  if (living.length && (state.sim.month === 1 || state.sim.month === 6)) {
    try { simLog("Clan merit wave: +" + totalGained + " total across " + living.length + " members"); } catch(e) {}
  }
  try { masterDiscipleTick(); updateWaitingList(); tryFillWaitingList(); } catch(e) {}
}

function setProgressionMode(mode) {
  ensureProgression();
  state.progression.mode = mode; // bottom_up | snapshot
  saveState();
  showToast("Progression: " + mode);
  switchView("simulation");
}

function toggleAutoPromote() {
  ensureProgression();
  state.progression.autoPromote = !state.progression.autoPromote;
  saveState();
  showToast("Auto-promote: " + (state.progression.autoPromote ? "ON" : "OFF"));
  switchView("simulation");
}

function resetAllToOuter() {
  ensureProgression();
  if (state.orgControl && state.orgControl.freezeRanks) return showToast("Ranks frozen");
  if (!confirm("Reset ALL living members to Outer and clear merit? Patriarch keeps a head start.")) return;
  getLineageCharacters().forEach(c => {
    state.hierarchy.roles[c.id] = "outer";
    state.progression.merit[c.id] = 0;
  });
  // founder starts as outer too but with merit boost so they can climb
  const founder = getLineageCharacters().find(c => c.isFounder) || getLineageCharacters()[0];
  if (founder) {
    state.progression.merit[founder.id] = 40;
    addMerit(founder, 20, "founder head start");
  }
  simLog("Clan ranks reset to Outer — climb by cultivation and merit.");
  saveState();
  showToast("All start from Outer");
  switchView("simulation");
}

function promoteSelected() {
  const char = getActiveChar();
  if (!char) return showToast("Select a character");
  if (!tryPromoteMember(char, false)) {
    const next = nextRankId(currentRankId(char));
    const req = RANK_REQUIREMENTS[next];
    const score = typeof cultivationScore === "function" ? cultivationScore(char) : 0;
    showToast("Need score ≥ " + req.score + " (now " + Math.round(score) + ") and merit ≥ " + req.merit + " (now " + getMerit(char) + ")");
  } else {
    saveState();
    switchView("simulation");
  }
}

function renderProgressionPanel() {
  ensureProgression();
  let living = getLineageCharacters();
  try { living = filterMembersBySearch(living); } catch(e) {}
  living = living.slice(0, 15);
  const rows = living.map(c => {
    const rank = currentRankId(c);
    const next = nextRankId(rank);
    const req = RANK_REQUIREMENTS[next] || RANK_REQUIREMENTS.outer;
    const score = Math.round(typeof cultivationScore === "function" ? cultivationScore(c) : 0);
    const merit = getMerit(c);
    const ok = meetsRequirement(c, next) && seatAvailable(next);
    return `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.82rem;cursor:pointer;" onclick="state.currentCharacterId='${c.id}';saveState();">
      <strong style="color:var(--gold);">${c.name}</strong> · ${rank} → ${next}
      <div style="color:var(--text-muted);">Cult ${score}/${req.score} · Merit ${merit}/${req.merit} ${ok ? "· <span style='color:#6bcf8e'>Ready</span>" : (!seatAvailable(next)?"· <span style='color:var(--gold)'>Queued</span>":"")}</div>
      ${typeof renderProgressBars==='function'?renderProgressBars(c):''}
    </div>`;
  }).join("");
  return `<div class="card" style="margin-bottom:12px;padding:12px;">
    <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Bottom-up Progression ${state.progression.mode==="bottom_up"?"(active)":""}</div>
    <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:8px;">Everyone starts Outer. Rise when cultivation + merit meet the next rank. Seats: 13 Elders, 5 Grand Elders, 1 Patriarch, 1 Ancestor.</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
      <button class="btn-primary" onclick="setProgressionMode('bottom_up')">Mode: Bottom-up</button>
      <button class="btn-ghost" onclick="setProgressionMode('snapshot')">Mode: Snapshot Organize</button>
      <button class="btn-ghost" onclick="toggleAutoPromote()">Auto-promote: ${state.progression.autoPromote!==false?"ON":"OFF"}</button>
      <button class="btn-ghost" onclick="promoteSelected()">Promote Selected</button>
      <button class="btn-ghost" onclick="resetAllToOuter()">Reset All → Outer</button>
      <button class="btn-primary" onclick="promoteAllReady()">Promote All Ready</button>
      <button class="btn-ghost" onclick="yearlyPromotionBoard();switchView('story')">Promotion Board</button>
      <button class="btn-ghost" onclick="alert('Waiting list: '+((state.council&&state.council.waitingList)||[]).map(id=>{const x=state.characters.find(c=>c.id===id);return x?x.name:id;}).join(', ')||'empty')">Show Waiting List</button>
      <button class="btn-ghost" onclick="showToast('Avg rank score: '+averageRankScore())">Avg Rank Score</button>
    </div>
    ${rows || "<p style='color:var(--text-dim)'>No members</p>"}
  </div>`;
}



// ===== PROGRESSION + SUCCESSION COUNCIL + ANCESTOR LAST DEFENSE =====
function ensureCouncil() {
  ensureProgression && ensureProgression();
  ensureHierarchy && ensureHierarchy();
  if (!state.council) {
    state.council = {
      successorCandidateId: null,
      votes: {}, // voterId -> candidateId
      discussionOpen: false,
      minScoreForPatriarch: 280,
      minMeritForPatriarch: 100,
      minLoyalty: 40,
      elderTermYears: 20,
      elderTermStart: {}, // charId -> year
      waitingList: [] // charIds queued for elder seats
    };
  }
}

function progressPct(char, rankId) {
  const req = (typeof RANK_REQUIREMENTS !== "undefined" && RANK_REQUIREMENTS[rankId]) || { score: 1, merit: 1 };
  const score = typeof cultivationScore === "function" ? cultivationScore(char) : 0;
  const merit = typeof getMerit === "function" ? getMerit(char) : 0;
  const sp = Math.min(100, Math.round(score / Math.max(1, req.score) * 100));
  const mp = Math.min(100, Math.round(merit / Math.max(1, req.merit) * 100));
  return { sp, mp, score: Math.round(score), merit, req };
}

function renderProgressBars(char) {
  const rank = typeof currentRankId === "function" ? currentRankId(char) : "outer";
  const next = typeof nextRankId === "function" ? nextRankId(rank) : "inner";
  const p = progressPct(char, next);
  return `<div style="margin-top:4px;">
    <div style="font-size:0.72rem;color:var(--text-dim);">Cult ${p.score}/${p.req.score}</div>
    <div style="height:6px;background:#222;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${p.sp}%;background:var(--gold);"></div></div>
    <div style="font-size:0.72rem;color:var(--text-dim);margin-top:2px;">Merit ${p.merit}/${p.req.merit}</div>
    <div style="height:6px;background:#222;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${p.mp}%;background:#6bcf8e;"></div></div>
  </div>`;
}

function promotionCeremony(char, newRank) {
  if (!["elder","grand_elder","patriarch","ancestor"].includes(newRank)) return;
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  state.storyChapters.push({
    title: "Promotion Ceremony — " + char.name,
    content: char.name + " is raised to " + newRank + " before the clan. Merit and cultivation have been recognized."
  });
  try { pushNarrative(char.name + " rises to " + newRank + "."); } catch(e) {}
  try { recordPauseReason("Promotion ceremony: " + char.name); } catch(e) {}
  showToast("Ceremony: " + char.name + " → " + newRank);
}

function masterDiscipleTick() {
  const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder" || currentRankId(c) === "ancestor");
  if (!ges.length) return;
  getLineageCharacters().forEach(c => {
    if (currentRankId(c) === "outer" || currentRankId(c) === "inner") {
      if (Math.random() > 0.5) addMerit(c, 1, "master guidance");
    }
  });
}

function updateWaitingList() {
  ensureCouncil();
  const ready = getLineageCharacters().filter(c => {
    const next = nextRankId(currentRankId(c));
    return (next === "elder" || next === "grand_elder") && meetsRequirement(c, next) && !seatAvailable(next);
  }).sort((a,b) => cultivationScore(b) - cultivationScore(a));
  state.council.waitingList = ready.map(c => c.id);
}

function promoteAllReady() {
  ensureProgression();
  let n = 0;
  getLineageCharacters().slice().sort((a,b) => cultivationScore(b)-cultivationScore(a)).forEach(c => {
    if (tryPromoteMember(c, true)) {
      n++;
      const r = currentRankId(c);
      if (["elder","grand_elder","patriarch","ancestor"].includes(r)) promotionCeremony(c, r);
    }
  });
  updateWaitingList();
  saveState();
  showToast("Promoted " + n + " ready members");
  switchView("simulation");
}

function yearlyPromotionBoard() {
  updateWaitingList();
  const rose = (state.sim.log || []).filter(l => (l.msg||"").indexOf("promoted") >= 0).slice(0, 8);
  const wait = (state.council.waitingList || []).map(id => {
    const c = state.characters.find(x => x.id === id);
    return c ? c.name : id;
  });
  const text = "Yearly Promotion Board Y" + state.sim.year + "\nWaiting for seats: " + (wait.join(", ") || "none") + "\nRecent: " + rose.map(l => l.msg).join("; ");
  state.storyChapters.push({ title: "Promotion Board Y" + state.sim.year, content: text });
  simLog("Promotion board written");
}

function elderTermTick() {
  ensureCouncil();
  const y = state.sim.year || 1;
  getLineageCharacters().forEach(c => {
    const r = currentRankId(c);
    if (r === "elder" || r === "grand_elder") {
      if (!state.council.elderTermStart[c.id]) state.council.elderTermStart[c.id] = y;
      if (y - state.council.elderTermStart[c.id] >= (state.council.elderTermYears || 20)) {
        state.hierarchy.roles[c.id] = "core";
        delete state.council.elderTermStart[c.id];
        addMerit(c, 5, "completed elder term");
        simLog(c.name + " finished elder term and returns to Core to re-compete.");
      }
    }
  });
}

function pillRoomMeritTick() {
  const pr = state.dynasty && state.dynasty.buildings && state.dynasty.buildings.pillRoom;
  if (!pr) return;
  getLineageCharacters().forEach(c => {
    if (hierarchyPower(c) >= 2) {
      addMerit(c, pr, "pill room");
      c.foundation = Math.min(100, (c.foundation || 40) + (Math.random() > 0.8 ? 1 : 0));
    }
  });
}

function focusDoubleMerit(char) {
  if (state.dynasty && state.dynasty.focusId === char.id) addMerit(char, 2, "focus training");
}

function ancestorLastDefense() {
  // Call when clan is near extinction or under heavy threat
  const anc = getLineageCharacters().find(c => currentRankId(c) === "ancestor");
  if (!anc) return showToast("No Ancestor to stand as last defense");
  const threat = state.globalThreat || 1;
  const foe = generateCharacter(anc.realm || "Dou Zong");
  foe.name = "Clan-Ending Calamity";
  let won = false;
  if (typeof simulateDetailedBattle === "function") {
    const res = simulateDetailedBattle(anc, foe);
    won = !!res.win;
  } else {
    won = Math.random() > 0.4;
  }
  if (won) {
    state.globalThreat = Math.max(1, threat - 3);
    addMerit(anc, 20, "last defense");
    getLineageCharacters().forEach(c => addLoyalty && addLoyalty(c, 5));
    state.storyChapters.push({
      title: "Ancestor Last Defense Y" + (state.sim.year || 1),
      content: anc.name + " stood as the final shield of the bloodline and drove the calamity back."
    });
    showToast("Ancestor held the line");
  } else {
    applyInjury(anc, 2);
    if (Math.random() > 0.55) {
      try { killCharacter(anc, "fell as last defense of the clan"); } catch(e) { anc.alive = false; }
    }
    addMerit(anc, 10, "last defense sacrifice");
    state.storyChapters.push({
      title: "Ancestor Falls in Defense Y" + (state.sim.year || 1),
      content: anc.name + " burned life force to protect the clan. The bloodline survives — wounded."
    });
    showToast("Ancestor wounded in last defense");
  }
  saveState();
  switchView("simulation");
}

function canBePatriarchCandidate(char) {
  ensureCouncil();
  if (!char || char.alive === false) return { ok: false, reason: "Invalid" };
  if (typeof isJuniorOuter === "function" && isJuniorOuter(char)) return { ok: false, reason: "Too junior" };
  const score = typeof cultivationScore === "function" ? cultivationScore(char) : 0;
  const merit = typeof getMerit === "function" ? getMerit(char) : 0;
  const loy = typeof loyaltyOf === "function" ? loyaltyOf(char) : 50;
  if (score < state.council.minScoreForPatriarch) return { ok: false, reason: "Cultivation score < " + state.council.minScoreForPatriarch };
  if (merit < state.council.minMeritForPatriarch) return { ok: false, reason: "Merit < " + state.council.minMeritForPatriarch };
  if (loy < state.council.minLoyalty) return { ok: false, reason: "Loyalty < " + state.council.minLoyalty };
  const r = currentRankId(char);
  if (!["elder","grand_elder","patriarch"].includes(r)) return { ok: false, reason: "Must be Elder or Grand Elder first" };
  return { ok: true, reason: "Eligible" };
}

function openSuccessionCouncil() {
  ensureCouncil();
  state.council.discussionOpen = true;
  state.council.votes = {};
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  showToast("Succession council opened");
  switchView("simulation");
}

function nominateSuccessor() {
  ensureCouncil();
  const char = getActiveChar();
  if (!char) return showToast("Select a candidate");
  const check = canBePatriarchCandidate(char);
  if (!check.ok) return showToast("Not eligible: " + check.reason);
  state.council.successorCandidateId = char.id;
  simLog(char.name + " nominated for Patriarch succession");
  saveState();
  showToast("Nominated: " + char.name);
  switchView("simulation");
}

function councilVoters() {
  return getLineageCharacters().filter(c => {
    const r = currentRankId(c);
    return r === "ancestor" || r === "patriarch" || r === "grand_elder" || r === "elder";
  });
}

function castSuccessionVote() {
  ensureCouncil();
  const voter = getActiveChar();
  if (!voter) return showToast("Select voter (yourself as council member)");
  const r = currentRankId(voter);
  if (!["ancestor","patriarch","grand_elder","elder"].includes(r)) return showToast("Only Ancestor/Patriarch/GE/Elders vote");
  const candId = state.council.successorCandidateId;
  if (!candId) return showToast("Nominate a candidate first");
  state.council.votes[voter.id] = candId;
  simLog(voter.name + " (" + r + ") votes for succession candidate");
  saveState();
  showToast("Vote recorded");
  switchView("simulation");
}

function resolveSuccessionCouncil() {
  ensureCouncil();
  const candId = state.council.successorCandidateId;
  if (!candId) return showToast("No candidate");
  const cand = state.characters.find(c => c.id === candId);
  if (!cand) return showToast("Candidate missing");
  const check = canBePatriarchCandidate(cand);
  if (!check.ok) return showToast("Candidate no longer eligible: " + check.reason);

  const voters = councilVoters();
  const votes = Object.keys(state.council.votes || {}).length;
  const need = Math.max(1, Math.ceil(voters.length * 0.5));
  const yes = Object.values(state.council.votes).filter(v => v === candId).length;

  // Must include at least some high ranks if they exist
  const hasAnc = voters.some(v => currentRankId(v) === "ancestor");
  const hasPat = voters.some(v => currentRankId(v) === "patriarch");
  const ancVoted = hasAnc ? voters.filter(v => currentRankId(v)==="ancestor").some(v => state.council.votes[v.id]) : true;
  const patVoted = hasPat ? voters.filter(v => currentRankId(v)==="patriarch").some(v => state.council.votes[v.id]) : true;

  if (yes < need) return showToast("Need majority votes (" + yes + "/" + need + ")");
  if (!ancVoted || !patVoted) return showToast("Ancestor and current Patriarch must participate if they exist");

  // Install successor as designated; if patriarch dead/empty, promote now
  state.succession = state.succession || {};
  state.succession.designatedId = cand.id;
  const livingPat = getLineageCharacters().find(c => currentRankId(c) === "patriarch");
  if (!livingPat) {
    getLineageCharacters().forEach(c => {
      if (currentRankId(c) === "patriarch") state.hierarchy.roles[c.id] = "grand_elder";
    });
    state.hierarchy.roles[cand.id] = "patriarch";
    cand.isFounder = true;
    state.lineage.founderId = cand.id;
  }
  state.council.discussionOpen = false;
  state.storyChapters.push({
    title: "Succession Council Y" + (state.sim.year || 1),
    content: cand.name + " was confirmed by Elders, Grand Elders, Patriarch, and Ancestor discussion. Votes " + yes + "/" + voters.length + "."
  });
  simLog("Succession council confirms " + cand.name);
  saveState();
  showToast("Successor confirmed: " + cand.name);
  switchView("simulation");
}

function renderSuccessionCouncil() {
  ensureCouncil();
  const cand = state.characters.find(c => c.id === state.council.successorCandidateId);
  const check = cand ? canBePatriarchCandidate(cand) : null;
  const voters = councilVoters();
  const yes = Object.values(state.council.votes || {}).filter(v => v === state.council.successorCandidateId).length;
  return `<div class="card" style="margin-bottom:12px;padding:12px;border-color:var(--gold);">
    <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Patriarch Succession Council</div>
    <p style="color:var(--text-muted);font-size:0.85rem;">Successor must be discussed by <strong>Elders, Grand Elders, current Patriarch, and Ancestor</strong>.</p>
    <p style="color:var(--text-dim);font-size:0.8rem;">Requirements: Core+ rank · Cult ≥ ${state.council.minScoreForPatriarch} · Merit ≥ ${state.council.minMeritForPatriarch} · Loyalty ≥ ${state.council.minLoyalty}</p>
    <p style="margin-top:8px;">Candidate: <strong style="color:var(--gold);">${cand ? cand.name : "None"}</strong> ${check ? (check.ok ? "· Eligible" : "· " + check.reason) : ""}</p>
    <p style="color:var(--text-dim);font-size:0.82rem;">Votes: ${yes} · Council size: ${voters.length} · Open: ${state.council.discussionOpen ? "YES" : "no"}</p>
    <p style="color:var(--text-muted);font-size:0.78rem;">Voters: ${typeof renderCouncilVotes==='function'?renderCouncilVotes():'—'}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
      <button class="btn-primary" onclick="openSuccessionCouncil()">Open Council</button>
      <button class="btn-ghost" onclick="nominateSuccessor()">Nominate Selected</button>
      <button class="btn-ghost" onclick="castSuccessionVote()">Cast Vote (as selected)</button>
      <button class="btn-primary" onclick="resolveSuccessionCouncil()">Resolve Council</button>
      <button class="btn-ghost" onclick="successionDeadlockDuel()">Deadlock Duel</button>
      <button class="btn-ghost" onclick="ancestorLastDefenseGated()">Ancestor Last Defense</button>
    </div>
  </div>`;
}

function averageRankScore() {
  const map = { outer:0, inner:1, core:2, elder:3, grand_elder:4, patriarch:5, ancestor:6 };
  const living = getLineageCharacters();
  if (!living.length) return 0;
  const avg = living.reduce((s,c) => s + (map[currentRankId(c)]||0), 0) / living.length;
  return Math.round(avg * 100) / 100;
}

function bottomUpLegendWin() {
  // Ancestor who has merit trail from outer climb — approximate: high merit + ancestor rank
  const anc = getLineageCharacters().find(c => currentRankId(c) === "ancestor" && getMerit(c) >= 130);
  if (anc) {
    state.storyChapters.push({
      title: "Bottom-up Legend Y" + (state.sim.year||1),
      content: anc.name + " rose from the bottom ranks to Ancestor. Average clan rank score: " + averageRankScore()
    });
  }
}



// ===== SIM FINAL PACK + CLEANUP =====
function ensureSimFinal() {
  ensureCouncil && ensureCouncil();
  ensureProgression && ensureProgression();
  ensureSimQoL && ensureSimQoL();
  if (!state.simFinal) {
    state.simFinal = {
      lastDefenseYear: -99,
      lastDefenseCooldown: 10,
      ancestorSeclusionUntil: 0,
      pauseFilter: "important", // all | important
      meritYearGain: {}, // charId -> amount this year
      meritYearCap: 40,
      ballotMode: "public", // public | secret
      achievements: {},
      endingsShown: {}
    };
  }
}

function autoCouncilVote() {
  ensureCouncil();
  const candId = state.council.successorCandidateId;
  if (!candId) return showToast("Nominate a candidate first");
  const cand = state.characters.find(c => c.id === candId);
  if (!cand) return showToast("Candidate missing");
  const voters = typeof councilVoters === "function" ? councilVoters() : [];
  voters.forEach(v => {
    // vote by loyalty + power affinity
    const loy = typeof loyaltyOf === "function" ? loyaltyOf(v) : 50;
    const prefer = (typeof cultivationScore === "function" ? cultivationScore(cand) : 50) + loy;
    // slight chance to dissent if low loyalty
    if (loy < 30 && Math.random() > 0.5) return;
    state.council.votes[v.id] = candId;
  });
  simLog("Council AI auto-voted (" + Object.keys(state.council.votes).length + " votes, " + (state.simFinal && state.simFinal.ballotMode || "public") + " ballot)");
  saveState();
  showToast("Auto-votes cast");
  switchView("simulation");
}

function regentRefuseCheck() {
  const reg = getLineageCharacters().find(c => c.isRegent);
  const pat = getLineageCharacters().find(c => currentRankId(c) === "patriarch");
  if (reg && pat && Math.random() > 0.9) {
    simLog(reg.name + " is reluctant to yield regency fully.");
    addLoyalty(reg, -5);
  }
}
function ensureRegent() {
  ensureHierarchy();
  ensureCouncil && ensureCouncil();
  if (!state.regent) {
    state.regent = {
      id: null,
      appointedYear: null,
      termYears: 5,
      powers: { tax: true, recruit: true, warEconomy: false, successionOpen: true, exile: false },
      geSupport: [],
      log: []
    };
  }
  return state.regent;
}

function isRegentChar(char) {
  if (!char) return false;
  ensureRegent();
  return !!(char.isRegent || (state.regent.id && state.regent.id === char.id));
}

function findLivingPatriarchSafe() {
  if (typeof findLivingPatriarch === "function") return findLivingPatriarch();
  return getLineageCharacters().find(c => currentRankId(c) === "patriarch") || null;
}

function appointRegent(char, reason) {
  ensureRegent();
  if (!char || char.alive === false) { showToast("Invalid regent"); return false; }
  const pat = findLivingPatriarchSafe();
  if (pat && reason !== "manual" && reason !== "force") {
    showToast("Patriarch still lives — Regent not needed");
    return false;
  }
  getLineageCharacters().forEach(c => { if (c.isRegent) c.isRegent = false; });
  char.isRegent = true;
  state.regent.id = char.id;
  state.regent.appointedYear = state.sim.year || 1;
  state.regent.geSupport = [];
  state.regent.powers.warEconomy = false;
  state.regent.log.unshift({ y: state.sim.year, m: state.sim.month, msg: char.name + " appointed Regent" + (reason ? " — " + reason : "") });
  if (state.regent.log.length > 20) state.regent.log.pop();
  simLog("Regent Protocol: " + char.name + " holds the Regency.");
  try { pushNarrative && pushNarrative(char.name + " is Regent" + (reason ? " (" + reason + ")" : "")); } catch(e) {}
  saveState();
  showToast("Regent: " + char.name);
  switchView("simulation");
  return true;
}

function dismissRegent(reason) {
  ensureRegent();
  if (!state.regent.id) { showToast("No Regent"); return; }
  const char = (state.characters || []).find(c => c.id === state.regent.id);
  if (char) char.isRegent = false;
  state.regent.log.unshift({ y: state.sim.year, m: state.sim.month, msg: "Regency ended" + (reason ? " — " + reason : "") });
  state.regent.id = null;
  state.regent.appointedYear = null;
  state.regent.geSupport = [];
  state.regent.powers.warEconomy = false;
  simLog("Regent Protocol: regency dissolved" + (reason ? " (" + reason + ")" : ""));
  saveState();
  showToast("Regency ended");
  switchView("simulation");
}

function pickBestRegentCandidate() {
  const living = getLineageCharacters().filter(c => currentRankId(c) !== "ancestor");
  if (!living.length) return null;
  const score = (c) => {
    let s = typeof cultivationScore === "function" ? cultivationScore(c) : 0;
    s += (typeof getMerit === "function" ? getMerit(c) : 0) * 0.4;
    s += (typeof loyaltyOf === "function" ? loyaltyOf(c) : 50) * 0.5;
    const r = currentRankId(c);
    if (r === "grand_elder") s += 50;
    if (r === "elder") s += 30;
    if (r === "core") s += 10;
    if (c.injured) s -= 15;
    return s;
  };
  living.sort((a, b) => score(b) - score(a));
  return living[0];
}

function activateRegencyIfNeeded() {
  ensureRegent();
  const pat = findLivingPatriarchSafe();
  if (pat) {
    if (state.regent.id) dismissRegent("Patriarch restored");
    return;
  }
  if (state.regent.id) {
    const r = (state.characters || []).find(c => c.id === state.regent.id && c.alive !== false);
    if (r) { r.isRegent = true; return; }
    state.regent.id = null;
  }
  const cand = pickBestRegentCandidate();
  if (cand) appointRegent(cand, "no living Patriarch");
}

function regentEndorseWarPowers() {
  ensureRegent();
  const ge = getActiveChar();
  if (!ge || currentRankId(ge) !== "grand_elder") return showToast("Only a Grand Elder may endorse");
  if (!state.regent.id) return showToast("No Regent in office");
  if (!state.regent.geSupport.includes(ge.id)) state.regent.geSupport.push(ge.id);
  if (state.regent.geSupport.length >= 1) state.regent.powers.warEconomy = true;
  simLog(ge.name + " endorses Regent war powers");
  saveState();
  showToast("War powers endorsed");
  switchView("simulation");
}

function regentHandOffToPatriarch() {
  ensureRegent();
  const cand = typeof pickBestPatriarchCandidate === "function" ? pickBestPatriarchCandidate() : pickBestRegentCandidate();
  if (!cand) return showToast("No Patriarch candidate");
  if (typeof installPatriarch === "function") installPatriarch(cand, "Regent hand-off");
  else { state.hierarchy.roles[cand.id] = "patriarch"; cand.isFounder = true; }
  dismissRegent("hand-off to " + cand.name);
  showToast("Patriarch: " + cand.name);
  switchView("simulation");
}

function renderRegentPanel() {
  ensureRegent();
  const r = state.regent;
  const char = r.id ? (state.characters || []).find(c => c.id === r.id) : null;
  const years = char && r.appointedYear != null ? ((state.sim.year || 1) - r.appointedYear) : 0;
  const pat = findLivingPatriarchSafe();
  return `<div class="card" style="margin-bottom:12px;padding:12px;border-color:${char ? "var(--gold)" : "var(--border)"};">
    <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Regent Protocols</div>
    <p style="color:var(--text-muted);font-size:0.85rem;">
      ${pat ? ("Patriarch: <strong style='color:var(--gold);'>" + pat.name + "</strong> — Regency dormant.")
        : char ? ("Regent: <strong style='color:var(--gold);'>" + char.name + "</strong> · Year " + years + "/" + (r.termYears||5) + " · War powers: " + (r.powers.warEconomy?"YES":"NO") + " · GE endorsements: " + (r.geSupport||[]).length)
        : "No Regent — auto-appoints if Patriarch seat is empty."}
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
      <button class="btn-ghost" onclick="(function(){const c=getActiveChar();if(c)appointRegent(c,'manual');else showToast('Select character');})()">Appoint Selected Regent</button>
      <button class="btn-ghost" onclick="activateRegencyIfNeeded()">Activate Regency If Needed</button>
      <button class="btn-ghost" onclick="regentEndorseWarPowers()">GE: Endorse War Powers</button>
      <button class="btn-ghost" onclick="regentHandOffToPatriarch()">Hand-off → Patriarch</button>
      <button class="btn-ghost" onclick="dismissRegent('manual')">Dismiss Regent</button>
    </div>
    <p style="color:var(--text-dim);font-size:0.78rem;margin-top:6px;">Tax/recruit allowed · War Economy needs GE endorsement · ${r.termYears||5}-year term then succession pressure · Ends when Patriarch restored.</p>
  </div>`;
}

function regentTermTick() {
  ensureRegent();
  if (!state.regent.id) {
    try { activateRegencyIfNeeded(); } catch(e) {}
    return;
  }
  const reg = (state.characters || []).find(c => c.id === state.regent.id);
  if (!reg || reg.alive === false) {
    state.regent.id = null;
    activateRegencyIfNeeded();
    return;
  }
  reg.isRegent = true;
  const pat = findLivingPatriarchSafe();
  if (pat) { dismissRegent("Patriarch holds the seat"); return; }
  const years = (state.sim.year || 1) - (state.regent.appointedYear || state.sim.year || 1);
  reg.regentYears = years;
  if (years >= (state.regent.termYears || 5) && state.sim.month === 1) {
    try { pushAlertDeduped && pushAlertDeduped("Regent term limit — open succession"); } catch(e) {}
    if (years >= (state.regent.termYears || 5) + 2) {
      try { addLoyalty(reg, -5); } catch(e) {}
      simLog("Regent overstay — pressure rises.");
    }
  }
}

function successionCrisisCheck() {
  const pat = getLineageCharacters().find(c => currentRankId(c) === "patriarch");
  if (pat) return;
  const designated = state.succession && state.succession.designatedId;
  const aliveDes = designated && getLineageCharacters().some(c => c.id === designated);
  if (!aliveDes && !state.council.discussionOpen) {
    ensureRegent();
    state.sim.running = false;
    if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
    state.sim.pendingChoice = {
      event: "Succession Crisis — No Patriarch and no confirmed successor. The clan must act.",
      options: [
        { label: "Open Succession Council", effect: "crisis_open_council" },
        { label: "Let Regent rule for now", effect: "crisis_regent" },
        { label: "Emergency: promote strongest Core+", effect: "crisis_emergency_pat" }
      ]
    };
    try { recordPauseReason("Succession crisis"); } catch(e) {}
    showToast("Succession crisis");
  }
}

function resolveCrisisCouncilEffects(effect) {
  if (effect === "crisis_open_council") {
    openSuccessionCouncil();
    return;
  }
  if (effect === "crisis_regent") {
    ensureRegent();
    simLog("Regent continues to hold the clan together.");
    state.sim.pendingChoice = null;
    saveState();
    switchView("simulation");
    return;
  }
  if (effect === "crisis_emergency_pat") {
    const c = getLineageCharacters().filter(x => ["core","elder","grand_elder"].includes(currentRankId(x)))
      .sort((a,b) => cultivationScore(b)-cultivationScore(a))[0];
    if (c) {
      state.hierarchy.roles[c.id] = "patriarch";
      c.isFounder = true;
      state.lineage.founderId = c.id;
      simLog("Emergency Patriarch: " + c.name);
    }
    state.sim.pendingChoice = null;
    saveState();
    switchView("simulation");
  }
}

function councilBribeEvent() {
  if (!state.council.discussionOpen) return showToast("Open council first");
  if ((state.clanWealth.gold||0) < 30) return showToast("Need 30 gold");
  state.clanWealth.gold -= 30;
  const voters = councilVoters();
  voters.slice(0, Math.min(3, voters.length)).forEach(v => {
    if (state.council.successorCandidateId) state.council.votes[v.id] = state.council.successorCandidateId;
    addLoyalty(v, -5);
  });
  simLog("Bribes influenced council votes (-30 gold, loyalty sting)");
  saveState();
  showToast("Votes swayed");
  switchView("simulation");
}

function setBallotMode(m) {
  ensureSimFinal();
  state.simFinal.ballotMode = m;
  saveState();
  showToast("Ballot: " + m);
}

function canCallLastDefense() {
  ensureSimFinal();
  const y = state.sim.year || 1;
  if (y - (state.simFinal.lastDefenseYear || -99) < (state.simFinal.lastDefenseCooldown || 10)) {
    return { ok: false, reason: "Cooldown — wait until Y" + ((state.simFinal.lastDefenseYear||0) + state.simFinal.lastDefenseCooldown) };
  }
  if ((state.simFinal.ancestorSeclusionUntil || 0) > y) return { ok: false, reason: "Ancestor in seclusion until Y" + state.simFinal.ancestorSeclusionUntil };
  const threat = state.globalThreat || 1;
  const living = getLineageCharacters().length;
  if (threat < 6 && living > 5) return { ok: false, reason: "Only when threat ≥ 6 or living ≤ 5" };
  return { ok: true };
}

function ancestorLastDefenseGated() {
  ensureSimFinal();
  const check = canCallLastDefense();
  if (!check.ok) return showToast(check.reason);
  ancestorLastDefense();
  state.simFinal.lastDefenseYear = state.sim.year || 1;
  // seclusion after defense
  state.simFinal.ancestorSeclusionUntil = (state.sim.year || 1) + 3;
  const anc = getLineageCharacters().find(c => currentRankId(c) === "ancestor");
  if (anc) simLog(anc.name + " enters seclusion to recover (3 years).");
  saveState();
}

function ancestorBlessingTickGated() {
  ensureSimFinal();
  const y = state.sim.year || 1;
  if ((state.simFinal.ancestorSeclusionUntil || 0) > y) return; // no blessing in seclusion
  try { ancestorBlessingTick(); } catch(e) {}
}

function meritCapAdd(char, n, reason) {
  try { ensureSimFinal(); } catch(e) { state.simFinal = state.simFinal || { meritYearGain: {}, meritYearCap: 120 }; }
  ensureProgression();
  if (!char || !n) return;
  const id = char.id;
  if (!state.simFinal) state.simFinal = { meritYearGain: {}, meritYearCap: 120 };
  if (!state.simFinal.meritYearGain) state.simFinal.meritYearGain = {};
  if (!state.simFinal.meritYearGain[id]) state.simFinal.meritYearGain[id] = 0;
  const cap = state.simFinal.meritYearCap || 120;
  const room = Math.max(0, cap - state.simFinal.meritYearGain[id]);
  const give = Math.min(Math.round(n), room);
  if (give <= 0) {
    // still allow tiny trickle past yearly soft-cap so members never fully freeze
    state.progression.merit[id] = (getMerit(char) || 0) + 1;
    return;
  }
  state.simFinal.meritYearGain[id] += give;
  state.progression.merit[id] = (getMerit(char) || 0) + give;
}

function resetMeritYearCaps() {
  ensureSimFinal();
  state.simFinal.meritYearGain = {};
}

function seatStagnationTick() {
  const elders = getLineageCharacters().filter(c => currentRankId(c) === "elder");
  const cap = ((state.simDepth && state.simDepth.rankCaps) || {}).elder || 13;
  if (elders.length >= cap) return;
  // every 30 years open pressure - auto promote top of waiting list
  if ((state.sim.year || 1) % 30 === 0 && state.sim.month === 1) {
    updateWaitingList();
    const id = (state.council.waitingList || [])[0];
    if (id) {
      const c = state.characters.find(x => x.id === id);
      if (c) {
        state.hierarchy.roles[c.id] = "elder";
        simLog("Seat stagnation broken: " + c.name + " elevated to Elder");
      }
    }
  }
}

function recruitCostScale(base) {
  const n = getLineageCharacters().length;
  return Math.floor(base * (1 + n / 200));
}

function massRecruitScaled() {
  const unit = recruitCostScale(8);
  const n = 5;
  const cost = unit * n;
  if ((state.clanWealth.gold||0) < cost) return showToast("Need " + cost + " gold (scales with population)");
  // temporarily use gold then massRecruit logic
  const room = Math.max(0, (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000) - getLineageCharacters().length);
  const count = Math.min(n, room);
  if (!count) return showToast("At cap");
  state.clanWealth.gold -= unit * count;
  for (let i=0;i<count;i++) {
    const c = generateCharacter("Dou Zhe");
    c.alive = true; c.isHeir = true; c.lineageId = state.lineage.founderId;
    c.generation = state.lineage.generations || 1;
    c.talent = "Ordinary";
    c.lineageId = state.lineage.founderId;
    c.isHeir = true;
    state.characters.push(c);
    state.hierarchy.roles[c.id] = "outer";
    try { ensureProgression(); state.progression.merit[c.id] = 0; } catch(e) {}
  }
  markHierarchyDirty && markHierarchyDirty("recruit");
  simLog("Recruited " + count + " at scaled cost " + (unit*count));
  saveState();
  showToast("Recruited " + count);
  switchView("simulation");
}

function whatShouldIDo() {
  ensureSimQoL && ensureSimQoL();
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const goal = (state.simQoL && state.simQoL.goal) || "Survival";
  const tips = [];
  if (!state.lineage.founderId) tips.push("Quick Setup");
  else if (!getLineageCharacters().some(c => currentRankId(c)==="patriarch")) tips.push("Open Succession Council or resolve crisis");
  else if (living < 8) tips.push("Recruit Labor or Generation Wave");
  else if (gold < 40) tips.push("Trade Caravan / Tribute");
  else if ((state.orgControl && state.orgControl.dirty)) tips.push("Review progression — promote ready members");
  else if (goal === "Empire") tips.push("Mass recruit toward 1000 living");
  else if (goal === "Continental") tips.push("Monument + Honor Banquet for renown");
  else tips.push("Run sim with Pause important-only · train Focus character");
  alert("What you should do:\n1. " + tips[0] + (tips[1] ? "\n2. " + tips[1] : ""));
}

function setPauseFilter(f) {
  ensureSimFinal();
  state.simFinal.pauseFilter = f;
  saveState();
  showToast("Pause filter: " + f);
}

function memberDossier() {
  const c = getActiveChar();
  if (!c) return showToast("Select a member");
  const r = currentRankId(c);
  const next = nextRankId(r);
  const p = typeof progressPct === "function" ? progressPct(c, next) : {};
  alert(c.name + "\nRank: " + r + " → " + next +
    "\nCult: " + (p.score||"?") + " / need " + ((p.req&&p.req.score)||"?") +
    "\nMerit: " + (p.merit||"?") + " / need " + ((p.req&&p.req.merit)||"?") +
    "\nLoyalty: " + (typeof loyaltyOf==='function'?loyaltyOf(c):"?") +
    "\nEducation: " + (c.education||"none") +
    "\nTalent: " + (c.talent||"?") +
    "\n" + (c.star||"") + " " + (c.realm||""));
}

function seasonLabel() {
  const m = state.sim.month || 1;
  if (m <= 3) return "Spring";
  if (m <= 6) return "Summer";
  if (m <= 9) return "Autumn";
  return "Winter";
}

function checkClimbAchievement() {
  ensureSimFinal();
  getLineageCharacters().forEach(c => {
    if (currentRankId(c) === "ancestor" && getMerit(c) >= 130 && !state.simFinal.achievements[c.id + "_climb"]) {
      state.simFinal.achievements[c.id + "_climb"] = true;
      state.storyChapters.push({ title: "Achievement: Outer to Ancestor", content: c.name + " climbed the entire ladder." });
      showToast("Achievement: Outer → Ancestor");
    }
  });
}

function showEndingIfAny() {
  ensureSimFinal();
  const living = getLineageCharacters().length;
  if (living === 0 && !state.simFinal.endingsShown.extinction) {
    state.simFinal.endingsShown.extinction = true;
    alert("ENDING: Extinction\nThe bloodline is no more.");
  }
  if (living >= (typeof LIVING_CAP!=="undefined"?LIVING_CAP:1000) && !state.simFinal.endingsShown.empire) {
    state.simFinal.endingsShown.empire = true;
    alert("ENDING: Empire\n1000 living souls under one blood name.");
  }
  if ((state.hierarchy&&state.hierarchy.prestigeTier)==="Continental" && state.council && state.succession && state.succession.designatedId && !state.simFinal.endingsShown.council) {
    state.simFinal.endingsShown.council = true;
    alert("ENDING: Council Dynasty\nContinental prestige with lawful succession.");
  }
}

function geConflictEvent() {
  const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder");
  if (ges.length < 2) return;
  if (Math.random() > 0.08) return;
  const a = ges[0], b = ges[1];
  addLoyalty(a, -8); addLoyalty(b, -8);
  simLog("Inner conflict: " + a.name + " and " + b.name + " split the Grand Elder wing.");
}

function resourceClaimEvent() {
  if (Math.random() > 0.06) return;
  state.sim.pendingChoice = {
    event: "Resource Claim — A herb mountain is contested by another clan.",
    options: [
      { label: "Fight for it (War Draft style)", effect: "res_fight" },
      { label: "Buy rights (-40 gold)", effect: "res_buy" },
      { label: "Walk away", effect: "res_skip" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
}

function resolveResourceEffect(effect) {
  if (effect === "res_fight") { try { warDraft(); } catch(e) {} }
  else if (effect === "res_buy") {
    if ((state.clanWealth.gold||0) >= 40) { state.clanWealth.gold -= 40; state.clanWealth.herbs = (state.clanWealth.herbs||0)+3; simLog("Herb mountain rights purchased"); }
    else showToast("Not enough gold");
  } else simLog("Clan walked away from the claim.");
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function marriageAllianceRival() {
  ensureDynasty && ensureDynasty();
  if ((state.clanWealth.gold||0) < 35) return showToast("Need 35 gold");
  state.clanWealth.gold -= 35;
  if (state.dynasty.rival) {
    state.dynasty.rival.hostility = 0;
    state.dynasty.rival.allianceUntil = (state.sim.year||1) + 10;
  }
  simLog("Marriage alliance with rival — peace for a decade.");
  saveState();
  showToast("Rival alliance 10 years");
  switchView("simulation");
}



function renderCleanSimUI() {
  ensureSimFinal();
  ensureProgression && ensureProgression();
  ensureSimUI && ensureSimUI();
  const season = typeof seasonLabel === "function" ? seasonLabel() : "";
  const mode = (state.progression && state.progression.mode) || "bottom_up";
  const _panel = (state.simUI && state.simUI.focusPanel) || "management";
  const _focus = state.simUI && state.simUI.focusMode;
  return `
    ${typeof renderStickySimBar==='function'?renderStickySimBar():''}
    ${typeof renderSimSubnav==='function'?renderSimSubnav():''}
    ${typeof renderDeltaChips==='function'?renderDeltaChips():''}
    ${typeof renderMemberDrawer==='function'?renderMemberDrawer():''}
    ${typeof renderFullSimHUD==='function'?renderFullSimHUD():''}
    <div class="card" style="margin-bottom:12px;padding:12px;">
      <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Quick Controls</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
        <button class="btn-primary" onclick="autoManageEverything()">⚡ Auto-Manage</button>
        <button class="btn-ghost" onclick="setAutoManageMode('survival')">Survival</button>
        <button class="btn-ghost" onclick="setAutoManageMode('balanced')">Balanced</button>
        <button class="btn-ghost" onclick="setAutoManageMode('expansion')">Expansion</button>
        <button class="btn-primary" onclick="simSaveSlot()">Save</button>
        <button class="btn-ghost" onclick="simLoadSlot()">Load</button>
        <button class="btn-ghost" onclick="newFullDynastySim()">New Full SIM</button>
        <button class="btn-ghost" onclick="const r=repairPatriarch({reason:'manual'});showToast(r.ok&&r.patriarch?('Patriarch: '+r.patriarch.name):('Failed'));switchView('simulation');">Repair Patriarch</button>
        <button class="btn-ghost" onclick="activateRegencyIfNeeded()">Regency Check</button>
        <button class="btn-ghost" onclick="startSuccessionCrisisScript()">Succession Crisis</button>
        <button class="btn-ghost" onclick="toggleAdvancedUI()">Advanced: ${(state.game&&state.game.advancedUI)?"ON":"OFF"}</button>
      </div>
      ${(state.game&&state.game.advancedUI) ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;padding-top:8px;border-top:1px solid var(--border);">
        <button class="btn-ghost" onclick="setFiveYearPlan('population')">Plan: Pop</button>
        <button class="btn-ghost" onclick="setFiveYearPlan('gold')">Plan: Gold</button>
        <button class="btn-ghost" onclick="setVictoryType('any')">Victory: Any</button>
        <button class="btn-ghost" onclick="claimNode('mine')">Claim Mine</button>
        <button class="btn-ghost" onclick="claimNode('herb')">Claim Herb</button>
        <button class="btn-ghost" onclick="claimNode('field')">Claim Fields</button>
        <button class="btn-ghost" onclick="resolveBorderClash()">Border Clash</button>
        <button class="btn-ghost" onclick="discoverArtifact()">Artifact</button>
        <button class="btn-ghost" onclick="formAlliance()">Alliance</button>
        <button class="btn-ghost" onclick="startSiege()">Siege</button>
        <button class="btn-ghost" onclick="balanceDashboard()">Balance</button>
        <button class="btn-ghost" onclick="bugcheckSanity()">Bugcheck</button>
        <button class="btn-ghost" onclick="exportDynastyChronicle()">Export Chronicle</button>
        <button class="btn-ghost" onclick="abdicatePatriarch()">Abdicate</button>
      </div>` : `<p style="color:var(--text-dim);font-size:0.8rem;">Advanced OFF — extra tools hidden. Core loop: Auto-Manage → Run / Month / Year.</p>`}
      <p style="color:var(--text-dim);font-size:0.78rem;">AP ${(state.sim30&&state.sim30.patriarchAP)||0}/${(state.sim30&&state.sim30.maxAP)||5} · Auto ${state.mgmt&&state.mgmt.autoManage?(state.mgmt.autoMode||'ON'):'OFF'} · Hotkeys: Space Month · Enter Year · P Pause</p>
      ${typeof renderRivalPanel==='function'?renderRivalPanel():''}
      ${typeof renderPopGoldGraph==='function'?renderPopGoldGraph():''}
      <p style="color:var(--text-dim);font-size:0.78rem;">Hotkeys: Space = Month · Enter = Year · P = Pause · Education queue: ${((state.game&&state.game.educationQueue)||[]).length}/3 · Nodes: ${((state.game&&state.game.nodes)||[]).filter(n=>n.owner==='player').map(n=>n.label).join(', ')||'none'}</p>
    </div>
    ${typeof renderSimPulse==='function'?renderSimPulse():''}
    ${typeof renderSimTabs==='function'?renderSimTabs():''}
    ${typeof renderAlertsStrip==='function'?renderAlertsStrip():''}
    <div style="display:${(_focus && _panel!=='management')?'none':((state.simFinish&&state.simFinish.tab==='politics')?'none':'block')}">${typeof renderManagementDashboard==='function'?renderManagementDashboard():''}</div>
    ${typeof clanStatusCard==='function'?clanStatusCard():''}
    <p style="color:var(--text-dim);font-size:0.85rem;margin:6px 0;">Season: <strong style="color:var(--gold);">${season}</strong> · Progression: <strong style="color:var(--gold);">${mode}</strong> · Pause filter: ${(state.simFinal&&state.simFinal.pauseFilter)||'important'}</p>
    ${typeof renderDirtyBadge==='function'?renderDirtyBadge():''}
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
      <button class="btn-primary" onclick="quickSetupDynasty()">Quick Setup</button>
      <button class="btn-primary" onclick="startSimulation()">Run</button>
      <button class="btn-ghost" onclick="try{stopSimulation()}catch(e){};try{afterActionReport()}catch(e){}">Stop + Report</button>
      <button class="btn-ghost" onclick="whatShouldIDo()">What should I do?</button>
      <button class="btn-ghost" onclick="memberDossier()">Member Dossier</button>
      <button class="btn-ghost" onclick="promoteAllReady()">Promote All Ready</button>
      <button class="btn-primary" onclick="trainFocusMerit()">Train Focus (+10 merit)</button>
      <button class="btn-primary" onclick="trainWholeClan()">Train Whole Clan (+6 all)</button>
      <button class="btn-ghost" onclick="yearEndReport()">Year Report</button>
      <button class="btn-ghost" onclick="openSuccessionCouncil()">Succession Council</button>
      <button class="btn-ghost" onclick="autoCouncilVote()">Council Auto-Vote</button>
      <button class="btn-ghost" onclick="councilBribeEvent()">Bribe Votes</button>
      <button class="btn-ghost" onclick="ancestorLastDefenseGated()">Ancestor Last Defense</button>
      <button class="btn-ghost" onclick="massRecruitScaled()">Recruit (scaled)</button>
      <button class="btn-ghost" onclick="marriageAllianceRival()">Rival Alliance</button>
      <button class="btn-ghost" onclick="setPauseFilter('important')">Pause: Important</button>
      <button class="btn-ghost" onclick="setPauseFilter('all')">Pause: All</button>
      <button class="btn-ghost" onclick="toggleAdvancedTools()">More tools: ${(state.simQoL&&state.simQoL.advanced)?"ON":"OFF"}</button>
    </div>
    ${(!_focus || _panel==="people") ? (typeof renderRankSummary==="function"?renderRankSummary():"") : ""}
    ${(!_focus || _panel==="people") ? (typeof renderVirtualMemberList==="function"?renderVirtualMemberList():"") : ""}
    <div style="margin-bottom:8px;"><input id="memberSearchBox" placeholder="Search members..." value="${(state.simConnect&&state.simConnect.memberSearch)||''}"
      onchange="setMemberSearch(this.value)" onkeydown="if(event.key==='Enter')setMemberSearch(this.value)"
      style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:8px 12px;border-radius:8px;width:min(280px,100%);" /></div>
    ${!(state.mgmt&&state.mgmt.mgmtOnly) && ( !state.simFinish || state.simFinish.tab==='people' || state.simFinish.tab==='management') && typeof renderProgressionPanel==='function'?renderProgressionPanel():''}
    ${typeof renderWhyPaused==='function'?renderWhyPaused():''}
    ${typeof renderCriticalBanner==='function'?renderCriticalBanner():''}
    ${typeof renderFoodCrisisUI==='function'?renderFoodCrisisUI():''}
    ${(!_focus || _panel==="world" || _panel==="management") ? (typeof renderWorldHudStrip==="function"?renderWorldHudStrip():"") : ""}
    ${(!_focus || _panel==="world") ? (typeof renderWorldSimPanel==="function"?renderWorldSimPanel():"") : ""}
    ${typeof renderRegentScorecard==='function'?renderRegentScorecard():''}
    ${(!_focus || _panel==="politics") ? (typeof renderGrandElderHall==="function"?renderGrandElderHall():"") : ""}
    ${(!_focus || _panel==="politics") ? (typeof renderRegentPanel==="function"?renderRegentPanel():"") : ""}
    ${(!_focus || _panel==="politics") ? (typeof renderRegentScorecard==="function"?renderRegentScorecard():"") : ""}
    ${typeof renderWhyPaused==='function'?renderWhyPaused():''}
    ${typeof renderCriticalBanner==='function'?renderCriticalBanner():''}
    ${typeof renderFoodCrisisUI==='function'?renderFoodCrisisUI():''}
    ${(!_focus || _panel==="world" || _panel==="management") ? (typeof renderWorldHudStrip==="function"?renderWorldHudStrip():"") : ""}
    ${(!_focus || _panel==="world") ? (typeof renderWorldSimPanel==="function"?renderWorldSimPanel():"") : ""}
    ${typeof renderRegentScorecard==='function'?renderRegentScorecard():''}
    ${(!_focus || _panel==="politics") ? (typeof renderGrandElderHall==="function"?renderGrandElderHall():"") : ""}
    ${(!_focus || _panel==="politics") ? (typeof renderRegentPanel==="function"?renderRegentPanel():"") : ""}
    ${(!_focus || _panel==="politics") ? (typeof renderRegentScorecard==="function"?renderRegentScorecard():"") : ""}
    ${!(state.mgmt&&state.mgmt.mgmtOnly) && (!state.simFinish||state.simFinish.tab==='politics'||state.simFinish.tab==='management') && typeof renderSuccessionCouncil==='function'?renderSuccessionCouncil():''}
    ${typeof renderSeatMap==='function'?renderSeatMap():''}
  `;
}

// CLEAN_SIM_UI


function trainFocusMerit() {
  ensureProgression();
  const char = (typeof getFocusChar === "function" && getFocusChar()) || getActiveChar();
  if (!char) return showToast("Select or set Focus character");
  addMerit(char, 10, "focused training");
  char.experience = Math.min(100, (char.experience || 20) + 2);
  char.douQi = (char.douQi || 100) + 50;
  saveState();
  showToast(char.name + " merit → " + getMerit(char));
  switchView("simulation");
}

function tryFillWaitingList() {
  ensureCouncil && ensureCouncil();
  updateWaitingList && updateWaitingList();
  const list = (state.council && state.council.waitingList) || [];
  if (!list.length) return;
  // if elder seat free, promote first in queue
  if (typeof seatAvailable === "function" && seatAvailable("elder")) {
    const c = state.characters.find(x => x.id === list[0]);
    if (c && currentRankId(c) !== "elder") {
      state.hierarchy.roles[c.id] = "elder";
      simLog(c.name + " rose from waiting list into an Elder seat");
      try { if (state.council.elderTermStart) state.council.elderTermStart[c.id] = state.sim.year; } catch(e) {}
    }
  }
  if (typeof seatAvailable === "function" && seatAvailable("grand_elder")) {
    const c = state.characters.find(x => x.id === list[0] || list[1]);
    if (c && meetsRequirement(c, "grand_elder") && currentRankId(c) === "elder") {
      state.hierarchy.roles[c.id] = "grand_elder";
      simLog(c.name + " rose from waiting list into Grand Elder");
    }
  }
}

function yearEndReport() {
  ensureSimQuality && ensureSimQuality();
  const d = state.simQuality && state.simQuality.lastDelta;
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const promos = (state.sim.log || []).filter(l => (l.msg || "").toLowerCase().includes("promoted")).slice(0, 5);
  let t = "Year Report Y" + (state.sim.year || 1) + "\nLiving: " + living + "\nGold: " + gold;
  if (d) t += "\nΔ Living: " + d.livingDelta + " · Δ Gold: " + d.goldDelta + " · Deaths: " + (d.deaths || 0);
  t += "\nPromotions:\n" + (promos.map(p => p.msg).join("\n") || "(none logged)");
  alert(t);
}

function renderCouncilVotes() {
  ensureCouncil();
  const votes = state.council.votes || {};
  const candId = state.council.successorCandidateId;
  const lines = Object.keys(votes).map(vid => {
    const v = state.characters.find(c => c.id === vid);
    const forCand = votes[vid] === candId;
    return (v ? v.name : vid) + (forCand ? " ✓" : " (other)");
  });
  return lines.length ? lines.join(", ") : "No votes yet";
}


const STORY_CAP = 100;
function pushChapter(ch) {
  state.storyChapters = state.storyChapters || [];
  state.storyChapters.push(ch);
  if (state.storyChapters.length > STORY_CAP) state.storyChapters.splice(0, state.storyChapters.length - STORY_CAP);
}

function successionDeadlockDuel() {
  ensureCouncil();
  const candId = state.council.successorCandidateId;
  // find top two by votes or top two by power
  const tally = {};
  Object.values(state.council.votes || {}).forEach(id => { tally[id] = (tally[id]||0)+1; });
  let ids = Object.keys(tally).sort((a,b) => tally[b]-tally[a]);
  if (ids.length < 2) {
    ids = getLineageCharacters().filter(c => canBePatriarchCandidate(c).ok).sort((a,b)=>cultivationScore(b)-cultivationScore(a)).slice(0,2).map(c=>c.id);
  }
  if (ids.length < 2) return showToast("Need two candidates for duel");
  const a = state.characters.find(c => c.id === ids[0]);
  const b = state.characters.find(c => c.id === ids[1]);
  if (typeof simulateDetailedBattle === "function") {
    const res = simulateDetailedBattle(a, b);
    const winner = res.win ? a : b;
    state.council.successorCandidateId = winner.id;
    state.council.votes = {};
    councilVoters().forEach(v => { state.council.votes[v.id] = winner.id; });
    simLog("Council deadlock broken by duel — " + winner.name + " prevails");
    showToast("Duel winner: " + winner.name);
  }
  saveState();
  switchView("simulation");
}


// ===== FULL CLAN MANAGEMENT SIM =====
function ensureManagement() {
  ensureSim();
  ensureDynasty && ensureDynasty();
  ensureProgression && ensureProgression();
  ensureWealth && ensureWealth();
  if (!state.mgmt) {
    state.mgmt = {
      departments: {
        military: { level: 1, budget: 0 },
        alchemy: { level: 1, budget: 0 },
        diplomacy: { level: 1, budget: 0 },
        economy: { level: 1, budget: 0 },
        intelligence: { level: 1, budget: 0 }
      },
      monthlyOrders: [], // up to 3
      policies: {
        taxation: "normal", // low | normal | high
        recruitment: "steady", // closed | steady | aggressive
        training: "balanced", // safe | balanced | harsh
        openness: "neutral" // isolation | neutral | expansion
      },
      food: 70,
      morale: 65,
      security: 55,
      lastMonthReport: null,
      autoManage: false
    };
  }
}

function setPolicy(key, val) {
  ensureManagement();
  ensureMgmtDepth();
  const actor = getActiveChar();
  if ((key === "taxation") && actor && !(currentRankId(actor) === "patriarch" || (typeof isRegentChar === "function" && isRegentChar(actor)) || actor.isRegent)) {
    return showToast("Only Patriarch/Regent may change tax policy");
  }
  const dangerous = (key === "taxation" && val === "high") || (key === "recruitment" && val === "aggressive");
  if (dangerous && !confirm("Confirm policy: " + key + " → " + val + "?")) return;
  if (typeof spendPatriarchAP === "function" && !spendPatriarchAP(1, "policy " + key)) return;
  try { pushPolicyHistory(snapshotPolicies()); } catch(e) {}
  try { policyRequiresCouncil(key, val); } catch(e) {}
  state.mgmt.policies[key] = val;
  saveState();
  showToast(key + " → " + val);
  switchView("simulation");
}

function setDeptBudget(dept, amount) {
  ensureManagement();
  amount = Math.max(0, Math.min(50, Number(amount) || 0));
  if (!state.mgmt.departments[dept]) return;
  state.mgmt.departments[dept].budget = amount;
  saveState();
}

function upgradeDepartment(dept) { return upgradeDepartmentCapped(dept); }

function queueMonthlyOrder(order) {
  ensureManagement();
  if (!state.mgmt.monthlyOrders) state.mgmt.monthlyOrders = [];
  if (state.mgmt.monthlyOrders.includes(order)) return showToast("Already queued");
  if (state.mgmt.monthlyOrders.length >= 3) return showToast("Max 3 monthly orders");
  state.mgmt.monthlyOrders.push(order);
  saveState();
  showToast("Order queued: " + order);
  switchView("simulation");
}

function clearMonthlyOrders() {
  ensureManagement();
  state.mgmt.monthlyOrders = [];
  saveState();
  switchView("simulation");
}

function managementMonthTick() {
  ensureManagement();
  if (state.council && state.council.discussionOpen) {
    // frozen during council — only minimal upkeep note
    return;
  }
  const p = state.mgmt.policies;
  const deps = state.mgmt.departments;
  let goldDelta = 0;
  let foodDelta = 0;
  let moraleDelta = 0;
  let securityDelta = 0;
  const living = getLineageCharacters().length || 1;

  try { ensureMgmtDepth(); } catch(e) {}
  // Class-based food & stipend
  let foodNeed = 0;
  let stipend = 0;
  getLineageCharacters().forEach(ch => {
    foodNeed += classFoodCost(ch);
    stipend += classGoldStipend(ch);
  });
  foodDelta -= foodNeed * 0.35;
  goldDelta -= stipend * 0.15;

  // Upkeep
  let upkeep = Math.floor(living * 0.15) + Object.values(deps).reduce((s, d) => s + (d.budget || 0), 0);
  if (state.mgmt.warFooting) upkeep = Math.floor(upkeep * 1.5);
  // war footing dept effectiveness felt via security
  securityDelta += Math.floor(state.mgmt.departments.military.level * (typeof warFootingDeptMod==='function'?warFootingDeptMod('military'):1));
  goldDelta -= upkeep;
  if (state.mgmt.warFooting) {
    securityDelta += 3;
    moraleDelta -= 1;
    getLineageCharacters().slice(0, 8).forEach(ch => { try { meritCapAdd(ch, 1, "war footing"); } catch(e) {} });
  }
  if (state.mgmt.border === "War") {
    goldDelta -= 8;
    securityDelta += 2;
    if (Math.random() > 0.85) {
      // tribute/reparations risk
      goldDelta -= 10;
      simLog("War pressure extracts gold.");
    }
  } else if (state.mgmt.border === "Tension") {
    goldDelta -= 3;
  }
  // Warehouse auto-draw if food low
  if (state.mgmt.food < 20) {
    const w = warehouseWithdraw("food", 15);
    foodDelta += w;
  }
  // Surplus food to warehouse
  if (state.mgmt.food > 100) {
    const store = warehouseStore("food", Math.floor((state.mgmt.food - 100) / 2));
    foodDelta -= store;
  }
  // Department head merit
  Object.keys(state.mgmt.deptHeads || {}).forEach(dept => {
    const id = state.mgmt.deptHeads[dept];
    const head = state.characters.find(x => x.id === id && x.alive !== false);
    if (head) try { meritCapAdd(head, 2 + deptHeadBonus(dept), "dept work"); if (deptHeadBonus(dept) >= 3) meritCapAdd(head, 2, "excellent head"); } catch(e) {}
  });


  // Taxation policy
  const taxRate = p.taxation === "high" ? 1.4 : p.taxation === "low" ? 0.6 : 1;
  const livingN = getLineageCharacters().length || 1;
  const income = Math.floor((5 + (deps.economy.level * 3) + ((state.clanWealth.renown || 1) * 0.5) + livingN * 0.08 + (deps.economy.budget || 0) * 0.3) * taxRate);
  goldDelta += income;
  if (p.taxation === "high") moraleDelta -= 2;
  if (p.taxation === "low") moraleDelta += 1;

  // Food
  // Economy production scales with level + budget + head; consumption already applied
  foodDelta += 4 + (deps.economy.level || 1) * 2 + Math.floor((deps.economy.budget || 0) / 5);
  if (living > 50) foodDelta += Math.floor((deps.economy.budget || 0) / 3);
  // Soften pure pop drain already in foodNeed — extra relief for large auto-managed clans
  if (state.mgmt.autoManage && living > 100) foodDelta += Math.min(20, Math.floor(living / 50));
  if (state.mgmt.food + foodDelta < 10) moraleDelta -= 3;

  // Military / security
  securityDelta += deps.military.level + (deps.military.budget > 0 ? 1 : 0) - Math.floor((state.globalThreat || 1) / 3);
  if (p.training === "harsh") {
    securityDelta += 1;
    getLineageCharacters().forEach(ch => {
      try { meritCapAdd(ch, 1, "harsh training"); } catch(e) {}
      if (Math.random() > 0.92) applyInjury(ch, 1);
    });
    moraleDelta -= 1;
  } else if (p.training === "safe") {
    moraleDelta += 1;
  }

  // Alchemy budget
  if (deps.alchemy.budget > 0 || deps.alchemy.level > 1) {
    getLineageCharacters().filter(ch => hierarchyPower(ch) >= 1).slice(0, 5).forEach(ch => {
      ch.foundation = Math.min(100, (ch.foundation || 40) + 0.5 * deps.alchemy.level);
      try { meritCapAdd(ch, 1, "alchemy dept"); } catch(e) {}
    });
  }

  // Diplomacy
  if (deps.diplomacy.level >= 2 && Math.random() > 0.85) {
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
  }

  // Intelligence
  if (deps.intelligence.level >= 2 && Math.random() > 0.9) {
    state.globalThreat = Math.max(1, (state.globalThreat || 1) - 1);
    simLog("Intelligence network softens external threat.");
  }

  // Recruitment policy
  if (p.recruitment === "aggressive") foodDelta -= 2; // next month pressure
  if (p.recruitment === "aggressive" && living < (typeof LIVING_CAP !== "undefined" ? LIVING_CAP : 1000) - 5) {
    if ((state.clanWealth.gold || 0) + goldDelta > 20 && Math.random() > 0.7) {
      goldDelta -= 8;
      try {
        const c = generateCharacter("Dou Zhe");
        c.alive = true; c.isHeir = true; c.lineageId = state.lineage.founderId;
        c.generation = state.lineage.generations || 1;
        state.characters.push(c);
        state.hierarchy.roles[c.id] = "outer";
        ensureProgression(); state.progression.merit[c.id] = 0;
      } catch(e) {}
    }
  } else if (p.recruitment === "closed") {
    moraleDelta -= 0.5;
  }

  // Execute monthly orders
  (state.mgmt.monthlyOrders || []).forEach(order => {
    if (order === "stockpile_food") { foodDelta += orderPowerScale(8); goldDelta -= 5; }
    if (order === "patrol") { securityDelta += orderPowerScale(3); goldDelta -= 4; }
    if (order === "festival") { moraleDelta += orderPowerScale(5); goldDelta -= 10; }
    if (order === "closed_door") {
      getLineageCharacters().slice(0, 3).forEach(ch => {
        try { meritCapAdd(ch, 4, "closed door"); } catch(e) {}
        ch.douQi = (ch.douQi || 100) + 80;
      });
      goldDelta -= 6;
    }
    if (order === "expand_trade") { goldDelta += 12 + deps.economy.level * 2; }
  });
  state.mgmt.monthlyOrders = [];

  // Department heads do real work each month
  try {
    ensureMgmtDepth && ensureMgmtDepth();
    const heads = state.mgmt.deptHeads || {};
    const bonus = (dept) => (typeof deptHeadBonus === "function" ? deptHeadBonus(dept) : 0);
    if (heads.military) {
      securityDelta += 2 + bonus("military") + (state.mgmt.departments.military.level || 1);
      goldDelta -= 1;
    } else {
      securityDelta -= 1; // vacant military head
    }
    if (heads.economy) {
      foodDelta += 2 + bonus("economy") + Math.floor((state.mgmt.departments.economy.level || 1) * 0.5);
      goldDelta += 1 + bonus("economy");
    } else {
      foodDelta -= 1;
    }
    if (heads.alchemy) {
      moraleDelta += 1;
      // staff foundation
      getLineageCharacters().slice(0, 4).forEach(ch => {
        ch.foundation = Math.min(100, (ch.foundation || 40) + 0.3);
      });
    }
    if (heads.diplomacy) {
      moraleDelta += 1 + Math.floor(bonus("diplomacy") / 2);
      if (Math.random() > 0.85) state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
    } else {
      moraleDelta -= 0.5;
    }
    if (heads.intelligence) {
      securityDelta += 1 + bonus("intelligence");
      if ((state.globalThreat || 1) > 1 && Math.random() > 0.8) state.globalThreat -= 1;
    }
  } catch(e) {}

  // Visible baseline drift so meters never look frozen
  foodDelta += randInt(-2, 3);
  moraleDelta += randInt(-2, 2);
  securityDelta += randInt(-2, 2);

  // Apply (round so UI numbers move)
  state.clanWealth.gold = Math.max(0, Math.round((state.clanWealth.gold || 0) + goldDelta));
  state.mgmt.food = Math.max(0, Math.min(200, Math.round((state.mgmt.food || 50) + foodDelta)));
  state.mgmt.morale = Math.max(0, Math.min(100, Math.round((state.mgmt.morale || 60) + moraleDelta)));
  state.mgmt.security = Math.max(0, Math.min(100, Math.round((state.mgmt.security || 50) + securityDelta)));
  // keep integers after region/world ticks
  state.mgmt.food = Math.round(state.mgmt.food);
  state.mgmt.morale = Math.round(state.mgmt.morale);
  state.mgmt.security = Math.round(state.mgmt.security);

  // Low morale / security effects
  if (state.mgmt.morale < 25 && Math.random() > 0.7) {
    simLog("Low morale sparks unrest among Outer members.");
    getLineageCharacters().filter(ch => currentRankId(ch) === "outer").forEach(ch => {
      try { addLoyalty(ch, -3); } catch(e) {}
    });
  }
  if (state.mgmt.security < 25) {
    state.globalThreat = Math.min(10, (state.globalThreat || 1) + (Math.random() > 0.6 ? 1 : 0));
  }

  state.mgmt.lastMonthReport = {
    year: state.sim.year,
    month: state.sim.month,
    goldDelta: goldDelta,
    food: state.mgmt.food,
    morale: state.mgmt.morale,
    security: state.mgmt.security,
    upkeep: upkeep,
    income: income,
    trade: (typeof tradeRouteIncome === "function" ? 0 : 0) // filled after routes in later hook
  };

  if (state.mgmt.autoManage) {
    Object.keys(deps).forEach(k => { if (deps[k].budget > 15) deps[k].budget = 10; });
  }
  try {
    ensureMgmtPolish();
    tickConstruction();
    headVacancyPenalty();
    let d = null;
    if (state.mgmt.hardMode) { d = rollDisaster(); if (Math.random() > 0.5) d = rollDisaster() || d; }
    else if (Math.random() > 0.5) d = rollDisaster();
    if (d) applyDisaster(d);
    factionPressureTick();
    corruptHeadEvent();
    collapseAndGoldenTick();
    const routeGold = tradeRouteIncome();
    if (routeGold) {
      const reserved = applyReserveFund(routeGold);
      state.clanWealth.gold += (routeGold - reserved);
    }
    // hard mode income haircut
    if (state.mgmt.hardMode && state.mgmt.lastMonthReport && state.mgmt.lastMonthReport.income) {
      // already applied roughly via disasters; small extra drain
      state.clanWealth.gold = Math.max(0, state.clanWealth.gold - 2);
    }
    if (state.sim.month === 12) {
      ensureMgmtDepth();
      state.mgmt.yearLedger.push({
        year: state.sim.year, gold: state.clanWealth.gold, food: state.mgmt.food,
        morale: state.mgmt.morale, security: state.mgmt.security, living: getLineageCharacters().length
      });
      if (state.mgmt.yearLedger.length > 40) state.mgmt.yearLedger.shift();
    }
    censusEveryDecade();
    if (state.mgmt.border === "War" && Math.random() > 0.94) peaceTreatyEvent();
    priceShockTick();
    debtInterestTick();
    tradeRouteLevelTick();
    pauseIfRed();
    goldenAgeVictoryTick();
    earlyGameIncomeFloor();
    tutorialTick();
    regentTermTick();
    yearAutosave();
    softCapDeptLevels();
    if (state.sim.month === 12) { try { endOfYearCeremony(); checkFiveYearPlan(); } catch(e) {} }
    try { empireDecreeEvent(); tickNeighbors(); tickNodes(); tickEducationQueue(); assignAmbitions(); betrayalTick(); geniusChildEvent(); checkVictoryTypes(); } catch(e) {}
    try { bindSimHotkeys(); } catch(e) {}
    try {
      if (state.simFinish) state.simFinish.peakLiving = Math.max(state.simFinish.peakLiving || 0, getLineageCharacters().length);
    } catch(e) {}
    // annual cabinet
    if (state.sim.month === 1 && Math.random() > 0.4) { /* optional auto */ }
    // defeat detection
    if (getLineageCharacters().length === 0) { defeatCard("extinction"); try { generateEpilogue("defeat", "extinction"); } catch(e) {} }
    if ((state.mgmt.food||0) <= 0 && (state.mgmt.morale||0) < 15) defeatCard("famine");
  } catch(e) {}
}

function toggleAutoManage() {
  ensureManagement();
  state.mgmt.autoManage = !state.mgmt.autoManage;
  saveState();
  showToast("Auto-manage: " + (state.mgmt.autoManage ? "ON" : "OFF"));
  switchView("simulation");
}

function renderManagementDashboard() {
  ensureManagement();
  const m = state.mgmt;
  const r = m.lastMonthReport;
  const deps = m.departments;
  const depRow = (key, label) => {
    const d = deps[key];
    return `<div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;">
      <div><strong style="color:var(--gold);">${label}</strong> · Lv.${d.level} · Budget ${d.budget}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn-ghost" onclick="setDeptBudget('${key}', ${(d.budget||0)+5})">Budget +5</button>
        <button class="btn-ghost" onclick="setDeptBudget('${key}', Math.max(0,${(d.budget||0)-5}))">Budget -5</button>
        <button class="btn-ghost" onclick="upgradeDepartment('${key}')">Upgrade</button>
      </div>
    </div>`;
  };
  return `<div class="card" style="margin-bottom:14px;padding:14px;border-color:var(--gold);">
    <div style="color:var(--gold);font-family:var(--ds-font-display);font-size:1.15rem;margin-bottom:8px;">Clan Management <span style="font-size:0.8rem;color:var(--text-muted);">(Full SIM)</span></div>
    <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:8px;">Improved: class happiness, seasonal budgets, smuggling/mercs, infrastructure repair, artifact passives, alliance income.</p>
    <div class="grid-3" style="margin-bottom:12px;">
      <div class="stat-box"><div class="label">Food ${typeof statusLight==='function'?statusLight(m.food):''}</div><div class="value">${Math.round(m.food)}</div></div>
      <div class="stat-box"><div class="label">Morale ${typeof statusLight==='function'?statusLight(m.morale):''}</div><div class="value">${Math.round(m.morale)}</div></div>
      <div class="stat-box"><div class="label">Security ${typeof statusLight==='function'?statusLight(m.security):''}</div><div class="value">${Math.round(m.security)}</div></div>
      <div class="stat-box"><div class="label">Gold</div><div class="value">${(state.clanWealth&&state.clanWealth.gold)||0}</div></div>
      <div class="stat-box"><div class="label">Living</div><div class="value">${getLineageCharacters().length}</div></div>
      <div class="stat-box"><div class="label">Threat</div><div class="value">${state.globalThreat||1}</div></div>
    </div>
    ${typeof lastMonthReportCard==="function"?lastMonthReportCard():""}
    ${typeof constructionProgressBars==="function"?constructionProgressBars():""}
    ${typeof hourglassInfo==="function"?hourglassInfo():""}
    <div style="margin:12px 0;">
      <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Policies</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <select onchange="setPolicy('taxation', this.value)" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:8px;border-radius:8px;">
          <option value="low" ${m.policies.taxation==='low'?'selected':''}>Tax: Low</option>
          <option value="normal" ${m.policies.taxation==='normal'?'selected':''}>Tax: Normal</option>
          <option value="high" ${m.policies.taxation==='high'?'selected':''}>Tax: High</option>
        </select>
        <select onchange="setPolicy('recruitment', this.value)" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:8px;border-radius:8px;">
          <option value="closed" ${m.policies.recruitment==='closed'?'selected':''}>Recruit: Closed</option>
          <option value="steady" ${m.policies.recruitment==='steady'?'selected':''}>Recruit: Steady</option>
          <option value="aggressive" ${m.policies.recruitment==='aggressive'?'selected':''}>Recruit: Aggressive</option>
        </select>
        <select onchange="setPolicy('training', this.value)" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:8px;border-radius:8px;">
          <option value="safe" ${m.policies.training==='safe'?'selected':''}>Train: Safe</option>
          <option value="balanced" ${m.policies.training==='balanced'?'selected':''}>Train: Balanced</option>
          <option value="harsh" ${m.policies.training==='harsh'?'selected':''}>Train: Harsh</option>
        </select>
        <select onchange="setPolicy('openness', this.value)" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:8px;border-radius:8px;">
          <option value="isolation" ${m.policies.openness==='isolation'?'selected':''}>Stance: Isolation</option>
          <option value="neutral" ${m.policies.openness==='neutral'?'selected':''}>Stance: Neutral</option>
          <option value="expansion" ${m.policies.openness==='expansion'?'selected':''}>Stance: Expansion</option>
        </select>
      </div>
    </div>
    <div style="margin:12px 0;">
      <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Departments</div>
      ${depRow("military","Military")}
      ${depRow("alchemy","Alchemy")}
      ${depRow("diplomacy","Diplomacy")}
      ${depRow("economy","Economy")}
      ${depRow("intelligence","Intelligence")}
    </div>
    <div style="margin:12px 0;">
      <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Monthly Orders (max 3) · Queued: ${[...new Set(m.monthlyOrders||[])].join(", ")||"none"}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <button class="btn-ghost" onclick="queueMonthlyOrder('stockpile_food')">Stockpile Food</button>
        <button class="btn-ghost" onclick="queueMonthlyOrder('patrol')">Patrol</button>
        <button class="btn-ghost" onclick="queueMonthlyOrder('festival')">Festival</button>
        <button class="btn-ghost" onclick="queueMonthlyOrder('expand_trade')">Expand Trade</button>
        <button class="btn-ghost" onclick="clearMonthlyOrders()">Clear Orders</button>
        <button class="btn-primary" onclick="autoManageEverything()">⚡ Auto-Manage</button>
        <button class="btn-ghost" onclick="autoAssignBestHeads()">Auto Heads</button>
        <button class="btn-ghost" onclick="toggleAutoManage()">Auto: ${m.autoManage?"ON":"OFF"}</button>
        ${(state.game&&state.game.advancedUI) ? `
        <button class="btn-ghost" onclick="queueMonthlyOrder('closed_door')">Closed-Door</button>
        <button class="btn-ghost" onclick="upgradeWarehouse()">Warehouse</button>
        <button class="btn-ghost" onclick="spyMission()">Spy</button>
        <button class="btn-ghost" onclick="toggleWarFooting()">War Footing</button>
        <button class="btn-ghost" onclick="setBorder('Peace')">Peace</button>
        <button class="btn-ghost" onclick="setBorder('War')">War</button>
        <button class="btn-ghost" onclick="endYearLedger()">Year Ledger</button>
        <button class="btn-ghost" onclick="managementScore()">Mgmt Score</button>
        <button class="btn-ghost" onclick="applyPreset('Peacetime')">Peacetime</button>
        <button class="btn-ghost" onclick="applyPreset('War Economy')">War Economy</button>
        <button class="btn-ghost" onclick="applyPreset('Crisis')">Crisis</button>
        <button class="btn-ghost" onclick="advisorSummary()">Advisor</button>
        <button class="btn-ghost" onclick="stabilizeEconomy()">Stabilize</button>
        <button class="btn-ghost" onclick="bugcheckSanity()">Bugcheck</button>
        ` : ""}
      </div>
      <p style="color:var(--text-dim);font-size:0.8rem;margin-top:8px;">Warehouse food ${m.warehouse?m.warehouse.food:0}/${m.warehouse?m.warehouse.capacity:0} · Border ${m.border||'Peace'} · WarFoot ${m.warFooting?'ON':'OFF'} · Laws ${(m.laws||[]).join(', ')||'none'} · Heads ${Object.keys(m.deptHeads||{}).map(k=>k+':'+(state.characters.find(x=>x.id===m.deptHeads[k])||{}).name).join(' | ')||'—'}</p>
    </div>
  </div>`;
}



// ===== FULL MGMT DEPTH 20 =====
function ensureMgmtDepth() {
  ensureManagement();
  if (!state.mgmt.warehouse) state.mgmt.warehouse = { food: 0, herbs: 0, capacity: 100 };
  if (!state.mgmt.deptHeads) state.mgmt.deptHeads = {}; // dept -> charId
  if (!state.mgmt.laws) state.mgmt.laws = [];
  if (!state.mgmt.warFooting) state.mgmt.warFooting = false;
  if (!state.mgmt.border) state.mgmt.border = "Peace"; // Peace | Tension | War
  if (!state.mgmt.budgetMode) state.mgmt.budgetMode = "flat"; // flat | percent
  if (!state.mgmt.budgetPct) state.mgmt.budgetPct = { military: 10, alchemy: 10, diplomacy: 10, economy: 20, intelligence: 10 };
  if (!state.mgmt.yearLedger) state.mgmt.yearLedger = [];
  if (!state.mgmt.collapseMonths) state.mgmt.collapseMonths = 0;
  if (!state.mgmt.goldenMonths) state.mgmt.goldenMonths = 0;
  if (!state.mgmt.mgmtOnly) state.mgmt.mgmtOnly = false;
  if (state.mgmt.alerts == null) state.mgmt.alerts = [];
}

function classFoodCost(char) {
  const r = typeof currentRankId === "function" ? currentRankId(char) : "outer";
  if (r === "outer") return 0.5;
  if (r === "inner") return 0.75;
  if (r === "core") return 1;
  if (r === "elder" || r === "grand_elder") return 1.5;
  return 2; // patriarch/ancestor
}

function classGoldStipend(char) {
  const r = typeof currentRankId === "function" ? currentRankId(char) : "outer";
  const map = { outer: 1, inner: 2, core: 3, elder: 5, grand_elder: 8, patriarch: 12, ancestor: 6 };
  return map[r] || 1;
}

function warehouseStore(type, amount) {
  ensureMgmtDepth();
  const w = state.mgmt.warehouse;
  const space = w.capacity - w.food - w.herbs;
  const put = Math.max(0, Math.min(amount, space));
  if (type === "food") w.food += put;
  else w.herbs += put;
  return put;
}

function warehouseWithdraw(type, amount) {
  ensureMgmtDepth();
  const w = state.mgmt.warehouse;
  if (type === "food") {
    const take = Math.min(amount, w.food);
    w.food -= take;
    return take;
  }
  const take = Math.min(amount, w.herbs);
  w.herbs -= take;
  return take;
}

function upgradeWarehouse() {
  ensureMgmtDepth();
  const cost = 40 + Math.floor(state.mgmt.warehouse.capacity / 2);
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " gold");
  state.clanWealth.gold -= cost;
  state.mgmt.warehouse.capacity += 50;
  simLog("Warehouse capacity → " + state.mgmt.warehouse.capacity);
  saveState();
  showToast("Warehouse +" + 50);
  switchView("simulation");
}

function assignDeptHead(dept) {
  ensureMgmtDepth();
  const char = getActiveChar();
  if (!char) return showToast("Select a character first");
  state.mgmt.deptHeads[dept] = char.id;
  simLog(char.name + " appointed head of " + dept);
  try { addMerit(char, 5, "department head"); } catch(e) {}
  saveState();
  showToast(dept + " head: " + char.name);
  switchView("simulation");
}

function deptHeadBonus(dept) {
  ensureMgmtDepth();
  const id = state.mgmt.deptHeads[dept];
  if (!id) return 0;
  const c = state.characters.find(x => x.id === id && x.alive !== false);
  if (!c) return 0;
  const score = typeof cultivationScore === "function" ? cultivationScore(c) : 20;
  return Math.min(5, Math.floor(score / 80));
}

function rollDisaster() {
  ensureMgmtDepth();
  if (Math.random() > 0.07) return null;
  const table = [
    { id: "drought", label: "Drought", food: -20, morale: -5 },
    { id: "beast_tide", label: "Beast Tide", security: -15, threat: 1 },
    { id: "plague", label: "Plague", morale: -10, injury: true },
    { id: "flood", label: "Flood", food: -10, gold: -15 },
    { id: "blizzard", label: "Blizzard", food: -8, security: -5 }
  ];
  return table[Math.floor(Math.random() * table.length)];
}

function applyDisaster(d) {
  if (!d) return;
  ensureMgmtDepth();
  if (d.food) {
    state.mgmt.food = Math.max(0, state.mgmt.food + d.food);
    if (state.mgmt.food < 15) warehouseWithdraw("food", 15 - state.mgmt.food);
  }
  if (d.morale) state.mgmt.morale = Math.max(0, state.mgmt.morale + d.morale);
  if (d.security) state.mgmt.security = Math.max(0, state.mgmt.security + d.security);
  if (d.gold) state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) + d.gold);
  if (d.threat) state.globalThreat = Math.min(10, (state.globalThreat || 1) + d.threat);
  if (d.injury) {
    getLineageCharacters().forEach(ch => {
      if (Math.random() > 0.85) applyInjury(ch, 1);
    });
  }
  // security/intel mitigate
  const mit = state.mgmt.departments.military.level + deptHeadBonus("military") + state.mgmt.departments.intelligence.level;
  if (mit >= 6 && Math.random() > 0.5) {
    simLog("Disaster mitigated by Military/Intelligence: " + d.label);
    state.mgmt.morale = Math.min(100, state.mgmt.morale + 3);
  } else {
    simLog("Disaster strikes: " + d.label);
    pushAlert("Disaster: " + d.label);
  }
}

function pushAlert(msg) {
  ensureMgmtDepth();
  state.mgmt.alerts.unshift({ t: Date.now(), msg: msg, y: state.sim.year, m: state.sim.month });
  if (state.mgmt.alerts.length > 12) state.mgmt.alerts.pop();
}

function setLaw(law) {
  ensureMgmtDepth();
  if (state.mgmt.laws.length >= 3) state.mgmt.laws.shift();
  if (!state.mgmt.laws.includes(law)) state.mgmt.laws.push(law);
  simLog("Law enacted: " + law);
  saveState();
  showToast("Law: " + law);
  switchView("simulation");
}

function clearLaws() {
  ensureMgmtDepth();
  state.mgmt.laws = [];
  saveState();
  switchView("simulation");
}

function enforceLawsOnPromote(char, next) {
  ensureMgmtDepth();
  if ((state.mgmt.laws || []).includes("No Outer may hold Elder seat") && currentRankId(char) === "outer" && (next === "elder" || next === "grand_elder")) {
    return false;
  }
  return true;
}

function spyMission() {
  ensureMgmtDepth();
  const cost = 20;
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " gold");
  if (state.mgmt.departments.intelligence.level < 1) return showToast("Need Intelligence dept");
  state.clanWealth.gold -= cost;
  const bonus = deptHeadBonus("intelligence") + state.mgmt.departments.intelligence.level;
  if (Math.random() * 10 < 4 + bonus) {
    if (state.dynasty && state.dynasty.rival) {
      state.dynasty.rival.power = Math.max(10, (state.dynasty.rival.power || 50) - randInt(5, 15));
    }
    state.globalThreat = Math.max(1, (state.globalThreat || 1) - 1);
    simLog("Spy mission success.");
    showToast("Intel success");
  } else {
    state.mgmt.security = Math.max(0, state.mgmt.security - 5);
    simLog("Spy mission failed — exposure.");
    showToast("Intel failed");
  }
  saveState();
  switchView("simulation");
}

function toggleWarFooting() {
  ensureMgmtDepth();
  // only patriarch/regent
  const actor = getActiveChar();
  const ok = actor && (currentRankId(actor) === "patriarch" || actor.isRegent || currentRankId(actor) === "ancestor");
  if (actor && !ok) return showToast("Only Patriarch/Regent/Ancestor may set war footing");
  if (!state.mgmt.warFooting && !confirm("Confirm War Footing?")) return;
  try { pushPolicyHistory(snapshotPolicies()); } catch(e) {}
  state.mgmt.warFooting = !state.mgmt.warFooting;
  if (state.mgmt.warFooting) {
    state.mgmt.border = "Tension";
    simLog("Clan moves to war footing.");
  } else {
    simLog("War footing lifted.");
  }
  saveState();
  showToast("War footing: " + (state.mgmt.warFooting ? "ON" : "OFF"));
  switchView("simulation");
}

function setBorder(status) {
  ensureMgmtDepth();
  if (status === "War" && typeof warRequiresCouncilGate === "function" && !warRequiresCouncilGate()) {
    return showToast("Law: War requires open council");
  }
  state.mgmt.border = status;
  saveState();
  showToast("Border: " + status);
  switchView("simulation");
}

function factionPressureTick() {
  ensureMgmtDepth();
  const deps = state.mgmt.departments;
  const totalBudget = Object.values(deps).reduce((s, d) => s + (d.budget || 0), 0) || 1;
  ["military", "alchemy", "diplomacy"].forEach(k => {
    const share = (deps[k].budget || 0) / totalBudget;
    if (share < 0.1 && Math.random() > 0.85) {
      pushAlert(k + " faction demands more budget");
      state.mgmt.morale = Math.max(0, state.mgmt.morale - 2);
    }
  });
}

function policyRequiresCouncil(key, val) {
  if ((key === "taxation" && val === "high") || (key === "recruitment" && val === "aggressive")) {
    if (!(state.council && state.council.discussionOpen) && Math.random() > 0.3) {
      // soft gate: allow but note
      pushAlert("High tax/Aggressive recruit should be council-approved");
    }
  }
}

function endYearLedger() {
  ensureMgmtDepth();
  const living = getLineageCharacters();
  let stipend = 0;
  living.forEach(ch => { stipend += classGoldStipend(ch); });
  const entry = {
    year: state.sim.year,
    gold: (state.clanWealth && state.clanWealth.gold) || 0,
    food: state.mgmt.food,
    warehouseFood: state.mgmt.warehouse.food,
    morale: state.mgmt.morale,
    security: state.mgmt.security,
    living: living.length,
    stipend: stipend,
    border: state.mgmt.border,
    warFooting: state.mgmt.warFooting
  };
  state.mgmt.yearLedger.push(entry);
  if (state.mgmt.yearLedger.length > 40) state.mgmt.yearLedger.shift();
  const lines = state.mgmt.yearLedger.slice(-5).map(e =>
    "Y" + e.year + " gold " + e.gold + " food " + e.food + " morale " + Math.round(e.morale) + " sec " + Math.round(e.security) + " pop " + e.living
  );
  alert("End-of-year ledger (recent):\n" + lines.join("\n"));
}

function managementScore() {
  ensureMgmtDepth();
  const m = state.mgmt;
  const score = Math.round(
    (m.food || 0) + (m.morale || 0) + (m.security || 0) +
    ((state.clanWealth && state.clanWealth.gold) || 0) * 0.1 +
    Object.values(m.departments).reduce((s, d) => s + d.level * 10, 0) +
    (m.warehouse.capacity || 0) * 0.2
  );
  alert("Management Score: " + score);
  return score;
}

function collapseAndGoldenTick() {
  ensureMgmtDepth();
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const morale = state.mgmt.morale || 0;
  if (gold <= 0 && morale < 20) {
    state.mgmt.collapseMonths = (state.mgmt.collapseMonths || 0) + 1;
    pushAlert("Bankruptcy stress " + state.mgmt.collapseMonths + "/6");
    if (state.mgmt.collapseMonths >= 6) {
      state.sim.running = false;
      if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
      state.storyChapters.push({ title: "Collapse Y" + state.sim.year, content: "The clan administration collapses under debt and despair." });
      showToast("MANAGEMENT COLLAPSE");
      try { defeatCard("administrative collapse"); } catch(e) {}
      state.mgmt.collapseMonths = 0;
    }
  } else {
    state.mgmt.collapseMonths = 0;
  }
  if (state.mgmt.food >= 80 && state.mgmt.morale >= 80 && state.mgmt.security >= 80) {
    state.mgmt.goldenMonths = (state.mgmt.goldenMonths || 0) + 1;
    if (state.mgmt.goldenMonths >= 12) {
      state.clanWealth.renown = (state.clanWealth.renown || 1) + 3;
      state.storyChapters.push({ title: "Golden Age Y" + state.sim.year, content: "A full year of abundance, order, and high morale." });
      showToast("GOLDEN AGE");
      state.mgmt.goldenMonths = 0;
    }
  } else {
    state.mgmt.goldenMonths = 0;
  }
}

function toggleMgmtOnly() {
  ensureMgmtDepth();
  state.mgmt.mgmtOnly = !state.mgmt.mgmtOnly;
  saveState();
  showToast("Management-only UI: " + (state.mgmt.mgmtOnly ? "ON" : "OFF"));
  switchView("simulation");
}

function renderAlertsStrip() {
  ensureMgmtDepth();
  // live alerts
  const living = getLineageCharacters().length;
  const pat = living && getLineageCharacters().some(c => currentRankId(c) === "patriarch");
  if ((state.mgmt.food || 0) < 20) pushAlertDeduped("Food low");
  if (!pat && living > 0) pushAlertDeduped("No Patriarch");
  const alerts = (state.mgmt.alerts || []).slice(0, 5);
  if (!alerts.length) return "";
  return `<div style="margin-bottom:10px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:rgba(180,40,40,0.08);">
    <strong style="color:var(--gold);">Alerts</strong>
    <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">${alerts.map(a => "Y"+a.y+"M"+a.m+" — "+a.msg).join(" · ")}</div>
  </div>`;
}



// ===== MGMT POLISH 20 =====
function ensureMgmtPolish() {
  ensureMgmtDepth && ensureMgmtDepth();
  ensureManagement();
  if (!state.mgmt.presets) {
    state.mgmt.presets = {
      Peacetime: { taxation: "normal", recruitment: "steady", training: "safe", openness: "neutral", warFooting: false, border: "Peace",
        budgets: { military: 5, alchemy: 8, diplomacy: 8, economy: 15, intelligence: 5 } },
      "War Economy": { taxation: "high", recruitment: "aggressive", training: "harsh", openness: "expansion", warFooting: true, border: "Tension",
        budgets: { military: 25, alchemy: 5, diplomacy: 5, economy: 10, intelligence: 15 } },
      Crisis: { taxation: "low", recruitment: "closed", training: "safe", openness: "isolation", warFooting: false, border: "Peace",
        budgets: { military: 10, alchemy: 10, diplomacy: 5, economy: 20, intelligence: 10 } }
    };
  }
  if (!state.mgmt.construction) state.mgmt.construction = []; // {type, monthsLeft}
  if (!state.mgmt.tradeRoutes) state.mgmt.tradeRoutes = { silk: false, herb: false, ore: false };
  if (!state.mgmt.reserveFund) state.mgmt.reserveFund = 0;
  if (!state.mgmt.reserveRate) state.mgmt.reserveRate = 0.1;
  if (!state.mgmt.hardMode) state.mgmt.hardMode = false;
  if (!state.mgmt.alertSeen) state.mgmt.alertSeen = {};
  if (!state.mgmt.legacyBuildings) state.mgmt.legacyBuildings = [];
}

function applyPreset(name) {
  ensureMgmtPolish();
  if (name === "War Economy" && canApplyWarEconomyPreset && !canApplyWarEconomyPreset()) return;
  const p = state.mgmt.presets[name];
  if (!p) return showToast("Unknown preset");
  state.mgmt.policies.taxation = p.taxation;
  state.mgmt.policies.recruitment = p.recruitment;
  state.mgmt.policies.training = p.training;
  state.mgmt.policies.openness = p.openness;
  state.mgmt.warFooting = p.warFooting;
  state.mgmt.border = p.border;
  Object.keys(p.budgets || {}).forEach(k => {
    if (state.mgmt.departments[k]) state.mgmt.departments[k].budget = p.budgets[k];
  });
  simLog("Preset applied: " + name);
  saveState();
  showToast("Preset: " + name);
  switchView("simulation");
}

function advisorSummary() {
  ensureMgmtPolish();
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const food = state.mgmt.food || 0;
  const morale = state.mgmt.morale || 0;
  const sec = state.mgmt.security || 0;
  const lines = [];
  lines.push("Money: gold " + gold + (gold < 30 ? " (tight)" : gold > 200 ? " (strong)" : " (stable)"));
  let risk = "low";
  if (food < 25 || morale < 30 || sec < 30 || (state.globalThreat || 1) >= 7) risk = "high";
  else if (food < 50 || morale < 50 || sec < 50) risk = "medium";
  lines.push("Risk: " + risk + " (food " + food + ", morale " + Math.round(morale) + ", security " + Math.round(sec) + ")");
  let rec = "Maintain course";
  if (gold < 30) rec = "Queue Expand Trade / lower budgets";
  else if (food < 25) rec = "Stockpile Food + upgrade warehouse";
  else if (sec < 30) rec = "Raise Military budget or Patrol";
  else if (morale < 30) rec = "Festival + lower tax";
  else if ((state.globalThreat || 1) >= 7) rec = "War Footing or Ancestor Last Defense";
  else if (getLineageCharacters().length < 10) rec = "Steady/Aggressive recruit";
  lines.push("Advice: " + rec);
  alert("Advisor Summary\n1. " + lines[0] + "\n2. " + lines[1] + "\n3. " + lines[2]);
}

function startConstruction(type) {
  ensureMgmtPolish();
  const costs = { warehouse: 40, training_ground: 45, guard_post: 40, legacy_monument: 80 };
  const months = { warehouse: 3, training_ground: 4, guard_post: 3, legacy_monument: 6 };
  const cost = costs[type];
  if (cost == null) return;
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " gold");
  if (state.mgmt.construction.length >= 2) return showToast("Max 2 constructions");
  state.clanWealth.gold -= cost;
  state.mgmt.construction.push({ type: type, monthsLeft: months[type] });
  simLog("Construction started: " + type + " (" + months[type] + " months)");
  saveState();
  showToast("Building " + type);
  switchView("simulation");
}

function tickConstruction() {
  ensureMgmtPolish();
  if (typeof constructionFrozen === "function" && constructionFrozen()) return;
  const next = [];
  (state.mgmt.construction || []).forEach(job => {
    job.monthsLeft -= 1;
    if (job.monthsLeft <= 0) {
      if (job.type === "warehouse") {
        state.mgmt.warehouse.capacity += 50;
        simLog("Construction complete: warehouse capacity " + state.mgmt.warehouse.capacity);
      } else if (job.type === "training_ground") {
        try { ensureDynasty(); state.dynasty.buildings.trainingGround = (state.dynasty.buildings.trainingGround || 0) + 1; } catch(e) {}
        simLog("Construction complete: training ground");
      } else if (job.type === "guard_post") {
        try { ensureDynasty(); state.dynasty.buildings.guardPost = (state.dynasty.buildings.guardPost || 0) + 1; } catch(e) {}
        state.mgmt.security = Math.min(100, state.mgmt.security + 5);
        simLog("Construction complete: guard post");
      } else if (job.type === "legacy_monument") {
        state.mgmt.legacyBuildings.push({ name: "Legacy Monument", year: state.sim.year });
        state.clanWealth.renown = (state.clanWealth.renown || 1) + 4;
        simLog("Legacy monument completed — survives Patriarch changes.");
      }
    } else next.push(job);
  });
  state.mgmt.construction = next;
}

function unlockTradeRoute(route) {
  ensureMgmtPolish();
  const costs = { silk: 50, herb: 40, ore: 60 };
  if (state.mgmt.tradeRoutes[route]) return showToast("Already unlocked");
  const cost = costs[route];
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " gold");
  state.clanWealth.gold -= cost;
  state.mgmt.tradeRoutes[route] = true;
  simLog("Trade route unlocked: " + route);
  saveState();
  showToast("Route: " + route);
  switchView("simulation");
}

function tradeRouteIncome() {
  ensureMgmtPolish();
  ensureSimIntegration();
  if (tradeBlockedBySecurity()) {
    if (Math.random() > 0.9) simLog("Trade blocked by low security.");
    return 0;
  }
  let g = 0;
  const lv = (r) => (state.simInt.tradeRouteLevel && state.simInt.tradeRouteLevel[r]) || 1;
  if (state.mgmt.tradeRoutes.silk) g += randInt(3, 10) * lv("silk");
  if (state.mgmt.tradeRoutes.herb) { g += randInt(2, 6) * lv("herb"); state.clanWealth.herbs = (state.clanWealth.herbs || 0) + lv("herb"); }
  if (state.mgmt.tradeRoutes.ore) g += randInt(4, 12) * lv("ore");
  if (g && state.mgmt.border === "War" && Math.random() > 0.7) {
    g = Math.floor(g * 0.3);
    simLog("Trade disrupted by war.");
  }
  return g;
}

function applyReserveFund(income) {
  ensureMgmtPolish();
  if (income <= 0) return 0;
  const put = Math.floor(income * (state.mgmt.reserveRate || 0.1));
  state.mgmt.reserveFund = (state.mgmt.reserveFund || 0) + put;
  return put;
}

function withdrawReserve(amount) {
  ensureMgmtPolish();
  amount = Math.min(amount, state.mgmt.reserveFund || 0);
  state.mgmt.reserveFund -= amount;
  state.clanWealth.gold = (state.clanWealth.gold || 0) + amount;
  simLog("Withdrew " + amount + " from reserve fund");
  saveState();
  showToast("Reserve -" + amount);
  switchView("simulation");
}

function headVacancyPenalty() {
  ensureMgmtPolish();
  ["military", "alchemy", "diplomacy", "economy", "intelligence"].forEach(dept => {
    const id = state.mgmt.deptHeads[dept];
    if (!id) return;
    const c = state.characters.find(x => x.id === id);
    if (!c || c.alive === false) {
      state.mgmt.deptHeads[dept] = null;
      state.mgmt.departments[dept].budget = Math.max(0, (state.mgmt.departments[dept].budget || 0) - 3);
      pushAlert(dept + " head vacant — efficiency down");
      simLog(dept + " department head position vacant.");
    }
  });
}

function corruptHeadEvent() {
  ensureMgmtPolish();
  if (Math.random() > 0.05) return;
  const entries = Object.keys(state.mgmt.deptHeads || {}).filter(k => state.mgmt.deptHeads[k]);
  if (!entries.length) return;
  const dept = entries[Math.floor(Math.random() * entries.length)];
  const head = state.characters.find(c => c.id === state.mgmt.deptHeads[dept]);
  if (!head) return;
  state.sim.pendingChoice = {
    event: "Corrupt head: " + head.name + " (" + dept + ") is siphoning budget.",
    options: [
      { label: "Punish (remove head, -loyalty)", effect: "corr_punish_" + dept },
      { label: "Ignore (lose gold)", effect: "corr_ignore" },
      { label: "Quietly fine (-15g, keep head)", effect: "corr_fine" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
}

function resolveCorruptEffect(effect) {
  if (effect.indexOf("corr_punish_") === 0) {
    const dept = effect.replace("corr_punish_", "");
    const id = state.mgmt.deptHeads[dept];
    const head = state.characters.find(c => c.id === id);
    if (head) { addLoyalty(head, -15); state.mgmt.deptHeads[dept] = null; }
    simLog("Corrupt head punished.");
  } else if (effect === "corr_ignore") {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 25);
    simLog("Corruption ignored — gold missing.");
  } else if (effect === "corr_fine") {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 15);
    simLog("Head fined quietly.");
  }
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function statusLight(val) {
  if (val >= 70) return "🟢";
  if (val >= 40) return "🟡";
  return "🔴";
}

function whyGoldFalling() {
  ensureMgmtPolish();
  const living = getLineageCharacters();
  let stipend = 0;
  living.forEach(ch => { stipend += classGoldStipend(ch) * 0.15; });
  const budgets = Object.values(state.mgmt.departments).reduce((s, d) => s + (d.budget || 0), 0);
  const war = state.mgmt.warFooting ? "War footing +50% upkeep" : "No war footing";
  const border = "Border " + (state.mgmt.border || "Peace");
  const reserve = "Reserve fund " + (state.mgmt.reserveFund || 0) + " (rate " + Math.round((state.mgmt.reserveRate || 0.1) * 100) + "%)";
  alert("Why gold moves:\n• Population stipends ~" + Math.round(stipend) + "/month\n• Department budgets " + budgets + "\n• " + war + "\n• " + border + "\n• " + reserve + "\n• Orders/disasters/spy also spend\n• Economy dept + trade routes add income");
}

function demandTribute() {
  ensureMgmtPolish();
  if (state.mgmt.border !== "Tension" && state.mgmt.border !== "War") return showToast("Need Tension or War border");
  const gain = randInt(15, 40);
  if (Math.random() > 0.4) {
    state.clanWealth.gold += gain;
    if (state.dynasty && state.dynasty.rival) state.dynasty.rival.hostility = (state.dynasty.rival.hostility || 0) + 1;
    simLog("Tribute extracted +" + gain);
    showToast("Tribute +" + gain);
  } else {
    state.mgmt.border = "War";
    state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
    simLog("Tribute demand rejected — border turns to War");
    showToast("Demand failed → War");
  }
  saveState();
  switchView("simulation");
}

function peaceTreatyEvent() {
  ensureMgmtPolish();
  if (state.mgmt.border !== "War") return showToast("Not at war");
  state.sim.pendingChoice = {
    event: "Peace treaty offered after long conflict.",
    options: [
      { label: "Accept peace (border Peace)", effect: "peace_yes" },
      { label: "Demand gold then peace", effect: "peace_gold" },
      { label: "Refuse", effect: "peace_no" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
}

function resolvePeaceEffect(effect) {
  if (effect === "peace_yes") {
    state.mgmt.border = "Peace";
    state.mgmt.warFooting = false;
    simLog("Peace treaty signed.");
  } else if (effect === "peace_gold") {
    state.clanWealth.gold += 30;
    state.mgmt.border = "Peace";
    state.mgmt.warFooting = false;
    simLog("Peace for gold.");
  } else simLog("Peace refused — war continues.");
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function pushAlertDeduped(msg) {
  ensureMgmtPolish();
  const key = msg + "_" + (state.sim.year || 0);
  if (state.mgmt.alertSeen[key]) return;
  state.mgmt.alertSeen[key] = true;
  // prune old keys
  const keys = Object.keys(state.mgmt.alertSeen);
  if (keys.length > 80) keys.slice(0, 40).forEach(k => delete state.mgmt.alertSeen[k]);
  pushAlert(msg);
}

function censusEveryDecade() {
  if ((state.sim.year || 1) % 10 !== 0 || state.sim.month !== 1) return;
  const counts = {};
  getLineageCharacters().forEach(c => {
    const r = currentRankId(c);
    counts[r] = (counts[r] || 0) + 1;
  });
  const text = "Census Y" + state.sim.year + ": " + Object.keys(counts).map(k => k + " " + counts[k]).join(", ");
  state.storyChapters.push({ title: "Dynasty Census Y" + state.sim.year, content: text });
  simLog(text);
}

function exportManagementJSON() {
  ensureMgmtPolish();
  const data = {
    policies: state.mgmt.policies,
    departments: state.mgmt.departments,
    deptHeads: state.mgmt.deptHeads,
    warehouse: state.mgmt.warehouse,
    tradeRoutes: state.mgmt.tradeRoutes,
    laws: state.mgmt.laws,
    border: state.mgmt.border,
    warFooting: state.mgmt.warFooting,
    reserveFund: state.mgmt.reserveFund
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "clan-management.json";
  a.click();
  showToast("Management JSON exported");
}

function toggleHardMode() {
  ensureMgmtPolish();
  state.mgmt.hardMode = !state.mgmt.hardMode;
  saveState();
  showToast("Hard mode: " + (state.mgmt.hardMode ? "ON" : "OFF"));
  switchView("simulation");
}



// ===== SIM INTEGRATION PACK 20 =====
function ensureSimIntegration() {
  ensureMgmtPolish && ensureMgmtPolish();
  ensureManagement();
  if (!state.simInt) {
    state.simInt = {
      priceShockUntil: 0,
      tradeRouteXp: { silk: 0, herb: 0, ore: 0 },
      tradeRouteLevel: { silk: 1, herb: 1, ore: 1 },
      goldenAgeYears: 0,
      pauseOnRed: true,
      debtInterest: 0,
      lastDefeat: null
    };
  }
}

function warFootingDeptMod(dept) {
  ensureManagement();
  if (!state.mgmt.warFooting) return 1;
  if (dept === "military") return 1.35;
  if (dept === "alchemy") return 0.7;
  if (dept === "intelligence") return 1.15;
  return 0.9;
}

function tradeBlockedBySecurity() {
  ensureManagement();
  return (state.mgmt.security || 0) < 30;
}

function moraleMeritMult() {
  ensureManagement();
  const m = state.mgmt.morale || 50;
  if (m >= 80) return 1.25;
  if (m >= 60) return 1.1;
  if (m < 30) return 0.6;
  if (m < 45) return 0.8;
  return 1;
}

function constructionFrozen() {
  return !!(state.council && state.council.discussionOpen);
}

function cabinetMeeting() {
  ensureSimIntegration();
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const food = state.mgmt.food || 0;
  const tips = [];
  if (gold < 40) tips.push({ label: "Apply Crisis preset", effect: "cab_crisis" });
  else tips.push({ label: "Apply Peacetime preset", effect: "cab_peace" });
  if (food < 40) tips.push({ label: "Queue stockpile food", effect: "cab_food" });
  if ((state.globalThreat || 1) >= 6) tips.push({ label: "War Economy + footing", effect: "cab_war" });
  tips.push({ label: "Dismiss", effect: "cab_dismiss" });
  while (tips.length > 3) tips.pop();
  state.sim.pendingChoice = {
    event: "Annual Cabinet Meeting — advisors present options.",
    options: tips
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  showToast("Cabinet meeting");
  switchView("simulation");
}

function resolveCabinetEffect(effect) {
  if (effect === "cab_crisis") applyPreset("Crisis");
  else if (effect === "cab_peace") applyPreset("Peacetime");
  else if (effect === "cab_food") queueMonthlyOrder("stockpile_food");
  else if (effect === "cab_war") {
    applyPreset("War Economy");
    state.mgmt.warFooting = true;
  }
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function ancestorVetoTax() {
  ensureSimIntegration();
  const anc = getLineageCharacters().find(c => currentRankId(c) === "ancestor");
  if (!anc) return showToast("No Ancestor");
  if (state.mgmt.policies.taxation !== "high") return showToast("Tax is not High");
  const key = "veto_" + Math.floor((state.sim.year || 1) / 10);
  if (state.simInt["vetoUsed_" + key]) return showToast("Veto already used this decade");
  state.mgmt.policies.taxation = "normal";
  state.simInt["vetoUsed_" + key] = true;
  simLog(anc.name + " vetoes High Tax — rate returns to Normal.");
  saveState();
  showToast("Ancestor vetoes High Tax");
  switchView("simulation");
}

function canApplyWarEconomyPreset() {
  const actor = getActiveChar();
  if (!actor) return true;
  if (typeof isRegentChar === "function" && isRegentChar(actor)) {
    ensureRegent();
    if (!state.regent.powers.warEconomy || !(state.regent.geSupport || []).length) {
      showToast("Regent needs Grand Elder endorsement for War Economy");
      return false;
    }
  }
  return true;
}

function setLawWarRequiresCouncil() {
  setLaw("War requires council");
}

function warRequiresCouncilGate() {
  ensureMgmtDepth && ensureMgmtDepth();
  if ((state.mgmt.laws || []).includes("War requires council")) {
    if (!(state.council && (state.council.discussionOpen || state.council.warAuthorized))) {
      return false;
    }
  }
  return true;
}

function priceShockTick() {
  ensureSimIntegration();
  if ((state.sim.year || 0) * 12 + (state.sim.month || 0) < (state.simInt.priceShockUntil || 0)) {
    // active shock: food more expensive / drain
    state.mgmt.food = Math.max(0, state.mgmt.food - 1);
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 1);
  } else if (Math.random() > 0.97) {
    state.simInt.priceShockUntil = (state.sim.year || 1) * 12 + (state.sim.month || 1) + 3;
    simLog("Price shock — food and goods costly for 3 months.");
    pushAlertDeduped && pushAlertDeduped("Price shock");
  }
}

function debtInterestTick() {
  ensureSimIntegration();
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  if (gold <= 0) {
    state.simInt.debtInterest = (state.simInt.debtInterest || 0) + 3;
    pushAlertDeduped && pushAlertDeduped("Debt interest accruing: " + state.simInt.debtInterest);
  } else if (state.simInt.debtInterest > 0) {
    const pay = Math.min(gold, state.simInt.debtInterest);
    state.clanWealth.gold -= pay;
    state.simInt.debtInterest -= pay;
  }
}

function tradeRouteLevelTick() {
  ensureSimIntegration();
  if (tradeBlockedBySecurity()) return;
  ["silk", "herb", "ore"].forEach(r => {
    if (!state.mgmt.tradeRoutes[r]) return;
    state.simInt.tradeRouteXp[r] = (state.simInt.tradeRouteXp[r] || 0) + 1;
    if (state.simInt.tradeRouteXp[r] >= 12 * (state.simInt.tradeRouteLevel[r] || 1)) {
      state.simInt.tradeRouteLevel[r] = (state.simInt.tradeRouteLevel[r] || 1) + 1;
      state.simInt.tradeRouteXp[r] = 0;
      simLog("Trade route leveled: " + r + " → Lv." + state.simInt.tradeRouteLevel[r]);
    }
  });
}

function lastMonthReportCard() {
  ensureManagement();
  const fp = typeof foodNeedProduceReport === "function" ? foodNeedProduceReport() : null;
  const r = state.mgmt.lastMonthReport;
  if (!r) return `<div class="card" style="margin-bottom:10px;padding:10px;"><span style="color:var(--text-dim);">No month report yet — run the sim.</span>
    ${fp?`<div style="font-size:0.8rem;color:var(--text-muted);margin-top:6px;">Food need ~${fp.need}/mo · produce ~${fp.produce}/mo · pop ${fp.living}</div>`:''}</div>`;
  return `<div class="card" style="margin-bottom:10px;padding:10px;">
    <strong style="color:var(--gold);">Last Month Y${r.year}M${r.month}</strong>
    <div style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">
      Gold Δ <span style="color:${r.goldDelta>=0?'#6bcf8e':'var(--red-glow)'}">${r.goldDelta}</span>
      · Income ${r.income} · Upkeep ${r.upkeep}
      · Food ${r.food} · Morale ${Math.round(r.morale)} · Security ${Math.round(r.security)} · Routes ${(state.mgmt&&state.mgmt.tradeRoutes)?Object.keys(state.mgmt.tradeRoutes).filter(k=>state.mgmt.tradeRoutes[k]).join(',')||'none':'none'}
      ${fp?` · Food need ${fp.need} / prod ${fp.produce}`:''}
    </div>
  </div>`;
}

function constructionProgressBars() {
  ensureMgmtPolish && ensureMgmtPolish();
  const jobs = (state.mgmt && state.mgmt.construction) || [];
  if (!jobs.length) return "";
  return `<div style="margin:8px 0;">${jobs.map(j => {
    const total = j.type === "legacy_monument" ? 6 : j.type === "training_ground" ? 4 : 3;
    const done = total - j.monthsLeft;
    const pct = Math.max(0, Math.min(100, Math.round(done / total * 100)));
    return `<div style="margin-bottom:6px;font-size:0.8rem;color:var(--text-muted);">${j.type} (${j.monthsLeft}m left)
      <div style="height:6px;background:#222;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:var(--gold);"></div></div>
    </div>`;
  }).join("")}</div>`;
}

function hourglassInfo() {
  const y = state.sim.year || 1;
  const m = state.sim.month || 1;
  const nextCensus = 10 - (y % 10 || 10);
  return `<p style="color:var(--text-dim);font-size:0.78rem;">Hourglass: ~${nextCensus}y to census · Price shock ${state.simInt && state.simInt.priceShockUntil ? "active" : "idle"} · Golden years ${state.simInt ? state.simInt.goldenAgeYears : 0}/50</p>`;
}

function togglePauseOnRed() {
  ensureSimIntegration();
  state.simInt.pauseOnRed = !state.simInt.pauseOnRed;
  saveState();
  showToast("Pause on red: " + (state.simInt.pauseOnRed ? "ON" : "OFF"));
  switchView("simulation");
}

function pauseIfRed() {
  ensureSimIntegration();
  if (!state.simInt.pauseOnRed) return;
  if ((state.mgmt.food || 0) < 40 || (state.mgmt.security || 0) < 40) {
    if (state.sim.running) {
      state.sim.running = false;
      if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
      try { recordPauseReason("Food or Security critical"); } catch(e) { showToast("Paused: critical resources"); }
    }
  }
}

function stabilizeEconomy() {
  try { applyPreset("Crisis"); } catch(e) {}
  try { queueMonthlyOrder("stockpile_food"); } catch(e) {}
  state.mgmt.warFooting = false;
  if (state.mgmt.border === "War") state.mgmt.border = "Tension";
  simLog("Stabilize economy executed.");
  saveState();
  showToast("Economy stabilization package applied");
  switchView("simulation");
}

function filterDeptHeadsOnly() {
  const heads = Object.values((state.mgmt && state.mgmt.deptHeads) || {}).filter(Boolean);
  const list = heads.map(id => {
    const c = state.characters.find(x => x.id === id);
    return c ? c.name + " — " + Object.keys(state.mgmt.deptHeads).find(k => state.mgmt.deptHeads[k] === id) : id;
  });
  alert("Department heads:\n" + (list.join("\n") || "None assigned"));
}

function goldenAgeVictoryTick() {
  ensureSimIntegration();
  if ((state.mgmt.food || 0) >= 80 && (state.mgmt.morale || 0) >= 80 && (state.mgmt.security || 0) >= 80) {
    // count years roughly on month 12
    if (state.sim.month === 12) state.simInt.goldenAgeYears = (state.simInt.goldenAgeYears || 0) + 1;
  }
  if ((state.simInt.goldenAgeYears || 0) >= 50 && !state.simInt.goldenVictory) {
    state.simInt.goldenVictory = true;
    alert("VICTORY: 50 Golden Age years accumulated.\nYour administration is legend.");
    state.storyChapters.push({ title: "Victory — Golden Administration", content: "Fifty years of cumulative golden age governance." });
  }
}

function defeatCard(cause) {
  ensureSimIntegration();
  let score = 0;
  try { score = managementScore(); } catch(e) {}
  state.simInt.lastDefeat = { cause: cause, year: state.sim.year, score: score };
  alert("DEFEAT\nCause: " + cause + "\nYear: " + state.sim.year + "\nManagement score snapshot recorded.");
}



// ===== SIM FINISH PACK 20 =====
function ensureSimFinish() {
  ensureManagement();
  ensureProgression && ensureProgression();
  if (!state.simFinish) {
    state.simFinish = {
      tab: "management", // management | people | politics
      tutorialMonth: 0,
      tutorialDone: false,
      policyHistory: [],
      autosaveYear: 0,
      lastScoreboard: null
    };
  }
}

function setSimTab(tab) {
  ensureSimFinish();
  state.simFinish.tab = tab;
  switchView("simulation");
}

function pushPolicyHistory(snapshot) {
  ensureSimFinish();
  state.simFinish.policyHistory.unshift(snapshot);
  if (state.simFinish.policyHistory.length > 10) state.simFinish.policyHistory.pop();
}

function undoLastPolicy() {
  ensureSimFinish();
  const prev = state.simFinish.policyHistory.shift();
  if (!prev) return showToast("Nothing to undo");
  state.mgmt.policies = prev.policies;
  state.mgmt.warFooting = prev.warFooting;
  state.mgmt.border = prev.border;
  if (prev.budgets) {
    Object.keys(prev.budgets).forEach(k => {
      if (state.mgmt.departments[k]) state.mgmt.departments[k].budget = prev.budgets[k];
    });
  }
  saveState();
  showToast("Undid last policy change");
  switchView("simulation");
}

function snapshotPolicies() {
  ensureManagement();
  return {
    policies: JSON.parse(JSON.stringify(state.mgmt.policies)),
    warFooting: state.mgmt.warFooting,
    border: state.mgmt.border,
    budgets: Object.fromEntries(Object.keys(state.mgmt.departments).map(k => [k, state.mgmt.departments[k].budget]))
  };
}

function confirmDangerPolicy(label, fn) {
  if (!confirm("Confirm: " + label + "?")) return;
  try { pushPolicyHistory(snapshotPolicies()); } catch(e) {}
  fn();
}

function safeDefaultsNewDynasty() {
  ensureSimFinish();
  ensureManagement();
  ensureProgression && ensureProgression();
  try { applyPreset("Peacetime"); } catch(e) {}
  state.progression.mode = "bottom_up";
  state.progression.autoPromote = true;
  try { ensureSimIntegration(); state.simInt.pauseOnRed = true; } catch(e) {}
  state.sim.pauseOnEvents = true;
  if (!state.simFinish.tutorialDone) state.simFinish.tutorialMonth = 12;
  simLog("Safe defaults applied: Peacetime, bottom-up, pause-on-red.");
}

function tutorialTick() {
  ensureSimFinish();
  if (state.simFinish.tutorialDone) return;
  if ((state.simFinish.tutorialMonth || 0) <= 0) {
    state.simFinish.tutorialDone = true;
    return;
  }
  state.simFinish.tutorialMonth -= 1;
  const tips = [
    "Set policies and department budgets before long runs.",
    "Train Focus to raise merit; promote when Ready.",
    "Watch Food/Morale/Security lights.",
    "Use Advisor Summary if unsure.",
    "Open Succession Council before the Patriarch falls.",
    "Presets: Peacetime for growth, Crisis if starving.",
    "Trade routes need Security ≥ 30.",
    "Queue at most 3 monthly orders.",
    "Warehouse stores surplus food.",
    "Pause-on-red stops you before collapse.",
    "Cabinet Meeting gives yearly choices.",
    "You are ready — tutorial complete."
  ];
  const i = 12 - state.simFinish.tutorialMonth - 1;
  if (tips[i]) showToast("Tutorial: " + tips[i]);
}

function earlyGameIncomeFloor() {
  const y = state.sim.year || 1;
  if (y <= 2) {
    const gold = (state.clanWealth && state.clanWealth.gold) || 0;
    if (gold < 25) state.clanWealth.gold = gold + 5;
  }
}

function softCapDeptLevels() {
  Object.keys(state.mgmt.departments || {}).forEach(k => {
    if (state.mgmt.departments[k].level > 10) state.mgmt.departments[k].level = 10;
  });
}

function upgradeDepartmentCapped(dept) {
  ensureManagement();
  softCapDeptLevels();
  const d = state.mgmt.departments[dept];
  if (!d) return;
  if (d.level >= 10) return showToast("Department max level 10");
  const cost = 30 + d.level * 25 + Math.floor(d.level * d.level * 2);
  if ((state.clanWealth.gold || 0) < cost) return showToast("Need " + cost + " gold");
  state.clanWealth.gold -= cost;
  d.level += 1;
  simLog(dept + " → Lv." + d.level + " (-" + cost + "g)");
  saveState();
  showToast(dept + " Lv." + d.level);
  switchView("simulation");
}

function fireDeptHead(dept) {
  ensureMgmtDepth && ensureMgmtDepth();
  if (!state.mgmt.deptHeads[dept]) return showToast("No head");
  const id = state.mgmt.deptHeads[dept];
  const c = state.characters.find(x => x.id === id);
  state.mgmt.deptHeads[dept] = null;
  if (c) addLoyalty(c, -5);
  simLog((c ? c.name : "Head") + " removed from " + dept);
  saveState();
  showToast("Fired " + dept + " head");
  switchView("simulation");
}

function autoAssignBestHeads() {
  ensureMgmtDepth && ensureMgmtDepth();
  const living = getLineageCharacters().slice();
  const score = (c) => (typeof cultivationScore === "function" ? cultivationScore(c) : 0) + (typeof loyaltyOf === "function" ? loyaltyOf(c) : 50);
  living.sort((a, b) => score(b) - score(a));
  const depts = ["military", "alchemy", "diplomacy", "economy", "intelligence"];
  const used = new Set();
  depts.forEach((dept, i) => {
    const pick = living.find(c => !used.has(c.id));
    if (pick) {
      state.mgmt.deptHeads[dept] = pick.id;
      used.add(pick.id);
    }
  });
  simLog("Auto-assigned department heads by cultivation + loyalty.");
  saveState();
  showToast("Heads auto-assigned");
  switchView("simulation");
}

function authorizeWarAgenda() {
  ensureCouncil && ensureCouncil();
  if (!state.council.discussionOpen) openSuccessionCouncil();
  state.council.warAuthorized = true;
  simLog("Council agenda: War authorized.");
  showToast("War authorized by council");
  saveState();
  switchView("simulation");
}


function yearAutosave() {
  ensureSimFinish();
  if (state.sim.month !== 1) return;
  if (state.simFinish.autosaveYear === state.sim.year) return;
  state.simFinish.autosaveYear = state.sim.year;
  try {
    const key = "heavenlyDaoAutosave";
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), year: state.sim.year, state: state }));
  } catch(e) {}
}

function stopScoreboard() {
  ensureSimFinish();
  const living = getLineageCharacters().length;
  let mgmt = 0;
  try { mgmt = typeof managementScore === "function" ? 0 : 0; } catch(e) {}
  // compute without alert
  try {
    ensureMgmtDepth && ensureMgmtDepth();
    const m = state.mgmt;
    mgmt = Math.round((m.food||0)+(m.morale||0)+(m.security||0)+((state.clanWealth&&state.clanWealth.gold)||0)*0.1+Object.values(m.departments).reduce((s,d)=>s+d.level*10,0));
  } catch(e) {}
  const board = {
    years: state.sim.year || 1,
    living: living,
    peakLiving: Math.max(living, state.simFinish.peakLiving || 0),
    mgmt: mgmt,
    golden: (state.simInt && state.simInt.goldenAgeYears) || 0,
    gold: (state.clanWealth && state.clanWealth.gold) || 0
  };
  state.simFinish.peakLiving = board.peakLiving;
  state.simFinish.lastScoreboard = board;
  alert("Scoreboard\nYears: " + board.years + "\nLiving: " + board.living + "\nPeak living: " + board.peakLiving + "\nMgmt score: " + board.mgmt + "\nGolden years: " + board.golden + "\nGold: " + board.gold);
}

function bugcheckSanity() {
  const issues = [];
  if (!state.lineage || !state.lineage.founderId) issues.push("No founder set");
  if (state.clanWealth && (isNaN(state.clanWealth.gold) || state.clanWealth.gold < 0)) {
    issues.push("Bad gold — repaired");
    state.clanWealth.gold = Math.max(0, Number(state.clanWealth.gold) || 0);
  }
  if (state.mgmt) {
    ["food","morale","security"].forEach(k => {
      if (isNaN(state.mgmt[k])) { state.mgmt[k] = 50; issues.push("Repaired " + k); }
    });
    Object.keys(state.mgmt.deptHeads || {}).forEach(dept => {
      const id = state.mgmt.deptHeads[dept];
      if (id && !state.characters.find(c => c.id === id && c.alive !== false)) {
        state.mgmt.deptHeads[dept] = null;
        issues.push("Cleared orphan head: " + dept);
      }
    });
  }
  getLineageCharacters().forEach(c => {
    if (!state.hierarchy.roles[c.id]) state.hierarchy.roles[c.id] = "outer";
  });
  saveState();
  alert(issues.length ? ("Bugcheck:\n- " + issues.join("\n- ")) : "Bugcheck OK — no issues found");
}

function loadScenario(name) {
  ensureSimFinish();
  if (!state.world) try { createWorld(); } catch(e) {}
  if (name === "dying") {
    // leave only few living
    const living = getLineageCharacters();
    living.slice(3).forEach(c => { try { killCharacter(c, "scenario cull"); } catch(e) { c.alive = false; } });
    if (!living.length) {
      createCharacter("Dou Zhe");
      state.currentCharacterId = state.characters[0].id;
      markFounder();
    }
    state.clanWealth.gold = 15;
    state.mgmt.food = 20;
    state.mgmt.morale = 25;
    showToast("Scenario: Dying clan");
  } else if (name === "merchant") {
    state.clanWealth.gold = 300;
    state.clanWealth.renown = 8;
    try { unlockTradeRoute("silk"); unlockTradeRoute("herb"); } catch(e) {}
    applyPreset("Peacetime");
    showToast("Scenario: Rich merchant clan");
  } else if (name === "frontier") {
    state.globalThreat = 7;
    state.mgmt.border = "Tension";
    state.mgmt.security = 35;
    applyPreset("War Economy");
    showToast("Scenario: War frontier");
  }
  saveState();
  switchView("simulation");
}

function renderSimTabs() {
  ensureSimFinish();
  const t = state.simFinish.tab || "management";
  const btn = (id, label) => `<button class="${t===id?'btn-primary':'btn-ghost'}" onclick="setSimTab('${id}')">${label}</button>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
    ${btn("management","Management")}
    ${btn("people","People")}
    ${btn("politics","Politics")}
  </div>`;
}



// ===== FULL-FLEDGED DYNASTY SIM LAYER =====
function ensureFullSim() {
  ensureManagement();
  ensureProgression && ensureProgression();
  ensureSimFinish && ensureSimFinish();
  ensureSimIntegration && ensureSimIntegration();
  if (!state.fullSim) {
    state.fullSim = {
      phase: "setup", // setup | reign | crisis | victory | defeat
      difficulty: "Standard",
      speed: 1,
      seasonEvents: true,
      narrativeLog: [],
      turnSummary: [],
      startedAt: null
    };
  }
}

function newFullDynastySim() {
  ensureFullSim();
  if (!confirm("Start a new Full Dynasty SIM? Current progress in this browser slot will be overwritten.")) return;
  try {
    localStorage.removeItem("heavenlyDaoChroniclesSave");
  } catch(e) {}
  // reset critical state while keeping functions
  state.characters = [];
  state.lineage = { founderId: null, heirs: [], dead: [], generations: 1, bloodName: "", traits: [] };
  state.sim = { year: 1, month: 1, running: false, speed: 1, log: [], pendingChoice: null, lineageAlive: true, pauseOnEvents: true, watchOnly: false };
  state.clanWealth = { gold: 80, herbs: 5, renown: 2, ledger: [] };
  state.hierarchy = { roles: {}, laws: [], favor: {}, loyalty: {}, duties: {}, prestigeTier: "Unknown" };
  state.progression = { merit: {}, mode: "bottom_up", autoPromote: true };
  state.council = { successorCandidateId: null, votes: {}, discussionOpen: false, minScoreForPatriarch: 220, minMeritForPatriarch: 90, minLoyalty: 40, elderTermYears: 20, elderTermStart: {}, waitingList: [] };
  state.mgmt = null;
  state.dynasty = null;
  state.storyChapters = [];
  state.succession = { designatedId: null };
  ensureManagement();
  ensureMgmtDepth && ensureMgmtDepth();
  ensureFullSim();
  state.fullSim.phase = "setup";
  state.fullSim.startedAt = Date.now();
  // bootstrap world + founder
  try { if (!state.world) createWorld(); } catch(e) {}
  try {
    createCharacter("Dou Zhe");
    state.currentCharacterId = state.characters[0].id;
    const blood = (state.characters[0].name || "Heaven").split(" ")[0] + " Clan";
    state.lineage.bloodName = blood;
    markFounder();
    marrySpouse();
  } catch(e) {}
  try { safeDefaultsNewDynasty(); } catch(e) {}
  try { ensureWorldSim(); ensureWorldContent(); } catch(e) {}
  try { autoAssignBestHeads(); } catch(e) {}
  state.fullSim.phase = "reign";
  try {
    ensureGameLayer();
    if ((state.game.ngPlusTraits || []).length) {
      state.clanWealth.renown = (state.clanWealth.renown || 1) + state.game.ngPlusTraits.length;
      pushNarrative("Bloodline carries legacy traits: " + state.game.ngPlusTraits.join(", "));
    }
  } catch(e) {}
  pushNarrative("The " + (state.lineage.bloodName || "clan") + " raises its banner. A full dynasty simulation begins.");
  saveState();
  showToast("Full Dynasty SIM started");
  switchView("simulation");
}

function pushNarrative(msg) {
  ensureFullSim();
  state.fullSim.narrativeLog.unshift({ y: state.sim.year, m: state.sim.month, msg: msg });
  if (state.fullSim.narrativeLog.length > 40) state.fullSim.narrativeLog.pop();
  try { simLog(msg); } catch(e) {}
}

function fullSimSeasonEvent() {
  ensureFullSim();
  if (!state.fullSim.seasonEvents) return;
  const season = typeof seasonLabel === "function" ? seasonLabel() : "";
  if (state.sim.month === 3 && Math.random() > 0.6) {
    pushNarrative("Spring planting — Economy department is busy.");
    state.mgmt.departments.economy.budget = Math.min(40, (state.mgmt.departments.economy.budget || 0) + 2);
  }
  if (state.sim.month === 6 && Math.random() > 0.7) {
    pushNarrative("Summer heat — closed-door training is popular.");
  }
  if (state.sim.month === 9 && Math.random() > 0.65) {
    pushNarrative("Autumn harvest rites raise morale.");
    state.mgmt.morale = Math.min(100, (state.mgmt.morale || 50) + 3);
  }
  if (state.sim.month === 12 && Math.random() > 0.6) {
    pushNarrative("Winter closes the roads — trade slows, family gathers.");
    state.mgmt.food = Math.max(0, (state.mgmt.food || 50) - 2);
  }
}

function fullSimPhaseUpdate() {
  ensureFullSim();
  const living = getLineageCharacters().length;
  if (living === 0) {
    state.fullSim.phase = "defeat";
    return;
  }
  if (state.sim.pendingChoice) {
    state.fullSim.phase = "crisis";
    return;
  }
  if (state.simInt && state.simInt.goldenVictory) {
    state.fullSim.phase = "victory";
    return;
  }
  if (living >= 800 || ((state.hierarchy && state.hierarchy.prestigeTier) === "Continental" && living >= 40)) {
    // soft victory tracking
    if (!state.fullSim.empireNear) {
      state.fullSim.empireNear = true;
      pushNarrative("The clan approaches imperial scale.");
    }
  }
  state.fullSim.phase = "reign";
}

function runFullSimMonth() {
  ensureFullSim();
  if (state.fullSim.phase === "defeat") return showToast("Dynasty defeated — start a new Full SIM");
  try { simTick(true); } catch(e) { console.error(e); }
  try { fullSimSeasonEvent(); fullSimPhaseUpdate(); } catch(e) {}
  saveState();
  switchView("simulation");
}

function runFullSimYear() {
  const spd = (state.sim30 && state.sim30.simSpeed) || 1;
  const months = 12;
  for (let i = 0; i < months; i++) {
    if (state.sim.pendingChoice) break;
    if (state.fullSim && state.fullSim.phase === "defeat") break;
    try { simTick(true); fullSimSeasonEvent(); } catch(e) { break; }
  }
  fullSimPhaseUpdate();
  saveState();
  try { yearEndReport(); } catch(e) {}
  switchView("simulation");
}

function renderFullSimHUD() {
  ensureFullSim();
  const phase = state.fullSim.phase || "setup";
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const food = (state.mgmt && state.mgmt.food) || 0;
  const morale = (state.mgmt && state.mgmt.morale) || 0;
  const sec = (state.mgmt && state.mgmt.security) || 0;
  const narr = (state.fullSim.narrativeLog || []).slice(0, 4);
  return `
    <div class="card" style="margin-bottom:14px;padding:16px;border:1px solid var(--gold);background:linear-gradient(180deg,rgba(180,140,40,0.08),transparent);">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:flex-start;">
        <div>
          <div style="font-family:var(--ds-font-display);color:var(--gold);font-size:1.35rem;">${state.lineage.bloodName || "Unnamed Dynasty"}</div>
          <div style="color:var(--text-muted);font-size:0.9rem;">Full Dynasty SIM · Phase: <strong style="color:var(--gold);">${phase}</strong> · Y${state.sim.year} M${state.sim.month} · ${typeof seasonLabel==='function'?seasonLabel():''}</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button class="btn-primary" onclick="newFullDynastySim()">New Full SIM</button>
          <button class="btn-primary" onclick="startSimulation()">▶ Continuous</button>
          <button class="btn-primary" onclick="autoManageEverything()">⚡ Auto-Manage All</button>
          <button class="btn-ghost" onclick="runFullSimMonth()">⏭ Month</button>
          <button class="btn-ghost" onclick="runFullSimYear()">⏩ Year</button>
          <button class="btn-ghost" onclick="try{stopSimulation()}catch(e){};try{stopScoreboard()}catch(e){}">⏹ Stop + Score</button>
        </div>
      </div>
      <div class="grid-3" style="margin-top:14px;">
        <div class="stat-box"><div class="label">Population</div><div class="value">${living}</div></div>
        <div class="stat-box"><div class="label">Gold</div><div class="value">${gold}</div></div>
        <div class="stat-box"><div class="label">Food ${typeof statusLight==='function'?statusLight(food):''}</div><div class="value">${Math.round(food)}</div></div>
        <div class="stat-box"><div class="label">Morale ${typeof statusLight==='function'?statusLight(morale):''}</div><div class="value">${Math.round(morale)}</div></div>
        <div class="stat-box"><div class="label">Security ${typeof statusLight==='function'?statusLight(sec):''}</div><div class="value">${Math.round(sec)}</div></div>
        <div class="stat-box"><div class="label">Threat</div><div class="value">${state.globalThreat||1}</div></div>
      </div>
      <div style="margin-top:12px;">
        <div style="color:var(--gold);font-size:0.85rem;margin-bottom:4px;">Dynasty Chronicle</div>
        ${narr.map(n => `<div style="font-size:0.82rem;color:var(--text-muted);padding:3px 0;border-bottom:1px solid var(--border);">Y${n.y}M${n.m} — ${n.msg}</div>`).join("") || "<div style='color:var(--text-dim);font-size:0.82rem;'>Start a New Full SIM to begin the chronicle.</div>"}
      </div>
    </div>
  `;
}



// ===== DYNASTY SIM GAME LAYER 20 =====
function ensureGameLayer() {
  ensureFullSim && ensureFullSim();
  if (!state.game) {
    state.game = {
      fiveYearPlan: null, // { type, target, startYear, done }
      victoryType: "any", // any | empire | continental | golden | survival
      advancedUI: false, // default compact UI
      importantToastsOnly: true,
      neighbors: null,
      nodes: null,
      ambitions: {},
      ngPlusTraits: [],
      educationQueue: [] // { charId, track, monthsLeft }
    };
  }
  if (!state.game.neighbors) {
    state.game.neighbors = [
      { name: generateName() + " Clan", power: 40, relation: 0, living: 20 },
      { name: generateName() + " Sect", power: 55, relation: -1, living: 30 },
      { name: generateName() + " House", power: 35, relation: 1, living: 15 }
    ];
  }
  if (!state.game.nodes) {
    state.game.nodes = [
      { id: "mine", label: "Spirit Mine", owner: null, yield: "gold" },
      { id: "herb", label: "Herb Mountain", owner: null, yield: "herbs" },
      { id: "field", label: "Fertile Fields", owner: null, yield: "food" }
    ];
  }
}

function setVictoryType(t) {
  ensureGameLayer();
  state.game.victoryType = t;
  saveState();
  showToast("Victory type: " + t);
}

function setFiveYearPlan(type) {
  ensureGameLayer();
  const plans = {
    population: { type: "population", target: getLineageCharacters().length + 15 },
    gold: { type: "gold", target: ((state.clanWealth && state.clanWealth.gold) || 0) + 150 },
    prestige: { type: "prestige", target: 1 }
  };
  state.game.fiveYearPlan = { ...plans[type], startYear: state.sim.year || 1, done: false };
  simLog("Five-year plan set: " + type);
  saveState();
  showToast("Plan: " + type);
  switchView("simulation");
}

function checkFiveYearPlan() {
  ensureGameLayer();
  const p = state.game.fiveYearPlan;
  if (!p || p.done) return;
  const y = state.sim.year || 1;
  if (y < p.startYear + 5) return;
  let ok = false;
  if (p.type === "population") ok = getLineageCharacters().length >= p.target;
  if (p.type === "gold") ok = ((state.clanWealth && state.clanWealth.gold) || 0) >= p.target;
  if (p.type === "prestige") ok = (state.hierarchy && state.hierarchy.prestigeTier) !== "Unknown";
  p.done = true;
  if (ok) {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + 50;
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
    pushNarrative && pushNarrative("Five-year plan completed — the clan prospers.");
    showToast("Five-year plan SUCCESS");
  } else {
    pushNarrative && pushNarrative("Five-year plan failed.");
    showToast("Five-year plan failed");
  }
}

function endOfYearCeremony() {
  ensureGameLayer();
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  let suggestion = "Maintain Peacetime growth";
  if ((state.mgmt && state.mgmt.food) < 40) suggestion = "Stockpile food / Crisis preset";
  else if ((state.globalThreat || 1) >= 6) suggestion = "War Economy or Last Defense";
  else if (living < 10) suggestion = "Aggressive recruit carefully";
  else if (gold > 200) suggestion = "Upgrade departments or trade routes";
  alert("End-of-Year Ceremony Y" + (state.sim.year || 1) + "\n\nLiving: " + living + "\nGold: " + gold + "\nMorale: " + Math.round((state.mgmt && state.mgmt.morale) || 0) + "\nSecurity: " + Math.round((state.mgmt && state.mgmt.security) || 0) + "\n\nAdvisor suggests:\n" + suggestion);
}

function renderRivalPanel() {
  ensureGameLayer();
  const mine = Math.max(0, ...getLineageCharacters().map(c => typeof cultivationScore === "function" ? cultivationScore(c) : 0));
  const rivals = state.game.neighbors || [];
  return `<div class="card" style="margin-bottom:12px;padding:12px;">
    <div style="color:var(--gold);font-weight:600;margin-bottom:8px;">Neighbor Powers</div>
    <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:6px;">Your peak power: <strong style="color:var(--gold);">${Math.round(mine)}</strong></div>
    ${rivals.map(r => `<div style="padding:4px 0;border-bottom:1px solid var(--border);font-size:0.82rem;">${r.name} · power ${Math.round(r.power)} · rel ${r.relation} · pop ${r.living}</div>`).join("")}
  </div>`;
}

function tickNeighbors() {
  ensureGameLayer();
  (state.game.neighbors || []).forEach(n => {
    n.power = Math.max(10, (n.power || 40) + randInt(-3, 5));
    n.living = Math.max(5, (n.living || 15) + randInt(-1, 2));
  });
}

function queueHeirEducation(track) {
  ensureGameLayer();
  const char = getActiveChar();
  if (!char) return showToast("Select a junior/member");
  if (state.game.educationQueue.length >= 3) return showToast("Education queue full (3)");
  if ((state.clanWealth.gold || 0) < 15) return showToast("Need 15 gold");
  state.clanWealth.gold -= 15;
  state.game.educationQueue.push({ charId: char.id, track: track, monthsLeft: 6 });
  simLog(char.name + " enters " + track + " education (6 months)");
  saveState();
  showToast(track + " education queued");
  switchView("simulation");
}

function tickEducationQueue() {
  ensureGameLayer();
  const next = [];
  (state.game.educationQueue || []).forEach(job => {
    job.monthsLeft -= 1;
    if (job.monthsLeft <= 0) {
      const c = state.characters.find(x => x.id === job.charId);
      if (c) {
        c.education = job.track;
        try { addMerit(c, 12, job.track + " education"); } catch(e) {}
        if (job.track === "Combat") c.experience = Math.min(100, (c.experience || 20) + 10);
        if (job.track === "Alchemy") c.comprehension = Math.min(100, (c.comprehension || 20) + 10);
        if (job.track === "Politics") { try { addLoyalty(c, 8); } catch(e) {} }
        importantToast(c.name + " finished " + job.track + " education");
      }
    } else next.push(job);
  });
  state.game.educationQueue = next;
}

function toggleAdvancedUI() {
  try { ensureGameLayer(); } catch(e) { state.game = state.game || {}; }
  state.game.advancedUI = !state.game.advancedUI;
  try { state.simQoL = state.simQoL || {}; state.simQoL.advanced = state.game.advancedUI; } catch(e) {}
  saveState();
  showToast("Advanced: " + (state.game.advancedUI ? "ON" : "OFF"));
  switchView("simulation");
}

function importantToast(msg) {
  ensureGameLayer();
  if (state.game.importantToastsOnly) {
    const m = (msg || "").toLowerCase();
    const ok = m.includes("died") || m.includes("death") || m.includes("promoted") || m.includes("elder") || m.includes("disaster") || m.includes("council") || m.includes("defense") || m.includes("plan") || m.includes("victory") || m.includes("defeat") || m.includes("education");
    if (!ok) return;
  }
  try { showToast(msg); } catch(e) {}
}

function empireDecreeEvent() {
  if ((state.sim.year || 1) % 15 !== 0 || state.sim.month !== 1) return;
  if (Math.random() > 0.7) return;
  state.sim.pendingChoice = {
    event: "Empire Decree — the continent's powers impose a demand.",
    options: [
      { label: "Pay tax tribute (-40 gold, +renown)", effect: "decree_tax" },
      { label: "Send conscripts (injury risk, +renown)", effect: "decree_conscript" },
      { label: "Seek recognition (-20 gold, prestige chance)", effect: "decree_recog" },
      { label: "Refuse (threat up)", effect: "decree_refuse" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
}

function resolveDecreeEffect(effect) {
  if (effect === "decree_tax") {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 40);
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
  } else if (effect === "decree_conscript") {
    const c = getLineageCharacters()[0];
    if (c && Math.random() > 0.5) applyInjury(c, 1);
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
  } else if (effect === "decree_recog") {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 20);
    if (Math.random() > 0.4) {
      state.clanWealth.renown = (state.clanWealth.renown || 1) + 3;
      try { prestigeTierFromRenown(); } catch(e) {}
    }
  } else {
    state.globalThreat = Math.min(10, (state.globalThreat || 1) + 2);
  }
  pushNarrative && pushNarrative("Empire decree resolved: " + effect);
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function claimNode(nodeId) {
  ensureGameLayer();
  const node = (state.game.nodes || []).find(n => n.id === nodeId);
  if (!node) return;
  if (node.owner === "player") return showToast("Already owned");
  if ((state.clanWealth.gold || 0) < 25) return showToast("Need 25 gold");
  state.clanWealth.gold -= 25;
  if (Math.random() > 0.35) {
    node.owner = "player";
    pushNarrative("Claimed resource: " + node.label);
    showToast("Claimed " + node.label);
  } else {
    showToast("Claim failed — resisted");
    state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
  }
  saveState();
  switchView("simulation");
}

function tickNodes() {
  ensureGameLayer();
  (state.game.nodes || []).forEach(n => {
    if (n.owner !== "player") return;
    if (n.yield === "gold") state.clanWealth.gold = (state.clanWealth.gold || 0) + randInt(2, 6);
    if (n.yield === "herbs") state.clanWealth.herbs = (state.clanWealth.herbs || 0) + 1;
    if (n.yield === "food") state.mgmt.food = Math.min(200, (state.mgmt.food || 50) + randInt(2, 5));
    // chance to lose
    if (Math.random() > 0.97) {
      n.owner = null;
      pushNarrative("Lost control of " + n.label);
    }
  });
}

function assignAmbitions() {
  ensureGameLayer();
  getLineageCharacters().filter(c => ["elder", "grand_elder"].includes(currentRankId(c))).forEach(c => {
    if (!state.game.ambitions[c.id]) {
      const goals = ["power", "wealth", "revenge"];
      state.game.ambitions[c.id] = goals[Math.floor(Math.random() * goals.length)];
    }
  });
}

function betrayalTick() {
  ensureGameLayer();
  getLineageCharacters().forEach(c => {
    if (!["elder", "grand_elder"].includes(currentRankId(c))) return;
    const loy = typeof loyaltyOf === "function" ? loyaltyOf(c) : 50;
    if (loy < 20 && Math.random() > 0.9) {
      state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 30);
      pushNarrative(c.name + " betrays the clan for private gain (" + (state.game.ambitions[c.id] || "ambition") + ").");
      importantToast(c.name + " betrays the clan");
      try { addLoyalty(c, 10); } catch(e) {}
    }
  });
}

function geniusChildEvent() {
  if (Math.random() > 0.02) return;
  const parent = getLineageCharacters()[0];
  if (!parent || typeof birthHeir !== "function") return;
  const child = birthHeir(parent);
  if (!child) return;
  child.talent = "Against the Heavens";
  child.maintenance = true;
  try { state.progression.merit[child.id] = 5; } catch(e) {}
  pushNarrative("A genius child is born — high potential, high maintenance.");
  importantToast("Genius child born");
}

function simSaveSlot() {
  try {
    localStorage.setItem("heavenlyDaoChroniclesSave", JSON.stringify(state));
    showToast("SIM saved");
  } catch(e) { showToast("Save failed"); }
}

function simLoadSlot() {
  try {
    if (state.sim30 && state.sim30.ironman) return showToast("Ironman — load disabled");
    const raw = localStorage.getItem("heavenlyDaoChroniclesSave");
    if (!raw) return showToast("No save");
    const data = JSON.parse(raw);
    Object.keys(data).forEach(k => { state[k] = data[k]; });
    showToast("SIM loaded");
    switchView("simulation");
  } catch(e) { showToast("Load failed"); }
}

function resolveBorderClash() {
  const a = (typeof getFocusChar === "function" && getFocusChar()) || getActiveChar() || getLineageCharacters()[0];
  if (!a) return showToast("No fighter");
  const foe = generateCharacter(a.realm || "Dou Shi");
  foe.name = (state.game.neighbors && state.game.neighbors[0] ? state.game.neighbors[0].name : "Neighbor") + " Champion";
  if (typeof simulateDetailedBattle === "function") {
    const res = simulateDetailedBattle(a, foe);
    if (res.win) {
      state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
      if (state.game.neighbors && state.game.neighbors[0]) state.game.neighbors[0].relation -= 1;
      pushNarrative("Border clash won by " + a.name);
    } else {
      state.mgmt.security = Math.max(0, (state.mgmt.security || 50) - 5);
      pushNarrative("Border clash lost");
    }
  }
  saveState();
  switchView("battle");
}

function renderPopGoldGraph() {
  const hist = (state.sim && state.sim.history) || [];
  if (hist.length < 2) return `<p style="color:var(--text-dim);font-size:0.8rem;">Graph builds as years pass.</p>`;
  const slice = hist.slice(-20);
  const maxL = Math.max(...slice.map(h => h.living || 1), 1);
  const maxG = Math.max(...slice.map(h => h.gold || 1), 1);
  return `<div style="display:flex;align-items:flex-end;gap:3px;height:50px;margin:8px 0;">
    ${slice.map(h => {
      const hl = Math.max(3, Math.round(((h.living || 0) / maxL) * 48));
      const hg = Math.max(3, Math.round(((h.gold || 0) / maxG) * 48));
      return `<div title="Y${h.year} living ${h.living} gold ${h.gold}" style="display:flex;gap:1px;align-items:flex-end;">
        <div style="width:4px;height:${hl}px;background:#6bcf8e;border-radius:1px;"></div>
        <div style="width:4px;height:${hg}px;background:var(--gold);border-radius:1px;"></div>
      </div>`;
    }).join("")}
  </div>
  <p style="color:var(--text-dim);font-size:0.75rem;">Green = living · Gold = vault (last ${slice.length} years)</p>`;
}

function checkVictoryTypes() {
  ensureGameLayer();
  const vt = state.game.victoryType || "any";
  const living = getLineageCharacters().length;
  const tier = (state.hierarchy && state.hierarchy.prestigeTier) || "";
  const golden = (state.simInt && state.simInt.goldenAgeYears) || 0;
  let win = false;
  let label = "";
  if ((vt === "empire" || vt === "any") && living >= (typeof LIVING_CAP !== "undefined" ? LIVING_CAP : 1000)) { win = true; label = "Empire"; }
  if ((vt === "continental" || vt === "any") && tier === "Continental" && living >= 40) { win = true; label = "Continental"; }
  if ((vt === "golden" || vt === "any") && golden >= 50) { win = true; label = "Golden Administration"; }
  if ((vt === "survival" || vt === "any") && (state.sim.year || 1) >= 100 && living > 0) { win = true; label = "Century Survival"; }
  if (win && state.fullSim && state.fullSim.phase !== "victory") {
    state.fullSim.phase = "victory";
    generateEpilogue("victory", label);
  }
}

function generateEpilogue(kind, detail) {
  const blood = state.lineage.bloodName || "The clan";
  const years = state.sim.year || 1;
  let text = "";
  if (kind === "victory") {
    text = blood + " stands after " + years + " years.\\n\\nUnder banners and ledgers, the bloodline achieved: " + detail + ".\\n\\nChildren of Outer disciples became Elders; Ancestors watched the borders; the vault and the granary both held. The continent learned their name.";
  } else {
    text = blood + " ends in year " + years + ".\\n\\nCause: " + (detail || "unknown") + ".\\n\\nWhat remains is dust, ledgers, and a few true names carved in the Hall of Patriarchs.";
  }
  state.storyChapters.push({ title: kind === "victory" ? "Epilogue — Victory" : "Epilogue — Defeat", content: text.replace(/\\n/g, "\n") });
  alert(text.replace(/\\n/g, "\n"));
  // NG+ trait
  ensureGameLayer();
  if (kind === "victory") {
    state.game.ngPlusTraits.push(detail || "Legacy");
  }
}

function exportDynastyChronicle() {
  const lines = [];
  lines.push("DYNASTY CHRONICLE — " + (state.lineage.bloodName || "?"));
  lines.push("Years: " + (state.sim.year || 1));
  lines.push("");
  ((state.fullSim && state.fullSim.narrativeLog) || []).slice().reverse().forEach(n => {
    lines.push("Y" + n.y + "M" + n.m + " — " + n.msg);
  });
  lines.push("");
  lines.push("STORY CHAPTERS");
  (state.storyChapters || []).slice(-30).forEach(ch => {
    lines.push("## " + ch.title);
    lines.push(ch.content);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dynasty-chronicle.txt";
  a.click();
  showToast("Chronicle exported");
}

function bindSimHotkeys() {
  if (window.__simHotkeysBound) return;
  window.__simHotkeysBound = true;
  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
    if (e.code === "Space") { e.preventDefault(); try { runFullSimMonth(); } catch(err) {} }
    if (e.code === "Enter") { e.preventDefault(); try { runFullSimYear(); } catch(err) {} }
    if (e.code === "KeyP") { try { stopSimulation(); } catch(err) { state.sim.running = false; } }
  });
}



// ===== 30-FEATURE + MANAGEMENT UPGRADE PACK =====
function ensureSim30() {
  ensureGameLayer && ensureGameLayer();
  ensureManagement();
  if (!state.sim30) {
    state.sim30 = {
      patriarchAP: 5,
      maxAP: 5,
      simSpeed: 1,
      ironman: false,
      pauseCats: { death: true, disaster: true, council: true, promotion: true },
      classHappiness: { outer: 50, inner: 55, core: 60, elder: 65 },
      buildingAge: {},
      allianceId: null,
      casusBelli: [],
      siege: null,
      prisoners: [],
      usurpation: {},
      artifacts: [],
      globalModifier: null,
      memoirs: [],
      smugglingUntil: 0,
      mercenaryUntil: 0,
      customDisasters: []
    };
  }
}

function spendPatriarchAP(n, label) {
  ensureSim30();
  n = n || 1;
  if (state.sim30.patriarchAP < n) {
    showToast("Not enough Patriarch AP (" + state.sim30.patriarchAP + "/" + state.sim30.maxAP + ")");
    return false;
  }
  state.sim30.patriarchAP -= n;
  if (label) simLog("AP: " + label + " (" + state.sim30.patriarchAP + " left)");
  return true;
}

function refreshPatriarchAP() {
  ensureSim30();
  if (state.sim.month === 1) state.sim30.patriarchAP = state.sim30.maxAP;
}

function setSimSpeed(s) {
  try { ensureSim30(); } catch(e) {}
  try { ensureSim(); } catch(e) {}
  state.sim.speed = s;
  if (state.sim30) state.sim30.simSpeed = s;
  if (state.sim.running) {
    try { stopSimulation(); startSimulation(); } catch(e) {}
  }
  try { saveState(); } catch(e) {}
  showToast("Speed " + s + "x");
}

function toggleIronman() {
  ensureSim30();
  state.sim30.ironman = !state.sim30.ironman;
  saveState();
  showToast("Ironman: " + (state.sim30.ironman ? "ON" : "OFF"));
}

function continueLastSave() {
  try {
    const raw = localStorage.getItem("heavenlyDaoChroniclesSave") || localStorage.getItem("heavenlyDaoAutosave");
    if (!raw) return showToast("No save found");
    const data = JSON.parse(raw);
    const st = data.state || data;
    Object.keys(st).forEach(k => { state[k] = st[k]; });
    showToast("Continued last save");
    switchView("simulation");
  } catch(e) { showToast("Continue failed"); }
}

function improvedSimSave() {
  ensureSim30();
  if (state.sim30.ironman) {
    // single slot overwrite only
  }
  try {
    localStorage.setItem("heavenlyDaoChroniclesSave", JSON.stringify(state));
    showToast(state.sim30.ironman ? "Ironman save" : "Saved");
  } catch(e) { showToast("Save failed"); }
}

function setSeasonalBudget(season) {
  ensureSim30();
  if (!spendPatriarchAP(1, "seasonal budget " + season)) return;
  if (season === "spring") {
    state.mgmt.departments.economy.budget = 20;
    state.mgmt.departments.military.budget = 5;
  } else if (season === "winter") {
    state.mgmt.departments.military.budget = 20;
    state.mgmt.departments.economy.budget = 8;
  } else if (season === "summer") {
    state.mgmt.departments.alchemy.budget = 15;
  } else {
    state.mgmt.departments.diplomacy.budget = 12;
  }
  saveState();
  showToast("Seasonal budget: " + season);
  switchView("simulation");
}

function updateClassHappiness() {
  ensureSim30();
  const groups = { outer: [], inner: [], core: [], elder: [] };
  getLineageCharacters().forEach(c => {
    const r = currentRankId(c);
    if (r === "outer") groups.outer.push(c);
    else if (r === "inner") groups.inner.push(c);
    else if (r === "core") groups.core.push(c);
    else groups.elder.push(c);
  });
  Object.keys(groups).forEach(k => {
    if (!groups[k].length) return;
    const avgLoy = groups[k].reduce((s, c) => s + (typeof loyaltyOf === "function" ? loyaltyOf(c) : 50), 0) / groups[k].length;
    let h = avgLoy;
    if (k === "outer" && (state.mgmt.policies.taxation === "high")) h -= 10;
    if (k === "elder" && (state.mgmt.departments.military.budget || 0) < 5) h -= 5;
    state.sim30.classHappiness[k] = Math.max(0, Math.min(100, h));
  });
}

function startSmuggling() {
  ensureSim30();
  if (!spendPatriarchAP(1, "smuggling")) return;
  state.sim30.smugglingUntil = (state.sim.year || 1) * 12 + (state.sim.month || 1) + 6;
  simLog("Smuggling route opened for 6 months.");
  saveState();
  showToast("Smuggling ON");
  switchView("simulation");
}

function hireMercenaries() {
  ensureSim30();
  if ((state.clanWealth.gold || 0) < 35) return showToast("Need 35 gold");
  if (!spendPatriarchAP(1, "mercenaries")) return;
  state.clanWealth.gold -= 35;
  state.sim30.mercenaryUntil = (state.sim.year || 1) * 12 + (state.sim.month || 1) + 4;
  state.mgmt.security = Math.min(100, (state.mgmt.security || 50) + 15);
  simLog("Mercenaries contracted (4 months).");
  saveState();
  showToast("Mercenaries hired");
  switchView("simulation");
}

function famineReliefTree() {
  ensureSim30();
  state.sim.pendingChoice = {
    event: "Famine relief — how does the clan respond?",
    options: [
      { label: "Open granaries (−food, +morale, +loyalty)", effect: "famine_granary" },
      { label: "Buy foreign grain (−60g, stabilize food)", effect: "famine_buy" },
      { label: "Ignore the weak (−morale, Outer unrest)", effect: "famine_ignore" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
}

function resolveFamineEffect(effect) {
  if (effect === "famine_granary") {
    state.mgmt.food = Math.max(0, state.mgmt.food - 25);
    state.mgmt.morale = Math.min(100, state.mgmt.morale + 10);
    getLineageCharacters().forEach(c => { try { addLoyalty(c, 3); } catch(e) {} });
  } else if (effect === "famine_buy") {
    if ((state.clanWealth.gold || 0) >= 60) {
      state.clanWealth.gold -= 60;
      state.mgmt.food = Math.min(200, state.mgmt.food + 40);
    } else showToast("Not enough gold");
  } else {
    state.mgmt.morale = Math.max(0, state.mgmt.morale - 12);
    getLineageCharacters().filter(c => currentRankId(c) === "outer").forEach(c => { try { addLoyalty(c, -5); } catch(e) {} });
  }
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function tickBuildingRepair() {
  ensureSim30();
  if (state.sim.month !== 1 || (state.sim.year || 1) % 10 !== 0) return;
  const cost = 20 + Object.keys(state.dynasty && state.dynasty.buildings || {}).length * 5;
  if ((state.clanWealth.gold || 0) >= cost) {
    state.clanWealth.gold -= cost;
    simLog("Infrastructure repair −" + cost + "g");
  } else {
    state.mgmt.security = Math.max(0, state.mgmt.security - 8);
    simLog("Buildings decay — security suffers.");
  }
}

function setCustomTitleForSeat() {
  setCustomTitle && setCustomTitle();
}

function marriageMarket() {
  ensureSim30();
  const char = getActiveChar();
  if (!char) return showToast("Select a member");
  if (char.spouse) return showToast("Already married");
  const suitors = [0,1,2].map(() => {
    const s = generateCharacter(char.realm || "Dou Zhe");
    return { name: s.name, realm: s.realm, star: s.star, talent: s.talent, score: typeof cultivationScore === "function" ? cultivationScore(s) : 20 };
  });
  state.sim.pendingChoice = {
    event: "Marriage market for " + char.name + ": 1) " + suitors[0].name + " (" + suitors[0].star + " " + suitors[0].realm + ") 2) " + suitors[1].name + " 3) " + suitors[2].name,
    options: [
      { label: "Marry #1 " + suitors[0].name, effect: "marry_0" },
      { label: "Marry #2 " + suitors[1].name, effect: "marry_1" },
      { label: "Marry #3 " + suitors[2].name, effect: "marry_2" },
      { label: "Decline all", effect: "marry_no" }
    ]
  };
  state.sim._suitorCache = suitors;
  state.sim._marryTarget = char.id;
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
}

function resolveMarryEffect(effect) {
  if (effect === "marry_no") { state.sim.pendingChoice = null; saveState(); switchView("simulation"); return; }
  const idx = Number(effect.replace("marry_", ""));
  const suitors = state.sim._suitorCache || [];
  const s = suitors[idx];
  const char = state.characters.find(c => c.id === state.sim._marryTarget);
  if (char && s) {
    char.spouse = s.name + " (" + s.talent + ")";
    try { addMerit(char, 5, "marriage"); } catch(e) {}
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
    simLog(char.name + " married " + s.name);
  }
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function adoptOuterGenius() {
  const outers = getLineageCharacters().filter(c => currentRankId(c) === "outer").sort((a,b) => (typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0));
  const g = outers[0];
  if (!g) return showToast("No Outer to adopt");
  if (!spendPatriarchAP(1, "adoption")) return;
  g.isHeir = true;
  g.adopted = true;
  g.generation = Math.min(g.generation || 1, (state.lineage.generations || 1));
  try { addMerit(g, 15, "adopted into main line"); } catch(e) {}
  simLog(g.name + " adopted into the main bloodline");
  saveState();
  showToast("Adopted " + g.name);
  switchView("simulation");
}

function assignDisciple() {
  const master = getActiveChar();
  if (!master || !["grand_elder", "ancestor", "elder"].includes(currentRankId(master))) return showToast("Select Elder+ as master");
  master.disciples = master.disciples || [];
  if (master.disciples.length >= 3) return showToast("Max 3 disciples");
  const junior = getLineageCharacters().find(c => c.id !== master.id && currentRankId(c) === "outer");
  if (!junior) return showToast("No Outer junior");
  master.disciples.push(junior.id);
  junior.masterId = master.id;
  try { addMerit(junior, 3, "discipleship"); } catch(e) {}
  simLog(junior.name + " becomes disciple of " + master.name);
  saveState();
  showToast("Disciple assigned");
  switchView("simulation");
}

function ageDeathCurve(char) {
  const age = char.age || 20;
  if (age < 30) return 0.002;
  if (age < 50) return 0.006;
  if (age < 70) return 0.02;
  return 0.05;
}

function breakthroughEvent() {
  const char = getActiveChar() || getLineageCharacters()[0];
  if (!char) return;
  if (Math.random() > 0.5) {
    char.experience = Math.min(100, (char.experience || 20) + 15);
    try { addMerit(char, 10, "breakthrough"); } catch(e) {}
    importantToast && importantToast(char.name + " breakthrough success");
  } else {
    applyInjury(char, 1);
    importantToast && importantToast(char.name + " qi deviation");
  }
  saveState();
  switchView("simulation");
}

function formAlliance() {
  ensureSim30();
  ensureGameLayer && ensureGameLayer();
  if (!spendPatriarchAP(2, "alliance")) return;
  const n = (state.game.neighbors || [])[0];
  if (!n) return;
  state.sim30.allianceId = 0;
  n.relation = Math.max(n.relation, 2);
  simLog("Alliance formed with " + n.name);
  saveState();
  showToast("Allied: " + n.name);
  switchView("simulation");
}

function generateCasusBelli() {
  ensureSim30();
  const reasons = ["border insult", "stolen node", "broken marriage promise", "spy exposure", "tribute refused"];
  const r = reasons[Math.floor(Math.random() * reasons.length)];
  state.sim30.casusBelli.push({ reason: r, year: state.sim.year });
  if (state.sim30.casusBelli.length > 5) state.sim30.casusBelli.shift();
  showToast("Casus belli: " + r);
  simLog("Casus belli gained: " + r);
  saveState();
  switchView("simulation");
}

function startSiege() {
  ensureSim30();
  if (!state.sim30.casusBelli.length && state.mgmt.border === "Peace") return showToast("Need casus belli or hostile border");
  if (!spendPatriarchAP(2, "siege")) return;
  state.sim30.siege = { monthsLeft: 3, target: (state.game.neighbors && state.game.neighbors[0] && state.game.neighbors[0].name) || "Rival" };
  state.mgmt.border = "War";
  simLog("Siege begins against " + state.sim30.siege.target);
  saveState();
  showToast("Siege: 3 months");
  switchView("simulation");
}

function tickSiege() {
  ensureSim30();
  if (!state.sim30.siege) return;
  state.sim30.siege.monthsLeft -= 1;
  state.mgmt.food = Math.max(0, (state.mgmt.food || 50) - 6);
  state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 5);
  if (state.sim30.siege.monthsLeft <= 0) {
    const a = getLineageCharacters()[0];
    if (a && typeof simulateDetailedBattle === "function") {
      const foe = generateCharacter(a.realm || "Dou Shi");
      foe.name = state.sim30.siege.target + " Defender";
      const res = simulateDetailedBattle(a, foe);
      if (res.win) {
        state.clanWealth.gold += 40;
        state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
        // prisoner
        state.sim30.prisoners.push({ name: foe.name, year: state.sim.year });
        simLog("Siege won — prisoner taken.");
      } else {
        state.mgmt.security = Math.max(0, state.mgmt.security - 10);
        simLog("Siege failed.");
      }
    }
    state.sim30.siege = null;
  }
}

function prisonerAction(act) {
  ensureSim30();
  const p = state.sim30.prisoners[0];
  if (!p) return showToast("No prisoners");
  if (act === "ransom") {
    state.clanWealth.gold += 25;
    simLog("Prisoner ransomed +25g");
  } else if (act === "recruit") {
    const c = generateCharacter("Dou Zhe");
    c.name = p.name;
    c.alive = true;
    c.isHeir = true;
    state.characters.push(c);
    state.hierarchy.roles[c.id] = "outer";
    simLog("Prisoner recruited as Outer");
  } else {
    simLog("Prisoner executed");
  }
  state.sim30.prisoners.shift();
  saveState();
  switchView("simulation");
}

function councilBlocVote() {
  ensureCouncil && ensureCouncil();
  const voters = typeof councilVoters === "function" ? councilVoters() : [];
  const mil = voters.filter(v => (state.mgmt.deptHeads.military === v.id) || currentRankId(v) === "grand_elder");
  const alc = voters.filter(v => state.mgmt.deptHeads.alchemy === v.id || (v.education === "Alchemy"));
  alert("Council blocs:\nMilitary-leaning: " + mil.map(v => v.name).join(", ") + "\nAlchemy-leaning: " + alc.map(v => v.name).join(", ") + "\n(Auto-vote still uses loyalty)");
}

function tickUsurpation() {
  ensureSim30();
  getLineageCharacters().filter(c => currentRankId(c) === "grand_elder").forEach(c => {
    const loy = typeof loyaltyOf === "function" ? loyaltyOf(c) : 50;
    if (loy < 40) state.sim30.usurpation[c.id] = (state.sim30.usurpation[c.id] || 0) + 1;
    else state.sim30.usurpation[c.id] = Math.max(0, (state.sim30.usurpation[c.id] || 0) - 1);
    if ((state.sim30.usurpation[c.id] || 0) >= 12) {
      pushNarrative && pushNarrative(c.name + " plots usurpation!");
      state.sim30.usurpation[c.id] = 0;
      try { addLoyalty(c, -10); } catch(e) {}
    }
  });
}

function discoverArtifact() {
  ensureSim30();
  if (state.sim30.artifacts.length >= 3) return showToast("Artifact vault full (3)");
  if ((state.clanWealth.gold || 0) < 50) return showToast("Need 50 gold");
  state.clanWealth.gold -= 50;
  const arts = [
    { name: "Heaven-Sealing Stele", bonus: "security" },
    { name: "Grain-Spirit Cauldron", bonus: "food" },
    { name: "Merit Scripture", bonus: "merit" }
  ];
  const a = arts[Math.floor(Math.random() * arts.length)];
  state.sim30.artifacts.push(a);
  simLog("Artifact secured: " + a.name);
  saveState();
  showToast(a.name);
  switchView("simulation");
}

function tickArtifacts() {
  ensureSim30();
  (state.sim30.artifacts || []).forEach(a => {
    if (a.bonus === "security") state.mgmt.security = Math.min(100, state.mgmt.security + 0.5);
    if (a.bonus === "food") state.mgmt.food = Math.min(200, state.mgmt.food + 1);
    if (a.bonus === "merit") {
      const c = getLineageCharacters()[0];
      if (c) try { meritCapAdd(c, 1, "artifact"); } catch(e) {}
    }
  });
}

function setGlobalTribulation() {
  ensureSim30();
  state.sim30.globalModifier = { name: "Heavenly Tribulation Year", months: 12, meritMult: 1.2, deathMult: 1.3 };
  simLog("Heavenly tribulation hangs over the continent.");
  showToast("Tribulation year");
  saveState();
}

function writeMemoir() {
  ensureSim30();
  const text = prompt("Write a memoir line for year " + (state.sim.year || 1));
  if (!text) return;
  state.sim30.memoirs.push({ year: state.sim.year, text: text });
  try { pushNarrative("Memoir: " + text); } catch(e) {}
  saveState();
  showToast("Memoir recorded");
}

function importCustomDisasterJSON() {
  ensureSim30();
  const raw = prompt('Paste JSON array e.g. [{"id":"curse","label":"Blood Curse","morale":-15}]');
  if (!raw) return;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      state.sim30.customDisasters = arr;
      showToast("Imported " + arr.length + " custom disasters");
      saveState();
    }
  } catch(e) { showToast("Invalid JSON"); }
}

function balanceDashboard() {
  const living = getLineageCharacters();
  const avgMerit = living.length ? Math.round(living.reduce((s,c) => s + (typeof getMerit==='function'?getMerit(c):0), 0) / living.length) : 0;
  const avgLoy = living.length ? Math.round(living.reduce((s,c) => s + (typeof loyaltyOf==='function'?loyaltyOf(c):50), 0) / living.length) : 0;
  const r = state.mgmt && state.mgmt.lastMonthReport;
  alert("Balance Dashboard\nLiving: " + living.length + "\nAvg merit: " + avgMerit + "\nAvg loyalty: " + avgLoy + "\nLast income: " + (r && r.income) + "\nLast upkeep: " + (r && r.upkeep) + "\nGold: " + ((state.clanWealth&&state.clanWealth.gold)||0) + "\nClass happiness: " + JSON.stringify((state.sim30&&state.sim30.classHappiness)||{}));
}

function managementUpgradeTick() {
  // improved management: class happiness, smuggling, mercenary, artifacts, siege
  ensureSim30();
  updateClassHappiness();
  const now = (state.sim.year || 1) * 12 + (state.sim.month || 1);
  if (state.sim30.smugglingUntil > now) {
    state.clanWealth.gold += randInt(5, 15);
    if (Math.random() > 0.85) state.mgmt.security = Math.max(0, state.mgmt.security - 4);
  }
  if (state.sim30.mercenaryUntil > now) {
    state.mgmt.security = Math.min(100, state.mgmt.security + 1);
  } else if (state.sim30.mercenaryUntil && state.sim30.mercenaryUntil <= now) {
    state.sim30.mercenaryUntil = 0;
  }
  tickSiege();
  tickArtifacts();
  tickUsurpation();
  tickBuildingRepair();
  // alliance trade bonus
  if (state.sim30.allianceId != null) state.clanWealth.gold += 2;
  // global modifier
  if (state.sim30.globalModifier) {
    state.sim30.globalModifier.months -= 1;
    if (state.sim30.globalModifier.months <= 0) state.sim30.globalModifier = null;
  }
  // custom disaster roll rare
  if ((state.sim30.customDisasters || []).length && Math.random() > 0.95) {
    const d = state.sim30.customDisasters[Math.floor(Math.random() * state.sim30.customDisasters.length)];
    if (d.morale) state.mgmt.morale = Math.max(0, state.mgmt.morale + d.morale);
    simLog("Custom disaster: " + (d.label || d.id));
  }
  // happiness affects morale
  const ch = state.sim30.classHappiness || {};
  const avgH = ((ch.outer||50)+(ch.inner||50)+(ch.core||50)+(ch.elder||50))/4;
  if (avgH < 40) state.mgmt.morale = Math.max(0, state.mgmt.morale - 1);
  if (avgH > 70) state.mgmt.morale = Math.min(100, state.mgmt.morale + 0.5);
}



function trainWholeClan() {
  ensureProgression();
  const living = getLineageCharacters();
  if (!living.length) return showToast("No living members");
  if ((state.clanWealth.gold || 0) < 10) return showToast("Need 10 gold");
  state.clanWealth.gold -= 10;
  living.forEach(ch => {
    addMerit(ch, 6, "clan training");
    ch.douQi = (ch.douQi || 100) + 20;
  });
  simLog("Whole clan trained (+6 merit each, −10g)");
  saveState();
  showToast("Trained " + living.length + " members");
  switchView("simulation");
}


function autoManageEverything() {
  ensureManagement();
  try { ensureMgmtDepth(); } catch(e) {}
  try { ensureSim30(); } catch(e) {}
  try { ensureProgression(); } catch(e) {}
  if (!state.mgmt.departments) ensureManagement();

  const living = Math.max(1, getLineageCharacters().length);
  const food = state.mgmt.food || 50;
  const morale = state.mgmt.morale || 50;
  const sec = state.mgmt.security || 50;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const threat = state.globalThreat || 1;

  // --- Policies (simple rules) ---
  state.mgmt.policies.taxation = food < 35 || morale < 35 ? "low" : (gold > 10000 && morale > 60 ? "normal" : "normal");
  if (living < 80) state.mgmt.policies.recruitment = "aggressive";
  else if (living > 700) state.mgmt.policies.recruitment = "closed";
  else state.mgmt.policies.recruitment = "steady";
  if (sec < 35 || threat >= 7) state.mgmt.policies.training = "harsh";
  else if (morale < 40) state.mgmt.policies.training = "safe";
  else state.mgmt.policies.training = "balanced";
  state.mgmt.policies.openness = threat >= 7 ? "isolation" : (living > 500 ? "expansion" : "neutral");

  // --- Budgets scale with clan size (cap so upkeep doesn't explode) ---
  const scale = Math.min(2.5, 1 + living / 500);
  const deps = state.mgmt.departments;
  let plan;
  if (food < 40) plan = { economy: 28, military: 10, alchemy: 8, diplomacy: 8, intelligence: 8 };
  else if (sec < 40 || threat >= 7) plan = { military: 28, intelligence: 14, economy: 12, alchemy: 8, diplomacy: 8 };
  else if (morale < 40) plan = { diplomacy: 18, alchemy: 14, economy: 16, military: 10, intelligence: 8 };
  else plan = { economy: 16, military: 14, alchemy: 10, diplomacy: 10, intelligence: 10 };
  Object.keys(plan).forEach(k => {
    if (!deps[k]) deps[k] = { level: 1, budget: 0 };
    deps[k].budget = Math.min(40, Math.round(plan[k] * (living > 200 ? Math.min(scale, 1.6) : 1)));
  });
  // If gold income likely negative, cut all budgets
  if (gold < 30) Object.keys(deps).forEach(k => { deps[k].budget = Math.min(deps[k].budget || 0, 5); });

  // --- Heads ---
  try { autoAssignBestHeads(); } catch(e) {}

  // --- Orders: unique max 3 ---
  const orders = [];
  const push = (o) => { if (!orders.includes(o) && orders.length < 3) orders.push(o); };
  if (food < 60) push("stockpile_food");
  if (sec < 60) push("patrol");
  if (morale < 60) push("festival");
  if (orders.length < 3) push("expand_trade");
  if (orders.length < 3) push("closed_door");
  state.mgmt.monthlyOrders = orders;

  if (threat < 6) state.mgmt.warFooting = false;
  else if (threat >= 8) state.mgmt.warFooting = true;

  // --- Patriarch ---
  try { repairPatriarch({ reason: "auto-manage" }); } catch(e) {}

  state.mgmt.autoManage = true;
  try { ensureFullSim(); if (state.fullSim.phase === "setup") state.fullSim.phase = "reign"; } catch(e) {}
  if (state.mgmt.alerts) {
    state.mgmt.alerts = state.mgmt.alerts.filter(a => !(a.msg || "").includes("No Patriarch"));
  }

  // Emergency stabilize if meters look stuck at defaults while rich/large
  if (living > 20 && food <= 55) state.mgmt.food = Math.min(120, food + 15);
  if (living > 20 && morale <= 65) state.mgmt.morale = Math.min(90, morale + 10);
  if (living > 20 && sec <= 55) state.mgmt.security = Math.min(90, sec + 15);
  // Huge clan food floor — pop burns food
  if (living >= 200) state.mgmt.food = Math.max(state.mgmt.food, 40);

  let patName = "?";
  try {
    const p = typeof findLivingPatriarch === "function" ? findLivingPatriarch() : (typeof findLivingPatriarchSafe === "function" ? findLivingPatriarchSafe() : null);
    patName = (p && p.name) || "none";
  } catch(e) {}
  simLog("AUTO-MANAGE: tax=" + state.mgmt.policies.taxation + " recruit=" + state.mgmt.policies.recruitment +
    " budgets set · orders=" + orders.join(",") + " · patriarch=" + patName);
  saveState();
  showToast("Auto-Manage ON — running simple governance");
  switchView("simulation");
}

function autoManageMonthAssist() {
  if (!state.mgmt || !state.mgmt.autoManage) return;
  try {
    const living = Math.max(1, getLineageCharacters().length);
    const food = state.mgmt.food || 0;
    const sec = state.mgmt.security || 0;
    const morale = state.mgmt.morale || 0;
    const gold = (state.clanWealth && state.clanWealth.gold) || 0;

    // Re-queue orders after month consumed them
    const orders = Array.isArray(state.mgmt.monthlyOrders) ? state.mgmt.monthlyOrders.slice() : [];
    const push = (o) => { if (!orders.includes(o) && orders.length < 3) orders.push(o); };
    if (food < 50) push("stockpile_food");
    if (sec < 50) push("patrol");
    if (morale < 50) push("festival");
    if (orders.length < 2) push("expand_trade");
    state.mgmt.monthlyOrders = orders;

    // Spend gold to prop critical meters (large clans)
    if (food < 30 && gold > 80) {
      state.clanWealth.gold -= 30;
      state.mgmt.food = Math.min(200, food + 35);
      simLog("Auto-manage: bought grain (−30g)");
    }
    if (sec < 30 && gold > 60) {
      state.clanWealth.gold -= 20;
      state.mgmt.security = Math.min(100, sec + 20);
      simLog("Auto-manage: hired patrol (−20g)");
    }
    if (morale < 30 && gold > 50) {
      state.clanWealth.gold -= 15;
      state.mgmt.morale = Math.min(100, morale + 15);
      simLog("Auto-manage: festival spend (−15g)");
    }

    // Scale economy budget if food is collapsing under population
    if (food < 40 && state.mgmt.departments && state.mgmt.departments.economy) {
      state.mgmt.departments.economy.budget = Math.min(40, (state.mgmt.departments.economy.budget || 10) + 5);
    }
    if (sec < 40 && state.mgmt.departments && state.mgmt.departments.military) {
      state.mgmt.departments.military.budget = Math.min(40, (state.mgmt.departments.military.budget || 10) + 5);
    }

    // Don't leave patriarch missing
    const hasPat = getLineageCharacters().some(c => currentRankId(c) === "patriarch" || c.isFounder);
    if (!hasPat) {
      const top = getLineageCharacters().slice().sort((a,b)=>(typeof cultivationScore==='function'?cultivationScore(b)-cultivationScore(a):0))[0];
      if (top) {
        state.hierarchy.roles[top.id] = "patriarch";
        top.isFounder = true;
        state.lineage.founderId = top.id;
        simLog("Auto-manage: appointed Patriarch " + top.name);
      }
    }
  } catch(e) { console && console.error && console.error("autoManageMonthAssist", e); }
}



// ===== PATRIARCH AUTO-REPAIR =====
function findLivingPatriarch() {
  const living = typeof getLineageCharacters === "function" ? getLineageCharacters() : [];
  return living.find(c => currentRankId(c) === "patriarch")
    || living.find(c => typeof isPatriarch === "function" && isPatriarch(c))
    || living.find(c => c.isFounder && c.alive !== false)
    || null;
}

function pickBestPatriarchCandidate() {
  const living = getLineageCharacters().slice();
  if (!living.length) return null;
  // Prefer designated successor, then GE/Elder by cultivation + merit + loyalty
  const des = state.succession && state.succession.designatedId
    ? living.find(c => c.id === state.succession.designatedId)
    : null;
  if (des && currentRankId(des) !== "ancestor") return des;

  const score = (c) => {
    let s = typeof cultivationScore === "function" ? cultivationScore(c) : 0;
    s += (typeof getMerit === "function" ? getMerit(c) : 0) * 0.5;
    s += (typeof loyaltyOf === "function" ? loyaltyOf(c) : 50) * 0.3;
    const r = currentRankId(c);
    if (r === "grand_elder") s += 40;
    if (r === "elder") s += 25;
    if (r === "core") s += 10;
    if (r === "ancestor") s -= 80; // ancestor stays ceremonial
    if (c.isFounder) s += 15;
    if (c.injured) s -= 20 * (c.injured || 0);
    return s;
  };
  living.sort((a, b) => score(b) - score(a));
  return living[0] || null;
}

function installPatriarch(char, reason) {
  if (!char || char.alive === false) return false;
  ensureHierarchy();
  // Demote other patriarchs
  getLineageCharacters().forEach(c => {
    if (c.id !== char.id && state.hierarchy.roles[c.id] === "patriarch") {
      state.hierarchy.roles[c.id] = "grand_elder";
      c.isFounder = false;
    }
  });
  state.hierarchy.roles[char.id] = "patriarch";
  char.isFounder = true;
  char.alive = true;
  if (!state.lineage.founderId) state.lineage.founderId = char.id;
  // keep founderId stable if old founder dead — optional update
  const old = (state.characters || []).find(c => c.id === state.lineage.founderId);
  if (!old || old.alive === false) state.lineage.founderId = char.id;

  if (state.succession) state.succession.designatedId = state.succession.designatedId || char.id;
  try { if (char.isRegent) char.isRegent = false; } catch(e) {}
  try { simLog("Patriarch auto-repair: " + char.name + (reason ? " (" + reason + ")" : "")); } catch(e) {}
  try { pushNarrative && pushNarrative(char.name + " takes the Patriarch seat" + (reason ? " — " + reason : "")); } catch(e) {}
  return true;
}

function repairPatriarch(opts) {
  opts = opts || {};
  ensureHierarchy();
  ensureSim();
  const living = getLineageCharacters();
  if (!living.length) return { ok: false, reason: "no living members" };

  let pat = findLivingPatriarch();
  // Role mismatch: isFounder but not ranked patriarch
  if (!pat) {
    const founder = living.find(c => c.isFounder) || living.find(c => c.id === state.lineage.founderId);
    if (founder && founder.alive !== false) {
      installPatriarch(founder, "founder restored to seat");
      pat = founder;
    }
  }

  // Multiple patriarchs — keep strongest
  const pats = living.filter(c => currentRankId(c) === "patriarch");
  if (pats.length > 1) {
    pats.sort((a, b) => (typeof cultivationScore === "function" ? cultivationScore(b) - cultivationScore(a) : 0));
    const keep = pats[0];
    pats.slice(1).forEach(c => {
      state.hierarchy.roles[c.id] = "grand_elder";
      c.isFounder = false;
    });
    installPatriarch(keep, "duplicate seats resolved");
    pat = keep;
  }

  // None at all
  if (!findLivingPatriarch()) {
    const cand = pickBestPatriarchCandidate();
    if (!cand) return { ok: false, reason: "no candidate" };
    installPatriarch(cand, opts.reason || "auto-appointed");
    pat = cand;
  }

  // Clear false alerts
  if (state.mgmt && state.mgmt.alerts) {
    state.mgmt.alerts = state.mgmt.alerts.filter(a => !(a.msg || "").includes("No Patriarch"));
  }
  try { if (state.fullSim && state.fullSim.phase === "setup") state.fullSim.phase = "reign"; } catch(e) {}
  return { ok: true, patriarch: findLivingPatriarch() };
}

function patriarchRepairTick() {
  try {
    const living = getLineageCharacters();
    if (!living.length) return;
    const pat = findLivingPatriarch();
    if (!pat) {
      const res = repairPatriarch({ reason: "seat empty" });
      if (res.ok && res.patriarch) {
        try { showToast("Patriarch repaired: " + res.patriarch.name); } catch(e) {}
      }
    } else {
      // Ensure role string is correct
      if (state.hierarchy.roles[pat.id] !== "patriarch") {
        state.hierarchy.roles[pat.id] = "patriarch";
      }
    }
  } catch(e) {
    console && console.error && console.error("patriarchRepairTick", e);
  }
}



// ===== GE / LEADERSHIP / AUTO-MANAGE POLISH (16) =====
function unifyRankCaps() {
  ensureSimDepth && ensureSimDepth();
  if (!state.simDepth) state.simDepth = {};
  state.simDepth.rankCaps = Object.assign(
    { ancestor: 1, patriarch: 1, grand_elder: 5, elder: 13, core: 9999, inner: 9999, outer: 9999 },
    state.simDepth.rankCaps || {}
  );
  state.simDepth.rankCaps.grand_elder = 5;
  state.simDepth.rankCaps.elder = 13;
  return state.simDepth.rankCaps;
}

function demotePatriarchToGE(char) {
  if (!char) return;
  unifyRankCaps();
  if (typeof seatAvailable === "function" && seatAvailable("grand_elder")) {
    state.hierarchy.roles[char.id] = "grand_elder";
  } else if (typeof seatAvailable === "function" && seatAvailable("elder")) {
    state.hierarchy.roles[char.id] = "elder";
  } else {
    state.hierarchy.roles[char.id] = "core";
  }
  char.isFounder = false;
}

function geAuraTick() {
  const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder");
  if (!ges.length) return;
  const aura = Math.min(3, ges.length);
  // small clan-wide loyalty / security
  getLineageCharacters().forEach(c => {
    if (Math.random() > 0.85) {
      try { addLoyalty(c, 0.2 * aura); } catch(e) {}
    }
  });
  if (state.mgmt) state.mgmt.security = Math.min(100, (state.mgmt.security || 50) + aura * 0.15);
}

function renderGrandElderHall() {
  unifyRankCaps();
  const caps = state.simDepth.rankCaps;
  const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder");
  const empty = Math.max(0, (caps.grand_elder || 5) - ges.length);
  const reg = state.regent || {};
  const seats = ges.map((c, i) =>
    `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem;">
      <strong style="color:var(--gold);">Seat ${i+1}</strong> — ${c.name}
      · ${c.star||''} ${c.realm||''} · Merit ${typeof getMerit==='function'?getMerit(c):0}
      · Loy ${typeof loyaltyOf==='function'?Math.round(loyaltyOf(c)):50}
    </div>`
  ).join("");
  const empties = empty ? `<p style="color:var(--text-dim);font-size:0.82rem;">Empty GE seats: ${empty}</p>` : "";
  return `<div class="card" style="margin-bottom:12px;padding:12px;">
    <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Grand Elder Hall (${ges.length}/${caps.grand_elder||5})</div>
    ${seats || "<p style='color:var(--text-dim);'>No Grand Elders seated.</p>"}
    ${empties}
    <p style="color:var(--text-muted);font-size:0.8rem;margin-top:6px;">Regent war endorsements: ${(reg.geSupport||[]).length} · Aura active when GE present</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
      <button class="btn-ghost" onclick="assignHierarchyRankSafe('grand_elder')">Seat Selected as GE</button>
      <button class="btn-ghost" onclick="regentEndorseWarPowers()">GE: Endorse War Powers</button>
      <button class="btn-ghost" onclick="geFactionSplitEvent()">GE Faction Split Event</button>
      <button class="btn-ghost" onclick="seatChallengeGE()">Elder: Contest GE Seat</button>
    </div>
  </div>`;
}

function leadershipPipelineOnPatriarchDeath(char) {
  // Death → Regent → (later) Council → Patriarch
  if (!char) return;
  if (state.hierarchy.roles[char.id] === "patriarch") {
    delete state.hierarchy.roles[char.id];
    char.isFounder = false;
  }
  try { activateRegencyIfNeeded(); } catch(e) {}
  try {
    if (typeof openSuccessionCouncil === "function" && state.council && !state.council.discussionOpen) {
      // soft open flag for player
      pushAlertDeduped && pushAlertDeduped("Leadership pipeline: Regent active — open Succession Council");
    }
  } catch(e) {}
  // Do NOT instant repair patriarch — regency first (repair only if no regent)
  try {
    ensureRegent();
    if (!state.regent.id && typeof repairPatriarch === "function") {
      repairPatriarch({ reason: "no regent fallback" });
    }
  } catch(e) {}
}

function renderRegentScorecard() {
  try { ensureRegent(); } catch(e) { return ""; }
  const r = state.regent;
  if (!r || !r.id) return "";
  const char = (state.characters || []).find(c => c.id === r.id);
  if (!char) return "";
  const years = (state.sim.year || 1) - (r.appointedYear || state.sim.year || 1);
  const left = Math.max(0, (r.termYears || 5) - years);
  return `<div class="card" style="margin-bottom:10px;padding:10px;border-color:var(--gold);">
    <div style="color:var(--gold);font-weight:600;">Regent Scorecard — Acting Patriarch</div>
    <p style="font-size:0.85rem;color:var(--text-muted);">
      ${char.name} holds the seat as <strong>Acting Patriarch (Regent)</strong>.
      Term: ${years}/${r.termYears||5} (${left}y left) · War powers: ${r.powers.warEconomy?"YES":"NO"} ·
      GE endorsements: ${(r.geSupport||[]).length} · Overstay risk: ${years>=(r.termYears||5)?"HIGH":"low"}
    </p>
  </div>`;
}

function setAutoManageMode(mode) {
  ensureManagement();
  state.mgmt.autoMode = mode; // survival | balanced | expansion
  state.mgmt.autoManage = true;
  if (mode === "survival") {
    state.mgmt.policies.taxation = "low";
    state.mgmt.policies.recruitment = "closed";
    state.mgmt.policies.training = "safe";
    state.mgmt.policies.openness = "isolation";
  } else if (mode === "expansion") {
    state.mgmt.policies.taxation = "normal";
    state.mgmt.policies.recruitment = "aggressive";
    state.mgmt.policies.training = "balanced";
    state.mgmt.policies.openness = "expansion";
  } else {
    state.mgmt.policies.taxation = "normal";
    state.mgmt.policies.recruitment = "steady";
    state.mgmt.policies.training = "balanced";
    state.mgmt.policies.openness = "neutral";
  }
  try { autoManageEverything(); } catch(e) {}
  state.mgmt.autoMode = mode;
  saveState();
  showToast("Auto-manage mode: " + mode);
  switchView("simulation");
}

function foodNeedProduceReport() {
  ensureManagement();
  const living = getLineageCharacters();
  let need = 0;
  living.forEach(ch => {
    try { need += typeof classFoodCost === "function" ? classFoodCost(ch) * 0.35 : 0.5; } catch(e) { need += 0.5; }
  });
  const eco = (state.mgmt.departments && state.mgmt.departments.economy) || { level: 1, budget: 0 };
  let produce = 4 + (eco.level || 1) * 2 + Math.floor((eco.budget || 0) / 5);
  if (living.length > 50) produce += Math.floor((eco.budget || 0) / 3);
  if (state.mgmt.autoManage && living.length > 100) produce += Math.min(20, Math.floor(living.length / 50));
  return { need: Math.round(need * 10) / 10, produce: Math.round(produce * 10) / 10, living: living.length };
}

function uniqueMonthlyOrders() {
  if (!state.mgmt || !state.mgmt.monthlyOrders) return [];
  const seen = [];
  state.mgmt.monthlyOrders.forEach(o => { if (!seen.includes(o)) seen.push(o); });
  state.mgmt.monthlyOrders = seen.slice(0, 3);
  return state.mgmt.monthlyOrders;
}

function renderCriticalBanner() {
  ensureManagement();
  const f = state.mgmt.food || 0, s = state.mgmt.security || 0, m = state.mgmt.morale || 0;
  const parts = [];
  if (f < 30) parts.push("Food critical (" + f + ")");
  if (s < 30) parts.push("Security critical (" + s + ")");
  if (m < 30) parts.push("Morale critical (" + m + ")");
  if (!parts.length) return "";
  return `<div style="margin-bottom:10px;padding:10px 14px;border-radius:8px;background:rgba(180,40,40,0.2);border:1px solid #a33;color:#f8c;">
    <strong>⚠ Clan crisis:</strong> ${parts.join(" · ")}
  </div>`;
}

function renderRankSummary() {
  const counts = {};
  getLineageCharacters().forEach(c => {
    const r = currentRankId(c);
    counts[r] = (counts[r] || 0) + 1;
  });
  const order = ["ancestor","patriarch","grand_elder","elder","core","inner","outer"];
  return `<div class="card" style="margin-bottom:10px;padding:10px;">
    <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Rank Summary</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.85rem;color:var(--text-muted);">
      ${order.map(r => counts[r] ? `<span>${r}: <strong style="color:var(--gold);">${counts[r]}</strong></span>` : "").join(" ")}
    </div>
  </div>`;
}

function topMeritMembers(n) {
  n = n || 20;
  return getLineageCharacters().slice().sort((a,b) => (getMerit(b)||0) - (getMerit(a)||0)).slice(0, n);
}

function geFactionSplitEvent() {
  const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder");
  if (ges.length < 2) return showToast("Need at least 2 Grand Elders");
  state.sim.pendingChoice = {
    event: "Grand Elder faction split: Military wing vs Alchemy wing demand budget priority.",
    options: [
      { label: "Fund Military wing", effect: "ge_split_mil" },
      { label: "Fund Alchemy wing", effect: "ge_split_alc" },
      { label: "Balance both (−gold)", effect: "ge_split_bal" }
    ]
  };
  state.sim.running = false;
  if (typeof _simTimer !== "undefined" && _simTimer) { clearInterval(_simTimer); _simTimer = null; }
  showToast("GE faction split");
  switchView("simulation");
}

function resolveGeSplit(effect) {
  ensureManagement();
  if (effect === "ge_split_mil") {
    state.mgmt.departments.military.budget = Math.min(40, (state.mgmt.departments.military.budget || 10) + 12);
    state.mgmt.departments.alchemy.budget = Math.max(0, (state.mgmt.departments.alchemy.budget || 10) - 4);
  } else if (effect === "ge_split_alc") {
    state.mgmt.departments.alchemy.budget = Math.min(40, (state.mgmt.departments.alchemy.budget || 10) + 12);
    state.mgmt.departments.military.budget = Math.max(0, (state.mgmt.departments.military.budget || 10) - 4);
  } else {
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 25);
    state.mgmt.departments.military.budget = Math.min(40, (state.mgmt.departments.military.budget || 10) + 5);
    state.mgmt.departments.alchemy.budget = Math.min(40, (state.mgmt.departments.alchemy.budget || 10) + 5);
  }
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function seatChallengeGE() {
  const challenger = getActiveChar();
  if (!challenger || currentRankId(challenger) !== "elder") return showToast("Select an Elder to contest");
  if ((getMerit(challenger) || 0) < 40) return showToast("Need 40 merit to contest");
  if (!seatAvailable("grand_elder")) {
    // challenge weakest GE
    const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder")
      .sort((a,b) => (getMerit(a)||0) - (getMerit(b)||0));
    if (!ges.length) return showToast("No GE to challenge");
    const target = ges[0];
    if ((getMerit(challenger) || 0) > (getMerit(target) || 0)) {
      state.hierarchy.roles[target.id] = "elder";
      state.hierarchy.roles[challenger.id] = "grand_elder";
      addMerit(challenger, -15, "seat challenge");
      simLog(challenger.name + " took Grand Elder seat from " + target.name);
      showToast("Challenge won");
    } else {
      addMerit(challenger, -10, "failed challenge");
      showToast("Challenge failed");
    }
  } else {
    state.hierarchy.roles[challenger.id] = "grand_elder";
    addMerit(challenger, -10, "seat claim");
    showToast("Claimed empty GE seat");
  }
  saveState();
  switchView("simulation");
}

function abdicatePatriarch() {
  const char = getActiveChar();
  if (!char || currentRankId(char) !== "patriarch") return showToast("Select the Patriarch");
  if (!confirm("Abdicate? This forces Regency.")) return;
  demotePatriarchToGE(char);
  try { activateRegencyIfNeeded(); } catch(e) {}
  simLog(char.name + " abdicated — Regency begins.");
  saveState();
  showToast("Abdicated → Regency");
  switchView("simulation");
}



// ===== CONNECTED SIM SYSTEMS =====
function ensureSimConnect() {
  if (!state.simConnect) {
    state.simConnect = {
      succession: null, // { stage, monthsLeft, regentId, candidateId }
      pauseReason: null,
      memberSearch: "",
      geOffices: {}, // geId -> office
      lastYearReport: null
    };
  }
  return state.simConnect;
}


function recordPauseReasonClear() {
  ensureSimConnect();
  if (state.sim.running) state.simConnect.pauseReason = null;
}

function renderWhyPaused() {
  ensureSimConnect();
  if (state.sim.running) return "";
  const r = state.simConnect.pauseReason;
  if (!r && !state.sim.pendingChoice) return "";
  const msg = state.sim.pendingChoice ? ("event: " + (state.sim.pendingChoice.event || "choice").slice(0, 60)) : r;
  if (!msg) return "";
  return `<div style="margin-bottom:8px;padding:8px 12px;border-radius:8px;background:rgba(180,120,40,0.15);border:1px solid var(--gold);font-size:0.85rem;color:var(--text-muted);">
    <strong style="color:var(--gold);">Why paused:</strong> ${msg}
  </div>`;
}

function startSuccessionCrisisScript() {
  ensureSimConnect();
  ensureRegent && ensureRegent();
  const reg = state.regent && state.regent.id ? (state.characters || []).find(c => c.id === state.regent.id) : null;
  if (!reg && typeof activateRegencyIfNeeded === "function") activateRegencyIfNeeded();
  const reg2 = state.regent && state.regent.id ? (state.characters || []).find(c => c.id === state.regent.id) : null;
  const cand = typeof pickBestPatriarchCandidate === "function" ? pickBestPatriarchCandidate() : null;
  state.simConnect.succession = {
    stage: "regency", // regency → campaign → council → coronation
    monthsLeft: 4,
    regentId: reg2 && reg2.id,
    candidateId: cand && cand.id
  };
  pushAlertDeduped && pushAlertDeduped("Succession crisis begins");
  simLog("Succession crisis script started (4+ months).");
  showToast("Succession crisis started");
  switchView("simulation");
}

function successionCrisisTick() {
  ensureSimConnect();
  const sc = state.simConnect.succession;
  if (!sc) return;
  sc.monthsLeft = (sc.monthsLeft || 0) - 1;
  if (sc.stage === "regency" && sc.monthsLeft <= 2) {
    sc.stage = "campaign";
    simLog("Succession: factions campaign for the seat.");
  }
  if (sc.stage === "campaign" && sc.monthsLeft <= 1) {
    sc.stage = "council";
    try { if (typeof openSuccessionCouncil === "function") openSuccessionCouncil(); } catch(e) {}
    simLog("Succession: council convenes.");
  }
  if (sc.stage === "council" && sc.monthsLeft <= 0) {
    sc.stage = "coronation";
    try {
      if (typeof regentHandOffToPatriarch === "function") regentHandOffToPatriarch();
      else if (typeof repairPatriarch === "function") repairPatriarch({ reason: "coronation" });
    } catch(e) {}
    simLog("Succession: coronation complete.");
    state.simConnect.succession = null;
    showToast("Succession resolved");
  }
}

function renderFoodCrisisUI() {
  if (typeof foodNeedProduceReport !== "function") return "";
  const fp = foodNeedProduceReport();
  const food = (state.mgmt && state.mgmt.food) || 0;
  const deficit = fp.need > fp.produce;
  const crit = food < 35 || deficit;
  if (!crit && food >= 50) {
    return `<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0;">Food need ~${fp.need}/mo · produce ~${fp.produce}/mo</div>`;
  }
  return `<div class="card" style="margin-bottom:10px;padding:10px;border-color:${food<30?'#a33':'var(--gold)'};">
    <div style="color:var(--gold);font-weight:600;">Food balance</div>
    <div style="font-size:0.85rem;color:var(--text-muted);margin:4px 0;">
      Stock <strong>${food}</strong> · Need <strong>${fp.need}</strong>/mo · Produce <strong>${fp.produce}</strong>/mo
      ${deficit ? " · <span style='color:#f88;'>DEFICIT</span>" : ""}
    </div>
    <div style="height:8px;background:#222;border-radius:4px;overflow:hidden;margin:6px 0;">
      <div style="height:100%;width:${Math.min(100, Math.round((fp.produce/Math.max(fp.need,1))*100))}%;background:${deficit?'#c44':'#6bcf8e'};"></div>
    </div>
    <button class="btn-primary" onclick="buyGrain()">Buy Grain (−30g, +35 food)</button>
  </div>`;
}

function buyGrain() {
  ensureManagement();
  if ((state.clanWealth.gold || 0) < 30) return showToast("Need 30 gold");
  state.clanWealth.gold -= 30;
  state.mgmt.food = Math.min(200, (state.mgmt.food || 0) + 35);
  simLog("Bought grain (−30g, +35 food)");
  saveState();
  showToast("Grain bought");
  switchView("simulation");
}

function geOfficeTick() {
  ensureSimConnect();
  const offices = ["war", "alchemy", "diplomacy", "law", "intel"];
  const ges = getLineageCharacters().filter(c => currentRankId(c) === "grand_elder");
  // assign free offices
  const used = new Set(Object.values(state.simConnect.geOffices || {}));
  ges.forEach(g => {
    if (!state.simConnect.geOffices[g.id]) {
      const free = offices.find(o => !used.has(o));
      if (free) {
        state.simConnect.geOffices[g.id] = free;
        used.add(free);
      }
    }
  });
  // clear dead
  Object.keys(state.simConnect.geOffices).forEach(id => {
    if (!ges.find(g => g.id === id)) delete state.simConnect.geOffices[id];
  });
  // passives
  if (!state.mgmt) return;
  Object.keys(state.simConnect.geOffices).forEach(id => {
    const o = state.simConnect.geOffices[id];
    if (o === "war") state.mgmt.security = Math.min(100, (state.mgmt.security || 50) + 0.4);
    if (o === "alchemy") state.mgmt.morale = Math.min(100, (state.mgmt.morale || 50) + 0.3);
    if (o === "diplomacy") {
      if (Math.random() > 0.92) state.clanWealth.renown = (state.clanWealth.renown || 1) + 1;
    }
    if (o === "law") {
      getLineageCharacters().slice(0, 5).forEach(ch => {
        try { if ((loyaltyOf(ch) || 50) < 40) addLoyalty(ch, 1); } catch(e) {}
      });
    }
    if (o === "intel") {
      if ((state.globalThreat || 1) > 2 && Math.random() > 0.9) state.globalThreat -= 1;
    }
  });
}

function popSoftCapTick() {
  const living = getLineageCharacters().length;
  if (living < 500 || !state.mgmt) return;
  const food = state.mgmt.food || 0;
  const sec = state.mgmt.security || 0;
  if (food < 50 || sec < 50) {
    state.mgmt.morale = Math.max(0, (state.mgmt.morale || 50) - (living > 800 ? 2 : 1));
    if (Math.random() > 0.85) {
      simLog("Population pressure: unrest among the ranks (living " + living + ").");
      try { pushAlertDeduped && pushAlertDeduped("Pop pressure unrest"); } catch(e) {}
    }
  }
}

function incomeScaleTick() {
  // Called from management path ideally; here a soft top-up for large clans
  if (!state.clanWealth || !state.mgmt) return;
  const living = getLineageCharacters().length;
  if (living < 30) return;
  // scale passive income with living so stipends don't only bleed
  const bonus = Math.floor(living / 25) + Math.floor(((state.mgmt.departments && state.mgmt.departments.economy && state.mgmt.departments.economy.level) || 1));
  if (state.sim.month % 3 === 0) {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + bonus;
  }
}

function yearReportModal() {
  ensureSimConnect();
  const living = getLineageCharacters().length;
  const gold = (state.clanWealth && state.clanWealth.gold) || 0;
  const r = state.mgmt && state.mgmt.lastMonthReport;
  const fp = typeof foodNeedProduceReport === "function" ? foodNeedProduceReport() : {};
  const lines = [
    "Year " + (state.sim.year || 1) + " Report",
    "Living: " + living,
    "Gold: " + gold,
    "Food: " + ((state.mgmt && state.mgmt.food) || 0) + " (need " + (fp.need || "?") + " / prod " + (fp.produce || "?") + ")",
    "Morale: " + Math.round((state.mgmt && state.mgmt.morale) || 0),
    "Security: " + Math.round((state.mgmt && state.mgmt.security) || 0),
    r ? ("Last month Δgold " + r.goldDelta + " income " + r.income + " upkeep " + r.upkeep) : "",
    "Advice: " + (fp.need > (fp.produce || 0) ? "Raise Economy budget / Buy grain" : ((state.mgmt && state.mgmt.security) < 40 ? "Patrol / Military" : "Steady course"))
  ];
  state.simConnect.lastYearReport = lines.join("\n");
  try { alert(lines.filter(Boolean).join("\n")); } catch(e) {}
}

function setMemberSearch(q) {
  ensureSimConnect();
  state.simConnect.memberSearch = (q || "").trim().toLowerCase();
  switchView("simulation");
}

function filterMembersBySearch(list) {
  ensureSimConnect();
  const q = state.simConnect.memberSearch;
  if (!q) return list;
  return list.filter(c => (c.name || "").toLowerCase().indexOf(q) >= 0);
}

function seasonalFestivalAuto() {
  if (!state.mgmt) return;
  if ((state.mgmt.morale || 0) < 40 && (state.clanWealth.gold || 0) > 50) {
    if (Math.random() > 0.7) {
      state.clanWealth.gold -= 12;
      state.mgmt.morale = Math.min(100, (state.mgmt.morale || 0) + 8);
      simLog("Auto festival held to lift morale (−12g).");
    }
  }
}

function rivalWarCheck() {
  try {
    ensureGameLayer && ensureGameLayer();
    const ns = (state.game && state.game.neighbors) || [];
    const hostile = ns.filter(n => (n.relation || 0) <= -3);
    if (hostile.length && (state.globalThreat || 1) >= 6 && Math.random() > 0.92) {
      if (state.mgmt) state.mgmt.border = "War";
      simLog("Rival war declared by " + hostile[0].name + "!");
      pushAlertDeduped && pushAlertDeduped("Rival war: " + hostile[0].name);
    }
  } catch(e) {}
}

function orderPowerScale(base) {
  const living = getLineageCharacters().length || 1;
  if (living < 50) return base;
  return base + Math.floor(living / 80);
}

function breakthroughChanceMult(char) {
  // higher realms rarer breakthroughs
  try {
    const ranks = DOU_QI_RANKS.map(r => r.name);
    const idx = ranks.indexOf(char.realm);
    if (idx < 0) return 1;
    if (idx >= 8) return 0.35;
    if (idx >= 5) return 0.55;
    if (idx >= 3) return 0.75;
    return 1;
  } catch(e) { return 1; }
}



// ===== WORLD ↔ SIM BRIDGE =====
function ensureWorldSim() {
  if (!state.worldSim) {
    state.worldSim = {
      homeRegion: "Outerland",
      controlledRegions: [],
      boundFlameId: null,
      boundBeastIds: [],
      alliedSectIds: [],
      rivalSectIds: [],
      alchemyLevel: 1,
      lastWorldEvent: null,
      mapInfluence: { Outerland: 10, Innerland: 0, Mainland: 0, "Central Land": 0 }
    };
  }
  return state.worldSim;
}

function setHomeRegion(region) {
  ensureWorldSim();
  state.worldSim.homeRegion = region;
  simLog("Clan home region set to " + region);
  saveState();
  showToast("Home: " + region);
  switchView("simulation");
}

function regionModifiers(region) {
  const map = {
    "Outerland": { food: 2, threat: 0, gold: 1, flameChance: 0.02, beastChance: 0.04 },
    "Innerland": { food: 1, threat: 1, gold: 2, flameChance: 0.03, beastChance: 0.05 },
    "Mainland": { food: 0, threat: 2, gold: 3, flameChance: 0.04, beastChance: 0.06 },
    "Central Land": { food: -1, threat: 3, gold: 4, flameChance: 0.06, beastChance: 0.07 }
  };
  return map[region] || map.Outerland;
}

function ensureWorldContent() {
  if (!state.world) {
    try { state.world = generateWorld(); } catch(e) {}
  }
  if (!state.flames) state.flames = [];
  if (!state.beasts) state.beasts = [];
  if (!state.sects) state.sects = [];
  if (!state.clans) state.clans = [];
  if (!state.pills) state.pills = [];
  if (!state.techniques) state.techniques = [];
  // seed minimal factions if empty
  if (!state.sects.length) {
    try {
      for (let i = 0; i < 3; i++) {
        const s = {
          id: "sect_" + Date.now() + "_" + i,
          name: (typeof generateName === "function" ? generateName().split(" ")[0] : "Azure") + " Sect",
          rank: ["Small Sect", "Mid Sect", "Large Sect"][i % 3],
          power: 30 + i * 20,
          relation: 0
        };
        state.sects.push(s);
      }
    } catch(e) {}
  }
  if (!state.clans.length) {
    try {
      state.clans.push({
        id: "clan_world_1",
        name: (state.lineage && state.lineage.bloodName) || "Player Clan",
        power: 40,
        isPlayer: true
      });
    } catch(e) {}
  }
}

function discoverFlameForSim() {
  ensureWorldContent();
  let flame;
  try {
    if (typeof generateFlame === "function") flame = generateFlame();
  } catch(e) {}
  if (!flame) {
    const names = ["Black Sun Burning", "Sea Heart Flame", "Bone Chilling Flame", "Nine Serene Wind", "Golden Emperor"];
    flame = {
      id: "flame_" + Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      rank: randInt(10, 22),
      power: randInt(40, 90)
    };
  }
  state.flames.push(flame);
  ensureWorldSim();
  if (!state.worldSim.boundFlameId) state.worldSim.boundFlameId = flame.id;
  simLog("Heavenly Flame discovered: " + flame.name);
  try { pushNarrative && pushNarrative("Flame omen: " + flame.name); } catch(e) {}
  return flame;
}

function encounterBeastForSim() {
  ensureWorldContent();
  let beast;
  try {
    if (typeof generateBeast === "function") beast = generateBeast();
  } catch(e) {}
  if (!beast) {
    const names = ["Flame Leopard", "Sky-Swallowing Python", "Rockback Ape", "Wind Raven", "Thunder Rhino"];
    beast = {
      id: "beast_" + Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      rank: randInt(1, 7) + " Rank",
      power: randInt(20, 80)
    };
  }
  state.beasts.push(beast);
  ensureWorldSim();
  state.worldSim.boundBeastIds = (state.worldSim.boundBeastIds || []).slice(-4);
  state.worldSim.boundBeastIds.push(beast.id);
  // security or food effect
  if (state.mgmt) {
    if (Math.random() > 0.5) state.mgmt.security = Math.max(0, state.mgmt.security - 3);
    else state.mgmt.food = Math.min(200, state.mgmt.food + 4);
  }
  simLog("Magical beast encounter: " + beast.name);
  return beast;
}

function alchemySimTick() {
  ensureWorldSim();
  ensureWorldContent();
  if (!state.mgmt) return;
  const heads = state.mgmt.deptHeads || {};
  const alcLv = (state.mgmt.departments && state.mgmt.departments.alchemy && state.mgmt.departments.alchemy.level) || 1;
  const hasFlame = !!(state.worldSim.boundFlameId && state.flames.find(f => f.id === state.worldSim.boundFlameId));
  // produce pills / herbs value
  let pills = Math.floor(alcLv / 2) + (hasFlame ? 2 : 0) + (heads.alchemy ? 1 : 0);
  if (pills > 0) {
    state.clanWealth.herbs = (state.clanWealth.herbs || 0) + Math.max(0, pills - 1);
    // convert some to gold/morale
    if (Math.random() > 0.6) {
      state.clanWealth.gold = (state.clanWealth.gold || 0) + pills * 2;
      state.mgmt.morale = Math.min(100, (state.mgmt.morale || 50) + 0.5);
    }
    // rare pill entry
    if (Math.random() > 0.9) {
      state.pills = state.pills || [];
      state.pills.push({ name: "Clan-refined Pill", year: state.sim.year, power: alcLv + (hasFlame ? 3 : 0) });
      if (state.pills.length > 30) state.pills.shift();
    }
  }
  // flame boosts merit slightly for focus/head
  if (hasFlame) {
    const headId = heads.alchemy;
    const ch = headId ? state.characters.find(x => x.id === headId) : (typeof getFocusChar === "function" ? getFocusChar() : null);
    if (ch) try { meritCapAdd(ch, 1, "flame alchemy"); } catch(e) {}
  }
}

function worldFactionTick() {
  ensureWorldContent();
  ensureWorldSim();
  // sect relations drift
  (state.sects || []).forEach(s => {
    if (s.isPlayer) return;
    s.relation = Math.max(-5, Math.min(5, (s.relation || 0) + randInt(-1, 1)));
    s.power = Math.max(10, (s.power || 30) + randInt(-2, 3));
  });
  // alliance income
  const allies = (state.sects || []).filter(s => (s.relation || 0) >= 3);
  if (allies.length && state.clanWealth) {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + allies.length;
  }
  // hostile pressure
  const foes = (state.sects || []).filter(s => (s.relation || 0) <= -3);
  if (foes.length && state.mgmt && Math.random() > 0.85) {
    state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
    state.mgmt.security = Math.max(0, (state.mgmt.security || 50) - 2);
    simLog("Sect pressure from " + foes[0].name);
  }
  // sync player clan power with living + gold
  const pc = (state.clans || []).find(c => c.isPlayer);
  if (pc) {
    pc.power = Math.min(100, 20 + Math.floor(getLineageCharacters().length / 10) + Math.floor(((state.clanWealth && state.clanWealth.gold) || 0) / 200));
    pc.name = (state.lineage && state.lineage.bloodName) || pc.name;
  }
}

function continentMapTick() {
  ensureWorldSim();
  ensureWorldContent();
  const home = state.worldSim.homeRegion || "Outerland";
  const mod = regionModifiers(home);
  if (state.mgmt) {
    state.mgmt.food = Math.max(0, Math.min(200, (state.mgmt.food || 50) + mod.food * 0.3));
    // threat drift toward region baseline
    if ((state.globalThreat || 1) < mod.threat && Math.random() > 0.7) {
      state.globalThreat = Math.min(10, (state.globalThreat || 1) + 1);
    }
  }
  if (state.clanWealth) {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + mod.gold * 0.25;
  }
  // influence growth at home
  const inf = state.worldSim.mapInfluence || {};
  inf[home] = Math.min(100, (inf[home] || 0) + 0.4 + Math.floor(getLineageCharacters().length / 100));
  state.worldSim.mapInfluence = inf;
  // exploration events
  if (Math.random() < mod.flameChance) discoverFlameForSim();
  if (Math.random() < mod.beastChance) encounterBeastForSim();
  // expand control if influence high
  if ((inf[home] || 0) > 60 && !(state.worldSim.controlledRegions || []).includes(home)) {
    state.worldSim.controlledRegions = (state.worldSim.controlledRegions || []).concat([home]);
    simLog("Clan consolidates control over " + home);
    try { pushNarrative && pushNarrative("Domain expands in " + home); } catch(e) {}
  }
}

function allyWithSect() {
  ensureWorldContent();
  const s = (state.sects || []).find(x => (x.relation || 0) < 3);
  if (!s) return showToast("No sect available");
  if ((state.clanWealth.gold || 0) < 20) return showToast("Need 20 gold");
  state.clanWealth.gold -= 20;
  s.relation = Math.min(5, (s.relation || 0) + 2);
  ensureWorldSim();
  if (!state.worldSim.alliedSectIds.includes(s.id)) state.worldSim.alliedSectIds.push(s.id);
  simLog("Diplomatic gift to " + s.name);
  saveState();
  showToast("Relation up: " + s.name);
  switchView("simulation");
}

function claimRegionInfluence() {
  ensureWorldSim();
  const home = state.worldSim.homeRegion || "Outerland";
  if ((state.clanWealth.gold || 0) < 40) return showToast("Need 40 gold");
  state.clanWealth.gold -= 40;
  state.worldSim.mapInfluence[home] = Math.min(100, (state.worldSim.mapInfluence[home] || 0) + 15);
  simLog("Spent gold to claim influence in " + home);
  saveState();
  showToast("Influence +" + 15 + " " + home);
  switchView("simulation");
}

function bindBestFlame() {
  ensureWorldContent();
  ensureWorldSim();
  if (!state.flames.length) {
    discoverFlameForSim();
  }
  const best = state.flames.slice().sort((a, b) => (a.rank || 99) - (b.rank || 99))[0];
  if (!best) return showToast("No flames");
  state.worldSim.boundFlameId = best.id;
  saveState();
  showToast("Bound flame: " + best.name);
  switchView("simulation");
}

function worldSimMonthTick() {
  try { ensureWorldSim(); ensureWorldContent(); } catch(e) {}
  try { continentMapTick(); } catch(e) {}
  try { alchemySimTick(); } catch(e) {}
  try { worldFactionTick(); } catch(e) {}
}

function renderWorldSimPanel() {
  ensureWorldSim();
  ensureWorldContent();
  const ws = state.worldSim;
  const flame = state.flames.find(f => f.id === ws.boundFlameId);
  const beasts = (ws.boundBeastIds || []).map(id => state.beasts.find(b => b.id === id)).filter(Boolean);
  const sects = (state.sects || []).slice(0, 5);
  const inf = ws.mapInfluence || {};
  return `<div class="card" style="margin-bottom:12px;padding:12px;border-color:var(--gold);">
    <div style="color:var(--gold);font-weight:600;margin-bottom:6px;">Continent & World Link</div>
    <p style="font-size:0.85rem;color:var(--text-muted);">
      Home region: <strong style="color:var(--gold);">${ws.homeRegion}</strong>
      · Controlled: ${(ws.controlledRegions||[]).join(", ")||"none"}
      · World: ${(state.world && state.world.name)||"unformed"}
    </p>
    <div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0;">
      Influence — Outerland ${Math.round(inf.Outerland||0)} · Innerland ${Math.round(inf.Innerland||0)} · Mainland ${Math.round(inf.Mainland||0)} · Central ${Math.round(inf["Central Land"]||0)}
    </div>
    <p style="font-size:0.82rem;color:var(--text-muted);">
      Flame: <strong>${flame ? flame.name : "none"}</strong>
      · Beasts: ${beasts.map(b=>b.name).join(", ")||"none"}
      · Pills logged: ${(state.pills||[]).length}
      · Sects: ${sects.length}
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
      <button class="btn-ghost" onclick="setHomeRegion('Outerland')">Outerland</button>
      <button class="btn-ghost" onclick="setHomeRegion('Innerland')">Innerland</button>
      <button class="btn-ghost" onclick="setHomeRegion('Mainland')">Mainland</button>
      <button class="btn-ghost" onclick="setHomeRegion('Central Land')">Central</button>
      <button class="btn-primary" onclick="startRegionConquest()">Conquer</button>
      <button class="btn-ghost" onclick="startSectWar()">Sect War</button>
      <button class="btn-ghost" onclick="tameBeast()">Tame Beast</button>
      <button class="btn-ghost" onclick="runAuctionHouse()">Auction</button>
      <button class="btn-ghost" onclick="switchView('map')">Map</button>
    </div>
    ${(state.game&&state.game.advancedUI) ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
      <button class="btn-ghost" onclick="claimRegionInfluence()">Claim Influence</button>
      <button class="btn-ghost" onclick="discoverFlameForSim();switchView('simulation')">Seek Flame</button>
      <button class="btn-ghost" onclick="bindBestFlame()">Bind Flame</button>
      <button class="btn-ghost" onclick="encounterBeastForSim();switchView('simulation')">Hunt Beast</button>
      <button class="btn-ghost" onclick="allyWithSect()">Gift Sect</button>
      <button class="btn-ghost" onclick="assignRegionGovernor()">Governor</button>
      <button class="btn-ghost" onclick="plantSpyInSect()">Spy</button>
      <button class="btn-ghost" onclick="startMainlandCaravan()">Caravan</button>
      <button class="btn-ghost" onclick="switchView('flames')">Flames</button>
      <button class="btn-ghost" onclick="switchView('alchemy')">Alchemy</button>
      <button class="btn-ghost" onclick="switchView('beasts')">Beasts</button>
      <button class="btn-ghost" onclick="switchView('factions')">Factions</button>
    </div>` : `<p style="color:var(--text-dim);font-size:0.78rem;margin-top:6px;">Advanced OFF — extra world tools hidden.</p>`}
    <div style="margin-top:8px;font-size:0.8rem;color:var(--text-dim);">
      Sect relations: ${sects.map(s => s.name + " (" + (s.relation||0) + ")").join(" · ")||"—"}
    </div>
  </div>`;
}



// ===== WORLD SIM DEPTH (11) =====
function ensureWorldSimDepth() {
  ensureWorldSim();
  const ws = state.worldSim;
  if (!ws.conquest) ws.conquest = null; // { region, monthsLeft, power }
  if (!ws.tamedBeasts) ws.tamedBeasts = [];
  if (!ws.governors) ws.governors = {}; // region -> charId
  if (!ws.spies) ws.spies = []; // sect ids
  if (ws.auctionMonth == null) ws.auctionMonth = 0;
  if (!ws.lastWorldCard) ws.lastWorldCard = null;
  return ws;
}

function startRegionConquest(region) {
  ensureWorldSimDepth();
  region = region || state.worldSim.homeRegion || "Innerland";
  if ((state.worldSim.controlledRegions || []).includes(region)) return showToast("Already controlled");
  if ((state.clanWealth.gold || 0) < 50) return showToast("Need 50 gold");
  if ((state.mgmt && state.mgmt.security || 0) < 30) return showToast("Need 30 security");
  state.clanWealth.gold -= 50;
  state.worldSim.conquest = { region: region, monthsLeft: 4, power: 20 + Math.floor(getLineageCharacters().length / 20) };
  if (state.mgmt) state.mgmt.warFooting = true;
  simLog("Conquest campaign launched on " + region);
  pushWorldEventCard("Conquest of " + region + " begins (4 months).");
  saveState();
  showToast("Conquest: " + region);
  switchView("simulation");
}

function conquestTick() {
  ensureWorldSimDepth();
  const cq = state.worldSim.conquest;
  if (!cq) return;
  cq.monthsLeft -= 1;
  if (state.mgmt) {
    state.mgmt.security = Math.max(0, (state.mgmt.security || 50) - 1);
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 5);
  }
  if (cq.monthsLeft <= 0) {
    state.worldSim.controlledRegions = state.worldSim.controlledRegions || [];
    if (!state.worldSim.controlledRegions.includes(cq.region)) {
      state.worldSim.controlledRegions.push(cq.region);
    }
    state.worldSim.mapInfluence[cq.region] = Math.min(100, (state.worldSim.mapInfluence[cq.region] || 0) + 25);
    simLog("Conquest success: " + cq.region + " under clan control.");
    pushWorldEventCard("Victory — " + cq.region + " controlled.");
    state.worldSim.conquest = null;
    if (state.mgmt) state.mgmt.warFooting = false;
  }
}

function startSectWar() {
  ensureWorldContent();
  const foe = (state.sects || []).find(s => (s.relation || 0) <= -3) || (state.sects || []).sort((a,b)=>(a.relation||0)-(b.relation||0))[0];
  if (!foe) return showToast("No sect to fight");
  foe.relation = Math.min(-3, (foe.relation || 0) - 1);
  const power = 40 + Math.floor(getLineageCharacters().length / 15);
  const enemy = foe.power || 40;
  const win = power + randInt(0, 30) > enemy + randInt(0, 25);
  if (win) {
    state.clanWealth.gold = (state.clanWealth.gold || 0) + 30;
    state.clanWealth.renown = (state.clanWealth.renown || 1) + 2;
    foe.power = Math.max(10, (foe.power || 40) - 10);
    foe.relation = Math.max(-5, (foe.relation || 0) - 1);
    simLog("Sect war won against " + foe.name);
    pushWorldEventCard("Sect war victory vs " + foe.name + " (+30g).");
    showToast("Won vs " + foe.name);
  } else {
    if (state.mgmt) state.mgmt.security = Math.max(0, (state.mgmt.security || 50) - 8);
    state.clanWealth.gold = Math.max(0, (state.clanWealth.gold || 0) - 20);
    const living = getLineageCharacters();
    if (living.length && Math.random() > 0.6) {
      const v = living[Math.floor(Math.random() * Math.min(5, living.length))];
      try { applyInjury(v, 1); } catch(e) {}
    }
    simLog("Sect war lost against " + foe.name);
    pushWorldEventCard("Sect war defeat vs " + foe.name);
    showToast("Lost vs " + foe.name);
  }
  saveState();
  switchView("simulation");
}

function flameChallengeTick() {
  ensureWorldSimDepth();
  const fid = state.worldSim.boundFlameId;
  if (!fid) return;
  const foes = (state.sects || []).filter(s => (s.relation || 0) <= -2);
  if (!foes.length || Math.random() > 0.97) return;
  const foe = foes[Math.floor(Math.random() * foes.length)];
  if (Math.random() > 0.5) {
    // defended
    simLog("Defended Heavenly Flame from " + foe.name);
    pushWorldEventCard(foe.name + " failed to seize your flame.");
  } else {
    state.worldSim.boundFlameId = null;
    const fl = state.flames.find(f => f.id === fid);
    simLog("Flame stolen by " + foe.name + (fl ? " (" + fl.name + ")" : ""));
    pushWorldEventCard("Crisis: Heavenly Flame taken by " + foe.name + "!");
    foe.relation = -5;
    if (state.mgmt) state.mgmt.morale = Math.max(0, (state.mgmt.morale || 50) - 5);
  }
}

function tameBeast() {
  ensureWorldSimDepth();
  ensureWorldContent();
  if (!state.beasts.length) encounterBeastForSim();
  const b = state.beasts[state.beasts.length - 1];
  if (!b) return showToast("No beast");
  if ((state.clanWealth.gold || 0) < 15) return showToast("Need 15 gold");
  state.clanWealth.gold -= 15;
  if (!state.worldSim.tamedBeasts.find(x => x.id === b.id)) {
    state.worldSim.tamedBeasts.push({ id: b.id, name: b.name, power: b.power || 30 });
  }
  simLog("Tamed beast: " + b.name);
  pushWorldEventCard("Beast tamed: " + b.name);
  saveState();
  showToast("Tamed " + b.name);
  switchView("simulation");
}

function tamedBeastTick() {
  ensureWorldSimDepth();
  const t = state.worldSim.tamedBeasts || [];
  if (!t.length || !state.mgmt) return;
  const bonus = Math.min(5, t.length);
  state.mgmt.security = Math.min(100, (state.mgmt.security || 50) + bonus * 0.25);
  if (Math.random() > 0.7) state.mgmt.food = Math.min(200, (state.mgmt.food || 50) + bonus * 0.3);
}

function runAuctionHouse() {
  ensureWorldSimDepth();
  const offers = [
    { name: "Rare herb bundle", cost: 40, effect: "herbs" },
    { name: "Flame shard", cost: 80, effect: "flame" },
    { name: "Beast core", cost: 50, effect: "core" },
    { name: "Pill recipe", cost: 35, effect: "pill" }
  ];
  const o = offers[Math.floor(Math.random() * offers.length)];
  state.sim.pendingChoice = {
    event: "Auction House: " + o.name + " available for " + o.cost + " gold.",
    options: [
      { label: "Buy (" + o.cost + "g)", effect: "auction_buy_" + o.effect + "_" + o.cost },
      { label: "Pass", effect: "auction_pass" }
    ]
  };
  try { recordPauseReason("Auction House"); } catch(e) { state.sim.running = false; }
  pushWorldEventCard("Auction: " + o.name);
  switchView("simulation");
}

function resolveAuctionEffect(effect) {
  if (effect === "auction_pass") {
    state.sim.pendingChoice = null;
    saveState();
    switchView("simulation");
    return;
  }
  const m = String(effect).match(/^auction_buy_(\w+)_(\d+)$/);
  if (!m) return;
  const kind = m[1], cost = parseInt(m[2], 10);
  if ((state.clanWealth.gold || 0) < cost) {
    showToast("Not enough gold");
    state.sim.pendingChoice = null;
    switchView("simulation");
    return;
  }
  state.clanWealth.gold -= cost;
  if (kind === "herbs") state.clanWealth.herbs = (state.clanWealth.herbs || 0) + 8;
  if (kind === "core") state.clanWealth.cores = (state.clanWealth.cores || 0) + 2;
  if (kind === "flame") discoverFlameForSim();
  if (kind === "pill") {
    state.pills = state.pills || [];
    state.pills.push({ name: "Auction Pill", year: state.sim.year, power: 5 });
  }
  simLog("Auction purchase: " + kind + " (−" + cost + "g)");
  state.sim.pendingChoice = null;
  saveState();
  switchView("simulation");
}

function auctionMonthTick() {
  ensureWorldSimDepth();
  state.worldSim.auctionMonth = (state.worldSim.auctionMonth || 0) + 1;
  if (state.worldSim.auctionMonth >= 6) {
    state.worldSim.auctionMonth = 0;
    if (Math.random() > 0.4) runAuctionHouse();
  }
}

function assignRegionGovernor() {
  ensureWorldSimDepth();
  const char = getActiveChar();
  if (!char || !["elder", "grand_elder"].includes(currentRankId(char))) return showToast("Select Elder or Grand Elder");
  const region = state.worldSim.homeRegion || "Outerland";
  if (!(state.worldSim.controlledRegions || []).includes(region) && (state.worldSim.mapInfluence[region] || 0) < 40) {
    return showToast("Need control or 40 influence in " + region);
  }
  state.worldSim.governors[region] = char.id;
  simLog(char.name + " appointed governor of " + region);
  saveState();
  showToast("Governor: " + char.name + " @ " + region);
  switchView("simulation");
}

function governorTick() {
  ensureWorldSimDepth();
  Object.keys(state.worldSim.governors || {}).forEach(region => {
    const id = state.worldSim.governors[region];
    const ch = (state.characters || []).find(c => c.id === id && c.alive !== false);
    if (!ch) { delete state.worldSim.governors[region]; return; }
    state.worldSim.mapInfluence[region] = Math.min(100, (state.worldSim.mapInfluence[region] || 0) + 0.8);
    try { meritCapAdd(ch, 2, "governor"); } catch(e) {}
  });
}

function plantSpyInSect() {
  ensureWorldContent();
  ensureWorldSimDepth();
  const s = (state.sects || []).find(x => !(state.worldSim.spies || []).includes(x.id));
  if (!s) return showToast("No target sect");
  if ((state.clanWealth.gold || 0) < 25) return showToast("Need 25 gold");
  state.clanWealth.gold -= 25;
  state.worldSim.spies.push(s.id);
  s.relation = Math.max(-5, (s.relation || 0) - 1);
  simLog("Spy planted in " + s.name);
  saveState();
  showToast("Spy in " + s.name);
  switchView("simulation");
}

function spyTick() {
  ensureWorldSimDepth();
  (state.worldSim.spies || []).forEach(sid => {
    const s = (state.sects || []).find(x => x.id === sid);
    if (!s) return;
    if (Math.random() > 0.85 && state.mgmt) {
      state.mgmt.security = Math.min(100, (state.mgmt.security || 50) + 1);
      if (Math.random() > 0.5) state.clanWealth.gold = (state.clanWealth.gold || 0) + 3;
    }
  });
}

function regionTributeTick() {
  ensureWorldSimDepth();
  if (state.sim.month !== 12) return;
  const regs = state.worldSim.controlledRegions || [];
  if (!regs.length) return;
  let gold = regs.length * 25;
  let food = regs.length * 8;
  // governor bonus
  regs.forEach(r => { if (state.worldSim.governors[r]) { gold += 10; food += 3; } });
  state.clanWealth.gold = (state.clanWealth.gold || 0) + gold;
  if (state.mgmt) state.mgmt.food = Math.min(200, (state.mgmt.food || 50) + food);
  simLog("Regional tribute: +" + gold + "g +" + food + " food from " + regs.join(", "));
  pushWorldEventCard("Yearly tribute from " + regs.length + " region(s).");
}

function startMainlandCaravan() {
  ensureWorldSimDepth();
  const inf = (state.worldSim.mapInfluence && state.worldSim.mapInfluence.Innerland) || 0;
  if (inf < 40) return showToast("Need Innerland influence 40");
  if ((state.clanWealth.gold || 0) < 30) return showToast("Need 30 gold stake");
  state.clanWealth.gold -= 30;
  const success = Math.random() > 0.35;
  if (success) {
    const gain = randInt(50, 100);
    state.clanWealth.gold += gain;
    state.clanWealth.herbs = (state.clanWealth.herbs || 0) + randInt(2, 6);
    simLog("Mainland caravan success +" + gain + "g");
    pushWorldEventCard("Caravan returns from Mainland (+" + gain + "g).");
    showToast("Caravan +" + gain + "g");
  } else {
    if (state.mgmt) state.mgmt.security = Math.max(0, (state.mgmt.security || 50) - 5);
    simLog("Mainland caravan ambushed");
    pushWorldEventCard("Caravan ambushed on the road to Mainland.");
    showToast("Caravan failed");
  }
  saveState();
  switchView("simulation");
}

function pushWorldEventCard(msg) {
  ensureWorldSimDepth();
  state.worldSim.lastWorldCard = { msg: msg, y: state.sim.year, m: state.sim.month };
  try { simLog(msg); } catch(e) {}
}

function renderWorldHudStrip() {
  ensureWorldSimDepth();
  const ws = state.worldSim;
  const flame = (state.flames || []).find(f => f.id === ws.boundFlameId);
  const allies = (state.sects || []).filter(s => (s.relation || 0) >= 3).length;
  const card = ws.lastWorldCard;
  return `<div style="margin-bottom:8px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem;color:var(--text-muted);">
    <strong style="color:var(--gold);">World</strong>
    · Home ${ws.homeRegion}
    · Ctrl ${(ws.controlledRegions||[]).length}
    · Flame ${flame ? flame.name : "—"}
    · Tamed ${(ws.tamedBeasts||[]).length}
    · Allies ${allies}
    · Spies ${(ws.spies||[]).length}
    ${ws.conquest ? " · Conquest " + ws.conquest.region + " (" + ws.conquest.monthsLeft + "m)" : ""}
    ${card ? `<div style="margin-top:4px;color:var(--gold);">Event Y${card.y}M${card.m}: ${card.msg}</div>` : ""}
  </div>`;
}

function worldDepthMonthTick() {
  try { ensureWorldSimDepth(); } catch(e) {}
  try { conquestTick(); } catch(e) {}
  try { flameChallengeTick(); } catch(e) {}
  try { tamedBeastTick(); } catch(e) {}
  try { auctionMonthTick(); } catch(e) {}
  try { governorTick(); } catch(e) {}
  try { spyTick(); } catch(e) {}
  try { regionTributeTick(); } catch(e) {}
}



function sanitizeResources() {
  if (!state.mgmt) return;
  state.mgmt.food = Math.round(Math.max(0, Math.min(200, state.mgmt.food || 0)));
  state.mgmt.morale = Math.round(Math.max(0, Math.min(100, state.mgmt.morale || 0)));
  state.mgmt.security = Math.round(Math.max(0, Math.min(100, state.mgmt.security || 0)));
  if (state.clanWealth) state.clanWealth.gold = Math.round(Math.max(0, state.clanWealth.gold || 0));
}


// ===== SIM UI IMPROVEMENTS (15) =====
function ensureSimUI() {
  if (!state.simUI) {
    state.simUI = {
      density: "comfortable", // comfortable | compact
      focusMode: false,
      focusPanel: "management", // management | people | world | politics
      collapsed: {},
      memberDrawerId: null,
      sortBy: "merit", // merit | rank | age | loyalty
      toastQueue: [],
      lastDeltas: null,
      monthSnap: null
    };
  }
  return state.simUI;
}

function toggleDensity() {
  ensureSimUI();
  state.simUI.density = state.simUI.density === "compact" ? "comfortable" : "compact";
  saveState();
  showToast("Density: " + state.simUI.density);
  switchView("simulation");
}

function toggleFocusMode() {
  ensureSimUI();
  state.simUI.focusMode = !state.simUI.focusMode;
  saveState();
  showToast(state.simUI.focusMode ? "Focus mode ON" : "Focus mode OFF");
  switchView("simulation");
}

function setFocusPanel(p) {
  ensureSimUI();
  state.simUI.focusPanel = p;
  if (state.simFinish) state.simFinish.tab = p === "world" ? "management" : p;
  saveState();
  switchView("simulation");
}

function toggleCardCollapse(id) {
  ensureSimUI();
  state.simUI.collapsed[id] = !state.simUI.collapsed[id];
  switchView("simulation");
}

function isCardCollapsed(id) {
  ensureSimUI();
  return !!state.simUI.collapsed[id];
}

function collapsibleCard(id, title, bodyHtml, forceOpen) {
  ensureSimUI();
  const closed = forceOpen ? false : isCardCollapsed(id);
  return `<div class="card sim-card" data-card="${id}" style="margin-bottom:12px;padding:${state.simUI.density==='compact'?'8px':'12px'};">
    <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleCardCollapse('${id}')">
      <div style="color:var(--gold);font-weight:600;">${title}</div>
      <span style="color:var(--text-dim);font-size:0.85rem;">${closed ? "▸ expand" : "▾ collapse"}</span>
    </div>
    <div style="display:${closed ? "none" : "block"};margin-top:8px;">${bodyHtml}</div>
  </div>`;
}

function queueToast(msg) {
  ensureSimUI();
  state.simUI.toastQueue = state.simUI.toastQueue || [];
  state.simUI.toastQueue.push(String(msg));
  if (state.simUI.toastQueue.length > 8) state.simUI.toastQueue.shift();
  // batch flush
  if (!state.simUI._toastTimer) {
    state.simUI._toastTimer = setTimeout(() => {
      try {
        const q = state.simUI.toastQueue || [];
        state.simUI.toastQueue = [];
        state.simUI._toastTimer = null;
        if (q.length === 1) showToast(q[0]);
        else if (q.length > 1) showToast(q[0] + " (+" + (q.length - 1) + " more)");
      } catch(e) {}
    }, 120);
  }
}

function snapMonthStart() {
  ensureSimUI();
  if (!state.mgmt) return;
  state.simUI.monthSnap = {
    food: state.mgmt.food || 0,
    gold: (state.clanWealth && state.clanWealth.gold) || 0,
    morale: state.mgmt.morale || 0,
    security: state.mgmt.security || 0,
    living: typeof getLineageCharacters === "function" ? getLineageCharacters().length : 0
  };
}

function computeMonthDeltas() {
  ensureSimUI();
  const s = state.simUI.monthSnap;
  if (!s || !state.mgmt) return;
  const d = {
    food: Math.round((state.mgmt.food || 0) - s.food),
    gold: Math.round(((state.clanWealth && state.clanWealth.gold) || 0) - s.gold),
    morale: Math.round((state.mgmt.morale || 0) - s.morale),
    security: Math.round((state.mgmt.security || 0) - s.security),
    living: (typeof getLineageCharacters === "function" ? getLineageCharacters().length : 0) - s.living
  };
  state.simUI.lastDeltas = d;
}

function renderDeltaChips() {
  ensureSimUI();
  const d = state.simUI.lastDeltas;
  if (!d) return "";
  const chip = (label, v) => {
    const col = v > 0 ? "#6bcf8e" : (v < 0 ? "#f88" : "var(--text-dim)");
    const sign = v > 0 ? "+" : "";
    return `<span style="padding:2px 8px;border-radius:999px;border:1px solid var(--border);color:${col};font-size:0.78rem;">${label} ${sign}${v}</span>`;
  };
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px;">
    <span style="color:var(--text-dim);font-size:0.78rem;align-self:center;">Last month:</span>
    ${chip("Food", d.food)}${chip("Gold", d.gold)}${chip("Morale", d.morale)}${chip("Sec", d.security)}${chip("Living", d.living)}
  </div>`;
}

function renderStickySimBar() {
  ensureSim();
  ensureManagement();
  ensureSimUI();
  const y = state.sim.year || 1, m = state.sim.month || 1;
  const gold = Math.round((state.clanWealth && state.clanWealth.gold) || 0);
  const food = Math.round((state.mgmt && state.mgmt.food) || 0);
  const living = typeof getLineageCharacters === "function" ? getLineageCharacters().length : 0;
  const running = state.sim.running;
  return `<div id="sim-sticky-bar" style="position:sticky;top:0;z-index:40;margin-bottom:12px;padding:10px 12px;background:rgba(12,12,18,0.92);backdrop-filter:blur(8px);border:1px solid var(--border);border-radius:10px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;">
    <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:0.9rem;">
      <span>Y<strong style="color:var(--gold);">${y}</strong> M<strong style="color:var(--gold);">${m}</strong></span>
      <span title="Gold">🪙 ${gold}</span>
      <span title="Food">🌾 ${food}</span>
      <span title="Living">👥 ${living}</span>
      <span style="color:${running ? "#6bcf8e" : "var(--text-dim)"};">${running ? "● RUN" : "○ STOP"}</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      <button class="btn-primary" style="min-height:40px;padding:8px 12px;" onclick="startSimulation()">Run</button>
      <button class="btn-ghost" style="min-height:40px;padding:8px 12px;" onclick="try{stopSimulation()}catch(e){}">Stop</button>
      <button class="btn-ghost" style="min-height:40px;padding:8px 12px;" onclick="runFullSimMonth()">Month</button>
      <button class="btn-ghost" style="min-height:40px;padding:8px 12px;" onclick="runFullSimYear()">Year</button>
    </div>
  </div>`;
}

function renderSimSubnav() {
  ensureSimUI();
  const cur = state.simUI.focusPanel || "management";
  const tabs = [
    { id: "management", label: "⚙ Management" },
    { id: "people", label: "👥 People" },
    { id: "world", label: "🗺 World" },
    { id: "politics", label: "🏛 Politics" }
  ];
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
    ${tabs.map(t => `<button class="${cur===t.id?"btn-primary":"btn-ghost"}" style="min-height:40px;" onclick="setFocusPanel('${t.id}')">${t.label}</button>`).join("")}
    <button class="btn-ghost" style="min-height:40px;" onclick="toggleFocusMode()">Focus: ${state.simUI.focusMode?"ON":"OFF"}</button>
    <button class="btn-ghost" style="min-height:40px;" onclick="toggleDensity()">${state.simUI.density==="compact"?"Compact":"Comfortable"}</button>
  </div>
  <div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:8px;">Sim › ${cur.charAt(0).toUpperCase()+cur.slice(1)}</div>`;
}

function setMemberSort(s) {
  ensureSimUI();
  state.simUI.sortBy = s;
  switchView("simulation");
}

function sortMembersList(list) {
  ensureSimUI();
  const s = state.simUI.sortBy || "merit";
  const arr = list.slice();
  if (s === "merit") arr.sort((a,b) => (getMerit(b)||0) - (getMerit(a)||0));
  else if (s === "age") arr.sort((a,b) => (b.age||0) - (a.age||0));
  else if (s === "loyalty") arr.sort((a,b) => ((typeof loyaltyOf==="function"?loyaltyOf(b):50) - (typeof loyaltyOf==="function"?loyaltyOf(a):50)));
  else if (s === "rank") {
    const order = { ancestor:6, patriarch:5, grand_elder:4, elder:3, core:2, inner:1, outer:0 };
    arr.sort((a,b) => (order[currentRankId(b)]||0) - (order[currentRankId(a)]||0));
  }
  return arr;
}

function openMemberDrawer(id) {
  ensureSimUI();
  state.simUI.memberDrawerId = id;
  switchView("simulation");
}

function closeMemberDrawer() {
  ensureSimUI();
  state.simUI.memberDrawerId = null;
  switchView("simulation");
}

function renderMemberDrawer() {
  ensureSimUI();
  const id = state.simUI.memberDrawerId;
  if (!id) return "";
  const c = (state.characters || []).find(x => x.id === id);
  if (!c) return "";
  const rank = typeof currentRankId === "function" ? currentRankId(c) : "?";
  return `<div style="position:fixed;top:0;right:0;width:min(360px,100%);height:100%;z-index:50;background:rgba(14,14,22,0.98);border-left:1px solid var(--border);padding:16px;overflow:auto;box-shadow:-8px 0 24px rgba(0,0,0,0.4);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <strong style="color:var(--gold);font-size:1.1rem;">${c.name}</strong>
      <button class="btn-ghost" onclick="closeMemberDrawer()">Close</button>
    </div>
    <p style="color:var(--text-muted);font-size:0.9rem;">${c.star||""} ${c.realm||""} · Age ${c.age||"?"} · ${rank}</p>
    <p style="color:var(--text-dim);font-size:0.85rem;">Merit ${typeof getMerit==="function"?getMerit(c):0} · Loyalty ${typeof loyaltyOf==="function"?Math.round(loyaltyOf(c)):50}</p>
    <p style="color:var(--text-dim);font-size:0.85rem;">Dou Qi ${c.douQi||0} · Foundation ${Math.round(c.foundation||0)}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
      <button class="btn-ghost" onclick="state.currentCharacterId='${c.id}';showToast('Selected');">Select</button>
      <button class="btn-ghost" onclick="try{setFocusCharacter()}catch(e){};state.dynasty=state.dynasty||{};state.dynasty.focusId='${c.id}';saveState();showToast('Focus set');">Set Focus</button>
      <button class="btn-ghost" onclick="assignHierarchyRankSafe('elder')">Make Elder</button>
      <button class="btn-ghost" onclick="assignHierarchyRankSafe('grand_elder')">Make GE</button>
    </div>
  </div>`;
}

function renderVirtualMemberList() {
  ensureSimUI();
  let list = typeof getLineageCharacters === "function" ? getLineageCharacters() : [];
  try { list = filterMembersBySearch(list); } catch(e) {}
  list = sortMembersList(list);
  const pageSize = 20;
  if (!state.simQoL) state.simQoL = { memberPage: 0 };
  if (state.simQoL.memberPage == null) state.simQoL.memberPage = 0;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  if (state.simQoL.memberPage >= pages) state.simQoL.memberPage = pages - 1;
  const start = state.simQoL.memberPage * pageSize;
  const slice = list.slice(start, start + pageSize);
  const rankLabel = (c) => {
    try { return (HIERARCHY_RANKS.find(r => r.id === currentRankId(c)) || {}).label || currentRankId(c); } catch(e) { return currentRankId(c); }
  };
  return `<div class="card" style="padding:${state.simUI.density==='compact'?'8px':'12px'};margin-bottom:12px;">
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;align-items:center;">
      <strong style="color:var(--gold);">Members</strong>
      <button class="btn-ghost" style="min-height:36px;" onclick="setMemberSort('merit')">Merit</button>
      <button class="btn-ghost" style="min-height:36px;" onclick="setMemberSort('rank')">Rank</button>
      <button class="btn-ghost" style="min-height:36px;" onclick="setMemberSort('age')">Age</button>
      <button class="btn-ghost" style="min-height:36px;" onclick="setMemberSort('loyalty')">Loyalty</button>
      <span style="color:var(--text-dim);font-size:0.78rem;">Page ${state.simQoL.memberPage+1}/${pages} · ${list.length}</span>
      <button class="btn-ghost" onclick="ensureSimQoL();state.simQoL.memberPage=Math.max(0,state.simQoL.memberPage-1);switchView('simulation')">←</button>
      <button class="btn-ghost" onclick="ensureSimQoL();state.simQoL.memberPage++;switchView('simulation')">→</button>
    </div>
    <div>
      ${slice.map(c => `<div onclick="openMemberDrawer('${c.id}')" style="padding:8px 6px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;justify-content:space-between;gap:8px;min-height:40px;align-items:center;">
        <span><strong style="color:var(--gold);">${c.name}</strong> <span style="color:var(--text-dim);font-size:0.8rem;">${c.star||""} ${c.realm||""}</span></span>
        <span style="color:var(--text-muted);font-size:0.8rem;">${rankLabel(c)} · M${typeof getMerit==="function"?getMerit(c):0}</span>
      </div>`).join("") || "<p style='color:var(--text-dim);'>No members</p>"}
    </div>
  </div>`;
}

function renderSimLayoutShell(mainHtml) {
  ensureSimUI();
  const compact = state.simUI.density === "compact";
  const focus = state.simUI.focusMode;
  const panel = state.simUI.focusPanel || "management";
  // 3-column when not focus and wide-friendly
  return `<div class="sim-ui-root" style="max-width:1400px;margin:0 auto;${compact?"font-size:0.92rem;":""}">
    ${renderStickySimBar()}
    ${renderSimSubnav()}
    ${renderDeltaChips()}
    ${renderMemberDrawer()}
    ${focus ? `<div>${mainHtml}</div>` : `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;align-items:start;">
      <div>${mainHtml}</div>
    </div>`}
  </div>`;
}

function captureDeltasAroundTick() {
  try { snapMonthStart(); } catch(e) {}
}
function finishDeltasAroundTick() {
  try { computeMonthDeltas(); } catch(e) {}
}

// ========== NAVIGATION ==========











const views = {
  dashboard: { title: 'Dashboard', render: renderDashboard },
  world: { title: 'World Creator', render: renderWorld },
  map: { title: 'Continent Map', render: renderMap },
  character: { title: 'Character Creation', render: renderCharacter },
  cultivation: { title: 'Cultivation Simulator', render: renderCultivation },
  techniques: { title: 'Techniques', render: renderTechniques },
  flames: { title: 'Heavenly Flames', render: renderFlames },
  alchemy: { title: 'Alchemy Laboratory', render: renderAlchemy },
  beasts: { title: 'Magical Beasts', render: renderBeasts },
  factions: { title: 'Clans & Sects', render: renderFactions },
  battle: { title: 'Battle Simulator', render: renderBattle },
  story: { title: 'Story Generator', render: renderStory },
  community: { title: 'Community', render: renderCommunity },
  pricing: { title: 'Cultivation Paths', render: renderPricing },
  codex: { title: 'World Codex', render: renderCodex },
  branch: { title: 'Branching Story', render: renderBranchStory },
  achievements: { title: 'Achievements', render: renderAchievements },
  stats: { title: 'Statistics', render: renderStats },
  simulation: { title: 'Lineage Simulation', render: renderSimulation },
  familytree: { title: 'Family Tree', render: renderFamilyTreePage }
};

function switchView(viewName) {
  try {
    const view = views[viewName];
    if (!view) { console.warn('Unknown view', viewName); return; }
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    const bc = document.getElementById('breadcrumb');
    if (bc) bc.textContent = view.title;
    const content = document.getElementById('content');
    if (content) content.innerHTML = view.render();
    revealApp();
  } catch (e) {
    console.error('switchView error', e);
    revealApp();
    const content = document.getElementById('content');
    if (content) content.innerHTML = '<div class="card"><h3 class="card-title">View error</h3><p style="color:var(--text-muted)">' + (e && e.message ? e.message : e) + '</p></div>';
  }
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  try { if (typeof migrateSave === 'function') state = migrateSave(state); } catch(e) { console.warn(e); }
  try { if (typeof ensureMeta === 'function') ensureMeta(); } catch(e) {}
  try { if (typeof ensureSim === 'function') ensureSim(); } catch(e) {}
  try { if (typeof ensureWealth === 'function') ensureWealth(); } catch(e) {}
  try { if (typeof ensure100 === 'function') ensure100(); } catch(e) {}
  try { if (typeof ensure100b === 'function') ensure100b(); } catch(e) {}
  try { if (typeof ensurePath === 'function') ensurePath(); } catch(e) {}
  try { if (typeof ensureManagement === 'function') ensureManagement(); } catch(e) {}
  try { if (typeof initSimWorker === 'function') initSimWorker(); } catch(e) {}

  // Always reveal app — never stick on loader
  setTimeout(revealApp, 400);
  setTimeout(revealApp, 1500);
  setTimeout(revealApp, 3000);

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  const btnSave = document.getElementById('btn-save');
  if (btnSave) btnSave.addEventListener('click', saveState);
  const btnExport = document.getElementById('btn-export');
  if (btnExport) btnExport.addEventListener('click', () => {
    if (state.storyChapters && state.storyChapters.length > 0 && confirm("Export as Novel (TXT)?\n\nCancel = Export World as JSON")) {
      exportNovel();
    } else {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heavenly-dao-world-${Date.now()}.json`;
      a.click();
      showToast('World exported as JSON');
    }
  });

  try { switchView('dashboard'); } catch(e) { console.error(e); try { revealApp(); } catch(e2) {} }
  try {
    const tb = document.querySelector('.topbar');
    if (tb && !document.getElementById('ver-tag')) {
      const s = document.createElement('span');
      s.id = 'ver-tag';
      s.style.cssText = 'margin-left:auto;font-size:0.75rem;color:var(--text-dim);padding-right:12px;';
      s.textContent = 'build v5 · hierarchy sim';
      tb.appendChild(s);
    }
  } catch(e) {}
});
