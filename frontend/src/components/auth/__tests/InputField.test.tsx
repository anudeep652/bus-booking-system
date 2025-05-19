import { render, screen, fireEvent } from "@testing-library/react";
import { InputField } from "../InputField";
import { Mail } from "lucide-react";

jest.mock("lucide-react", () => ({
  Eye: () => <div data-testid="eye-icon">Eye Icon</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff Icon</div>,
  Mail: () => <div data-testid="mail-icon">Mail Icon</div>,
}));

describe("InputField Component", () => {
  const defaultProps = {
    id: "test-input",
    label: "Test Label",
    value: "",
    onChange: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders with required props", () => {
    render(<InputField {...defaultProps} />);

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("applies custom placeholder", () => {
    render(<InputField {...defaultProps} placeholder="Enter value" />);

    expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
  });

  test("displays the correct value", () => {
    render(<InputField {...defaultProps} value="test value" />);

    expect(screen.getByRole("textbox")).toHaveValue("test value");
  });

  test("calls onChange when input value changes", () => {
    const handleChange = jest.fn();
    render(<InputField {...defaultProps} onChange={handleChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "new value" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("renders with an icon", () => {
    render(
      <InputField {...defaultProps} icon={<Mail data-testid="mail-icon" />} />
    );

    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("pl-10");
  });

  test("renders without an icon and has correct padding", () => {
    render(<InputField {...defaultProps} />);

    const input = screen.getByRole("textbox");
    expect(input.className).toContain("pl-4");
  });

  test("displays error message when provided", () => {
    const errorMessage = "This field is required";
    render(<InputField {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-300");
  });

  test("applies border-gray-200 class when no error", () => {
    render(<InputField {...defaultProps} />);

    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-gray-200");
  });

  test("renders forgotPasswordLink when provided", () => {
    render(
      <InputField
        {...defaultProps}
        forgotPasswordLink={
          <a href="#" data-testid="forgot-link">
            Forgot Password?
          </a>
        }
      />
    );

    expect(screen.getByTestId("forgot-link")).toBeInTheDocument();
  });

  test("passes additional props to the input element", () => {
    render(
      <InputField {...defaultProps} maxLength={10} data-testid="custom-input" />
    );

    const input = screen.getByTestId("custom-input");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  describe("Password Field", () => {
    test("renders password field with eye icon", () => {
      render(<InputField {...defaultProps} type="password" />);

      expect(screen.getByRole("textbox")).toHaveAttribute("type", "password");
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    });

    test("toggles password visibility when eye icon is clicked", () => {
      render(<InputField {...defaultProps} type="password" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "password");

      fireEvent.click(screen.getByRole("button"));
      expect(input).toHaveAttribute("type", "text");

      fireEvent.click(screen.getByRole("button"));
      expect(input).toHaveAttribute("type", "password");
    });

    test("shows EyeOff icon when password is visible", () => {
      render(<InputField {...defaultProps} type="password" />);

      expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
      const toggleButton = screen.getByRole("button");

      fireEvent.click(toggleButton);

      expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument();
    });
  });
});
