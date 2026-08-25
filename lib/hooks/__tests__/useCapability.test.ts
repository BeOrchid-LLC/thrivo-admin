import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCapability } from "../useCapability";
import { useAdminSession } from "@/components/providers/SessionProvider";

vi.mock("@/components/providers/SessionProvider", () => ({
  useAdminSession: vi.fn(),
}));

const mockSession = (role: string, permissions: string[] | null = null) => {
  vi.mocked(useAdminSession).mockReturnValue({
    id: "1",
    email: "test@example.com",
    name: "Test",
    role,
    permissions,
  } as ReturnType<typeof useAdminSession>);
};

describe("useCapability", () => {
  beforeEach(() => vi.clearAllMocks());

  it("read-only: nothing allowed", () => {
    mockSession("read-only");
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageContent).toBe(false);
    expect(result.current.canPerformSensitive).toBe(false);
    expect(result.current.canManageAdmins).toBe(false);
  });

  it("support: can manage content, not destructive or admins", () => {
    mockSession("support");
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageContent).toBe(true);
    expect(result.current.canPerformSensitive).toBe(false);
    expect(result.current.canManageAdmins).toBe(false);
  });

  it("admin: can manage content and perform sensitive, not admins", () => {
    mockSession("admin");
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageContent).toBe(true);
    expect(result.current.canPerformSensitive).toBe(true);
    expect(result.current.canManageAdmins).toBe(false);
  });

  it("super-admin: all capabilities enabled", () => {
    mockSession("super-admin");
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageContent).toBe(true);
    expect(result.current.canPerformSensitive).toBe(true);
    expect(result.current.canManageAdmins).toBe(true);
  });

  it("unknown role falls back to read-only (rank 0)", () => {
    mockSession("unknown");
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageContent).toBe(false);
    expect(result.current.canManageAdmins).toBe(false);
  });

  it("exposes the raw role string", () => {
    mockSession("admin");
    const { result } = renderHook(() => useCapability());
    expect(result.current.role).toBe("admin");
  });

  it("uses explicit permissions instead of role defaults", () => {
    mockSession("read-only", ["users.manage"]);
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageUsers).toBe(true);
    expect(result.current.canManageContent).toBe(false);
  });

  it("allows a customized role to remove its default capabilities", () => {
    mockSession("support", []);
    const { result } = renderHook(() => useCapability());
    expect(result.current.canManageContent).toBe(false);
    expect(result.current.canManagePush).toBe(false);
  });
});
