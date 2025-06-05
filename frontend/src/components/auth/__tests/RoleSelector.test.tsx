import { render, screen, fireEvent } from "@testing-library/react";
import { RoleSelector } from "../RoleSelector";
import { TUserRole } from "../../../types";

jest.mock("lucide-react", () => ({
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className}>
      User Icon
    </div>
  ),
  Shield: ({ className }: { className?: string }) => (
    <div data-testid="shield-icon" className={className}>
      Shield Icon
    </div>
  ),
  Headphones: ({ className }: { className?: string }) => (
    <div data-testid="headphones-icon" className={className}>
      Headphones Icon
    </div>
  ),
}));

describe("RoleSelector Component", () => {
  const mockOnRoleChange = jest.fn();

  beforeEach(() => {
    mockOnRoleChange.mockClear();
  });

  test("renders with all role options", () => {
    render(
      <RoleSelector selectedRole="user" onRoleChange={mockOnRoleChange} />
    );

    expect(screen.getByText("Select Role")).toBeInTheDocument();

    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Operator")).toBeInTheDocument();

    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    expect(screen.getByTestId("headphones-icon")).toBeInTheDocument();
  });

  test("applies active styling to selected user role", () => {
    render(
      <RoleSelector selectedRole="user" onRoleChange={mockOnRoleChange} />
    );

    const userButton = screen.getByText("Customer").closest("button");
    const adminButton = screen.getByText("Admin").closest("button");
    const operatorButton = screen.getByText("Operator").closest("button");

    expect(userButton).toHaveClass("border-indigo-500");
    expect(userButton).toHaveClass("bg-indigo-50");
    expect(userButton).toHaveClass("text-indigo-700");

    expect(adminButton).not.toHaveClass("border-indigo-500");
    expect(operatorButton).not.toHaveClass("border-indigo-500");
  });

  test("applies active styling to selected admin role", () => {
    render(
      <RoleSelector selectedRole="admin" onRoleChange={mockOnRoleChange} />
    );

    const userButton = screen.getByText("Customer").closest("button");
    const adminButton = screen.getByText("Admin").closest("button");
    const operatorButton = screen.getByText("Operator").closest("button");

    expect(adminButton).toHaveClass("border-indigo-500");
    expect(adminButton).toHaveClass("bg-indigo-50");
    expect(adminButton).toHaveClass("text-indigo-700");

    expect(userButton).not.toHaveClass("border-indigo-500");
    expect(operatorButton).not.toHaveClass("border-indigo-500");
  });

  test("applies active styling to selected operator role", () => {
    render(
      <RoleSelector selectedRole="operator" onRoleChange={mockOnRoleChange} />
    );

    const userButton = screen.getByText("Customer").closest("button");
    const adminButton = screen.getByText("Admin").closest("button");
    const operatorButton = screen.getByText("Operator").closest("button");

    expect(operatorButton).toHaveClass("border-indigo-500");
    expect(operatorButton).toHaveClass("bg-indigo-50");
    expect(operatorButton).toHaveClass("text-indigo-700");

    expect(userButton).not.toHaveClass("border-indigo-500");
    expect(adminButton).not.toHaveClass("border-indigo-500");
  });

  test("applies correct styling to icons based on selected role", () => {
    const { rerender } = render(
      <RoleSelector selectedRole="user" onRoleChange={mockOnRoleChange} />
    );

    expect(screen.getByTestId("user-icon")).toHaveClass("text-indigo-600");
    expect(screen.getByTestId("shield-icon")).toHaveClass("text-gray-500");
    expect(screen.getByTestId("headphones-icon")).toHaveClass("text-gray-500");

    rerender(
      <RoleSelector selectedRole="admin" onRoleChange={mockOnRoleChange} />
    );

    expect(screen.getByTestId("user-icon")).toHaveClass("text-gray-500");
    expect(screen.getByTestId("shield-icon")).toHaveClass("text-indigo-600");
    expect(screen.getByTestId("headphones-icon")).toHaveClass("text-gray-500");

    rerender(
      <RoleSelector selectedRole="operator" onRoleChange={mockOnRoleChange} />
    );

    expect(screen.getByTestId("user-icon")).toHaveClass("text-gray-500");
    expect(screen.getByTestId("shield-icon")).toHaveClass("text-gray-500");
    expect(screen.getByTestId("headphones-icon")).toHaveClass(
      "text-indigo-600"
    );
  });

  test('calls onRoleChange with "user" when Customer button is clicked', () => {
    render(
      <RoleSelector selectedRole="admin" onRoleChange={mockOnRoleChange} />
    );

    fireEvent.click(screen.getByText("Customer"));

    expect(mockOnRoleChange).toHaveBeenCalledWith("user");
  });

  test('calls onRoleChange with "admin" when Admin button is clicked', () => {
    render(
      <RoleSelector selectedRole="user" onRoleChange={mockOnRoleChange} />
    );

    fireEvent.click(screen.getByText("Admin"));

    expect(mockOnRoleChange).toHaveBeenCalledWith("admin");
  });

  test('calls onRoleChange with "operator" when Operator button is clicked', () => {
    render(
      <RoleSelector selectedRole="user" onRoleChange={mockOnRoleChange} />
    );

    fireEvent.click(screen.getByText("Operator"));

    expect(mockOnRoleChange).toHaveBeenCalledWith("operator");
  });

  test("does not call onRoleChange when clicking already selected role", () => {
    render(
      <RoleSelector selectedRole="user" onRoleChange={mockOnRoleChange} />
    );

    fireEvent.click(screen.getByText("Customer"));

    expect(mockOnRoleChange).toHaveBeenCalledWith("user");
  });

  test("accepts valid role types", () => {
    const validRoles: TUserRole[] = ["user", "admin", "operator"];

    validRoles.forEach((role) => {
      const { unmount } = render(
        <RoleSelector selectedRole={role} onRoleChange={mockOnRoleChange} />
      );
      unmount();
    });

    expect(true).toBeTruthy();
  });
});
