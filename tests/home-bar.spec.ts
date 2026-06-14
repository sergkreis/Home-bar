import { expect, test } from "@playwright/test";

test("home page supports the core mobile flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Домашний бар")).toBeVisible();
  await expect(page.getByText("Что можно смешать из того, что есть дома?")).toBeVisible();
  await expect(page.getByText("Аккаунт можно создать позже")).toBeVisible();

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();

  await expect(page.getByText("Быстрый выбор")).toBeVisible();

  await page.getByRole("button", { name: /Что-то свежее/ }).click();
  await expect(page.getByText("Фильтр рецептов")).toBeVisible();

  await page.getByRole("button", { name: "Перейти на вкладку Бар" }).click();
  await expect(page.getByPlaceholder("Поиск по бутылкам, сокам и ингредиентам")).toBeVisible();

  await page.getByPlaceholder("Поиск по бутылкам, сокам и ингредиентам").fill("джин");
  await expect(page.getByText("Джин", { exact: true }).first()).toBeVisible();
});

test("saved starter bar opens the main app after reload", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();
  await expect(page.getByText("Быстрый выбор")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Быстрый выбор")).toBeVisible();
  await expect(page.getByText("Что можно смешать из того, что есть дома?")).toBeHidden();
});

test("account tab explains the current account sync mode", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();
  await page.getByRole("button", { name: "Перейти на вкладку Аккаунт" }).click();

  await expect(page.getByText("Регистрация, вход и синхронизация бара с избранным.")).toBeVisible();

  const localOnlyStatus = page.getByText("Аккаунты не включены");

  if (await localOnlyStatus.isVisible()) {
    await expect(page.getByText("Бар и избранное сохраняются на устройстве.")).toBeVisible();
    return;
  }

  await expect(page.getByText("Войти в аккаунт")).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти или создать аккаунт" })).toBeVisible();
});
