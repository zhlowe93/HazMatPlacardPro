import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Info, ShieldAlert, ClipboardCheck, Skull } from "lucide-react";
import { hazardClasses } from "@/lib/hazmat-data";

export default function ReferenceGuide() {
  const commonScenarios = [
    {
      id: "scenario-1",
      title: "The 1,001 lb Trap",
      description: "You have 500 lbs of Class 3 and 600 lbs of Class 8 in non-bulk drums. Is a placard required?",
      answer: "YES. The 1,001 lb threshold applies to the AGGREGATE weight of all Table 2 materials combined. Since 500 + 600 = 1,100 lbs, both Class 3 and Class 8 placards are required.",
      type: "Table 2",
      testSteps: [
        "Go to Materials tab",
        "Add UN1203, Class 3, non-bulk, 500 lbs",
        "Add UN1824, Class 8, non-bulk, 600 lbs",
        "Check Placards tab: Both should be required"
      ]
    },
    {
      id: "scenario-2",
      title: "The Bulk Container Rule",
      description: "You have a single 100-gallon tote containing only 200 lbs of Class 3. Is a placard required?",
      answer: "YES. Any Table 2 material in a container ABOVE 95 gallons (bulk) requires a placard at any quantity, even if the total weight is below 1,001 lbs.",
      type: "Bulk",
      testSteps: [
        "Clear current load",
        "Add UN1203, Class 3, bulk (>95 gal), 200 lbs",
        "Check Placards tab: Class 3 placard must be required"
      ]
    },
    {
      id: "scenario-3",
      title: "The Table 1 Exception",
      description: "You have just 1 lb of Class 4.3 (Dangerous When Wet). Is a placard required?",
      answer: "YES. Table 1 materials (Classes 1.1, 1.2, 1.3, 2.3, 4.3, 5.2 Type B, 6.1 PIH, 7 Yellow III) require placards at ANY quantity.",
      type: "Table 1",
      testSteps: [
        "Clear current load",
        "Add UN1396, Class 4.3, non-bulk, 1 lb",
        "Check Placards tab: Class 4.3 MUST be required"
      ]
    },
    {
      id: "scenario-4",
      title: "The 2,205 lb Facility Rule",
      description: "You pick up 1,500 lbs of Class 3 at Stop 1 and another 1,000 lbs of Class 3 at Stop 2. Can you use DANGEROUS?",
      answer: "YES. The 2,205 lb rule for specific placards applies per LOADING FACILITY (Stop). Since neither stop individually exceeded 2,205 lbs, and you have multiple classes (assuming others are present), DANGEROUS remains an option.",
      type: "Dangerous",
      testSteps: [
        "Add UN1203, Class 3, non-bulk, 1500 lbs at Stop 1",
        "Add UN1824, Class 8, non-bulk, 1000 lbs at Stop 2",
        "Check Placards tab: DANGEROUS option should be available"
      ]
    }
  ];

  const nightmareRoute = {
    title: "THE NIGHTMARE ROUTE",
    subtitle: "Ultimate Field Stress Test - 6 Materials, 3 Stops, Every Edge Case",
    description: "This scenario simulates the worst-case multi-stop pickup a hazmat driver could face. It tests Table 1 rules, bulk containers, aggregate thresholds, per-facility limits, and DANGEROUS placard eligibility all at once.",
    materials: [
      {
        step: 1,
        stop: 1,
        un: "UN1005",
        name: "Anhydrous Ammonia",
        class: "2.3",
        packing: "N/A",
        container: "Non-bulk (≤95 gal)",
        weight: "50 lbs",
        note: "TABLE 1 - Poison Gas. Placard required at ANY quantity."
      },
      {
        step: 2,
        stop: 1,
        un: "UN1203",
        name: "Gasoline",
        class: "3",
        packing: "II",
        container: "Above 95 gal (Bulk)",
        weight: "800 lbs",
        note: "BULK container - requires placard + UN number display regardless of weight."
      },
      {
        step: 3,
        stop: 1,
        un: "UN1789",
        name: "Hydrochloric Acid",
        class: "8",
        packing: "II",
        container: "Non-bulk (≤95 gal)",
        weight: "2,300 lbs",
        note: "Exceeds 2,205 lbs at Stop 1 - MUST use specific Class 8 placard (no DANGEROUS option for this class)."
      },
      {
        step: 4,
        stop: 2,
        un: "UN1263",
        name: "Paint",
        class: "3",
        packing: "III",
        container: "Non-bulk (≤95 gal)",
        weight: "400 lbs",
        note: "Different UN than Stop 1's Class 3. Adds to aggregate. Stop 2 is under 2,205 lbs."
      },
      {
        step: 5,
        stop: 2,
        un: "UN2794",
        name: "Lead-Acid Batteries",
        class: "8",
        packing: "N/A",
        container: "Non-bulk (≤95 gal)",
        weight: "1,200 lbs",
        note: "More Class 8. Total Class 8 now 3,500 lbs, but per-stop tracking matters for DANGEROUS."
      },
      {
        step: 6,
        stop: 3,
        un: "UN1402",
        name: "Calcium Carbide",
        class: "4.3",
        packing: "I",
        container: "Non-bulk (≤95 gal)",
        weight: "25 lbs",
        note: "TABLE 1 - Dangerous When Wet. Second Table 1 material. Placard required at ANY quantity."
      }
    ],
    expectedResults: {
      requiredPlacards: [
        { class: "2.3", reason: "Table 1 - Poison Gas (any quantity)" },
        { class: "3", reason: "Bulk container + aggregate weight (1,200 lbs total Class 3)" },
        { class: "8", reason: "Stop 1 has 2,300 lbs - exceeds 2,205 lb threshold" },
        { class: "4.3", reason: "Table 1 - Dangerous When Wet (any quantity)" }
      ],
      dangerousOption: false,
      dangerousReason: "DANGEROUS placard NOT available because: (1) Table 1 materials present (Class 2.3 and 4.3), (2) Bulk container present, (3) Class 8 exceeds 2,205 lbs at Stop 1.",
      totalWeight: "4,775 lbs",
      unNumbers: ["UN1203 must be displayed on Class 3 placard (bulk container rule)"]
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-2 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="w-full">
            <h2 className="text-xl font-bold text-primary mb-2">App Testing Run</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Use these steps to verify the app's calculation logic against real-world DOT rules.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonScenarios.map((scenario) => (
                <div key={scenario.id + "-test"} className="bg-background p-3 rounded-md border border-primary/10">
                  <p className="font-bold text-xs uppercase text-primary mb-2">{scenario.title}</p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    {scenario.testSteps.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-bold text-primary/50">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* THE NIGHTMARE ROUTE - Ultimate Stress Test */}
      <Card className="p-6 border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950" data-testid="nightmare-route-card">
        <div className="flex items-start gap-3">
          <Skull className="w-7 h-7 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-black text-orange-700 dark:text-orange-300">{nightmareRoute.title}</h2>
              <Badge className="bg-red-600 text-white text-[10px]">ADVANCED</Badge>
            </div>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">{nightmareRoute.subtitle}</p>
            <p className="text-sm text-muted-foreground mb-4">{nightmareRoute.description}</p>
            
            {/* Materials Table */}
            <div className="bg-background rounded-lg border border-orange-200 dark:border-orange-800 overflow-hidden mb-4">
              <div className="bg-orange-100 dark:bg-orange-900 px-3 py-2 border-b border-orange-200 dark:border-orange-800">
                <p className="font-bold text-sm text-orange-800 dark:text-orange-200">Step-by-Step: Add These Materials</p>
              </div>
              <div className="divide-y divide-border">
                {nightmareRoute.materials.map((mat) => (
                  <div key={mat.step} className="p-3 text-sm" data-testid={`nightmare-step-${mat.step}`}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">Step {mat.step}</Badge>
                      <Badge className="bg-blue-500 text-white text-[10px]">Stop {mat.stop}</Badge>
                      <span className="font-bold">{mat.un}</span>
                      <span className="text-muted-foreground">- {mat.name}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                      <div><span className="font-semibold">Class:</span> {mat.class}</div>
                      <div><span className="font-semibold">PG:</span> {mat.packing}</div>
                      <div><span className="font-semibold">Container:</span> {mat.container}</div>
                      <div><span className="font-semibold">Weight:</span> {mat.weight}</div>
                    </div>
                    <div className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                      {mat.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Results */}
            <div className="bg-background rounded-lg border border-green-300 dark:border-green-800 overflow-hidden">
              <div className="bg-green-100 dark:bg-green-900 px-3 py-2 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="font-bold text-sm text-green-800 dark:text-green-200">Expected Results (Verify in Placards Tab)</p>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <p className="font-semibold text-sm mb-2">Required Placards (4 Total):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {nightmareRoute.expectedResults.requiredPlacards.map((p) => (
                      <div key={p.class} className="flex items-start gap-2 text-xs bg-muted p-2 rounded">
                        <Badge variant="destructive" className="text-[10px] shrink-0">Class {p.class}</Badge>
                        <span className="text-muted-foreground">{p.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="font-semibold text-sm">DANGEROUS Placard: NOT Available</p>
                  </div>
                  <p className="text-xs text-muted-foreground bg-red-50 dark:bg-red-950 p-2 rounded border border-red-200 dark:border-red-800">
                    {nightmareRoute.expectedResults.dangerousReason}
                  </p>
                </div>

                <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold">Total Weight:</span> {nightmareRoute.expectedResults.totalWeight}
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold">UN Display:</span> {nightmareRoute.expectedResults.unNumbers[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Common Violations Alert Card */}
      <Card className="p-6 border-2 border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-destructive mb-2">Top Compliance Pitfalls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-bold">• Faded/Dirty Placards</p>
                <p className="text-muted-foreground text-xs">DOT inspectors cite faded colors or obscured placards (dirt/cargo) as top violations. If it's hard to read, it's a ticket.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold">• The "Aggregate" Confusion</p>
                <p className="text-muted-foreground text-xs">Drivers often forget that Table 2 weights add up across ALL classes. 500lbs + 600lbs = Placards Required.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold">• UN Numbers on Bulk</p>
                <p className="text-muted-foreground text-xs">Bulk containers ({">"}95 gal) must display the UN identification number on the placard or an orange panel.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold">• Old Placards Left Up</p>
                <p className="text-muted-foreground text-xs">Displaying placards for hazards not currently on the vehicle is a violation. Always clear old signs.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* ...rest of component... */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Hazard Class Reference</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Quick reference guide for DOT hazard classifications and placard requirements
        </p>

        <Accordion type="single" collapsible className="w-full">
          {hazardClasses.map((hazard) => (
            <AccordionItem key={hazard.class} value={hazard.class}>
              <AccordionTrigger data-testid={`accordion-class-${hazard.class}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="font-mono">
                    Class {hazard.class}
                  </Badge>
                  <span className="font-semibold">{hazard.name}</span>
                  {hazard.table === "1" && (
                    <Badge variant="destructive" className="text-xs">
                      Table 1
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <p className="text-sm">{hazard.description}</p>
                  
                  <div>
                    <p className="text-sm font-semibold mb-1">Placard Requirement:</p>
                    <p className="text-sm text-muted-foreground">{hazard.tableNote}</p>
                  </div>

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

      <Card className="p-6 border-2 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
              Subsidiary (Secondary) Hazard Classes — 49 CFR §172.505
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Some materials have <strong>two hazard classes</strong>: a primary class and a subsidiary (secondary) class shown in parentheses on shipping papers. This is critical for waste materials at Clean Harbors.
            </p>

            <div className="bg-background rounded-md p-3 mb-3 font-mono text-sm border border-blue-200 dark:border-blue-700">
              <p className="text-muted-foreground text-xs mb-1">Example shipping paper entry:</p>
              <p className="font-bold">UN3288, Toxic Solid, n.o.s., <span className="text-blue-700 dark:text-blue-300">6.1 (4.3)</span>, PG II</p>
              <p className="text-muted-foreground text-xs mt-1">Primary: Class 6.1 &nbsp;|&nbsp; Subsidiary: Class 4.3 (in parentheses)</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-background rounded-md p-3 border border-red-300 dark:border-red-700">
                <p className="font-bold text-destructive mb-1">§172.505(a) — Subsidiary Class 4.3 (Dangerous When Wet)</p>
                <p className="text-muted-foreground text-xs">
                  A <strong>DANGEROUS WHEN WET</strong> placard is required at <strong>ANY quantity</strong> when any material lists 4.3 as a subsidiary class — regardless of total weight. This is a Table 1-equivalent requirement triggered by the secondary class alone. It also prevents use of the DANGEROUS placard.
                </p>
                <div className="mt-2 bg-red-50 dark:bg-red-950 p-2 rounded text-xs font-semibold text-red-700 dark:text-red-300">
                  Example: 1 lb of Class 6.1 (4.3) waste = MUST display both Class 6.1 and Class 4.3 placards
                </div>
              </div>

              <div className="bg-background rounded-md p-3 border border-red-300 dark:border-red-700">
                <p className="font-bold text-destructive mb-1">§172.505(b) — Subsidiary Class 2.3 (Poison Gas)</p>
                <p className="text-muted-foreground text-xs">
                  A <strong>POISON GAS</strong> placard is required at <strong>ANY quantity</strong> when any material lists 2.3 as a subsidiary class. Same Table 1-equivalent requirement.
                </p>
              </div>

              <div className="bg-background rounded-md p-3 border border-muted-foreground/20">
                <p className="font-bold mb-1">Other Subsidiary Classes (3, 6.1, 8, etc.)</p>
                <p className="text-muted-foreground text-xs">
                  Other subsidiary classes (e.g., Class 6.1 as a subsidiary) do <strong>not</strong> independently trigger a separate placard requirement. They appear on container labels but do not change placarding decisions — only the primary class determines placard requirements for these.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">How to use this app for subsidiary classes:</p>
              <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Check shipping papers for any class in parentheses after the primary class</li>
                <li>In the Materials tab, use the "Subsidiary Hazard Class" dropdown to select it</li>
                <li>The app will automatically apply §172.505 rules and show any additional required placards</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-accent">
        <h3 className="font-semibold mb-2 text-base">Container Size Guidelines</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-medium">
            <strong>Simplified rule:</strong> Containers above 95 gallons are considered bulk.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">• Above 95 Gallons (Bulk):</span>
              <span>
                <strong>Table 2 materials require placards regardless of how much material is inside.</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">• 95 Gallons or Below (Non-Bulk):</span>
              <span>
                Table 2 materials require placards when the <strong>combined total weight of ALL Table 2 materials</strong> on the vehicle exceeds 1,001 lbs (per 49 CFR 172.504(c)).
              </span>
            </div>
          </div>
          <div className="pt-2 space-y-1 text-xs bg-background/50 p-3 rounded">
            <p className="font-semibold">Examples:</p>
            <p>• 100-gallon container with 200 lbs Class 3 = <strong>PLACARD REQUIRED</strong> (above 95 gallons)</p>
            <p>• 50-gallon drum with 500 lbs Class 3 only = <strong>NO PLACARD</strong> (total below 1,001 lbs)</p>
            <p>• Multiple drums: 500 lbs Class 3 + 600 lbs Class 8 = <strong>PLACARD REQUIRED</strong> (total 1,100 lbs exceeds threshold - both classes need placards)</p>
          </div>
          <p className="pt-2 text-xs">
            <strong>Note:</strong> Table 1 materials always require placards regardless of container size or quantity.
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-2 border-amber-500">
        <h3 className="font-semibold mb-2 text-base text-amber-900 dark:text-amber-100">DANGEROUS Placard Option (49 CFR 172.504(e))</h3>
        <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">
            The DANGEROUS placard may be used as an <strong>optional alternative</strong> to specific placards when ALL conditions are met:
          </p>
          <div className="space-y-2 pl-4">
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">✓ Container size:</span>
              <span>All materials must be in containers 95 gallons or below</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">✓ Multiple classes:</span>
              <span>Two or more different Table 2 hazard classes present</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">✓ No Table 1:</span>
              <span>Cannot use if any Table 1 material is present</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">✓ Weight limit:</span>
              <span>If any single class ≥2,205 lbs <strong>at one loading facility (stop)</strong>, that class must display its specific placard (DANGEROUS may be used for the remaining classes)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
