// UI module
window.DaoUI = {
  toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
  }
};

// Backwards-compatible global expected by many modules
window.showToast = function(msg) { window.DaoUI.toast(msg); };
