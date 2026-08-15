// Combat / loadout module
window.DaoCombat = {
  getLoadout(state, char) {
    const lo = state.techLoadout || {};
    return {
      active: lo.active || (char && char.technique) || "None",
      passive: lo.passive || "None",
      weapon: (char && char.weapon) || "None",
      beast: (char && char.beastAssist) || "None",
      flame: (char && char.boundFlame) || "None",
      attribute: (char && char.attribute) || "None",
      mastery: (char && char.techMastery) || "Learned"
    };
  },
  renderLoadoutPanel(state, f1, f2) {
    const L1 = this.getLoadout(state, f1);
    const L2 = f2 ? this.getLoadout(state, f2) : null;
    return `
      <div class="loadout-grid" style="margin-bottom:16px;">
        <div class="loadout-panel">
          <h4>${f1 ? f1.name : "Fighter 1"} Loadout</h4>
          <div style="font-size:0.88rem;color:var(--ds-muted);line-height:1.7;">
            <div><strong>Active Tech:</strong> ${L1.active}</div>
            <div><strong>Passive Tech:</strong> ${L1.passive}</div>
            <div><strong>Mastery:</strong> ${L1.mastery}</div>
            <div><strong>Weapon:</strong> ${L1.weapon}</div>
            <div><strong>Attribute:</strong> ${L1.attribute}</div>
            <div><strong>Bound Flame:</strong> ${L1.flame}</div>
            <div><strong>Beast Assist:</strong> ${L1.beast}</div>
          </div>
        </div>
        <div class="loadout-panel">
          <h4>${f2 ? f2.name : "Fighter 2"} Loadout</h4>
          ${L2 ? `
          <div style="font-size:0.88rem;color:var(--ds-muted);line-height:1.7;">
            <div><strong>Active Tech:</strong> ${L2.active}</div>
            <div><strong>Passive Tech:</strong> ${L2.passive}</div>
            <div><strong>Weapon:</strong> ${L2.weapon}</div>
            <div><strong>Attribute:</strong> ${L2.attribute}</div>
          </div>` : `<p style="color:var(--ds-dim);font-size:0.9rem;">Select two fighters to compare loadouts.</p>`}
        </div>
      </div>
    `;
  }
};
