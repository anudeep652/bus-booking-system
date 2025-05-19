import { render, screen, fireEvent } from "@testing-library/react";
import LogoutButton from "../LogoutButton";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

jest.mock("lucide-react", () => ({
  LogOut: () => <div data-testid="logout-icon">Logout Icon</div>,
}));

jest.mock("../../../app/hooks", () => ({
  useAppDispatch: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../../features/auth/authSlice", () => ({
  logout: jest.fn().mockReturnValue({ type: "auth/logout" }),
}));

describe("LogoutButton", () => {
  let mockDispatch: jest.Mock;
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<LogoutButton />);

    expect(screen.getByTestId("logout-button")).toBeInTheDocument();

    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
  });

  it("applies custom variant, size, and className", () => {
    render(
      <LogoutButton variant="primary" size="lg" className="my-extra-class" />
    );
    const btn = screen.getByRole("button", { name: /sign out/i });
    expect(btn).toHaveClass("btn-primary");
    expect(btn).toHaveClass("btn-lg");
    expect(btn).toHaveClass("my-extra-class");
  });

  it("dispatches logout and navigates to /login on click", () => {
    render(<LogoutButton />);

    fireEvent.click(screen.getByTestId("logout-button"));

    expect(logout).toHaveBeenCalledTimes(1);

    expect(mockDispatch).toHaveBeenCalledWith({ type: "auth/logout" });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
