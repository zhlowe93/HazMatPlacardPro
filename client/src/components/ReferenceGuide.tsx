import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hazardClasses, type HazardClassInfo } from "@/lib/hazmat-data";

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
            <strong>Simplified rule:</strong> Containers above 85 gallons are considered bulk.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">• Above 85 Gallons (Bulk):</span>
              <span>
                <strong>Table 2 materials require placards regardless of how much material is inside.</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">• 85 Gallons or Below (Non-Bulk):</span>
              <span>
                Table 2 materials require placards only when aggregate <em>weight</em> exceeds 1,001 lbs per hazard class.
              </span>
            </div>
          </div>
          <div className="pt-2 space-y-1 text-xs bg-background/50 p-3 rounded">
            <p className="font-semibold">Examples:</p>
            <p>• 100-gallon container with 200 lbs Class 3 = <strong>PLACARD REQUIRED</strong> (above 85 gallons)</p>
            <p>• 50-gallon drum with 900 lbs Class 3 = <strong>NO PLACARD</strong> (below 1,001 lbs)</p>
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
              <span>All materials must be in containers 85 gallons or below</span>
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
          <div className="pt-2 space-y-1 text-xs bg-background/50 p-3 rounded">
            <p className="font-semibold">Examples:</p>
            <p>• Stop 1: 1,200 lbs Class 3 + 800 lbs Class 8 (non-bulk) = <strong>May use DANGEROUS</strong> instead of both specific placards</p>
            <p>• Stop 1: 2,500 lbs Class 8 (non-bulk) + Stop 2: 600 lbs Class 3 = <strong>Must display Class 8 placard</strong> (≥2,205 lbs at one stop), may use DANGEROUS for Class 3</p>
            <p>• Stop 1: 1,500 lbs Class 8 + Stop 2: 1,000 lbs Class 8 + Stop 3: 600 lbs Class 3 = <strong>May use DANGEROUS</strong> (no single stop has ≥2,205 lbs of one class)</p>
            <p>• 1,500 lbs Class 3 in bulk tanker + 800 lbs Class 8 = <strong>Cannot use DANGEROUS</strong> (bulk present)</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h3 className="font-semibold mb-2 text-base">Placard Requirements Summary</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• Table 1:</span>
            <span>Materials requiring placards at any quantity (marked with red "Table 1" badge)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• Table 2 (Bulk):</span>
            <span>Placard required at any quantity when transported in bulk containers</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold shrink-0">• Table 2 (Non-Bulk):</span>
            <span>Placard required when aggregate weight of a single hazard class exceeds 1,001 lbs</span>
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
