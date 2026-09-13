/**
 * ScavX to EditP Project Generator
 * Builds a 100% compliant BAR Editor v1.9 project document
 * Compatible with https://edit-p-nine.vercel.app/
 */

const fs = require('fs');
const path = require('path');
const d = require('./data.js');

function hashText(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

// 1. Build Clones & Unit Tweaks with flat scalar fields (required by EditP normalization)
const clones = [];
const tweaks = {};

d.CUSTOM_UNITS.forEach(u => {
  const baseId = u.source || u.baseUnit || 'armflash';
  const clone = {
    newId: u.id,
    baseId: baseId,
    name: u.name,
    description: u.desc || '',
    builderIds: u.buildOptions || [],
    weaponSwaps: {}
  };
  clones.push(clone);

  // Unit tweaks with flat scalar fields
  const unitTweak = {};
  if (u.hp) unitTweak.health = u.hp;
  if (u.metal) unitTweak.metalcost = u.metal;
  if (u.energy) unitTweak.energycost = u.energy;
  if (u.buildTime) unitTweak.buildtime = u.buildTime;
  if (u.speed !== undefined && u.speed !== 'Static') unitTweak.speed = u.speed;
  
  if (u.shield) {
    unitTweak.customparams_shield_power = String(u.shield.power);
    unitTweak.customparams_shield_radius = String(u.shield.radius);
  }

  if (u.weapons && u.weapons.length > 0) {
    u.weapons.forEach((w, wIdx) => {
      const slot = wIdx + 1;
      if (w.damage) unitTweak[`weapon_slot_${slot}_damage`] = String(w.damage);
      if (w.range) unitTweak[`weapon_slot_${slot}_range`] = String(w.range);
      if (w.reload || w.reloadTime) unitTweak[`weapon_slot_${slot}_reloadtime`] = String(w.reload || w.reloadTime);
      if (w.velocity) unitTweak[`weapon_slot_${slot}_weaponvelocity`] = String(w.velocity);
    });
  }

  tweaks[u.id] = unitTweak;
});

// Also add scavenger AI squad tweaks for base units
if (d.SCAVENGER_SQUADS) {
  d.SCAVENGER_SQUADS.forEach(squad => {
    const unitId = squad.unit || squad.unitId;
    if (unitId) {
      tweaks[unitId] = tweaks[unitId] || {};
      tweaks[unitId].customparams_scavcustomsquad = 'true';
      tweaks[unitId].customparams_scavsquadbehavior = String(squad.behavior || 'berserk');
      tweaks[unitId].customparams_scavsquadbehaviorchance = '1';
      tweaks[unitId].customparams_scavsquadbehaviordistance = String(squad.dist || squad.distance || 1000);
      tweaks[unitId].customparams_scavsquadmaxanger = String((squad.angerRange && squad.angerRange[1]) || 100);
      tweaks[unitId].customparams_scavsquadminanger = String((squad.angerRange && squad.angerRange[0]) || 40);
      tweaks[unitId].customparams_scavsquadrarity = String(squad.rarity || 'basic');
      tweaks[unitId].customparams_scavsquadunitsamount = String(squad.count || squad.unitsAmount || 20);
      tweaks[unitId].customparams_scavsquadweight = String(squad.weight || 100);
    }
  });
}

// 2. Build Menu Steps
const builderMap = {
  armaca: ['epicbas', 'epicantiair2', 'epicoly', 'pulsinator', 't3builder', 'epicsanctuary', 'epicbasilica', 'epicminiragna', 'epicbeamer', 'epicpluto', 'decimator', 't5sanctuary', 'epicbasilicaair', 'everyexpe', 't2metalgenerator', 'fountain', 'epicwall'],
  armack: ['epicbas', 'epicantiair2', 'epicoly', 'pulsinator', 't3builder', 'epicsanctuary', 'epicbasilica', 'epicminiragna', 'epicbeamer', 'epicpluto', 'decimator', 't5sanctuary', 'epicbasilicaair', 'everyexpe', 't2metalgenerator', 'fountain', 'epicwall'],
  legaca: ['epicbas', 'epicantiair2', 'epicoly', 'pulsinator', 't3builder', 'epicsanctuary', 'epicbasilica', 'epicminiragna', 'epicbeamer', 'epicpluto', 'decimator', 't5sanctuary', 'epicbasilicaair', 'everyexpe', 't2metalgenerator', 'fountain', 'epicwall'],
  t3builder: ['epicbas', 'epicantiair2', 'pulsinator', 'epicoly', 't3builder', 'corapt3', 'armapt3', 'legapt3', 'corgant', 'leggant', 'armshltx', 'epicsanctuary', 'epicminiragna', 'epicbasilica', 'armaap', 'coraap', 'armalab', 'coralab', 'armavp', 'coravp', 'legavp', 'legaap', 'legalab', 'epicbeamer', 'epicpluto', 'legafust3', 'corafust3', 'armafust3', 'legadveconvt3', 'cormmkrt3', 'armmmkrt3', 'corgatet3', 'decimator', 't5sanctuary', 'everyexpe', 'epicbasilicaair', 't2metalgenerator', 'fountain', 'epicwall']
};

const buildMenuSteps = Object.entries(builderMap).map(([builderId, addList]) => ({
  builderId,
  add: addList,
  remove: [],
  order: []
}));

// 3. Tweak Modules (Full Base64 & Lua Payloads)
const tweakModules = d.RAW_COMMANDS.map((cmd, idx) => {
  const buf = Buffer.from(cmd.code || cmd.b64, 'base64');
  let rawLua = '';
  try {
    rawLua = new TextDecoder('utf-8').decode(buf);
  } catch (e) {
    rawLua = buf.toString('latin1');
  }
  const kind = (cmd.id && cmd.id.includes('units')) ? 'units' : 'defs';
  const contentHash = hashText(rawLua);
  return {
    id: `${kind}-${contentHash}`,
    kind,
    label: cmd.label || cmd.title || cmd.id,
    sourceName: 'ScavX SunlessK Mod Set',
    originalFieldName: cmd.id || cmd.name,
    rawLua,
    originalPayload: cmd.code || cmd.b64,
    contentHash,
    enabled: true,
    converted: false,
    stage: 'before-editor',
    order: idx,
    attribution: '[Grump]SunlessK',
    requirements: []
  };
});

// 4. Collections
const unitCollections = [
  {
    id: 'col_scavx_titans',
    name: 'ScavX Titans & Bosses',
    unitIds: ['busters', 'kingchimera', 'multiplicable', 'thetyrannus', 'walkingfort', 'fatherbehe', 'ratteking']
  },
  {
    id: 'col_scavx_turrets',
    name: 'ScavX Defensive Bastions',
    unitIds: ['decimator', 'epicantiair2', 'epicbas', 'epicbasilica', 'epicbasilicaair', 'epicbeamer', 'epicminiragna', 'epicoly', 'epicpluto', 'fountain', 'pulsinator']
  },
  {
    id: 'col_scavx_shields_eco',
    name: 'ScavX Shields & Infrastructure',
    unitIds: ['epicsanctuary', 't5sanctuary', 'epicwall', 'wallnut', 't1metalgenerator', 't2metalgenerator', 't3builder', 'everyexpe']
  }
];

// Complete Document
const projectDocument = {
  version: '1.9',
  projectName: 'ScavX',
  projectAuthor: '[Grump]SunlessK',
  projectDesc: 'ScavX Scavenger & Boss Overhaul - Catastrophic Experimental Titans & Overdriven Bastions for Beyond All Reason. Designed with EditP.',
  tweaks,
  clones,
  buildMenuSteps,
  buildMenuPacks: { extraUnits: false, scavengerUnits: false },
  disabledUnitIds: [],
  unitDescriptions: {},
  weaponLibrary: [],
  supportingWeaponDefs: [],
  unitCollections,
  tweakModules,
  lobbySetup: {
    version: 1,
    sourceName: 'ScavX SunlessK Mod Set',
    commands: [
      { prefix: '!', name: 'bset', key: 'forceallunits', value: '1', raw: '!bset forceallunits 1', category: 'game-settings', safety: 'review', enabled: true }
    ],
    requirements: ['forceallunits']
  },
  includeTweaks: true,
  includeClones: true,
  includeRosters: true,
  includeHeader: true,
  exportOptimizationProfile: 'balanced'
};

// Write files
const jsonStr = JSON.stringify(projectDocument, null, 2);
fs.writeFileSync(path.join(__dirname, 'scavx.editp.json'), jsonStr, 'utf8');
fs.writeFileSync(path.join(__dirname, 'scavx_project.json'), jsonStr, 'utf8');

// Also try to place a copy in Bar editor
try {
  const barEditorPath = 'C:\\Users\\keith\\Desktop\\Bar editor';
  if (fs.existsSync(barEditorPath)) {
    fs.writeFileSync(path.join(barEditorPath, 'scavx.editp.json'), jsonStr, 'utf8');
    console.log('Saved copy to Bar editor root: ' + path.join(barEditorPath, 'scavx.editp.json'));
  }
} catch (e) {
  console.warn('Could not copy to Bar editor:', e.message);
}

console.log('scavx.editp.json generated successfully!');
console.log('Size:', jsonStr.length, 'bytes');
console.log('Clones:', clones.length);
console.log('Tweaks:', Object.keys(tweaks).length);
