import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminProfileSection } from "../AdminProfileSection";
import { useAdminSession } from "@/components/providers/SessionProvider";
import { useQuery } from "@tanstack/react-query";
import { callApi, isApiError } from "@/lib/api";

vi.mock("@/components/providers/SessionProvider", () => ({
  useAdminSession: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  callApi: vi.fn(),
  isApiError: vi.fn().mockReturnValue(false),
  queryKeys: { auditLog: { list: vi.fn().mockReturnValue(["audit-log"]) } },
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

function selectTab(name: string) {
  fireEvent.mouseDown(screen.getByRole("tab", { name }));
}

describe("AdminProfileSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminSession).mockReturnValue(session);
    vi.mocked(useQuery).mockReturnValue(activityResult as never);
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

  it("renders recent activity and filters it by the signed-in admin", async () => {
    render(<AdminProfileSection />);
    selectTab("Activity");

    await waitFor(() => expect(screen.getByText("tip.update")).toBeTruthy());
    expect(screen.getByText(/Target tip-1/)).toBeTruthy();

    const queryOptions = vi.mocked(useQuery).mock.calls[0]?.[0] as unknown as {
      queryFn: () => Promise<unknown>;
    };
    vi.mocked(callApi).mockResolvedValue(activityResult.data as never);
    await queryOptions.queryFn();

    expect(callApi).toHaveBeenCalledWith("LIST_AUDIT_LOG", {
      query: { page: 1, pageSize: 10, actorEmail: "admin@example.com" },
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

  it("links security management to Clerk account settings", async () => {
    render(<AdminProfileSection />);
    selectTab("Security");

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Manage account" })).toHaveAttribute(
        "href",
        "/profile/account"
      )
    );
  });
});
