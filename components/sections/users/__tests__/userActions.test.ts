import { describe, expect, it, vi } from "vitest";
import { fixtureUsers } from "@/lib/fixtures";
import { getUserActions } from "../userActions";

describe("getUserActions", () => {
  it("includes subscription operations for subscribed users", () => {
    const user = fixtureUsers[0];
    const handlers = {
      onDelete: vi.fn(),
      onCancelSubscription: vi.fn(),
      onRefundSubscription: vi.fn(),
      onReconcileSubscription: vi.fn(),
    };

    const actions = getUserActions(user, handlers);

    expect(actions.map((action) => action.label)).toEqual([
      "View full details",
      "Delete permanently",
      "Cancel subscription",
      "Record refund decision",
      "Reconcile subscription",
    ]);

    actions.find((action) => action.label === "Cancel subscription")?.onClick?.();
    actions.find((action) => action.label === "Record refund decision")?.onClick?.();
    actions.find((action) => action.label === "Reconcile subscription")?.onClick?.();

    expect(handlers.onCancelSubscription).toHaveBeenCalledWith(user);
    expect(handlers.onRefundSubscription).toHaveBeenCalledWith(user);
    expect(handlers.onReconcileSubscription).toHaveBeenCalledWith(user);
  });

  it("does not offer subscription operations for users without a subscription", () => {
    const user = fixtureUsers.find((item) => item.subscription === null)!;
    const actions = getUserActions(user, {
      onCancelSubscription: vi.fn(),
      onRefundSubscription: vi.fn(),
      onReconcileSubscription: vi.fn(),
    });

    expect(actions.map((action) => action.label)).toEqual(["View full details"]);
  });

  it("can omit the full-details action for a page-level menu", () => {
    const user = fixtureUsers[0];
    const actions = getUserActions(user, {}, { includeViewDetails: false });

    expect(actions).toHaveLength(0);
  });
});
