// ======================
// HEAVENLY DAO CHRONICLES
// Ultimate Application Logic — Expanded Edition
// ======================

let state = JSON.parse(localStorage.getItem('heavenlyDaoState')) || { ...DEFAULT_STATE };
// Ensure new faction arrays exist
['sects','clans','empires','academies','auctions','pillTowers','events','pills'].forEach(k => {
  if (!state[k]) state[k] = [];
});

function saveState() {
  localStorage.setItem('heavenlyDaoState', JSON.stringify(state));
  showToast('World state saved to Heavenly Dao Memory');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function getActiveChar() {
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
            <p><strong>Central Land</strong> — Home of the Eight Ancient Clans</p>
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
        <button class="btn-ghost" onclick="trainCharacter(true)">Deep Meditation (bigger gain, risk)</button>
      </div>
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
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Battle Simulation AI</h3>
      </div>
      <p style="color:var(--text-muted);margin-bottom:24px;">Simulate battles using realm, techniques, experience, bloodline, and strategy. The Heavenly Dao judges the outcome.</p>
      
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
        <button class="btn-primary" onclick="generateChapter()">📖 Generate Next Chapter</button>
      </div>
      <p style="color:var(--text-muted);">The Heavenly Dao remembers everything. Stories evolve with your world and characters.</p>
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
    </div>
  `;
}

function renderPricing() {
  const tiers = [
    { name: "Mortal", price: "Free", features: ["1 World", "3 Characters", "Basic Generation", "Local Save"] },
    { name: "Disciple", price: "$9", features: ["5 Worlds", "20 Characters", "Advanced AI", "Image Credits", "Export TXT"] },
    { name: "Dou King", price: "$19", features: ["Unlimited Worlds", "100 Characters", "Full Simulation", "More Images", "PDF/DOCX Export"], featured: true },
    { name: "Dou Saint", price: "$39", features: ["Priority AI", "Custom Flames", "Clan Tools", "Battle Depth", "Community Boost"] },
    { name: "Dou Di", price: "$79", features: ["Everything", "Dedicated Memory", "Early Features", "API Access", "Legend Status"] }
  ];
  return `
    <div class="card" style="margin-bottom:24px;text-align:center;">
      <h3 class="card-title" style="font-size:1.4rem;">Cultivation Paths — SaaS Tiers</h3>
      <p style="color:var(--text-muted);margin-top:8px;">Higher tiers grant more AI credits, storage, and deeper simulation power.</p>
    </div>
    <div class="grid-3">
      ${tiers.map(t => `
        <div class="pricing-card ${t.featured ? 'featured' : ''}">
          <div class="tier-name">${t.name}</div>
          <div class="price">${t.price}</div>
          <div class="period">${t.price === 'Free' ? 'Forever' : 'per month'}</div>
          <ul>${t.features.map(f => `<li>${f}</li>`).join('')}</ul>
          <button class="btn-primary" style="width:100%;">${t.price === 'Free' ? 'Current Path' : 'Ascend'}</button>
        </div>
      `).join('')}
    </div>
  `;
}

// ========== ACTIONS ==========

function createWorld() {
  state.world = generateWorld();
  state.events = state.events || [];
  saveState();
  switchView('world');
  showToast(`World "${state.world.name}" has been born under the Heavenly Dao`);
}

function createCharacter(forcedRealm = null) {
  const char = generateCharacter(forcedRealm);
  state.characters.push(char);
  if (!state.currentCharacterId) state.currentCharacterId = char.id;
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
  const mult = deep ? 2.5 : 1;
  const risk = deep && Math.random() < 0.15;
  char.douQi = (char.douQi || 100) + Math.floor(randInt(80, 400) * mult);
  char.purity = Math.min(100, (char.purity || 40) + randInt(1, 5));
  char.control = Math.min(100, (char.control || 30) + randInt(1, 4));
  char.experience = Math.min(100, (char.experience || 20) + randInt(2, 8));
  char.comprehension = Math.min(100, (char.comprehension || 20) + randInt(0, 3));
  if (risk) {
    char.foundation = Math.max(10, char.foundation - randInt(5, 12));
    showToast(`Deep meditation backfired! Foundation damaged. Still gained Dou Qi.`);
  } else {
    showToast(`${char.name} trained diligently. Dou Qi +${Math.floor(randInt(80, 400) * mult)}`);
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
  if (winner) {
    winner.experience = Math.min(100, (winner.experience || 50) + randInt(4, 12));
    winner.kills = (winner.kills || 0) + (Math.random() > 0.65 ? 1 : 0);
    winner.douQi = (winner.douQi || 0) + randInt(50, 200);
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
      </div>
    `;
  }
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

  const region = state.currentRegion || "Outerland";
  const aff = (char.affiliations && char.affiliations[0]) ? char.affiliations[0].name : null;
  const recentEvent = (state.events && state.events.length) ? state.events[state.events.length-1].desc : null;

  const openings = [
    `In the ${region} of ${state.world.name}, the wind carried both opportunity and death.`,
    `Night covered the ${region}. ${char.name} sat in meditation as Dou Qi slowly circulated.`,
    `The recent disturbances in the ${region} had not gone unnoticed by ${char.name}.`,
    `Under the cold stars of ${state.world.name}, another day of cultivation began.`
  ];

  const events = [
    `${char.name} discovered a half-buried cave. Ancient formations still flickered weakly inside.`,
    `A traveling merchant spoke of a Heavenly Flame fluctuation not far from the current region.`,
    `An elder from a major force tested ${char.name}'s talent in secret and left without a word.`,
    `A small secret realm entrance appeared for only three days. Many young geniuses rushed toward it.`,
    `${char.name} refined a pill under pressure. The process nearly failed, yet yielded unexpected insight.`,
    `A magical beast of surprising strength blocked the path. After a hard fight, a beast core was obtained.`,
    `Rumors of a Dou Saint remnant spread through the black market.`,
    `${char.name} felt a strange resonance with an old technique, as if it had been waiting for them.`,
    `A conflict between two factions spilled into the open. Neutrals were forced to choose sides.`,
    `While training, ${char.name} briefly touched a higher level of Dou Qi control.`
  ];

  // Faction-aware events
  if (aff) {
    events.push(`As a member of ${aff}, ${char.name} received a mission that could not be refused.`);
    events.push(`Internal competition within ${aff} intensified. ${char.name}'s performance was being watched.`);
  }
  if (recentEvent) {
    events.push(`The aftermath of recent events still lingered: ${recentEvent}`);
  }

  const growth = [
    `The battle and cultivation of recent days had quietly strengthened ${char.name}'s foundation.`,
    `A faint bottleneck could be felt. The next breakthrough would not come easily.`,
    `${char.name}'s understanding of ${char.attribute} Dou Qi deepened slightly.`,
    `The path toward higher realms remained long, yet the will to continue only grew stronger.`
  ];

  const endings = [
    `The Heavenly Dao remained silent. Only the strong would write their names into history.`,
    `Whether this journey would end in glory or ruin, no one could yet say.`,
    `${char.name} closed their eyes once more. The next step would decide many things.`,
    `In the vast world of ${state.world.name}, another legend was slowly taking shape.`
  ];

  const titleThemes = ["Rising Flames", "Hidden Opportunity", "Blood and Dou Qi", "The Path Forward",
    "Echoes of the Ancient Era", "Heavenly Tribulation", "Clan Crisis", "Secret Realm",
    "Flame of Destiny", "Against the Heavens", "Faction Shadows", "Quiet Breakthrough", "Road of Bones"];

  const chapter = {
    title: `Chapter ${state.storyChapters.length + 1}: ${titleThemes[Math.floor(Math.random()*titleThemes.length)]}`,
    content: `${openings[Math.floor(Math.random()*openings.length)]}

${char.name}, currently a ${char.star} ${char.realm} with ${char.talent} talent, continued the long road of cultivation in the ${region}.

${events[Math.floor(Math.random()*events.length)]}

${events[Math.floor(Math.random()*events.length)]}

${growth[Math.floor(Math.random()*growth.length)]}

${endings[Math.floor(Math.random()*endings.length)]}`
  };

  // Small mechanical rewards
  char.experience = Math.min(100, (char.experience || 20) + randInt(1, 4));
  char.comprehension = Math.min(100, (char.comprehension || 20) + randInt(0, 2));

  state.storyChapters.push(chapter);
  saveState();
  switchView('story');
  showToast('New chapter written by the Heavenly Dao');
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
  const opportunities = [
    { title: "Ancient Remnant", desc: "You discovered a broken jade slip containing part of a high-rank technique.", effect: () => { state.techniques.push(generateTechnique()); } },
    { title: "Beast Core", desc: "After a hard fight you obtained a high-quality beast core.", effect: () => { char.douQi += randInt(200, 800); char.experience = Math.min(100, char.experience + 5); } },
    { title: "Pill Reward", desc: "An elder rewarded you with a rare pill for your recent performance.", effect: () => { if (!state.pills) state.pills = []; state.pills.push(rand(PILL_LIST)); } },
    { title: "Sudden Enlightenment", desc: "While meditating, a flash of insight improved your comprehension.", effect: () => { char.comprehension = Math.min(100, char.comprehension + randInt(3, 8)); } },
    { title: "Faction Invitation", desc: "A major force has taken notice of your talent.", effect: () => { if (!char.affiliations) char.affiliations = []; char.affiliations.push({ type: "Invitation", name: "Mysterious Faction" }); } },
    { title: "Nothing", desc: "The day passed quietly. Sometimes the Heavenly Dao gives no gifts.", effect: () => {} }
  ];
  const op = opportunities[Math.floor(Math.random() * opportunities.length)];
  op.effect();
  saveState();
  showToast(op.title + ": " + op.desc);
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
      <h3 class="card-title" style="margin-bottom:12px;">Travel Log</h3>
      <p style="color:var(--text-muted);">Click a region above to travel. Your current location affects events and opportunities.</p>
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
  if (Math.random() > 0.55) {
    const events = [
      "On the road you encountered a group of roaming magical beasts.",
      "A mysterious cultivator exchanged a few words with you before vanishing.",
      "You found a small herb that can slightly improve Dou Qi recovery.",
      "Rumors of a nearby secret realm reached your ears.",
      "The journey was quiet. The Heavenly Dao remained silent."
    ];
    const ev = events[Math.floor(Math.random()*events.length)];
    state.events = state.events || [];
    state.events.push({ title: "Travel Event", desc: ev });
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
  pricing: { title: 'Cultivation Paths', render: renderPricing }
};

function switchView(viewName) {
  const view = views[viewName];
  if (!view) return;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  document.getElementById('breadcrumb').textContent = view.title;
  document.getElementById('content').innerHTML = view.render();
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
    }, 600);
  }, 1100);

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('btn-save').addEventListener('click', saveState);
  document.getElementById('btn-export').addEventListener('click', () => {
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

  switchView('dashboard');
});
