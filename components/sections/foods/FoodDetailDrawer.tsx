"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AppLoader } from "@/components/general/AppLoader";
import type { FoodItemDetail } from "@/lib/contracts";

type Mode = "view" | "edit" | "reject" | "merge";

function onErr(error: unknown) {
  toast.error(isApiError(error) ? error.message : "Action failed.");
}

export function FoodDetailDrawer({
  foodId,
  onClose,
}: {
  foodId: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { canManageFoods } = useCapability();
  const [mode, setMode] = useState<Mode>("view");

  useEffect(() => {
    if (foodId) setMode("view");
  }, [foodId]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.foods.detail(foodId ?? ""),
    queryFn: () =>
      resolveData(fixtureFoodDetail, () => callApi("GET_FOOD", { params: { id: foodId! } })),
    enabled: !!foodId,
  });

  const food = data?.food as FoodItemDetail | undefined;

  const afterAction = (msg: string, patch?: Partial<FoodItemDetail>) => {
    if (env.useFixtures && patch) {
      qc.setQueryData<{ food: FoodItemDetail }>(queryKeys.foods.detail(foodId ?? ""), (current) =>
        current ? { food: { ...current.food, ...patch } } : current
      );
    } else if (!env.useFixtures) {
      void qc.invalidateQueries({ queryKey: ["foods"], exact: false });
    }
    toast.success(msg);
    setMode("view");
  };

  const approve = useMutation({
    mutationFn: () =>
      env.useFixtures ? Promise.resolve({}) : callApi("APPROVE_FOOD", { params: { id: foodId! } }),
    onSuccess: () => afterAction("Approved.", { status: "active" }),
    onError: onErr,
  });
  const verify = useMutation({
    mutationFn: (unverify: boolean) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("VERIFY_FOOD", {
            params: { id: foodId! },
            query: unverify ? { unverify: "1" } : {},
          }),
    onSuccess: (_result, unverify) =>
      afterAction("Updated verification.", {
        verifiedAt: unverify ? null : new Date().toISOString(),
      }),
    onError: onErr,
  });

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
                    {food.servings.map((s) => (
                      <li key={s.id}>
                        {s.label} — {s.grams} g{s.isDefault ? " (default)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Separator />

              {mode === "view" && (
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
                  {canManageFoods && food.status !== "active" && (
                    <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate()}>
                      Approve
                    </Button>
                  )}
                  {canManageFoods && (
                    <Button size="sm" variant="outline" onClick={() => setMode("reject")}>
                      Reject
                    </Button>
                  )}
                  {canManageFoods && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={verify.isPending}
                      onClick={() => verify.mutate(!!food.verifiedAt)}
                    >
                      {food.verifiedAt ? "Unverify" : "Verify"}
                    </Button>
                  )}
                  {canManageFoods && (
                    <Button size="sm" variant="outline" onClick={() => setMode("edit")}>
                      Edit
                    </Button>
                  )}
                  {canManageFoods && (
                    <Button size="sm" variant="destructive" onClick={() => setMode("merge")}>
                      Merge
                    </Button>
                  )}
                </div>
              )}

              {mode === "reject" && (
                <RejectForm
                  foodId={food.id}
                  onDone={() => afterAction("Rejected.", { status: "rejected" })}
                  onCancel={() => setMode("view")}
                />
              )}
              {mode === "merge" && (
                <MergeForm
                  foodId={food.id}
                  onDone={(mergeIntoId) => afterAction("Merged.", { mergedIntoId: mergeIntoId })}
                  onCancel={() => setMode("view")}
                />
              )}
              {mode === "edit" && (
                <EditForm
                  food={food}
                  onDone={(patch) => afterAction("Saved.", patch)}
                  onCancel={() => setMode("view")}
                />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function RejectForm({
  foodId,
  onDone,
  onCancel,
}: {
  foodId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const mut = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("REJECT_FOOD", { params: { id: foodId }, payload: { reason } }),
    onSuccess: onDone,
    onError: onErr,
  });
  return (
    <div className="space-y-2">
      <Label htmlFor="reject-reason">Rejection reason</Label>
      <Textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          disabled={!reason.trim() || mut.isPending}
          onClick={() => mut.mutate()}
        >
          Confirm reject
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function MergeForm({
  foodId,
  onDone,
  onCancel,
}: {
  foodId: string;
  onDone: (mergeIntoId: string) => void;
  onCancel: () => void;
}) {
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const preview = useQuery({
    queryKey: ["foods", "merge-preview", foodId, target.trim()],
    queryFn: () =>
      callApi("MERGE_FOOD_PREVIEW", {
        params: { id: foodId },
        query: { mergeIntoId: target.trim() },
      }),
    enabled: target.trim().length > 0 && !env.useFixtures,
  });
  const mut = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("MERGE_FOOD", {
            params: { id: foodId },
            payload: { mergeIntoId: target.trim(), reason: reason.trim() || undefined },
          }),
    onSuccess: () => onDone(target.trim()),
    onError: onErr,
  });
  return (
    <div className="space-y-2">
      <Label htmlFor="merge-target">Merge into item ID (canonical survivor)</Label>
      <Input
        id="merge-target"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="food item id"
      />
      <Label htmlFor="merge-reason">Reason (optional)</Label>
      <Input id="merge-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      <p className="text-xs text-muted-foreground">
        Historical diary entries are snapshotted and stay unchanged; favorites repoint to the
        survivor.
      </p>
      {preview.data?.preview ? (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="font-medium">Merge preview</p>
          <p className="text-muted-foreground">
            Canonical survivor:{" "}
            {preview.data.preview.target && (preview.data.preview.target as { name?: string }).name
              ? (preview.data.preview.target as { name: string }).name
              : target}
          </p>
          <p className="text-muted-foreground">
            Favorites affected: {preview.data.preview.favoriteCount} · Food logs:{" "}
            {preview.data.preview.logCount}
          </p>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          disabled={!target.trim() || mut.isPending}
          onClick={() => mut.mutate()}
        >
          Confirm merge
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function EditForm({
  food,
  onDone,
  onCancel,
}: {
  food: FoodItemDetail;
  onDone: (patch: Partial<FoodItemDetail>) => void;
  onCancel: () => void;
}) {
  const n = food.nutrients;
  const [name, setName] = useState(food.name);
  const [brand, setBrand] = useState(food.brand ?? "");
  const [kcal, setKcal] = useState(n ? String(n.kcal) : "");
  const [proteinG, setProteinG] = useState(n ? String(n.proteinG) : "");
  const [carbsG, setCarbsG] = useState(n ? String(n.carbsG) : "");
  const [fatG, setFatG] = useState(n ? String(n.fatG) : "");
  const hasNutrient = [kcal, proteinG, carbsG, fatG].some((v) => v.trim() !== "");
  const mut = useMutation({
    mutationFn: () => {
      const hasNutrient = [kcal, proteinG, carbsG, fatG].some((v) => v.trim() !== "");
      if (env.useFixtures) return Promise.resolve({});
      return callApi("EDIT_FOOD", {
        params: { id: food.id },
        payload: {
          name: name.trim() || undefined,
          brand: brand.trim() ? brand.trim() : null,
          nutrients: hasNutrient
            ? {
                kcal: kcal.trim() ? Number(kcal) : undefined,
                proteinG: proteinG.trim() ? Number(proteinG) : undefined,
                carbsG: carbsG.trim() ? Number(carbsG) : undefined,
                fatG: fatG.trim() ? Number(fatG) : undefined,
              }
            : undefined,
        },
      });
    },
    onSuccess: () =>
      onDone({
        name: name.trim() || food.name,
        brand: brand.trim() || null,
        nutrients: hasNutrient
          ? {
              ...(food.nutrients ?? {
                basis: "per_100g" as const,
                servingLabel: null,
                servingG: null,
                fiberG: null,
                sugarG: null,
                sodiumMg: null,
                satFatG: null,
                novaGroup: null,
              }),
              kcal: Number(kcal) || 0,
              proteinG: Number(proteinG) || 0,
              carbsG: Number(carbsG) || 0,
              fatG: Number(fatG) || 0,
            }
          : food.nutrients,
      }),
    onError: onErr,
  });
  return (
    <div className="space-y-2">
      <Label htmlFor="edit-name">Name</Label>
      <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
      <Label htmlFor="edit-brand">Brand</Label>
      <Input id="edit-brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
      <p className="pt-1 text-xs font-medium text-muted-foreground">
        Nutrition (leave blank to keep current)
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="edit-kcal">Calories (kcal)</Label>
          <Input
            id="edit-kcal"
            type="number"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-protein">Protein (g)</Label>
          <Input
            id="edit-protein"
            type="number"
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-carbs">Carbs (g)</Label>
          <Input
            id="edit-carbs"
            type="number"
            value={carbsG}
            onChange={(e) => setCarbsG(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-fat">Fat (g)</Label>
          <Input
            id="edit-fat"
            type="number"
            value={fatG}
            onChange={(e) => setFatG(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" disabled={mut.isPending} onClick={() => mut.mutate()}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
