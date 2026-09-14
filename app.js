/**
 * ScavX Portal // Interactive Client Logic
 * Author mod: [Grump]SunlessK
 * Architecture: Clean Semantic JS & Kinetic UI
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCounts();
  initCommandCenter();
  initEditPSync();
  initArsenal();
  initThreatMatrix();
  initInspector();
  initModal();
  initNavScroll();
});

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// Clipboard copy helper
async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(successMsg);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    showToast('Copy failed. Please manually copy.');
    return false;
  }
}

// Number formatter helper (e.g. 1500000 -> 1.5M, 50000 -> 50K)
function formatNum(num) {
  if (num === null || num === undefined || num === 'N/A') return 'N/A';
  const val = Number(num);
  if (isNaN(val)) return num;
  if (val >= 1000000) {
    return (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1) + 'M';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'K';
  }
  return val.toLocaleString();
}

// -------------------------------------------------------------
// 1. HERO SECTION COUNTS
// -------------------------------------------------------------
function initHeroCounts() {
  const unitsCountEl = document.getElementById('heroUnitsCount');
  const squadsCountEl = document.getElementById('heroSquadsCount');
  if (unitsCountEl && window.CUSTOM_UNITS) {
    unitsCountEl.textContent = window.CUSTOM_UNITS.length;
  }
  if (squadsCountEl && window.SCAVENGER_SQUADS) {
    squadsCountEl.textContent = window.SCAVENGER_SQUADS.length;
  }
}

// -------------------------------------------------------------
// 2. HOST COMMAND DECK
// -------------------------------------------------------------
function initCommandCenter() {
  const container = document.getElementById('commandItemsContainer');
  const btnCopyAll = document.getElementById('btnCopyAllCommands');
  const btnCopyNav = document.getElementById('btnCopyAllNav');
  const btnExportTxt = document.getElementById('btnExportTxt');

  if (!container || !window.RAW_COMMANDS) return;

  container.innerHTML = '';
  const totalCmds = window.RAW_COMMANDS.length;

  window.RAW_COMMANDS.forEach((cmd, idx) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'command-item';
    itemEl.title = `Click to copy all ${totalCmds} commands in batch (all required)`;

    const cmdName = cmd.id || cmd.name;
    const cmdLabel = cmd.label || cmd.title || cmdName;
    const cmdCode = cmd.code || cmd.b64;
    const previewChars = cmdCode.substring(0, 48) + '...';

    itemEl.innerHTML = `
      <div class="command-info-col">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="badge-tag">STEP ${idx + 1} / ${totalCmds}</span>
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-light); text-transform: uppercase; font-weight: 700;">${cmd.badge || 'TWEAK'}</span>
        </div>
        <h4 style="font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: var(--brand-dark); margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cmdLabel}">
          ${cmdLabel}
        </h4>
        <p>${cmd.desc}</p>
        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-light); margin-top: 4px;">
          Parameter: <strong style="color: var(--brand-orange);">${cmdName}</strong> • ${cmdCode.length.toLocaleString()} chars
        </div>
      </div>

      <div class="command-code-box">
        <div class="code-snippet">
          <span class="cmd">!bset ${cmdName}</span>
          <span style="color: #64748b;"> ${previewChars}</span>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: flex-end;">
        <span class="badge-required" title="All ${totalCmds} steps are required together in batch">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          REQUIRED BATCH
        </span>
      </div>
    `;

    // Clicking anywhere on the row copies the entire required batch
    itemEl.addEventListener('click', () => {
      copyAllAction();
      itemEl.style.borderColor = 'var(--brand-orange)';
      setTimeout(() => {
        itemEl.style.borderColor = '';
      }, 1200);
    });

    container.appendChild(itemEl);
  });

  // Batch copy handler (Copies all commands at once)
  const copyAllAction = () => {
    const allLines = window.RAW_COMMANDS.map(c => `!bset ${c.id || c.name} ${c.code || c.b64}`).join('\n');
    copyToClipboard(allLines, `Copied all ${totalCmds} commands in batch! Paste directly into BAR lobby chat.`);
  };

  if (btnCopyAll) btnCopyAll.addEventListener('click', copyAllAction);
  if (btnCopyNav) btnCopyNav.addEventListener('click', copyAllAction);
  const btnCopyBottom = document.getElementById('btnCopyAllBottom');
  if (btnCopyBottom) btnCopyBottom.addEventListener('click', copyAllAction);

  // Export .txt file handler
  if (btnExportTxt) {
    btnExportTxt.addEventListener('click', () => {
      const header = `# =========================================================\n# ScavX Mod for Beyond All Reason (BAR)\n# Mod Author: [Grump]SunlessK\n# Total Injection Commands: ${totalCmds} (All Required Together)\n# =========================================================\n\n`;
      const content = header + window.RAW_COMMANDS.map(c => `# [${c.label || c.title || c.id}]\n# ${c.desc}\n!bset ${c.id || c.name} ${c.code || c.b64}\n`).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ScavX_Commands_SunlessK.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Exported ScavX_Commands_SunlessK.txt');
    });
  }
}

// -------------------------------------------------------------
// EDITP STUDIO & TWO-WAY PROJECT SYNC
// -------------------------------------------------------------
function initEditPSync() {
  const btnDownload = document.getElementById('btnDownloadEditPProject');
  const dropzone = document.getElementById('editpDropzone');
  const fileInput = document.getElementById('editpFileInput');

  if (btnDownload) {
    btnDownload.addEventListener('click', async () => {
      try {
        const resp = await fetch('scavx.editp.json');
        let projectJson = '';
        if (resp.ok) {
          projectJson = await resp.text();
        } else {
          projectJson = JSON.stringify({
            version: '1.9',
            projectName: 'ScavX',
            projectAuthor: '[Grump]SunlessK',
            clones: window.CUSTOM_UNITS || []
          }, null, 2);
        }
        const blob = new Blob([projectJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scavx.editp.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded scavx.editp.json! Open in edit-p-nine.vercel.app');
      } catch (err) {
        console.error(err);
        showToast('Downloaded project file.');
      }
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleEditPFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleEditPFileUpload(e.target.files[0]);
      }
    });
  }
}

function handleEditPFileUpload(file) {
  if (!file.name.endsWith('.json')) {
    showToast('Please upload a .json BAR Editor project document.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (!data.clones && !data.tweaks && !data.buildMenuSteps) {
        showToast('Invalid project document: missing clones or tweaks data.');
        return;
      }

      // Sync imported clones into CUSTOM_UNITS
      let importedCount = 0;
      if (Array.isArray(data.clones) && data.clones.length > 0) {
        data.clones.forEach(clone => {
          const cloneId = clone.newId || clone.id;
          const patch = (data.tweaks && data.tweaks[cloneId]) || {};
          
          const existing = (window.CUSTOM_UNITS || []).find(u => u.id === cloneId);
          if (existing) {
            if (clone.name) existing.name = clone.name;
            if (clone.description) existing.desc = clone.description;
            if (patch.health) existing.hp = patch.health;
            if (patch.metalcost) existing.metal = patch.metalcost;
            if (patch.energycost) existing.energy = patch.energycost;
            if (patch.buildtime) existing.buildTime = patch.buildtime;
            if (patch.speed) existing.speed = patch.speed;
          } else {
            window.CUSTOM_UNITS.push({
              id: cloneId,
              name: clone.name || cloneId,
              category: 'boss',
              tier: 'Custom Clone',
              source: clone.baseId || 'armflash',
              role: 'Custom EditP Cloned Unit',
              desc: clone.description || 'Imported from EditP studio.',
              hp: patch.health || 50000,
              metal: patch.metalcost || 20000,
              energy: patch.energycost || 200000,
              buildTime: patch.buildtime || 50000,
              speed: patch.speed || 30,
              weapons: [],
              features: ['EditP Custom Unit']
            });
          }
          importedCount++;
        });
      }

      // Re-render UI
      initHeroCounts();
      updateCategoryCounts();
      renderArsenal();
      showToast(`Successfully synced ${importedCount} units from EditP!`);
    } catch (err) {
      console.error(err);
      showToast('Error parsing EditP JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------
// 3. ARSENAL COMPENDIUM & FILTERING
// -------------------------------------------------------------
let currentCategory = 'all';
let currentSearch = '';

function initArsenal() {
  const grid = document.getElementById('unitGridContainer');
  const searchInput = document.getElementById('unitSearchInput');
  const pillGroup = document.getElementById('categoryPillGroup');

  if (!grid || !window.CUSTOM_UNITS) return;

  // Category counts
  updateCategoryCounts();

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderArsenal();
    });
  }

  // Pill click handler
  if (pillGroup) {
    pillGroup.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        pillGroup.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderArsenal();
      });
    });
  }

  renderArsenal();
}

function updateCategoryCounts() {
  const units = window.CUSTOM_UNITS || [];
  const cAll = document.getElementById('countAll');
  const cBoss = document.getElementById('countBoss');
  const cTurret = document.getElementById('countTurret');
  const cShield = document.getElementById('countShield');
  const cEco = document.getElementById('countEco');

  if (cAll) cAll.textContent = units.length;
  if (cBoss) cBoss.textContent = units.filter(u => u.category === 'boss' || u.category === 'titan').length;
  if (cTurret) cTurret.textContent = units.filter(u => u.category === 'turret').length;
  if (cShield) cShield.textContent = units.filter(u => u.category === 'shield' || u.category === 'utility').length;
  if (cEco) cEco.textContent = units.filter(u => u.category === 'eco').length;
}

function renderArsenal() {
  const grid = document.getElementById('unitGridContainer');
  if (!grid || !window.CUSTOM_UNITS) return;

  const filtered = window.CUSTOM_UNITS.filter(unit => {
    // Category match
    const catMatch = 
      currentCategory === 'all' || 
      unit.category === currentCategory ||
      (currentCategory === 'boss' && (unit.category === 'boss' || unit.category === 'titan')) ||
      (currentCategory === 'shield' && (unit.category === 'shield' || unit.category === 'utility'));

    // Search match
    const query = currentSearch;
    const baseSource = unit.source || unit.baseUnit || '';
    const searchMatch = !query || 
      unit.name.toLowerCase().includes(query) ||
      (unit.role && unit.role.toLowerCase().includes(query)) ||
      (unit.desc && unit.desc.toLowerCase().includes(query)) ||
      unit.id.toLowerCase().includes(query) ||
      baseSource.toLowerCase().includes(query);

    return catMatch && searchMatch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #fff; border-radius: 8px; border: 1px dashed var(--border-strong);">
        <h4 style="font-family: var(--font-heading); font-size: 1.2rem; color: var(--text-muted); margin-bottom: 8px;">No units match your search</h4>
        <p style="font-size: 0.88rem; color: var(--text-light);">Try adjusting your keyword filter or switching category tabs.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(unit => {
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.setAttribute('data-id', unit.id);

    // Tier badge class
    let tierClass = '';
    const tier = unit.tier || 'T3';
    if (tier.includes('T4')) tierClass = 'tier-t4';
    if (tier.includes('Super') || tier.includes('Boss') || tier.includes('T5') || tier.includes('Titan')) tierClass = 'tier-super';

    // Extract stats
    const hp = unit.hp || (unit.stats && unit.stats.health) || 0;
    const metal = unit.metal || (unit.stats && unit.stats.metalCost) || 0;
    const energy = unit.energy || (unit.stats && unit.stats.energyCost) || 0;
    const speed = unit.speed !== undefined ? unit.speed : (unit.stats && unit.stats.speed !== undefined ? unit.stats.speed : 'Static');
    
    // Primary weapon range & damage
    let rangeVal = 'N/A';
    let damageVal = 'Special';
    if (unit.weapons && unit.weapons.length > 0) {
      const primary = unit.weapons[0];
      if (primary.range) rangeVal = formatNum(primary.range);
      if (primary.damage) damageVal = formatNum(primary.damage);
      if (primary.count && primary.count > 1) damageVal = `${primary.count}x ${formatNum(primary.damage)}`;
    }

    // Tags rendering
    const tagsHtml = (unit.features || [])
      .map(tag => `<span class="feature-pill">${tag}</span>`)
      .join('');

    card.innerHTML = `
      <div>
        <div class="unit-card-header">
          <span class="unit-tier-badge ${tierClass}">${tier}</span>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-light);">Clone: ${unit.source || unit.baseUnit || unit.id}</span>
        </div>

        <h4 class="unit-name">${unit.name}</h4>
        <div class="unit-role">${unit.role || ''}</div>
        <p class="unit-desc">${unit.desc || ''}</p>
      </div>

      <div>
        <div class="unit-stats-matrix">
          <div class="matrix-item">
            <span class="matrix-k">HEALTH</span>
            <span class="matrix-v">${formatNum(hp)}</span>
          </div>
          <div class="matrix-item">
            <span class="matrix-k">METAL</span>
            <span class="matrix-v">${formatNum(metal)}</span>
          </div>
          <div class="matrix-item">
            <span class="matrix-k">ENERGY</span>
            <span class="matrix-v">${formatNum(energy)}</span>
          </div>
          <div class="matrix-item">
            <span class="matrix-k">RANGE</span>
            <span class="matrix-v">${rangeVal}</span>
          </div>
          <div class="matrix-item">
            <span class="matrix-k">DAMAGE</span>
            <span class="matrix-v">${damageVal}</span>
          </div>
          <div class="matrix-item">
            <span class="matrix-k">SPEED</span>
            <span class="matrix-v">${speed}</span>
          </div>
        </div>

        <div class="unit-features-tags">
          ${tagsHtml}
        </div>
      </div>
    `;

    // Click to open modal
    card.addEventListener('click', () => {
      openUnitModal(unit);
    });

    grid.appendChild(card);
  });
}

// -------------------------------------------------------------
// 4. SCAVENGER SQUAD THREAT MATRIX
// -------------------------------------------------------------
function initThreatMatrix() {
  const tbody = document.getElementById('squadTableBody');
  if (!tbody || !window.SCAVENGER_SQUADS) return;

  tbody.innerHTML = '';

  window.SCAVENGER_SQUADS.forEach(squad => {
    const tr = document.createElement('tr');

    const beh = (squad.behavior || 'berserk').toLowerCase();

    // Behavior styling
    let badgeColor = '#64748b';
    let badgeBg = '#f1f5f9';
    if (beh === 'berserk') {
      badgeColor = '#dc2626';
      badgeBg = '#fee2e2';
    } else if (beh === 'raider') {
      badgeColor = '#ea580c';
      badgeBg = '#ffedd5';
    } else if (beh === 'kamikaze') {
      badgeColor = '#b45309';
      badgeBg = '#fef3c7';
    } else if (beh === 'artillery') {
      badgeColor = '#7c3aed';
      badgeBg = '#ede9fe';
    }

    // Anger progress bar
    const minAnger = (squad.angerRange && squad.angerRange[0]) || squad.minAnger || 0;
    const maxAnger = (squad.angerRange && squad.angerRange[1]) || squad.maxAnger || 100;
    const barLeft = Math.min(minAnger, 90);
    const barWidth = Math.max(8, maxAnger - minAnger);

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: var(--text-main);">${squad.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-light);">${squad.unit || squad.unitId}</div>
      </td>
      <td>
        <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; color: ${badgeColor}; background: ${badgeBg};">
          ${beh}
        </span>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="anger-gauge-container">
            <div class="anger-gauge-fill" style="margin-left: ${barLeft}%; width: ${barWidth}%;"></div>
          </div>
          <span style="font-size: 0.78rem; font-weight: 600;">${minAnger}% - ${maxAnger}%</span>
        </div>
      </td>
      <td><strong style="color: var(--text-main);">${squad.count || squad.unitsAmount}</strong> units</td>
      <td><strong style="color: var(--brand-blue);">${squad.weight}</strong></td>
      <td>${squad.dist || squad.distance}</td>
      <td><span class="badge-tag">${(squad.rarity || 'basic').toUpperCase()}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

// -------------------------------------------------------------
// 5. BASE64 & LUA INSPECTOR
// -------------------------------------------------------------
function initInspector() {
  const quickBox = document.getElementById('inspectorQuickButtons');
  const base64Input = document.getElementById('base64Input');
  const luaOutput = document.getElementById('luaOutput');
  const btnDecode = document.getElementById('btnDecodeLua');
  const btnEncode = document.getElementById('btnEncodeLua');
  const btnClear = document.getElementById('btnClearInspector');
  const btnCopyDecoded = document.getElementById('btnCopyDecoded');

  if (!quickBox || !window.RAW_COMMANDS) return;

  quickBox.innerHTML = '<span style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--text-muted); align-self: center; margin-right: 8px;">QUICK LOAD:</span>';
  window.RAW_COMMANDS.forEach((cmd, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm';
    btn.style.padding = '3px 8px';
    btn.style.fontSize = '0.75rem';
    const cmdName = cmd.id || cmd.name;
    btn.textContent = cmd.label || `Step ${idx + 1}`;
    btn.addEventListener('click', () => {
      base64Input.value = `!bset ${cmdName} ${cmd.code || cmd.b64}`;
      decodeInputString();
    });
    quickBox.appendChild(btn);
  });

  function decodeInputString() {
    let raw = base64Input.value.trim();
    if (!raw) {
      showToast('Please enter a Base64 string to decode');
      return;
    }

    // Strip !bset tweakXYZ prefix if present
    const match = raw.match(/!bset\s+\w+\s+([A-Za-z0-9+/=_-]+)/);
    if (match && match[1]) {
      raw = match[1];
    }

    try {
      const cleanB64 = raw.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(cleanB64);
      luaOutput.value = decoded;
      showToast('Decoded Base64 to Lua successfully');
    } catch (e) {
      showToast('Error: Invalid Base64 payload');
      console.error(e);
    }
  }

  function encodeInputString() {
    const rawLua = luaOutput.value.trim();
    if (!rawLua) {
      showToast('Please enter Lua code in the output pane to encode');
      return;
    }

    try {
      const encoded = btoa(rawLua);
      base64Input.value = encoded;
      showToast('Encoded Lua to Base64 successfully');
    } catch (e) {
      showToast('Error encoding to Base64');
      console.error(e);
    }
  }

  if (btnDecode) btnDecode.addEventListener('click', decodeInputString);
  if (btnEncode) btnEncode.addEventListener('click', encodeInputString);
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      base64Input.value = '';
      luaOutput.value = '';
      showToast('Inspector cleared');
    });
  }
  if (btnCopyDecoded) {
    btnCopyDecoded.addEventListener('click', () => {
      if (!luaOutput.value) {
        showToast('No Lua code to copy');
        return;
      }
      copyToClipboard(luaOutput.value, 'Copied Lua source code!');
    });
  }
}

// -------------------------------------------------------------
// 6. UNIT DETAIL MODAL
// -------------------------------------------------------------
function initModal() {
  const modal = document.getElementById('unitModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function openUnitModal(unit) {
  const modal = document.getElementById('unitModal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;

  const hp = unit.hp || (unit.stats && unit.stats.health) || 0;
  const metal = unit.metal || (unit.stats && unit.stats.metalCost) || 0;
  const energy = unit.energy || (unit.stats && unit.stats.energyCost) || 0;
  const buildTime = unit.buildTime || (unit.stats && unit.stats.buildTime) || 0;
  const tier = unit.tier || 'T3';

  // Render weapon blocks
  let weaponsHtml = '';
  if (unit.weapons && unit.weapons.length > 0) {
    weaponsHtml = unit.weapons.map(w => `
      <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: 6px; padding: 12px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-family: var(--font-heading); color: var(--text-main); font-size: 0.95rem;">${w.name}</strong>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--brand-blue);">${w.type || 'Primary Weapon'}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; font-family: var(--font-mono); font-size: 0.78rem;">
          <div><span style="color: var(--text-muted);">Damage:</span> <strong>${formatNum(w.damage)}</strong></div>
          <div><span style="color: var(--text-muted);">Reload:</span> <strong>${w.reload ? w.reload + 's' : (w.reloadTime ? w.reloadTime + 's' : 'N/A')}</strong></div>
          <div><span style="color: var(--text-muted);">Range:</span> <strong>${formatNum(w.range)}</strong></div>
          <div><span style="color: var(--text-muted);">Velocity:</span> <strong>${w.velocity || w.weaponVelocity || 'Instant'}</strong></div>
        </div>
      </div>
    `).join('');
  } else {
    weaponsHtml = `<p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">No offensive weapon defs (Defensive Shield / Construction Turret / Resource Generator).</p>`;
  }

  // Render shield section if unit has shields
  let shieldHtml = '';
  if (unit.shield) {
    shieldHtml = `
      <div style="margin-top: 18px; border-top: 1px solid var(--border-light); padding-top: 14px;">
        <h5 style="font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; color: var(--brand-blue); margin-bottom: 8px;">OVERDRIVEN DEFENSE SHIELD</h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; font-family: var(--font-mono); font-size: 0.82rem; background: var(--brand-blue-light); padding: 10px 14px; border-radius: 6px;">
          <div>Power: <strong style="color: #0369a1;">${formatNum(unit.shield.power)} HP</strong></div>
          <div>Radius: <strong>${unit.shield.radius}</strong></div>
          <div>Regen: <strong>${formatNum(unit.shield.powerRegen || 0)}/s</strong></div>
          <div>Start Power: <strong>${formatNum(unit.shield.startingPower || 0)}</strong></div>
        </div>
      </div>
    `;
  }

  // Render build options if constructor
  let buildOptionsHtml = '';
  if (unit.buildOptions && unit.buildOptions.length > 0) {
    buildOptionsHtml = `
      <div style="margin-top: 18px; border-top: 1px solid var(--border-light); padding-top: 14px;">
        <h5 style="font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; color: var(--brand-emerald); margin-bottom: 8px;">CONSTRUCTION UNLOCKS (${unit.buildOptions.length})</h5>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${unit.buildOptions.map(opt => `<span class="badge-tag" style="background: var(--brand-emerald-light); color: #065f46;">${opt}</span>`).join('')}
        </div>
      </div>
    `;
  }

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-right: 28px;">
      <div>
        <span class="unit-tier-badge ${tier.includes('T4') ? 'tier-t4' : (tier.includes('Super') ? 'tier-super' : '')}">${tier}</span>
        <h3 style="font-family: var(--font-heading); font-size: 1.6rem; margin: 4px 0 2px; color: var(--text-main);">${unit.name}</h3>
        <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--brand-orange);">${unit.role || ''}</div>
      </div>
    </div>

    <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
      ${unit.desc || ''}
    </p>

    <div style="background: var(--bg-main); border: 1px solid var(--border-light); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <h5 style="font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Base Stats & Unit Origins</h5>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; font-family: var(--font-mono);">
        <div><span style="color: var(--text-muted); font-size: 0.7rem;">UNIT ID:</span> <div style="font-weight: 700;">${unit.id}</div></div>
        <div><span style="color: var(--text-muted); font-size: 0.7rem;">BASE CLONE:</span> <div style="font-weight: 700;">${unit.source || unit.baseUnit || unit.id}</div></div>
        <div><span style="color: var(--text-muted); font-size: 0.7rem;">HEALTH:</span> <div style="font-weight: 700; color: #dc2626;">${formatNum(hp)}</div></div>
        <div><span style="color: var(--text-muted); font-size: 0.7rem;">METAL:</span> <div style="font-weight: 700; color: var(--brand-blue);">${formatNum(metal)}</div></div>
        <div><span style="color: var(--text-muted); font-size: 0.7rem;">ENERGY:</span> <div style="font-weight: 700; color: #d97706;">${formatNum(energy)}</div></div>
        <div><span style="color: var(--text-muted); font-size: 0.7rem;">BUILD TIME:</span> <div style="font-weight: 700;">${formatNum(buildTime)}</div></div>
      </div>
    </div>

    <div style="margin-top: 16px;">
      <h5 style="font-family: var(--font-mono); font-size: 0.78rem; text-transform: uppercase; color: var(--text-main); margin-bottom: 6px;">Weapon Systems & Defenses</h5>
      ${weaponsHtml}
    </div>

    ${shieldHtml}
    ${buildOptionsHtml}

    <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
      <a href="https://edit-p-nine.vercel.app/" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="border-color: var(--brand-blue); color: var(--brand-blue);">
        Edit in EditP ↗
      </a>
      <button id="modalCopyUnitCode" class="btn btn-outline btn-sm">Copy Unit ID</button>
      <button onclick="document.getElementById('unitModal').classList.remove('active')" class="btn btn-primary btn-sm">Done</button>
    </div>
  `;

  document.getElementById('modalCopyUnitCode').addEventListener('click', () => {
    copyToClipboard(unit.id, `Copied Unit ID: ${unit.id}`);
  });

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

// -------------------------------------------------------------
// 7. ACTIVE NAVIGATION SCROLL SPY
// -------------------------------------------------------------
function initNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  });
}
