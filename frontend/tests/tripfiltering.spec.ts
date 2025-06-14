import { test, expect } from "@playwright/test";

test("filter trips and navigate to seat booking", async ({
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
  await page.getByRole("textbox", { name: "From" }).click();
  await page.getByRole("textbox", { name: "From" }).fill("CBE");
  await page.getByRole("textbox", { name: "To" }).click();
  await page.getByRole("textbox", { name: "To" }).fill("BLR");
  await page.getByRole("button", { name: "AC", exact: true }).click();
  await page.getByRole("button", { name: "Search Buses" }).click();
  await expect(page.getByTestId("bus-card")).toBeVisible();
  await page.screenshot({
    path: `./screenshots/booking/${browserName}/trips-filter-results-available.png`,
    fullPage: true,
  });
});

test("on not matching any filter page displays a go back button", async ({
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
  await page.getByRole("textbox", { name: "From" }).click();
  await page.getByRole("textbox", { name: "From" }).fill("unknown city");
  await page.getByRole("textbox", { name: "To" }).click();
  await page.getByRole("textbox", { name: "To" }).fill("unknown city");
  await page.getByRole("button", { name: "AC", exact: true }).click();
  await page.getByRole("button", { name: "Search Buses" }).click();
  await expect(page.getByTestId("bus-card")).not.toBeVisible();
  await expect(page.getByText("No buses with the filter")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to search page" })
  ).toBeVisible();
  await page.screenshot({
    path: `./screenshots/booking/${browserName}/trips-filter-results-not-available.png`,
    fullPage: true,
  });
});
