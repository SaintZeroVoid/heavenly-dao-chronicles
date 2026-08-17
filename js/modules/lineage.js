window.DaoLineage = {
  renderTree(state) {
    const living = (state.characters || []).filter(c => c.alive !== false && (c.isFounder || c.isHeir || c.lineageId || c.generation));
    const dead = state.lineage && state.lineage.dead ? state.lineage.dead : [];
    const byGen = {};
    living.forEach(c => {
      const g = c.generation || 1;
      if (!byGen[g]) byGen[g] = [];
      byGen[g].push(c);
    });
    let html = '<div class="tree-wrap">';
    const gens = Object.keys(byGen).sort((a,b)=>a-b);
    gens.forEach((g, idx) => {
      html += `<div class="tree-gen"><div class="tree-gen-label">Generation ${g}</div><div class="tree-row">`;
      byGen[g].forEach(c => {
        const succ = state.succession && state.succession.designatedId === c.id ? " ★Successor" : "";
        html += `<div class="tree-node living"><strong>${c.name}${succ}</strong><span>${c.star||""} ${c.realm||""}</span><span>${c.spouse? "💍 "+c.spouse:""}</span><span>${c.parentName? "↳ "+c.parentName:""}</span></div>`;
      });
      html += '</div></div>';
      if (idx < gens.length - 1) html += '<div class="tree-connector">↓ parent lines to children ↓</div>';
    });
    if (dead.length) {
      html += '<div class="tree-gen"><div class="tree-gen-label">Ancestors (fallen)</div><div class="tree-row">';
      dead.slice(-12).forEach(d => {
        html += `<div class="tree-node dead"><strong>${d.name}</strong><span>Y${d.year}</span><span>${d.reason||""}</span></div>`;
      });
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }
};
