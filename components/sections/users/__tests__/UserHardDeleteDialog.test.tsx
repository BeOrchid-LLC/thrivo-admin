import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserHardDeleteDialog } from "../UserHardDeleteDialog";
import type { AdminUser } from "@/lib/contracts";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useQueryClient: vi.fn().mockReturnValue({ invalidateQueries: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", () => ({
  callApi: vi.fn(),
  isApiError: vi.fn().mockReturnValue(false),
  queryKeys: { users: { list: vi.fn().mockReturnValue([]) } },
}));

const user = {
  id: "u1",
  email: "alice@example.com",
  name: "Alice",
  role: "free",
  status: "active",
  createdAt: new Date().toISOString(),
} as unknown as AdminUser;

describe("UserHardDeleteDialog — typed-confirm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the user email in the confirmation prompt", () => {
    render(
      <UserHardDeleteDialog user={user} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(screen.getAllByText(/alice@example\.com/i).length).toBeGreaterThan(0);
  });

  it("delete button is disabled when confirm field is empty", () => {
    render(
      <UserHardDeleteDialog user={user} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    const btn = screen.getByRole("button", { name: /delete permanently/i });
    expect(btn).toBeDisabled();
  });

  it("delete button is disabled when typed email does not match", () => {
    render(
      <UserHardDeleteDialog user={user} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    const input = screen.getByPlaceholderText("alice@example.com");
    fireEvent.change(input, { target: { value: "wrong@example.com" } });
    const btn = screen.getByRole("button", { name: /delete permanently/i });
    expect(btn).toBeDisabled();
  });

  it("delete button enables when exact email is typed", () => {
    render(
      <UserHardDeleteDialog user={user} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    const input = screen.getByPlaceholderText("alice@example.com");
    fireEvent.change(input, { target: { value: "alice@example.com" } });
    const btn = screen.getByRole("button", { name: /delete permanently/i });
    expect(btn).not.toBeDisabled();
  });

  it("renders nothing when user is null", () => {
    const { container } = render(
      <UserHardDeleteDialog user={null} open={false} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
