"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { resolveData } from "@/lib/fixtures";
import { fixtureFoodDetail } from "@/lib/fixtures/ops";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import type { FoodItemDetail } from "@/lib/contracts";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <span className="min-w-36 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children ?? "—"}</span>
    </div>
  );
}

const STATUS_VARIANT: Record<
  FoodItemDetail["status"],
  "success" | "accent" | "secondary" | "destructive"
> = {
  active: "success",
  pending: "accent",
  rejected: "destructive",
  merged: "secondary",
};

function foodDetailQuery(id: string) {
  return {
    queryKey: queryKeys.foods.detail(id),
    queryFn: () => resolveData(fixtureFoodDetail, () => callApi("GET_FOOD", { params: { id } })),
  };
}

function FoodDetailContent({ id }: { id: string }) {
  const { data } = useSuspenseQuery(foodDetailQuery(id));
  const food = data.food as FoodItemDetail;
  const n = food.nutrients;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">{food.name}</h1>
        <Badge variant={STATUS_VARIANT[food.status]}>{food.status}</Badge>
        <Badge variant="outline">{food.tier}</Badge>
        <Badge variant="outline">{food.origin}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Log count</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tabular-nums">{food.logCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">
              {food.verifiedAt ? formatDate(food.verifiedAt) : "Not verified"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">{formatDate(food.createdAt)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow label="Brand">{food.brand}</DetailRow>
          <DetailRow label="Barcode">{food.barcode}</DetailRow>
          <DetailRow label="Created by">{food.createdBy}</DetailRow>
          {food.mergedIntoId && (
            <DetailRow label="Merged into">
              <Link href={`/foods/${food.mergedIntoId}`} className="underline underline-offset-2">
                {food.mergedIntoId}
              </Link>
            </DetailRow>
          )}
        </CardContent>
      </Card>

      {n && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nutrition ({n.basis})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Serving">
              {n.servingLabel ?? (n.servingG ? `${n.servingG}g` : null)}
            </DetailRow>
            <Separator />
            <DetailRow label="Calories">{n.kcal} kcal</DetailRow>
            <DetailRow label="Protein">{n.proteinG}g</DetailRow>
            <DetailRow label="Carbs">{n.carbsG}g</DetailRow>
            <DetailRow label="Fat">{n.fatG}g</DetailRow>
            {n.fiberG != null && <DetailRow label="Fiber">{n.fiberG}g</DetailRow>}
            {n.sugarG != null && <DetailRow label="Sugar">{n.sugarG}g</DetailRow>}
            {n.sodiumMg != null && <DetailRow label="Sodium">{n.sodiumMg}mg</DetailRow>}
            {n.satFatG != null && <DetailRow label="Sat. fat">{n.satFatG}g</DetailRow>}
            {n.novaGroup != null && <DetailRow label="NOVA group">{n.novaGroup}</DetailRow>}
          </CardContent>
        </Card>
      )}

      {food.servings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Serving sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {food.servings.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-muted-foreground">{s.grams}g</span>
                  {s.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      default
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FoodDetailSection({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <Link
        href="/foods"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to food catalog
      </Link>

      <QueryBoundary
        fallback={<MetricCardsFallback count={3} />}
        errorMessage="Could not load food details."
      >
        <FoodDetailContent id={id} />
      </QueryBoundary>
    </div>
  );
}
