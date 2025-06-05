// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../features/auth/authSlice";
import LogoutButton from "../LogoutButton";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../../app/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../../../features/auth/authSlice", () => ({
  logout: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  LogOut: () => <span data-testid="logout-icon" />,
}));

jest.mock("../../Button", () => ({
  Button: ({ children, onClick, variant, size, className, role }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      role={role}
      data-testid="button-component"
    >
      {children}
    </button>
  ),
}));

describe("LogoutButton", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("renders correctly with default props", () => {
    render(<LogoutButton />);

    const button = screen.getByTestId("button-component");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(button).toHaveAttribute("data-size", "md");
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
    expect(button).toHaveTextContent("Sign Out");
  });

  it("applies custom variant prop correctly", () => {
    render(<LogoutButton variant="primary" />);

    const button = screen.getByTestId("button-component");
    expect(button).toHaveAttribute("data-variant", "primary");
  });

  it("applies custom size prop correctly", () => {
    render(<LogoutButton size="lg" />);

    const button = screen.getByTestId("button-component");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("applies custom className prop correctly", () => {
    render(<LogoutButton className="custom-class" />);

    const button = screen.getByTestId("button-component");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("flex");
    expect(button).toHaveClass("items-center");
  });

  it("calls handleLogout when clicked", () => {
    render(<LogoutButton />);

    const button = screen.getByTestId("button-component");
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("has the correct accessibility role", () => {
    render(<LogoutButton />);

    const button = screen.getByTestId("button-component");
    expect(button).toHaveAttribute("role", "button");
  });

  it("includes the logout icon with proper styling", () => {
    render(<LogoutButton />);

    const icon = screen.getByTestId("logout-icon");
    expect(icon).toBeInTheDocument();

    const iconContainer = icon.parentElement;
    expect(iconContainer).toHaveClass("flex items-center");
  });
});
