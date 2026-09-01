import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminProfileSection } from "../AdminProfileSection";
import { useAdminSession } from "@/components/providers/SessionProvider";
import { useQuery } from "@tanstack/react-query";
import { callApi, isApiError } from "@/lib/api";

const openUserProfile = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ openUserProfile }),
}));

vi.mock("@/components/providers/SessionProvider", () => ({
  useAdminSession: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  callApi: vi.fn(),
  isApiError: vi.fn().mockReturnValue(false),
  queryKeys: {
    profile: {
      detail: vi.fn().mockReturnValue(["profile", "detail"]),
      activity: vi.fn().mockReturnValue(["profile", "activity"]),
    },
  },
}));

vi.mock("@/lib/fixtures", () => ({
  fixtureAuditLogPage: {
    items: [
      {
        id: "activity-1",
        actorEmail: "admin@example.com",
        action: "tip.update",
        targetType: "tip",
        targetId: "tip-1",
        requestId: "request-1",
        createdAt: "2026-06-13T12:10:00.000Z",
      },
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
  },
  resolveData: (_fixture: unknown, live: () => unknown) => live(),
}));

const session = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin" as const,
  permissions: null,
};

const activityResult = {
  data: {
    items: [
      {
        id: "activity-1",
        actorEmail: "admin@example.com",
        action: "tip.update",
        targetType: "tip",
        targetId: "tip-1",
        requestId: "request-1",
        createdAt: "2026-06-13T12:10:00.000Z",
      },
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const profileResult = {
  data: {
    admin: {
      ...session,
      status: "active",
      invitedByEmail: null,
      lastLoginAt: "2026-06-13T12:10:00.000Z",
      inviteExpiresAt: null,
      inviteRevokedAt: null,
      createdAt: "2026-01-01T12:10:00.000Z",
      effectivePermissions: ["users.read", "audit.read"],
      permissionSource: "role",
      authProvider: "clerk",
    },
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

function selectTab(name: string) {
  fireEvent.mouseDown(screen.getByRole("tab", { name }));
}

describe("AdminProfileSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminSession).mockReturnValue(session);
    vi.mocked(useQuery).mockImplementation((options) => {
      const key = (options as { queryKey?: readonly unknown[] }).queryKey;
      return (key?.[1] === "activity" ? activityResult : profileResult) as never;
    });
    vi.mocked(isApiError).mockReturnValue(false);
  });

  it("renders the profile overview with identity and session details", () => {
    render(<AdminProfileSection />);

    expect(screen.getByRole("heading", { name: "Profile" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Admin User" })).toBeTruthy();
    expect(screen.getAllByText("admin@example.com").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(1);
    expect(screen.getByText("Authenticated")).toBeTruthy();
  });

  it("falls back to the email when the admin has no name", () => {
    vi.mocked(useAdminSession).mockReturnValue({ ...session, name: null });
    render(<AdminProfileSection />);

    expect(screen.getAllByText("admin@example.com").length).toBeGreaterThan(1);
  });

  it("shows role-derived permissions", async () => {
    render(<AdminProfileSection />);
    selectTab("Permissions");

    await waitFor(() => expect(screen.getByText("View users")).toBeTruthy());
    expect(screen.getByText("Manage global settings")).toBeTruthy();
    expect(screen.getByText(/Role-derived permissions for the Admin role/)).toBeTruthy();
  });

  it("renders recent activity through the server-scoped profile endpoint", async () => {
    render(<AdminProfileSection />);
    selectTab("Activity");

    await waitFor(() => expect(screen.getByText("tip.update")).toBeTruthy());
    expect(screen.getByText(/Target tip-1/)).toBeTruthy();

    const queryOptions = vi.mocked(useQuery).mock.calls[1]?.[0] as unknown as {
      queryFn: () => Promise<unknown>;
    };
    vi.mocked(callApi).mockResolvedValue(activityResult.data as never);
    await queryOptions.queryFn();

    expect(callApi).toHaveBeenCalledWith("GET_ADMIN_PROFILE_ACTIVITY", {
      query: { page: 1, pageSize: 10 },
    });
  });

  it("shows a loading state while activity is being fetched", async () => {
    vi.mocked(useQuery).mockReturnValue({ ...activityResult, isLoading: true } as never);
    render(<AdminProfileSection />);
    selectTab("Activity");

    expect(await screen.findByLabelText("Loading activity")).toBeTruthy();
  });

  it("shows an empty state when the admin has no activity", async () => {
    vi.mocked(useQuery).mockReturnValue({
      ...activityResult,
      data: {
        ...activityResult.data,
        items: [],
        pagination: { ...activityResult.data.pagination, total: 0 },
      },
    } as never);
    render(<AdminProfileSection />);
    selectTab("Activity");

    expect(await screen.findByText("No activity yet")).toBeTruthy();
  });

  it("shows a forbidden state when audit activity is unavailable to the admin", async () => {
    vi.mocked(useQuery).mockReturnValue({
      ...activityResult,
      data: undefined,
      isError: true,
      error: { code: "FORBIDDEN" },
    } as never);
    vi.mocked(isApiError).mockReturnValue(true);
    render(<AdminProfileSection />);
    selectTab("Activity");

    expect(await screen.findByText("Activity is restricted")).toBeTruthy();
  });

  it("opens security management in Clerk's modal", async () => {
    render(<AdminProfileSection />);
    selectTab("Security");

    const manageAccount = await screen.findByRole("button", { name: "Manage account" });
    fireEvent.click(manageAccount);

    expect(openUserProfile).toHaveBeenCalledTimes(1);
  });
});
