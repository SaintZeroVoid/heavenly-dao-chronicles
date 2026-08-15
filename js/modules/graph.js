// Visual branch graph with SVG connectors
window.DaoGraph = {
  render(visitedNodes, current, history) {
    const nodes = visitedNodes && visitedNodes.length ? visitedNodes.slice(-12) : ["start"];
    const w = Math.max(320, nodes.length * 130);
    const h = 110;
    let circles = "";
    let lines = "";
    nodes.forEach((n, i) => {
      const x = 60 + i * 120;
      const y = 55;
      if (i > 0) {
        const x0 = 60 + (i - 1) * 120;
        lines += `<line x1="${x0+28}" y1="${y}" x2="${x-28}" y2="${y}" stroke="#3a3a52" stroke-width="2" marker-end="url(#arrow)" />`;
      }
      const isCurrent = n === current;
      const fill = isCurrent ? "rgba(224,192,96,0.25)" : "rgba(93,173,226,0.12)";
      const stroke = isCurrent ? "#e0c060" : "#5dade2";
      circles += `<g>
        <circle cx="${x}" cy="${y}" r="26" fill="${fill}" stroke="${stroke}" stroke-width="2" />
        <text x="${x}" y="${y+4}" text-anchor="middle" fill="${isCurrent ? "#e0c060" : "#f2f0ea"}" font-size="9">${String(n).slice(0,10)}</text>
      </g>`;
    });
    return `
      <svg class="branch-svg" viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#3a3a52" />
          </marker>
        </defs>
        ${lines}${circles}
      </svg>
      <p style="color:var(--ds-dim);font-size:0.82rem;">SVG path of visited nodes (latest 12). Gold = current.</p>
      ${history && history.length ? `<p style="color:var(--ds-dim);font-size:0.82rem;">Choices: ${history.slice(-10).join(" → ")}</p>` : ""}
    `;
  }
};
