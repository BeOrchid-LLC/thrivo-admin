"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, queryKeys, type EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import { resolveData } from "@/lib/fixtures";
import { fixtureFoodDetail } from "@/lib/fixtures/ops";
import { useCapability } from "@/lib/hooks/useCapability";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppLoader } from "@/components/general/AppLoader";
import type { FoodItemDetail } from "@/lib/contracts";
import { FoodActionBar } from "./FoodActionBar";

export function FoodDetailDrawer({
  foodId,
  onClose,
}: {
  foodId: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { canManageFoods } = useCapability();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.foods.detail(foodId ?? ""),
    queryFn: () =>
      resolveData(fixtureFoodDetail, () => callApi("GET_FOOD", { params: { id: foodId! } })),
    enabled: !!foodId,
  });
  const food = data?.food as FoodItemDetail | undefined;

  const afterAction = (message: string, patch?: Partial<FoodItemDetail>) => {
    if (env.useFixtures && patch && foodId) {
      qc.setQueryData<{ food: FoodItemDetail }>(queryKeys.foods.detail(foodId), (current) =>
        current ? { food: { ...current.food, ...patch } } : current
      );
      qc.setQueriesData<EndpointResponse<"LIST_FOODS">>(
        { queryKey: ["foods", "list"] },
        (current) =>
          current
            ? {
                ...current,
                items: current.items.map((item) =>
                  item.id === foodId ? { ...item, ...patch } : item
                ),
              }
            : current
      );
    } else if (!env.useFixtures) {
      void qc.invalidateQueries({ queryKey: ["foods"], exact: false });
    }
    toast.success(message);
  };

  return (
    <Sheet open={!!foodId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading || !food ? (
          <AppLoader />
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {food.name}
                {food.verifiedAt ? <Badge variant="success">Verified</Badge> : null}
              </SheetTitle>
              <SheetDescription>
                {food.brand ? `${food.brand} · ` : ""}
                {food.tier} · {food.origin} · {food.status} · {food.logCount} logs
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4">
              {food.nutrients ? (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="mb-2 font-medium">Nutrition ({food.nutrients.basis})</p>
                  <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                    <span>Calories: {food.nutrients.kcal} kcal</span>
                    <span>Protein: {food.nutrients.proteinG} g</span>
                    <span>Carbs: {food.nutrients.carbsG} g</span>
                    <span>Fat: {food.nutrients.fatG} g</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No nutrition data.</p>
              )}

              {food.servings.length > 0 ? (
                <div className="text-sm">
                  <p className="mb-1 font-medium">Servings</p>
                  <ul className="text-muted-foreground">
                    {food.servings.map((serving) => (
                      <li key={serving.id}>
                        {serving.label} — {serving.grams} g{serving.isDefault ? " (default)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Separator />
              <div className="flex flex-wrap gap-2">
                <Link href={`/foods/${food.id}`}>
                  <Button size="sm" variant="outline">
                    View full details
                  </Button>
                </Link>
                <Link href={`/audit?kind=food_item&targetId=${encodeURIComponent(food.id)}`}>
                  <Button size="sm" variant="outline">
                    Audit history
                  </Button>
                </Link>
              </div>
              {canManageFoods ? <FoodActionBar food={food} onDone={afterAction} /> : null}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
