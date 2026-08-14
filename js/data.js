// ======================
// HEAVENLY DAO CHRONICLES
// Ultimate Data — Max Expanded Edition
// ======================

const DOU_QI_RANKS = [
  { name: "Dou Zhe", level: 1, category: "Low", desc: "The beginning of the path. Barely stronger than ordinary people." },
  { name: "Dou Shi", level: 2, category: "Low", desc: "Can form Dou Qi armor and release external Dou Qi." },
  { name: "Da Dou Shi", level: 3, category: "Low", desc: "Dou Qi transforms into a cyclone within the body." },
  { name: "Dou Ling", level: 4, category: "Mid", desc: "Can fly for short distances. A true expert in small regions." },
  { name: "Dou Wang", level: 5, category: "Mid", desc: "Controls the sky. Can create Dou Qi wings." },
  { name: "Dou Huang", level: 6, category: "Mid", desc: "Ruler of a region. Can form a domain." },
  { name: "Dou Zong", level: 7, category: "High", desc: "Can tear space slightly. A true powerhouse." },
  { name: "Dou Zun", level: 8, category: "High", desc: "Space is like paper. Feared across continents." },
  { name: "Half-Saint", level: 9, category: "Peak", desc: "One step away from sainthood. Rare existence." },
  { name: "Dou Saint", level: 10, category: "Peak", desc: "Can destroy cities with a thought. Standing at the peak." },
  { name: "Dou Di", level: 11, category: "Peak", desc: "The legendary realm. Touches the Heavenly Dao itself." }
];

const STARS = ["1-Star", "2-Star", "3-Star", "4-Star", "5-Star", "6-Star", "7-Star", "8-Star", "9-Star", "Peak"];
const ATTRIBUTES = ["Fire", "Water", "Wood", "Metal", "Earth", "Wind", "Lightning", "Ice", "Dark", "Light", "Void", "Blood", "Poison", "Soul"];
const PHYSIQUES = ["Ordinary Physique", "Tough Physique", "Fire Spirit Physique", "Ice Spirit Physique", "Thunder Spirit Physique", "Ancient Desolate Physique", "Nine Yin Physique", "Heavenly Flame Physique", "Dragon Blood Physique", "Void Body", "Glass Body", "Immortal Golden Body", "Myriad Poison Body", "Heavenly Demon Physique"];
const BLOODLINES = ["None", "Minor Clan Bloodline", "Ancient Clan Bloodline", "Dragon Bloodline", "Phoenix Bloodline", "Tiger Bloodline", "Fox Bloodline", "Heavenly Demon Bloodline", "Ancient Emperor Bloodline", "Void Spirit Bloodline", "Pure Yang Bloodline"];
const TECHNIQUE_RANKS = ["Huang Rank", "Xuan Rank", "Di Rank", "Tian Rank", "Saint Rank", "Emperor Rank"];

const FLAME_DATA = [
  { name: "Black Demon Flame", rank: 22 }, { name: "Sea Heart Flame", rank: 21 },
  { name: "Nine Serene Wind Flame", rank: 19 }, { name: "Green Lotus Core Flame", rank: 19 },
  { name: "Ghostly Flame", rank: 18 }, { name: "Life Spirit Flame", rank: 15 },
  { name: "Fallen Heart Flame", rank: 14 }, { name: "Netherworld Poison Flame", rank: 12 },
  { name: "Bone Chilling Flame", rank: 11 }, { name: "Crimson Sky Flame", rank: 10 },
  { name: "Myriad Beast Spirit Flame", rank: 9 }, { name: "Three Thousand Burning Flame", rank: 5 },
  { name: "Golden Emperor Incinerating Heavenly Flame", rank: 3 }, { name: "Void Devouring Flame", rank: 2 }
];

const BEAST_SPECIES = ["Flame Tiger", "Thunder Eagle", "Ice Python", "Void Wolf", "Rock Bear", "Wind Falcon", "Poison Scorpion", "Dragon Hatchling", "Phoenix Chick", "Shadow Panther", "Crystal Tortoise", "Blood Bat", "Golden Lion", "Nine-Headed Serpent", "Sky-Devouring Vulture", "Ancient Stone Ape"];
const ANCIENT_CLANS = [
  { name: "Gu Clan", bloodline: "Empty", treasure: "Empty Throne", specialty: "Spatial techniques" },
  { name: "Hun Clan", bloodline: "Soul", treasure: "Soul Emperor Artifact", specialty: "Soul attacks" },
  { name: "Yan Clan", bloodline: "Flame", treasure: "Heavenly Flame Source", specialty: "Fire cultivation" },
  { name: "Lei Clan", bloodline: "Thunder", treasure: "Thunder God Spear", specialty: "Lightning arts" },
  { name: "Yao Clan", bloodline: "Alchemy", treasure: "Ancient Pill Formula", specialty: "Pill refinement" },
  { name: "Shi Clan", bloodline: "Stone", treasure: "Immortal Stone Body", specialty: "Defense" },
  { name: "Ling Clan", bloodline: "Spirit", treasure: "Spirit Array", specialty: "Formations" },
  { name: "Cao Clan", bloodline: "Wood", treasure: "Life Wood", specialty: "Healing & wood arts" }
];
const BEAST_CLANS = [
  { name: "Primordial Dragon Clan", trait: "Supreme physical power and dragon might" },
  { name: "Immortal Phoenix Clan", trait: "Rebirth and purifying flames" },
  { name: "Void Devouring Tiger Clan", trait: "Space devouring and absolute speed" },
  { name: "Nine-Tailed Celestial Fox Clan", trait: "Illusion and charm arts" },
  { name: "Heaven-Shattering War Ape Clan", trait: "Brutal close combat and body refining" }
];
const REGIONS = ["Outerland", "Innerland", "Mainland", "Central Land"];
const FIRST_NAMES = ["Xiao", "Lin", "Yun", "Gu", "Yan", "Lei", "Yao", "Shi", "Ling", "Cao", "Han", "Mo", "Feng", "Bai", "Qing", "Zi", "Chen", "Ye", "Su", "Mu", "Nangong", "Beixuan", "Dongfang", "Shangguan", "Sima", "Huangfu", "Ouyang", "Zhuge"];
const LAST_NAMES = ["Yan", "Chen", "Xuan", "Tian", "Feng", "Ling", "Yao", "Mo", "Bai", "Qing", "Yun", "Lei", "Shi", "Gu", "Hun", "Cao", "Wuji", "Changsheng", "Ming", "Xue", "Hong", "Yuan", "Zhan"];
const PERSONALITIES = ["Ambitious", "Cautious", "Hot-blooded", "Cold & Calculating", "Righteous", "Cunning", "Loyal", "Vengeful", "Curious", "Proud", "Ruthless", "Merciful", "Scheming", "Honorable", "Arrogant", "Humble yet fierce"];
const DREAMS = ["Reach the Dou Di realm", "Revive the fallen clan", "Become the strongest alchemist under heaven", "Collect all Heavenly Flames", "Unify the continent", "Surpass the Ancient Clans", "Find the truth of the Heavenly Dao", "Protect what remains of the family", "Become a legend spoken of for ten thousand years", "Master the art of spatial tearing"];
const FEARS = ["Death of loved ones", "Losing cultivation base", "Betrayal by closest allies", "Being forgotten by history", "The Heavenly Tribulation", "Soul annihilation", "Watching the clan fall again", "Never reaching the peak"];
const SECRETS = ["Possesses a sealed Heavenly Flame inside the body", "Has a second soul from an ancient expert", "Bloodline is incomplete but can be awakened", "Carries an ancient Dou Di inheritance", "Was once a disciple of a fallen Dou Saint", "Has a mysterious ring that hides a world", "Soul has been partially replaced", "None known — yet"];
const WEAPONS = ["Black Iron Ruler", "Heavy Xuan Sword", "Soft Bone Whip", "Twin Moon Blades", "Heavenly Flame Spear", "Void Piercing Dagger", "Ancient Dragon Halberd", "Nine Heavens Bow", "Bare fists refined by body techniques", "Soul Binding Chain"];
const PILL_LIST = [
  { name: "Qi Gathering Pill", grade: "3rd Grade", effect: "Greatly increases Dou Qi recovery for seven days." },
  { name: "Foundation Strengthening Pill", grade: "5th Grade", effect: "Solidifies the cultivation foundation and reduces breakthrough failure chance." },
  { name: "Soul Nurturing Pill", grade: "6th Grade", effect: "Strengthens spiritual force and raises comprehension ability." },
  { name: "Heavenly Flame Resistance Pill", grade: "7th Grade", effect: "Grants temporary resistance against high-ranked Heavenly Flames." },
  { name: "Nine Revolution Golden Pill", grade: "9th Grade", effect: "Massive boost to cultivation speed. Can shake the foundation of a Dou Huang." },
  { name: "Body Tempering Pill", grade: "4th Grade", effect: "Strengthens the physical body and improves physique grade slightly." },
  { name: "Blood Essence Pill", grade: "6th Grade", effect: "Restores severe injuries and replenishes life force." },
  { name: "Void Spirit Pill", grade: "8th Grade", effect: "Aids in comprehending spatial power. Extremely rare." }
];
const ITEM_TYPES = ["Weapon", "Armor", "Pill", "Scroll", "Treasure", "Material"];
const ITEM_NAMES = {
  Weapon: ["Black Iron Ruler", "Heavy Xuan Sword", "Soft Bone Whip", "Heavenly Flame Spear", "Void Dagger"],
  Armor: ["Black Steel Armor", "Spirit Silk Robe", "Dragon Scale Armor", "Void Cloak"],
  Pill: ["Qi Gathering Pill", "Foundation Pill", "Soul Pill", "Healing Pill"],
  Scroll: ["Huang Rank Technique Scroll", "Xuan Rank Movement Art", "Di Rank Secret"],
  Treasure: ["Spatial Ring", "Storage Bracelet", "Ancient Key", "Soul Pearl"],
  Material: ["Fire Crystal", "Ice Essence", "Thunder Stone", "Ancient Wood", "Beast Core"]
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateName() { return rand(FIRST_NAMES) + " " + rand(LAST_NAMES); }

function generateItem() {
  const type = rand(ITEM_TYPES);
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(ITEM_NAMES[type] || ["Mysterious Item"]),
    type: type,
    rank: rand(["Common", "Rare", "Precious", "Legendary", "Heavenly"]),
    description: rand([
      "An item left behind by an ancient expert.",
      "Found in a secret realm after a bloody battle.",
      "Refined by a high-level alchemist.",
      "Contains faint traces of Heavenly energy.",
      "Its true value is still unknown."
    ])
  };
}

function generateCharacter(realmOverride = null) {
  const maxRank = realmOverride ? DOU_QI_RANKS.findIndex(r => r.name === realmOverride) + 1 : 8;
  const realm = realmOverride ? DOU_QI_RANKS.find(r => r.name === realmOverride) : rand(DOU_QI_RANKS.slice(0, maxRank));
  const star = rand(STARS.slice(0, 9));
  const talent = rand(["Ordinary", "Good", "Excellent", "Genius", "Monster", "Against the Heavens"]);
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: generateName(),
    age: randInt(15, 120),
    gender: rand(["Male", "Female"]),
    race: rand(["Human", "Human", "Human", "Half-Beast", "Ancient Bloodline"]),
    appearance: rand(["Sharp phoenix eyes and a lean, dangerous frame", "Tall with an imposing, mountain-like presence", "Delicate features that hide a fierce and unyielding will", "A scarred face and an aura cold enough to freeze blood", "Youthful looks paired with eyes that have seen centuries", "White hair at a young age, marking a special physique", "Calm expression that never changes even in life-and-death battles"]),
    personality: rand(PERSONALITIES),
    dreams: rand(DREAMS),
    fears: rand(FEARS),
    realm: realm.name,
    star: star,
    talent: talent,
    attribute: rand(ATTRIBUTES),
    physique: rand(PHYSIQUES),
    bloodline: rand(BLOODLINES),
    technique: null,
    weapon: rand(WEAPONS),
    family: rand(["Fallen clan remnant", "Minor family in the Outerland", "Ancient bloodline survivor", "Orphan of a destroyed sect", "Direct descendant of a small clan"]),
    master: rand(["None", "A mysterious old man in the mountains", "Elder of a major sect", "A wandering Dou Zong expert", "An existence that only appears in dreams"]),
    secrets: rand(SECRETS),
    allies: [],
    enemies: [],
    inventory: [generateItem(), generateItem()],
    douQi: randInt(200, 12000),
    purity: randInt(35, 98),
    control: randInt(25, 95),
    foundation: randInt(40, 100),
    experience: randInt(15, 100),
    comprehension: randInt(20, 99),
    kills: randInt(0, 40),
    reputation: rand(["Unknown", "Rising star", "Famous in the region", "Feared by many", "Legend in the making"])
  };
}

function generateTechnique() {
  const rank = rand(TECHNIQUE_RANKS);
  const attr = rand(ATTRIBUTES);
  const prefixes = ["Heavenly", "Void", "Nine", "Ancient", "Burning", "Silent", "Dragon", "Phoenix", "Demon", "Sacred", "Myriad", "Eternal", "Shattering", "Soul"];
  const middles = [attr, "God", "Emperor", "Spirit", "Destruction", "Life", "Shadow", "Flame"];
  const suffixes = ["Art", "Technique", "Scripture", "Formula", "Palm", "Fist", "Sword Art", "Body Method", "Canon", "Secret"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: `${rand(prefixes)} ${rand(middles)} ${rand(suffixes)}`,
    rank, attribute: attr, creator: generateName(),
    origin: rand(["Ancient ruins", "Clan inheritance", "Secret realm", "Self-created after enlightenment", "Stolen from a powerful enemy", "Found in a Dou Saint's cave"]),
    power: randInt(45, 100),
    weakness: rand(["Extremely high Dou Qi consumption", "Requires specific physique", "Slow to activate", "Vulnerable to opposite attribute", "Damages the user's foundation if overused", "Needs a Heavenly Flame as catalyst"]),
    evolution: rand(["Can evolve to a higher rank with opportunity", "Has a hidden final form", "Requires Heavenly Flame to advance", "Can be fused with another technique", "None known"]),
    description: rand(["A fierce offensive technique that tears through defenses.", "Focuses on extreme speed and unpredictable trajectories.", "A defensive art that can withstand even Dou Zong level attacks when mastered.", "Manipulates the surrounding energy to create a personal domain.", "Burns the user's potential for a short period of god-like power."])
  };
}

function generateFlame() {
  const base = rand(FLAME_DATA);
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: base.name, rank: base.rank,
    origin: rand(["Fallen from the heavens during an ancient war", "Born in the heart of a ten-thousand-year volcano", "Condensed from the soul of a divine beast", "Created by an ancient Divine Alchemist", "Appeared after a Dou Di fell"]),
    appearance: rand(["Black flames that seem to devour all light around them", "A lotus-shaped emerald fire that pulses with life", "A heart-shaped crimson core that beats like a living thing", "Pale blue frost fire that freezes and burns at the same time", "A golden raging inferno that makes the sky tremble", "Multicolored flames that shift like a living rainbow of destruction"]),
    ability: rand(["Burns both the body and the soul simultaneously", "Greatly accelerates cultivation speed when refined", "Perfectly refines pills and removes all impurities", "Can devour other Heavenly Flames to grow stronger", "Freezes and burns the enemy at the same moment", "Creates a sea of flames that follows the owner's will"]),
    intelligence: rand(["None", "Low", "Moderate", "High", "Near-human", "Fully sentient"]),
    personality: rand(["Violent and bloodthirsty", "Proud and arrogant", "Curious about the world", "Ancient and sleepy", "Loyal to its chosen master", "Cunning and watchful"]),
    history: "This flame once belonged to an ancient expert before disappearing for thousands of years. Its reappearance is enough to cause a storm of blood across the continent.",
    previousOwners: [generateName() + " (Dou Zong)", generateName() + " (Dou Sheng)"]
  };
}

function generateBeast() {
  const rankNum = randInt(1, 9);
  const rank = rankNum + (rankNum === 1 ? "st" : rankNum === 2 ? "nd" : rankNum === 3 ? "rd" : "th") + " Rank";
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    species: rand(BEAST_SPECIES), rank,
    bloodline: rand(["Common", "Mutated", "Ancient", "Primordial", "Divine Beast remnant"]),
    evolution: rand(["Can evolve once more", "Multiple evolution paths exist", "Requires a special Heavenly resource", "Already at its peak", "Can awaken an ancient bloodline"]),
    abilities: [rand(ATTRIBUTES) + " Attack", "Enhanced physical strength", "Natural armor", "Flight", "Poison mist"].slice(0, randInt(2, 4)),
    territory: rand(REGIONS),
    weakness: rand(["Fire", "Ice", "Lightning", "Soul attacks", "Alchemy poison", "Spatial blades"]),
    history: `A rare ${rank} magical beast that has dominated its territory in the ${rand(REGIONS)} for hundreds of years. Its bloodline contains traces of ancient power.`
  };
}

function generateWorld() {
  const names = ["Azure Sky Continent", "Burning Heaven Realm", "Nine Dragon Continent", "Void Spirit Land", "Eternal Flame World", "Ancient Desolate Domain", "Heavenly Frost Continent", "Myriad Beast Wilderness", "Golden Crow Domain"];
  return {
    id: Date.now(), name: rand(names),
    origin: "Born from the residual energy left after the fall of the last known Dou Di. The Heavenly Dao itself shaped the land.",
    creationMyth: "Legend says that in the primordial chaos, a supreme existence tore open the void and poured endless Dou Qi into it. From that act, the first lands, the first beasts, and the first humans were born.",
    ancientEra: "The Era of Ten Thousand Saints — Dou Saints walked openly, Heavenly Flames fell like meteors, and the path to Dou Di was still visible.",
    currentEra: "The Declining Era. Dou Saints have become legends, Half-Saints are rare, and the road to Dou Di is sealed by the Heavenly Dao.",
    heavenlyLaws: "The strong prey upon the weak. Those who break the natural order invite Heavenly Tribulation. Bloodlines carry destiny, yet destiny can be defied.",
    cultivationRules: "Only through Dou Qi can one challenge the heavens. Talent, resources, techniques, and opportunity decide everything. There is no fairness under the Heavenly Dao.",
    regions: {
      outerland: "Sparse Dou Qi. Small clans and weak sects. The starting point of most legends.",
      innerland: "Abundant resources. Major sects and large clans compete fiercely for every opportunity.",
      mainland: "Ancient organizations and Half-Saint experts hold the true power.",
      central: "The heart of the continent. Home of the Eight Ancient Clans and the Five Supreme Beast Clans."
    },
    currentEvents: ["A Heavenly Flame fluctuation has been sensed in the Innerland.", "The Gu Clan young generation tournament is approaching.", "Rumors of a Dou Saint inheritance are spreading.", "A mysterious expert has appeared in the Outerland."]
  };
}

function generateBattleResult(fighter1, fighter2) {
  const r1 = DOU_QI_RANKS.findIndex(r => r.name === fighter1.realm);
  const r2 = DOU_QI_RANKS.findIndex(r => r.name === fighter2.realm);
  let winner, loser, reason, intensity;
  const diff = r1 - r2;
  if (diff >= 2) {
    winner = fighter1; loser = fighter2;
    reason = `${fighter1.name}'s superior realm (${fighter1.star} ${fighter1.realm}) completely crushed ${fighter2.name}. The gap in Dou Qi quality and quantity was insurmountable. The battle ended in less than ten exchanges.`;
    intensity = "Overwhelming";
  } else if (diff <= -2) {
    winner = fighter2; loser = fighter1;
    reason = `${fighter2.name}'s higher cultivation base allowed them to dominate the battlefield without suspense.`;
    intensity = "Overwhelming";
  } else {
    const score1 = (fighter1.experience || 50) + (fighter1.comprehension || 50) + (fighter1.control || 50) + Math.random() * 40;
    const score2 = (fighter2.experience || 50) + (fighter2.comprehension || 50) + (fighter2.control || 50) + Math.random() * 40;
    if (score1 >= score2) {
      winner = fighter1; loser = fighter2;
      reason = `Despite similar realms, ${fighter1.name}'s superior combat experience, technique mastery, and willpower turned the tide. After a fierce battle that shook the surrounding area, ${fighter1.name} finally seized victory.`;
    } else {
      winner = fighter2; loser = fighter1;
      reason = `${fighter2.name} exploited a momentary opening and unleashed a higher-ranked technique at the critical moment, securing a hard-fought victory.`;
    }
    intensity = "Fierce";
  }
  return {
    winner: winner.name, loser: loser.name,
    winnerRealm: `${winner.star} ${winner.realm}`, loserRealm: `${loser.star} ${loser.realm}`,
    reason, intensity,
    impact: rand(["This battle will shift the balance of power in the region.", "The loser's faction suffers a severe blow to reputation and morale.", "Rumors of the winner's strength are already spreading across the continent.", "An ancient expert in seclusion took notice of this fight.", "The Heavenly Dao itself seemed to pause for a moment during the climax."]),
    description: `The battle between ${fighter1.name} and ${fighter2.name} erupted under the gaze of the heavens. Dou Qi collided, the ground cracked, and the sky changed color. In the end, only one could stand.`
  };
}

function generateStoryChapter(world, character) {
  const openings = [`The wind carried the scent of blood and medicinal herbs across the ${rand(REGIONS)}.`, `Night fell over ${world.name}, yet the stars seemed to watch the living with cold indifference.`, `A low rumble echoed from the distant mountains — the sign of an expert breaking through.`, `In the quiet of the cultivation chamber, ${character.name} opened their eyes.`];
  const events = [
    `${character.name} discovered a hidden cave sealed by an ancient formation. Inside lay the remnants of a long-lost technique and a faint trace of Heavenly Flame.`,
    `A Heavenly Flame fluctuation was sensed near the border of the ${rand(REGIONS)}. Experts from every major force began to move.`,
    `${character.name}'s clan received a challenge from a rising faction. Refusal would mean losing face; acceptance could mean annihilation.`,
    `An old man with an unfathomable aura appeared before ${character.name} and tested their talent with a single glance.`,
    `A secret realm that had been closed for three hundred years suddenly opened. The opportunity inside could change the destiny of any who entered.`,
    `${character.name} successfully refined a rare pill. During the process, a flash of enlightenment struck, and their comprehension of Dou Qi deepened.`,
    `A powerful magical beast rampage threatened several cities. The major sects issued emergency missions.`,
    `Whispers of a Dou Saint's inheritance began circulating in the black markets of the Mainland.`,
    `${character.name} encountered a mysterious young cultivator whose bloodline aura made even the air tremble.`,
    `An ancient tomb rose from the earth overnight. Guardians of terrifying strength awakened.`
  ];
  const endings = [`The path to the peak is paved with bones. ${character.name} knew this, yet continued walking forward without hesitation.`, `Under the indifferent gaze of the Heavenly Dao, another legend began to take shape.`, `Whether this step would lead to glory or to the abyss, only time would tell.`, `The world continued to turn. The strong rose, the weak fell, and the Heavenly Dao remained silent.`];
  return {
    title: `Chapter ${randInt(1, 350)}: ${rand(["Rising Flames", "Hidden Opportunity", "Blood and Dou Qi", "The Path Forward", "Echoes of the Ancient Era", "Heavenly Tribulation", "Clan Crisis", "Secret Realm", "Flame of Destiny", "Against the Heavens"])}`,
    content: `${rand(openings)}\n\nIn the ${world.name}, under the cold laws of the Heavenly Dao, ${character.name} — currently a ${character.star} ${character.realm} — continued the long journey of cultivation.\n\n${rand(events)}\n\n${rand(events)}\n\n${rand(endings)}`
  };
}

function generateWorldEvent() {
  return rand([
    { title: "Heavenly Flame Descent", desc: "A new Heavenly Flame has fallen in the Innerland. All major forces are mobilizing." },
    { title: "Ancient Clan Tournament", desc: "The Gu Clan has announced the opening of their young generation tournament. Geniuses from across the continent are invited." },
    { title: "Secret Realm Opens", desc: "An ancient secret realm that has been sealed for five hundred years has suddenly opened." },
    { title: "Beast Tide", desc: "A massive magical beast tide is forming at the edge of the Outerland." },
    { title: "Dou Saint Aura", desc: "A terrifying aura belonging to a Dou Saint briefly swept across the Mainland before vanishing." },
    { title: "Alchemy Conference", desc: "The Yao Clan is hosting a grand alchemy conference. Alchemists of 6th Grade and above are gathering." }
  ]);
}

const DEFAULT_STATE = {
  world: null, characters: [], techniques: [], flames: [], beasts: [], sects: [],
  currentCharacterId: null, storyChapters: [], events: [], pills: [], inventory: []
};
