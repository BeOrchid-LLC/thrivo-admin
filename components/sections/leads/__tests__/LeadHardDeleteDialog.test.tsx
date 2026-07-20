import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadHardDeleteDialog } from "../LeadHardDeleteDialog";
import type { Lead } from "@/lib/contracts";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useQueryClient: vi.fn().mockReturnValue({ invalidateQueries: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", () => ({
  callApi: vi.fn(),
  isApiError: vi.fn().mockReturnValue(false),
  queryKeys: { leads: { list: vi.fn().mockReturnValue([]) } },
}));

const lead = {
  id: "l1",
  email: "bob@example.com",
  createdAt: new Date().toISOString(),
} as unknown as Lead;

describe("LeadHardDeleteDialog — typed-confirm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("delete button is disabled with no input", () => {
    render(
      <LeadHardDeleteDialog lead={lead} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    const btn = screen.getByRole("button", { name: /delete permanently/i });
    expect(btn).toBeDisabled();
  });

  it("delete button stays disabled for partial match", () => {
    render(
      <LeadHardDeleteDialog lead={lead} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    const input = screen.getByPlaceholderText("bob@example.com");
    fireEvent.change(input, { target: { value: "bob" } });
    const btn = screen.getByRole("button", { name: /delete permanently/i });
    expect(btn).toBeDisabled();
  });

  it("delete button enables on exact email match", () => {
    render(
      <LeadHardDeleteDialog lead={lead} open={true} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    const input = screen.getByPlaceholderText("bob@example.com");
    fireEvent.change(input, { target: { value: "bob@example.com" } });
    const btn = screen.getByRole("button", { name: /delete permanently/i });
    expect(btn).not.toBeDisabled();
  });

  it("renders nothing when lead is null", () => {
    const { container } = render(
      <LeadHardDeleteDialog lead={null} open={false} onOpenChange={vi.fn()} onDeleted={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
