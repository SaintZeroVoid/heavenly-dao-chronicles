// ======================
// HEAVENLY DAO CHRONICLES
// Main Application Logic
// ======================

let state = JSON.parse(localStorage.getItem('heavenlyDaoState')) || { ...DEFAULT_STATE };

function saveState() {
  localStorage.setItem('heavenlyDaoState', JSON.stringify(state));
  showToast('World state saved to Heavenly Dao Memory');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2800);
}

// ========== VIEW RENDERERS ==========

function renderDashboard() {
  const char = state.characters.find(c => c.id === state.currentCharacterId) || state.characters[0];
  const world = state.world;

  return `
    <div class="grid-2" style="margin-bottom: 24px;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Cultivator Profile</h3>
          ${char ? `<span class="badge badge-gold">${char.star} ${char.realm}</span>` : ''}
        </div>
        ${char ? `
          <div style="display:flex; gap:20px; align-items:flex-start;">
            <div style="width:80px;height:80px;background:linear-gradient(135deg,#2a2a3a,#1a1a25);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:1px solid var(--border-glow);">
              ${char.gender === 'Male' ? '⚔' : '🌸'}
            </div>
            <div style="flex:1;">
              <h2 style="font-family:var(--font-display);color:var(--gold);margin-bottom:4px;">${char.name}</h2>
              <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">${char.age} years · ${char.gender} · ${char.race}</p>
              <div class="grid-2" style="gap:10px;">
                <div><span style="color:var(--text-dim);font-size:0.75rem;">ATTRIBUTE</span><br><strong>${char.attribute}</strong></div>
                <div><span style="color:var(--text-dim);font-size:0.75rem;">PHYSIQUE</span><br><strong>${char.physique}</strong></div>
                <div><span style="color:var(--text-dim);font-size:0.75rem;">BLOODLINE</span><br><strong>${char.bloodline}</strong></div>
                <div><span style="color:var(--text-dim);font-size:0.75rem;">TALENT</span><br><strong>${char.talent}</strong></div>
              </div>
            </div>
          </div>
          <div class="section-divider"></div>
          <div class="grid-3">
            <div class="stat-box">
              <div class="label">Dou Qi</div>
              <div class="value">${char.douQi || '—'}</div>
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
        ` : `
          <div class="empty-state">
            <div class="icon">👤</div>
            <p>No cultivator selected. Create one in the Character tab.</p>
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
          <p style="color:var(--text-muted);margin-bottom:16px;line-height:1.6;">${world.currentEra}</p>
          <div style="margin-bottom:12px;">
            <span style="color:var(--text-dim);font-size:0.75rem;">CURRENT REGION</span>
            <p><strong>Central Land</strong> — Home of the Eight Ancient Clans</p>
          </div>
          <div style="margin-bottom:12px;">
            <span style="color:var(--text-dim);font-size:0.75rem;">THREAT LEVEL</span>
            <p><span class="badge badge-red">High</span> — Ancient Clan movements detected</p>
          </div>
          <div>
            <span style="color:var(--text-dim);font-size:0.75rem;">MAJOR EVENTS</span>
            <ul style="margin-top:8px;padding-left:18px;color:var(--text-muted);font-size:0.9rem;">
              <li>Heavenly Flame fluctuation in the Innerland</li>
              <li>Gu Clan young generation tournament approaching</li>
              <li>Rumors of a Dou Saint inheritance</li>
            </ul>
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
            <div style="padding:12px;background:var(--bg-deep);border-radius:8px;border:1px solid var(--border);">
              <strong style="color:var(--gold);">${ch.title}</strong>
              <p style="color:var(--text-muted);font-size:0.9rem;margin-top:6px;">${ch.content.substring(0, 160)}...</p>
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
        <button class="btn-primary" onclick="createWorld()">✦ Generate New World</button>
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
            <p style="color:var(--text-muted);line-height:1.7;">${state.world.origin}</p>
            <h4 style="color:var(--gold);margin:20px 0 8px;font-family:var(--font-display);">Creation Myth</h4>
            <p style="color:var(--text-muted);line-height:1.7;">${state.world.creationMyth}</p>
          </div>
          <div>
            <h4 style="color:var(--gold);margin-bottom:8px;font-family:var(--font-display);">Ancient Era</h4>
            <p style="color:var(--text-muted);line-height:1.7;">${state.world.ancientEra}</p>
            <h4 style="color:var(--gold);margin:20px 0 8px;font-family:var(--font-display);">Current Era</h4>
            <p style="color:var(--text-muted);line-height:1.7;">${state.world.currentEra}</p>
          </div>
        </div>
        <div class="section-divider"></div>
        <h4 style="color:var(--gold);margin-bottom:16px;font-family:var(--font-display);">World Map Regions</h4>
        <div class="grid-4">
          <div class="stat-box">
            <div class="label">Outerland</div>
            <div class="sub" style="margin-top:8px;line-height:1.5;">${state.world.regions.outerland}</div>
          </div>
          <div class="stat-box">
            <div class="label">Innerland</div>
            <div class="sub" style="margin-top:8px;line-height:1.5;">${state.world.regions.innerland}</div>
          </div>
          <div class="stat-box">
            <div class="label">Mainland</div>
            <div class="sub" style="margin-top:8px;line-height:1.5;">${state.world.regions.mainland}</div>
          </div>
          <div class="stat-box">
            <div class="label">Central Land</div>
            <div class="sub" style="margin-top:8px;line-height:1.5;">${state.world.regions.central}</div>
          </div>
        </div>
        <div class="section-divider"></div>
        <h4 style="color:var(--gold);margin-bottom:8px;font-family:var(--font-display);">Heavenly Laws</h4>
        <p style="color:var(--text-muted);">${state.world.heavenlyLaws}</p>
        <h4 style="color:var(--gold);margin:16px 0 8px;font-family:var(--font-display);">Cultivation Rules</h4>
        <p style="color:var(--text-muted);">${state.world.cultivationRules}</p>
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
        <button class="btn-primary" onclick="createCharacter()">✦ Generate Character</button>
      </div>
      <p style="color:var(--text-muted);">Create detailed cultivators with full backgrounds, talents, and destinies.</p>
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
            </div>
            <p style="font-size:0.85rem;color:var(--text-muted);">${c.personality} · ${c.physique}</p>
            <p style="font-size:0.8rem;color:var(--text-dim);margin-top:8px;">Dream: ${c.dreams}</p>
            ${state.currentCharacterId === c.id ? '<div style="margin-top:10px;"><span class="badge badge-green">Active</span></div>' : ''}
          </div>
        `).join('')}
      </div>
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
  const char = state.characters.find(c => c.id === state.currentCharacterId) || state.characters[0];
  if (!char) {
    return `<div class="card"><div class="empty-state"><div class="icon">⚡</div><p>Select or create a character first.</p></div></div>`;
  }

  return `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h3 class="card-title">Cultivation Simulator — ${char.name}</h3>
        <span class="badge badge-gold">${char.star} ${char.realm}</span>
      </div>
      <div class="grid-3" style="margin-bottom:24px;">
        <div class="stat-box">
          <div class="label">Dou Qi Amount</div>
          <div class="value">${char.douQi}</div>
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
      <div class="grid-2">
        <button class="btn-primary" style="width:100%;padding:14px;" onclick="trainCharacter()">☯ Meditate & Train Dou Qi</button>
        <button class="btn-ghost" style="width:100%;padding:14px;" onclick="attemptBreakthrough()">⚡ Attempt Breakthrough</button>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title" style="margin-bottom:16px;">Dou Qi Ranking System</h3>
      <div class="grid-4">
        ${DOU_QI_RANKS.map(r => `
          <div class="stat-box" style="${r.name === char.realm ? 'border-color:var(--gold);box-shadow:var(--glow-gold);' : ''}">
            <div class="label">${r.category}</div>
            <div class="value" style="font-size:1.1rem;">${r.name}</div>
          </div>
        `).join('')}
      </div>
      <p style="color:var(--text-muted);margin-top:20px;font-size:0.9rem;">
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
      <p style="color:var(--text-muted);">Huang → Xuan → Di → Tian → Saint Rank techniques.</p>
    </div>
    ${state.techniques.length ? `
      <div class="grid-2">
        ${state.techniques.map(t => `
          <div class="card">
            <div class="card-header">
              <h4 style="color:var(--gold);font-family:var(--font-display);">${t.name}</h4>
              <span class="badge badge-gold">${t.rank}</span>
            </div>
            <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">Attribute: <strong>${t.attribute}</strong></p>
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
      <p style="color:var(--text-muted);">The 23 Heavenly Flames are the most mysterious and powerful existences in the world of alchemy and combat.</p>
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
      <p style="color:var(--text-muted);margin-bottom:24px;">Alchemy ranks from 1st Grade to Divine Alchemist. Pills can change destinies.</p>
      
      <div class="grid-3" style="margin-bottom:24px;">
        ${['1st–3rd Grade', '4th–6th Grade', '7th–9th Grade', 'Saint Alchemist', 'Divine Alchemist'].map((r, i) => `
          <div class="stat-box">
            <div class="label">Tier ${i + 1}</div>
            <div class="value" style="font-size:1rem;">${r}</div>
          </div>
        `).join('')}
      </div>

      <div id="alchemy-result"></div>
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
          </div>
        `).join('')}
      </div>
    ` : `<div class="card"><div class="empty-state"><div class="icon">🐉</div><p>No magical beasts recorded.</p></div></div>`}
  `;
}

function renderFactions() {
  return `
    <div class="grid-2" style="margin-bottom:24px;">
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">Eight Ancient Clans</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${ANCIENT_CLANS.map(c => `
            <div style="padding:12px;background:var(--bg-deep);border-radius:8px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
              <div>
                <strong style="color:var(--gold);">${c.name}</strong>
                <div style="font-size:0.8rem;color:var(--text-muted);">Bloodline: ${c.bloodline}</div>
              </div>
              <span class="badge badge-gold">${c.treasure}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">Five Supreme Beast Clans</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${BEAST_CLANS.map(c => `
            <div style="padding:14px;background:var(--bg-deep);border-radius:8px;border:1px solid var(--border);">
              <strong style="color:var(--red-glow);">${c}</strong>
            </div>
          `).join('')}
        </div>
        <div class="section-divider"></div>
        <button class="btn-primary" style="width:100%;" onclick="createSect()">🏯 Create Your Own Sect</button>
        <div id="sect-result" style="margin-top:16px;"></div>
      </div>
    </div>
  `;
}

function renderBattle() {
  const chars = state.characters;
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Battle Simulation AI</h3>
      </div>
      <p style="color:var(--text-muted);margin-bottom:24px;">Simulate battles using realm, techniques, experience, bloodline, and strategy. The AI explains why one side wins.</p>
      
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
        <div class="stat-box">
          <div class="label">Public Worlds</div>
          <div class="value">128</div>
        </div>
        <div class="stat-box">
          <div class="label">Shared Characters</div>
          <div class="value">1,847</div>
        </div>
        <div class="stat-box">
          <div class="label">Active Creators</div>
          <div class="value">392</div>
        </div>
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
          <ul>
            ${t.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <button class="btn-primary" style="width:100%;">${t.price === 'Free' ? 'Current Path' : 'Ascend'}</button>
        </div>
      `).join('')}
    </div>
  `;
}

// ========== ACTIONS ==========

function createWorld() {
  state.world = generateWorld();
  saveState();
  switchView('world');
  showToast(`World "${state.world.name}" has been born under the Heavenly Dao`);
}

function createCharacter() {
  const char = generateCharacter();
  state.characters.push(char);
  if (!state.currentCharacterId) state.currentCharacterId = char.id;
  saveState();
  switchView('character');
  showToast(`${char.name} has entered the world`);
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
  state.flames.push(generateFlame());
  saveState();
  switchView('flames');
  showToast('A Heavenly Flame has been discovered!');
}

function createBeast() {
  state.beasts.push(generateBeast());
  saveState();
  switchView('beasts');
  showToast('Magical beast recorded');
}

function createSect() {
  const name = rand(["Burning Heaven Sect", "Void Spirit Gate", "Nine Dragons Pavilion", "Azure Cloud Sect", "Demon Flame Hall"]);
  const result = document.getElementById('sect-result');
  if (result) {
    result.innerHTML = `
      <div class="ai-output">
        <h4>${name}</h4>
        <p><strong>Rank:</strong> Small Sect → potential to grow into Ancient Sect</p>
        <p><strong>Territory:</strong> Innerland border</p>
        <p><strong>Founder:</strong> ${generateName()}</p>
        <p><strong>Inherited Technique:</strong> ${generateTechnique().name}</p>
        <p><strong>Current Disciples:</strong> ${randInt(20, 80)}</p>
        <p style="margin-top:10px;color:var(--text-muted);">The sect has been established. Its future depends on your actions and the will of the Heavenly Dao.</p>
      </div>
    `;
  }
  showToast(`${name} founded`);
}

function trainCharacter() {
  const char = state.characters.find(c => c.id === state.currentCharacterId) || state.characters[0];
  if (!char) return;
  char.douQi = (char.douQi || 100) + randInt(50, 300);
  char.purity = Math.min(100, (char.purity || 40) + randInt(1, 4));
  char.control = Math.min(100, (char.control || 30) + randInt(1, 3));
  char.experience = Math.min(100, (char.experience || 20) + randInt(2, 6));
  saveState();
  switchView('cultivation');
  showToast(`${char.name} trained diligently. Dou Qi increased.`);
}

function attemptBreakthrough() {
  const char = state.characters.find(c => c.id === state.currentCharacterId) || state.characters[0];
  if (!char) return;

  const rankIndex = DOU_QI_RANKS.findIndex(r => r.name === char.realm);
  const starIndex = STARS.indexOf(char.star);

  const successChance = (char.talent === 'Monster' ? 0.7 : char.talent === 'Genius' ? 0.5 : 0.3) + (char.foundation / 200);
  const success = Math.random() < successChance;

  if (success) {
    if (starIndex < STARS.length - 1) {
      char.star = STARS[starIndex + 1];
    } else if (rankIndex < DOU_QI_RANKS.length - 1) {
      char.realm = DOU_QI_RANKS[rankIndex + 1].name;
      char.star = '1-Star';
    }
    char.foundation = Math.max(30, char.foundation - 15);
    showToast(`Breakthrough successful! ${char.name} is now ${char.star} ${char.realm}`);
  } else {
    char.foundation = Math.max(10, char.foundation - 5);
    showToast(`Breakthrough failed. Foundation damaged. The Heavenly Dao is unmoved.`);
  }
  saveState();
  switchView('cultivation');
}

function refinePill() {
  const result = document.getElementById('alchemy-result');
  const pills = [
    { name: "Qi Gathering Pill", grade: "3rd Grade", effect: "Increases Dou Qi recovery speed for 7 days." },
    { name: "Foundation Strengthening Pill", grade: "5th Grade", effect: "Improves cultivation foundation and reduces breakthrough risk." },
    { name: "Soul Nurturing Pill", grade: "6th Grade", effect: "Strengthens spiritual force and comprehension." },
    { name: "Heavenly Flame Resistance Pill", grade: "7th Grade", effect: "Grants temporary resistance to high-ranked flames." },
    { name: "Nine Revolution Golden Pill", grade: "9th Grade", effect: "Massive boost to cultivation speed. Extremely rare." }
  ];
  const pill = rand(pills);
  if (result) {
    result.innerHTML = `
      <div class="ai-output">
        <h4>Refinement Result: ${pill.name}</h4>
        <p><strong>Grade:</strong> ${pill.grade}</p>
        <p><strong>Effect:</strong> ${pill.effect}</p>
        <p style="margin-top:10px;color:var(--text-muted);">The pill tribulation was ${rand(['mild', 'fierce', 'almost catastrophic'])}. The alchemist succeeded.</p>
      </div>
    `;
  }
  showToast(`${pill.name} successfully refined`);
}

function simulateBattle() {
  const id1 = document.getElementById('fighter1').value;
  const id2 = document.getElementById('fighter2').value;
  const f1 = state.characters.find(c => c.id == id1);
  const f2 = state.characters.find(c => c.id == id2);
  if (!f1 || !f2 || f1.id === f2.id) {
    showToast('Select two different fighters');
    return;
  }
  const result = generateBattleResult(f1, f2);
  const el = document.getElementById('battle-result');
  if (el) {
    el.innerHTML = `
      <div class="ai-output">
        <h4>Battle Result</h4>
        <p><strong>Winner:</strong> <span style="color:var(--gold);">${result.winner}</span></p>
        <p><strong>Loser:</strong> ${result.loser}</p>
        <p style="margin-top:12px;">${result.reason}</p>
        <p style="margin-top:12px;color:var(--text-muted);"><em>Impact:</em> ${result.impact}</p>
      </div>
    `;
  }
  showToast('Battle concluded');
}

function generateChapter() {
  if (!state.world) {
    showToast('Create a world first');
    return;
  }
  const char = state.characters.find(c => c.id === state.currentCharacterId) || state.characters[0] || generateCharacter();
  if (!state.characters.length) {
    state.characters.push(char);
    state.currentCharacterId = char.id;
  }
  const chapter = generateStoryChapter(state.world, char);
  state.storyChapters.push(chapter);
  saveState();
  switchView('story');
  showToast('New chapter written by the Heavenly Dao');
}

// ========== NAVIGATION ==========

const views = {
  dashboard: { title: 'Dashboard', render: renderDashboard },
  world: { title: 'World Creator', render: renderWorld },
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
  // Loading screen
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
    }, 600);
  }, 1200);

  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Top buttons
  document.getElementById('btn-save').addEventListener('click', saveState);
  document.getElementById('btn-export').addEventListener('click', () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heavenly-dao-world-${Date.now()}.json`;
    a.click();
    showToast('World exported as JSON');
  });

  // Initial view
  switchView('dashboard');
});
