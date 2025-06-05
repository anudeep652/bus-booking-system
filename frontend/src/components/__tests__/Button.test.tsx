import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button Component", () => {
  test("renders button with children when not loading", () => {
    render(<Button isLoading={false}>Click Me</Button>);

    expect(screen.getByText("Click Me")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeInTheDocument();
  });

  test("renders loading spinner without children when loading", () => {
    render(<Button isLoading={true}>Click Me</Button>);

    const spinner = document.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();

    expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
  });

  test("button is loading by default", () => {
    render(<Button>Click Me</Button>);

    const spinner = document.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();

    expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    const mockOnClick = jest.fn();
    render(
      <Button isLoading={false} onClick={mockOnClick}>
        Click Me
      </Button>
    );

    fireEvent.click(screen.getByText("Click Me"));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("applies default class names correctly", () => {
    render(<Button isLoading={false}>Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("bg-indigo-600");
    expect(button.className).toContain("hover:bg-indigo-700");
    expect(button.className).toContain("text-white");
    expect(button.className).toContain("rounded-lg");
  });

  test("applies additional class names when provided", () => {
    render(
      <Button isLoading={false} className="test-class">
        Click Me
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button.className).toContain("test-class");
    expect(button.className).toContain("bg-indigo-600");
  });

  test("renders with custom type attribute", () => {
    render(
      <Button isLoading={false} type="submit">
        Submit
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  test("renders with default type button when not specified", () => {
    render(<Button isLoading={false}>Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  test("accepts and applies additional HTML button attributes", () => {
    render(
      <Button
        isLoading={false}
        disabled={true}
        aria-label="Test Button"
        data-testid="test-button"
      >
        Click Me
      </Button>
    );

    const button = screen.getByTestId("test-button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-label", "Test Button");
  });

  test('uses type="button" by default', () => {
    render(<Button isLoading={false}>Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  test("variant and size props do not affect rendering (implementation note)", () => {
    render(
      <Button isLoading={false} variant="primary" size="lg">
        Click Me
      </Button>
    );

    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });
});
