import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = "https://www.thecocktaildb.com/api/json/v1/1";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const REQUEST_DELAY_MS = 220;

const curatedCocktailNames = [
  "Alexander",
  "Americano",
  "Aviation",
  "B-52",
  "Bellini",
  "Bramble",
  "Brooklyn",
  "Caipirinha",
  "Casino",
  "Clover Club",
  "Corpse Reviver",
  "Cosmopolitan",
  "Cuba Libre",
  "Daiquiri",
  "Dark and Stormy",
  "Dirty Martini",
  "Dry Martini",
  "Espresso Martini",
  "French 75",
  "French Connection",
  "French Martini",
  "Gimlet",
  "Gin Fizz",
  "Gin Rickey",
  "Gin Tonic",
  "Godfather",
  "Greyhound",
  "Harvey Wallbanger",
  "Hemingway Special",
  "Irish Coffee",
  "Jack Rose Cocktail",
  "John Collins",
  "Kamikaze",
  "Kir",
  "Kir Royale",
  "The Last Word",
  "Lemon Drop",
  "Long Island Iced Tea",
  "Mai Tai",
  "Manhattan",
  "Margarita",
  "Martinez 2",
  "Mary Pickford",
  "Mimosa",
  "Mint Julep",
  "Mojito",
  "Moscow Mule",
  "Negroni",
  "New York Sour",
  "Old Cuban",
  "Old Fashioned",
  "Old Pal",
  "Paloma",
  "Pegu Club",
  "Penicillin",
  "Pina Colada",
  "Pink Gin",
  "Pisco Sour",
  "Planter's Punch",
  "Ramos Gin Fizz",
  "Rusty Nail",
  "Sazerac",
  "Sea breeze",
  "Sidecar",
  "Spritz",
  "Tequila Sunrise",
  "Tom Collins",
  "Vesper",
  "Whiskey Sour",
  "White Lady",
  "White Russian",
  "Zombie",
];

const cocktailNameTranslations = {
  Alexander: "Александр",
  Americano: "Американо",
  Aviation: "Авиация",
  "B-52": "Б-52",
  Bellini: "Беллини",
  Bramble: "Брамбл",
  Brooklyn: "Бруклин",
  Caipirinha: "Кайпиринья",
  Casino: "Казино",
  "Clover Club": "Кловер Клаб",
  "Corpse Reviver": "Корпс Ревайвер",
  Cosmopolitan: "Космополитен",
  "Cuba Libre": "Куба либре",
  Daiquiri: "Дайкири",
  "Dark and Stormy": "Дарк-н-сторми",
  "Dirty Martini": "Грязный мартини",
  "Dry Martini": "Сухой мартини",
  "Espresso Martini": "Эспрессо мартини",
  "French 75": "Френч 75",
  "French Connection": "Французская связь",
  "French Martini": "Французский мартини",
  Gimlet: "Гимлет",
  "Gin Fizz": "Джин физз",
  "Gin Rickey": "Джин рики",
  "Gin Tonic": "Джин-тоник",
  Godfather: "Крестный отец",
  Greyhound: "Грейхаунд",
  "Harvey Wallbanger": "Харви Воллбангер",
  "Hemingway Special": "Хемингуэй спешл",
  "Irish Coffee": "Айриш кофе",
  "Jack Rose Cocktail": "Джек Роуз",
  "John Collins": "Джон Коллинз",
  Kamikaze: "Камикадзе",
  Kir: "Кир",
  "Kir Royale": "Кир Рояль",
  "The Last Word": "Последнее слово",
  "Lemon Drop": "Лимон дроп",
  "Long Island Iced Tea": "Лонг-Айленд айс ти",
  "Mai Tai": "Май Тай",
  Manhattan: "Манхэттен",
  Margarita: "Маргарита",
  "Martinez 2": "Мартинез",
  "Mary Pickford": "Мэри Пикфорд",
  Mimosa: "Мимоза",
  "Mint Julep": "Мятный джулеп",
  Mojito: "Мохито",
  "Moscow Mule": "Московский мул",
  Negroni: "Негрони",
  "New York Sour": "Нью-Йорк сауэр",
  "Old Cuban": "Олд Кьюбан",
  "Old Fashioned": "Олд фэшнд",
  "Old Pal": "Олд Пал",
  Paloma: "Палома",
  "Pegu Club": "Пегу Клаб",
  Penicillin: "Пенициллин",
  "Pina Colada": "Пина колада",
  "Pink Gin": "Пинк джин",
  "Pisco Sour": "Писко сауэр",
  "Planter’s Punch": "Плантерс панч",
  "Ramos Gin Fizz": "Рамос джин физз",
  "Rusty Nail": "Ржавый гвоздь",
  Sazerac: "Сазерак",
  "Sea breeze": "Морской бриз",
  Sidecar: "Сайдкар",
  Spritz: "Спритц",
  "Tequila Sunrise": "Текила санрайз",
  "Tom Collins": "Том Коллинз",
  Vesper: "Веспер",
  "Whiskey Sour": "Виски сауэр",
  "White Lady": "Белая леди",
  "White Russian": "Белый русский",
  Zombie: "Зомби",
};

const glassNameMap = {
  "Balloon Glass": "Баллон",
  "Beer mug": "Пивная кружка",
  "Beer pilsner": "Пивной бокал",
  "Brandy snifter": "Снифтер",
  "Champagne flute": "Флюте",
  "Champagne-tulip": "Бокал тюльпан",
  "Cocktail Glass": "Коктейльный бокал",
  "Coffee mug": "Кружка",
  "Collins glass": "Коллинз",
  "Copper Mug": "Медная кружка",
  "Coupe Glass": "Купе",
  "Highball glass": "Хайбол",
  "Hurricane glass": "Харрикейн",
  "Irish coffee cup": "Бокал для айриш кофе",
  "Jar": "Банка",
  "Margarita glass": "Бокал маргарита",
  "Martini Glass": "Коктейльный бокал",
  "Mason jar": "Банка",
  "Nick and Nora Glass": "Nick & Nora",
  "Old-fashioned glass": "Рокс",
  "Parfait glass": "Парьфе",
  "Pint glass": "Пинта",
  "Pitcher": "Кувшин",
  "Pousse cafe glass": "Шот",
  "Punch bowl": "Панч-боул",
  "Shot glass": "Шот",
  "Whiskey sour glass": "Сауэр",
  "White wine glass": "Бокал для белого вина",
  "Wine Glass": "Винный бокал",
};

const normalizedGlassNameMap = new Map(
  Object.entries(glassNameMap).map(([key, value]) => [key.toLowerCase(), value]),
);

const ingredientIdOverrides = {
  "Angostura bitters": "angostura",
  "Black pepper": "black-pepper",
  "Bourbon": "bourbon",
  "Campari": "campari",
  "Carbonated water": "soda-water",
  "Champagne": "champagne",
  "Coffee liqueur": "coffee-liqueur",
  "Cointreau": "cointreau",
  "Coca-Cola": "cola",
  "Coffee": "coffee",
  "Cognac": "cognac",
  "Cranberry juice": "cranberry-juice",
  "Dark rum": "dark-rum",
  "Dry Vermouth": "dry-vermouth",
  "Egg White": "egg-white",
  "Espresso": "espresso",
  "Gin": "gin",
  "Ginger beer": "ginger-beer",
  "Ginger ale": "ginger-ale",
  "Grapefruit juice": "grapefruit-juice",
  "Grenadine": "grenadine",
  "Heavy cream": "heavy-cream",
  "Honey syrup": "honey-syrup",
  "Ice": "ice",
  "Irish cream": "irish-cream",
  "Lemon": "lemon",
  "Lemon juice": "lemon-juice",
  "Light rum": "white-rum",
  "Lime": "lime",
  "Lime juice": "lime-juice",
  "Maraschino cherry": "maraschino-cherry",
  "Maraschino liqueur": "maraschino-liqueur",
  "Orange bitters": "orange-bitters",
  "Orange juice": "orange-juice",
  "Orange peel": "orange-peel",
  "Pineapple juice": "pineapple-juice",
  "Prosecco": "prosecco",
  "Scotch": "scotch",
  "Simple syrup": "simple-syrup",
  "Soda water": "soda-water",
  "Sweet Vermouth": "sweet-vermouth",
  "Tabasco sauce": "tabasco",
  "Tequila": "tequila",
  "Tonic water": "tonic",
  "Triple sec": "triple-sec",
  "Vodka": "vodka",
  "Whiskey": "whiskey",
  "White Crème de Menthe": "white-creme-de-menthe",
  "White rum": "white-rum",
};

const normalizedIngredientIdOverrides = new Map(
  Object.entries(ingredientIdOverrides).map(([key, value]) => [key.toLowerCase(), value]),
);

const ingredientNameOverrides = {
  "Angostura bitters": "Angostura bitters",
  "Coca-Cola": "Cola",
  "Dry Vermouth": "Dry vermouth",
  "Light rum": "White rum",
  "Sweet Vermouth": "Sweet vermouth",
  "Tonic water": "Tonic water",
  "White rum": "White rum",
};

const normalizedIngredientNameOverrides = new Map(
  Object.entries(ingredientNameOverrides).map(([key, value]) => [key.toLowerCase(), value]),
);

const ingredientNameTranslations = {
  "151 proof rum": "Ром 151",
  Absinthe: "Абсент",
  Amaretto: "Амаретто",
  "Angostura bitters": "Ангостура",
  "Apple brandy": "Яблочный бренди",
  "Baileys irish cream": "Baileys",
  Bitters: "Биттер",
  "Blended Scotch": "Купажированный скотч",
  "Blended whiskey": "Купажированный виски",
  Bourbon: "Бурбон",
  Cachaca: "Кашаса",
  Campari: "Кампари",
  "Carbonated water": "Газированная вода",
  Champagne: "Шампанское",
  Cherry: "Вишня",
  "Club soda": "Содовая",
  "Coconut milk": "Кокосовое молоко",
  Coffee: "Кофе",
  "Coffee liqueur": "Кофейный ликер",
  Cognac: "Коньяк",
  Cointreau: "Куантро",
  Cola: "Кола",
  Cream: "Сливки",
  "Creme de Cacao": "Крем де какао",
  "Creme de Cassis": "Крем де кассис",
  "Creme de Mure": "Крем де мюр",
  "Dark rum": "Темный ром",
  Drambuie: "Драмбуи",
  "Dry Vermouth": "Сухой вермут",
  "Egg White": "Яичный белок",
  "Egg yolk": "Яичный желток",
  Espresso: "Эспрессо",
  Galliano: "Гальяно",
  Gin: "Джин",
  Ginger: "Имбирь",
  "Ginger ale": "Имбирный эль",
  "Ginger beer": "Имбирное пиво",
  "Grapefruit juice": "Грейпфрутовый сок",
  Grenadine: "Гренадин",
  "Heavy cream": "Жирные сливки",
  "Honey syrup": "Медовый сироп",
  Ice: "Лед",
  "Irish cream": "Айриш крим",
  Kahlua: "Калуа",
  Lemon: "Лимон",
  "Lemon juice": "Лимонный сок",
  Lime: "Лайм",
  "Lime juice": "Сок лайма",
  "Maraschino liqueur": "Мараскино",
  Milk: "Молоко",
  Mint: "Мята",
  Nutmeg: "Мускатный орех",
  "Olive Brine": "Оливковый рассол",
  Olive: "Оливка",
  "Orange bitters": "Апельсиновый биттер",
  "Orange juice": "Апельсиновый сок",
  "Orange peel": "Апельсиновая цедра",
  Peach: "Персик",
  "Peach puree": "Персиковое пюре",
  "Peach schnapps": "Персиковый шнапс",
  Peychaud: "Пишо",
  "Pineapple juice": "Ананасовый сок",
  Pisco: "Писко",
  Prosecco: "Просекко",
  "Raspberry syrup": "Малиновый сироп",
  Rum: "Ром",
  "Rye Whiskey": "Ржаной виски",
  Scotch: "Скотч",
  "Simple syrup": "Сахарный сироп",
  "Soda water": "Газированная вода",
  Sugar: "Сахар",
  "Sugar syrup": "Сахарный сироп",
  "Sweet Vermouth": "Сладкий вермут",
  Tabasco: "Табаско",
  Tequila: "Текила",
  "Tonic water": "Тоник",
  "Triple sec": "Трипл-сек",
  Vodka: "Водка",
  Whiskey: "Виски",
  Whisky: "Виски",
  "White Creme de Menthe": "Белый крем де мент",
  "White rum": "Белый ром",
};

const normalizedIngredientNameTranslations = new Map(
  Object.entries(ingredientNameTranslations).map(([key, value]) => [key.toLowerCase(), value]),
);

const instructionReplacements = [
  ["add all ingredients into cocktail shaker filled with ice", "Добавь все ингредиенты в шейкер со льдом"],
  ["shake all ingredients with ice and strain contents into a cocktail glass", "Встряхни все ингредиенты со льдом и процеди в коктейльный бокал"],
  ["shake all ingredients with ice", "Встряхни все ингредиенты со льдом"],
  ["shake well and strain into cocktail glass", "Хорошо встряхни и процеди в коктейльный бокал"],
  ["shake ingredients with ice", "Встряхни ингредиенты со льдом"],
  ["shake ingredients in a cocktail shaker with ice", "Встряхни ингредиенты в шейкере со льдом"],
  ["shake ingredients with cracked ice", "Встряхни ингредиенты с колотым льдом"],
  ["shake ingredients", "Встряхни ингредиенты"],
  ["shake well", "Хорошо встряхни"],
  ["shake", "Встряхни"],
  ["strain into a chilled cocktail glass", "Процеди в охлажденный коктейльный бокал"],
  ["strain into chilled cocktail glass", "Процеди в охлажденный коктейльный бокал"],
  ["strain into cocktail glass", "Процеди в коктейльный бокал"],
  ["strain into glass", "Процеди в бокал"],
  ["strain into", "Процеди в"],
  ["strain", "Процеди"],
  ["pour all ingredients into a collins glass filled with ice", "Налей все ингредиенты в бокал коллинз, наполненный льдом"],
  ["pour all ingredients except the champagne into a cocktail shaker filled with ice", "Налей все ингредиенты, кроме шампанского, в шейкер со льдом"],
  ["pour all ingredients except", "Налей все ингредиенты, кроме"],
  ["pour all ingredients", "Налей все ингредиенты"],
  ["pour the", "Налей"],
  ["pour into", "Налей в"],
  ["pour over ice into glass", "Налей в бокал со льдом"],
  ["pour ingredients into a chilled old fashioned glass", "Налей ингредиенты в охлажденный рокс"],
  ["pour ingredients", "Налей ингредиенты"],
  ["stir gently", "Аккуратно перемешай"],
  ["stir until well-chilled", "Перемешай до охлаждения"],
  ["stir and serve", "Перемешай и подавай"],
  ["stir", "Перемешай"],
  ["fill glass with crushed ice", "Наполни бокал колотым льдом"],
  ["fill a collins glass with ice", "Наполни бокал коллинз льдом"],
  ["fill a shaker with ice cubes", "Наполни шейкер льдом"],
  ["fill with ice and shake", "Добавь лед и встряхни"],
  ["fill with ice", "Наполни льдом"],
  ["fill the glass with ice", "Наполни бокал льдом"],
  ["fill glass with ice", "Наполни бокал льдом"],
  ["top up with", "Долей"],
  ["top with", "Долей"],
  ["build gin, lemon juice and simple syrup over", "Собери джин, лимонный сок и сироп поверх льда"],
  ["build over ice", "Собери поверх льда"],
  ["garnish with", "Укрась"],
  ["garnish", "Укрась"],
  ["serve with a stirrer", "Подавай с палочкой для размешивания"],
  ["serve in", "Подавай в"],
  ["serve", "Подавай"],
  ["combine ingredients with ice", "Смешай ингредиенты со льдом"],
  ["combine", "Смешай"],
  ["muddle", "Слегка разомни"],
  ["rim the glass with salt", "Сделай соленый край бокала"],
  ["layer ingredients into a shot glass", "Выложи ингредиенты слоями в шот"],
  ["layer the ingredients", "Выложи ингредиенты слоями"],
  ["float", "Аккуратно добавь сверху"],
  ["fine strain", "Тонко процеди"],
  ["then", "затем"],
  ["ice cubes", "кубики льда"],
  ["cocktail shaker", "шейкер"],
  ["cocktail glass", "коктейльный бокал"],
  ["highball glass", "хайбол"],
  ["old-fashioned glass", "рокс"],
  ["collins glass", "бокал коллинз"],
  ["champagne flute", "флюте"],
  ["splash of soda water", "немного содовой"],
  ["half orange slice", "половину дольки апельсина"],
  ["orange slice", "дольку апельсина"],
  ["lemon slice", "дольку лимона"],
  ["lime wedge", "дольку лайма"],
  ["with ice", "со льдом"],
];

const spiritKeywords = [
  "gin",
  "vodka",
  "rum",
  "tequila",
  "mezcal",
  "whiskey",
  "whisky",
  "bourbon",
  "brandy",
  "cognac",
  "scotch",
  "rye",
  "pisco",
  "cachaca",
  "grappa",
  "absinthe",
];

const liqueurKeywords = [
  "vermouth",
  "liqueur",
  "aperol",
  "campari",
  "amaro",
  "chartreuse",
  "schnapps",
  "curacao",
  "cointreau",
  "triple sec",
  "creme de",
  "crème de",
  "irish cream",
  "amaretto",
  "sambuca",
  "baileys",
  "kahlua",
  "falernum",
  "bitters",
  "maraschino",
];

const mixerKeywords = [
  "juice",
  "soda",
  "tonic",
  "cola",
  "beer",
  "ale",
  "champagne",
  "prosecco",
  "wine",
  "coffee",
  "milk",
  "cream",
  "cider",
  "water",
  "tea",
];

const citrusKeywords = ["lemon", "lime", "orange", "grapefruit", "yuzu"];
const sweetenerKeywords = ["syrup", "sugar", "honey", "grenadine", "agave", "maple"];
const bitterKeywords = ["campari", "aperol", "vermouth", "amaro", "bitters", "gentian"];
const refreshingKeywords = [
  "juice",
  "mint",
  "soda",
  "tonic",
  "beer",
  "ale",
  "prosecco",
  "champagne",
  "cucumber",
  "pineapple",
  "cranberry",
  "grapefruit",
];
const sweetKeywords = [
  "syrup",
  "grenadine",
  "liqueur",
  "cola",
  "juice",
  "cream",
  "honey",
  "sugar",
];
const sourKeywords = ["lemon", "lime", "grapefruit", "sour mix"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();

  try {
    const parsed = JSON.parse(text);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return parsed;
  } catch (error) {
    throw new Error(`Could not parse response from ${url}: ${text}`);
  }
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

function toTitleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getIngredientId(name) {
  return normalizedIngredientIdOverrides.get(name.toLowerCase()) ?? slugify(name);
}

function getIngredientLabel(name) {
  return normalizedIngredientNameOverrides.get(name.toLowerCase()) ?? name.trim();
}

function translateIngredientName(name) {
  return normalizedIngredientNameTranslations.get(name.toLowerCase()) ?? name;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasKeyword(value, keywords) {
  const normalized = value.toLowerCase();

  return keywords.some((keyword) => {
    const keywordPattern = escapeRegex(keyword.toLowerCase()).replace(/\\ /g, "\\s+");
    return new RegExp(`(^|[^a-z])${keywordPattern}([^a-z]|$)`).test(normalized);
  });
}

function classifyIngredient(name) {
  const normalized = name.toLowerCase();

  if (hasKeyword(normalized, sweetenerKeywords)) {
    return "sweetener";
  }

  if (
    hasKeyword(normalized, citrusKeywords) &&
    (normalized.includes("juice") || ["lemon", "lime", "orange", "grapefruit"].includes(normalized))
  ) {
    return "citrus";
  }

  if (hasKeyword(normalized, spiritKeywords)) {
    return "spirit";
  }

  if (hasKeyword(normalized, liqueurKeywords)) {
    return "liqueur";
  }

  if (hasKeyword(normalized, mixerKeywords)) {
    return "mixer";
  }

  return "other";
}

function getSourceIngredientName(ingredient) {
  return ingredient.sourceName ?? ingredient.name;
}

function inferBaseSpirit(ingredients) {
  const spirit = ingredients.find(
    (ingredient) => classifyIngredient(getSourceIngredientName(ingredient)) === "spirit",
  );
  const liqueur = ingredients.find(
    (ingredient) => classifyIngredient(getSourceIngredientName(ingredient)) === "liqueur",
  );
  return spirit?.name ?? liqueur?.name ?? ingredients[0]?.name ?? "Unknown";
}

function inferTasteTags(ingredients) {
  const normalized = ingredients.map((ingredient) => getSourceIngredientName(ingredient).toLowerCase());
  const tags = new Set();

  if (normalized.some((value) => refreshingKeywords.some((keyword) => value.includes(keyword)))) {
    tags.add("refreshing");
  }

  if (normalized.some((value) => sweetKeywords.some((keyword) => value.includes(keyword)))) {
    tags.add("sweet");
  }

  if (normalized.some((value) => sourKeywords.some((keyword) => value.includes(keyword)))) {
    tags.add("sour");
  }

  if (normalized.some((value) => bitterKeywords.some((keyword) => value.includes(keyword)))) {
    tags.add("bitter");
  }

  const spiritCount = ingredients.filter((ingredient) => {
    const category = classifyIngredient(getSourceIngredientName(ingredient));
    return category === "spirit" || category === "liqueur";
  }).length;
  const mixerCount = ingredients.filter((ingredient) => {
    const category = classifyIngredient(getSourceIngredientName(ingredient));
    return category === "mixer" || category === "citrus" || category === "sweetener";
  }).length;

  if (spiritCount >= 2 && mixerCount <= 2) {
    tags.add("strong");
  }

  if (tags.size === 0) {
    tags.add("refreshing");
  }

  return Array.from(tags);
}

function inferStrength(ingredients, glassName) {
  const spiritCount = ingredients.filter((ingredient) => {
    const category = classifyIngredient(getSourceIngredientName(ingredient));
    return category === "spirit" || category === "liqueur";
  }).length;
  const mixerCount = ingredients.filter((ingredient) => {
    const category = classifyIngredient(getSourceIngredientName(ingredient));
    return category === "mixer" || category === "citrus" || category === "sweetener";
  }).length;

  if (
    spiritCount >= 3 ||
    (spiritCount >= 2 && mixerCount <= 1) ||
    /shot|nick & nora|cocktail|martini|rocks|old-fashioned/i.test(glassName)
  ) {
    return "strong";
  }

  if (mixerCount >= 2 || /highball|collins|flute|wine/i.test(glassName)) {
    return "light";
  }

  return "medium";
}

function normalizeGlassName(glassName) {
  return normalizedGlassNameMap.get(glassName.toLowerCase()) ?? glassName;
}

function translateCocktailName(name) {
  return cocktailNameTranslations[name] ?? name;
}

function localizeInstruction(step) {
  let translated = step.trim();

  for (const [source, target] of instructionReplacements) {
    translated = translated.replace(new RegExp(source, "gi"), target);
  }

  for (const [source, target] of normalizedIngredientNameTranslations.entries()) {
    translated = translated.replace(new RegExp(source, "gi"), target);
  }

  translated = translated
    .replace(/\band\b/gi, "и")
    .replace(/\binto\b/gi, "в")
    .replace(/\bfilled with\b/gi, "наполненный")
    .replace(/\bglass\b/gi, "бокал")
    .replace(/\btop\b/gi, "верх")
    .replace(/\bon top\b/gi, "сверху")
    .replace(/\busing\b/gi, "используя")
    .replace(/\ba\b/gi, "a")
    .replace(/\bof\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function splitInstructions(value) {
  const cleaned = value
    .replace(/\r/g, "\n")
    .split("\n")
    .flatMap((part) => part.split(/(?<=[.!?])\s+/))
    .map((part) => part.trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : [value.trim()];
}

function extractRecipeIngredients(drink) {
  const recipeIngredients = [];

  for (let index = 1; index <= 15; index += 1) {
    const rawIngredient = drink[`strIngredient${index}`]?.trim();

    if (!rawIngredient) {
      continue;
    }

    recipeIngredients.push({
      id: getIngredientId(rawIngredient),
      name: translateIngredientName(getIngredientLabel(rawIngredient)),
      sourceName: getIngredientLabel(rawIngredient),
      amount: drink[`strMeasure${index}`]?.trim() || "по вкусу",
    });
  }

  return recipeIngredients;
}

function toTsModule(header, exportName, typeName, value) {
  return `${header}\n\nexport const ${exportName}: ${typeName} = ${JSON.stringify(value, null, 2)};\n`;
}

async function loadCatalog() {
  const catalog = [];

  for (const letter of LETTERS) {
    const data = await fetchJson(`${API_BASE}/search.php?f=${letter}`);

    for (const drink of data.drinks ?? []) {
      catalog.push({
        id: drink.idDrink,
        name: drink.strDrink,
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return catalog;
}

async function loadDrinkById(id) {
  const data = await fetchJson(`${API_BASE}/lookup.php?i=${id}`);
  await sleep(REQUEST_DELAY_MS);
  return data.drinks?.[0] ?? null;
}

async function main() {
  const catalog = await loadCatalog();
  const catalogByNormalizedName = new Map(
    catalog.map((drink) => [normalizeName(drink.name), drink]),
  );

  const unresolved = [];
  const selectedCatalogItems = [];

  for (const cocktailName of curatedCocktailNames) {
    const match = catalogByNormalizedName.get(normalizeName(cocktailName));

    if (!match) {
      unresolved.push(cocktailName);
      continue;
    }

    selectedCatalogItems.push(match);
  }

  if (unresolved.length > 0) {
    throw new Error(`Could not resolve cocktails: ${unresolved.join(", ")}`);
  }

  const drinks = [];

  for (const item of selectedCatalogItems) {
    const drink = await loadDrinkById(item.id);

    if (!drink) {
      throw new Error(`Could not load details for cocktail id ${item.id}`);
    }

    drinks.push(drink);
  }

  const ingredientMap = new Map();
  const cocktailRecords = [];
  const cocktailIngredientLinks = [];

  for (const drink of drinks) {
    const recipeIngredients = extractRecipeIngredients(drink);
    const glassName = normalizeGlassName(drink.strGlass?.trim() || "Cocktail glass");
    const cocktailId = slugify(drink.strDrink);
    const taste = inferTasteTags(recipeIngredients);

    cocktailRecords.push({
      id: cocktailId,
      name: translateCocktailName(drink.strDrink.trim()),
      baseSpirit: translateIngredientName(inferBaseSpirit(recipeIngredients)),
      taste,
      strength: inferStrength(recipeIngredients, glassName),
      glassName,
      steps: splitInstructions(drink.strInstructions || "").map(localizeInstruction),
    });

    recipeIngredients.forEach((ingredient, sortOrder) => {
      if (!ingredientMap.has(ingredient.id)) {
        ingredientMap.set(ingredient.id, {
          id: ingredient.id,
          name: ingredient.name,
          category: classifyIngredient(ingredient.sourceName),
        });
      }

      cocktailIngredientLinks.push({
        cocktailId,
        ingredientId: ingredient.id,
        sortOrder,
        amount: ingredient.amount,
      });
    });
  }

  const ingredients = Array.from(ingredientMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  const starterIngredients = [
    "vodka",
    "gin",
    "white-rum",
    "tequila",
    "whiskey",
    "bourbon",
    "campari",
    "triple-sec",
    "sweet-vermouth",
    "tonic",
    "cola",
    "soda-water",
    "ginger-beer",
    "orange-juice",
    "cranberry-juice",
    "lime-juice",
    "lemon-juice",
    "simple-syrup",
    "angostura",
    "ice",
  ].filter((ingredientId) => ingredientMap.has(ingredientId));

  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  const dataDir = path.join(rootDir, "..", "src", "data");

  await mkdir(dataDir, { recursive: true });

  const generatedHeader = "// This file is generated by scripts/import-cocktails.mjs. Do not edit by hand.";

  await writeFile(
    path.join(dataDir, "ingredients.ts"),
    `import { Ingredient } from "./types";\n\n${toTsModule(generatedHeader, "ingredients", "Ingredient[]", ingredients)}`,
    "utf8",
  );

  await writeFile(
    path.join(dataDir, "cocktailRecords.ts"),
    `import { CocktailRecord } from "./types";\n\n${toTsModule(generatedHeader, "cocktailRecords", "CocktailRecord[]", cocktailRecords)}`,
    "utf8",
  );

  await writeFile(
    path.join(dataDir, "cocktailIngredients.ts"),
    `import { CocktailIngredientLink } from "./types";\n\n${toTsModule(generatedHeader, "cocktailIngredientLinks", "CocktailIngredientLink[]", cocktailIngredientLinks)}`,
    "utf8",
  );

  await writeFile(
    path.join(dataDir, "starterIngredients.ts"),
    `${generatedHeader}\n\nexport const starterIngredients = ${JSON.stringify(starterIngredients, null, 2)};\n`,
    "utf8",
  );

  console.log(`Imported ${cocktailRecords.length} cocktails and ${ingredients.length} ingredients.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
