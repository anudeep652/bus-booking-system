import { test, expect } from "@playwright/test";
const BASE_URL = "http://localhost:5173";

test("login page should load and look correct", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await expect(page.locator("form")).toBeVisible();
  await page.screenshot({
    path: "./screenshots/auth/baseline-login.png",
    fullPage: true,
  });
});

test("should error when submitted without inputs", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Email or Phone is required")).toBeVisible();
  await expect(page.getByText("Phone or Email is required")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();
  await page.screenshot({
    path: "./screenshots/auth/login-empty-inputs-error.png",
    fullPage: true,
  });
});

test("should error when password input is missing", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("anudeep1@gmail.com");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Password is required")).toBeVisible();
  await page.screenshot({
    path: "./screenshots/auth/login-password-error.png",
    fullPage: true,
  });
});

test("successfull login on valid credentials", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("anudeep1@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("anudeep1");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByText("Login successful!").click();
  await page.locator("body").press("Escape");
  await page.screenshot({
    path: "./screenshots/auth/login-success.png",
    fullPage: true,
  });
});

test("should error on wrong credentials", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email Address" }).click();
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("anudeep1@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("wrongpass");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.getByText("Invalid credentials").click();
  await page.screenshot({
    path: "./screenshots/auth/invalid-login-crendentials.png",
    fullPage: true,
  });
});
