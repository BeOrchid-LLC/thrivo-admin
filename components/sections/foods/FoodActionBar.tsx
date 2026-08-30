"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { callApi, isApiError } from "@/lib/api";
import { env } from "@/lib/config/env";
import { useCapability } from "@/lib/hooks/useCapability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FoodItemDetail } from "@/lib/contracts";
import { toast } from "sonner";

type Mode = "view" | "edit" | "reject" | "merge";

interface FoodActionBarProps {
  food: FoodItemDetail;
  onDone: (message: string, patch?: Partial<FoodItemDetail>) => void;
}

function onErr(error: unknown) {
  toast.error(isApiError(error) ? error.message : "Action failed.");
}

export function FoodActionBar({ food, onDone }: FoodActionBarProps) {
  const { canManageFoods, role } = useCapability();
  const canMergeFood = canManageFoods && (role === "admin" || role === "super-admin");
  const [mode, setMode] = useState<Mode>("view");
  const approve = useMutation({
    mutationFn: () =>
      env.useFixtures ? Promise.resolve({}) : callApi("APPROVE_FOOD", { params: { id: food.id } }),
    onSuccess: () => onDone("Approved.", { status: "active" }),
    onError: onErr,
  });
  const verify = useMutation({
    mutationFn: (unverify: boolean) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("VERIFY_FOOD", {
            params: { id: food.id },
            query: unverify ? { unverify: "1" } : {},
          }),
    onSuccess: (_result, unverify) =>
      onDone("Updated verification.", {
        verifiedAt: unverify ? null : new Date().toISOString(),
      }),
    onError: onErr,
  });
  const finish = (message: string, patch?: Partial<FoodItemDetail>) => {
    setMode("view");
    onDone(message, patch);
  };

  if (!canManageFoods) return null;

  return (
    <div className="space-y-3 border-t pt-4">
      {mode === "view" ? (
        <div className="flex flex-wrap gap-2">
          {food.status !== "active" ? (
            <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate()}>
              Approve
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => setMode("reject")}>
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={verify.isPending}
            onClick={() => verify.mutate(!!food.verifiedAt)}
          >
            {food.verifiedAt ? "Unverify" : "Verify"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMode("edit")}>
            Edit
          </Button>
          {canMergeFood ? (
            <Button size="sm" variant="destructive" onClick={() => setMode("merge")}>
              Merge
            </Button>
          ) : null}
        </div>
      ) : null}

      {mode === "reject" ? (
        <RejectForm
          foodId={food.id}
          onDone={() => finish("Rejected.", { status: "rejected" })}
          onCancel={() => setMode("view")}
        />
      ) : null}
      {mode === "merge" ? (
        <MergeForm
          foodId={food.id}
          onDone={(mergeIntoId) => finish("Merged.", { mergedIntoId: mergeIntoId })}
          onCancel={() => setMode("view")}
        />
      ) : null}
      {mode === "edit" ? (
        <EditForm
          food={food}
          onDone={(patch) => finish("Saved.", patch)}
          onCancel={() => setMode("view")}
        />
      ) : null}
    </div>
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
  const mutation = useMutation({
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
          disabled={!reason.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
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
  const mutation = useMutation({
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
            Canonical survivor: {preview.data.preview.target?.name ?? target}
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
          disabled={!target.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
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
  const nutrients = food.nutrients;
  const [name, setName] = useState(food.name);
  const [brand, setBrand] = useState(food.brand ?? "");
  const [kcal, setKcal] = useState(nutrients ? String(nutrients.kcal) : "");
  const [proteinG, setProteinG] = useState(nutrients ? String(nutrients.proteinG) : "");
  const [carbsG, setCarbsG] = useState(nutrients ? String(nutrients.carbsG) : "");
  const [fatG, setFatG] = useState(nutrients ? String(nutrients.fatG) : "");
  const mutation = useMutation({
    mutationFn: () => {
      const hasNutrients = [kcal, proteinG, carbsG, fatG].some((v) => v.trim() !== "");
      if (env.useFixtures) return Promise.resolve({});
      return callApi("EDIT_FOOD", {
        params: { id: food.id },
        payload: {
          name: name.trim() || undefined,
          brand: brand.trim() ? brand.trim() : null,
          nutrients: hasNutrients
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
        nutrients: [kcal, proteinG, carbsG, fatG].some((v) => v.trim() !== "")
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
        <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
