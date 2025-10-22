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
        <h3 className="font-semibold mb-2 text-base">Bulk vs Non-Bulk Containers</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-medium">
            <strong>Critical distinction:</strong> Bulk classification is based on <em>container capacity</em>, not material weight.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">• Bulk Container:</span>
              <span>
                Container <em>capacity</em> exceeds 119 gallons (liquid), 882 lbs (solid), or 1,000 lbs (gas).
                <strong> Table 2 materials in bulk containers require placards regardless of how much material is inside.</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">• Non-Bulk Container:</span>
              <span>
                Smaller capacity containers. Table 2 materials require placards only when aggregate <em>weight</em> exceeds 1,001 lbs per hazard class.
              </span>
            </div>
          </div>
          <div className="pt-2 space-y-1 text-xs bg-background/50 p-3 rounded">
            <p className="font-semibold">Examples:</p>
            <p>• 500-gallon tanker (bulk) with 200 lbs Class 3 = <strong>PLACARD REQUIRED</strong> (bulk container)</p>
            <p>• 50-gallon drum (non-bulk) with 900 lbs Class 3 = <strong>NO PLACARD</strong> (below 1,001 lbs)</p>
          </div>
          <p className="pt-2 text-xs">
            <strong>Note:</strong> Table 1 materials always require placards regardless of container type or quantity.
          </p>
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
