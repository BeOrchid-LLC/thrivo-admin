import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditAdminDialog } from "../EditAdminDialog";
import type { AdminAccount } from "@/lib/contracts";

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn().mockReturnValue({ invalidateQueries: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", () => ({
  callApi: vi.fn(),
  isApiError: vi.fn().mockReturnValue(false),
  queryKeys: { admins: { list: vi.fn().mockReturnValue([]) } },
}));
vi.mock("@/components/form", () => ({
  TextField: ({ label }: { label: string }) => <div>{label}</div>,
}));

const admin: AdminAccount = {
  id: "a1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
  status: "active",
  permissions: null,
  lastLoginAt: null,
  createdAt: new Date().toISOString(),
  invitedByEmail: null,
};

describe("EditAdminDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders when open with an admin", () => {
    render(<EditAdminDialog admin={admin} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /edit admin/i })).toBeTruthy();
  });

  it("shows Name and Role fields", () => {
    render(<EditAdminDialog admin={admin} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Role")).toBeTruthy();
  });

  it("shows Save and Cancel buttons", () => {
    render(<EditAdminDialog admin={admin} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeTruthy();
  });

  it("does not render visible content when admin is null", () => {
    render(<EditAdminDialog admin={null} open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("heading", { name: /edit admin/i })).toBeNull();
  });
});
