import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Info, ShieldAlert, ClipboardCheck } from "lucide-react";
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
