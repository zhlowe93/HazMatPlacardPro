import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HazardClassInfo {
  class: string;
  name: string;
  description: string;
  examples: string[];
  placardColor: string;
  symbol: string;
}

const hazardClasses: HazardClassInfo[] = [
  {
    class: "1",
    name: "Explosives",
    description: "Materials that can cause an explosion",
    examples: ["Ammunition", "Fireworks", "Flares"],
    placardColor: "Orange",
    symbol: "Exploding bomb",
  },
  {
    class: "2.1",
    name: "Flammable Gas",
    description: "Gases that can ignite easily",
    examples: ["Propane", "Butane", "Methane"],
    placardColor: "Red",
    symbol: "Flame",
  },
  {
    class: "2.2",
    name: "Non-Flammable Gas",
    description: "Compressed gases that are not flammable",
    examples: ["Oxygen", "Nitrogen", "Carbon dioxide"],
    placardColor: "Green",
    symbol: "Gas cylinder",
  },
  {
    class: "2.3",
    name: "Poison Gas",
    description: "Gases that are toxic when inhaled",
    examples: ["Chlorine", "Ammonia", "Sulfur dioxide"],
    placardColor: "White",
    symbol: "Skull and crossbones",
  },
  {
    class: "3",
    name: "Flammable Liquid",
    description: "Liquids that can easily catch fire",
    examples: ["Gasoline", "Diesel", "Ethanol", "Acetone"],
    placardColor: "Red",
    symbol: "Flame",
  },
  {
    class: "4.1",
    name: "Flammable Solid",
    description: "Solids that can catch fire easily",
    examples: ["Matches", "Sulfur", "Metal powders"],
    placardColor: "Red/White stripes",
    symbol: "Flame",
  },
  {
    class: "4.2",
    name: "Spontaneously Combustible",
    description: "Materials that can ignite without external source",
    examples: ["White phosphorus", "Certain oils"],
    placardColor: "Red/White",
    symbol: "Flame",
  },
  {
    class: "4.3",
    name: "Dangerous When Wet",
    description: "Materials that become flammable when wet",
    examples: ["Sodium", "Calcium carbide", "Potassium"],
    placardColor: "Blue",
    symbol: "Flame",
  },
  {
    class: "5.1",
    name: "Oxidizer",
    description: "Materials that promote combustion",
    examples: ["Hydrogen peroxide", "Nitrates", "Chlorates"],
    placardColor: "Yellow",
    symbol: "Flame over circle",
  },
  {
    class: "5.2",
    name: "Organic Peroxide",
    description: "Organic compounds that can cause explosions",
    examples: ["Benzoyl peroxide", "MEK peroxide"],
    placardColor: "Red/Yellow",
    symbol: "Flame over circle",
  },
  {
    class: "6.1",
    name: "Poison/Toxic",
    description: "Materials that are poisonous if ingested or absorbed",
    examples: ["Pesticides", "Arsenic", "Cyanides"],
    placardColor: "White",
    symbol: "Skull and crossbones",
  },
  {
    class: "7",
    name: "Radioactive",
    description: "Materials that emit radiation",
    examples: ["Uranium", "Plutonium", "Medical isotopes"],
    placardColor: "Yellow/White",
    symbol: "Trefoil",
  },
  {
    class: "8",
    name: "Corrosive",
    description: "Materials that can cause severe damage to skin/metal",
    examples: ["Sulfuric acid", "Hydrochloric acid", "Sodium hydroxide"],
    placardColor: "White/Black",
    symbol: "Liquid on hand/metal",
  },
  {
    class: "9",
    name: "Miscellaneous",
    description: "Other hazardous materials not in above classes",
    examples: ["Dry ice", "Lithium batteries", "Asbestos"],
    placardColor: "White/Black stripes",
    symbol: "Seven vertical stripes",
  },
];

export default function ReferenceGuide() {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Hazard Class Reference</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Quick reference guide for DOT hazard classifications and placard requirements
        </p>

        <Accordion type="single" collapsible className="w-full">
          {hazardClasses.map((hazard) => (
            <AccordionItem key={hazard.class} value={hazard.class}>
              <AccordionTrigger data-testid={`accordion-class-${hazard.class}`}>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    Class {hazard.class}
                  </Badge>
                  <span className="font-semibold">{hazard.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <p className="text-sm">{hazard.description}</p>
                  
                  <div>
                    <p className="text-sm font-semibold mb-1">Placard Color:</p>
                    <p className="text-sm text-muted-foreground">{hazard.placardColor}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1">Symbol:</p>
                    <p className="text-sm text-muted-foreground">{hazard.symbol}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1">Common Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {hazard.examples.map((example) => (
                        <Badge key={example} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card className="p-6 bg-muted">
        <h3 className="font-semibold mb-2 text-base">Placard Requirements Summary</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• 1,001 lbs:</span>
            <span>Placard required when aggregate weight of a single hazard class exceeds this threshold</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• Four sides:</span>
            <span>Placards must be displayed on all four sides of the vehicle (front, back, both sides)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• Visibility:</span>
            <span>Placards must be clearly visible from the direction they face</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• Multiple classes:</span>
            <span>Display all required placards for different hazard classes present</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
