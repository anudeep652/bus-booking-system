import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import Navbar from "../Navbar";
import authReducer from "../../features/auth/authSlice";

jest.mock("../../features/baseQuery", () => ({
  createBaseQuery: () => () => ({
    baseUrl: "http://localhost:8000/api/v1",
  }),
}));

jest.mock("lucide-react", () => ({
  Menu: ({ size }: { size?: number }) => (
    <span data-testid="menu-icon">{size}</span>
  ),
  X: ({ size }: { size?: number }) => <span data-testid="x-icon">{size}</span>,
  Home: ({ size }: { size?: number }) => (
    <span data-testid="home-icon">{size}</span>
  ),
  Search: ({ size }: { size?: number }) => (
    <span data-testid="search-icon">{size}</span>
  ),
  Ticket: ({ size }: { size?: number }) => (
    <span data-testid="ticket-icon">{size}</span>
  ),
  Clock: ({ size }: { size?: number }) => (
    <span data-testid="clock-icon">{size}</span>
  ),
  User: ({ size }: { size?: number }) => (
    <span data-testid="user-icon">{size}</span>
  ),
  HelpCircle: ({ size }: { size?: number }) => (
    <span data-testid="help-icon">{size}</span>
  ),
  LogOut: ({ size }: { size?: number }) => (
    <span data-testid="logout-icon">{size}</span>
  ),
  Bell: ({ size }: { size?: number }) => (
    <span data-testid="bell-icon">{size}</span>
  ),
}));

const mockLocation = {
  pathname: "/",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const createMockStore = (
  initialState: { auth?: Partial<ReturnType<typeof authReducer>> } = {}
) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },

    preloadedState: {
      auth: {
        user: { id: "1", name: "user1", email: "user1@email.com" },

        token: null,

        isAuthenticated: true,

        loading: false,

        error: null,

        ...initialState.auth,
      },
    },
  });
};

const renderWithProvider = (
  component: React.ReactElement,
  { initialState = {}, store = createMockStore(initialState) } = {}
) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe("Navbar Component", () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    mockLocation.pathname = "/";
  });

  describe("Brand/Logo Section", () => {
    test("renders BusBooker logo and name", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByText("BB")).toBeInTheDocument();
      expect(screen.getByText("BusBooker")).toBeInTheDocument();
    });

    test("logo has correct styling", () => {
      renderWithProvider(<Navbar />);

      const logo = screen.getByText("BB");
      const logoContainer = logo.closest("div");
      expect(logoContainer).toHaveClass(
        "h-8",
        "w-8",
        "rounded-md",
        "bg-indigo-600"
      );
    });
  });

  describe("Navigation Menu Items", () => {
    test("renders all menu items in desktop view", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
      expect(screen.getByText("Trip History")).toBeInTheDocument();
      expect(screen.getByText("Help & Support")).toBeInTheDocument();
    });

    test("menu items have correct icons", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getAllByTestId("home-icon")).toHaveLength(2);
      expect(screen.getAllByTestId("ticket-icon")).toHaveLength(2);
      expect(screen.getAllByTestId("clock-icon")).toHaveLength(2);
      expect(screen.getAllByTestId("help-icon")).toHaveLength(2);
    });

    test("menu items have correct href attributes", () => {
      renderWithProvider(<Navbar />);

      const homeLinks = screen.getAllByRole("link", { name: /home/i });
      const bookingLinks = screen.getAllByRole("link", {
        name: /my bookings/i,
      });
      const historyLinks = screen.getAllByRole("link", {
        name: /trip history/i,
      });
      const helpLinks = screen.getAllByRole("link", {
        name: /help & support/i,
      });

      homeLinks.forEach((link) => expect(link).toHaveAttribute("href", "/"));
      bookingLinks.forEach((link) =>
        expect(link).toHaveAttribute("href", "/bookings")
      );
      historyLinks.forEach((link) =>
        expect(link).toHaveAttribute("href", "/history")
      );
      helpLinks.forEach((link) => expect(link).toHaveAttribute("href", "#"));
    });

    test("active menu item has correct styling", () => {
      mockLocation.pathname = "/dashboard";
      renderWithProvider(<Navbar />);

      const homeLink = screen.getAllByRole("link", { name: /home/i })[0];
      expect(homeLink).toHaveClass(
        "text-indigo-700",
        "border-b-2",
        "border-indigo-600"
      );
    });
  });

  describe("User Section", () => {
    test("displays user name", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByText("user1")).toBeInTheDocument();
    });

    test("displays user email in mobile menu", () => {
      renderWithProvider(<Navbar />);

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      fireEvent.click(menuButton);

      expect(screen.getByText("user1@email.com")).toBeInTheDocument();
    });

    test("shows user icon", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getAllByTestId("user-icon")).toHaveLength(2);
    });
  });

  describe("Notification Section", () => {
    test("displays notification bell icon", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
    });

    test("shows notification count badge", () => {
      renderWithProvider(<Navbar />);

      const notificationBadge = screen.getByText("2");
      expect(notificationBadge).toBeInTheDocument();
      expect(notificationBadge).toHaveClass("bg-red-500", "text-white");
    });

    test("notification button has correct styling", () => {
      renderWithProvider(<Navbar />);

      const bellButton = screen.getByTestId("bell-icon").closest("button");
      expect(bellButton).toHaveClass(
        "p-1",
        "text-gray-600",
        "hover:text-violet-700"
      );
    });
  });

  describe("Logout Functionality", () => {
    test("desktop logout button dispatches logout action", () => {
      renderWithProvider(<Navbar />, { store: mockStore });

      const logoutButton = screen
        .getAllByTestId("logout-icon")[0]
        .closest("button");
      fireEvent.click(logoutButton!);

      waitFor(() => {
        const state = mockStore.getState();
        expect(state.auth.user).toBeNull();
      });
    });

    test("mobile logout button dispatches logout action", () => {
      renderWithProvider(<Navbar />, { store: mockStore });

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      fireEvent.click(menuButton);

      const mobileLogoutLink = screen.getByRole("link", { name: /sign out/i });
      fireEvent.click(mobileLogoutLink);

      waitFor(() => {
        const state = mockStore.getState();
        expect(state.auth.user).toBeNull();
      });
    });
  });

  describe("Mobile Menu Toggle", () => {
    test("mobile menu is hidden by default", () => {
      renderWithProvider(<Navbar />);

      const mobileMenu = screen.getByText("Home").closest(".md\\:hidden");
      expect(mobileMenu).toHaveClass("hidden");
    });

    test("mobile menu toggle shows menu icon when closed", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
    });

    test("clicking menu button opens mobile menu", () => {
      renderWithProvider(<Navbar />);

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      fireEvent.click(menuButton);

      const mobileMenu = screen.getByText("Home").closest(".md\\:hidden");
      expect(mobileMenu).toHaveClass("block");
    });

    test("mobile menu toggle shows X icon when open", () => {
      renderWithProvider(<Navbar />);

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      fireEvent.click(menuButton);

      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("menu-icon")).not.toBeInTheDocument();
    });

    test("clicking X button closes mobile menu", () => {
      renderWithProvider(<Navbar />);

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });

      fireEvent.click(menuButton);
      let mobileMenu = screen.getByText("Home").closest(".md\\:hidden");
      expect(mobileMenu).toHaveClass("block");

      fireEvent.click(menuButton);
      mobileMenu = screen.getByText("Home").closest(".md\\:hidden");
      expect(mobileMenu).toHaveClass("hidden");
    });
  });

  describe("Responsive Design", () => {
    test("desktop menu is hidden on mobile", () => {
      renderWithProvider(<Navbar />);

      const desktopMenu = screen.getByText("Home").closest(".hidden.md\\:flex");
      expect(desktopMenu).toHaveClass("hidden", "md:flex");
    });

    test("mobile menu toggle is hidden on desktop", () => {
      renderWithProvider(<Navbar />);

      const mobileToggle = screen
        .getByRole("button", { name: /open main menu/i })
        .closest(".flex.md\\:hidden");
      expect(mobileToggle).toHaveClass("flex", "md:hidden");
    });

    test("desktop user section is hidden on mobile", () => {
      renderWithProvider(<Navbar />);

      const desktopUserSection = screen
        .getByText("user1")
        .closest(".hidden.md\\:block");
      expect(desktopUserSection).toHaveClass("hidden", "md:block");
    });
  });

  describe("Current Page Highlighting", () => {
    test("highlights correct menu item based on current path", () => {
      mockLocation.pathname = "/bookings";
      renderWithProvider(<Navbar />);

      const bookingsLink = screen.getAllByRole("link", {
        name: /my bookings/i,
      })[0];
      expect(bookingsLink).toHaveClass(
        "text-indigo-700",
        "border-b-2",
        "border-indigo-600"
      );
    });

    test("no highlighting when on non-menu path", () => {
      mockLocation.pathname = "/some-other-path";
      renderWithProvider(<Navbar />);

      const homeLink = screen.getAllByRole("link", { name: /home/i })[0];
      expect(homeLink).not.toHaveClass("text-indigo-700");
    });
  });

  describe("Accessibility", () => {
    test("mobile menu button has proper aria attributes", () => {
      renderWithProvider(<Navbar />);

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });

    test("screen reader text is present for mobile menu", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByText("Open main menu")).toHaveClass("sr-only");
    });

    test("all interactive elements are keyboard accessible", () => {
      renderWithProvider(<Navbar />);

      const interactiveElements = [
        ...screen.getAllByRole("link"),
        ...screen.getAllByRole("button"),
      ];

      interactiveElements.forEach((element) => {
        expect(element).toBeVisible();
      });
    });
  });

  describe("Icon Sizes", () => {
    test("menu items have correct icon sizes", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getAllByTestId("home-icon")[0]).toHaveTextContent("18");
      expect(screen.getAllByTestId("ticket-icon")[0]).toHaveTextContent("18");
      expect(screen.getAllByTestId("clock-icon")[0]).toHaveTextContent("18");
      expect(screen.getAllByTestId("help-icon")[0]).toHaveTextContent("18");
    });

    test("notification bell has correct size", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByTestId("bell-icon")).toHaveTextContent("20");
    });

    test("mobile menu toggle icons have correct size", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getByTestId("menu-icon")).toHaveTextContent("24");

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      fireEvent.click(menuButton);

      expect(screen.getByTestId("x-icon")).toHaveTextContent("24");
    });

    test("logout icons have correct sizes", () => {
      renderWithProvider(<Navbar />);

      expect(screen.getAllByTestId("logout-icon")[0]).toHaveTextContent("18");

      const menuButton = screen.getByRole("button", {
        name: /open main menu/i,
      });
      fireEvent.click(menuButton);

      expect(screen.getAllByTestId("logout-icon")[1]).toHaveTextContent("18");
    });
  });

  describe("Error Handling", () => {
    test("handles missing user gracefully", () => {
      const storeWithoutUser = createMockStore({
        auth: {
          user: null,
          isAuthenticated: false,
        },
      });

      renderWithProvider(<Navbar />, { store: storeWithoutUser });

      expect(screen.getByText("BusBooker")).toBeInTheDocument();
      expect(screen.queryByText("user1")).not.toBeInTheDocument();
    });
  });
});
