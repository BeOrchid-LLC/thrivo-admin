import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { LoginForm } from "@/app/login/LoginForm";
import { ForgotPasswordForm } from "@/app/forgot-password/ForgotPasswordForm";
import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";
import { AcceptInviteForm } from "@/app/accept-invite/AcceptInviteForm";

const push = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useSignIn: vi.fn(),
  useSignUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

const errors = {
  fields: { identifier: null, password: null, code: null },
  global: null,
  raw: null,
};

function signInResource() {
  return {
    id: undefined,
    identifier: null,
    status: "needs_identifier",
    supportedFirstFactors: [],
    supportedSecondFactors: [],
    create: vi.fn(),
    emailCode: { sendCode: vi.fn(), verifyCode: vi.fn() },
    password: vi.fn(),
    finalize: vi.fn(),
    reset: vi.fn(),
    mfa: {
      sendEmailCode: vi.fn(),
      sendPhoneCode: vi.fn(),
      verifyEmailCode: vi.fn(),
      verifyPhoneCode: vi.fn(),
      verifyTOTP: vi.fn(),
      verifyBackupCode: vi.fn(),
    },
    resetPasswordEmailCode: {
      sendCode: vi.fn(),
      verifyCode: vi.fn(),
      submitPassword: vi.fn(),
    },
  };
}

function signUpResource() {
  return {
    id: undefined,
    status: "missing_requirements",
    emailAddress: null,
    missingFields: [],
    unverifiedFields: [],
    ticket: vi.fn(),
    finalize: vi.fn(),
    verifications: { sendEmailCode: vi.fn(), verifyEmailCode: vi.fn() },
  };
}

describe("custom authentication flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSignIn).mockReturnValue({
      signIn: signInResource() as never,
      errors: errors as never,
      fetchStatus: "idle",
    });
    vi.mocked(useSignUp).mockReturnValue({
      signUp: signUpResource() as never,
      errors: errors as never,
      fetchStatus: "idle",
    });
  });

  it("renders a Thrivo-styled sign-in form", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome back")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your password")).toBeTruthy();
  });

  it("toggles password visibility without losing the caret position", async () => {
    render(<LoginForm />);

    const password = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;
    fireEvent.change(password, { target: { value: "secret-value" } });
    password.focus();
    password.setSelectionRange(6, 6);

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    await waitFor(() => {
      expect(password).toHaveAttribute("type", "text");
      expect(document.activeElement).toBe(password);
      expect(password.selectionStart).toBe(6);
      expect(password.selectionEnd).toBe(6);
    });
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
  });

  it("starts password recovery through Clerk's custom API flow", async () => {
    const signIn = signInResource();
    vi.mocked(useSignIn).mockReturnValue({
      signIn: signIn as never,
      errors: errors as never,
      fetchStatus: "idle",
    });
    vi.mocked(signIn.create).mockResolvedValue({ error: null });
    vi.mocked(signIn.resetPasswordEmailCode.sendCode).mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send reset code/i }).closest("form")!);

    await waitFor(() =>
      expect(signIn.create).toHaveBeenCalledWith({ identifier: "admin@example.com" })
    );
    expect(signIn.resetPasswordEmailCode.sendCode).toHaveBeenCalled();
  });

  it("submits the email verification flow when all six digits are entered", async () => {
    const signIn = signInResource();
    vi.mocked(useSignIn).mockReturnValue({
      signIn: signIn as never,
      errors: errors as never,
      fetchStatus: "idle",
    });
    vi.mocked(signIn.emailCode.sendCode).mockResolvedValue({ error: null });
    vi.mocked(signIn.emailCode.verifyCode).mockResolvedValue({ error: null });

    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /one-time email code/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send sign-in code/i }).closest("form")!);

    await waitFor(() => expect(screen.getByText("Check your email")).toBeTruthy());

    const otpInputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    await waitFor(() =>
      expect(signIn.emailCode.verifyCode).toHaveBeenCalledWith({ code: "123456" })
    );
  });

  it("keeps the email OTP screen in a loading state while verification completes", async () => {
    const signIn = signInResource();
    let resolveVerification: (value: { error: null }) => void = () => undefined;
    const verifyCode = vi.fn(
      () =>
        new Promise<{ error: null }>((resolve) => {
          resolveVerification = resolve;
        })
    );
    vi.mocked(useSignIn).mockReturnValue({
      signIn: signIn as never,
      errors: errors as never,
      fetchStatus: "idle",
    });
    vi.mocked(signIn.emailCode.sendCode).mockResolvedValue({ error: null });
    vi.mocked(signIn.emailCode.verifyCode).mockImplementation(verifyCode as never);

    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /one-time email code/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /send sign-in code/i }).closest("form")!);
    await waitFor(() => expect(screen.getByText("Check your email")).toBeTruthy());

    const otpInputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    await waitFor(() => expect(verifyCode).toHaveBeenCalledWith({ code: "123456" }));
    expect(screen.getByText("Check your email")).toBeTruthy();
    expect(screen.getByRole("button", { name: /please wait/i })).toBeDisabled();

    resolveVerification({ error: null });
    await waitFor(() =>
      expect(screen.getByText(/choose a supported sign-in method/i)).toBeTruthy()
    );
  });

  it("shows a safe reset state when no reset attempt exists", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText("Reset link expired")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Request a new code" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it("requires a Clerk invitation ticket before accepting an invite", () => {
    render(<AcceptInviteForm />);

    expect(screen.getByText(/invitation required/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /accept invitation/i })).toBeDisabled();
  });
});
