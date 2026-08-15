// Lineage UI helpers: family tree visual + pause choices
window.DaoLineage = {
  renderTree(state) {
    const living = (state.characters || []).filter(c => c.alive !== false && (c.isFounder || c.isHeir || c.lineageId));
    const dead = state.lineage && state.lineage.dead ? state.lineage.dead : [];
    const byGen = {};
    living.forEach(c => {
      const g = c.generation || 1;
      if (!byGen[g]) byGen[g] = [];
      byGen[g].push(c);
    });
    let html = '<div class="tree-wrap">';
    Object.keys(byGen).sort((a,b)=>a-b).forEach(g => {
      html += `<div class="tree-gen"><div class="tree-gen-label">Generation ${g}</div><div class="tree-row">`;
      byGen[g].forEach(c => {
        html += `<div class="tree-node living"><strong>${c.name}</strong><span>${c.star||""} ${c.realm||""}</span><span>${c.spouse? "💍 "+c.spouse:""}</span></div>`;
      });
      html += '</div></div>';
      html += '<div class="tree-connector">↓</div>';
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
