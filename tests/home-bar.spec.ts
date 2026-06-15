import { expect, test, type Page } from "@playwright/test";

async function confirmAgeIfShown(page: Page) {
  const confirmAgeButton = page.getByRole("button", { name: "Мне есть 18" });

  if (await confirmAgeButton.isVisible()) {
    await confirmAgeButton.click();
  }
}

test("home page supports the core mobile flow", async ({ page }) => {
  await page.goto("/");
  await confirmAgeIfShown(page);

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
  await confirmAgeIfShown(page);

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();
  await expect(page.getByText("Быстрый выбор")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Быстрый выбор")).toBeVisible();
  await expect(page.getByText("Что можно смешать из того, что есть дома?")).toBeHidden();
});

test("account entry opens the current sync account flow", async ({ page }) => {
  await page.goto("/");
  await confirmAgeIfShown(page);

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();

  const openAuthButton = page.getByRole("button", { name: "Открыть вход в аккаунт" });

  if (await openAuthButton.isVisible()) {
    await openAuthButton.click();
    await expect(page.getByText("Войти")).toBeVisible();
    await expect(page.getByText("Вход откроет бар и избранное именно из аккаунта.")).toBeVisible();
    return;
  }

  await expect(page.getByText("Локально")).toBeVisible();
});
