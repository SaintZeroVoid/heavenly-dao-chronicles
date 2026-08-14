// ======================
// HEAVENLY DAO CHRONICLES
// Core Data & Generators
// ======================

const DOU_QI_RANKS = [
  { name: "Dou Zhe", level: 1, category: "Low" },
  { name: "Dou Shi", level: 2, category: "Low" },
  { name: "Da Dou Shi", level: 3, category: "Low" },
  { name: "Dou Ling", level: 4, category: "Mid" },
  { name: "Dou Wang", level: 5, category: "Mid" },
  { name: "Dou Huang", level: 6, category: "Mid" },
  { name: "Dou Zong", level: 7, category: "High" },
  { name: "Dou Zun", level: 8, category: "High" },
  { name: "Half-Saint", level: 9, category: "Peak" },
  { name: "Dou Saint", level: 10, category: "Peak" },
  { name: "Dou Di", level: 11, category: "Peak" }
];

const STARS = ["1-Star", "2-Star", "3-Star", "4-Star", "5-Star", "6-Star", "7-Star", "8-Star", "9-Star", "Peak"];

const ATTRIBUTES = ["Fire", "Water", "Wood", "Metal", "Earth", "Wind", "Lightning", "Ice", "Dark", "Light", "Void", "Blood"];

const PHYSIQUES = [
  "Ordinary Physique", "Tough Physique", "Fire Spirit Physique", "Ice Spirit Physique",
  "Thunder Spirit Physique", "Ancient Desolate Physique", "Nine Yin Physique",
  "Heavenly Flame Physique", "Dragon Blood Physique", "Void Body"
];

const BLOODLINES = [
  "None", "Minor Clan Bloodline", "Ancient Clan Bloodline", "Dragon Bloodline",
  "Phoenix Bloodline", "Tiger Bloodline", "Fox Bloodline", "Heavenly Demon Bloodline"
];

const TECHNIQUE_RANKS = ["Huang Rank", "Xuan Rank", "Di Rank", "Tian Rank", "Saint Rank"];

const FLAME_NAMES = [
  "Black Demon Flame", "Green Lotus Core Flame", "Fallen Heart Flame",
  "Bone Chilling Flame", "Nine Serene Wind Flame", "Sea Heart Flame",
  "Golden Emperor Incinerating Heavenly Flame", "Void Devouring Flame",
  "Life Spirit Flame", "Netherworld Poison Flame", "Crimson Sky Flame",
  "Myriad Beast Spirit Flame"
];

const BEAST_RANKS = ["1st Rank", "2nd Rank", "3rd Rank", "4th Rank", "5th Rank", "6th Rank", "7th Rank", "8th Rank", "9th Rank"];

const ANCIENT_CLANS = [
  { name: "Gu Clan", bloodline: "Empty", treasure: "Empty Throne" },
  { name: "Hun Clan", bloodline: "Soul", treasure: "Soul Emperor Artifact" },
  { name: "Yan Clan", bloodline: "Flame", treasure: "Heavenly Flame Source" },
  { name: "Lei Clan", bloodline: "Thunder", treasure: "Thunder God Spear" },
  { name: "Yao Clan", bloodline: "Alchemy", treasure: "Ancient Pill Formula" },
  { name: "Shi Clan", bloodline: "Stone", treasure: "Immortal Stone Body" },
  { name: "Ling Clan", bloodline: "Spirit", treasure: "Spirit Array" },
  { name: "Cao Clan", bloodline: "Wood", treasure: "Life Wood" }
];

const BEAST_CLANS = [
  "Primordial Dragon Clan",
  "Immortal Phoenix Clan",
  "Void Devouring Tiger Clan",
  "Nine-Tailed Celestial Fox Clan",
  "Heaven-Shattering War Ape Clan"
];

const REGIONS = ["Outerland", "Innerland", "Mainland", "Central Land"];

const FIRST_NAMES = ["Xiao", "Lin", "Yun", "Gu", "Yan", "Lei", "Yao", "Shi", "Ling", "Cao", "Han", "Mo", "Feng", "Bai", "Qing", "Zi", "Chen", "Ye"];
const LAST_NAMES = ["Yan", "Chen", "Xuan", "Tian", "Feng", "Ling", "Yao", "Mo", "Bai", "Qing", "Yun", "Lei", "Shi", "Gu", "Hun", "Cao"];

const PERSONALITIES = ["Ambitious", "Cautious", "Hot-blooded", "Cold & Calculating", "Righteous", "Cunning", "Loyal", "Vengeful", "Curious", "Proud"];

// Utility
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName() {
  return rand(FIRST_NAMES) + " " + rand(LAST_NAMES);
}

function generateCharacter(realmOverride = null) {
  const realm = realmOverride || rand(DOU_QI_RANKS.slice(0, 8));
  const star = rand(STARS.slice(0, 9));
  return {
    id: Date.now() + Math.random(),
    name: generateName(),
    age: randInt(16, 80),
    gender: rand(["Male", "Female"]),
    race: "Human",
    appearance: rand([
      "Sharp eyes and a lean frame",
      "Tall with an imposing presence",
      "Delicate features hiding fierce will",
      "Scarred face and cold aura",
      "Youthful looks with ancient eyes"
    ]),
    personality: rand(PERSONALITIES),
    dreams: rand([
      "Reach the Dou Di realm",
      "Revive the clan",
      "Become the strongest alchemist",
      "Find the legendary Heavenly Flame",
      "Unify the continent"
    ]),
    fears: rand(["Death of loved ones", "Losing cultivation", "Betrayal", "Being forgotten"]),
    realm: realm.name,
    star: star,
    talent: rand(["Ordinary", "Good", "Excellent", "Genius", "Monster"]),
    attribute: rand(ATTRIBUTES),
    physique: rand(PHYSIQUES),
    bloodline: rand(BLOODLINES),
    technique: generateTechnique().name,
    weapon: rand(["Long Sword", "Spear", "Black Ruler", "Soft Whip", "Twin Blades", "Bare Fists"]),
    family: rand(["Fallen clan", "Minor family", "Ancient bloodline remnant", "Orphan"]),
    master: rand(["None", "Mysterious old man", "Sect Elder", "Wandering expert"]),
    secrets: rand([
      "Possesses a sealed Heavenly Flame",
      "Has a second soul",
      "Bloodline is incomplete",
      "Carries an ancient inheritance",
      "None known"
    ]),
    douQi: randInt(100, 9999),
    purity: randInt(30, 95),
    control: randInt(20, 90),
    foundation: randInt(40, 100),
    experience: randInt(10, 100),
    comprehension: randInt(20, 95)
  };
}

function generateTechnique() {
  const rank = rand(TECHNIQUE_RANKS);
  const attr = rand(ATTRIBUTES);
  const prefixes = ["Heavenly", "Void", "Nine", "Ancient", "Burning", "Silent", "Dragon", "Phoenix", "Demon", "Sacred"];
  const suffixes = ["Art", "Technique", "Scripture", "Formula", "Palm", "Fist", "Sword Art", "Body Method"];
  return {
    id: Date.now() + Math.random(),
    name: `${rand(prefixes)} ${attr} ${rand(suffixes)}`,
    rank: rank,
    attribute: attr,
    creator: generateName(),
    origin: rand(["Ancient ruins", "Clan inheritance", "Secret realm", "Created by self", "Stolen from enemy"]),
    power: randInt(40, 100),
    weakness: rand(["High Dou Qi consumption", "Requires specific physique", "Slow to activate", "Vulnerable to opposite attribute"]),
    evolution: rand(["Can evolve to higher rank", "Has hidden form", "Needs Heavenly Flame to advance", "None"])
  };
}

function generateFlame() {
  return {
    id: Date.now() + Math.random(),
    name: rand(FLAME_NAMES),
    rank: randInt(1, 23),
    origin: rand(["Fallen from Heaven", "Born from volcano", "Condensed from beast soul", "Ancient alchemist creation"]),
    appearance: rand([
      "Black flames that devour light",
      "Emerald lotus-shaped fire",
      "Heart-shaped crimson core",
      "Pale blue frost fire",
      "Golden raging inferno"
    ]),
    ability: rand([
      "Burns soul and body",
      "Accelerates cultivation",
      "Refines pills perfectly",
      "Devours other flames",
      "Freezes and burns simultaneously"
    ]),
    intelligence: rand(["None", "Low", "Moderate", "High", "Near human"]),
    personality: rand(["Violent", "Proud", "Curious", "Sleepy", "Loyal"]),
    history: "Once belonged to an ancient Dou Sheng before disappearing for millennia.",
    previousOwners: [generateName(), generateName()]
  };
}

function generateBeast() {
  const rank = rand(BEAST_RANKS);
  const species = rand([
    "Flame Tiger", "Thunder Eagle", "Ice Python", "Void Wolf",
    "Rock Bear", "Wind Falcon", "Poison Scorpion", "Dragon Hatchling",
    "Phoenix Chick", "Shadow Panther", "Crystal Tortoise"
  ]);
  return {
    id: Date.now() + Math.random(),
    species: species,
    rank: rank,
    bloodline: rand(["Common", "Mutated", "Ancient", "Primordial"]),
    evolution: rand(["Can evolve once", "Multiple evolution paths", "Requires special resource", "None"]),
    abilities: [rand(ATTRIBUTES) + " Attack", "Enhanced Speed", "Hardened Scales"],
    territory: rand(REGIONS),
    weakness: rand(["Fire", "Ice", "Lightning", "Soul attacks", "Alchemy poison"]),
    history: `A rare ${rank} beast that has roamed the ${rand(REGIONS)} for centuries.`
  };
}

function generateWorld() {
  const names = ["Azure Sky Continent", "Burning Heaven Realm", "Nine Dragon Continent", "Void Spirit Land", "Eternal Flame World", "Ancient Desolate Domain"];
  return {
    id: Date.now(),
    name: rand(names),
    origin: "Born from the chaos after the fall of the last Dou Di.",
    creationMyth: "Legend says the Heavenly Dao itself tore open a space and poured Dou Qi into it, creating the first lands and the first living beings.",
    ancientEra: "The Era of Ten Thousand Saints, when Dou Saints walked openly and Heavenly Flames fell like rain.",
    currentEra: "The Declining Era — Dou Saints are rare, and the path to Dou Di is sealed.",
    heavenlyLaws: "The strong prey on the weak. Heavenly Tribulations punish those who break the natural order. Bloodlines carry destiny.",
    cultivationRules: "Only through Dou Qi can one defy the heavens. Resources, talent, and opportunity decide everything.",
    regions: {
      outerland: "Sparse Dou Qi, small clans and weak sects. Ideal for young cultivators.",
      innerland: "Abundant resources, major sects and large clans compete fiercely.",
      mainland: "Ancient organizations and Half-Saint experts hold sway.",
      central: "Home of the Eight Ancient Clans and Supreme Beast Clans. Peak of the continent."
    }
  };
}

function generateBattleResult(fighter1, fighter2) {
  const r1 = DOU_QI_RANKS.findIndex(r => r.name === fighter1.realm);
  const r2 = DOU_QI_RANKS.findIndex(r => r.name === fighter2.realm);
  let winner, loser, reason;

  if (r1 > r2 + 1) {
    winner = fighter1;
    loser = fighter2;
    reason = `${fighter1.name}'s superior realm (${fighter1.star} ${fighter1.realm}) crushed ${fighter2.name}'s resistance. The gap in Dou Qi quality was insurmountable.`;
  } else if (r2 > r1 + 1) {
    winner = fighter2;
    loser = fighter1;
    reason = `${fighter2.name}'s higher cultivation base allowed them to dominate the battlefield.`;
  } else {
    // Close fight
    const score1 = (fighter1.experience || 50) + (fighter1.comprehension || 50) + Math.random() * 30;
    const score2 = (fighter2.experience || 50) + (fighter2.comprehension || 50) + Math.random() * 30;
    if (score1 >= score2) {
      winner = fighter1;
      loser = fighter2;
      reason = `Despite similar realms, ${fighter1.name}'s superior combat experience and technique mastery turned the tide. A narrow but decisive victory.`;
    } else {
      winner = fighter2;
      loser = fighter1;
      reason = `${fighter2.name} exploited a momentary opening and used a higher-ranked technique to secure victory.`;
    }
  }

  return {
    winner: winner.name,
    loser: loser.name,
    reason,
    impact: rand([
      "This battle will shift the balance of power in the region.",
      "The loser's faction suffers a severe blow to reputation.",
      "Rumors of the winner's strength spread across the continent.",
      "An ancient expert took notice of this fight."
    ])
  };
}

function generateStoryChapter(world, character) {
  const events = [
    `${character.name} discovered a hidden cave containing remnants of an ancient technique.`,
    `A Heavenly Flame fluctuation was sensed near the border of the ${rand(REGIONS)}.`,
    `${character.name}'s clan was challenged by a rival faction.`,
    `An old master appeared and tested ${character.name}'s talent.`,
    `A secret realm opened for a limited time, drawing experts from all directions.`,
    `${character.name} successfully refined a rare pill and gained sudden insight.`,
    `A magical beast rampage threatened a nearby city.`,
    `Whispers of a Dou Saint's inheritance began circulating.`
  ];
  return {
    title: `Chapter ${randInt(1, 200)}: ${rand(["Rising Flames", "Hidden Opportunity", "Blood and Dou Qi", "The Path Forward", "Echoes of the Ancient Era"])}`,
    content: `In the ${world.name}, under the cold gaze of the Heavenly Dao...\n\n${character.name}, currently at ${character.star} ${character.realm}, continued their cultivation journey.\n\n${rand(events)}\n\nThe world continues to turn. Every decision carries weight. The path to Dou Di remains distant, yet every step taken is a defiance of fate.`
  };
}

// Default state
const DEFAULT_STATE = {
  world: null,
  characters: [],
  techniques: [],
  flames: [],
  beasts: [],
  sects: [],
  currentCharacterId: null,
  storyChapters: [],
  events: []
};
