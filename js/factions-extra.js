// Extra faction generators — Empires, Academies, Auctions, Pill Towers

function generateEmpire() {
  const names = ["Azure Dragon Empire", "Black Tortoise Dynasty", "Vermilion Bird Empire", "White Tiger Dynasty", "Golden Crow Empire", "Void Heaven Empire", "Eternal Flame Dynasty"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(names),
    type: "Empire",
    ruler: generateName() + " (Dou Zun / Half-Saint)",
    territory: rand(["Mainland", "Central Land", "Vast Innerland"]),
    strength: rand(["Regional Power", "Continental Power", "Supreme Power"]),
    armies: randInt(50000, 500000) + " troops",
    specialty: rand(["Military might", "Alchemy resources", "Beast taming", "Formation arrays", "Trade dominance"]),
    history: "An ancient empire that has stood for thousands of years. Its royal bloodline carries traces of true dragon or phoenix power.",
    currentCrisis: rand(["Succession struggle", "Border war with another empire", "Heavenly Flame appeared in its lands", "A Dou Saint is watching them", "None — currently stable"])
  };
}

function generateAcademy() {
  const names = ["Jia Nan Academy", "Heavenly Dao Academy", "Myriad Beasts Academy", "Flame God Academy", "Void Spirit Academy", "Nine Heavens Academy", "Ancient Sage Academy"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(names),
    type: "Academy",
    dean: generateName() + " (Dou Zong / Dou Zun)",
    ranking: rand(["Top 3 on the continent", "Top 10", "Famous regional academy", "Rising academy"]),
    students: randInt(2000, 30000),
    specialty: rand(["All-round cultivation", "Alchemy focus", "Combat specialization", "Beast taming", "Formation study", "Fire attribute arts"]),
    inheritance: generateTechnique().name,
    famousAlumni: [generateName(), generateName(), generateName()],
    description: "One of the most important places for young geniuses to gather. Many future powerhouses walk out of its gates."
  };
}

function generateAuctionHouse() {
  const names = ["Million Gold Auction House", "Heavenly Treasure Pavilion", "Black Market Alliance", "Golden Jade Auction", "Void Trade Alliance", "Ancient Relic Auction"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(names),
    type: "Auction",
    location: rand(REGIONS),
    rank: rand(["City-level", "Regional", "Continental", "Supreme"]),
    specialty: rand(["Weapons & techniques", "Pills & materials", "Heavenly Flames & beasts", "All rare treasures"]),
    nextAuction: rand(["In 3 days — Heavenly Flame fragment", "In 7 days — Di Rank technique", "In 15 days — Ancient map", "Mysterious item from a Dou Saint cave"]),
    reputation: rand(["Trusted by all major forces", "Shadowy but powerful", "Backed by an Ancient Clan", "Neutral and wealthy"])
  };
}

function generatePillTower() {
  const names = ["Alchemist Pill Tower", "Heavenly Pill Tower", "Yao Clan Pill Pavilion", "Myriad Medicine Tower", "Divine Flame Pill Hall", "Nine Revolution Pill Tower"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(names),
    type: "Pill Tower",
    towerMaster: generateName() + " (8th–9th Grade Alchemist)",
    location: rand(["Mainland", "Central Land", "Innerland capital"]),
    rank: rand(["Branch Tower", "Main Tower", "Supreme Pill Tower"]),
    alchemists: randInt(50, 800),
    specialty: rand(["Healing pills", "Cultivation pills", "Poison pills", "Flame resistance pills", "All types"]),
    influence: rand(["Controls medicine prices in the region", "Backed by Yao Clan", "Independent and feared", "Has a Divine Alchemist ancestor"]),
    currentTask: rand(["Recruiting high-grade alchemists", "Searching for rare medicinal ingredients", "Hosting a pill refinement competition", "Protecting a Heavenly Flame"])
  };
}

function generateDetailedSect() {
  const names = ["Burning Heaven Sect", "Void Spirit Gate", "Nine Dragons Pavilion", "Azure Cloud Sect", "Demon Flame Hall", "Heavenly Sword Sect", "Myriad Poison Valley", "Ice Heart Sect", "Thunder God Sect", "Fallen Star Sect"];
  const ranks = ["Small Sect", "Major Sect", "Ancient Sect", "Saint Sect"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(names),
    type: "Sect",
    rank: rand(ranks),
    sectMaster: generateName() + " (" + rand(["Dou Huang", "Dou Zong", "Dou Zun"]) + ")",
    elders: randInt(5, 30),
    disciples: randInt(50, 5000),
    territory: rand(REGIONS),
    technique: generateTechnique().name,
    treasure: rand(["Sect Protecting Formation", "Ancient Weapon", "Heavenly Flame remnant", "Spatial Ring of the founder", "None public"]),
    reputation: rand(["Righteous", "Demonic", "Neutral", "Feared", "Respected"]),
    enemies: [rand(["A rival sect", "A large clan", "An empire border force", "None currently"])],
    missions: rand(["Recruit genius disciples", "Explore a secret realm", "Defend against beast tide", "Compete in the academy tournament"])
  };
}

function generateDetailedClan() {
  const names = ["Xiao Clan", "Lin Clan", "Yun Family", "Gu Branch Family", "Yan Family", "Lei Family", "Mo Clan", "Bai Clan", "Chen Family", "Su Clan"];
  return {
    id: Date.now() + Math.random().toString(36).slice(2),
    name: rand(names),
    type: "Clan",
    rank: rand(["Minor Clan", "Large Clan", "Ancient Clan remnant", "Rising Clan"]),
    patriarch: generateName() + " (" + rand(["Dou Ling", "Dou Wang", "Dou Huang", "Dou Zong"]) + ")",
    members: randInt(100, 3000),
    bloodline: rand(BLOODLINES),
    territory: rand(REGIONS),
    technique: generateTechnique().name,
    treasure: rand(["Clan Protecting Treasure", "Ancestral Technique", "Spatial Map", "Pill Formula", "None"]),
    status: rand(["Prosperous", "In decline", "Under attack", "Rising rapidly", "Stable"]),
    youngGeneration: [generateName() + " (Genius)", generateName() + " (Ordinary)", generateName() + " (Promising)"]
  };
}
