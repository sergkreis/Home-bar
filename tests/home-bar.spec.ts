import { expect, test } from "@playwright/test";

test("home page supports the core mobile flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Домашний бар")).toBeVisible();
  await expect(page.getByText("Что выпить сегодня")).toBeVisible();

  await page.getByText("Что-то свежее").click();
  await expect(page.getByText("Все рецепты")).toBeVisible();

  await page.getByText("Мой бар").click();
  await expect(page.getByPlaceholder("Поиск по бутылкам, сокам и ингредиентам")).toBeVisible();

  await page.getByPlaceholder("Поиск по бутылкам, сокам и ингредиентам").fill("джин");
  await expect(page.getByText("Джин", { exact: true }).first()).toBeVisible();
});
