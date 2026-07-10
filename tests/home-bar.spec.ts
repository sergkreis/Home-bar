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
  await expect(page.getByText("Быстрый выбор")).toBeVisible();

  const openAuthButton = page.getByRole("button", { name: "Открыть вход в аккаунт" });

  if (await openAuthButton.isVisible()) {
    await openAuthButton.click();
    await expect(page.getByText("Вход откроет бар и избранное именно из аккаунта.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Войти" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();

    const passwordInput = page.getByRole("textbox", { name: "Пароль" });
    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Показать пароль" }).click();
    await expect(passwordInput).not.toHaveAttribute("type", "password");
    return;
  }

  await expect(page.getByText("Локально")).toBeVisible();
});

test("cocktail routes support browser back and direct links", async ({ page }) => {
  await page.goto("/");
  await confirmAgeIfShown(page);

  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();
  await expect(page).toHaveURL(/\/today$/);

  await page.getByRole("button", { name: "Открыть Американо", exact: true }).click();
  await expect(page).toHaveURL(/\/cocktails\/americano$/);
  await expect(page.getByText("Американо", { exact: true }).first()).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByText("Быстрый выбор")).toBeVisible();

  await page.goto("/cocktails/americano");
  await confirmAgeIfShown(page);
  await expect(page.getByText("Американо", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Вернуться к списку коктейлей" }).click();
  await expect(page).toHaveURL(/\/today$/);
});

test("compact header and navigation fit a 320px phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "small-phone");

  await page.goto("/");
  await confirmAgeIfShown(page);
  await page.getByRole("button", { name: "Стартовый" }).click();
  await page.getByRole("button", { name: "Подобрать коктейли" }).click();
  await expect(page.getByText("Быстрый выбор")).toBeVisible();

  const brand = page.getByText("Домашний", { exact: true });
  const favoritesButton = page.getByRole("button", { name: "Перейти на вкладку Любимые" });
  const brandBox = await brand.boundingBox();
  const favoritesBox = await favoritesButton.boundingBox();
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(brandBox?.height).toBeLessThanOrEqual(18);
  expect(favoritesBox?.width).toBeGreaterThan(0);
  expect(horizontalOverflow).toBeLessThanOrEqual(0);
  await expect(page.getByText("56", { exact: true })).toBeVisible();
  await expect(page.getByText("Любим...", { exact: true })).toHaveCount(0);
});
