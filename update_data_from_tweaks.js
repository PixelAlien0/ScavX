const fs = require('fs');
const path = require('path');

// Clean synced unit list strictly adhering to the user's tweak and EditP defaults
const CUSTOM_UNITS = [
  {
    id: "busters",
    name: "Buster",
    category: "boss",
    tier: "T4 Experimental",
    source: "legkeres",
    icon: "legkeres",
    role: "Cloaked Heavy Assault Cruiser",
    desc: "Heavy Assault Tank with dual T2 Heatrays and Flakshard Cannon (Cloned from Legion Keres).",
    tooltip: "???",
    hp: 90000,
    metal: 50000,
    energy: 800000,
    buildTime: 160000,
    speed: 55,
    weapons: [
      { name: "Flakshard Cannon", damage: 3000, shieldDmg: 2000, range: 1500, reload: 1.0, velocity: 1000 },
      { name: "Dual T2 Heatrays", damage: 500, count: 2, range: 1700, reload: 1.0 }
    ],
    features: ["Innate Permanent Cloak", "Speed: 55", "Shield Breaker"]
  },
  {
    id: "decimator",
    name: "Ground Decimator",
    category: "turret",
    tier: "T4 Super Defense",
    source: "corbuzz",
    icon: "corbuzz",
    role: "The Ultimate Ground Defense",
    desc: "The Ultimate Ground Defense (The Ultimate Defence Turret - Type 1).",
    tooltip: "The Ultimate Defence Turret - Type 1",
    hp: 303500,
    metal: 500000,
    energy: 5000000,
    buildTime: 2400000,
    weapons: [
      { name: "Decimator LRPC", damage: 80000, shieldDmg: 40000, range: 4150, reload: 1.0, aoe: 300, velocity: 4150 }
    ],
    features: ["80,000 Damage / Shot", "Range: 4150", "AoE: 300"]
  },
  {
    id: "epicantiair2",
    name: "Epic Xyston",
    category: "turret",
    tier: "T4 Anti-Air",
    source: "leglraa",
    icon: "armfflak",
    role: "Homing Concentrated Energy Missile",
    desc: "Homing Concentrated Energy Missile (Counter for Heavy Armored Air Units).",
    tooltip: "Homing Concentrated Energy Missile",
    hp: 108670,
    metal: 200000,
    energy: 1536000,
    buildTime: 208000,
    weapons: [
      { name: "Adv SAM Railgun", damage: 50000, vtolDmg: 80000, range: 3000, reload: 0.9, velocity: 1700 }
    ],
    features: ["80k VTOL Damage", "Range: 3000", "Fast Retargeting"]
  },
  {
    id: "epicbas",
    name: "Epic Bastion",
    category: "turret",
    tier: "T4 Energy Bastion",
    source: "scavbeacon_t4",
    icon: "legbastion",
    role: "Heavy Concentrated Energy Beamer",
    desc: "Heavy Concentrated Energy Beamer (Cloned from Scavenger Beacon T4).",
    tooltip: "Epic Bastion",
    hp: 150000,
    metal: 21000,
    energy: 455000,
    buildTime: 120000,
    weapons: [
      { name: "T2 Heavy Heatray", damage: 450, range: 1700, reload: 0.1, energyCost: 400 }
    ],
    features: ["Rapid 0.1s Reload", "Range: 1700", "Self-Destruct Blast"]
  },
  {
    id: "epicbasilica",
    name: "Epic Basilica",
    category: "turret",
    tier: "T4 Heavy Artillery",
    source: "armbrtha",
    icon: "armbrtha",
    role: "Long Range Heavy Turret",
    desc: "Long Range Heavy Turret firing Meteor bombardment shells.",
    tooltip: "Long Range Heavy Turret",
    hp: 170000,
    metal: 50500,
    energy: 954000,
    buildTime: 420000,
    weapons: [
      { name: "Heavy Meteor Cannon", damage: 5000, bossDmg: 4500, shieldDmg: 3800, range: 2600, reload: 0.8, velocity: 3000 }
    ],
    features: ["5000 Damage", "Range: 2600", "0.8s Reload"]
  },
  {
    id: "epicbasilicaair",
    name: "Basiliscia F3",
    category: "turret",
    tier: "T4 Anti-Air Artillery",
    source: "armbrtha",
    icon: "armbrtha",
    role: "Counter for Heavy Armored Air Units",
    desc: "Counter for Heavy Armored Air Units (High Altitude Long Range VTOL Interceptor).",
    tooltip: "Counter for Heavy Armored Air Units",
    hp: 170000,
    metal: 100500,
    energy: 1254000,
    buildTime: 720000,
    weapons: [
      { name: "Anti-Air Meteor Cannon", damage: 5000, vtolDmg: 6000, range: 2900, reload: 0.6, velocity: 3500 }
    ],
    features: ["Targets VTOL Only", "Range: 2900", "6000 Air Damage"]
  },
  {
    id: "epicbeamer",
    name: "Epic Beamer",
    category: "turret",
    tier: "T3 Energy Turret",
    source: "armbeamer",
    icon: "armbeamer",
    role: "Continuous Concentrated Energy Beamer",
    desc: "Continuous Concentrated Energy Beamer.",
    tooltip: "Continuous Concentrated Energy Beamer",
    hp: 52430,
    metal: 12000,
    energy: 300000,
    buildTime: 22800,
    weapons: [
      { name: "Continuous Beam Laser", damage: 190, range: 1400, reload: 0.1 }
    ],
    features: ["Rapid 0.1s Reload", "Range: 1400", "1900 DPS"]
  },
  {
    id: "epicminiragna",
    name: "Epic Mini Ragnarok",
    category: "turret",
    tier: "T3 Rapid Turret",
    source: "armminivulc",
    icon: "corminibuzz",
    role: "Fast Turret Gunner",
    desc: "Fast Turret Gunner with 8000 impact damage.",
    tooltip: "Fast Turret Gunner",
    hp: 50700,
    metal: 15000,
    energy: 250000,
    buildTime: 115000,
    weapons: [
      { name: "Mini Ragnarok Cannon", damage: 8000, bossDmg: 1000, shieldDmg: 800, range: 1700, velocity: 2000 }
    ],
    features: ["8000 Damage", "Range: 1700", "Rapid Velocity: 2000"]
  },
  {
    id: "epicoly",
    name: "Epic Olympus",
    category: "turret",
    tier: "T3 Long Range Turret",
    source: "leglrpc",
    icon: "armvulc",
    role: "Heavy Meteor Turret",
    desc: "Heavy Meteor Turret firing 6-projectile cluster volleys.",
    tooltip: "Heavy Meteor Turret",
    hp: 95000,
    metal: 59000,
    energy: 965000,
    buildTime: 420000,
    weapons: [
      { name: "Heavy Sector LRPC", damage: 4700, count: 6, range: 4850, reload: 2.0, velocity: 2100 }
    ],
    features: ["6 Projectiles / Volley", "Range: 4850", "28.2k Burst Damage"]
  },
  {
    id: "epicpluto",
    name: "Epic Pluto",
    category: "turret",
    tier: "T3 Overdrive AA",
    source: "legflak",
    icon: "leglupara",
    role: "Overdrived Anti Air",
    desc: "Overdrived Anti Air with high-velocity microflak.",
    tooltip: "Overdrived Anti Air",
    hp: 40050,
    metal: 70020,
    energy: 1000000,
    buildTime: 29000,
    weapons: [
      { name: "Overdrived Microflak", damage: 800, vtolDmg: 1000, range: 1800 }
    ],
    features: ["1000 Air Damage", "Range: 1800", "Fast Build Time"]
  },
  {
    id: "epicsanctuary",
    name: "Epic Sanctuary",
    category: "shield",
    tier: "T4 Overdrive Shield",
    source: "corgatet3",
    icon: "leggatet3",
    role: "Long Radius Overdrived Shield",
    desc: "Long Radius Overdrived Shield (86,500 Shield HP, 1225 Radius).",
    tooltip: "Long Radius Overdrived Shield",
    hp: 62500,
    metal: 80000,
    energy: 1075000,
    buildTime: 575000,
    shield: { power: 86500, radius: 1225, powerRegen: 2650, powerRegenEnergy: 3812.5, startingPower: 40900 },
    features: ["86,500 Shield Power", "Radius: 1225", "Regen: 2650/s"]
  },
  {
    id: "epicwall",
    name: "Epic Wall",
    category: "utility",
    tier: "T3 Heavy Wall",
    source: "legforti",
    icon: "legforti",
    role: "Good for funnelling units",
    desc: "Good for funnelling units (500 Max Units Per Player).",
    tooltip: "Good for funnelling units (500 Max Units Per Player)",
    hp: 5500000,
    metal: 500,
    energy: 5000,
    buildTime: 3500,
    features: ["5.5M Health", "Mass: 100k", "Autoheal: 200/s", "Max: 500"]
  },
  {
    id: "everyexpe",
    name: "Everything Experimental",
    category: "utility",
    tier: "T4 Experimental Plant",
    source: "leghavp",
    icon: "leghavp",
    role: "Experimental Vehicle Plant",
    desc: "Produces Experimental Vehicles (Builds 43 Experimental Units & Titans).",
    tooltip: "???",
    hp: 90800,
    metal: 200900,
    energy: 1006000,
    buildTime: 167300,
    features: ["Builds 43 Experimental Units", "Workertime: 3000", "Energy Make: +3000/s"]
  },
  {
    id: "fatherbehe",
    name: "Father of All Behemoth",
    category: "boss",
    tier: "T4 Titan Walker",
    source: "corjugg",
    icon: "armafust3",
    role: "Mobile Heavy Turret Titan",
    desc: "Mobile Heavy Turret Titan with high speed and Annihilator ATA beam (Cloned from Behemoth).",
    tooltip: "???",
    hp: 535000,
    metal: 20000,
    energy: 513000,
    buildTime: 780000,
    speed: 32.5,
    weapons: [
      { name: "Heavy Tachyon Beam (ATA)", damage: 19000, range: 1200, reload: 2.0 }
    ],
    features: ["535,000 Health", "Speed: 32.5", "19,000 Beam Damage"]
  },
  {
    id: "fountain",
    name: "Fountain",
    category: "turret",
    tier: "T4 Super Artillery",
    source: "legcluster",
    icon: "armdecadet3",
    role: "Long Range Concentrated Cannon",
    desc: "Long Range Concentrated Cannon (Max Units 4 Per Player).",
    tooltip: "Long Range Concentrated Cannon (Max Units 4 Per Player)",
    hp: 150000,
    metal: 100000,
    energy: 1000000,
    buildTime: 300400,
    weapons: [
      { name: "Concentrated 6-Burst Cannon", damage: 28000, count: 6, range: 2500, reload: 3.0, velocity: 1200 }
    ],
    features: ["28,000 Damage / Shot", "Burst: 6 (168k Volley)", "Range: 2500", "Max: 4"]
  },
  {
    id: "kingchimera",
    name: "King Chimera",
    category: "boss",
    tier: "T4 Super Boss",
    source: "raptor_queen_epic",
    icon: "raptor_queen_epic",
    role: "Mother of All Raptors",
    desc: "King Chimera - Mother of All Raptors (5 Boss Weapon Systems).",
    tooltip: "!!!",
    hp: 1575000,
    metal: 5000000,
    energy: 8000000,
    weapons: [
      { name: "Boss Cannon (10x Projectiles)", damage: 5200, count: 10, range: 2000, reload: 0.7, velocity: 1250 },
      { name: "Triple Kmaw Turrets", damage: 70, count: 3, range: 1000 },
      { name: "Heavy Laser Battery", damage: 8000, range: 2000, reload: 1.0, aoe: 120 }
    ],
    features: ["1.575M Health", "52k Burst Volley", "10 Projectiles / 0.7s"]
  },
  {
    id: "multiplicable",
    name: "Multiplicable",
    category: "boss",
    tier: "T4 Assault Titan",
    source: "corgolt4",
    icon: "armscavengerbossv2_hard",
    role: "Super Heavy Assault Tank & Carrier",
    desc: "Super Heavy Amphibious Assault Tank & Drone Carrier (Cloned from Gol T4).",
    tooltip: "???",
    hp: 1003000,
    metal: 550000,
    energy: 2050000,
    buildTime: 1550000,
    speed: 12,
    weapons: [
      { name: "Side Heavy Laser", damage: 7250, range: 1075 },
      { name: "Drone Spawner Missile", damage: 50000, range: 1900, reload: 3.5, velocity: 2250 }
    ],
    features: ["1.003M Health", "Spawns 10 Corvettes", "50k Cruise Missile"]
  },
  {
    id: "nukinator",
    name: "Nukinator",
    category: "boss",
    tier: "T4 Sniper Spider",
    source: "legsrailt4",
    icon: "legsrailt4",
    role: "Heavy Nuke Sniper Spider",
    desc: "Heavy Nuke Sniper Spider (3000 Range Tactical ICBM Launcher).",
    tooltip: "Heavy Nuke Sniper Spider",
    hp: 200000,
    metal: 505000,
    energy: 5000000,
    buildTime: 500000,
    weapons: [
      { name: "Tactical ICBM Launcher", damage: 21500, aoe: 320, range: 3000, reload: 5.0, velocity: 4600 }
    ],
    features: ["21,500 Nuke Damage", "Range: 3000", "Velocity: 4600"]
  },
  {
    id: "pulsinator",
    name: "Pulsinator",
    category: "turret",
    tier: "T3 Energy Turret",
    source: "armannit3",
    icon: "armannit3",
    role: "Long Range Energy Gunner",
    desc: "Long Range Energy Gunner with rapid 0.3s cycle rate.",
    tooltip: "Long Range Energy Gunner",
    hp: 108000,
    metal: 53500,
    energy: 950000,
    buildTime: 230000,
    weapons: [
      { name: "Rapid ATA Tachyon Gun", damage: 18000, range: 2100, reload: 0.3 }
    ],
    features: ["18,000 Damage / Shot", "0.3s Reload (60k DPS!)", "Range: 2100"]
  },
  {
    id: "ratteking",
    name: "King Ratte",
    category: "boss",
    tier: "T4 Riot Titan",
    source: "armrattet4",
    icon: "armrattet4",
    role: "Very Heavy Amphibious Riot Tank",
    desc: "Very Heavy Amphibious Riot Tank with 9-projectile boss cannon (Cloned from Ratte).",
    tooltip: "???",
    hp: 183000,
    metal: 500000,
    energy: 2100000,
    speed: 21,
    weapons: [
      { name: "Boss Cannon (9x Burst)", damage: 5200, count: 9, range: 1500, reload: 0.8, aoe: 392, velocity: 850 }
    ],
    features: ["9 Projectiles / 0.8s", "46,800 Burst Damage", "AoE: 392"]
  },
  {
    id: "t1metalgenerator",
    name: "Basic Metal Generator",
    category: "eco",
    tier: "T1 Economy",
    source: "armuwes",
    icon: "armmex",
    role: "Produces 4 Metal",
    desc: "Produces 4 Metal (Best Used for Non Metal Map).",
    tooltip: "Produces 4 Metal (Best Used for Non Metal Map)",
    hp: 1890,
    metal: 170,
    energy: 1900,
    buildTime: 2110,
    features: ["+4 Metal / sec", "Storage: 25 Metal & Energy", "Amphibious Placement"]
  },
  {
    id: "t2metalgenerator",
    name: "Advanced Metal Generator",
    category: "eco",
    tier: "T2 Economy",
    source: "leguwestore",
    icon: "armmoho",
    role: "Produces 10 Metal",
    desc: "Produces 10 Metal (Best Used for Non Metal Map).",
    tooltip: "Produces 10 Metal (Best Used for Non Metal Map)",
    hp: 5000,
    metal: 800,
    energy: 8800,
    buildTime: 9260,
    features: ["+10 Metal / sec", "Storage: 150 Metal & Energy", "Amphibious Placement"]
  },
  {
    id: "t3builder",
    name: "Epic Construction Turret",
    category: "utility",
    tier: "T4 Construction",
    source: "armrespawn",
    icon: "legnanotcbase",
    role: "Epic Construction Turret",
    desc: "Epic Construction Turret (Workertime: 5000, Radius: 800).",
    tooltip: "Epic Construction Turret",
    hp: 60000,
    metal: 30000,
    energy: 650000,
    buildTime: 50000,
    features: ["Workertime: 5000", "Build Range: 800", "+50 M / +1000 E Make"]
  },
  {
    id: "t5sanctuary",
    name: "Sanctuary of All Sanctuary",
    category: "shield",
    tier: "T5 Ultimate Shield",
    source: "corgatet3",
    icon: "leggatet3",
    role: "The Ultimate Shield",
    desc: "The Ultimate Shield (300,500 Shield HP, 2325 Radius, Max 6 Per Player).",
    tooltip: "The Ultimate Shield",
    hp: 202500,
    metal: 400000,
    energy: 7075000,
    buildTime: 775000,
    shield: { power: 300500, radius: 2325, powerRegen: 5650, powerRegenEnergy: 9812.5, startingPower: 100900 },
    features: ["300,500 Shield Power", "Radius: 2325", "Regen: 5650/s", "Max: 6"]
  },
  {
    id: "thetyrannus",
    name: "Queen Tyrannus",
    category: "boss",
    tier: "T4 Flying Titan",
    source: "legfortt4",
    icon: "armcomboss",
    role: "Gigantic Flying Fortress",
    desc: "Gigantic Flying Fortress with dual Heatrays, dual Levellers, and 119k Shield (Cloned from Tyrannus).",
    tooltip: "???",
    hp: 1507000,
    metal: 1006000,
    energy: 5090000,
    buildTime: 9000000,
    speed: 32,
    shield: { power: 119400, radius: 450, powerRegen: 1100, startingPower: 31438 },
    weapons: [
      { name: "Dual T2 Heatrays", damage: 1200, count: 2, range: 2000, reload: 1.0 },
      { name: "Dual Leveller Cannons", damage: 21000, count: 2, range: 2500, reload: 2.5, velocity: 1500 },
      { name: "Anti-Air Missiles", damage: 1000, range: 1540 }
    ],
    features: ["1.507M Health", "119,400 Shield Power", "Altitude: 500"]
  },
  {
    id: "walkingfort",
    name: "Walking Fortress",
    category: "boss",
    tier: "T4 Assault Walker",
    source: "armlunchbox",
    icon: "armcomboss",
    role: "All-Terrain Heavy Plasma Cannon",
    desc: "All-Terrain Heavy Plasma Cannon with high AoE Bertha meteor shells (Cloned from Lunchbox).",
    tooltip: "???",
    hp: 1000000,
    metal: 103000,
    energy: 1001000,
    buildTime: 201000,
    speed: 12,
    weapons: [
      { name: "Heavy Meteor Shell", damage: 9000, aoe: 550, range: 2000, reload: 1.0, velocity: 2500 }
    ],
    features: ["1.0M Health", "9000 Damage / Shot", "AoE: 550"]
  },
  {
    id: "wallnut",
    name: "Floating Wall-nut",
    category: "shield",
    tier: "T4 Flying Wall",
    source: "corcrwt4",
    icon: "armfgate",
    role: "Air Sacrificial Lamb",
    desc: "Air Sacrificial Lamb (Huge Health) / Semi Anti Air.",
    tooltip: "Air Sacrificial Lamb (Huge Health) / Semi Anti Air",
    hp: 912000,
    metal: 75000,
    energy: 2250000,
    buildTime: 450000,
    speed: 23.9,
    weapons: [
      { name: "6x Micro Air Def Guns", damage: 300, count: 6, range: 1000 }
    ],
    features: ["912,000 HP Air Sponge", "6x Point Defense Guns", "Anti-Air Bait"]
  }
];

// Read existing data.js to preserve RAW_COMMANDS and SCAVENGER_SQUADS
const dataPath = path.join(__dirname, 'data.js');
let content = fs.readFileSync(dataPath, 'utf8');

// Replace CUSTOM_UNITS array in data.js
const regex = /const CUSTOM_UNITS = \[[\s\S]*?\];\s*const SCAVENGER_SQUADS/m;
const replacement = 'const CUSTOM_UNITS = ' + JSON.stringify(CUSTOM_UNITS, null, 2) + ';\n\nconst SCAVENGER_SQUADS';
content = content.replace(regex, replacement);

fs.writeFileSync(dataPath, content, 'utf8');
console.log('data.js updated with clean synced CUSTOM_UNITS (zero fluff)!');
