export interface HazardClassInfo {
  class: string;
  name: string;
  description: string;
  examples: string[];
  placardColor: string;
  symbol: string;
  table: "1" | "2";
  tableNote?: string;
}

export const hazardClasses: HazardClassInfo[] = [
  {
    class: "1.1",
    name: "Explosives 1.1",
    description: "Explosives with a mass explosion hazard",
    examples: ["Dynamite", "TNT", "Black powder"],
    placardColor: "Orange",
    symbol: "Exploding bomb",
    table: "1",
    tableNote: "Placard required at any quantity",
  },
  {
    class: "1.2",
    name: "Explosives 1.2",
    description: "Explosives with a projection hazard",
    examples: ["Aerial flares", "Detonating cord"],
    placardColor: "Orange",
    symbol: "Exploding bomb",
    table: "1",
    tableNote: "Placard required at any quantity",
  },
  {
    class: "1.3",
    name: "Explosives 1.3",
    description: "Explosives with predominantly a fire hazard",
    examples: ["Liquid-fueled rocket motors", "Propellant explosives"],
    placardColor: "Orange",
    symbol: "Exploding bomb",
    table: "1",
    tableNote: "Placard required at any quantity",
  },
  {
    class: "1.4",
    name: "Explosives 1.4",
    description: "Explosives with no significant blast hazard",
    examples: ["Ammunition", "Signal cartridges"],
    placardColor: "Orange",
    symbol: "Exploding bomb (1.4)",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "1.5",
    name: "Explosives 1.5",
    description: "Very insensitive explosives with mass explosion hazard",
    examples: ["Blasting agents"],
    placardColor: "Orange",
    symbol: "Exploding bomb (1.5)",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "1.6",
    name: "Explosives 1.6",
    description: "Extremely insensitive detonating substances",
    examples: ["Articles with extremely insensitive detonating substances"],
    placardColor: "Orange",
    symbol: "Exploding bomb (1.6)",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "2.1",
    name: "Flammable Gas",
    description: "Gases that can ignite easily",
    examples: ["Propane", "Butane", "Methane"],
    placardColor: "Red",
    symbol: "Flame",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "2.2",
    name: "Non-Flammable Gas",
    description: "Compressed gases that are not flammable",
    examples: ["Oxygen", "Nitrogen", "Carbon dioxide"],
    placardColor: "Green",
    symbol: "Gas cylinder",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "2.3",
    name: "Poison Gas",
    description: "Gases that are toxic when inhaled",
    examples: ["Chlorine", "Ammonia", "Sulfur dioxide"],
    placardColor: "White",
    symbol: "Skull and crossbones",
    table: "1",
    tableNote: "Placard required at any quantity",
  },
  {
    class: "3",
    name: "Flammable Liquid",
    description: "Liquids that can easily catch fire",
    examples: ["Gasoline", "Diesel", "Ethanol", "Acetone"],
    placardColor: "Red",
    symbol: "Flame",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "4.1",
    name: "Flammable Solid",
    description: "Solids that can catch fire easily",
    examples: ["Matches", "Sulfur", "Metal powders"],
    placardColor: "Red/White stripes",
    symbol: "Flame",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "4.2",
    name: "Spontaneously Combustible",
    description: "Materials that can ignite without external source",
    examples: ["White phosphorus", "Certain oils"],
    placardColor: "Red/White",
    symbol: "Flame",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "4.3",
    name: "Dangerous When Wet",
    description: "Materials that become flammable when wet",
    examples: ["Sodium", "Calcium carbide", "Potassium"],
    placardColor: "Blue",
    symbol: "Flame",
    table: "1",
    tableNote: "Placard required at any quantity",
  },
  {
    class: "5.1",
    name: "Oxidizer",
    description: "Materials that promote combustion",
    examples: ["Hydrogen peroxide", "Nitrates", "Chlorates"],
    placardColor: "Yellow",
    symbol: "Flame over circle",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "5.2",
    name: "Organic Peroxide",
    description: "Organic compounds that can cause explosions",
    examples: ["Benzoyl peroxide", "MEK peroxide"],
    placardColor: "Red/Yellow",
    symbol: "Flame over circle",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "6.1",
    name: "Poison/Toxic",
    description: "Materials that are poisonous if ingested or absorbed",
    examples: ["Pesticides", "Arsenic", "Cyanides"],
    placardColor: "White",
    symbol: "Skull and crossbones",
    table: "2",
    tableNote: "Placard required above 1,001 lbs (Table 1 if PG I inhalation hazard)",
  },
  {
    class: "7",
    name: "Radioactive",
    description: "Materials that emit radiation",
    examples: ["Uranium", "Plutonium", "Medical isotopes"],
    placardColor: "Yellow/White",
    symbol: "Trefoil",
    table: "2",
    tableNote: "Placard required above 1,001 lbs (Table 1 with Radioactive Yellow III label)",
  },
  {
    class: "8",
    name: "Corrosive",
    description: "Materials that can cause severe damage to skin/metal",
    examples: ["Sulfuric acid", "Hydrochloric acid", "Sodium hydroxide"],
    placardColor: "White/Black",
    symbol: "Liquid on hand/metal",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
  {
    class: "9",
    name: "Miscellaneous",
    description: "Other hazardous materials not in above classes",
    examples: ["Dry ice", "Lithium batteries", "Asbestos"],
    placardColor: "White/Black stripes",
    symbol: "Seven vertical stripes",
    table: "2",
    tableNote: "Placard required above 1,001 lbs",
  },
];

export const getHazardClassInfo = (hazardClass: string): HazardClassInfo | undefined => {
  return hazardClasses.find((hc) => hc.class === hazardClass);
};

export const isTable1Material = (hazardClass: string): boolean => {
  const info = getHazardClassInfo(hazardClass);
  return info?.table === "1";
};

export const getPlacardColor = (hazardClass: string): string => {
  const classNum = parseFloat(hazardClass);
  // Class 1 - Explosives (orange)
  if (classNum === 1 || (classNum >= 1.1 && classNum <= 1.6)) return "bg-orange-500";
  
  // Class 2 - Gases
  if (classNum >= 2 && classNum < 3) {
    if (hazardClass === "2.1") return "bg-red-600"; // Flammable gas (red)
    if (hazardClass === "2.2") return "bg-green-600"; // Non-flammable gas (green)
    if (hazardClass === "2.3") return "bg-white"; // Poison gas (white)
    return "bg-green-600";
  }
  
  // Class 3 - Flammable liquid (red)
  if (classNum === 3) return "bg-red-600";
  
  // Class 4 - Flammable solids
  if (classNum >= 4 && classNum < 5) {
    if (hazardClass === "4.1") return "bg-red-600 bg-stripes-white"; // Red with white stripes
    if (hazardClass === "4.2") return "bg-red-600"; // Spontaneously combustible (red)
    if (hazardClass === "4.3") return "bg-blue-600"; // Dangerous when wet (blue)
    return "bg-red-600";
  }
  
  // Class 5 - Oxidizers (yellow)
  if (classNum >= 5 && classNum < 6) return "bg-yellow-400";
  
  // Class 6 - Toxic/Poison (white)
  if (classNum >= 6 && classNum < 7) return "bg-white";
  
  // Class 7 - Radioactive (yellow top/white bottom)
  if (classNum === 7) return "bg-yellow-400";
  
  // Class 8 - Corrosive (white top/black bottom)
  if (classNum === 8) return "bg-white";
  
  // Class 9 - Miscellaneous (white with black stripes)
  if (classNum === 9) return "bg-white";
  
  return "bg-gray-500";
};

export const getHazardClassOptions = () => {
  return hazardClasses.map((hc) => ({
    value: hc.class,
    label: `Class ${hc.class} - ${hc.name}`,
  }));
};
