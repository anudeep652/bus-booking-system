import { test, expect } from "@playwright/test";

function getSeatNumberForBrowser(browserName: string): string {
  switch (browserName) {
    case "chromium":
      return "30";
    case "firefox":
      return "31";
    case "webkit":
      return "32";
    default:
      return "30";
  }
}

test("should be able to successfully book a trip", async ({
  page,
  browserName,
}) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("anudeep1@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("anudeep1");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(
    page.locator("div").filter({ hasText: "Login successful!" }).nth(3)
  ).toBeVisible();
  await page.getByRole("textbox", { name: "From" }).click();
  await page.getByRole("textbox", { name: "From" }).fill("CBE");
  await page.getByRole("textbox", { name: "From" }).press("Tab");
  await page.getByRole("textbox", { name: "To" }).fill("BLR");
  await page.getByRole("button", { name: "AC", exact: true }).click();
  await page.getByRole("button", { name: "Search Buses" }).click();
  await page.getByRole("button", { name: "Select Seats" }).click();
  await expect(
    page.getByRole("heading", { name: "Select Your Seats" })
  ).toBeVisible();
  await page.screenshot({
    path: `./screenshots/booking/${browserName}/display-seat-layout.png`,
    fullPage: true,
  });

  await page
    .getByRole("button", {
      name: getSeatNumberForBrowser(browserName),
      exact: true,
    })
    .click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Proceed to Checkout" }).click();
  const page1 = await page1Promise;
  await expect(page.getByText("PrintShareGo to Home")).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^Booking Successful!$/ })
  ).toBeVisible();
  await page.screenshot({
    path: `./screenshots/booking/${browserName}/booking-success-page.png`,
    fullPage: true,
  });

  await page.goto("http://localhost:5173/bookings");
  await expect(
    page.getByRole("heading", { name: "Current Bookings" })
  ).toBeVisible();
});
