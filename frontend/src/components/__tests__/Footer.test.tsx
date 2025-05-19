import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../Footer";

jest.mock("lucide-react", () => ({
  Facebook: ({ size }: { size?: number }) => (
    <span data-testid="facebook-icon">{size}</span>
  ),
  Twitter: ({ size }: { size?: number }) => (
    <span data-testid="twitter-icon">{size}</span>
  ),
  Instagram: ({ size }: { size?: number }) => (
    <span data-testid="instagram-icon">{size}</span>
  ),
  Linkedin: ({ size }: { size?: number }) => (
    <span data-testid="linkedin-icon">{size}</span>
  ),
  Mail: ({ size }: { size?: number }) => (
    <span data-testid="mail-icon">{size}</span>
  ),
  Phone: ({ size }: { size?: number }) => (
    <span data-testid="phone-icon">{size}</span>
  ),
  MapPin: ({ size }: { size?: number }) => (
    <span data-testid="mappin-icon">{size}</span>
  ),
  Shield: ({ size }: { size?: number }) => (
    <span data-testid="shield-icon">{size}</span>
  ),
}));

describe("Footer Component", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe("Brand Section", () => {
    test("renders BusBooker logo and name", () => {
      expect(screen.getByText("BB")).toBeInTheDocument();
      expect(screen.getByText("BusBooker")).toBeInTheDocument();
    });

    test("displays company description", () => {
      expect(
        screen.getByText(
          "Making bus travel easy, comfortable, and affordable. Book your next journey with confidence."
        )
      ).toBeInTheDocument();
    });

    test("shows contact information", () => {
      expect(screen.getByText("+91 63xxxxxxxx")).toBeInTheDocument();
      expect(screen.getByText("support@busbooker.com")).toBeInTheDocument();
      expect(screen.getByText("1st street, Coimbatore")).toBeInTheDocument();
    });

    test("displays contact icons", () => {
      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mappin-icon")).toBeInTheDocument();
    });
  });

  describe("Footer Links", () => {
    test("renders Company section with all links", () => {
      expect(screen.getByText("Company")).toBeInTheDocument();
      expect(screen.getByText("About Us")).toBeInTheDocument();
      expect(screen.getByText("Careers")).toBeInTheDocument();
      expect(screen.getByText("Press")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
    });

    test("renders Support section with all links", () => {
      expect(screen.getByText("Support")).toBeInTheDocument();
      expect(screen.getByText("Help Center")).toBeInTheDocument();
      expect(screen.getByText("Safety Center")).toBeInTheDocument();
      expect(screen.getByText("Cancellation Options")).toBeInTheDocument();
      expect(screen.getByText("Accessibility")).toBeInTheDocument();
    });

    test("renders Legal section with all links", () => {
      expect(screen.getByText("Legal")).toBeInTheDocument();
      expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
      expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
      expect(screen.getByText("Refund Policy")).toBeInTheDocument();
    });

    test("all footer links have proper href attributes", () => {
      const footerLinks = [
        "About Us",
        "Careers",
        "Press",
        "Blog",
        "Contact Us",
        "Help Center",
        "Safety Center",
        "Cancellation Options",
        "Accessibility",
        "Terms & Conditions",
        "Privacy Policy",
        "Cookie Policy",
        "Refund Policy",
      ];

      footerLinks.forEach((linkText) => {
        const link = screen.getByRole("link", { name: linkText });
        expect(link).toHaveAttribute("href", "#");
      });
    });
  });

  describe("Social Media Section", () => {
    test("renders Follow Us heading", () => {
      expect(screen.getByText("Follow Us")).toBeInTheDocument();
    });

    test("displays all social media icons", () => {
      expect(screen.getByTestId("facebook-icon")).toBeInTheDocument();
      expect(screen.getByTestId("twitter-icon")).toBeInTheDocument();
      expect(screen.getByTestId("instagram-icon")).toBeInTheDocument();
      expect(screen.getByTestId("linkedin-icon")).toBeInTheDocument();
    });

    test("social media links have proper accessibility labels", () => {
      expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
      expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
      expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
      expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    });

    test("social media links have proper href attributes", () => {
      const socialPlatforms = ["Facebook", "Twitter", "Instagram", "LinkedIn"];

      socialPlatforms.forEach((platform) => {
        const link = screen.getByLabelText(platform);
        expect(link).toHaveAttribute("href", "#");
      });
    });
  });

  describe("Footer Bottom Section", () => {
    test("displays current year in copyright", () => {
      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(`© ${currentYear} BusBooker. All rights reserved.`)
      ).toBeInTheDocument();
    });

    test("displays security message", () => {
      expect(
        screen.getByText("Secured by SSL. 100% Safe & Secure Online Booking")
      ).toBeInTheDocument();
    });

    test("shows shield icon in security section", () => {
      expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    });
  });

  describe("CSS Classes and Styling", () => {
    test("footer has correct base classes", () => {
      const footer = document.querySelector("footer");
      expect(footer).toHaveClass("bg-indigo-600", "text-white");
    });

    test("logo container has correct styling", () => {
      const logoContainer = screen.getByText("BB").closest("div");
      expect(logoContainer).toHaveClass("h-8", "w-8", "rounded-md", "bg-white");
    });
  });

  describe("Accessibility", () => {
    test("footer element is present", () => {
      const footer = document.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });

    test("all links are accessible", () => {
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        expect(link).toBeInTheDocument();
      });
    });

    test("section headings are present", () => {
      const headings = screen.getAllByRole("heading", { level: 3 });
      const headingTexts = headings.map((heading) => heading.textContent);

      expect(headingTexts).toContain("Company");
      expect(headingTexts).toContain("Support");
      expect(headingTexts).toContain("Legal");
      expect(headingTexts).toContain("Follow Us");
    });
  });

  describe("Icon Sizes", () => {
    test("social media icons have correct size", () => {
      expect(screen.getByTestId("facebook-icon")).toHaveTextContent("18");
      expect(screen.getByTestId("twitter-icon")).toHaveTextContent("18");
      expect(screen.getByTestId("instagram-icon")).toHaveTextContent("18");
      expect(screen.getByTestId("linkedin-icon")).toHaveTextContent("18");
    });

    test("contact icons have correct size", () => {
      expect(screen.getByTestId("phone-icon")).toHaveTextContent("16");
      expect(screen.getByTestId("mail-icon")).toHaveTextContent("16");
      expect(screen.getByTestId("mappin-icon")).toHaveTextContent("16");
    });

    test("shield icon has correct size", () => {
      expect(screen.getByTestId("shield-icon")).toHaveTextContent("16");
    });
  });
});

describe("Footer Dynamic Copyright", () => {
  test("copyright year updates dynamically", () => {
    const years = [2023, 2024, 2025];

    years.forEach((year) => {
      jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(year);

      const { unmount } = render(<Footer />);
      expect(
        screen.getByText(`© ${year} BusBooker. All rights reserved.`)
      ).toBeInTheDocument();
      unmount();
    });

    jest.restoreAllMocks();
  });
});

describe("Footer Integration", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test("renders complete footer structure", () => {
    expect(screen.getByText("BusBooker")).toBeInTheDocument();

    const footer = screen.getByText("BusBooker").closest("footer");
    expect(footer).toBeInTheDocument();

    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Follow Us")).toBeInTheDocument();

    expect(
      screen.getByText(/© \d{4} BusBooker. All rights reserved./)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Secured by SSL. 100% Safe & Secure Online Booking")
    ).toBeInTheDocument();
  });

  test("all links are properly structured", () => {
    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(17);

    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });
  });
});
