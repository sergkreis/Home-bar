import { expect, test } from "@playwright/test";

test("home page supports the core mobile flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Домашний бар")).toBeVisible();
  await expect(page.getByText("Что есть дома?")).toBeVisible();
  await expect(page.getByText("Аккаунт позже")).toBeVisible();

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();

  await expect(page.getByText("Что выпить сегодня")).toBeVisible();

  await page.getByRole("button", { name: /Что-то свежее/ }).click();
  await expect(page.getByText("Все рецепты")).toBeVisible();

  await page.getByRole("button", { name: "Мой бар" }).click();
  await expect(page.getByPlaceholder("Поиск по бутылкам, сокам и ингредиентам")).toBeVisible();

  await page.getByPlaceholder("Поиск по бутылкам, сокам и ингредиентам").fill("джин");
  await expect(page.getByText("Джин", { exact: true }).first()).toBeVisible();
});
