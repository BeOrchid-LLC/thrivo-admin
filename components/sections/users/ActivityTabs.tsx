"use client";

import { useState } from "react";
import type { AdminActivityType } from "@/lib/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { ActivityList } from "./ActivityList";

const TABS: Array<{ value: AdminActivityType; label: string }> = [
  { value: "food_logs", label: "Food logs" },
  { value: "check_ins", label: "Check-ins" },
  { value: "weight_logs", label: "Weight logs" },
];

/** Food logs / Check-ins / Weight logs — each tab independently fetches on
 *  activation (Radix unmounts inactive TabsContent, so only the visible tab
 *  hits the network) and owns its own loading/error state. */
export function ActivityTabs({ userId }: { userId: string }) {
  const [active, setActive] = useState<AdminActivityType>("food_logs");

  return (
    <Card>
      <CardContent className="p-5">
        <Tabs value={active} onValueChange={(v) => setActive(v as AdminActivityType)}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <QueryBoundary
                fallback={<TableContentSkeleton rows={4} />}
                errorMessage={`Could not load ${tab.label.toLowerCase()}.`}
              >
                <ActivityList userId={userId} type={tab.value} />
              </QueryBoundary>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
